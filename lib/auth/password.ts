import { scrypt as _scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt) as (
  pw: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  opts?: { N?: number; r?: number; p?: number; maxmem?: number },
) => Promise<Buffer>;

/**
 * Hash de senha com scrypt do node:crypto.
 *
 * scrypt em vez de bcrypt/argon2 porque e' nativo: zero dependencia binaria,
 * que em serverless e' uma fonte comum de falha de deploy.
 *
 * N=2^15 custa ~100ms por hash nesta classe de maquina — alto o bastante para
 * atrapalhar forca-bruta, baixo o bastante para nao estourar o tempo da function.
 */
const N = 32768; // 2^15
const R = 8;
const P = 1;
const KEYLEN = 32;
const MAXMEM = 64 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, keyB64] = parts;
  try {
    const salt = Buffer.from(saltB64, 'base64url');
    const expected = Buffer.from(keyB64, 'base64url');
    const key = await scrypt(password.normalize('NFKC'), salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: MAXMEM,
    });
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

/** Validacao minima, com mensagens que o formulario mostra. */
export function checkCredentials(email: string, password: string): string | null {
  const e = (email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'E-mail inválido.';
  if (e.length > 254) return 'E-mail muito longo.';
  if ((password || '').length < 8) return 'A senha precisa de pelo menos 8 caracteres.';
  if (password.length > 200) return 'Senha muito longa.';
  return null;
}
