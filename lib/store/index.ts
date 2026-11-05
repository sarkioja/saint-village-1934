/**
 * Camada de dados.
 *
 * Tudo passa por esta interface para que o backend seja trocavel sem tocar em
 * rota nem componente. Implementacoes:
 *
 *   fs                 -> lib/store/fs.ts        (dev e testes; grava em .data/)
 *   postgres (ou neon) -> lib/store/postgres.ts  (producao)
 *
 * O backend de Postgres nao e' preso a fornecedor: o SQL vive em sql.ts e o
 * driver e' escolhido pela propria DATABASE_URL (HTTP no Neon, `pg` em qualquer
 * outro). Levar os dados para outra conta e' um `pg_dump` — ver "Transferir o
 * projeto" no README.
 *
 * Escolhido por DATA_BACKEND.
 */

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  nome: string;
  prefs: {
    tamanhoNarracao?: 'curto' | 'medio' | 'longo';
    modeloIA?: 'haiku' | 'sonnet';
  };
  createdAt: string;
};

export type CampaignMeta = {
  id: string;
  userId: string;
  era: string;
  nome: string;
  rev: number;
  createdAt: string;
  updatedAt: string;
};

/** O estado de jogo, exatamente na forma que blankEra() produz. */
export type CampaignState = Record<string, unknown>;

export type Campaign = CampaignMeta & { state: CampaignState };

export class RevisionConflict extends Error {
  constructor() {
    super('a cronica foi gravada por outra aba; recarregue');
  }
}

export class EmailTaken extends Error {
  constructor() {
    super('ja existe uma conta com esse e-mail');
  }
}

export interface DataStore {
  readonly backend: string;

  // ---- usuarios ----
  /** Cria o usuario. Lanca EmailTaken se o e-mail ja existir (de forma atomica). */
  createUser(u: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUser(id: string): Promise<User | null>;
  updateUserPrefs(id: string, prefs: User['prefs']): Promise<void>;

  // ---- cronicas ----
  listCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | null>;
  createCampaign(userId: string, era: string, nome: string, state: CampaignState): Promise<Campaign>;
  /** Gravacao com lock otimista: falha com RevisionConflict se rev nao casar. */
  saveCampaign(id: string, state: CampaignState, rev: number): Promise<number>;
  renameCampaign(id: string, nome: string): Promise<void>;
  deleteCampaign(id: string): Promise<void>;

  // ---- cota ----
  /**
   * Incrementa e devolve o total do dia para o sujeito ('user:<id>' ou 'ip:<hash>').
   * Precisa ser atomico: e' o que impede estourar o teto com pedidos simultaneos.
   */
  bumpQuota(subject: string, day: string): Promise<number>;
  getQuota(subject: string, day: string): Promise<number>;

  // ---- links publicos ----
  createShare(campaignId: string): Promise<string>;
  resolveShare(token: string): Promise<string | null>;
  revokeShare(token: string): Promise<void>;
}

let cached: DataStore | null = null;

export async function getStore(): Promise<DataStore> {
  if (cached) return cached;
  const want = (process.env.DATA_BACKEND || 'fs').toLowerCase();
  if (want === 'fs') {
    const { FsStore } = await import('./fs');
    cached = new FsStore();
  } else if (want === 'neon' || want === 'postgres') {
    // `neon` fica como apelido de `postgres`: o driver e' escolhido pela URL.
    const { PostgresStore } = await import('./postgres');
    cached = new PostgresStore();
  } else {
    throw new Error(`DATA_BACKEND desconhecido: ${want}`);
  }
  return cached!;
}

export function __setStore(s: DataStore | null) {
  cached = s;
}

/** Dia corrente em UTC, chave da cota. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
