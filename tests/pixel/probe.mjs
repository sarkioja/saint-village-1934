import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/node-tools/').call(null, 'playwright');

const ORIG = process.argv[2];
const b = await chromium.launch({ args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const fails = [];
p.on('requestfailed', r => fails.push(r.url().slice(0, 70)));
p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text().slice(0, 140)); });
await p.goto('file://' + ORIG, { waitUntil: 'load' });
await p.waitForTimeout(7000);
console.log('frames:', p.frames().length, '| title:', await p.title());
console.log(JSON.stringify(await p.evaluate(() => ({
  bodyChildren: [...document.body.children].map(e => e.tagName + (e.id ? '#' + e.id : '')),
  placeholder: document.getElementById('__bundler_placeholder')?.textContent?.slice(0, 60) ?? null,
  err: document.getElementById('__bundler_err')?.textContent?.slice(0, 200) ?? null,
  hasSaintVillage: document.body.innerText.includes('Saint Village'),
  textSample: document.body.innerText.replace(/\s+/g, ' ').slice(0, 180),
})), null, 1));
console.log('requests falhados:', fails.length, [...new Set(fails)].slice(0, 5));
await p.screenshot({ path: 'tests/pixel/probe-orig.png' });
await b.close();
