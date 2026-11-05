import { SqlStore, type Query } from './sql';

/**
 * Postgres, com o driver escolhido pela propria URL.
 *
 * Neon (`*.neon.tech`) usa o driver HTTP `@neondatabase/serverless`: em
 * serverless cada invocacao e' isolada e um pool de conexoes nao se reaproveita,
 * entao uma query = um fetch, sem handshake de conexao.
 *
 * Qualquer outro Postgres (Supabase, Railway, RDS, um servidor seu) usa `pg`
 * com um pool pequeno, reaproveitado quando a instancia e' reutilizada.
 *
 * O SQL e' o mesmo nos dois casos (lib/store/sql.ts). E' isso que mantem o banco
 * portavel: nada aqui prende os dados a um fornecedor.
 *
 * TLS: a verificacao de certificado fica a cargo do `sslmode` da connection
 * string, que o `pg` le sozinho. Nao desligamos verificacao por padrao — um
 * banco e' exatamente onde isso nao se faz. Para um Postgres com certificado
 * proprio, o caminho e' pôr a CA em `PGSSLROOTCERT`, e nao baixar a guarda.
 */
export class PostgresStore extends SqlStore {
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL ausente. Provisione um Postgres (ex.: `vercel install neon`) ' +
          'ou use DATA_BACKEND=fs para rodar local.',
      );
    }

    const forced = (process.env.DATA_DRIVER || '').toLowerCase();
    const isNeon = forced === 'neon' || (forced !== 'pg' && /\.neon\.tech[:/]/.test(url));

    let query: Query;
    if (isNeon) {
      // Import tardio: so' carrega o driver que de fato sera' usado.
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(url);
      query = (text, params = []) => sql.query(text, params);
    } else {
      const { Pool } = require('pg');
      // Pool pequeno: numa function serverless ha' uma requisicao por vez.
      const pool = new Pool({
        connectionString: url,
        max: Number(process.env.PGPOOL_MAX || 3),
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
      });
      query = async (text, params = []) => (await pool.query(text, params as any[])).rows;
    }

    super(isNeon ? 'neon' : 'postgres', query);
  }
}
