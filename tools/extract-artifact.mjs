// Desempacota um artifact exportado (o HTML de ~6 MB) para source/.
//
//   node tools/extract-artifact.mjs source/original-v2.html
//
// O arquivo é um bundle: um manifest com os assets em base64+gzip e um template
// com a página. Este script separa as três coisas de que os geradores precisam —
// o markup declarativo, a lógica do componente e os assets — para que
// `npm run gen` parta sempre de arquivos versionados, e não do HTML gigante.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import path from 'node:path';

const origem = process.argv[2];
if (!origem || !existsSync(origem)) {
  console.error('uso: node tools/extract-artifact.mjs <arquivo.html>');
  process.exit(2);
}

const raw = readFileSync(origem, 'utf8');

// ---- template: o JSON com a página inteira --------------------------------
const mt = raw.match(/<script type="__bundler\/template">\s*(".*?")\s*<\/script>/s);
if (!mt) throw new Error('bloco __bundler/template não encontrado');
const page = JSON.parse(mt[1]);

// O markup renderizável vive dentro de <x-dc>.
const a = page.indexOf('<x-dc>');
const b = page.indexOf('</x-dc>');
if (a < 0 || b < 0) throw new Error('<x-dc> não encontrado no template');
writeFileSync('source/template.html', page.slice(a, b + 7));

// A lógica vem num <script type="text/x-dc">.
const i = page.indexOf('type="text/x-dc"');
if (i < 0) throw new Error('<script type="text/x-dc"> não encontrado');
const j = page.indexOf('>', i);
const k = page.indexOf('</script>', j);
writeFileSync('source/component.js', page.slice(j + 1, k));

// A página inteira, para conferência manual.
writeFileSync('source/page.html', page);

// ---- manifest: os assets --------------------------------------------------
const mm = raw.match(/<script type="__bundler\/manifest">\s*(\{.*?\})\s*<\/script>/s);
if (!mm) throw new Error('bloco __bundler/manifest não encontrado');
const man = JSON.parse(mm[1]);

const EXT = {
  'text/javascript': 'js',
  'image/svg+xml': 'svg',
  'font/woff2': 'woff2',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'text/css': 'css',
};

// Recria do zero: um asset que saiu do artifact não pode ficar para trás.
rmSync('source/assets', { recursive: true, force: true });
mkdirSync('source/assets', { recursive: true });

const porTipo = {};
for (const [chave, v] of Object.entries(man)) {
  let data = Buffer.from(v.data, 'base64');
  if (v.compressed) data = gunzipSync(data);
  const ext = EXT[v.mime] || 'bin';
  writeFileSync(path.join('source/assets', `${chave}.${ext}`), data);
  porTipo[ext] = (porTipo[ext] || 0) + 1;
}

// ---- os módulos próprios do app ------------------------------------------
// Identificados pelo CONTEÚDO, não pelo nome: os UUIDs mudam a cada exportação.
// A ordem importa — o primeiro padrão que casar leva o arquivo.
const MODULOS = [
  ['sv_regras.js', (t) => t.startsWith('window.SV_REGRAS')],
  ['sv_livros.js', (t) => t.startsWith('window.SV_LIVROS')],
  ['sv_seculo.js', (t) => /Edição Omni/.test(t.slice(0, 300))],
  // Trilha ambiente: novo na versão do designer. Opcional, para o extrator
  // continuar servindo o artifact antigo.
  ['sv_audio.js', (t) => /trilha ambiente/.test(t.slice(0, 300)), true],
];

const achados = [];
const usados = new Set();
for (const [destino, casa, opcional] of MODULOS) {
  let achou = null;
  for (const [chave, v] of Object.entries(man)) {
    if (v.mime !== 'text/javascript' || usados.has(chave)) continue;
    const txt = readFileSync(path.join('source/assets', `${chave}.js`), 'utf8');
    if (casa(txt)) {
      writeFileSync(`source/${destino}`, txt);
      usados.add(chave);
      achou = chave;
      break;
    }
  }
  if (!achou) {
    if (opcional) {
      // Se o artifact não traz este módulo, remove um resquício de extração anterior.
      rmSync(`source/${destino}`, { force: true });
      achados.push(`${destino} (ausente neste artifact)`);
      continue;
    }
    throw new Error(`módulo não encontrado: ${destino}`);
  }
  achados.push(`${destino} <- ${achou.slice(0, 8)} (${(readFileSync(`source/${destino}`).length / 1024).toFixed(0)} KB)`);
}

// ---- mídia referenciada por caminho relativo, que o bundle NÃO traz --------
// O designer referencia fundos, música e efeitos por caminho. Esses arquivos
// não vêm no artifact: listá-los aqui é o que transforma "sumiu" em "falta".
const alvos = [readFileSync('source/template.html', 'utf8'), readFileSync('source/component.js', 'utf8')];
for (const [destino] of MODULOS) {
  if (existsSync(`source/${destino}`)) alvos.push(readFileSync(`source/${destino}`, 'utf8'));
}
const midia = new Set();
for (const t of alvos) {
  for (const m of t.matchAll(/['"`]([a-zA-Z0-9_/.-]+\.(?:jpg|jpeg|png|webp|mp3|ogg|wav|m4a))['"`]/g)) {
    if (!m[1].startsWith('/') && !m[1].startsWith('http')) midia.add(m[1]);
  }
}
// As pastas aparecem concatenadas em runtime (ex.: 'musica/' + faixa).
for (const t of alvos) {
  for (const m of t.matchAll(/['"]([a-z]+\/)['"]/g)) midia.add(m[1] + '*');
}

// Caminho montado por concatenação com um contador, que foi como o v3 passou a
// declarar o conjunto de fundos: `[1..8].map(n => 'fundos/noir'+n+'.jpg')`.
//
// Antes isto entrava no inventário como o prefixo solto `fundos/noir`, um
// arquivo que não existe e que ninguém ia procurar — o inventário dizia que
// estava tudo certo enquanto oito fundos faltavam. Agora a faixa é expandida e
// cada arquivo é cobrado pelo nome.
for (const t of alvos) {
  for (const m of t.matchAll(
    /\[([\d,\s]+)\]\s*\.map\(\s*\w+\s*=>\s*['"]([a-zA-Z0-9_/-]+)['"]\s*\+\s*\w+\s*\+\s*['"](\.[a-z0-9]+)['"]/g,
  )) {
    const numeros = m[1].split(',').map((x) => x.trim()).filter(Boolean);
    for (const n of numeros) midia.add(`${m[2]}${n}${m[3]}`);
  }
}
// O prefixo solto deixa de poluir o inventário depois de expandido.
for (const r of [...midia]) {
  if (/^[a-z]+\/[a-z]+$/.test(r) && [...midia].some((o) => o !== r && o.startsWith(r))) midia.delete(r);
}
writeFileSync('source/midia-externa.json', JSON.stringify([...midia].sort(), null, 1));

console.log('origem        :', origem, `(${(raw.length / 1048576).toFixed(1)} MB)`);
console.log('template.html :', page.slice(a, b + 7).length, 'bytes');
console.log('component.js  :', (k - j), 'bytes');
console.log('assets        :', Object.entries(porTipo).map(([e, n]) => `${n} ${e}`).join(', '));
for (const x of achados) console.log('modulo        :', x);
const mid = JSON.parse(readFileSync('source/midia-externa.json','utf8'));
console.log('midia externa :', mid.length, 'referencias NAO empacotadas ->  source/midia-externa.json');
