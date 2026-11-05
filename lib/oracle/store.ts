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
  private rev: number;
  private conflict = false;

  constructor(
    private campaignId: string,
    private initial: SaveShape | null,
    rev: number,
    private debounceMs = 700,
  ) {
    this.rev = rev;
    if (typeof window !== 'undefined') {
      // Uma jogada feita no ultimo instante nao pode se perder ao sair.
      window.addEventListener('pagehide', () => void this.flush());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') void this.flush();
      });
    }
  }

  read(): SaveShape | null {
    return this.initial;
  }

  write(s: SaveShape): void {
    if (this.conflict) return; // outra aba assumiu; nao sobrescreve
    this.pending = s;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), this.debounceMs);
  }

  /** Envia o que esta' pendente. Agrupa porque o jogo grava a cada setState. */
  async flush(): Promise<void> {
    if (this.inFlight || !this.pending || this.conflict) return;
    const body = this.pending;
    this.pending = null;
    this.inFlight = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    try {
      const res = await fetch(`/api/campaigns/${encodeURIComponent(this.campaignId)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...body, rev: this.rev }),
      });

      if (res.status === 409) {
        // Outra aba (ou outro dispositivo) gravou depois de nos. Parar de
        // escrever e' melhor que sobrescrever o progresso de la'.
        this.conflict = true;
        if (typeof window !== 'undefined') {
          window.alert(
            'Esta crônica foi gravada em outra aba. Recarregue a página para continuar de onde ela parou — ' +
              'o que você fez aqui depois disso não foi salvo.',
          );
        }
        return;
      }
      if (!res.ok) throw new Error('save ' + res.status);

      const j = await res.json().catch(() => null);
      if (j && typeof j.rev === 'number') this.rev = j.rev;
    } catch {
      // Falha de rede: devolve para a fila para nao perder a jogada.
      if (!this.pending) this.pending = body;
      if (!this.timer) this.timer = setTimeout(() => void this.flush(), this.debounceMs * 3);
    } finally {
      this.inFlight = false;
      if (this.pending && !this.timer && !this.conflict) {
        this.timer = setTimeout(() => void this.flush(), this.debounceMs);
      }
    }
  }
}
