import { NextRequest } from 'next/server';
import { getStore } from '@/lib/store';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

async function owned(id: string) {
  const session = await getSession();
  if (!session) return null;
  const store = await getStore();
  const c = await store.getCampaign(id);
  if (!c || c.userId !== session.userId) return null;
  return { store, c };
}

/** Links ativos desta crônica. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await owned(id);
  if (!r) return Response.json({ error: 'nao encontrada' }, { status: 404 });
  const shares = await r.store.listShares(id);
  return Response.json({
    shares: shares.map((s) => ({ ...s, url: `/c/${s.token}` })),
  });
}

/**
 * Cria o link público. É idempotente: se já existe um link ativo, devolve o
 * mesmo. Sem isso, cada clique no botão cunharia mais um token vivo e
 * permanente, e revogar um não fecharia os outros.
 */
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await owned(id);
  if (!r) return Response.json({ error: 'nao encontrada' }, { status: 404 });
  const token = await r.store.createShare(id);
  return Response.json({ token, url: `/c/${token}` });
}

/** Revoga. Sem `token`, revoga todos os links ativos da crônica. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await owned(id);
  if (!r) return Response.json({ error: 'nao encontrada' }, { status: 404 });

  const token = new URL(req.url).searchParams.get('token');

  if (token) {
    // Só revoga se o token for mesmo desta crônica: senão um dono poderia
    // derrubar o link de outra pessoa sabendo o token dela.
    const alvo = await r.store.resolveShare(token);
    if (alvo !== id) return Response.json({ error: 'token nao confere' }, { status: 400 });
    await r.store.revokeShare(token);
    return Response.json({ ok: true, revogados: 1 });
  }

  const ativos = await r.store.listShares(id);
  for (const s of ativos) await r.store.revokeShare(s.token);
  return Response.json({ ok: true, revogados: ativos.length });
}
