/**
 * Descobre a URL do Postgres.
 *
 * As integrações do Marketplace não injetam sempre o mesmo nome: o Neon costuma
 * criar `DATABASE_URL`, mas também aparecem `POSTGRES_URL`,
 * `DATABASE_URL_UNPOOLED` e `POSTGRES_URL_NON_POOLING` conforme a integração e
 * o preset. Procurar só por `DATABASE_URL` daria "banco não configurado" com o
 * banco ali, já provisionado — por isso a lista.
 *
 * A ordem prefere a URL com pool, que é a adequada para serverless.
 */
const NOMES = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
] as const;

export function postgresUrl(): string | null {
  for (const n of NOMES) {
    const v = process.env[n];
    if (v && /^postgres(ql)?:\/\//i.test(v)) return v;
  }
  return null;
}

/** Nome da variável que forneceu a URL, para mensagens de diagnóstico. */
export function postgresUrlVar(): string | null {
  for (const n of NOMES) {
    const v = process.env[n];
    if (v && /^postgres(ql)?:\/\//i.test(v)) return n;
  }
  return null;
}

export const NOMES_ACEITOS = NOMES;
