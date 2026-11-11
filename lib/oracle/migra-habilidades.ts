import REGRAS from './data/regras.json';
import REN from './data/hab-ren.json';

/**
 * Migra fichas salvas sob os nomes antigos de habilidade.
 *
 * O designer renomeou 18 habilidades nesta versão ('Tiro' virou 'Armas de
 * Fogo', 'Atletismo' e 'Fuga' fundiram-se em 'Fôlego e Resistência') e publica
 * o par `window.SV_HAB_MIGRA = { inv, esp }` para converter saves antigos no
 * carregamento. Esse objeto é de FUNÇÕES, então não cabe no snapshot JSON que
 * o resto dos dados usa — por isso as duas estão aqui, reescritas à mão,
 * tipadas e cobertas por teste, em vez de o porte perder a migração.
 *
 * A tabela de renomeação em si continua vindo do artifact
 * (lib/oracle/data/hab-ren.json, gerado por tools/split-data.mjs): o que o
 * designer renomear na próxima rodada entra sozinho.
 *
 * Sem isto, quem já tem ficha salva veria as perícias zeradas — os nomes
 * antigos simplesmente não existem mais na lista nova.
 */

const R: any = REGRAS as any;
const base: any = R['1934'] || Object.values(R).find((x: any) => x && x.gerais);

const GERAIS: string[] = base?.gerais ?? [];
const INV_TODAS: string[] = [
  ...(base?.invAcad ?? []),
  ...(base?.invTec ?? []),
  ...(base?.invInter ?? []),
];

const renomear = (k: string): string => (REN as Record<string, string>)[k] ?? k;

/** Máximo de pontos numa investigativa, como no artifact. */
const TETO = 3;

/**
 * Investigativas: renomeia, funde duplicatas pelo maior valor e redistribui os
 * pontos que a fusão liberou — duas perícias antigas que viraram a mesma não
 * podem custar o dobro nem sumir com o investimento do jogador.
 */
export function migrarInvestigativas(
  antigas: Record<string, number> | null | undefined,
  pool: string[] = [],
): Record<string, number> {
  const old = antigas ?? {};
  // Pontos gastos acima do 1 de base: é isso que o jogador investiu.
  const gastos = Object.values(old).reduce((s, v) => s + Math.max(0, (v || 0) - 1), 0);

  const novas: Record<string, number> = {};
  for (const k of Object.keys(old)) {
    const n = renomear(k);
    if (INV_TODAS.includes(n)) novas[n] = Math.max(novas[n] ?? 0, old[k] || 0);
  }

  let sobra = gastos - Object.values(novas).reduce((s, v) => s + Math.max(0, v - 1), 0);

  const destinos = Object.keys(novas)
    .sort((x, y) => novas[y] - novas[x])
    .concat(pool.filter((x) => INV_TODAS.includes(x) && !(x in novas)));

  for (let i = 0; sobra > 0 && i < 80 && destinos.length; i++) {
    const k = destinos[i % destinos.length];
    if ((novas[k] ?? 1) < TETO) {
      novas[k] = (novas[k] ?? 1) + 1;
      sobra--;
    }
  }
  return novas;
}

/**
 * Especialidades gerais: renomeia, descarta o que não é geral e tira
 * duplicata. Se a fusão encolheu a lista, completa com as de reserva para o
 * jogador não sair da migração com menos especialidades do que tinha.
 */
export function migrarEspecialidades(antigas: string[] | null | undefined): string[] {
  const arr = antigas ?? [];
  const out: string[] = [];
  for (const k of arr) {
    const n = renomear(k);
    if (GERAIS.includes(n) && !out.includes(n)) out.push(n);
  }
  const RESERVA = ['Sexto Sentido', 'Improviso', 'Furtividade', 'Fôlego e Resistência'];
  for (const f of RESERVA) {
    if (out.length >= arr.length) break;
    if (!out.includes(f)) out.push(f);
  }
  return out;
}

/** Mesma forma que `window.SV_HAB_MIGRA`, para o código portado usar igual. */
export const SV_HAB_MIGRA = { inv: migrarInvestigativas, esp: migrarEspecialidades };
export const SV_HAB_REN = REN as Record<string, string>;
