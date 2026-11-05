import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';
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
export async function GET(req: NextRequest) {
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

  // ---- sonda opcional: ?probe=llm ----
  //
  // `pronto: true` acima so' diz que a chave existe, nao que ela vale. A sonda
  // faz uma chamada minima de verdade e prova a ponta a ponta.
  //
  // Custa tokens, entao consome uma unidade da mesma cota diaria por IP que
  // protege a demo: um bot nao transforma este endpoint em gasto.
  if (new URL(req.url).searchParams.get('probe') === 'llm') {
    const ip = (req.headers.get('x-forwarded-for') || '0.0.0.0').split(',')[0].trim();
    const subject = `probe:${createHash('sha256').update(ip).digest('hex')}`;
    const teto = Number(process.env.DEMO_TURNS_PER_IP || 5);
    let usadas = 0;
    try {
      usadas = await (await getStore()).bumpQuota(subject, today());
    } catch {
      usadas = 0;
    }

    if (usadas > teto) {
      saida.sonda = { feita: false, motivo: `cota de sondas esgotada hoje (${teto} por IP)` };
    } else {
      try {
        const p = getProvider();
        const t0 = Date.now();
        // A sonda usa o MESMO orcamento da narracao real (1000) e pede um texto
        // do mesmo tamanho. Uma frase curta nao provaria nada: se o modelo gasta
        // tokens pensando, o truncamento so' apareceria no tamanho de verdade —
        // e o jogador veria a cena cortada no meio.
        const pedido = {
          stable: 'Você é um narrador de ficção noir e escreve em português do Brasil.',
          volatile: '',
          user: 'Narre, em 90 a 170 palavras, a chegada de alguém a um píer na chuva, à noite.',
          maxTokens: 1000,
          tier: 'fast' as const,
        };
        const texto = await p.complete(pedido);
        const ms = Date.now() - t0;
        const limpo = texto.trim();

        const palavras = limpo ? limpo.split(/\s+/).length : 0;
        saida.sonda = {
          feita: true,
          chaveValida: true,
          modelo: p.modelFor('fast'),
          ms,
          gerouTexto: limpo.length > 0,
          palavras,
          // Terminar sem pontuacao final e' o sintoma de corte por orcamento.
          pareceTruncado: palavras > 0 && !/[.!?…"”»]$/.test(limpo),
          respondeu: limpo.slice(0, 220),
        };
        if ((saida.sonda as any).pareceTruncado) saida.ok = false;

        // Vazio sem erro e' o caso perigoso: passaria por "ok" e entregaria
        // narracao em branco ao jogador. Investiga e reprova.
        if (!limpo) {
          saida.ok = false;
          const dbg = (p as any).debugComplete;
          if (typeof dbg === 'function') {
            saida.sonda = {
              ...(saida.sonda as object),
              diagnostico: await dbg.call(p, pedido),
            };
          }
        }
      } catch (e: any) {
        saida.sonda = {
          feita: true,
          chaveValida: false,
          erro: String(e?.message || e).slice(0, 300),
        };
        saida.ok = false;
      }
    }
  }

  // Em vez de so' apontar o que falta, diz o que fazer a respeito — quem le
  // isto costuma estar no meio da configuracao, nao depurando o codigo.
  const façaIsto: string[] = [];
  if (!(llm as any).pronto) {
    façaIsto.push(
      `Defina a chave do provedor "${escolhido}" nas variáveis de ambiente do projeto. ` +
        `Para usar outro, mude LLM_PROVIDER para um de: ${PROVIDERS.join(', ')}.`,
    );
  }
  if (!process.env.LLM_PROVIDER) {
    façaIsto.push(
      'LLM_PROVIDER não está definida, então o app assume "claude". Se a chave que você ' +
        'cadastrou é de outro provedor, a narração vai falhar até você definir essa variável.',
    );
  }
  if (!accountsEnabled()) {
    façaIsto.push(
      'Nenhuma URL de Postgres foi encontrada. Provisione um banco no projeto (a integração ' +
        'injeta a URL sozinha); as contas ficam desligadas até lá, e o jogo roda em modo demo.',
    );
  }
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    façaIsto.push(
      'Defina AUTH_SECRET com 32+ caracteres (gere com: openssl rand -base64 32). ' +
        'Sem ela, cadastro e login falham.',
    );
  }
  if (façaIsto.length) saida.façaIsto = façaIsto;

  return Response.json(saida, { status: saida.ok ? 200 : 503 });
}
