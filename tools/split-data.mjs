// Snapshota os dados do artifact em JSON e os divide em cliente x servidor.
//
// Os tres arquivos de source/ precisam ser avaliados NESTA ORDEM: sv_seculo.js
// estende SV_REGRAS e SV_LIVROS (e' ele que acrescenta as eras 1946/1974/1999).
// Por isso snapshotamos o estado FINAL dos globais, em vez de ler cada arquivo.
//
// Divisao:
//   cliente  -> SV_REGRAS, SV_SECULO, e de SV_LIVROS so' `regioes` e `npcs`
//   servidor -> de SV_LIVROS, `textos` e `geral` (414 KB de prosa do livro usados
//               APENAS na montagem do prompt; nunca devem chegar ao navegador)

import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

globalThis.window = {};
require('../source/sv_regras.js');
require('../source/sv_livros.js');
require('../source/sv_seculo.js');

const { SV_REGRAS, SV_LIVROS, SV_SECULO } = globalThis.window;
if (!SV_REGRAS || !SV_LIVROS || !SV_SECULO) throw new Error('globais SV_* nao carregaram');

const ERAS = Object.keys(SV_LIVROS).sort();
if (ERAS.length !== 5) throw new Error('esperava 5 eras, achei ' + ERAS.length);

mkdirSync('lib/oracle/data', { recursive: true });
mkdirSync('lib/server/book', { recursive: true });

// ----------------------------------------------------------------- cliente

const livrosClient = {};
for (const era of ERAS) {
  const { regioes, npcs, textos, geral } = SV_LIVROS[era];
  if (!regioes || !npcs) throw new Error(`era ${era} sem regioes/npcs`);
  if (!textos || !geral) throw new Error(`era ${era} sem textos/geral`);
  livrosClient[era] = { regioes, npcs };
}

writeFileSync('lib/oracle/data/regras.json', JSON.stringify(SV_REGRAS));
writeFileSync('lib/oracle/data/seculo.json', JSON.stringify(SV_SECULO));
writeFileSync('lib/oracle/data/livros.json', JSON.stringify(livrosClient));

// ---------------------------------------------------------------- servidor

// Um arquivo por era, para carregar sob demanda na rota de narracao.
for (const era of ERAS) {
  const { textos, geral } = SV_LIVROS[era];
  writeFileSync(`lib/server/book/${era}.json`, JSON.stringify({ textos, geral }));
}

// ------------------------------------------------------------- invariantes

const clientBlob = JSON.stringify({ SV_REGRAS, SV_SECULO, livrosClient });
for (const era of ERAS) {
  // A prosa do livro nao pode ter vazado para o lado do cliente.
  const sample = SV_LIVROS[era].geral.slice(200, 400);
  if (sample && clientBlob.includes(sample)) {
    throw new Error(`texto do livro (${era}) vazou para os dados do cliente`);
  }
}

const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log('eras:', ERAS.join(', '));
console.log('cliente  regras.json :', kb(JSON.stringify(SV_REGRAS).length));
console.log('cliente  seculo.json :', kb(JSON.stringify(SV_SECULO).length));
console.log('cliente  livros.json :', kb(JSON.stringify(livrosClient).length));
console.log('servidor book/*.json :', kb(ERAS.reduce((a, e) => a + JSON.stringify(SV_LIVROS[e].textos).length + SV_LIVROS[e].geral.length, 0)));
console.log('\nOK — prosa do livro confinada ao servidor.');
