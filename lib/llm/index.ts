import { ClaudeProvider } from './claude';
import { OpenAICompatProvider, type CompatId } from './openai-compat';
import { LlmConfigError, type LlmProvider } from './types';

export * from './types';

/** Provedores aceitos em LLM_PROVIDER. */
export const PROVIDERS = ['claude', 'openai', 'openrouter', 'opencode'] as const;
export type ProviderId = (typeof PROVIDERS)[number];

let cached: LlmProvider | null = null;

/**
 * Provedor ativo, escolhido por LLM_PROVIDER.
 *
 *   claude     Anthropic Messages API nativa — e' o unico com prompt caching,
 *              que corta ~2/3 da entrada por turno. Prefira-o se tiver a chave.
 *   openai     api.openai.com
 *   openrouter openrouter.ai (centenas de modelos, inclusive Claude)
 *   opencode   OpenCode Zen ou qualquer endpoint OpenAI-compativel
 *
 * Instanciado uma vez por processo. Erro de configuracao estoura na primeira
 * chamada, nao no import, para o build nao depender de env.
 */
export function getProvider(): LlmProvider {
  if (cached) return cached;
  const want = (process.env.LLM_PROVIDER || 'claude').toLowerCase() as ProviderId;

  if (want === 'claude') {
    cached = new ClaudeProvider();
  } else if (want === 'openai' || want === 'openrouter' || want === 'opencode') {
    cached = new OpenAICompatProvider(want as CompatId);
  } else {
    throw new LlmConfigError(
      `LLM_PROVIDER desconhecido: "${want}". Use um de: ${PROVIDERS.join(', ')}.`,
    );
  }
  return cached!;
}

/** Usado so' em teste, para trocar o provedor. */
export function __setProvider(p: LlmProvider | null) {
  cached = p;
}
