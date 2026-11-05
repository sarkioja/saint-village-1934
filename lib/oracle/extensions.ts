/**
 * Automações do fluxo de jogo: marcações que o narrador escreve e o app aplica
 * sozinho, para o jogador não ter de repetir à mão o que a cena acabou de dizer.
 *
 * Por que isto não entra em `ingest()`
 * ------------------------------------
 * `ingest()` é o motor de regras do artifact, copiado verbatim, e seu `switch`
 * não tem caso para estas chaves: hoje uma marcação desconhecida cai no
 * `default: return m` e sobra como lixo no meio da prosa. Em vez de editar o
 * motor — o que destruiria a garantia de porte verbatim — as chaves novas são
 * lidas e REMOVIDAS antes, e o motor recebe só o vocabulário que conhece.
 *
 * Por que a aplicação vem DEPOIS do ingest
 * ----------------------------------------
 * `ingest()` lê `this.cur()` fora do `setState` e depois grava `char`, `caso` e
 * `naCena` inteiros. Qualquer escrita feita antes dele seria sobrescrita. Por
 * isso são duas etapas: `lerExtensoes()` limpa o texto antes, e
 * `aplicarExtensoes()` grava depois — e grava dentro de um updater funcional,
 * que é o único jeito de enxergar as pistas que o próprio ingest acabou de criar.
 */

import REGRAS from './data/regras.json';
import LIVROS from './data/livros.json';

const norm = (s: string) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();

const uid = () => Math.random().toString(36).slice(2, 9);

/** Teto de Fios no Mural. O jogador cria de 2 a 5; o narrador não enche o quadro. */
const MAX_FIOS = 24;

/** Uma pista é referenciada por número (“1”) ou por trecho do texto. */
type Ref = string;

export type Extensoes = {
  /** O texto sem as marcações novas — é ele que vai para o ingest(). */
  texto: string;
  /** Região para onde a cena se mudou, como o narrador escreveu. */
  cena: string | null;
  /** Título e premissa do caso, quando o narrador abre um. */
  caso: { titulo: string; premissa: string } | null;
  /** Fios propostos para o Mural, ainda sem resolver contra as pistas. */
  fios: { a: Ref; b: Ref; rel: string }[];
};

const VAZIO = (texto: string): Extensoes => ({ texto, cena: null, caso: null, fios: [] });

/**
 * Lê as marcações novas e devolve o texto sem elas.
 *
 * Não normaliza mais nada: tudo que não for CENA, CASO ou FIO-NOVO volta byte a
 * byte como veio, para o ingest() se comportar exatamente como se comportava.
 */
export function lerExtensoes(bruto: string): Extensoes {
  const ext = VAZIO('');
  ext.texto = (bruto || '').replace(/\[([^[\]]{1,600})\]/g, (todo, dentro: string) => {
    const i = dentro.indexOf(':');
    if (i < 0) return todo;
    const chave = norm(dentro.slice(0, i)).replace(/[\s-]+/g, '');
    const val = dentro.slice(i + 1).trim();
    if (!val) return todo;

    if (chave === 'CENA') {
      ext.cena = val;
      return '';
    }
    if (chave === 'CASO') {
      const [t, p] = val.split('|');
      ext.caso = { titulo: (t || '').trim(), premissa: (p || '').trim() };
      return '';
    }
    if (chave === 'FIONOVO') {
      const [a, b, ...resto] = val.split('|');
      const rel = resto.join('|').trim();
      if (a && b && rel) ext.fios.push({ a: a.trim(), b: b.trim(), rel });
      return '';
    }
    return todo;
  });
  return ext;
}

/** Há alguma coisa a aplicar? Evita um save() por turno quando não há. */
export function temExtensoes(ext: Extensoes): boolean {
  return !!(ext.cena || ext.caso || ext.fios.length);
}

/** Resolve o nome que o narrador escreveu contra as regiões reais da era. */
function acharRegiao(era: string, alvo: string): string | null {
  const regioes: { nome: string }[] = ((LIVROS as any)[era] || {}).regioes || [];
  const a = norm(alvo);
  if (!a) return null;
  const exata = regioes.find((r) => norm(r.nome) === a);
  if (exata) return exata.nome;
  if (a.length < 4) return null;
  const parcial = regioes.find((r) => norm(r.nome).includes(a) || a.includes(norm(r.nome)));
  return parcial ? parcial.nome : null;
}

/** Resolve “1” ou “o bilhete rasgado” contra as pistas já anotadas. */
function acharPista(pistas: { id: string; t: string }[], ref: Ref): string | null {
  const n = parseInt(ref.replace(/\D/g, ''), 10);
  if (/^\s*\d+\s*$/.test(ref) && n >= 1 && n <= pistas.length) return pistas[n - 1].id;
  const a = norm(ref);
  if (a.length < 4) return null;
  const exata = pistas.find((p) => norm(p.t) === a);
  if (exata) return exata.id;
  const parcial = pistas.find((p) => norm(p.t).includes(a) || a.includes(norm(p.t)));
  return parcial ? parcial.id : null;
}

const temMural = (era: string) => (((REGRAS as any)[era] || {}).mods || []).includes('mural');

/**
 * Aplica as extensões sobre o estado de uma era. Função pura: recebe o estado,
 * devolve o novo e a lista de efeitos para a linha de mecânica do log.
 *
 * `e` já é o estado DEPOIS do ingest, então as pistas criadas neste mesmo turno
 * já estão lá e um [FIO-NOVO] pode apontar para elas.
 */
export function calcularExtensoes(
  ext: Extensoes,
  e: any,
  era: string,
): { estado: any; efeitos: string[] } {
  const efeitos: string[] = [];
  let estado = e;

  if (ext.cena) {
    const r = acharRegiao(era, ext.cena);
    if (r && r !== estado.cena) {
      estado = { ...estado, cena: r };
      efeitos.push('Cena: ' + r);
    }
  }

  if (ext.caso) {
    const caso = estado.caso;
    const patch: Record<string, string> = {};
    // Só preenche o que está em branco: o que o jogador escreveu é dele.
    if (ext.caso.titulo && !(caso.titulo || '').trim()) patch.titulo = ext.caso.titulo;
    if (ext.caso.premissa && !(caso.premissa || '').trim()) patch.premissa = ext.caso.premissa;
    if (Object.keys(patch).length) {
      estado = { ...estado, caso: { ...caso, ...patch } };
      efeitos.push('Caso aberto: ' + (patch.titulo || caso.titulo || ext.caso.premissa));
    }
  }

  if (ext.fios.length && temMural(era)) {
    const caso = estado.caso;
    const pistas = caso.pistas || [];
    let fios = caso.fios || [];
    let novos = 0;
    for (const f of ext.fios) {
      if (fios.length >= MAX_FIOS) break;
      const a = acharPista(pistas, f.a);
      const b = acharPista(pistas, f.b);
      if (!a || !b || a === b) continue;
      if (fios.some((x: any) => (x.a === a && x.b === b) || (x.a === b && x.b === a))) continue;
      fios = [...fios, { id: uid(), a, b, rel: f.rel, st: 'solto' }];
      novos++;
    }
    if (novos) {
      estado = { ...estado, caso: { ...caso, fios } };
      efeitos.push(novos === 1 ? 'Fio novo no Mural' : novos + ' Fios novos no Mural');
    }
  }

  return { estado, efeitos };
}

/**
 * Grava as extensões no componente. Chamar DEPOIS de `ingest()`, no mesmo tique:
 * o updater funcional roda em cima do estado que o ingest já deixou.
 */
export function aplicarExtensoes(ext: Extensoes, comp: any): void {
  if (!temExtensoes(ext)) return;
  const era = comp.state.era;
  comp.upd((e: any) => {
    const { estado, efeitos } = calcularExtensoes(ext, e, era);
    if (!efeitos.length) return e;
    return {
      ...estado,
      log: [...estado.log, { id: uid(), k: 'mech', who: 'Ficha', text: efeitos.join(' · ') }],
    };
  });
}

/**
 * Durante o stream, remove marcações completas e qualquer marcação parcial no
 * fim do buffer, para que nada como "[PIST" pisque na tela.
 */
export function stripMarks(t: string): string {
  return t
    .replace(/\[[^[\]]{1,600}\]/g, '')
    .replace(/\[[^[\]]{0,600}$/, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}
