import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { loadBook, ERAS } from '@/lib/server/book';
import { getProvider, LlmConfigError, type Tier } from '@/lib/llm';
import { getStore, today } from '@/lib/store';
import { getSession } from '@/lib/auth/session';
import REGRAS from '@/lib/oracle/data/regras.json';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Gerador de Personagem do Diretor.
 *
 * Mesmo prompt do artifact original (linha 549 de source/component.js), movido
 * para o servidor porque depende do texto do livro. Resposta JSON, sem stream.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const era = String(body?.era ?? '');
  if (!ERAS.includes(era)) return Response.json({ error: 'era desconhecida' }, { status: 400 });

  const cena = String(body?.cena ?? '');
  const evitar: string[] = Array.isArray(body?.evitar) ? body.evitar.map(String).slice(-40) : [];

  // Mesma cota da narracao: gerar PdD tambem gasta tokens.
  const session = await getSession();
  const store = await getStore();
  const subject = session
    ? `user:${session.userId}`
    : `ip:${createHash('sha256')
        .update((req.headers.get('x-forwarded-for') || '0.0.0.0').split(',')[0].trim())
        .digest('hex')}`;
  const limit = Number(
    session ? process.env.DAILY_TURNS_PER_USER || 50 : process.env.DEMO_TURNS_PER_IP || 5,
  );
  let used = 0;
  try {
    used = await store.bumpQuota(subject, today());
  } catch {
    used = 0;
  }
  if (used > limit) {
    return Response.json(
      { error: 'quota', message: 'Os arquivos da cidade fecham por hoje. Volte amanhã.' },
      { status: 429 },
    );
  }

  const RR: any = (REGRAS as any)[era];
  const book = loadBook(era);
  const trecho = (book.textos[cena] || book.geral).slice(0, 6000);

  // Texto do prompt copiado do artifact original.
  const system =
    `Crie um Personagem do Diretor original para ${RR.titulo}, coerente com o livro. ` +
    `Região: ${cena || 'à sua escolha'}. Trecho do livro:\n${trecho}\n` +
    `Todo PdD tem quatro linhas: virtude, pecado, quer, teme. ` +
    `Responda SOMENTE JSON: {"n":"nome","p":"papel, idade","d":"duas frases","v":"","pe":"","q":"","t":""}`;

  const tier: Tier = body?.prefs?.modeloIA === 'sonnet' ? 'quality' : 'fast';

  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    const msg = err instanceof LlmConfigError ? err.message : 'narrador não configurado';
    return Response.json({ error: 'config', message: msg }, { status: 503 });
  }

  try {
    const txt = await provider.complete(
      {
        stable: system,
        volatile: '',
        user: 'Novo personagem, diferente destes: ' + evitar.join(', '),
        maxTokens: 500,
        tier,
      },
      req.signal,
    );

    // Mesma extracao tolerante do original: pega do primeiro { ao ultimo }.
    const a = txt.indexOf('{');
    const b = txt.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('resposta sem JSON');
    const npc = JSON.parse(txt.slice(a, b + 1));
    if (!npc || typeof npc.n !== 'string' || !npc.n.trim()) throw new Error('JSON sem nome');

    return Response.json({
      npc: {
        n: String(npc.n).slice(0, 80),
        p: String(npc.p ?? '').slice(0, 120),
        d: String(npc.d ?? '').slice(0, 500),
        v: String(npc.v ?? '').slice(0, 120),
        pe: String(npc.pe ?? '').slice(0, 120),
        q: String(npc.q ?? '').slice(0, 120),
        t: String(npc.t ?? '').slice(0, 120),
      },
    });
  } catch (err: any) {
    console.error('[npc]', err?.message || err);
    return Response.json({ error: 'Não foi possível gerar o NPC.' }, { status: 502 });
  }
}
