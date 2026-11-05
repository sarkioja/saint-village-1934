// Leva os assets desempacotados de source/assets para public/.
//
//   node tools/sync-assets.mjs
//
// Recria public/fonts do zero a cada execução: o artifact nomeia os arquivos por
// UUID, e cada exportação gera UUIDs novos. Sem limpar, as fontes da versão
// anterior ficariam para trás — peso morto que nada referencia e que esconde
// um arquivo que de fato sumiu.
//
// As imagens grandes (city.png, map.svg) são identificadas por conteúdo, não
// por nome, pelo mesmo motivo.

import { readdirSync, copyFileSync, mkdirSync, rmSync, statSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ORIGEM = 'source/assets';
if (!existsSync(ORIGEM)) {
  console.error('source/assets não existe — rode tools/extract-artifact.mjs antes.');
  process.exit(2);
}

const arquivos = readdirSync(ORIGEM);

// ---- fontes ----------------------------------------------------------------
rmSync('public/fonts', { recursive: true, force: true });
mkdirSync('public/fonts', { recursive: true });

let fontes = 0;
for (const f of arquivos) {
  if (!f.endsWith('.woff2')) continue;
  copyFileSync(path.join(ORIGEM, f), path.join('public/fonts', f));
  fontes++;
}

// ---- imagens ---------------------------------------------------------------
// Dois assets grandes: a fotografia da cidade (PNG) e o mapa (SVG). Os nomes
// de destino são estáveis porque o CSS e o markup os referenciam por eles.
mkdirSync('public/assets', { recursive: true });
const destinos = [];
// Mapa UUID -> caminho servido, para o transpilador e o extrator de CSS.
// Gerado aqui em vez de ficar fixo no codigo: cada exportacao do artifact gera
// UUIDs novos, e uma tabela escrita a mao quebra silenciosamente a cada rodada.
const mapa = {};
for (const f of arquivos) {
  const origem = path.join(ORIGEM, f);
  const uuid = f.replace(/\.[^.]+$/, '');
  if (f.endsWith('.png')) {
    copyFileSync(origem, 'public/assets/city.png');
    mapa[uuid] = '/assets/city.png';
    destinos.push(`city.png (${(statSync(origem).size / 1048576).toFixed(1)} MB)`);
  } else if (f.endsWith('.svg')) {
    copyFileSync(origem, 'public/assets/map.svg');
    mapa[uuid] = '/assets/map.svg';
    destinos.push(`map.svg (${(statSync(origem).size / 1048576).toFixed(1)} MB)`);
  } else if (f.endsWith('.woff2')) {
    mapa[uuid] = `/fonts/${f}`;
  }
}
writeFileSync('source/asset-map.json', JSON.stringify(mapa, null, 1));

// ---- pastas de mídia que o artifact não traz -------------------------------
// Criadas vazias para que os caminhos existam e um arquivo solto depois caia
// no lugar certo sem mais nenhuma mudança.
for (const d of ['public/fundos', 'public/musica', 'public/sons']) {
  mkdirSync(d, { recursive: true });
}

console.log('fontes  :', fontes, '-> public/fonts');
console.log('imagens :', destinos.join(', ') || '(nenhuma)');
console.log('mapa    : source/asset-map.json com', Object.keys(mapa).length, 'entradas');
console.log('pastas  : public/fundos, public/musica, public/sons (prontas para a mídia que falta)');
