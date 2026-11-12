import { redirect } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/components/Shell';
import CampaignList from '@/components/CampaignList';
import Prefs from '@/components/Prefs';
import LogoutButton from '@/components/LogoutButton';
import { getSession } from '@/lib/auth/session';
import { getStore } from '@/lib/store';

export const metadata = { title: 'Sua ficha · Saint Village XX Century' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/');

  const store = await getStore();
  const user = await store.getUser(session.userId);
  if (!user) redirect('/');

  return (
    <Shell
      right={
        <>
          <Link className="sv-link" href="/seculo" style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Painel do século
          </Link>
          <LogoutButton />
        </>
      }
    >
      <div className="sv-kicker">Arquivo pessoal</div>
      <h1 className="sv-h1">{user.nome || user.email.split('@')[0]}</h1>
      <p className="sv-lede">
        Cinco eras, a mesma cidade. Cada crônica guarda sua ficha, o caso aberto e o caderno de
        pistas.
      </p>

      <CampaignList />

      <h2 className="sv-section-title">O narrador</h2>
      <Prefs initial={user.prefs} />
    </Shell>
  );
}
