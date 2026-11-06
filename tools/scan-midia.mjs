// Inventário da mídia que o artifact NÃO empacota.
//
//   node tools/scan-midia.mjs
//
// O designer referencia fundos, música e efeitos por caminho; nada disso vem no
// bundle. tools/extract-artifact.mjs já lista as referências em
// source/midia-externa.json; aqui elas são conferidas contra public/ e o
// resultado vai para lib/server/midia.json, que /api/health publica.
//
// Serve para uma pergunta que só aparece em produção: "o fundo não apareceu — o
// arquivo não subiu, ou o caminho está errado?". Sem este inventário as duas
// hipóteses são indistinguíveis, porque as duas dão 404 e tela preta.

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const refs = JSON.parse(readFileSync('source/midia-externa.json', 'utf8'));

// 'musica/*' é a pasta que o player monta em runtime ('musica/' + faixa); as
// faixas em si estão listadas uma a uma, então o curinga não é um arquivo.
const esperados = refs.filter((r) => !r.endsWith('/*'));

// As faixas vêm sem pasta na lista (o player concatena 'musica/' na hora).
const comPasta = (r) => (r.endsWith('.mp3') && !r.includes('/') ? 'musica/' + r : r);

const presentes = [];
const faltando = [];
for (const r of esperados.map(comPasta).sort()) {
  const arq = path.join('public', r);
  if (existsSync(arq) && statSync(arq).size > 0) presentes.push(r);
  else faltando.push(r);
}

writeFileSync(
  'lib/server/midia.json',
  JSON.stringify({ gerado: 'tools/scan-midia.mjs', presentes, faltando }, null, 1) + '\n',
);

console.log('midia externa:', presentes.length, 'presentes,', faltando.length, 'faltando -> lib/server/midia.json');
for (const f of faltando) console.log('  falta public/' + f);
