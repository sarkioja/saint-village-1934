import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

/**
 * `cookies()` do next/headers só existe dentro de um request real do Next.
 * Aqui a rota é chamada direto, então o cofre de cookies é falso — o que está
 * sob teste é a identidade (slug), o PIN e o tranco de tentativas, não o
 * transporte do cookie, que o smoke test cobre contra um servidor de verdade.
 */
const cookieJar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    set: (nome: string, valor: string) => cookieJar.set(nome, valor),
    get: (nome: string) => (cookieJar.has(nome) ? { value: cookieJar.get(nome) } : undefined),
    delete: (nome: string) => cookieJar.delete(nome),
  }),
}));
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { __setStore, getStore, today } from '@/lib/store';

let dataDir: string;
beforeAll(() => {
  dataDir = mkdtempSync(path.join(tmpdir(), 'sv-perfil-'));
  process.env.SV_DATA_DIR = dataDir;
  process.env.DATA_BACKEND = 'fs';
  process.env.AUTH_SECRET = 'x'.repeat(40);
});
afterAll(() => rmSync(dataDir, { recursive: true, force: true }));
beforeEach(() => __setStore(null));

async function entrar(nome: string, pin: string, ip = '198.51.100.20') {
  const { POST } = await import('@/app/api/perfil/route');
  return POST(
    new Request('http://localhost/api/perfil', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify({ nome, pin }),
    }) as any,
  );
}

describe('POST /api/perfil — entrar pelo nome do investigador', () => {
  it('o primeiro a usar o nome com PIN fica com ele', async () => {
    const res = await entrar('Nora Vance', '4817');
    const j = await res.json();
    expect(res.status).toBe(200);
    expect(j).toMatchObject({ perfil: { slug: 'nora-vance', nome: 'Nora Vance' }, novo: true });
    expect(cookieJar.size).toBeGreaterThan(0); // sessão emitida
  });

  it('o mesmo nome com o PIN certo entra na MESMA conta', async () => {
    await entrar('Jack Reilly', '1111');
    const res = await entrar('jack  reilly', '1111'); // caixa e espaço não importam
    const j = await res.json();
    expect(j.novo).toBe(false);
    expect(j.perfil.slug).toBe('jack-reilly');
  });

  it('PIN errado não entra', async () => {
    await entrar('Sam Spade', '2222');
    const res = await entrar('Sam Spade', '9999');
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('PIN não confere.');
  });

  it('sem PIN não cria conta no servidor — fica no navegador', async () => {
    const res = await entrar('Anônimo', '');
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('local');
    expect(await (await getStore()).getUserByEmail('anonimo')).toBeNull();
  });

  it('recusa nome curto demais', async () => {
    expect((await entrar('A', '1234')).status).toBe(400);
  });

  it('o PIN nunca é guardado em claro, e cada conta tem sal próprio', async () => {
    await entrar('Nick Charles', '7777');
    await entrar('Nora Charles', '7777');
    const store = await getStore();
    const a = await store.getUserByEmail('nick-charles');
    const b = await store.getUserByEmail('nora-charles');
    expect(a!.passwordHash).not.toContain('7777');
    expect(a!.passwordHash).toMatch(/^scrypt\$/);
    // Mesmo PIN, hashes diferentes: sem sal, um vazamento revelaria os dois.
    expect(a!.passwordHash).not.toBe(b!.passwordHash);
  });

  it('tranca o nome depois de 10 PINs errados no dia', async () => {
    await entrar('Velma Kelly', '3333');
    for (let i = 0; i < 10; i++) {
      expect((await entrar('Velma Kelly', '0000')).status).toBe(401);
    }
    // O 11º nem chega a verificar — e o PIN certo também espera amanhã,
    // que é o preço de trancar de verdade.
    const res = await entrar('Velma Kelly', '3333');
    expect(res.status).toBe(429);
  });

  it('só erro conta: quem acerta não se tranca sozinho', async () => {
    await entrar('Philip Marlowe', '5555');
    for (let i = 0; i < 15; i++) {
      expect((await entrar('Philip Marlowe', '5555')).status).toBe(200);
    }
    const store = await getStore();
    expect(await store.getQuota('pin:philip-marlowe', today())).toBe(0);
  });
});
