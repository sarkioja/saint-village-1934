import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import PlayClient from '@/components/PlayClient';

export const dynamic = 'force-dynamic';

/**
 * Jogo ligado a uma cronica da conta. O estado inicial e' carregado no servidor
 * e entregue ao componente, que daqui para frente grava pela API.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/entrar');

  const store = await getStore();
  const c = await store.getCampaign(id);
  if (!c || c.userId !== session.userId) notFound();

  const user = await store.getUser(session.userId);

  return (
    <PlayClient
      campaignId={c.id}
      rev={c.rev}
      initial={c.state as any}
      prefs={user?.prefs ?? {}}
    />
  );
}
