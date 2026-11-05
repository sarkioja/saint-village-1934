import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir, rm, rename } from 'node:fs/promises';
import path from 'node:path';
import {
  EmailTaken,
  RevisionConflict,
  type Campaign,
  type CampaignState,
  type DataStore,
  type User,
} from './index';

/**
 * Backend de arquivo, para desenvolvimento e testes.
 *
 * NAO use em producao na Vercel: o sistema de arquivos de uma function e'
 * efemero e nao e' compartilhado entre instancias. Serve para rodar o app
 * inteiro na maquina sem provisionar banco.
 *
 * As escritas usam write-em-temporario-e-renomeia para nao deixar JSON partido,
 * e o lock otimista e' o mesmo contrato das outras implementacoes (campo rev).
 */
export class FsStore implements DataStore {
  readonly backend = 'fs';
  private root = process.env.SV_DATA_DIR || '.data';

  private p(...parts: string[]) {
    return path.join(this.root, ...parts);
  }

  private async readJson<T>(file: string): Promise<T | null> {
    try {
      return JSON.parse(await readFile(file, 'utf8')) as T;
    } catch {
      return null;
    }
  }

  private async writeJson(file: string, data: unknown) {
    await mkdir(path.dirname(file), { recursive: true });
    const tmp = file + '.' + randomBytes(4).toString('hex') + '.tmp';
    await writeFile(tmp, JSON.stringify(data));
    await rename(tmp, file);
  }

  private emailKey(email: string) {
    return createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  }

  // --------------------------------------------------------------- usuarios

  async createUser(u: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const idxFile = this.p('users', 'by-email', this.emailKey(u.email) + '.json');
    if (await this.readJson(idxFile)) throw new EmailTaken();
    const user: User = { ...u, id: randomUUID(), createdAt: new Date().toISOString() };
    await this.writeJson(this.p('users', user.id + '.json'), user);
    await this.writeJson(idxFile, { userId: user.id });
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const idx = await this.readJson<{ userId: string }>(
      this.p('users', 'by-email', this.emailKey(email) + '.json'),
    );
    return idx ? this.getUser(idx.userId) : null;
  }

  async getUser(id: string): Promise<User | null> {
    return this.readJson<User>(this.p('users', id + '.json'));
  }

  async updateUserPrefs(id: string, prefs: User['prefs']): Promise<void> {
    const u = await this.getUser(id);
    if (!u) return;
    await this.writeJson(this.p('users', id + '.json'), { ...u, prefs });
  }

  // --------------------------------------------------------------- cronicas

  async listCampaigns(userId: string): Promise<Campaign[]> {
    const dir = this.p('campaigns', userId);
    let names: string[] = [];
    try {
      names = await readdir(dir);
    } catch {
      return [];
    }
    const out: Campaign[] = [];
    for (const n of names.filter((n) => n.endsWith('.json'))) {
      const c = await this.readJson<Campaign>(path.join(dir, n));
      if (c) out.push(c);
    }
    return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  /** Sem indice: varre os usuarios. Aceitavel num backend de dev. */
  private async findCampaignFile(id: string): Promise<string | null> {
    try {
      for (const userId of await readdir(this.p('campaigns'))) {
        const f = this.p('campaigns', userId, id + '.json');
        if (await this.readJson(f)) return f;
      }
    } catch {
      /* diretorio ainda nao existe */
    }
    return null;
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    const f = await this.findCampaignFile(id);
    return f ? this.readJson<Campaign>(f) : null;
  }

  async createCampaign(
    userId: string,
    era: string,
    nome: string,
    state: CampaignState,
  ): Promise<Campaign> {
    const now = new Date().toISOString();
    const c: Campaign = {
      id: randomUUID(),
      userId,
      era,
      nome,
      rev: 1,
      createdAt: now,
      updatedAt: now,
      state,
    };
    await this.writeJson(this.p('campaigns', userId, c.id + '.json'), c);
    return c;
  }

  async saveCampaign(id: string, state: CampaignState, rev: number): Promise<number> {
    const f = await this.findCampaignFile(id);
    if (!f) throw new Error('cronica nao encontrada: ' + id);
    const c = await this.readJson<Campaign>(f);
    if (!c) throw new Error('cronica nao encontrada: ' + id);
    if (c.rev !== rev) throw new RevisionConflict();
    const next = c.rev + 1;
    await this.writeJson(f, { ...c, state, rev: next, updatedAt: new Date().toISOString() });
    return next;
  }

  async renameCampaign(id: string, nome: string): Promise<void> {
    const f = await this.findCampaignFile(id);
    if (!f) return;
    const c = await this.readJson<Campaign>(f);
    if (c) await this.writeJson(f, { ...c, nome, updatedAt: new Date().toISOString() });
  }

  async deleteCampaign(id: string): Promise<void> {
    const f = await this.findCampaignFile(id);
    if (f) await rm(f, { force: true });
  }

  // ------------------------------------------------------------------ cota

  async bumpQuota(subject: string, day: string): Promise<number> {
    const f = this.p('quota', day, createHash('sha256').update(subject).digest('hex') + '.json');
    const cur = (await this.readJson<{ turns: number }>(f))?.turns ?? 0;
    const next = cur + 1;
    await this.writeJson(f, { turns: next, subject });
    return next;
  }

  async getQuota(subject: string, day: string): Promise<number> {
    const f = this.p('quota', day, createHash('sha256').update(subject).digest('hex') + '.json');
    return (await this.readJson<{ turns: number }>(f))?.turns ?? 0;
  }

  // --------------------------------------------------------- links publicos

  async createShare(campaignId: string): Promise<string> {
    const token = randomBytes(16).toString('base64url');
    await this.writeJson(this.p('shares', token + '.json'), {
      campaignId,
      createdAt: new Date().toISOString(),
    });
    return token;
  }

  async resolveShare(token: string): Promise<string | null> {
    const s = await this.readJson<{ campaignId: string; revokedAt?: string }>(
      this.p('shares', token + '.json'),
    );
    return s && !s.revokedAt ? s.campaignId : null;
  }

  async revokeShare(token: string): Promise<void> {
    const f = this.p('shares', token + '.json');
    const s = await this.readJson<Record<string, unknown>>(f);
    if (s) await this.writeJson(f, { ...s, revokedAt: new Date().toISOString() });
  }
}
