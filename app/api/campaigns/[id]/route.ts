import { NextRequest } from 'next/server';
import { getStore, RevisionConflict } from '@/lib/store';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

/** Garante que a cronica e' da conta logada. */
async function owned(id: string) {
  const session = await getSession();
  if (!session) return { error: Response.json({ error: 'nao autenticado' }, { status: 401 }) };
  const store = await getStore();
  const c = await store.getCampaign(id);
  if (!c) return { error: Response.json({ error: 'nao encontrada' }, { status: 404 }) };
  if (c.userId !== session.userId) {
    // 404 em vez de 403: nao confirma a existencia de cronica de outro.
    return { error: Response.json({ error: 'nao encontrada' }, { status: 404 }) };
  }
  return { store, c };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await owned(id);
  if (r.error) return r.error;
  return Response.json({ id: r.c.id, era: r.c.era, nome: r.c.nome, rev: r.c.rev, state: r.c.state });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await owned(id);
  if (r.error) return r.error;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'corpo invalido' }, { status: 400 });
  }
  // O cliente manda {era, tab, eras} — a mesma forma do save do artifact.
  const rev = Number(body.rev ?? r.c.rev);
  const state = { era: body.era ?? null, tab: body.tab ?? 'cronica', eras: body.eras ?? {} };

  try {
    const next = await r.store.saveCampaign(id, state, rev);
    return Response.json({ ok: true, rev: next });
  } catch (e) {
    if (e instanceof RevisionConflict) {
      return Response.json({ error: 'conflito', rev: r.c.rev }, { status: 409 });
    }
    console.error('[campaign:put]', e);
    return Response.json({ error: 'nao foi possivel gravar' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await owned(id);
  if (r.error) return r.error;
  const body = await req.json().catch(() => null);
  const nome = String(body?.nome ?? '').trim().slice(0, 80);
  if (!nome) return Response.json({ error: 'nome vazio' }, { status: 400 });
  await r.store.renameCampaign(id, nome);
  return Response.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await owned(id);
  if (r.error) return r.error;
  await r.store.deleteCampaign(id);
  return Response.json({ ok: true });
}
