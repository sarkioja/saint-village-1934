import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { SqlStore } from '@/lib/store/sql';
import { EmailTaken, RevisionConflict } from '@/lib/store';

/**
 * Roda o SQL de PRODUÇÃO contra um Postgres de verdade (PGlite, o Postgres
 * compilado para WASM) — sem servidor e sem rede.
 *
 * Importa porque o backend de arquivo não exercita nada disso: o `ON CONFLICT`
 * que garante e-mail único, os casts `jsonb`, o `UPDATE ... WHERE rev = $n` do
 * lock otimista e o contador de cota atômico só existem no caminho SQL.
 */

let db: PGlite;
let store: SqlStore;

beforeAll(async () => {
  db = await new PGlite();
  store = new SqlStore('pglite', async (text, params = []) => {
    const r = await db.query(text, params as any[]);
    return r.rows as any[];
  });
  await store.migrate();
});

beforeEach(async () => {
  // Ordem importa por causa das chaves estrangeiras.
  await db.query('DELETE FROM shares');
  await db.query('DELETE FROM campaigns');
  await db.query('DELETE FROM quota');
  await db.query('DELETE FROM users');
});

const novoUsuario = (email = 'nora@example.com') =>
  store.createUser({
    email,
    passwordHash: 'scrypt$x',
    nome: 'Nora',
    prefs: { tamanhoNarracao: 'medio', modeloIA: 'haiku' },
  });

describe('esquema', () => {
  it('migrate e idempotente', async () => {
    await store.migrate();
    await store.migrate();
    const r = await db.query(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema='public' ORDER BY table_name`,
    );
    expect((r.rows as any[]).map((x) => x.table_name)).toEqual([
      'campaigns',
      'quota',
      'shares',
      'users',
    ]);
  });
});

describe('criacao automatica do esquema', () => {
  it('cria as tabelas num banco vazio e nao refaz na segunda vez', async () => {
    // Banco novo, separado: prova o caminho do primeiro cold start em producao,
    // onde ninguem rodou `npm run migrate` porque nao havia onde rodar.
    const novo = await new PGlite();
    let consultas = 0;
    const q = async (t: string, p: unknown[] = []) => {
      consultas++;
      return (await novo.query(t, p as any[])).rows as any[];
    };
    const st = new SqlStore('pglite-vazio', q);

    const antes = (await q(`SELECT to_regclass('public.users') IS NOT NULL AS existe`))[0];
    expect(antes.existe).toBe(false);

    await st.garantirEsquema();
    const depois = (await q(`SELECT to_regclass('public.users') IS NOT NULL AS existe`))[0];
    expect(depois.existe).toBe(true);

    // O app passa a funcionar sem nenhum comando manual.
    const u = await st.createUser({ email: 'a@b.com', passwordHash: 'h', nome: 'A', prefs: {} });
    expect(u.id).toBeTruthy();

    // Segunda chamada nao dispara DDL de novo (memoizada).
    const marca = consultas;
    await st.garantirEsquema();
    expect(consultas).toBe(marca);
  });

  it('num banco que ja tem as tabelas, so faz a consulta de checagem', async () => {
    let consultas = 0;
    const q = async (t: string, p: unknown[] = []) => {
      consultas++;
      return (await db.query(t, p as any[])).rows as any[];
    };
    const st = new SqlStore('pglite-existente', q);
    await st.garantirEsquema();
    // Uma consulta: a checagem. Nada de DDL.
    expect(consultas).toBe(1);
  });
});

describe('usuarios', () => {
  it('cria e le, preservando prefs em jsonb', async () => {
    const u = await novoUsuario();
    expect(u.id).toMatch(/^[0-9a-f-]{36}$/);
    const lido = await store.getUser(u.id);
    expect(lido?.email).toBe('nora@example.com');
    expect(lido?.prefs).toEqual({ tamanhoNarracao: 'medio', modeloIA: 'haiku' });
  });

  it('normaliza o e-mail e recusa duplicata', async () => {
    await novoUsuario('Nora@Example.COM');
    expect(await store.getUserByEmail('nora@example.com')).not.toBeNull();
    // Mesmo e-mail com outra caixa tem que colidir.
    await expect(novoUsuario('NORA@example.com')).rejects.toBeInstanceOf(EmailTaken);
  });

  it('duas criacoes simultaneas do mesmo e-mail: so uma vence', async () => {
    // E' isto que o ON CONFLICT garante e um SELECT-antes-de-INSERT nao garantiria.
    const r = await Promise.allSettled([novoUsuario('z@x.com'), novoUsuario('z@x.com')]);
    expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
    expect(r.filter((x) => x.status === 'rejected')).toHaveLength(1);
  });

  it('atualiza prefs', async () => {
    const u = await novoUsuario();
    await store.updateUserPrefs(u.id, { tamanhoNarracao: 'longo', modeloIA: 'sonnet' });
    expect((await store.getUser(u.id))?.prefs).toEqual({
      tamanhoNarracao: 'longo',
      modeloIA: 'sonnet',
    });
  });
});

describe('cronicas', () => {
  it('cria, lista e devolve o estado jsonb intacto', async () => {
    const u = await novoUsuario();
    const estado = {
      era: '1934',
      tab: 'cronica',
      eras: { '1934': { char: { nome: 'Nora', saude: 6 }, log: [{ id: 'l1', text: 'chuva' }] } },
    };
    const c = await store.createCampaign(u.id, '1934', 'O corpo no Píer 9', estado);
    expect(c.rev).toBe(1);

    const lida = await store.getCampaign(c.id);
    expect(lida?.state).toEqual(estado);
    expect((await store.listCampaigns(u.id)).map((x) => x.id)).toEqual([c.id]);
  });

  it('lock otimista: rev certo grava, rev velho conflita', async () => {
    const u = await novoUsuario();
    const c = await store.createCampaign(u.id, '1934', 'Caso', { v: 1 });

    const rev2 = await store.saveCampaign(c.id, { v: 2 }, c.rev);
    expect(rev2).toBe(2);

    // Uma segunda aba, que ainda achava estar no rev 1, nao pode sobrescrever.
    await expect(store.saveCampaign(c.id, { v: 'aba velha' }, c.rev)).rejects.toBeInstanceOf(
      RevisionConflict,
    );
    expect((await store.getCampaign(c.id))?.state).toEqual({ v: 2 });
  });

  it('gravacoes concorrentes com o mesmo rev: so uma passa', async () => {
    const u = await novoUsuario();
    const c = await store.createCampaign(u.id, '1934', 'Caso', { v: 0 });
    const r = await Promise.allSettled([
      store.saveCampaign(c.id, { v: 'a' }, c.rev),
      store.saveCampaign(c.id, { v: 'b' }, c.rev),
    ]);
    expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
  });

  it('renomeia e apaga', async () => {
    const u = await novoUsuario();
    const c = await store.createCampaign(u.id, '1946', 'Sem nome', {});
    await store.renameCampaign(c.id, 'A Medalha');
    expect((await store.getCampaign(c.id))?.nome).toBe('A Medalha');
    await store.deleteCampaign(c.id);
    expect(await store.getCampaign(c.id)).toBeNull();
  });

  it('apagar o usuario leva as cronicas junto', async () => {
    const u = await novoUsuario();
    await store.createCampaign(u.id, '1934', 'Caso', {});
    await db.query('DELETE FROM users WHERE id = $1', [u.id]);
    expect(await store.listCampaigns(u.id)).toEqual([]);
  });
});

describe('cota', () => {
  it('conta por sujeito e por dia', async () => {
    expect(await store.bumpQuota('user:1', '2026-11-05')).toBe(1);
    expect(await store.bumpQuota('user:1', '2026-11-05')).toBe(2);
    // Outro dia e outro sujeito recomecam do zero.
    expect(await store.bumpQuota('user:1', '2026-11-06')).toBe(1);
    expect(await store.bumpQuota('ip:abc', '2026-11-05')).toBe(1);
    expect(await store.getQuota('user:1', '2026-11-05')).toBe(2);
    expect(await store.getQuota('ninguem', '2026-11-05')).toBe(0);
  });

  it('incrementos simultaneos nao se perdem', async () => {
    // Sem atomicidade (ler, somar, gravar) dois pedidos juntos contariam 1.
    const n = await Promise.all(
      Array.from({ length: 8 }, () => store.bumpQuota('user:corrida', '2026-11-05')),
    );
    expect(new Set(n).size).toBe(8);
    expect(Math.max(...n)).toBe(8);
  });
});

describe('links publicos', () => {
  it('cria, resolve e revoga', async () => {
    const u = await novoUsuario();
    const c = await store.createCampaign(u.id, '1934', 'Caso', {});
    const token = await store.createShare(c.id);
    expect(token).toMatch(/^[\w-]{20,}$/);
    expect(await store.resolveShare(token)).toBe(c.id);

    await store.revokeShare(token);
    expect(await store.resolveShare(token)).toBeNull();
    expect(await store.resolveShare('token-que-nao-existe')).toBeNull();
  });

  it('criar duas vezes devolve o MESMO link', async () => {
    // Antes isto cunhava um token novo a cada clique: varios links vivos e
    // permanentes, e revogar um nao fechava os outros.
    const u = await novoUsuario();
    const c = await store.createCampaign(u.id, '1934', 'Caso', {});
    const a = await store.createShare(c.id);
    const b = await store.createShare(c.id);
    expect(b).toBe(a);
    expect(await store.listShares(c.id)).toHaveLength(1);
  });

  it('depois de revogar, criar de novo da um link diferente', async () => {
    const u = await novoUsuario();
    const c = await store.createCampaign(u.id, '1934', 'Caso', {});
    const a = await store.createShare(c.id);
    await store.revokeShare(a);
    expect(await store.listShares(c.id)).toHaveLength(0);

    const b = await store.createShare(c.id);
    expect(b).not.toBe(a);
    // O link antigo continua morto.
    expect(await store.resolveShare(a)).toBeNull();
    expect(await store.resolveShare(b)).toBe(c.id);
  });

  it('listShares nao mistura cronicas', async () => {
    const u = await novoUsuario();
    const c1 = await store.createCampaign(u.id, '1934', 'A', {});
    const c2 = await store.createCampaign(u.id, '1946', 'B', {});
    const t1 = await store.createShare(c1.id);
    await store.createShare(c2.id);
    expect((await store.listShares(c1.id)).map((x) => x.token)).toEqual([t1]);
  });

  it('apagar a cronica leva os links junto', async () => {
    const u = await novoUsuario();
    const c = await store.createCampaign(u.id, '1934', 'Caso', {});
    const token = await store.createShare(c.id);
    await store.deleteCampaign(c.id);
    expect(await store.resolveShare(token)).toBeNull();
  });
});
