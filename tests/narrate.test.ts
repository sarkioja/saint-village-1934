import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { __setProvider, type LlmProvider, type LlmRequest } from '@/lib/llm';
import { __setStore } from '@/lib/store';
import { stripMarks } from '@/lib/oracle/logic';

let dataDir: string;

beforeAll(() => {
  dataDir = mkdtempSync(path.join(tmpdir(), 'sv-test-'));
  process.env.SV_DATA_DIR = dataDir;
  process.env.DATA_BACKEND = 'fs';
  process.env.DEMO_TURNS_PER_IP = '3';
  process.env.AUTH_SECRET = 'x'.repeat(40);
});

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

beforeEach(() => {
  __setStore(null);
});

/** Narrador falso: devolve um texto fixo em pedacos, para o teste ser deterministico. */
function fakeProvider(text: string, chunk = 17): LlmProvider {
  const seen: LlmRequest[] = [];
  const p: LlmProvider = {
    name: 'fake',
    modelFor: () => 'fake-model',
    async *stream(req) {
      seen.push(req);
      for (let i = 0; i < text.length; i += chunk) yield text.slice(i, i + chunk);
      return { inputTokens: 100, outputTokens: 20 };
    },
    async complete(req) {
      seen.push(req);
      return text;
    },
  };
  (p as any).seen = seen;
  return p;
}

function reqOf(body: unknown, ip = '203.0.113.7') {
  return new Request('http://localhost/api/narrate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  }) as any;
}

const baseBody = {
  era: '1934',
  instr: 'Procuro o livro de carga na sala do encarregado.',
  char: { nome: 'Nora', inv: {}, esp: [], saude: 8, sf: 8, med: 7, imp: 4 },
  caso: { titulo: 'O corpo no Píer 9', pistas: [], provas: [], vant: [], prob: [], nec: 4, fios: [] },
  cena: 'Downtown',
  naCena: [],
  history: ['NARRADOR: A chuva chega de lado.'],
  prefs: { tamanhoNarracao: 'medio', modeloIA: 'haiku' },
};

/** Le um stream SSE e devolve os eventos. */
async function readSse(res: Response) {
  const text = await res.text();
  return text
    .split('\n')
    .filter((l) => l.startsWith('data:'))
    .map((l) => JSON.parse(l.slice(5).trim()));
}

describe('POST /api/narrate', () => {
  it('faz stream da prosa e entrega o texto completo no fim', async () => {
    const NARRACAO =
      'O livro está onde deveria estar, e é justamente por isso que incomoda: a página de ' +
      'ontem foi arrancada com régua. [PISTA: a página de ontem foi arrancada com régua] ' +
      '[TESTE: Vigilância]';
    __setProvider(fakeProvider(NARRACAO));
    const { POST } = await import('@/app/api/narrate/route');

    const res = await POST(reqOf(baseBody, '198.51.100.1'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');

    const evs = await readSse(res as Response);
    const deltas = evs.filter((e) => e.t === 'delta');
    const done = evs.find((e) => e.t === 'done');

    expect(deltas.length).toBeGreaterThan(1);
    // A concatenacao dos deltas e o payload final tem que ser o mesmo texto.
    expect(deltas.map((d) => d.v).join('')).toBe(NARRACAO);
    expect(done?.v).toBe(NARRACAO);
    // As marcacoes chegam INTACTAS: e' o ingest() do cliente que as aplica.
    expect(done.v).toContain('[PISTA:');
    expect(done.v).toContain('[TESTE: Vigilância]');
  });

  it('o prompt estavel vai separado do volatil, para o cache valer', async () => {
    const p = fakeProvider('texto curto.');
    __setProvider(p);
    const { POST } = await import('@/app/api/narrate/route');
    await readSse((await POST(reqOf(baseBody, '198.51.100.2'))) as Response);

    const [req] = (p as any).seen as LlmRequest[];
    expect(req.stable.length).toBeGreaterThan(3000);
    expect(req.stable).toContain('REGRAS:');
    expect(req.stable).not.toContain('FICHA DO PERSONAGEM:');
    expect(req.volatile).toContain('FICHA DO PERSONAGEM:');
    expect(req.volatile).toContain('Nora');
    // O historico e a acao vao na mensagem do usuario, nao no system.
    expect(req.user).toContain('A chuva chega de lado');
    expect(req.user).toContain('Procuro o livro de carga');
  });

  it('recusa era desconhecida e instrucao vazia', async () => {
    __setProvider(fakeProvider('x'));
    const { POST } = await import('@/app/api/narrate/route');
    expect((await POST(reqOf({ ...baseBody, era: '2024' }))).status).toBe(400);
    expect((await POST(reqOf({ ...baseBody, instr: '' }))).status).toBe(400);
  });

  it('corta no limite da demo e responde 429 com mensagem', async () => {
    __setProvider(fakeProvider('narração.'));
    const { POST } = await import('@/app/api/narrate/route');
    const ip = '198.51.100.9'; // IP proprio: a cota e' por IP

    for (let i = 0; i < 3; i++) {
      const ok = await POST(reqOf(baseBody, ip));
      expect(ok.status, `turno ${i + 1} deveria passar`).toBe(200);
      await readSse(ok as Response);
    }

    const cortado = await POST(reqOf(baseBody, ip));
    expect(cortado.status).toBe(429);
    const j = await (cortado as Response).json();
    expect(j.error).toBe('quota');
    expect(j.message).toMatch(/arquivos da cidade/i);
  });

  it('corta o historico no teto do servidor, nao no que o cliente mandar', async () => {
    // Sem isto, uma requisicao forjada inflaria o prompt — e a conta de quem
    // paga a chave. HISTORY_TURNS e' 18 por padrao.
    const p = fakeProvider('ok');
    __setProvider(p);
    const { POST } = await import('@/app/api/narrate/route');

    const enorme = Array.from({ length: 500 }, (_, i) => `ENTRADA ${i}`);
    await readSse(
      (await POST(reqOf({ ...baseBody, history: enorme }, '198.51.100.40'))) as Response,
    );

    const req = ((p as any).seen as LlmRequest[])[0];
    const linhas = req.user.split('\n').filter((l) => l.startsWith('ENTRADA '));
    expect(linhas.length).toBeLessThanOrEqual(18);
    // Mantem o FIM da conversa, que e' o que importa para a cena.
    expect(req.user).toContain('ENTRADA 499');
    expect(req.user).not.toContain('ENTRADA 0\n');
  });

  it('limita o tamanho dos campos do estado do jogo', async () => {
    const p = fakeProvider('ok');
    __setProvider(p);
    const { POST } = await import('@/app/api/narrate/route');

    const gigante = 'x'.repeat(200_000);
    await readSse(
      (await POST(
        reqOf(
          { ...baseBody, caso: { ...baseBody.caso, premissa: gigante }, cena: gigante },
          '198.51.100.41',
        ),
      )) as Response,
    );

    const req = ((p as any).seen as LlmRequest[])[0];
    // 200 mil caracteres nao podem virar prompt.
    expect(req.volatile.length).toBeLessThan(20_000);
  });

  it('o modelo apurado escolhe o tier de qualidade', async () => {
    const p = fakeProvider('x');
    __setProvider(p);
    const { POST } = await import('@/app/api/narrate/route');
    await readSse(
      (await POST(
        reqOf({ ...baseBody, prefs: { modeloIA: 'sonnet' } }, '198.51.100.3'),
      )) as Response,
    );
    expect(((p as any).seen as LlmRequest[])[0].tier).toBe('quality');
  });
});

describe('stripMarks (filtro do stream)', () => {
  it('esconde marcacoes completas', () => {
    expect(stripMarks('Chove. [PISTA: o bilhete] Fim.')).toBe('Chove.  Fim.');
  });

  it('esconde marcacao pela metade no fim do buffer', () => {
    // E' isto que impede um "[PIST" piscar na tela durante o stream.
    expect(stripMarks('Chove. [PIST')).toBe('Chove. ');
    expect(stripMarks('Chove. [TESTE: Vigil')).toBe('Chove. ');
  });

  it('nao mexe em colchete que nao e marcacao no meio do texto', () => {
    expect(stripMarks('Chove muito.')).toBe('Chove muito.');
  });
});
