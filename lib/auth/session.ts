import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

/**
 * Sessao em cookie JWT-like assinado (HMAC-SHA256), sem estado no servidor.
 *
 * Deliberadamente sem leitura de banco por request: numa arquitetura serverless
 * com plano gratuito, cada operacao conta. A sessao carrega o que precisamos
 * (userId, email) e e' verificada por assinatura.
 */

const COOKIE = 'sv_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export type Session = { userId: string; email: string; exp: number };

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error('AUTH_SECRET ausente ou curta (precisa de 32+ caracteres).');
  }
  return s;
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function issue(userId: string, email: string): string {
  const body: Session = { userId, email, exp: Math.floor(Date.now() / 1000) + MAX_AGE };
  const payload = b64(JSON.stringify(body));
  return `${payload}.${sign(payload)}`;
}

export function verify(token: string): Session | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(payload);
  // Comparacao em tempo constante.
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Session;
    if (!s.userId || !s.exp || s.exp < Math.floor(Date.now() / 1000)) return null;
    return s;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const c = (await cookies()).get(COOKIE);
    return c ? verify(c.value) : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE);
}

/** Para gerar uma AUTH_SECRET nova. */
export function newSecret(): string {
  return randomBytes(32).toString('base64url');
}
