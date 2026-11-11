import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { loadBook, ERAS } from '@/lib/server/book';
import { buildSystemPrompt, PROMPT_JUIZ } from '@/lib/server/prompt';
import { getProvider, LlmConfigError, type Tier } from '@/lib/llm';
import { getStore, today } from '@/lib/store';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** Orçamento do artifact para a resposta de regras. */
const MAX_TOKENS = 700;
const HISTORY_TURNS = Number(process.env.HISTORY_TURNS || 18);
const MAX_CHARS_POR_ENTRADA = 4000;
const MAX_CHARS_HISTORICO = 24000;
const MAX_CHARS_PERGUNTA = 2000;
const MAX_NPCS_EM_CENA = 12;

function limitarTextos(v: unknown, maxItens: number, maxTotal: number): string[] {
  if (!Array.isArray(v)) return [];
  const ultimos = v.slice(-maxItens).map((x) => String(x).slice(0, MAX_CHARS_POR_ENTRADA));
  const out: string[] = [];
  let total = 0;
  for (let i = ultimos.length - 1; i >= 0; i--) {
    total += ultimos[i].length;
    if (total > maxTotal) break;
    out.unshift(ultimos[i]);
  }
  return out;
}

/**
 * Modo "dúvida": pergunta de regras ao Diretor, fora de cena.
 *
 * Mesmo prompt da narração, mais o bloco de juiz que o artifact acrescenta —
 * que troca o narrador por um árbitro: sem tom, sem suspense, sem avançar a
 * cena e, sobretudo, sem marcações entre colchetes. Por isso a resposta NÃO
 * passa pelo ingest(): não é cena, é arbitragem, e nada aqui pode mexer na
 * ficha. As marcações que escaparem são removidas antes de sair daqui.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const era = String(body?.era ?? '');
  if (!ERAS.includes(era)) return Response.json({ error: 'era desconhecida' }, { status: 400 });

  const pergunta = String(body?.pergunta ?? '').slice(0, MAX_CHARS_PERGUNTA).trim();
  if (!pergunta) return Response.json({ error: 'pergunta vazia' }, { status: 400 });

  // Mesma cota da narração: perguntar ao Diretor também gasta tokens.
  const session = await getSession();
  const store = await getStore();
  const subject = session
    ? `user:${session.userId}`
    : `ip:${createHash('sha256')
        .update((req.headers.get('x-forwarded-for') || '0.0.0.0').split(',')[0].trim())
        .digest('hex')}`;
  const limite = Number(
    session ? process.env.DAILY_TURNS_PER_USER || 50 : process.env.DEMO_TURNS_PER_IP || 5,
  );
  let usadas = 0;
  try {
    usadas = await store.bumpQuota(subject, today());
  } catch {
    usadas = 0;
  }
  if (usadas > limite) {
    return Response.json(
      { error: 'quota', message: 'Os arquivos da cidade fecham por hoje. Volte amanhã.' },
      { status: 429 },
    );
  }

  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    const msg = err instanceof LlmConfigError ? err.message : 'narrador não configurado';
    return Response.json({ error: 'config', message: msg }, { status: 503 });
  }

  const { stable, volatile } = buildSystemPrompt({
    era,
    char: body?.char ?? {},
    caso: body?.caso ?? {},
    cena: String(body?.cena ?? ''),
    naCena: limitarTextos(body?.naCena, MAX_NPCS_EM_CENA, 12000),
    npc: null,
    prefs: body?.prefs ?? {},
    book: loadBook(era),
  } as any);

  const history = limitarTextos(body?.history, HISTORY_TURNS, MAX_CHARS_HISTORICO);
  const user =
    `HISTÓRICO RECENTE DA CRÔNICA:\n${history.join('\n') || '(início)'}\n\n` +
    `PERGUNTA DO JOGADOR AO DIRETOR: ${pergunta}`;

  const tier: Tier = body?.prefs?.modeloIA === 'sonnet' ? 'quality' : 'fast';

  try {
    const txt = await provider.complete(
      // O bloco de juiz vai no fim da metade volátil: ele contradiz de propósito
      // as instruções de tom que vêm antes, e precisa ser a última palavra.
      { stable, volatile: volatile + PROMPT_JUIZ, user, maxTokens: MAX_TOKENS, tier },
      req.signal,
    );
    const resposta = (txt || '')
      .replace(/\[[^[\]]{1,240}\]/g, '')
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return Response.json({ resposta });
  } catch (err: any) {
    console.error('[duvida]', err?.message || err);
    return Response.json({ error: 'O Diretor não respondeu.' }, { status: 502 });
  }
}
