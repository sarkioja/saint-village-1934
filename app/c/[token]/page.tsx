import { notFound } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { getStore } from '@/lib/store';
import REGRAS from '@/lib/oracle/data/regras.json';

export const dynamic = 'force-dynamic';

/**
 * Crônica compartilhada por link: somente leitura, sem conta.
 *
 * O que NÃO sai daqui, de propósito:
 *   - `caso.segredo` (a verdade oculta que só o narrador conhece)
 *   - `char.segredo` (o segredo do personagem)
 *   - qualquer ação: a página não tem um único controle
 *
 * O link é revogável: na lista de crônicas, "Fechar link" derruba o acesso
 * para quem já tiver o endereço.
 */
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const store = await getStore();
  const campaignId = await store.resolveShare(token);
  if (!campaignId) notFound();

  const c = await store.getCampaign(campaignId);
  if (!c) notFound();

  const d: any = (c.state as any)?.eras?.[c.era] ?? {};
  const char: any = d.char ?? {};
  const caso: any = d.caso ?? {};
  const log: any[] = Array.isArray(d.log) ? d.log : [];
  const RR: any = (REGRAS as any)[c.era] ?? {};

  const quem = (e: any) => {
    if (e.k === 'narr') return 'Narrador';
    if (e.k === 'npc') return e.who || 'Personagem do Diretor';
    if (e.k === 'action') return char.nome || 'O protagonista';
    if (e.k === 'speech') return (char.nome || 'O protagonista') + (e.to ? ` → ${e.to}` : '');
    return e.who || 'Ficha';
  };

  return (
    <Shell
      right={
        <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sv-dim2,#7f7a72)' }}>
          Somente leitura
        </span>
      }
    >
      <div className="sv-kicker">Arquivo nº SV-{c.era}</div>
      <h1 className="sv-h1">{c.nome}</h1>
      <p className="sv-lede">
        {char.nome ? <strong>{char.nome}</strong> : 'Protagonista sem nome'}
        {char.arq ? ` — ${char.arq}` : ''}
        {caso.titulo ? ` · ${caso.titulo}` : ''}
        {RR.sub ? ` · ${RR.sub}` : ''}
      </p>
      <div className="sv-rule" />

      {caso.premissa && (
        <p
          style={{
            fontFamily: "'Special Elite', monospace",
            fontSize: 16,
            lineHeight: 1.7,
            color: 'var(--sv-ink2,#d8d3c8)',
            maxWidth: 680,
          }}
        >
          {caso.premissa}
        </p>
      )}

      {Array.isArray(caso.pistas) && caso.pistas.length > 0 && (
        <>
          <h2 className="sv-section-title">Caderno de pistas</h2>
          <ul
            style={{
              fontFamily: "'Special Elite', monospace",
              fontSize: 15,
              lineHeight: 1.8,
              color: 'var(--sv-dim,#cfcac0)',
              maxWidth: 680,
              paddingLeft: 20,
            }}
          >
            {caso.pistas.map((p: any) => (
              <li key={p.id}>{p.t}</li>
            ))}
          </ul>
        </>
      )}

      <h2 className="sv-section-title">O diário</h2>
      {log.length === 0 ? (
        <div className="sv-empty">A crônica ainda não começou.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 760 }}>
          {log.map((e: any) => {
            if (!e.text) return null;
            const mech = e.k === 'mech';
            return (
              <div key={e.id}>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: mech ? 'var(--sv-dim2,#7f7a72)' : 'var(--sv-accent2,#d6d1c6)',
                    marginBottom: 6,
                  }}
                >
                  {quem(e)}
                </div>
                <div
                  style={{
                    fontFamily: mech ? "'Oswald', sans-serif" : "'Special Elite', monospace",
                    fontSize: mech ? 13 : 16,
                    lineHeight: 1.75,
                    color: mech ? 'var(--sv-dim2,#7f7a72)' : 'var(--sv-ink2,#d8d3c8)',
                    whiteSpace: 'pre-wrap',
                    textWrap: 'pretty',
                  }}
                >
                  {e.k === 'speech' ? `— ${e.text}` : e.text}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="sv-note">
        Esta é uma crônica solo de <Link href="/">Saint Village XX Century</Link>. Comece a sua.
      </p>
    </Shell>
  );
}
