import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { SqlStore } from '@/lib/store/sql';
// @ts-expect-error — módulo .mjs compartilhado com os scripts de linha de comando
import { exportar, importar } from '@/lib/store/handover.mjs';

/**
 * Prova o caminho de transferência: exportar tudo, apagar o banco, importar de
 * volta e conferir que nada se perdeu — incluindo o `jsonb` das crônicas e as
 * chaves estrangeiras.
 *
 * Isto é o que garante que o app pode mudar de conta (ou de fornecedor de
 * banco) sem depender de o Marketplace da Vercel transferir o recurso junto.
 */

let db: PGlite;
let store: SqlStore;
let query: (t: string, p?: unknown[]) => Promise<any[]>;

beforeAll(async () => {
  db = await new PGlite();
  query = async (t, p = []) => (await db.query(t, p as any[])).rows as any[];
  store = new SqlStore('pglite', query);
  await store.migrate();
});

async function limpar() {
  await db.query('DELETE FROM shares');
  await db.query('DELETE FROM campaigns');
  await db.query('DELETE FROM quota');
  await db.query('DELETE FROM users');
}

beforeEach(limpar);

async function popular() {
  const u1 = await store.createUser({
    email: 'nora@example.com',
    passwordHash: 'scrypt$32768$8$1$c2FsdA$a2V5',
    nome: 'Nora',
    prefs: { tamanhoNarracao: 'longo', modeloIA: 'sonnet' },
  });
  const u2 = await store.createUser({
    email: 'zack@example.com',
    passwordHash: 'scrypt$32768$8$1$c2FsdA$b3V0',
    nome: 'Zack',
    prefs: {},
  });

  const estado = {
    era: '1934',
    tab: 'cronica',
    eras: {
      '1934': {
        char: { nome: 'Nora Vance', saude: 6, esp: ['Atletismo', 'Vigilância'] },
        log: [
          { id: 'l1', k: 'narr', who: 'Narrador', text: 'A chuva chega de lado no Píer 9.' },
          { id: 'l2', k: 'action', text: 'Procuro o livro de carga.' },
        ],
        caso: { titulo: 'O corpo no Píer 9', segredo: 'o bilhete é do delegado', nec: 4 },
      },
    },
  };
  const c1 = await store.createCampaign(u1.id, '1934', 'O corpo no Píer 9', estado);
  await store.createCampaign(u2.id, '1994', 'Néon e pó', { era: '1994', tab: 'ficha', eras: {} });

  await store.bumpQuota(`user:${u1.id}`, '2026-11-05');
  await store.bumpQuota(`user:${u1.id}`, '2026-11-05');
  const token = await store.createShare(c1.id);

  return { u1, u2, c1, token, estado };
}

describe('transferência de dados', () => {
  it('exporta, apaga, importa e nada se perde', async () => {
    const { u1, c1, token, estado } = await popular();

    const dump = await exportar(query);
    expect(dump.versao).toBe(1);
    expect(dump.tabelas.users).toHaveLength(2);
    expect(dump.tabelas.campaigns).toHaveLength(2);
    expect(dump.tabelas.quota).toHaveLength(1);
    expect(dump.tabelas.shares).toHaveLength(1);

    // Simula a conta nova: banco vazio, esquema criado, importa o arquivo.
    await limpar();
    expect(await store.listCampaigns(u1.id)).toEqual([]);

    // Passa por JSON, como o arquivo em disco faria.
    await importar(query, JSON.parse(JSON.stringify(dump)));

    const u = await store.getUser(u1.id);
    expect(u?.email).toBe('nora@example.com');
    expect(u?.nome).toBe('Nora');
    expect(u?.passwordHash).toBe('scrypt$32768$8$1$c2FsdA$a2V5'); // login continua valendo
    expect(u?.prefs).toEqual({ tamanhoNarracao: 'longo', modeloIA: 'sonnet' });

    const c = await store.getCampaign(c1.id);
    expect(c?.nome).toBe('O corpo no Píer 9');
    expect(c?.userId).toBe(u1.id);
    // O estado do jogo volta byte a byte, com acentos e estrutura aninhada.
    expect(c?.state).toEqual(estado);

    expect(await store.getQuota(`user:${u1.id}`, '2026-11-05')).toBe(2);
    expect(await store.resolveShare(token)).toBe(c1.id);
  });

  it('importar duas vezes não duplica nada', async () => {
    const { u1 } = await popular();
    const dump = await exportar(query);
    await limpar();

    await importar(query, dump);
    await importar(query, dump);

    expect((await exportar(query)).tabelas.users).toHaveLength(2);
    expect(await store.listCampaigns(u1.id)).toHaveLength(1);
  });

  it('recusa arquivo de versão desconhecida', async () => {
    await expect(importar(query, { versao: 99, tabelas: {} })).rejects.toThrow(/versao/i);
  });

  it('a crônica importada continua gravável, do rev em que parou', async () => {
    const { c1 } = await popular();
    const revAntes = (await store.getCampaign(c1.id))!.rev;
    const dump = await exportar(query);
    await limpar();
    await importar(query, dump);

    // Rev preservado: o lock otimista continua coerente depois da mudança de conta.
    expect((await store.getCampaign(c1.id))!.rev).toBe(revAntes);
    const novo = await store.saveCampaign(c1.id, { seguiu: true }, revAntes);
    expect(novo).toBe(revAntes + 1);
  });
});
