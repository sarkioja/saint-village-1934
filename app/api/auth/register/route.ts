import { NextRequest } from 'next/server';
import { accountsEnabled, ACCOUNTS_OFF_MESSAGE } from '@/lib/store/availability';
import { getStore, EmailTaken } from '@/lib/store';
import { hashPassword, checkCredentials } from '@/lib/auth/password';
import { issue, setSessionCookie } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!accountsEnabled()) {
    return Response.json({ error: 'accounts_off', message: ACCOUNTS_OFF_MESSAGE }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? '');
  const password = String(body?.password ?? '');
  const nome = String(body?.nome ?? '').slice(0, 80);

  const bad = checkCredentials(email, password);
  if (bad) return Response.json({ error: bad }, { status: 400 });

  const store = await getStore();
  try {
    const user = await store.createUser({
      email: email.trim().toLowerCase(),
      passwordHash: await hashPassword(password),
      nome,
      prefs: { tamanhoNarracao: 'medio', modeloIA: 'haiku' },
    });
    await setSessionCookie(issue(user.id, user.email));
    return Response.json({ ok: true, user: { id: user.id, email: user.email, nome: user.nome } });
  } catch (e) {
    if (e instanceof EmailTaken) {
      return Response.json({ error: 'Já existe uma conta com esse e-mail.' }, { status: 409 });
    }
    console.error('[register]', e);
    return Response.json({ error: 'Não foi possível criar a conta.' }, { status: 500 });
  }
}
