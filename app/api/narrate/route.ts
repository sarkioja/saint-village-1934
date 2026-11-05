import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { buildSystemPrompt } from '@/lib/server/prompt';
import { loadBook, ERAS } from '@/lib/server/book';
import { getProvider, LlmConfigError, type Tier } from '@/lib/llm';
import { getStore, today } from '@/lib/store';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_TOKENS = 1000; // igual ao artifact original
const DEMO_LIMIT = Number(process.env.DEMO_TURNS_PER_IP || 5);
const USER_LIMIT = Number(process.env.DAILY_TURNS_PER_USER || 50);

const QUOTA_MSG =
  'Os arquivos da cidade fecham por hoje. O escrivão vira a placa, apaga a luz do corredor e diz para você voltar amanhã.';

function sse(obj: unknown) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

/** IP do cliente, atras do proxy da Vercel. */
function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '0.0.0.0';
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'corpo invalido' }, { status: 400 });
  }

  const era = String(body?.era ?? '');
  if (!ERAS.includes(era)) {
    return Response.json({ error: 'era desconhecida' }, { status: 400 });
  }
  const instr = String(body?.instr ?? '').slice(0, 4000);
  if (!instr) return Response.json({ error: 'instrucao vazia' }, { status: 400 });

  // ------------------------------------------------------------------ cota
  // Logado: cota por usuario. Anonimo (demo): cota por IP, bem menor.
  const session = await getSession();
  const store = await getStore();
  const subject = session
    ? `user:${session.userId}`
    : `ip:${createHash('sha256').update(clientIp(req)).digest('hex')}`;
  const limit = session ? USER_LIMIT : DEMO_LIMIT;

  let used: number;
  try {
    used = await store.bumpQuota(subject, today());
  } catch {
    // Se o contador falhar, nao bloqueia a jogada; so' perde a contagem.
    used = 0;
  }
  if (used > limit) {
    return Response.json(
      {
        error: 'quota',
        message: session
          ? QUOTA_MSG
          : `${QUOTA_MSG} Com uma conta, você tem ${USER_LIMIT} turnos por dia.`,
        limit,
        used: used - 1,
      },
      { status: 429 },
    );
  }

  // --------------------------------------------------- prompt (no servidor)
  const bookChars = Number(process.env.BOOK_CONTEXT_CHARS || 11000);
  const book = loadBook(era);
  const trimmedBook =
    bookChars >= 11000
      ? book
      : {
          geral: book.geral,
          textos: Object.fromEntries(
            Object.entries(book.textos).map(([k, v]) => [k, String(v).slice(0, bookChars)]),
          ),
        };

  const prefs = body?.prefs ?? {};
  const { stable, volatile } = buildSystemPrompt({
    era,
    char: body?.char ?? {},
    caso: body?.caso ?? {},
    cena: String(body?.cena ?? ''),
    naCena: Array.isArray(body?.naCena) ? body.naCena.map(String) : [],
    npc: body?.npc ?? null,
    prefs,
    book: trimmedBook,
  });

  const history: string[] = Array.isArray(body?.history) ? body.history.map(String) : [];
  const user = `HISTÓRICO RECENTE DA CRÔNICA:\n${history.join('\n') || '(início)'}\n\nAGORA: ${instr}`;

  const tier: Tier = prefs?.modeloIA === 'sonnet' ? 'quality' : 'fast';

  // ------------------------------------------------------- stream para o app
  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    const msg =
      err instanceof LlmConfigError
        ? err.message
        : 'O narrador não está configurado neste ambiente.';
    return Response.json({ error: 'config', message: msg }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let full = '';
      try {
        const gen = provider.stream(
          { stable, volatile, user, maxTokens: MAX_TOKENS, tier },
          req.signal,
        );
        for (;;) {
          const { value, done } = await gen.next();
          if (done) {
            const usage = value || undefined;
            // O texto completo vai no 'done': o cliente aplica as marcacoes
            // com o ingest() original sobre ele.
            controller.enqueue(encoder.encode(sse({ t: 'done', v: full, usage })));
            break;
          }
          full += value;
          controller.enqueue(encoder.encode(sse({ t: 'delta', v: value })));
        }
      } catch (err: any) {
        if (req.signal.aborted) {
          // Jogador saiu da pagina: nada a reportar.
        } else {
          console.error('[narrate]', err?.message || err);
          controller.enqueue(
            encoder.encode(sse({ t: 'error', v: 'O narrador não respondeu. Tente de novo.' })),
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  });
}
