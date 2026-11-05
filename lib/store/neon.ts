import { neon } from '@neondatabase/serverless';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import {
  EmailTaken,
  RevisionConflict,
  type Campaign,
  type CampaignState,
  type DataStore,
  type User,
} from './index';

/**
 * Backend de producao: Postgres no Neon, provisionado pelo Marketplace da Vercel.
 *
 * Driver HTTP (`neon()`), nao pool: em serverless cada invocacao e' isolada e um
 * pool nao se reaproveita. Uma query = um fetch.
 *
 * Por que Neon e nao Vercel Blob (que seria first-party): o plano gratuito do
 * Blob tem teto de 10.000 operacoes/mes, e este app gasta ~4 por turno — daria
 * ~2.500 turnos/mes para o app inteiro, e ao estourar o Blob bloqueia. O plano
 * gratuito do Neon nao tem teto de operacoes e nao cobra excedente. Detalhes no
 * README.
 *
 * SQL escrito a mao, sem ORM: sao sete consultas.
 */
export class NeonStore implements DataStore {
  readonly backend = 'neon';
  private sql: ReturnType<typeof neon>;

  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL ausente. Provisione o Postgres (Neon) no Marketplace da Vercel ' +
          'ou use DATA_BACKEND=fs para rodar local.',
      );
    }
    this.sql = neon(url);
  }

  /** Cria o esquema. Idempotente; chamada pelo script de migracao. */
  async migrate(): Promise<void> {
    const sql = this.sql;
    await sql`CREATE TABLE IF NOT EXISTS users (
      id            uuid PRIMARY KEY,
      email         text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      nome          text NOT NULL DEFAULT '',
      prefs         jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at    timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS campaigns (
      id         uuid PRIMARY KEY,
      user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      era        text NOT NULL,
      nome       text NOT NULL,
      state      jsonb NOT NULL,
      rev        integer NOT NULL DEFAULT 1,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS campaigns_user_idx ON campaigns(user_id, updated_at DESC)`;
    await sql`CREATE TABLE IF NOT EXISTS quota (
      subject text NOT NULL,
      day     date NOT NULL,
      turns   integer NOT NULL DEFAULT 0,
      PRIMARY KEY (subject, day)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS shares (
      token       text PRIMARY KEY,
      campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      created_at  timestamptz NOT NULL DEFAULT now(),
      revoked_at  timestamptz
    )`;
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
    const id = randomUUID();
    const email = u.email.trim().toLowerCase();
    // ON CONFLICT DO NOTHING + zero linhas = e-mail tomado. A unicidade e'
    // garantida pelo indice UNIQUE, nao por um SELECT antes (que teria corrida).
    const rows = (await this.sql`
      INSERT INTO users (id, email, password_hash, nome, prefs)
      VALUES (${id}, ${email}, ${u.passwordHash}, ${u.nome}, ${JSON.stringify(u.prefs ?? {})}::jsonb)
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `) as any[];
    if (!rows.length) throw new EmailTaken();
    return this.toUser(rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const rows = (await this.sql`
      SELECT * FROM users WHERE email = ${email.trim().toLowerCase()} LIMIT 1
    `) as any[];
    return rows.length ? this.toUser(rows[0]) : null;
  }

  async getUser(id: string): Promise<User | null> {
    const rows = (await this.sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`) as any[];
    return rows.length ? this.toUser(rows[0]) : null;
  }

  async updateUserPrefs(id: string, prefs: User['prefs']): Promise<void> {
    await this.sql`UPDATE users SET prefs = ${JSON.stringify(prefs)}::jsonb WHERE id = ${id}`;
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
    const rows = (await this.sql`
      SELECT * FROM campaigns WHERE user_id = ${userId} ORDER BY updated_at DESC
    `) as any[];
    return rows.map((r) => this.toCampaign(r));
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    const rows = (await this.sql`SELECT * FROM campaigns WHERE id = ${id} LIMIT 1`) as any[];
    return rows.length ? this.toCampaign(rows[0]) : null;
  }

  async createCampaign(
    userId: string,
    era: string,
    nome: string,
    state: CampaignState,
  ): Promise<Campaign> {
    const rows = (await this.sql`
      INSERT INTO campaigns (id, user_id, era, nome, state)
      VALUES (${randomUUID()}, ${userId}, ${era}, ${nome}, ${JSON.stringify(state)}::jsonb)
      RETURNING *
    `) as any[];
    return this.toCampaign(rows[0]);
  }

  /** Lock otimista: o WHERE no rev e' o que impede uma aba sobrescrever a outra. */
  async saveCampaign(id: string, state: CampaignState, rev: number): Promise<number> {
    const rows = (await this.sql`
      UPDATE campaigns
         SET state = ${JSON.stringify(state)}::jsonb, rev = rev + 1, updated_at = now()
       WHERE id = ${id} AND rev = ${rev}
      RETURNING rev
    `) as any[];
    if (!rows.length) throw new RevisionConflict();
    return rows[0].rev;
  }

  async renameCampaign(id: string, nome: string): Promise<void> {
    await this.sql`UPDATE campaigns SET nome = ${nome}, updated_at = now() WHERE id = ${id}`;
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.sql`DELETE FROM campaigns WHERE id = ${id}`;
  }

  // ------------------------------------------------------------------ cota

  /** Atomico numa unica query: sem corrida entre pedidos simultaneos. */
  async bumpQuota(subject: string, day: string): Promise<number> {
    const rows = (await this.sql`
      INSERT INTO quota (subject, day, turns) VALUES (${subject}, ${day}, 1)
      ON CONFLICT (subject, day) DO UPDATE SET turns = quota.turns + 1
      RETURNING turns
    `) as any[];
    return rows[0].turns;
  }

  async getQuota(subject: string, day: string): Promise<number> {
    const rows = (await this.sql`
      SELECT turns FROM quota WHERE subject = ${subject} AND day = ${day} LIMIT 1
    `) as any[];
    return rows.length ? rows[0].turns : 0;
  }

  // --------------------------------------------------------- links publicos

  async createShare(campaignId: string): Promise<string> {
    const token = randomBytes(16).toString('base64url');
    await this.sql`INSERT INTO shares (token, campaign_id) VALUES (${token}, ${campaignId})`;
    return token;
  }

  async resolveShare(token: string): Promise<string | null> {
    const rows = (await this.sql`
      SELECT campaign_id FROM shares WHERE token = ${token} AND revoked_at IS NULL LIMIT 1
    `) as any[];
    return rows.length ? rows[0].campaign_id : null;
  }

  async revokeShare(token: string): Promise<void> {
    await this.sql`UPDATE shares SET revoked_at = now() WHERE token = ${token}`;
  }
}
