// Extrai os blocos <style> do template original VERBATIM e remapeia as URLs de asset.
// Nenhum valor de CSS é normalizado: o conteúdo sai como está, só as urls mudam.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const tpl = readFileSync('source/template.html', 'utf8');

// 1. Todos os blocos <style> na ordem em que aparecem
const styles = [...tpl.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
if (!styles.length) throw new Error('nenhum bloco <style> encontrado');

// 2. Tabela UUID -> arquivo servido
const fonts = new Set(readdirSync('public/fonts').map((f) => f.replace(/\.woff2$/, '')));
const assets = {
  '3f407024-ced9-4ca3-bf36-8735fe0e5906': '/assets/city.png',
  'aa21b305-5698-4e7e-a3c3-ab1c3b535120': '/assets/map.svg',
};

let unresolved = [];

// Assets empacotados no artifact, referenciados por UUID.
const remapUuid = (css) =>
  css.replace(/url\((["']?)([0-9a-f-]{36})\1\)/g, (full, q, uuid) => {
    if (fonts.has(uuid)) return `url("/fonts/${uuid}.woff2")`;
    if (assets[uuid]) return `url("${assets[uuid]}")`;
    unresolved.push(uuid);
    return full;
  });

// 12 subsets que o artifact NAO empacotou e ainda apontavam para o CDN do Google.
// Baixados byte a byte para public/fonts com prefixo g-, para o app nao depender de terceiro.
const remapGstatic = (css) =>
  css.replace(/url\((["']?)(https:\/\/fonts\.gstatic\.com\/[^)"']+\.woff2)\1\)/g, (full, q, url) => {
    const local = 'g-' + url.split('/').pop();
    if (fonts.has(local.replace(/\.woff2$/, ''))) return `url("/fonts/${local}")`;
    unresolved.push(url);
    return full;
  });

const out = styles.map((s) => remapGstatic(remapUuid(s))).join('\n');
if (unresolved.length) throw new Error('asset sem arquivo local: ' + [...new Set(unresolved)].join(', '));

// Invariante: o CSS servido nao pode conter nenhuma referencia de REDE externa.
//
// Namespaces XML (xmlns='http://www.w3.org/2000/svg') aparecem dentro dos
// data:image/svg+xml e parecem URLs, mas sao identificadores: o navegador nunca
// os busca. Excluir apenas esses, e nao afrouxar o teste, mantem a invariante
// valendo para tudo que de fato seria baixado.
const NAMESPACES = /^https?:\/\/www\.w3\.org\//;
const remote = (out.match(/https?:\/\/[^)"'\s]+/g) || []).filter((u) => !NAMESPACES.test(u));
if (remote.length) throw new Error('sobraram URLs remotas: ' + [...new Set(remote)].join(', '));

writeFileSync('app/oracle.css', out);

const ff = (out.match(/@font-face/g) || []).length;
const ur = (out.match(/unicode-range/g) || []).length;
const kf = (out.match(/@keyframes/g) || []).length;
console.log(`blocos <style>: ${styles.length}`);
console.log(`@font-face:     ${ff}`);
console.log(`unicode-range:  ${ur}`);
console.log(`@keyframes:     ${kf}`);
console.log(`bytes:          ${out.length}`);
