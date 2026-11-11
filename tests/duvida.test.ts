import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { __setProvider, type LlmProvider, type LlmRequest } from '@/lib/llm';
import { __setStore } from '@/lib/store';
import REGRAS from '@/lib/oracle/data/regras.json';

const ERA = Object.keys(REGRAS as any).filter((k) => /^\d{4}$/.test(k)).sort()[0];

let dataDir: string;
beforeAll(() => {
  dataDir = mkdtempSync(path.join(tmpdir(), 'sv-duvida-'));
  process.env.SV_DATA_DIR = dataDir;
  process.env.DATA_BACKEND = 'fs';
  process.env.DEMO_TURNS_PER_IP = '3';
  process.env.AUTH_SECRET = 'x'.repeat(40);
});
afterAll(() => rmSync(dataDir, { recursive: true, force: true }));
beforeEach(() => __setStore(null));

function provider(text: string) {
  const seen: LlmRequest[] = [];
  const p: any = {
    name: 'fake',
    modelFor: () => 'fake-model',
    async *stream() {},
    async complete(req: LlmRequest) {
      seen.push(req);
      return text;
    },
    seen,
  };
  return p as LlmProvider & { seen: LlmRequest[] };
}

const corpo = {
  era: ERA,
  pergunta: 'Consigo arrombar a porta do galpão sem acordar o guarda?',
  char: { nome: 'Nora', inv: {}, esp: [], saude: 8, sf: 8, med: 7, imp: 4 },
  caso: { titulo: '', premissa: '', pistas: [], provas: [], vant: [], prob: [], nec: 4, fios: [] },
  cena: 'Downtown',
  naCena: [],
  history: ['NARRADOR: A chuva chega de lado.'],
  prefs: { modeloIA: 'haiku' },
};

async function post(b: unknown, ip = '203.0.113.9') {
  const { POST } = await import('@/app/api/duvida/route');
  return POST(
    new Request('http://localhost/api/duvida', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(b),
    }) as any,
  );
}

describe('POST /api/duvida — pergunta de regras ao Diretor', () => {
  it('responde e manda o bloco de juiz por último, depois do tom', async () => {
    const p = provider('Dá para arrombar. Exige teste de Força.');
    __setProvider(p);
    const res = await post(corpo);
    expect((await res.json()).resposta).toBe('Dá para arrombar. Exige teste de Força.');

    const req = p.seen[0];
    expect(req.volatile).toContain('PERGUNTA FORA DE CENA AO DIRETOR');
    // O bloco de juiz contradiz de propósito as instruções de tom que vêm
    // antes; se não for a última palavra, o narrador volta a narrar.
    expect(req.volatile.indexOf('PERGUNTA FORA DE CENA')).toBeGreaterThan(
      req.volatile.indexOf('FICHA DO PERSONAGEM'),
    );
    expect(req.user).toContain('PERGUNTA DO JOGADOR AO DIRETOR:');
    expect(req.maxTokens).toBe(700);
  });

  it('arranca marcação que escapar — arbitragem não mexe na ficha', async () => {
    __setProvider(provider('Exige teste. [TESTE: Força] [SAUDE: -2] Pronto.'));
    const res = await post(corpo, '203.0.113.10');
    const { resposta } = await res.json();
    expect(resposta).not.toMatch(/\[/);
    expect(resposta).toBe('Exige teste.   Pronto.');
  });

  it('recusa era desconhecida e pergunta vazia', async () => {
    __setProvider(provider('x'));
    expect((await post({ ...corpo, era: '1899' }, '203.0.113.11')).status).toBe(400);
    expect((await post({ ...corpo, pergunta: '   ' }, '203.0.113.12')).status).toBe(400);
  });

  it('gasta a mesma cota da narração', async () => {
    __setProvider(provider('ok'));
    const ip = '203.0.113.13';
    for (let i = 0; i < 3; i++) expect((await post(corpo, ip)).status).toBe(200);
    expect((await post(corpo, ip)).status).toBe(429);
  });
});
