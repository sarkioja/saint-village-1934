import { getProvider, LlmConfigError, PROVIDERS } from '@/lib/llm';
import { getStore, today } from '@/lib/store';
import { accountsEnabled } from '@/lib/store/availability';
import { postgresUrlVar } from '@/lib/store/pgurl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnóstico da instalação.
 *
 * Existe porque configurar isto envolve duas pessoas que não enxergam a mesma
 * coisa: quem tem as variáveis de ambiente não tem onde rodar comandos, e quem
 * tem onde rodar comandos não vê as variáveis. Este endpoint é o terreno comum
 * — ele conta o que está ligado sem que ninguém precise ler segredo de ninguém.
 *
 * NÃO expõe valor de chave nenhuma. Só diz se existe, qual provedor está
 * escolhido e quais modelos ele usaria — nomes de modelo e cotas não são
 * segredo, são justamente o que precisa ser conferido.
 */
export async function GET() {
  const saida: Record<string, unknown> = {
    ok: true,
    versao: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    ambiente: process.env.VERCEL === '1' ? 'vercel' : 'local',
  };

  // ---- narrador ----
  const escolhido = (process.env.LLM_PROVIDER || 'claude').toLowerCase();
  const llm: Record<string, unknown> = {
    LLM_PROVIDER: process.env.LLM_PROVIDER ? escolhido : `(não definida — usando "${escolhido}")`,
    provedoresAceitos: PROVIDERS,
  };
  try {
    const p = getProvider();
    llm.pronto = true;
    llm.modeloRapido = p.modelFor('fast');
    llm.modeloApurado = p.modelFor('quality');
  } catch (e) {
    llm.pronto = false;
    llm.problema =
      e instanceof LlmConfigError ? e.message : 'não foi possível inicializar o provedor';
    saida.ok = false;
  }
  saida.narrador = llm;

  // ---- banco ----
  const banco: Record<string, unknown> = {
    urlEncontradaEm: postgresUrlVar() ?? '(nenhuma)',
    contasLigadas: accountsEnabled(),
  };
  if (accountsEnabled()) {
    try {
      const store = await getStore();
      banco.backend = store.backend;
      // Uma leitura real prova que a conexão e o esquema funcionam.
      await store.getQuota('health-check', today());
      banco.tabelasOk = true;
    } catch (e: any) {
      banco.tabelasOk = false;
      banco.problema = String(e?.message || e).slice(0, 300);
      saida.ok = false;
    }
  }
  saida.banco = banco;

  // ---- sessão e cotas ----
  saida.sessao = {
    AUTH_SECRET: process.env.AUTH_SECRET
      ? process.env.AUTH_SECRET.length >= 32
        ? 'definida'
        : 'definida, mas curta demais (precisa de 32+ caracteres)'
      : '(não definida — cadastro e login vão falhar)',
  };
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) saida.ok = false;

  saida.cotas = {
    porContaPorDia: Number(process.env.DAILY_TURNS_PER_USER || 50),
    semContaPorIpPorDia: Number(process.env.DEMO_TURNS_PER_IP || 5),
    charsDoLivroNoPrompt: Number(process.env.BOOK_CONTEXT_CHARS || 11000),
    entradasDeHistorico: Number(process.env.HISTORY_TURNS || 18),
  };

  return Response.json(saida, { status: saida.ok ? 200 : 503 });
}
