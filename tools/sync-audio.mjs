// Publica a trilha ambiente do designer em public/sv_audio.js.
//
//   node tools/sync-audio.mjs
//
// O módulo é uma IIFE que monta o player direto no DOM — nada de React, nada de
// template. Copiá-lo verbatim é o porte de menor risco possível: o player é
// parte do layout que o gate de pixels compara, e reescrevê-lo em JSX seria
// trocar uma garantia por um risco sem ganho nenhum.
//
// A ÚNICA mudança são os dois caminhos relativos. No artifact a página era um
// arquivo solto e 'musica/x.mp3' resolvia ao lado dele; no app a mesma string
// resolveria contra a rota (em /jogar/<id> viraria /jogar/musica/x.mp3). Os
// dois viram absolutos, e a troca é verificada: se o designer renomear a
// variável, este script falha em vez de publicar um player mudo.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ORIGEM = 'source/sv_audio.js';
if (!existsSync(ORIGEM)) {
  console.log('sem source/sv_audio.js — este artifact não traz a trilha ambiente');
  process.exit(0);
}

let js = readFileSync(ORIGEM, 'utf8');

const TROCAS = [
  ["var M = 'musica/';", "var M = '/musica/';"],
  ["new Audio('sons/papel.mp3')", "new Audio('/sons/papel.mp3')"],
];

for (const [de, para] of TROCAS) {
  if (!js.includes(de)) throw new Error('caminho não encontrado em sv_audio.js: ' + de);
  js = js.split(de).join(para);
}

const relativos = [...js.matchAll(/['"](?!\/)(?:musica|sons|fundos)\/[^'"]*['"]/g)].map((m) => m[0]);
if (relativos.length) {
  throw new Error('sobrou caminho relativo de mídia: ' + [...new Set(relativos)].join(', '));
}

writeFileSync(
  'public/sv_audio.js',
  '/* GENERATED por tools/sync-audio.mjs a partir de source/sv_audio.js.\n' +
    '   Verbatim, exceto os caminhos de mídia, que viraram absolutos. */\n' +
    js,
);

console.log('trilha ambiente: public/sv_audio.js', `(${(js.length / 1024).toFixed(0)} KB, ${TROCAS.length} caminhos absolutizados)`);
