import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { __setProvider, type LlmProvider, type LlmRequest } from '@/lib/llm';
import { __setStore } from '@/lib/store';

let dataDir: string;

beforeAll(() => {
  dataDir = mkdtempSync(path.join(tmpdir(), 'sv-resumo-'));
  process.env.SV_DATA_DIR = dataDir;
  process.env.DATA_BACKEND = 'fs';
  process.env.DEMO_TURNS_PER_IP = '3';
  process.env.AUTH_SECRET = 'x'.repeat(40);
});

afterAll(() => rmSync(dataDir, { recursive: true, force: true }));
beforeEach(() => __setStore(null));

function provider(text: string): LlmProvider & { seen: LlmRequest[] } {
  const seen: LlmRequest[] = [];
  const p: any = {
    name: 'fake',
    modelFor: () => 'fake-model',
    async *stream() {
      return { inputTokens: 0, outputTokens: 0 };
    },
    async complete(req: LlmRequest) {
      seen.push(req);
      return text;
    },
    seen,
  };
  return p;
}

const historico = (n: number) =>
  Array.from({ length: n }, (_, i) => `NARRADOR: Aconteceu a coisa número ${i + 1}.`);

function req(body: unknown, ip = '198.51.100.4') {
  return new Request('http://localhost/api/resumo', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  }) as any;
}

async function post(body: unknown, ip?: string) {
  const { POST } = await import('@/app/api/resumo/route');
  return POST(req(body, ip));
}

describe('POST /api/resumo', () => {
  it('resume o histórico e devolve um parágrafo limpo', async () => {
    const p = provider('A repórter achou o livro de carga.\n\n[PISTA: x]  Depois sumiu.');
    __setProvider(p);
    const res = await post({ era: '1934', history: historico(20), anterior: '' });
    const j = await res.json();

    // Sem marcação e sem quebra de linha: o resumo entra num prompt, não na tela.
    expect(j.resumo).toBe('A repórter achou o livro de carga. Depois sumiu.');
    expect(p.seen).toHaveLength(1);
    expect(p.seen[0].user).toContain('Aconteceu a coisa número 20.');
  });

  it('incorpora o resumo anterior em vez de recomeçar', async () => {
    const p = provider('Resumo novo.');
    __setProvider(p);
    await post({ era: '1934', history: historico(20), anterior: 'O começo foi no Píer 9.' }, '198.51.100.5');
    expect(p.seen[0].user).toContain('O começo foi no Píer 9.');
  });

  it('não gasta uma chamada quando mal começou a crônica', async () => {
    const p = provider('nunca chamado');
    __setProvider(p);
    const res = await post({ era: '1934', history: historico(2) }, '198.51.100.6');
    expect((await res.json()).resumo).toBe('');
    expect(p.seen).toHaveLength(0);
  });

  it('recusa era desconhecida', async () => {
    __setProvider(provider('x'));
    const res = await post({ era: '2026', history: historico(20) }, '198.51.100.7');
    expect(res.status).toBe(400);
  });

  it('falha do narrador não vira erro: a cena continua', async () => {
    const p: any = {
      name: 'fake',
      modelFor: () => 'm',
      async *stream() {},
      async complete() {
        throw new Error('503 do provedor');
      },
    };
    __setProvider(p);
    const res = await post({ era: '1934', history: historico(20) }, '198.51.100.8');
    expect(res.status).toBe(200);
    expect((await res.json()).resumo).toBe('');
  });

  it('tem cota própria, separada dos turnos do dia', async () => {
    // DEMO_TURNS_PER_IP=3 -> teto de resumos = ceil(3/6)+2 = 3.
    const p = provider('Resumo.');
    __setProvider(p);
    const ip = '198.51.100.9';
    for (let i = 0; i < 3; i++) {
      expect((await (await post({ era: '1934', history: historico(20) }, ip)).json()).resumo).toBe('Resumo.');
    }
    expect((await (await post({ era: '1934', history: historico(20) }, ip)).json()).resumo).toBe('');

    // E os turnos de narração do mesmo IP continuam intactos: resumir é
    // automático, e descontá-lo dos turnos tiraria do jogador o que ele pediu.
    const { getStore, today } = await import('@/lib/store');
    const { createHash } = await import('node:crypto');
    const quem = `ip:${createHash('sha256').update(ip).digest('hex')}`;
    expect(await (await getStore()).getQuota(quem, today())).toBe(0);
    expect(await (await getStore()).getQuota('resumo:' + quem, today())).toBe(4);
  });
});
