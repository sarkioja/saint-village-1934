'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Único elemento que este app acrescenta à interface do artifact.
 *
 * E' `position: fixed`, portanto esta' FORA do fluxo: nao desloca um pixel do
 * layout original. O gate de fidelidade (tests/pixel) o esconde por CSS, de
 * modo que a comparacao com o HTML original continua cobrindo a pagina inteira.
 * Se algum dia ele deixar de ser fixed, o gate acusa na hora.
 */
export default function AccountChip() {
  const [nome, setNome] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetch('/api/me')
      .then((r) => r.json())
      .then((j) => {
        if (!vivo) return;
        setNome(j?.user ? j.user.nome || j.user.email.split('@')[0] : null);
        setPronto(true);
      })
      .catch(() => vivo && setPronto(true));
    return () => {
      vivo = false;
    };
  }, []);

  if (!pronto) return null;

  return (
    <div
      data-sv-account=""
      style={{
        position: 'fixed',
        right: 14,
        bottom: 14,
        zIndex: 50,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        fontFamily: "'Oswald', sans-serif",
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      {nome ? (
        <Link
          href="/membro"
          style={{
            background: 'rgba(11,10,9,0.92)',
            border: '1px solid var(--sv-line2, #3a3631)',
            color: 'var(--sv-ink, #ebe5d6)',
            padding: '8px 13px',
            textDecoration: 'none',
          }}
        >
          {nome}
        </Link>
      ) : (
        <>
          <Link
            href="/entrar"
            style={{
              background: 'rgba(11,10,9,0.92)',
              border: '1px solid var(--sv-line2, #3a3631)',
              color: 'var(--sv-dim, #9b9488)',
              padding: '8px 13px',
              textDecoration: 'none',
            }}
          >
            Entrar
          </Link>
          <Link
            href="/cadastrar"
            style={{
              background: 'var(--sv-ink, #ebe5d6)',
              border: '1px solid var(--sv-ink, #ebe5d6)',
              color: 'var(--sv-bg, #0b0a09)',
              padding: '8px 13px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Salvar progresso
          </Link>
        </>
      )}
    </div>
  );
}
