// Cria o esquema no Postgres (Neon). Idempotente — pode rodar quantas vezes quiser.
//
//   DATABASE_URL=postgres://... node tools/migrate.mjs
//
// Na Vercel, DATABASE_URL vem do Marketplace ao provisionar o Neon:
//   vercel install neon && vercel env pull .env.local

import { readFileSync, existsSync } from 'node:fs';

// Carrega .env.local se existir, para rodar local sem exportar nada.
for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

if (!process.env.DATABASE_URL) {
  console.error('\nDATABASE_URL nao definida.');
  console.error('Provisione o banco com `vercel install neon` e rode `vercel env pull .env.local`.\n');
  process.exit(2);
}

const { NeonStore } = await import('../lib/store/neon.ts').catch(async () => {
  // Rodando sem loader de TS: usa o driver direto.
  const { neon } = await import('@neondatabase/serverless');
  return {
    NeonStore: class {
      sql = neon(process.env.DATABASE_URL);
      async migrate() {
        const sql = this.sql;
        await sql`CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL,
          nome text NOT NULL DEFAULT '', prefs jsonb NOT NULL DEFAULT '{}'::jsonb,
          created_at timestamptz NOT NULL DEFAULT now())`;
        await sql`CREATE TABLE IF NOT EXISTS campaigns (
          id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          era text NOT NULL, nome text NOT NULL, state jsonb NOT NULL, rev integer NOT NULL DEFAULT 1,
          created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`;
        await sql`CREATE INDEX IF NOT EXISTS campaigns_user_idx ON campaigns(user_id, updated_at DESC)`;
        await sql`CREATE TABLE IF NOT EXISTS quota (
          subject text NOT NULL, day date NOT NULL, turns integer NOT NULL DEFAULT 0,
          PRIMARY KEY (subject, day))`;
        await sql`CREATE TABLE IF NOT EXISTS shares (
          token text PRIMARY KEY, campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
          created_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz)`;
      }
    },
  };
});

const store = new NeonStore();
await store.migrate();

const { neon } = await import('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const t = await sql`SELECT table_name FROM information_schema.tables
                     WHERE table_schema='public' ORDER BY table_name`;
console.log('tabelas:', t.map((r) => r.table_name).join(', '));
console.log('OK — esquema criado.');
