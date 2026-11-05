import { NextRequest } from 'next/server';
import { accountsEnabled, ACCOUNTS_OFF_MESSAGE } from '@/lib/store/availability';
import { getStore } from '@/lib/store';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';

/** Lista as cronicas da conta, com o progresso derivado do proprio estado. */
export async function GET() {
  if (!accountsEnabled()) {
    return Response.json({ error: 'accounts_off', message: ACCOUNTS_OFF_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) return Response.json({ error: 'nao autenticado' }, { status: 401 });

  const store = await getStore();
  const list = await store.listCampaigns(session.userId);

  return Response.json({
    campaigns: list.map((c) => {
      const era = (c.state as any)?.eras?.[c.era] ?? {};
      const char = era.char ?? {};
      const caso = era.caso ?? {};
      const provas = Array.isArray(caso.provas) ? caso.provas : [];
      return {
        id: c.id,
        era: c.era,
        nome: c.nome,
        rev: c.rev,
        updatedAt: c.updatedAt,
        // Progresso: o suficiente para o cartao da area de membro.
        progresso: {
          personagem: char.nome || '',
          caso: caso.titulo || '',
          turnos: Array.isArray(era.log) ? era.log.length : 0,
          pistas: Array.isArray(caso.pistas) ? caso.pistas.length : 0,
          peso: provas.reduce((a: number, p: any) => a + (Number(p?.peso) || 0), 0),
          pesoNecessario: Number(caso.nec) || 4,
          saude: char.saude,
          sangueFrio: char.sf,
          impulsos: char.imp,
        },
      };
    }),
  });
}

/** Cria uma cronica. Aceita um estado inicial (usado ao importar o save da demo). */
export async function POST(req: NextRequest) {
  if (!accountsEnabled()) {
    return Response.json({ error: 'accounts_off', message: ACCOUNTS_OFF_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) return Response.json({ error: 'nao autenticado' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const era = String(body?.era ?? '');
  if (!/^(1934|1946|1974|1994|1999)$/.test(era)) {
    return Response.json({ error: 'era invalida' }, { status: 400 });
  }
  const nome = (String(body?.nome ?? '').trim() || `Crônica de ${era}`).slice(0, 80);
  const state = body?.state && typeof body.state === 'object' ? body.state : { era, tab: 'tutorial', eras: {} };

  const store = await getStore();
  const c = await store.createCampaign(session.userId, era, nome, state);
  return Response.json({ id: c.id, era: c.era, nome: c.nome, rev: c.rev });
}
