// Cria o esquema no Postgres. Idempotente — pode rodar quantas vezes quiser.
//
//   DATABASE_URL=postgres://... node tools/migrate.mjs
//
// Na Vercel, DATABASE_URL vem do Marketplace ao provisionar o banco:
//   vercel install neon && vercel env pull .env.local

import { readFileSync, existsSync } from 'node:fs';
import { SCHEMA } from '../lib/store/schema.mjs';

for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('\nDATABASE_URL nao definida.');
  console.error('Provisione o banco (`vercel install neon`) e rode `vercel env pull .env.local`.\n');
  process.exit(2);
}

const forced = (process.env.DATA_DRIVER || '').toLowerCase();
const isNeon = forced === 'neon' || (forced !== 'pg' && /\.neon\.tech[:/]/.test(url));

let query, encerrar = async () => {};
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
  for (const ddl of SCHEMA) await query(ddl);
  const t = await query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' ORDER BY table_name`,
  );
  console.log('driver :', isNeon ? 'neon (HTTP)' : 'pg');
  console.log('tabelas:', t.map((r) => r.table_name).join(', '));
  console.log('OK — esquema criado.');
} finally {
  await encerrar();
}
