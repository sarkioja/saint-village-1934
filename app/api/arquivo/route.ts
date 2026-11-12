import { NextRequest } from 'next/server';
import { getStore, RevisionConflict } from '@/lib/store';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';

/**
 * O arquivo da conta: o save inteiro do investigador, num documento só.
 *
 * É o modelo do designer — um arquivo por nome na recepção — e não a lista de
 * campanhas que o projeto tinha antes. Quem quer uma segunda crônica abre um
 * segundo investigador, que é como o jogo apresenta a ideia. Por baixo continua
 * sendo uma linha de `campaigns`, com o lock otimista de sempre.
 */

const NOME = 'arquivo';

async function arquivoDo(userId: string) {
  const store = await getStore();
  const todas = await store.listCampaigns(userId);
  return todas[0] ?? null;
}

export async function GET() {
  const sessao = await getSession();
  if (!sessao) return Response.json({ error: 'sem sessão' }, { status: 401 });

  const existente = await arquivoDo(sessao.userId);
  if (!existente) return Response.json({ state: null, rev: 0 });
  return Response.json({ state: existente.state, rev: existente.rev });
}

export async function PUT(req: NextRequest) {
  const sessao = await getSession();
  if (!sessao) return Response.json({ error: 'sem sessão' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'corpo inválido' }, { status: 400 });
  }
  const { rev, ...state } = body as Record<string, unknown>;

  const store = await getStore();
  const existente = await arquivoDo(sessao.userId);

  if (!existente) {
    // A era aqui é só rótulo da linha; o estado inteiro vai no documento.
    const criado = await store.createCampaign(
      sessao.userId,
      String((state as any).era ?? ''),
      NOME,
      state,
    );
    return Response.json({ rev: criado.rev });
  }

  try {
    const novo = await store.saveCampaign(existente.id, state, Number(rev) || 0);
    return Response.json({ rev: novo });
  } catch (err) {
    if (err instanceof RevisionConflict) {
      // Outra aba ou outro aparelho gravou depois. Quem perde a corrida recebe
      // o estado de lá em vez de sobrescrevê-lo.
      const atual = await arquivoDo(sessao.userId);
      return Response.json({ error: 'conflito', state: atual?.state ?? null, rev: atual?.rev ?? 0 }, { status: 409 });
    }
    throw err;
  }
}
