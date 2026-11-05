import Link from 'next/link';
import '@/app/membro/membro.css';

/**
 * Moldura das telas fora do jogo. Mesma linguagem visual do dossie da tela de
 * selecao de era, com as fontes e a paleta do artifact.
 */
export default function Shell({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="sv-shell">
      <header className="sv-topbar">
        <Link href="/" className="sv-wordmark">
          Saint Village<span>XX Century</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {right}
          <span className="sv-stamp">Confidencial</span>
        </div>
      </header>
      <main className="sv-main">{children}</main>
      <footer className="sv-footer">
        Baseado em Saint Village XX Century, de Felipe Malorgio · GUMSHOE SRD (CC-BY 3.0)
      </footer>
    </div>
  );
}
