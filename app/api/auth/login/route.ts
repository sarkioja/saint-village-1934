import { NextRequest } from 'next/server';
import { accountsEnabled, ACCOUNTS_OFF_MESSAGE } from '@/lib/store/availability';
import { getStore } from '@/lib/store';
import { verifyPassword } from '@/lib/auth/password';
import { issue, setSessionCookie } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!accountsEnabled()) {
    return Response.json({ error: 'accounts_off', message: ACCOUNTS_OFF_MESSAGE }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? '').trim().toLowerCase();
  const password = String(body?.password ?? '');

  const store = await getStore();
  const user = await store.getUserByEmail(email);

  // Mesma mensagem para e-mail inexistente e senha errada: nao revela
  // quais e-mails tem conta.
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    return Response.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
  }

  await setSessionCookie(issue(user.id, user.email));
  return Response.json({ ok: true, user: { id: user.id, email: user.email, nome: user.nome } });
}
