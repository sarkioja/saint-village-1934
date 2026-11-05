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

/** Cria um link publico somente-leitura. */
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await owned(id);
  if (!r) return Response.json({ error: 'nao encontrada' }, { status: 404 });
  const token = await r.store.createShare(id);
  return Response.json({ token, url: `/c/${token}` });
}

/** Revoga o link. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await owned(id);
  if (!r) return Response.json({ error: 'nao encontrada' }, { status: 404 });
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return Response.json({ error: 'token ausente' }, { status: 400 });
  // So' revoga se o token apontar para ESTA cronica.
  const alvo = await r.store.resolveShare(token);
  if (alvo !== id) return Response.json({ error: 'token nao confere' }, { status: 400 });
  await r.store.revokeShare(token);
  return Response.json({ ok: true });
}
