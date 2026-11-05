// Exporta e importa TODOS os dados do app num arquivo JSON.
//
//   DATABASE_URL=postgres://... node tools/handover.mjs export dados.json
//   DATABASE_URL=postgres://... node tools/handover.mjs import dados.json
//
// Para que serve: levar o app para outra conta — sua ou de outra pessoa — sem
// depender de o Marketplace da Vercel transferir o banco junto com o projeto.
// Na conta de destino você provisiona um Postgres novo, roda `npm run migrate`
// e importa este arquivo. Funciona entre fornecedores diferentes (Neon,
// Supabase, Railway, RDS, um servidor seu), porque o esquema é Postgres padrão.
//
// O arquivo contém hashes de senha, e-mails e crônicas inteiras: trate-o como
// backup sensível e apague depois da migração.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { exportar, importar, TABELAS } from '../lib/store/handover.mjs';

for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const [, , acao, arquivo] = process.argv;
if (!['export', 'import'].includes(acao) || !arquivo) {
  console.error('uso: node tools/handover.mjs <export|import> <arquivo.json>');
  process.exit(2);
}

const NOMES = ['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'DATABASE_URL_UNPOOLED', 'POSTGRES_URL_NON_POOLING'];
const url = NOMES.map((n) => process.env[n]).find((v) => /^postgres(ql)?:\/\//i.test(v || ''));
if (!url) {
  console.error(`Nenhuma URL de Postgres encontrada (procurei em ${NOMES.join(', ')}).`);
  process.exit(2);
}

// Mesmo critério de lib/store/postgres.ts: o driver vem da URL.
const forced = (process.env.DATA_DRIVER || '').toLowerCase();
const isNeon = forced === 'neon' || (forced !== 'pg' && /\.neon\.tech[:/]/.test(url));

let query;
let encerrar = async () => {};
if (isNeon) {
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(url);
  query = (t, p = []) => sql.query(t, p);
} else {
  const pg = await import('pg');
  const pool = new pg.default.Pool({ connectionString: url, max: 2 });
  query = async (t, p = []) => (await pool.query(t, p)).rows;
  encerrar = () => pool.end();
}

try {
  if (acao === 'export') {
    const saida = await exportar(query);
    for (const t of TABELAS) {
      console.log(`  ${String(saida.tabelas[t.nome].length).padStart(6)}  ${t.nome}`);
    }
    writeFileSync(arquivo, JSON.stringify(saida, null, 1));
    console.log(`\nOK — gravado em ${arquivo}.`);
    console.log('Contem hashes de senha e cronicas: guarde com cuidado e apague depois.');
  } else {
    const contagem = await importar(query, JSON.parse(readFileSync(arquivo, 'utf8')));
    for (const t of TABELAS) console.log(`  ${String(contagem[t.nome]).padStart(6)}  ${t.nome}`);
    console.log('\nOK — importado. Rode `npm run migrate` antes, se o banco for novo.');
  }
} finally {
  await encerrar();
}
