import { LlmConfigError, type LlmProvider, type LlmRequest, type LlmUsage, type Tier } from './types';

/**
 * Adapter para qualquer endpoint OpenAI-compativel (`POST {base}/chat/completions`).
 *
 * E' o provider "opencode": atende OpenCode Zen, Vercel AI Gateway, OpenRouter,
 * Ollama, LM Studio e qualquer outro compativel. Trocar de backend e' mexer em
 * variavel de ambiente, sem deploy.
 *
 * Aqui os dois blocos de system viram UMA mensagem role:'system' concatenada —
 * o protocolo nao tem cache_control, entao nao ha' o que separar.
 */
export class OpenAICompatProvider implements LlmProvider {
  readonly name = 'opencode';
  private base: string;
  private apiKey: string;
  private fast: string;
  private quality: string;

  constructor() {
    const base = process.env.OPENCODE_BASE_URL;
    if (!base) {
      throw new LlmConfigError(
        'OPENCODE_BASE_URL nao definida (ex.: https://opencode.ai/zen/v1). ' +
          'Defina-a, ou use LLM_PROVIDER=claude.',
      );
    }
    this.base = base.replace(/\/+$/, '');
    this.apiKey = process.env.OPENCODE_API_KEY || '';
    const fast = process.env.OPENCODE_MODEL_FAST;
    const quality = process.env.OPENCODE_MODEL_QUALITY;
    if (!fast && !quality) {
      throw new LlmConfigError('defina OPENCODE_MODEL_FAST e/ou OPENCODE_MODEL_QUALITY.');
    }
    this.fast = fast || quality!;
    this.quality = quality || fast!;
  }

  modelFor(tier: Tier): string {
    return tier === 'quality' ? this.quality : this.fast;
  }

  private async post(req: LlmRequest, stream: boolean, signal?: AbortSignal) {
    const res = await fetch(`${this.base}/chat/completions`, {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.modelFor(req.tier),
        max_tokens: req.maxTokens,
        stream,
        messages: [
          { role: 'system', content: [req.stable, req.volatile].filter(Boolean).join('\n\n') },
          { role: 'user', content: req.user },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`${this.name} ${res.status}: ${body.slice(0, 300)}`);
    }
    return res;
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
    return j?.choices?.[0]?.message?.content ?? '';
  }
}
