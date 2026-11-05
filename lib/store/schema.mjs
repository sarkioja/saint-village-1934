// Esquema do banco — FONTE ÚNICA.
//
// Importado tanto pelo app (lib/store/sql.ts) quanto pelos scripts de linha de
// comando (tools/migrate.mjs, tools/handover.mjs), para que não existam duas
// versões do DDL podendo divergir.
//
// Postgres padrão: nenhuma extensão, nenhum recurso proprietário. É isso que
// permite levar os dados para qualquer fornecedor.

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id            uuid PRIMARY KEY,
     email         text UNIQUE NOT NULL,
     password_hash text NOT NULL,
     nome          text NOT NULL DEFAULT '',
     prefs         jsonb NOT NULL DEFAULT '{}'::jsonb,
     created_at    timestamptz NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS campaigns (
     id         uuid PRIMARY KEY,
     user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     era        text NOT NULL,
     nome       text NOT NULL,
     state      jsonb NOT NULL,
     rev        integer NOT NULL DEFAULT 1,
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,

  `CREATE INDEX IF NOT EXISTS campaigns_user_idx ON campaigns(user_id, updated_at DESC)`,

  `CREATE TABLE IF NOT EXISTS quota (
     subject text NOT NULL,
     day     date NOT NULL,
     turns   integer NOT NULL DEFAULT 0,
     PRIMARY KEY (subject, day)
   )`,

  `CREATE TABLE IF NOT EXISTS shares (
     token       text PRIMARY KEY,
     campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
     created_at  timestamptz NOT NULL DEFAULT now(),
     revoked_at  timestamptz
   )`,
];
