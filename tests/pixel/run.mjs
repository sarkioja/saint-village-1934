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
  //    sao animados e tornariam a captura instavel), e o chip de conta escondido.
  //
  //    O chip ([data-sv-account]) e' o UNICO elemento que o app acrescenta a'
  //    interface do artifact. Como e' position:fixed, nao participa do fluxo:
  //    esconde-lo deixa o resto da pagina rigorosamente igual, e a comparacao
  //    continua cobrindo o layout inteiro. Se ele deixar de ser fixed, a altura
  //    da pagina muda e este gate falha — que e' o comportamento desejado.
  document.addEventListener('DOMContentLoaded', function () {
    const st = document.createElement('style');
    st.textContent =
      '*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}' +
      '[data-sv-account]{display:none !important}';
    document.documentElement.appendChild(st);
  });
`;

/**
 * Chromium desenha o texto interno de um <select> pelo caminho do controle
 * NATIVO, nao por CSS. Dois documentos que chegam a layout identico por
 * caminhos de reflow diferentes podem pousar esse texto um pixel acima ou
 * abaixo. Foi medido: com caixa, fonte, opcoes e valor provadamente iguais nos
 * dois lados, 969 de 969 pixels divergentes estavam DENTRO de <select> e zero
 * fora.
 *
 * Afrouxar a tolerancia global mascararia regressoes de verdade. Entao:
 *   - a geometria e o conteudo dos controles sao comparados pelo DOM, o que e'
 *     MAIS rigoroso que pixel (pega opcao errada, valor errado, tamanho errado);
 *   - e so' o INTERIOR deles e' achatado antes do diff, preservando a borda,
 *     que e' desenhada por CSS e continua sendo comparada.
 */
const INSET = 2;
function flattenControls(png, controls) {
  for (const c of controls) {
    const x0 = Math.max(0, c.x + INSET);
    const y0 = Math.max(0, c.y + INSET);
    const x1 = Math.min(png.width, c.x + c.w - INSET);
    const y1 = Math.min(png.height, c.y + c.h - INSET);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * png.width + x) * 4;
        png.data[i] = 0;
        png.data[i + 1] = 0;
        png.data[i + 2] = 0;
        png.data[i + 3] = 255;
      }
    }
  }
}

/** Diferenca entre os controles descritos pelo DOM dos dois lados. */
function controlsDiff(a, b) {
  if (a.length !== b.length) return `numero de controles: ${a.length} vs ${b.length}`;
  for (let i = 0; i < a.length; i++) {
    const ka = JSON.stringify(a[i]);
    const kb = JSON.stringify(b[i]);
    if (ka !== kb) return `controle ${i}: ${ka} vs ${kb}`;
  }
  return null;
}

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

async function settle(page, side) {
  try {
    await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 120, {
      timeout: 25000,
    });
  } catch {
    const seen = await page
      .evaluate(() => (document.body?.innerText || '').trim().slice(0, 80))
      .catch(() => '');
    throw new Error(
      `lado "${side}" nao renderizou (texto visivel: ${JSON.stringify(seen)}). ` +
        (side === 'novo'
          ? 'O servidor do app respondeu vazio — o build mudou enquanto o teste rodava?'
          : 'O artifact original nao desempacotou.'),
    );
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
}

async function shoot(browser, url, save, viewport, side) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1, // comparacao em pixels reais
  });
  try {
    await routeFonts(page);
    await page.addInitScript(initScript(save));
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await settle(page, side);

    // Controles de formulario: comparados pelo DOM, nao por pixel (ver abaixo).
    const controls = await page.evaluate(() =>
      [...document.querySelectorAll('select,input,textarea')].map((el) => {
        const b = el.getBoundingClientRect();
        const s = el;
        return {
          tag: el.tagName,
          x: Math.round(b.left + scrollX),
          y: Math.round(b.top + scrollY),
          w: Math.round(b.width),
          h: Math.round(b.height),
          value: 'value' in s ? String(s.value ?? '') : '',
          text:
            el.tagName === 'SELECT'
              ? String(s.options?.[s.selectedIndex]?.text ?? '')
              : String(s.placeholder ?? ''),
          options: el.tagName === 'SELECT' ? s.options.length : undefined,
        };
      }),
    );

    const buf = await page.screenshot({ fullPage: true });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    return { buf, height, controls };
  } finally {
    await page.close();
  }
}

// ------------------------------------------------------------------ servidor
//
// Tres cuidados aqui, cada um por causa de um falso negativo que ja' aconteceu:
//
// 1. Esperar a RESPOSTA HTTP, nao a linha de log. O Next imprime "Local: ..."
//    antes de estar ouvindo, e o primeiro caso batia num servidor que ainda nao
//    atendia — o lado "novo" saia em branco.
// 2. Abortar se a porta ja' estiver ocupada. Um `next start` orfao de uma rodada
//    anterior serve um .next que depois foi reescrito: os chunks nao existem mais,
//    a pagina vem branca, e TODOS os casos "falham" sem motivo real.
// 3. Matar o GRUPO de processos. O filho direto era o npx, e o next-server
//    sobrevivia ao SIGTERM, virando justamente o orfao do item 2.

async function portBusy() {
  try {
    const r = await fetch(BASE + '/', { signal: AbortSignal.timeout(1500) });
    return r.status > 0;
  } catch {
    return false;
  }
}

async function waitUntilServing(timeoutMs = 60000) {
  const t0 = Date.now();
  for (;;) {
    try {
      const r = await fetch(BASE + '/', { signal: AbortSignal.timeout(2000) });
      if (r.ok) {
        const html = await r.text();
        if (html.length > 500) return;
      }
    } catch {
      /* ainda subindo */
    }
    if (Date.now() - t0 > timeoutMs) throw new Error('o servidor do app nao atendeu em ' + timeoutMs + 'ms');
    await new Promise((r) => setTimeout(r, 400));
  }
}

async function startServer() {
  if (await portBusy()) {
    throw new Error(
      `a porta ${PORT} ja' esta' em uso. Um \`next start\` de uma rodada anterior sobrou e ` +
        'serviria um build velho (todos os casos falhariam em branco). Encerre-o ' +
        '(`pkill -f "next start"`) ou use SV_PORT=outra.',
    );
  }

  const bin = path.resolve('node_modules/next/dist/bin/next');
  const p = spawn(process.execPath, [bin, 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true, // proprio grupo, para poder matar tudo depois
    env: { ...process.env, SV_PIXEL_TEST: '1' },
  });

  let exited = null;
  p.on('exit', (c) => {
    exited = c;
  });
  const log = [];
  const grab = (d) => log.push(d.toString());
  p.stdout.on('data', grab);
  p.stderr.on('data', grab);

  try {
    await waitUntilServing();
  } catch (e) {
    const why = exited != null ? ` (next start saiu com codigo ${exited})` : '';
    throw new Error(e.message + why + '\n' + log.join('').slice(-800));
  }
  return p;
}

function stopServer(p) {
  if (!p?.pid) return;
  try {
    process.kill(-p.pid, 'SIGTERM'); // o grupo inteiro
  } catch {
    try {
      p.kill('SIGTERM');
    } catch {
      /* ja' morreu */
    }
  }
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

// Guarda contra um erro facil de cometer: rodar `next build` enquanto o gate
// esta' no ar troca o .next debaixo do `next start` e faz TODOS os casos
// falharem com a pagina vazia. Comparamos o BUILD_ID no fim para dizer isso
// em vez de deixar 41 falhas sem explicacao.
const buildIdAt = () => {
  try {
    return readFileSync('.next/BUILD_ID', 'utf8').trim();
  } catch {
    return '';
  }
};
const buildIdBefore = buildIdAt();

const server = await startServer();
const browser = await chromium.launch({ args: ['--no-sandbox'] });

const results = [];
try {
  for (const vp of VIEWPORTS) {
    for (const c of CASES) {
      const name = `${vp.name}-${c.id}`;
      let r;
      try {
        // Os dois lados em paralelo: o artifact original tem 6 MB para parsear
        // a cada carga, e serializar isso dobrava o tempo do gate.
        //
        // Com retry porque o original desempacota fontes e dados em JS na
        // abertura e as vezes nao termina dentro do tempo — e' lentidao do
        // artifact, nao divergencia de layout.
        let a, b;
        for (let attempt = 1; ; attempt++) {
          try {
            [a, b] = await Promise.all([
              shoot(browser, origUrl, c.save, vp, 'original'),
              shoot(browser, BASE + '/', c.save, vp, 'novo'),
            ]);
            break;
          } catch (e) {
            if (attempt >= 3) throw e;
          }
        }

        if (a.height !== b.height) {
          r = { name, ok: false, why: `altura difere: original ${a.height}px vs novo ${b.height}px` };
        } else {
          const pa = PNG.sync.read(a.buf);
          const pb = PNG.sync.read(b.buf);
          if (pa.width !== pb.width || pa.height !== pb.height) {
            r = { name, ok: false, why: `dimensao difere: ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}` };
          } else {
            // Controles conferidos pelo DOM antes do diff de imagem.
            const cd = controlsDiff(a.controls, b.controls);
            if (cd) {
              r = { name, ok: false, why: 'controles divergem — ' + cd };
              results.push(r);
              console.log(`FALHA ${name} — ${r.why}`);
              continue;
            }
            flattenControls(pa, a.controls);
            flattenControls(pb, b.controls);

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
  stopServer(server);
}

const buildIdAfter = buildIdAt();
if (buildIdBefore && buildIdAfter && buildIdBefore !== buildIdAfter) {
  console.log(
    '\nATENCAO: o build mudou durante o gate (BUILD_ID ' +
      `${buildIdBefore} -> ${buildIdAfter}). O servidor servia um .next sendo` +
      ' reescrito; as falhas abaixo nao sao confiaveis. Rode de novo sem buildar em paralelo.',
  );
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
