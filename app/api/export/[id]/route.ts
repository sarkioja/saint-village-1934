import { NextRequest } from 'next/server';
import { getStore } from '@/lib/store';
import { getSession } from '@/lib/auth/session';
import { exportMarkdown, exportFilename } from '@/lib/server/export';

export const runtime = 'nodejs';

/** Baixa a cronica inteira como dossie em Markdown. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return Response.json({ error: 'nao autenticado' }, { status: 401 });

  const store = await getStore();
  const c = await store.getCampaign(id);
  if (!c || c.userId !== session.userId) {
    return Response.json({ error: 'nao encontrada' }, { status: 404 });
  }

  const md = exportMarkdown({ nome: c.nome, era: c.era, state: c.state });
  return new Response(md, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'content-disposition': `attachment; filename="${exportFilename(c.nome, c.era)}"`,
    },
  });
}
