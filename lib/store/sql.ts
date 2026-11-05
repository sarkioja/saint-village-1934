import { randomUUID, randomBytes } from 'node:crypto';
import { SCHEMA } from './schema.mjs';
import {
  EmailTaken,
  RevisionConflict,
  type Campaign,
  type CampaignState,
  type DataStore,
  type User,
} from './index';

/**
 * Implementacao do DataStore em SQL puro, independente de driver.
 *
 * Nao ha' nada especifico de fornecedor aqui: sao quatro tabelas de Postgres
 * padrao, sem extensao e sem recurso proprietario. E' o que torna o banco
 * portavel — Neon, Supabase, Railway, RDS ou um Postgres seu recebem o mesmo
 * esquema, e um `pg_dump` move os dados entre eles.
 *
 * O driver entra pelo construtor como uma funcao `query(texto, params)`.
 */

export type Query = (text: string, params?: unknown[]) => Promise<any[]>;

export class SqlStore implements DataStore {
  constructor(
    readonly backend: string,
    private q: Query,
  ) {}

  /** Cria o esquema (lib/store/schema.mjs). Idempotente. */
  async migrate(): Promise<void> {
    for (const ddl of SCHEMA) await this.q(ddl);
  }

  // --------------------------------------------------------------- usuarios

  private toUser(r: any): User {
    return {
      id: r.id,
      email: r.email,
      passwordHash: r.password_hash,
      nome: r.nome,
      prefs: r.prefs ?? {},
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  async createUser(u: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    // A unicidade vem do indice UNIQUE, nao de um SELECT antes (que teria corrida).
    const rows = await this.q(
      `INSERT INTO users (id, email, password_hash, nome, prefs)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (email) DO NOTHING
       RETURNING *`,
      [randomUUID(), u.email.trim().toLowerCase(), u.passwordHash, u.nome, JSON.stringify(u.prefs ?? {})],
    );
    if (!rows.length) throw new EmailTaken();
    return this.toUser(rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const rows = await this.q(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [
      email.trim().toLowerCase(),
    ]);
    return rows.length ? this.toUser(rows[0]) : null;
  }

  async getUser(id: string): Promise<User | null> {
    const rows = await this.q(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [id]);
    return rows.length ? this.toUser(rows[0]) : null;
  }

  async updateUserPrefs(id: string, prefs: User['prefs']): Promise<void> {
    await this.q(`UPDATE users SET prefs = $1::jsonb WHERE id = $2`, [JSON.stringify(prefs), id]);
  }

  // --------------------------------------------------------------- cronicas

  private toCampaign(r: any): Campaign {
    return {
      id: r.id,
      userId: r.user_id,
      era: r.era,
      nome: r.nome,
      rev: r.rev,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
      state: r.state ?? {},
    };
  }

  async listCampaigns(userId: string): Promise<Campaign[]> {
    const rows = await this.q(
      `SELECT * FROM campaigns WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId],
    );
    return rows.map((r) => this.toCampaign(r));
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    const rows = await this.q(`SELECT * FROM campaigns WHERE id = $1 LIMIT 1`, [id]);
    return rows.length ? this.toCampaign(rows[0]) : null;
  }

  async createCampaign(
    userId: string,
    era: string,
    nome: string,
    state: CampaignState,
  ): Promise<Campaign> {
    const rows = await this.q(
      `INSERT INTO campaigns (id, user_id, era, nome, state)
       VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING *`,
      [randomUUID(), userId, era, nome, JSON.stringify(state)],
    );
    return this.toCampaign(rows[0]);
  }

  /** Lock otimista: o WHERE no rev e' o que impede uma aba sobrescrever a outra. */
  async saveCampaign(id: string, state: CampaignState, rev: number): Promise<number> {
    const rows = await this.q(
      `UPDATE campaigns SET state = $1::jsonb, rev = rev + 1, updated_at = now()
        WHERE id = $2 AND rev = $3 RETURNING rev`,
      [JSON.stringify(state), id, rev],
    );
    if (!rows.length) throw new RevisionConflict();
    return rows[0].rev;
  }

  async renameCampaign(id: string, nome: string): Promise<void> {
    await this.q(`UPDATE campaigns SET nome = $1, updated_at = now() WHERE id = $2`, [nome, id]);
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.q(`DELETE FROM campaigns WHERE id = $1`, [id]);
  }

  // ------------------------------------------------------------------ cota

  /** Atomico numa unica query: sem corrida entre pedidos simultaneos. */
  async bumpQuota(subject: string, day: string): Promise<number> {
    const rows = await this.q(
      `INSERT INTO quota (subject, day, turns) VALUES ($1, $2, 1)
       ON CONFLICT (subject, day) DO UPDATE SET turns = quota.turns + 1
       RETURNING turns`,
      [subject, day],
    );
    return rows[0].turns;
  }

  async getQuota(subject: string, day: string): Promise<number> {
    const rows = await this.q(
      `SELECT turns FROM quota WHERE subject = $1 AND day = $2 LIMIT 1`,
      [subject, day],
    );
    return rows.length ? rows[0].turns : 0;
  }

  // --------------------------------------------------------- links publicos

  /**
   * Idempotente: se a cronica ja' tem um link ativo, devolve o mesmo em vez de
   * cunhar outro. Sem isso, cada clique no botao criaria mais um token vivo e
   * permanente, e revogar um nao fecharia os demais.
   */
  async createShare(campaignId: string): Promise<string> {
    const existente = await this.q(
      `SELECT token FROM shares WHERE campaign_id = $1 AND revoked_at IS NULL
        ORDER BY created_at LIMIT 1`,
      [campaignId],
    );
    if (existente.length) return existente[0].token;

    const token = randomBytes(16).toString('base64url');
    await this.q(`INSERT INTO shares (token, campaign_id) VALUES ($1, $2)`, [token, campaignId]);
    return token;
  }

  async listShares(campaignId: string): Promise<Array<{ token: string; createdAt: string }>> {
    const rows = await this.q(
      `SELECT token, created_at FROM shares
        WHERE campaign_id = $1 AND revoked_at IS NULL ORDER BY created_at`,
      [campaignId],
    );
    return rows.map((r) => ({ token: r.token, createdAt: new Date(r.created_at).toISOString() }));
  }

  async resolveShare(token: string): Promise<string | null> {
    const rows = await this.q(
      `SELECT campaign_id FROM shares WHERE token = $1 AND revoked_at IS NULL LIMIT 1`,
      [token],
    );
    return rows.length ? rows[0].campaign_id : null;
  }

  async revokeShare(token: string): Promise<void> {
    await this.q(`UPDATE shares SET revoked_at = now() WHERE token = $1`, [token]);
  }
}
