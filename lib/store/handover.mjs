// Exportação e importação de todos os dados do app, independente de driver.
//
// Usado por tools/handover.mjs (linha de comando) e pelos testes. Existe como
// módulo separado para que o caminho de transferência seja testável de verdade:
// exportar, apagar tudo, importar e conferir que nada se perdeu.

/** Ordem respeita as chaves estrangeiras na importação. */
export const TABELAS = [
  { nome: 'users', cols: ['id', 'email', 'password_hash', 'nome', 'prefs', 'created_at'] },
  {
    nome: 'campaigns',
    cols: ['id', 'user_id', 'era', 'nome', 'state', 'rev', 'created_at', 'updated_at'],
  },
  { nome: 'quota', cols: ['subject', 'day', 'turns'] },
  { nome: 'shares', cols: ['token', 'campaign_id', 'created_at', 'revoked_at'] },
];

/** Colunas jsonb: precisam de cast explícito na volta. */
const JSONB = new Set(['prefs', 'state']);

export const VERSAO = 1;

/** Lê tudo e devolve um objeto serializável. */
export async function exportar(query) {
  const tabelas = {};
  for (const t of TABELAS) {
    tabelas[t.nome] = await query(`SELECT ${t.cols.join(', ')} FROM ${t.nome}`);
  }
  return { versao: VERSAO, exportadoEm: new Date().toISOString(), tabelas };
}

/**
 * Grava de volta. Idempotente: reimportar o mesmo arquivo não duplica nada,
 * graças ao ON CONFLICT DO NOTHING nas chaves primárias.
 */
export async function importar(query, dados) {
  if (dados?.versao !== VERSAO) {
    throw new Error('versao de arquivo desconhecida: ' + dados?.versao);
  }
  const contagem = {};
  for (const t of TABELAS) {
    const linhas = dados.tabelas?.[t.nome] ?? [];
    const placeholders = t.cols
      .map((c, i) => (JSONB.has(c) ? `$${i + 1}::jsonb` : `$${i + 1}`))
      .join(', ');
    for (const l of linhas) {
      const valores = t.cols.map((c) => {
        const v = l[c];
        return JSONB.has(c) && v !== null && typeof v !== 'string' ? JSON.stringify(v) : v;
      });
      await query(
        `INSERT INTO ${t.nome} (${t.cols.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        valores,
      );
    }
    contagem[t.nome] = linhas.length;
  }
  return contagem;
}
