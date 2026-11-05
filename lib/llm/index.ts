import { ClaudeProvider } from './claude';
import { OpenAICompatProvider } from './openai-compat';
import { LlmConfigError, type LlmProvider } from './types';

export * from './types';

let cached: LlmProvider | null = null;

/**
 * Provider ativo, escolhido por LLM_PROVIDER (claude | opencode).
 * Instanciado uma vez por processo; erro de configuracao estoura na primeira
 * chamada, nao no import, para o build nao depender de env.
 */
export function getProvider(): LlmProvider {
  if (cached) return cached;
  const want = (process.env.LLM_PROVIDER || 'claude').toLowerCase();
  if (want === 'claude') cached = new ClaudeProvider();
  else if (want === 'opencode') cached = new OpenAICompatProvider();
  else throw new LlmConfigError(`LLM_PROVIDER desconhecido: ${want} (use claude ou opencode)`);
  return cached;
}

/** Usado so' em teste, para trocar o provider. */
export function __setProvider(p: LlmProvider | null) {
  cached = p;
}
