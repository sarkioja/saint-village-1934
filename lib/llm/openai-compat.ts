import { LlmConfigError, type LlmProvider, type LlmRequest, type LlmUsage, type Tier } from './types';

/**
 * Adapter para endpoints OpenAI-compativeis (`POST {base}/chat/completions`).
 *
 * Um unico adapter atende quatro provedores, que diferem so' em base URL, nome
 * da variavel de chave, modelos padrao e cabecalhos extras:
 *
 *   openai     api.openai.com
 *   openrouter openrouter.ai  (centenas de modelos, inclusive Claude)
 *   opencode   OpenCode Zen, ou qualquer outro compativel (base URL obrigatoria)
 *
 * Trocar de provedor e' mexer em variavel de ambiente, sem deploy.
 *
 * Nos dois blocos de system o protocolo nao tem cache_control, entao eles sao
 * concatenados numa unica mensagem role:'system'. O desconto de cache de prompt
 * existe so' no adapter nativo da Anthropic (lib/llm/claude.ts).
 */

export type CompatId = 'openai' | 'openrouter' | 'opencode';

type Preset = {
  /** Base URL padrao; quando null, a env e' obrigatoria. */
  baseUrl: string | null;
  /** Prefixo das variaveis de ambiente deste provedor. */
  envPrefix: string;
  fast: string | null;
  quality: string | null;
  /** Exemplo mostrado na mensagem de erro de configuracao. */
  hint: string;
};

const PRESETS: Record<CompatId, Preset> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    envPrefix: 'OPENAI',
    fast: 'gpt-4o-mini',
    quality: 'gpt-4o',
    hint: 'OPENAI_API_KEY',
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    envPrefix: 'OPENROUTER',
    // No OpenRouter o modelo vem com o provedor no nome.
    // Os dois tiers usam o mesmo modelo por escolha do dono do projeto: o
    // seletor "rapido / apurado" do perfil continua existindo, mas hoje leva
    // ao mesmo lugar. Para diferenciar de novo, basta definir
    // OPENROUTER_MODEL_QUALITY — as env tem precedencia sobre estes padroes.
    fast: 'deepseek/deepseek-v4.1-flash-1017',
    quality: 'deepseek/deepseek-v4.1-flash-1017',
    hint: 'OPENROUTER_API_KEY',
  },
  opencode: {
    baseUrl: null, // generico: precisa de base URL explicita
    envPrefix: 'OPENCODE',
    fast: null,
    quality: null,
    hint: 'OPENCODE_BASE_URL (ex.: https://opencode.ai/zen/v1) e OPENCODE_MODEL_FAST',
  },
};

export class OpenAICompatProvider implements LlmProvider {
  readonly name: CompatId;
  private base: string;
  private apiKey: string;
  private fast: string;
  private quality: string;
  private extraHeaders: Record<string, string> = {};

  constructor(id: CompatId) {
    this.name = id;
    const p = PRESETS[id];
    const env = (suffix: string) => process.env[`${p.envPrefix}_${suffix}`];

    const base = env('BASE_URL') || p.baseUrl;
    if (!base) {
      throw new LlmConfigError(
        `${p.envPrefix}_BASE_URL nao definida. Defina ${p.hint}, ou escolha outro LLM_PROVIDER.`,
      );
    }
    this.base = base.replace(/\/+$/, '');

    this.apiKey = env('API_KEY') || '';
    // Endpoints locais (Ollama, LM Studio) costumam nao pedir chave.
    const local = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(this.base);
    if (!this.apiKey && !local) {
      throw new LlmConfigError(`${p.envPrefix}_API_KEY nao definida.`);
    }

    const fast = env('MODEL_FAST') || p.fast;
    const quality = env('MODEL_QUALITY') || p.quality;
    if (!fast && !quality) {
      throw new LlmConfigError(
        `defina ${p.envPrefix}_MODEL_FAST e/ou ${p.envPrefix}_MODEL_QUALITY.`,
      );
    }
    this.fast = (fast || quality)!;
    this.quality = (quality || fast)!;

    // O OpenRouter usa estes cabecalhos para atribuicao e ranking; sao opcionais
    // mas recomendados por eles, e aparecem no painel da sua conta.
    if (id === 'openrouter') {
      const site = process.env.OPENROUTER_SITE_URL;
      const title = process.env.OPENROUTER_APP_NAME || 'Saint Village XX Century';
      if (site) this.extraHeaders['HTTP-Referer'] = site;
      this.extraHeaders['X-Title'] = title;
    }
  }

  modelFor(tier: Tier): string {
    return tier === 'quality' ? this.quality : this.fast;
  }

  /**
   * Alguns modelos de raciocinio da OpenAI rejeitam `max_tokens` e exigem
   * `max_completion_tokens`. Mandamos o primeiro e, num 400 que reclame disso,
   * repetimos com o segundo — em vez de perder o turno do jogador.
   */
  private payload(req: LlmRequest, stream: boolean, useCompletionTokens: boolean) {
    const limit = useCompletionTokens
      ? { max_completion_tokens: req.maxTokens }
      : { max_tokens: req.maxTokens };
    return {
      model: this.modelFor(req.tier),
      stream,
      ...limit,
      messages: [
        { role: 'system', content: [req.stable, req.volatile].filter(Boolean).join('\n\n') },
        { role: 'user', content: req.user },
      ],
    };
  }

  private async post(req: LlmRequest, stream: boolean, signal?: AbortSignal): Promise<Response> {
    let lastErr = '';
    for (const useCompletionTokens of [false, true]) {
      const res = await fetch(`${this.base}/chat/completions`, {
        method: 'POST',
        signal,
        headers: {
          'content-type': 'application/json',
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
          ...this.extraHeaders,
        },
        body: JSON.stringify(this.payload(req, stream, useCompletionTokens)),
      });
      if (res.ok) return res;

      const body = await res.text().catch(() => '');
      lastErr = `${res.status}: ${body.slice(0, 300)}`;
      const pedeOutroCampo =
        res.status === 400 && /max_completion_tokens|max_tokens.*not supported/i.test(body);
      if (!useCompletionTokens && pedeOutroCampo) continue;
      break;
    }
    throw new Error(`${this.name} ${lastErr}`);
  }

  async *stream(req: LlmRequest, signal?: AbortSignal): AsyncGenerator<string, LlmUsage | void> {
    const res = await this.post(req, true, signal);
    if (!res.body) throw new Error('resposta sem corpo');

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let usage: LlmUsage | undefined;

    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        let j: any;
        try {
          j = JSON.parse(payload);
        } catch {
          continue;
        }
        // O OpenRouter pode mandar um objeto de erro no meio do stream.
        if (j?.error) throw new Error(`${this.name}: ${j.error.message || 'erro no stream'}`);
        const piece = j?.choices?.[0]?.delta?.content;
        if (typeof piece === 'string' && piece) yield piece;
        if (j?.usage) {
          usage = {
            inputTokens: j.usage.prompt_tokens,
            outputTokens: j.usage.completion_tokens,
          };
        }
      }
    }
    return usage;
  }

  async complete(req: LlmRequest, signal?: AbortSignal): Promise<string> {
    const res = await this.post(req, false, signal);
    const j: any = await res.json();
    if (j?.error) throw new Error(`${this.name}: ${j.error.message || 'erro'}`);
    return j?.choices?.[0]?.message?.content ?? '';
  }

  /**
   * Chamada crua, para diagnóstico. Devolve o formato da resposta em vez do
   * texto, para investigar quando um modelo responde vazio sem dar erro —
   * caso típico de modelo de raciocínio, que coloca a saída noutro campo ou
   * gasta todo o orçamento de tokens pensando.
   */
  async debugComplete(req: LlmRequest, signal?: AbortSignal): Promise<Record<string, unknown>> {
    const res = await this.post(req, false, signal);
    const j: any = await res.json();
    const msg = j?.choices?.[0]?.message ?? {};
    return {
      modelo: j?.model ?? this.modelFor(req.tier),
      finishReason: j?.choices?.[0]?.finish_reason ?? null,
      camposDaMensagem: Object.keys(msg),
      tamanhoContent: typeof msg.content === 'string' ? msg.content.length : null,
      amostraContent: typeof msg.content === 'string' ? msg.content.slice(0, 120) : null,
      // Modelos de raciocínio costumam usar um destes:
      temReasoning: typeof msg.reasoning === 'string' && msg.reasoning.length > 0,
      temReasoningContent:
        typeof msg.reasoning_content === 'string' && msg.reasoning_content.length > 0,
      amostraReasoning: String(msg.reasoning ?? msg.reasoning_content ?? '').slice(0, 160),
      usage: j?.usage ?? null,
    };
  }
}
