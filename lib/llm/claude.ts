import Anthropic from '@anthropic-ai/sdk';
import { LlmConfigError, type LlmProvider, type LlmRequest, type LlmUsage, type Tier } from './types';

/**
 * Adapter da Anthropic Messages API.
 *
 * Duas coisas aqui existem para economizar dinheiro, porque a chave e' do usuario:
 *
 * 1. PROMPT CACHING. O prompt de sistema vai como dois blocos: o prefixo estavel
 *    (~7.100 tokens) com cache_control, e o sufixo volatil sem. Leitura de cache
 *    custa ~10% da entrada normal, entao a entrada efetiva por turno cai de
 *    ~9.500 para ~3.100 tokens. A TTL padrao de 5 min casa com o ritmo de jogo.
 *
 * 2. THINKING DESLIGADO. Isto e' geracao de prosa criativa, nao raciocinio: o
 *    pensamento estendido seria gasto sem retorno. A forma de desligar mudou por
 *    modelo (ver THINKING_OFF abaixo), e ha' um retry defensivo se o modelo
 *    configurado nao aceitar a forma que escolhemos.
 */

const DEFAULT_FAST = 'claude-haiku-5-5';
const DEFAULT_QUALITY = 'claude-sonnet-5-5';

/**
 * Como desligar o pensamento, por familia de modelo. A API divergiu:
 *   - Haiku 5.5  aceita {type:'disabled'} com effort <= high
 *   - Sonnet 5.5 rejeita 'disabled' com 400; a forma de desligar e' 'between_tools'
 *     (que, sem nenhuma tool declarada, significa nao pensar), e nao aceita
 *     nenhum outro campo junto
 *   - Opus 5.5 nao permite desligar de jeito nenhum: so' baixar o effort
 * Modelo nao mapeado: manda sem o parametro e deixa o default do modelo valer.
 */
function thinkingOff(model: string): Record<string, unknown> | null {
  if (/haiku-5-5|opus-5(?!\.)|haiku-4-5|sonnet-5(?!-5)/.test(model)) {
    return { thinking: { type: 'disabled' } };
  }
  if (/sonnet-5-5/.test(model)) {
    return { thinking: { type: 'between_tools' } };
  }
  if (/opus-5-5|fable-5|mythos-5/.test(model)) {
    // Nao da' para desligar; o mais barato e' o menor effort.
    return { output_config: { effort: 'low' } };
  }
  return null;
}

export class ClaudeProvider implements LlmProvider {
  readonly name = 'claude';
  private client: Anthropic;
  private fast: string;
  private quality: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new LlmConfigError(
        'ANTHROPIC_API_KEY nao definida. Defina-a, ou use LLM_PROVIDER=opencode.',
      );
    }
    this.client = new Anthropic({ apiKey });
    this.fast = process.env.CLAUDE_MODEL_FAST || DEFAULT_FAST;
    this.quality = process.env.CLAUDE_MODEL_QUALITY || DEFAULT_QUALITY;
  }

  modelFor(tier: Tier): string {
    return tier === 'quality' ? this.quality : this.fast;
  }

  /** Monta o corpo com o system em dois blocos e o cache_control no estavel. */
  private body(req: LlmRequest, withThinking: boolean) {
    const model = this.modelFor(req.tier);
    const system: Anthropic.TextBlockParam[] = [
      {
        type: 'text',
        text: req.stable,
        // O prefixo estavel e' identico entre turnos: aqui esta' a economia.
        cache_control: { type: 'ephemeral' },
      },
    ];
    if (req.volatile) system.push({ type: 'text', text: req.volatile });

    return {
      model,
      max_tokens: req.maxTokens,
      system,
      messages: [{ role: 'user' as const, content: req.user }],
      ...(withThinking ? (thinkingOff(model) ?? {}) : {}),
    };
  }

  /** Um 400 que reclame de thinking/effort: refaz sem esses campos. */
  private isThinkingRejection(err: unknown): boolean {
    if (!(err instanceof Anthropic.APIError) || err.status !== 400) return false;
    return /thinking|effort|output_config/i.test(err.message || '');
  }

  async *stream(req: LlmRequest, signal?: AbortSignal): AsyncGenerator<string, LlmUsage | void> {
    for (const withThinking of [true, false]) {
      try {
        const s = this.client.messages.stream(this.body(req, withThinking) as any, { signal });
        for await (const ev of s) {
          if (
            ev.type === 'content_block_delta' &&
            ev.delta.type === 'text_delta' &&
            ev.delta.text
          ) {
            yield ev.delta.text;
          }
        }
        const final = await s.finalMessage();
        return {
          inputTokens: final.usage.input_tokens,
          outputTokens: final.usage.output_tokens,
          cacheReadTokens: final.usage.cache_read_input_tokens ?? undefined,
          cacheWriteTokens: final.usage.cache_creation_input_tokens ?? undefined,
        };
      } catch (err) {
        // Se o modelo configurado recusou a forma de desligar o pensamento,
        // tenta uma vez sem ela em vez de falhar o turno do jogador.
        if (withThinking && this.isThinkingRejection(err)) continue;
        throw err;
      }
    }
  }

  async complete(req: LlmRequest, signal?: AbortSignal): Promise<string> {
    for (const withThinking of [true, false]) {
      try {
        const res = await this.client.messages.create(this.body(req, withThinking) as any, {
          signal,
        });
        return res.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('');
      } catch (err) {
        if (withThinking && this.isThinkingRejection(err)) continue;
        throw err;
      }
    }
    return '';
  }
}
