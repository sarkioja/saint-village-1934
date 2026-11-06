'use client';

import Script from 'next/script';

/**
 * Trilha ambiente do designer.
 *
 * public/sv_audio.js é o módulo do artifact copiado verbatim (ver
 * tools/sync-audio.mjs): uma IIFE que monta o player fixo no canto, guardada
 * por window.__svSom, então carregá-la duas vezes não duplica nada.
 *
 * Vai como script solto, e não como componente React, de propósito: ele desenha
 * parte da interface que o gate de pixels compara, e reescrevê-lo em JSX seria
 * abrir mão dessa garantia sem ganhar nada.
 *
 * Os MP3s ainda não existem em public/musica — o artifact também não os traz.
 * O player aparece e responde; o som entra quando os arquivos chegarem.
 */
export default function TrilhaAmbiente() {
  return <Script src="/sv_audio.js" strategy="afterInteractive" />;
}
