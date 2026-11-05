import { NextRequest } from 'next/server';
import { getStore } from '@/lib/store';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ user: null });
  const store = await getStore();
  const u = await store.getUser(session.userId);
  if (!u) return Response.json({ user: null });
  return Response.json({ user: { id: u.id, email: u.email, nome: u.nome, prefs: u.prefs } });
}

/** Salva as preferencias do narrador (antes props fixos do artifact). */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'nao autenticado' }, { status: 401 });
  const body = await req.json().catch(() => null);

  const tam = String(body?.tamanhoNarracao ?? '');
  const mod = String(body?.modeloIA ?? '');
  const prefs = {
    tamanhoNarracao: (['curto', 'medio', 'longo'].includes(tam) ? tam : 'medio') as
      | 'curto'
      | 'medio'
      | 'longo',
    modeloIA: (['haiku', 'sonnet'].includes(mod) ? mod : 'haiku') as 'haiku' | 'sonnet',
  };

  const store = await getStore();
  await store.updateUserPrefs(session.userId, prefs);
  return Response.json({ ok: true, prefs });
}
