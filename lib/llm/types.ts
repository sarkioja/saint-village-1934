/**
 * Interface unica de LLM. Duas implementacoes, escolhidas por LLM_PROVIDER:
 *   claude   -> lib/llm/claude.ts        (Anthropic Messages API, nativa)
 *   opencode -> lib/llm/openai-compat.ts (qualquer endpoint /v1/chat/completions)
 *
 * O resto do app nao sabe qual esta' ativo.
 */

export type Tier = 'fast' | 'quality';

export type LlmRequest = {
  /**
   * Prefixo do prompt de sistema que NAO muda entre turnos da mesma cronica na
   * mesma regiao (~7.100 tokens: canone, seculo, regras, facoes, texto da regiao).
   * O adapter da Anthropic poe cache_control no fim dele.
   */
  stable: string;
  /** Sufixo volatil: ficha, caso, PdDs em cena. Muda a cada turno. */
  volatile: string;
  /** A mensagem do usuario (historico recente + a acao deste turno). */
  user: string;
  maxTokens: number;
  tier: Tier;
};

export type LlmUsage = {
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
};

export interface LlmProvider {
  /** Nome para log/diagnostico. */
  readonly name: string;
  /** Modelo que sera' usado para o tier dado (para log). */
  modelFor(tier: Tier): string;
  /** Stream de pedacos de texto. */
  stream(req: LlmRequest, signal?: AbortSignal): AsyncGenerator<string, LlmUsage | void>;
  /** Resposta completa de uma vez (usado pelo gerador de PdD). */
  complete(req: LlmRequest, signal?: AbortSignal): Promise<string>;
}

export class LlmConfigError extends Error {}
