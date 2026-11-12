import { redirect } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { getSession } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import SECULO from '@/lib/oracle/data/seculo.json';

export const metadata = { title: 'Painel do século · Saint Village XX Century' };
export const dynamic = 'force-dynamic';

const ERAS = ['1934', '1946', '1974', '1994', '1999'];

/**
 * Painel do século: as crônicas da conta posicionadas sobre a cronologia do
 * cânone, com os Laços de Herança que ligam personagens de eras diferentes e as
 * Testemunhas que já apareceram no diário.
 *
 * Os Laços já são gravados pelo jogo (char.lacoEra / char.lacoDe, preenchidos
 * por jumpEra quando o jogador leva o protagonista adiante ou cria um herdeiro).
 */
export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/');

  const store = await getStore();
  const campaigns = await store.listCampaigns(session.userId);

  const S: any = SECULO as any;
  const cronologia: Array<[string, string]> = S.cronologia ?? [];
  const testemunhas: Array<[string, string, string, string]> = S.testemunhas ?? [];

  // Crônicas por era, com o que interessa ao painel.
  const porEra = new Map<string, Array<any>>();
  for (const c of campaigns) {
    const d: any = (c.state as any)?.eras?.[c.era] ?? {};
    const char: any = d.char ?? {};
    const log: any[] = Array.isArray(d.log) ? d.log : [];
    const texto = log.map((e) => String(e.text ?? '')).join(' ');
    porEra.set(c.era, [
      ...(porEra.get(c.era) ?? []),
      {
        id: c.id,
        nome: c.nome,
        personagem: char.nome || '',
        lacoEra: char.lacoEra || '',
        lacoDe: char.lacoDe || '',
        anoNasc: char.anoNasc || '',
        turnos: log.length,
        texto,
      },
    ]);
  }

  // Testemunhas do século que já apareceram em alguma crônica.
  const encontradas = testemunhas.filter(([nome]) =>
    campaigns.some((c) => {
      const d: any = (c.state as any)?.eras?.[c.era] ?? {};
      const log: any[] = Array.isArray(d.log) ? d.log : [];
      return log.some((e) => String(e.text ?? '').includes(nome) || e.who === nome);
    }),
  );

  // Laços de Herança: ligam uma crônica a uma era anterior.
  const lacos = campaigns
    .map((c) => {
      const char: any = ((c.state as any)?.eras?.[c.era] ?? {}).char ?? {};
      return char.lacoEra
        ? { de: char.lacoEra, para: c.era, quem: char.nome || '—', herdadoDe: char.lacoDe || '' }
        : null;
    })
    .filter(Boolean) as Array<{ de: string; para: string; quem: string; herdadoDe: string }>;

  return (
    <Shell
      right={
        <Link
          className="sv-link"
          href="/membro"
          style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}
        >
          Suas crônicas
        </Link>
      }
    >
      <div className="sv-kicker">Edição Omni</div>
      <h1 className="sv-h1">O século</h1>
      <p className="sv-lede">
        A mesma cidade ao longo de cem anos. Onde suas crônicas caem na cronologia, quem herdou o quê
        de quem, e quais Testemunhas já cruzaram o seu caminho.
      </p>
      <div className="sv-rule" />

      <h2 className="sv-section-title">Linha do tempo</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ERAS.map((era) => {
          const minhas = porEra.get(era) ?? [];
          const eventos = cronologia.filter(([ano]) => {
            const a = Number(ano);
            const i = ERAS.indexOf(era);
            const anterior = i > 0 ? Number(ERAS[i - 1]) : 0;
            return a > anterior && a <= Number(era);
          });
          return (
            <section
              key={era}
              className="sv-card"
              style={{
                borderTop: minhas.length
                  ? '2px solid var(--sv-accent2,#d6d1c6)'
                  : '2px solid #2a2622',
                opacity: minhas.length ? 1 : 0.62,
              }}
            >
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'baseline' }}>
                <div className="sv-card-era">{era}</div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  {minhas.length === 0 ? (
                    <div className="sv-card-meta">Nenhuma crônica aqui ainda.</div>
                  ) : (
                    minhas.map((m) => (
                      <div key={m.id} className="sv-card-meta" style={{ marginBottom: 4 }}>
                        <Link className="sv-link" href={`/jogar/${m.id}`}>
                          {m.nome}
                        </Link>
                        {m.personagem && ` — ${m.personagem}`}
                        {m.anoNasc && ` (nascido em ${m.anoNasc})`}
                        {m.turnos ? ` · ${m.turnos} entradas` : ''}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {eventos.length > 0 && (
                <ul
                  style={{
                    margin: '6px 0 0',
                    paddingLeft: 18,
                    fontFamily: "'Special Elite', monospace",
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: 'var(--sv-dim2,#7f7a72)',
                  }}
                >
                  {eventos.map(([ano, texto]) => (
                    <li key={ano}>
                      <b style={{ color: 'var(--sv-dim,#9b9488)' }}>{ano}</b> — {texto}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <h2 className="sv-section-title">Laços de Herança</h2>
      {lacos.length === 0 ? (
        <div className="sv-empty">
          Nenhum laço ainda.
          <br />
          Na Ficha, leve o mesmo protagonista para uma era posterior — ele envelhece — ou crie um
          herdeiro que recebe o testamento.
        </div>
      ) : (
        <div className="sv-grid">
          {lacos.map((l, i) => (
            <div key={i} className="sv-card">
              <div className="sv-card-top">
                <span>{l.de}</span>
                <span>→ {l.para}</span>
              </div>
              <div className="sv-card-name">{l.quem}</div>
              <div className="sv-card-meta">
                {l.herdadoDe ? `Herdou de ${l.herdadoDe}.` : 'O mesmo protagonista, mais velho.'}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="sv-section-title">
        Testemunhas do século{' '}
        <span style={{ fontSize: 15, color: 'var(--sv-dim2,#7f7a72)' }}>
          {encontradas.length} de {testemunhas.length}
        </span>
      </h2>
      <div className="sv-grid">
        {testemunhas.map(([nome, papel, viu, carrega]) => {
          const achou = encontradas.some(([n]) => n === nome);
          return (
            <div
              key={nome}
              className="sv-card"
              style={{
                opacity: achou ? 1 : 0.45,
                borderTop: achou ? '2px solid var(--sv-accent,#b0281f)' : '2px solid #2a2622',
              }}
            >
              <div className="sv-card-top">
                <span>{papel}</span>
                <span>{achou ? 'Encontrada' : '—'}</span>
              </div>
              <div className="sv-card-name">{nome}</div>
              {achou && (
                <div className="sv-card-meta">
                  Viu {viu}. Carrega {carrega}.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
