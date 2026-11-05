// Gate de fidelidade visual: compara o HTML original do artifact com o app novo.
//
// Nao e' inspecao visual — e' diff de imagem. Para cada viewport e cada estado,
// os dois lados recebem EXATAMENTE o mesmo save em localStorage, a mesma semente
// de Math.random e as animacoes desligadas; depois as capturas sao comparadas
// pixel a pixel.
//
//   node tests/pixel/run.mjs [--viewport 1280] [--era 1934] [--tab ficha] [--update]
//
// Requer: o artifact original em source/original.html (ou SV_ORIGINAL=<caminho>)
// e o app buildado (`npm run build`).

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { makeSave, ERAS, TABS } from './fixture.mjs';

const req = createRequire('/opt/node-tools/');
const { chromium } = req('playwright');
const projReq = createRequire(import.meta.url);
const pmMod = projReq('pixelmatch');
const pixelmatch = typeof pmMod === 'function' ? pmMod : pmMod.default;
const { PNG } = projReq('pngjs');

const ORIGINAL = process.env.SV_ORIGINAL || 'source/original.html';
const PORT = Number(process.env.SV_PORT || 3100);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = 'tests/pixel/__shots__';
const DIFF = 'tests/pixel/__diff__';
const TOLERANCE = 0.001; // 0,1% dos pixels

// ---------------------------------------------------------------- argumentos
const argv = process.argv.slice(2);
const argOf = (n, d) => {
  const i = argv.indexOf('--' + n);
  return i >= 0 ? argv[i + 1] : d;
};
const onlyViewport = argOf('viewport');
const onlyEra = argOf('era');
const onlyTab = argOf('tab');

const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 900 },
  { name: '1680', width: 1680, height: 1050 },
].filter((v) => !onlyViewport || v.name === onlyViewport);

// Estados: a tela de escolha de era (sem save) e cada aba de cada era.
const CASES = [{ id: 'era-select', save: null }];
for (const era of ERAS) {
  if (onlyEra && era !== onlyEra) continue;
  for (const tab of TABS) {
    if (onlyTab && tab !== onlyTab) continue;
    CASES.push({ id: `${era}-${tab}`, save: makeSave(era, tab) });
  }
}

// ------------------------------------------------------- determinismo nas 2 pontas
const initScript = (save) => `
  // 1. Mesmo save nas duas pontas (a chave e' a mesma do artifact, de proposito).
  try {
    ${save ? `localStorage.setItem('sv-cronica-v2', ${JSON.stringify(JSON.stringify(save))});` : `localStorage.removeItem('sv-cronica-v2');`}
  } catch (e) {}

  // 2. Math.random com semente fixa (xorshift) — ids internos nao podem divergir.
  (function () {
    let s = 0x2f6e2b1;
    Math.random = function () {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) % 1000000) / 1000000;
    };
  })();

  // 3. Animacoes e transicoes desligadas (o cursor piscante e o neon de 1994
  //    sao animados e tornariam a captura instavel).
  document.addEventListener('DOMContentLoaded', function () {
    const st = document.createElement('style');
    st.textContent = '*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}';
    document.documentElement.appendChild(st);
  });
`;

/** As 12 fontes que o artifact nao empacotou: serve do disco, para o teste ser offline e justo. */
async function routeFonts(page) {
  await page.route('https://fonts.gstatic.com/**', async (route) => {
    const file = 'public/fonts/g-' + route.request().url().split('/').pop();
    if (existsSync(file)) {
      await route.fulfill({ status: 200, contentType: 'font/woff2', body: readFileSync(file) });
    } else {
      await route.abort();
    }
  });
  // O CSS do Google nunca e' necessario: as @font-face ja' estao inline.
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
}

async function settle(page) {
  await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 120, {
    timeout: 30000,
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
}

async function shoot(browser, url, save, viewport) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1, // comparacao em pixels reais
  });
  await routeFonts(page);
  await page.addInitScript(initScript(save));
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await settle(page);
  const buf = await page.screenshot({ fullPage: true });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.close();
  return { buf, height };
}

// ------------------------------------------------------------------ servidor
function startServer() {
  return new Promise((resolve, reject) => {
    const p = spawn('npx', ['next', 'start', '-p', String(PORT)], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, SV_PIXEL_TEST: '1' },
    });
    let done = false;
    const onData = (d) => {
      const s = d.toString();
      if (!done && /Ready in|started server|Local:/i.test(s)) {
        done = true;
        setTimeout(() => resolve(p), 600);
      }
    };
    p.stdout.on('data', onData);
    p.stderr.on('data', onData);
    p.on('exit', (c) => {
      if (!done) reject(new Error('next start saiu com codigo ' + c));
    });
    setTimeout(() => {
      if (!done) {
        done = true;
        resolve(p);
      }
    }, 20000);
  });
}

// ---------------------------------------------------------------------- main
if (!existsSync(ORIGINAL)) {
  console.error(`\nFALTA o artifact original em ${ORIGINAL}.`);
  console.error('Copie o HTML exportado para la', 'ou aponte SV_ORIGINAL=<caminho>.\n');
  process.exit(2);
}
if (!existsSync('.next')) {
  console.error('\nFALTA o build. Rode `npm run build` antes.\n');
  process.exit(2);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(DIFF, { recursive: true });

const origUrl = 'file://' + path.resolve(ORIGINAL);
const server = await startServer();
const browser = await chromium.launch({ args: ['--no-sandbox'] });

const results = [];
try {
  for (const vp of VIEWPORTS) {
    for (const c of CASES) {
      const name = `${vp.name}-${c.id}`;
      let r;
      try {
        const a = await shoot(browser, origUrl, c.save, vp);
        const b = await shoot(browser, BASE + '/', c.save, vp);

        if (a.height !== b.height) {
          r = { name, ok: false, why: `altura difere: original ${a.height}px vs novo ${b.height}px` };
        } else {
          const pa = PNG.sync.read(a.buf);
          const pb = PNG.sync.read(b.buf);
          if (pa.width !== pb.width || pa.height !== pb.height) {
            r = { name, ok: false, why: `dimensao difere: ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}` };
          } else {
            const diff = new PNG({ width: pa.width, height: pa.height });
            const n = pixelmatch(pa.data, pb.data, diff.data, pa.width, pa.height, {
              threshold: 0.1,
              includeAA: false,
            });
            const total = pa.width * pa.height;
            const ratio = n / total;
            const ok = ratio <= TOLERANCE;
            if (!ok) {
              writeFileSync(path.join(DIFF, name + '.diff.png'), PNG.sync.write(diff));
              writeFileSync(path.join(DIFF, name + '.original.png'), a.buf);
              writeFileSync(path.join(DIFF, name + '.novo.png'), b.buf);
            }
            r = { name, ok, ratio, pixels: n, total, why: ok ? '' : `${(ratio * 100).toFixed(3)}% dos pixels diferem (${n})` };
          }
        }
      } catch (e) {
        r = { name, ok: false, why: 'erro: ' + (e?.message || String(e)).slice(0, 160) };
      }
      results.push(r);
      const mark = r.ok ? 'ok  ' : 'FALHA';
      const extra = r.ok && r.ratio != null ? ` (${(r.ratio * 100).toFixed(3)}%)` : r.why ? ' — ' + r.why : '';
      console.log(`${mark} ${r.name}${extra}`);
    }
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}

const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} comparacoes dentro de ${(TOLERANCE * 100).toFixed(1)}%.`);
if (bad.length) {
  console.log(`\n${bad.length} falha(s):`);
  for (const r of bad) console.log('  -', r.name, '—', r.why);
  console.log(`\nImagens em ${DIFF}/ (original, novo e diff de cada falha).`);
  process.exit(1);
}
console.log('\nGATE OK — o app novo e\' pixel-identico ao artifact original.');
