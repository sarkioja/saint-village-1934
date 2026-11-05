import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createServer, type Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { OpenAICompatProvider } from '@/lib/llm/openai-compat';
import { LlmConfigError } from '@/lib/llm/types';

/**
 * Servidor falso OpenAI-compativel: grava o que recebeu e devolve o que o
 * teste mandar. Permite verificar URL, cabecalhos, corpo e stream sem chave real.
 */
type Captured = { url: string; headers: Record<string, string>; body: any };

let server: Server;
let base: string;
let captured: Captured[] = [];
let respond: (n: number) => { status: number; body: string; sse?: boolean } = () => ({
  status: 200,
  body: JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
});

beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      captured.push({
        url: req.url || '',
        headers: Object.fromEntries(
          Object.entries(req.headers).map(([k, v]) => [k, String(v)]),
        ),
        body: raw ? JSON.parse(raw) : null,
      });
      const r = respond(captured.length);
      res.writeHead(r.status, {
        'content-type': r.sse ? 'text/event-stream' : 'application/json',
      });
      res.end(r.body);
    });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`;
});

afterAll(() => new Promise<void>((r) => server.close(() => r())));

beforeEach(() => {
  captured = [];
  for (const k of Object.keys(process.env)) {
    if (/^(OPENAI|OPENROUTER|OPENCODE)_/.test(k)) delete process.env[k];
  }
});

const req = {
  stable: 'PREFIXO ESTAVEL',
  volatile: 'SUFIXO VOLATIL',
  user: 'AGORA: procuro o livro de carga.',
  maxTokens: 1000,
  tier: 'fast' as const,
};

describe('provedores OpenAI-compativeis', () => {
  it('openai: usa a api oficial, manda a chave e o modelo padrao', async () => {
    process.env.OPENAI_API_KEY = 'sk-teste';
    process.env.OPENAI_BASE_URL = base;
    const p = new OpenAICompatProvider('openai');
    expect(p.modelFor('fast')).toBe('gpt-4o-mini');
    expect(p.modelFor('quality')).toBe('gpt-4o');

    await p.complete(req);
    const c = captured[0];
    expect(c.url).toBe('/v1/chat/completions');
    expect(c.headers.authorization).toBe('Bearer sk-teste');
    expect(c.body.model).toBe('gpt-4o-mini');
    expect(c.body.max_tokens).toBe(1000);
    // Os dois blocos viram uma mensagem de sistema so'.
    expect(c.body.messages[0].role).toBe('system');
    expect(c.body.messages[0].content).toContain('PREFIXO ESTAVEL');
    expect(c.body.messages[0].content).toContain('SUFIXO VOLATIL');
    expect(c.body.messages[1].content).toContain('livro de carga');
  });

  it('openai: repete com max_completion_tokens quando o modelo recusa max_tokens', async () => {
    process.env.OPENAI_API_KEY = 'sk-teste';
    process.env.OPENAI_BASE_URL = base;
    process.env.OPENAI_MODEL_FAST = 'o4-mini';
    respond = (n) =>
      n === 1
        ? {
            status: 400,
            body: JSON.stringify({
              error: { message: "Unsupported parameter: 'max_tokens'. Use 'max_completion_tokens'." },
            }),
          }
        : { status: 200, body: JSON.stringify({ choices: [{ message: { content: 'pronto' } }] }) };

    const out = await new OpenAICompatProvider('openai').complete(req);
    expect(out).toBe('pronto');
    expect(captured).toHaveLength(2);
    expect(captured[0].body.max_tokens).toBe(1000);
    expect(captured[0].body.max_completion_tokens).toBeUndefined();
    expect(captured[1].body.max_completion_tokens).toBe(1000);
    expect(captured[1].body.max_tokens).toBeUndefined();
    respond = () => ({ status: 200, body: JSON.stringify({ choices: [{ message: { content: 'ok' } }] }) });
  });

  it('openrouter: manda os cabecalhos de atribuicao e aceita modelo com provedor no nome', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-teste';
    process.env.OPENROUTER_BASE_URL = base;
    process.env.OPENROUTER_SITE_URL = 'https://saint-village.vercel.app';
    const p = new OpenAICompatProvider('openrouter');
    expect(p.modelFor('quality')).toContain('/'); // ex.: anthropic/claude-sonnet-4.5

    await p.complete(req);
    const c = captured[0];
    expect(c.headers['http-referer']).toBe('https://saint-village.vercel.app');
    expect(c.headers['x-title']).toBe('Saint Village XX Century');
  });

  it('opencode: exige base URL explicita', () => {
    process.env.OPENCODE_API_KEY = 'x';
    expect(() => new OpenAICompatProvider('opencode')).toThrow(LlmConfigError);
    expect(() => new OpenAICompatProvider('opencode')).toThrow(/OPENCODE_BASE_URL/);
  });

  it('opencode: com base URL e modelo, funciona', async () => {
    process.env.OPENCODE_BASE_URL = base;
    process.env.OPENCODE_API_KEY = 'zen-teste';
    process.env.OPENCODE_MODEL_FAST = 'grok-code';
    const p = new OpenAICompatProvider('opencode');
    await p.complete(req);
    expect(captured[0].body.model).toBe('grok-code');
  });

  it('exige chave, exceto em endpoint local', () => {
    process.env.OPENAI_BASE_URL = base; // 127.0.0.1 conta como local
    expect(() => new OpenAICompatProvider('openai')).not.toThrow();

    process.env.OPENAI_BASE_URL = 'https://api.openai.com/v1';
    expect(() => new OpenAICompatProvider('openai')).toThrow(/OPENAI_API_KEY/);
  });

  it('stream: junta os deltas e ignora o [DONE]', async () => {
    process.env.OPENAI_API_KEY = 'sk-teste';
    process.env.OPENAI_BASE_URL = base;
    const chunks = ['A chuva ', 'chega de lado ', 'no Píer 9.'];
    respond = () => ({
      status: 200,
      sse: true,
      body:
        chunks
          .map((c) => `data: ${JSON.stringify({ choices: [{ delta: { content: c } }] })}\n\n`)
          .join('') +
        `data: ${JSON.stringify({ usage: { prompt_tokens: 120, completion_tokens: 30 } })}\n\n` +
        'data: [DONE]\n\n',
    });

    const p = new OpenAICompatProvider('openai');
    const got: string[] = [];
    const gen = p.stream(req);
    let usage: any;
    for (;;) {
      const { value, done } = await gen.next();
      if (done) {
        usage = value;
        break;
      }
      got.push(value);
    }
    expect(got.join('')).toBe('A chuva chega de lado no Píer 9.');
    expect(usage).toEqual({ inputTokens: 120, outputTokens: 30 });
    respond = () => ({ status: 200, body: JSON.stringify({ choices: [{ message: { content: 'ok' } }] }) });
  });

  it('stream: erro no meio do stream vira excecao, nao texto', async () => {
    process.env.OPENAI_API_KEY = 'sk-teste';
    process.env.OPENAI_BASE_URL = base;
    respond = () => ({
      status: 200,
      sse: true,
      body:
        `data: ${JSON.stringify({ choices: [{ delta: { content: 'comeco' } }] })}\n\n` +
        `data: ${JSON.stringify({ error: { message: 'rate limited' } })}\n\n`,
    });
    const gen = new OpenAICompatProvider('openai').stream(req);
    await expect(
      (async () => {
        for (;;) {
          const { done } = await gen.next();
          if (done) break;
        }
      })(),
    ).rejects.toThrow(/rate limited/);
    respond = () => ({ status: 200, body: JSON.stringify({ choices: [{ message: { content: 'ok' } }] }) });
  });
});
