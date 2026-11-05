'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Progresso = {
  personagem: string;
  caso: string;
  turnos: number;
  pistas: number;
  peso: number;
  pesoNecessario: number;
  saude?: number;
  sangueFrio?: number;
  impulsos?: number;
};

type Campaign = {
  id: string;
  era: string;
  nome: string;
  updatedAt: string;
  progresso: Progresso;
};

/** Link público ativo por crônica, carregado sob demanda. */
type Links = Record<string, string | null>;

const ERAS: Array<[string, string]> = [
  ['1934', 'Lei Seca'],
  ['1946', 'Pós-guerra'],
  ['1974', 'Conspiração'],
  ['1994', 'Néon e pó'],
  ['1999', 'Epílogo do século'],
];

function quando(iso: string): string {
  const d = new Date(iso);
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  return d.toLocaleDateString('pt-BR');
}

export default function CampaignList() {
  const router = useRouter();
  const [list, setList] = useState<Campaign[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [links, setLinks] = useState<Links>({});

  async function carregar() {
    try {
      const res = await fetch('/api/campaigns');
      if (res.status === 401) {
        router.push('/entrar');
        return;
      }
      const j = await res.json();
      const campanhas: Campaign[] = j.campaigns ?? [];
      setList(campanhas);

      // Quais crônicas estão compartilhadas agora. Sem isso não há como a
      // pessoa saber o que está público, nem revogar.
      const estado: Links = {};
      await Promise.all(
        campanhas.map(async (c) => {
          try {
            const r = await fetch(`/api/campaigns/${c.id}/share`);
            const d = await r.json();
            estado[c.id] = d.shares?.[0]?.url ?? null;
          } catch {
            estado[c.id] = null;
          }
        }),
      );
      setLinks(estado);
    } catch {
      setErro('Não foi possível ler suas crônicas.');
    }
  }

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function criar(era: string) {
    if (criando) return;
    setCriando(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ era }),
      });
      const j = await res.json();
      if (res.ok && j.id) router.push(`/jogar/${j.id}`);
      else setErro(j.error || 'Não foi possível abrir a crônica.');
    } finally {
      setCriando(false);
    }
  }

  async function renomear(c: Campaign) {
    const nome = window.prompt('Nome da crônica', c.nome);
    if (!nome || nome.trim() === c.nome) return;
    await fetch(`/api/campaigns/${c.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: nome.trim() }),
    });
    void carregar();
  }

  async function copiar(url: string, aviso: boolean) {
    const completa = location.origin + url;
    try {
      await navigator.clipboard.writeText(completa);
      window.alert(
        'Link copiado:\n\n' +
          completa +
          (aviso
            ? '\n\nQuem abrir vê a crônica e a ficha, mas não a verdade oculta do caso nem o segredo do personagem.'
            : ''),
      );
    } catch {
      window.prompt('Link somente-leitura desta crônica:', completa);
    }
  }

  async function compartilhar(c: Campaign) {
    const res = await fetch(`/api/campaigns/${c.id}/share`, { method: 'POST' });
    const j = await res.json();
    if (!res.ok || !j.url) {
      setErro('Não foi possível criar o link.');
      return;
    }
    setLinks((l) => ({ ...l, [c.id]: j.url }));
    await copiar(j.url, true);
  }

  async function revogar(c: Campaign) {
    if (
      !window.confirm(
        'Fechar o link público desta crônica? Quem já tiver o endereço deixa de conseguir abrir.',
      )
    ) {
      return;
    }
    const res = await fetch(`/api/campaigns/${c.id}/share`, { method: 'DELETE' });
    if (!res.ok) {
      setErro('Não foi possível fechar o link.');
      return;
    }
    setLinks((l) => ({ ...l, [c.id]: null }));
  }

  async function apagar(c: Campaign) {
    const alvo = c.progresso.personagem || c.nome;
    if (
      !window.confirm(
        `Arquivar para sempre a crônica de ${c.era}${alvo ? ` (${alvo})` : ''}? ` +
          'O diário, a ficha e o caso vão embora com ela.',
      )
    ) {
      return;
    }
    await fetch(`/api/campaigns/${c.id}`, { method: 'DELETE' });
    void carregar();
  }

  if (erro) return <div className="sv-error">{erro}</div>;
  if (!list) return <div className="sv-empty">Abrindo os arquivos da cidade…</div>;

  return (
    <>
      <h2 className="sv-section-title">Suas crônicas</h2>

      {list.length === 0 ? (
        <div className="sv-empty">
          Nenhuma crônica aberta ainda.
          <br />
          Escolha uma era abaixo e o narrador abre o dossiê.
        </div>
      ) : (
        <div className="sv-grid">
          {list.map((c) => (
            <article key={c.id} className="sv-card">
              <div className="sv-card-top">
                <span>{ERAS.find(([e]) => e === c.era)?.[1] ?? c.era}</span>
                <span>{quando(c.updatedAt)}</span>
              </div>
              <div className="sv-card-era">{c.era}</div>
              <div className="sv-card-name">{c.nome}</div>

              <div className="sv-card-meta">
                {c.progresso.personagem ? (
                  <>
                    <b>{c.progresso.personagem}</b>
                    {c.progresso.caso ? ` · ${c.progresso.caso}` : ' · sem caso aberto'}
                  </>
                ) : (
                  'Ficha ainda em branco.'
                )}
              </div>

              <div className="sv-stats">
                <span>
                  Diário <b>{c.progresso.turnos}</b>
                </span>
                <span>
                  Pistas <b>{c.progresso.pistas}</b>
                </span>
                <span>
                  Peso{' '}
                  <b>
                    {c.progresso.peso}/{c.progresso.pesoNecessario}
                  </b>
                </span>
                {typeof c.progresso.saude === 'number' && (
                  <span>
                    Saúde <b>{c.progresso.saude}</b>
                  </span>
                )}
                {typeof c.progresso.sangueFrio === 'number' && (
                  <span>
                    Sangue-Frio <b>{c.progresso.sangueFrio}</b>
                  </span>
                )}
                {typeof c.progresso.impulsos === 'number' && (
                  <span>
                    Impulsos <b>{c.progresso.impulsos}</b>
                  </span>
                )}
              </div>

              <div className="sv-card-actions">
                <Link className="sv-btn" href={`/jogar/${c.id}`}>
                  Continuar
                </Link>
                <button className="sv-btn-ghost" onClick={() => renomear(c)}>
                  Renomear
                </button>
                <a className="sv-btn-ghost" href={`/api/export/${c.id}`}>
                  Exportar
                </a>
                {links[c.id] ? (
                  <>
                    <button className="sv-btn-ghost" onClick={() => copiar(links[c.id]!, false)}>
                      Copiar link
                    </button>
                    <button className="sv-btn-danger" onClick={() => revogar(c)}>
                      Fechar link
                    </button>
                  </>
                ) : (
                  <button className="sv-btn-ghost" onClick={() => compartilhar(c)}>
                    Compartilhar
                  </button>
                )}
                <button className="sv-btn-danger" onClick={() => apagar(c)}>
                  Arquivar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <h2 className="sv-section-title">Abrir uma crônica nova</h2>
      <div className="sv-grid">
        {ERAS.map(([era, sub]) => (
          <button
            key={era}
            className="sv-card"
            onClick={() => criar(era)}
            disabled={criando}
            style={{ cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit' }}
          >
            <div className="sv-card-top">
              <span>{sub}</span>
              <span>
                {list.filter((c) => c.era === era).length || 0} em curso
              </span>
            </div>
            <div className="sv-card-era">{era}</div>
            <div className="sv-card-actions">
              <span className="sv-btn-ghost">Abrir o dossiê →</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
