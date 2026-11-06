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
/**
 * Altura que o player da trilha ocupa a partir da base da janela, incluindo o
 * afastamento dele.
 *
 * O player (`.svs`, do sv_audio.js do designer) e' `position: fixed` no mesmo
 * canto que este chip e tem `z-index: 70` contra 50 — ou seja, cobria os botoes
 * de entrar e cadastrar. O chip e' a adicao deste projeto, entao quem sai da
 * frente e' ele.
 *
 * Medido em runtime, e nao com um deslocamento fixo, porque a altura do player
 * muda: ele tem botao de minimizar, e abaixo de 640px vira uma faixa de largura
 * total mais alta. Um numero chutado aqui acertaria num tamanho de tela e
 * erraria nos outros.
 */
function useLugarDoChip(): { top: number } | null {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // O chip aparece SO' na tela de escolha de era, que e' a unica sem
    // cabecalho (`.sv-hdr`) e a unica com um canto livre.
    //
    // Em jogo nao ha' canto livre, e foi medido: no canto inferior direito o
    // player da trilha do designer (`position: fixed`, z-index 70 contra 50)
    // cobria os botoes de entrar e cadastrar; subindo acima dele, o chip passa
    // a cobrir o contador de Impulsos no desktop e o botao Enviar do
    // compositor no celular. Tapar um controle e' pior que o defeito original,
    // e empilhar o chip sobre a prosa da cronica e' feio sem resolver.
    //
    // Entao em jogo ele some. O acesso a' conta continua a um clique: "Trocar
    // era" volta para a tela onde ele esta'.
    const medir = () => setVisivel(!document.querySelector('.sv-hdr'));
    const mo = new MutationObserver(medir);
    mo.observe(document.body, { childList: true, subtree: true });
    medir();
    return () => mo.disconnect();
  }, []);

  return visivel ? { top: 14 } : null;
}

export default function AccountChip() {
  const [nome, setNome] = useState<string | null>(null);
  const [ligado, setLigado] = useState(true);
  const [pronto, setPronto] = useState(false);
  const lugar = useLugarDoChip();

  useEffect(() => {
    let vivo = true;
    fetch('/api/me')
      .then((r) => r.json())
      .then((j) => {
        if (!vivo) return;
        setNome(j?.user ? j.user.nome || j.user.email.split('@')[0] : null);
        if (j && j.accountsEnabled === false) setLigado(false);
        setPronto(true);
      })
      .catch(() => vivo && setPronto(true));
    return () => {
      vivo = false;
    };
  }, []);

  // Sem backend duravel configurado, nao ha' conta a oferecer.
  if (!pronto || !ligado || !lugar) return null;

  return (
    <div
      data-sv-account=""
      style={{
        position: 'fixed',
        right: 14,
        ...lugar,
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
