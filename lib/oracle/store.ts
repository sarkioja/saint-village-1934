'use client';

/**
 * Persistencia do estado de jogo.
 *
 * O artifact original gravava direto em localStorage['sv-cronica-v2'] a cada
 * mutacao. A forma do dado NAO muda aqui — e' exatamente o que blankEra() produz
 * — so' o meio: localStorage na demo anonima, API na conta.
 */

/** Chave do artifact original. Mantida de proposito: permite importar o save da demo. */
export const LS_KEY = 'sv-cronica-v2';

export type EraState = {
  char: Record<string, any>;
  log: Array<Record<string, any>>;
  caso: Record<string, any>;
  cena: string;
  naCena: string[];
  custom: Array<Record<string, any>>;
};

export type SaveShape = {
  era: string | null;
  tab: string;
  eras: Record<string, EraState>;
};

export interface Store {
  /** Leitura sincrona do estado inicial. */
  read(): SaveShape | null;
  /** Gravacao. Pode ser assincrona//debounced por dentro; o chamador nao espera. */
  write(s: SaveShape): void;
}

/** Demo anonima: mesma chave do artifact, para o progresso local ser importavel. */
export class LocalStore implements Store {
  read(): SaveShape | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return s && s.eras ? s : null;
    } catch {
      return null;
    }
  }

  write(s: SaveShape): void {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    } catch {
      /* cota de localStorage estourada ou modo privado: ignora, como no original */
    }
  }
}

/**
 * Conta logada: estado inicial vem pre-carregado e as gravacoes vao para a API,
 * agrupadas numa janela curta porque o componente chama save() a cada setState.
 */
export class RemoteStore implements Store {
  private pending: SaveShape | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight = false;

  constructor(
    private campaignId: string,
    private initial: SaveShape | null,
    private onError?: (e: unknown) => void,
    private debounceMs = 700,
  ) {}

  read(): SaveShape | null {
    return this.initial;
  }

  write(s: SaveShape): void {
    this.pending = s;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), this.debounceMs);
  }

  /** Forca o envio do que esta' pendente (usar ao sair da pagina). */
  async flush(): Promise<void> {
    if (this.inFlight || !this.pending) return;
    const body = this.pending;
    this.pending = null;
    this.inFlight = true;
    try {
      const res = await fetch(`/api/campaigns/${encodeURIComponent(this.campaignId)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('save ' + res.status);
    } catch (e) {
      // Devolve para a fila para nao perder a jogada.
      if (!this.pending) this.pending = body;
      this.onError?.(e);
    } finally {
      this.inFlight = false;
      if (this.pending && !this.timer) {
        this.timer = setTimeout(() => void this.flush(), this.debounceMs);
      }
    }
  }
}
