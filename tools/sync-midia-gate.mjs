// Espelha a mídia de public/ ao lado de source/original-v2.html, para o gate.
//
//   node tools/sync-midia-gate.mjs
//
// O artifact original referencia fundos, trilha e efeitos por caminho RELATIVO
// (`fundos/bar.jpg`), que no `file://` do gate resolve ao lado do HTML. O app
// os serve por caminho absoluto a partir de public/. Sem este espelho, o lado
// original ficaria com 404 e fundo preto enquanto o app mostra a foto — e o
// gate acusaria uma divergência que não existe no porte.
//
// Os arquivos espelhados NÃO vão para o git (ver .gitignore): são cópia byte a
// byte do que já está versionado em public/, e duplicar 70 MB no histórico por
// conveniência de teste seria caro e inútil.

import { readdirSync, copyFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const PASTAS = ['fundos', 'musica', 'sons'];
const SOLTOS = ['fundo-eras.png'];

let copiados = 0;
let iguais = 0;

const espelha = (de, para) => {
  if (existsSync(para) && statSync(para).size === statSync(de).size) {
    iguais++;
    return;
  }
  copyFileSync(de, para);
  copiados++;
};

for (const pasta of PASTAS) {
  const origem = path.join('public', pasta);
  if (!existsSync(origem)) continue;
  mkdirSync(path.join('source', pasta), { recursive: true });
  for (const f of readdirSync(origem)) {
    espelha(path.join(origem, f), path.join('source', pasta, f));
  }
}

for (const f of SOLTOS) {
  if (existsSync(path.join('public', f))) espelha(path.join('public', f), path.join('source', f));
}

console.log(`espelho do gate: ${copiados} copiados, ${iguais} já iguais -> source/{fundos,musica,sons}`);
