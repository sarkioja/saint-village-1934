// Baixa para public/fonts os subsets de fonte que o artifact NÃO empacotou.
//
//   node tools/fetch-gfonts.mjs
//
// O artifact embute a maioria das woff2 no manifest, mas alguns @font-face
// continuam apontando para o CDN do Google. Servir de lá significaria que a
// página depende de um terceiro para desenhar o próprio título — e, pior para
// o gate de pixels, que o resultado muda conforme a rede. Cada arquivo é
// baixado byte a byte e salvo com prefixo g-, que é como extract-css.mjs o
// procura.
//
// Idempotente: um arquivo que já está lá e tem o mesmo tamanho do remoto não é
// rebaixado.

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';

const tpl = readFileSync('source/template.html', 'utf8');
const urls = [...new Set(tpl.match(/https:\/\/fonts\.gstatic\.com\/[^)"'\s]+\.woff2/g) || [])];

if (!urls.length) {
  console.log('nenhuma URL do gstatic no template — nada a baixar');
  process.exit(0);
}

mkdirSync('public/fonts', { recursive: true });

let baixados = 0, mantidos = 0;
for (const url of urls) {
  const destino = 'public/fonts/g-' + url.split('/').pop();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} em ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error('resposta vazia em ' + url);
  if (existsSync(destino) && statSync(destino).size === buf.length) { mantidos++; continue; }
  writeFileSync(destino, buf);
  baixados++;
}

console.log('subsets do gstatic:', urls.length, `(${baixados} baixados, ${mantidos} já locais) -> public/fonts/g-*`);
