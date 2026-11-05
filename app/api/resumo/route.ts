import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { ERAS } from '@/lib/server/book';
import { getProvider, LlmConfigError } from '@/lib/llm';
import { getStore, today } from '@/lib/store';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_ITENS = 40;
const MAX_CHARS_POR_ENTRADA = 4000;
const MAX_CHARS_HISTORICO = 40000;
const MAX_CHARS_ANTERIOR = 2000;
/** Teto do resumo devolvido: cabe no prompt de todo turno seguinte. */
const MAX_CHARS_RESUMO = 1200;

function limitarTextos(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const ultimos = v.slice(-MAX_ITENS).map((x) => String(x).slice(0, MAX_CHARS_POR_ENTRADA));
  const out: string[] = [];
  let total = 0;
  for (let i = ultimos.length - 1; i >= 0; i--) {
    total += ultimos[i].length;
    if (total > MAX_CHARS_HISTORICO) break;
    out.unshift(ultimos[i]);
  }
  return out;
}

/**
 * Memória longa da crônica.
 *
 * O cliente chama a cada 12 turnos narrativos e guarda o parágrafo no caso; o
 * prompt do narrador passa a levar resumo + histórico recente em vez de só as
 * últimas entradas. Sem isso, uma crônica longa esquece o próprio começo: a
 * janela de 18 entradas rola para fora e o narrador contradiz o que ele mesmo
 * narrou.
 *
 * Não depende do texto do livro — é só releitura do que já aconteceu — e por
 * isso é um prompt curto e barato, sempre no tier rápido.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const era = String(body?.era ?? '');
  if (!ERAS.includes(era)) return Response.json({ error: 'era desconhecida' }, { status: 400 });

  const history = limitarTextos(body?.history);
  if (history.length < 4) return Response.json({ resumo: '' });
  const anterior = String(body?.anterior ?? '').slice(0, MAX_CHARS_ANTERIOR);

  // Cota própria, separada da narração. Resumir é automático: o jogador não
  // pediu, e cobrá-lo dos turnos do dia tiraria dele o que ele pediu. Mas custa
  // tokens, então tem teto — generoso, porque o cliente só chama de 12 em 12
  // turnos, e estreito o bastante para um cliente adulterado não virar torneira.
  const session = await getSession();
  const store = await getStore();
  const quem = session
    ? `user:${session.userId}`
    : `ip:${createHash('sha256')
        .update((req.headers.get('x-forwarded-for') || '0.0.0.0').split(',')[0].trim())
        .digest('hex')}`;
  const turnos = Number(
    session ? process.env.DAILY_TURNS_PER_USER || 50 : process.env.DEMO_TURNS_PER_IP || 5,
  );
  const teto = Math.ceil(turnos / 6) + 2;
  try {
    if ((await store.bumpQuota('resumo:' + quem, today())) > teto) {
      return Response.json({ resumo: '' });
    }
  } catch {
    /* sem cota legível, segue: o teto é proteção de custo, não de correção */
  }

  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    const msg = err instanceof LlmConfigError ? err.message : 'narrador não configurado';
    return Response.json({ error: 'config', message: msg }, { status: 503 });
  }

  const system =
    'Você resume uma crônica de RPG noir solo para a memória do narrador. ' +
    'Escreva UM parágrafo em português do Brasil, no máximo 150 palavras, em terceira pessoa, ' +
    'só com fatos: quem apareceu, o que foi descoberto, o que ficou pendente, onde a história parou. ' +
    'Não invente nada, não opine, não use markdown, não escreva marcações entre colchetes.';

  const user =
    (anterior ? `RESUMO ATÉ AQUI (incorpore e atualize):\n${anterior}\n\n` : '') +
    `TRECHOS RECENTES DA CRÔNICA:\n${history.join('\n')}`;

  try {
    const txt = await provider.complete(
      { stable: system, volatile: '', user, maxTokens: 400, tier: 'fast' },
      req.signal,
    );
    const resumo = (txt || '')
      .replace(/\[[^[\]]{1,240}\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_CHARS_RESUMO);
    return Response.json({ resumo });
  } catch (err: any) {
    console.error('[resumo]', err?.message || err);
    // O resumo é melhoria, não requisito: falhar aqui não pode atrapalhar a cena.
    return Response.json({ resumo: '' });
  }
}
