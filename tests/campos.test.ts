import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Invariante da padronização dos campos (app/campos.css).
 *
 * A melhoria não é um ajuste de CSS que alguém olha uma vez: ela só continua
 * valendo enquanto TODO campo de uma linha carregar a classe da sua família.
 * O designer entrega uma revisão nova a cada rodada, e um campo novo sem
 * classe passaria despercebido — voltaria a ter a altura do style inline dele,
 * e a linha onde ele está voltaria a ficar desalinhada.
 *
 * Este teste é estático de propósito: roda em milissegundos, junto com o resto,
 * e falha na geração, não no navegador.
 */
const TSX = readFileSync('components/generated/OracleView.tsx', 'utf8');
const CSS = readFileSync('app/campos.css', 'utf8');

/** Tipos de <input> que são campo de texto de uma linha. */
const TEXTO = ['text', 'search', 'tel', 'url', 'email', 'number', 'password'];

/** Abre cada tag <select .../> ou <input .../> do TSX gerado. */
function tags(nome: string): string[] {
  const re = new RegExp(`<${nome}\\b[^>]*>`, 'g');
  return TSX.match(re) ?? [];
}

const tipoDe = (tag: string) => (tag.match(/\btype=\{?"([a-z]+)"/) ?? [, 'text'])[1] as string;

describe('padronização dos campos de uma linha', () => {
  const selects = tags('select');
  const inputs = tags('input').filter((t) => TEXTO.includes(tipoDe(t)));

  it('o template continua tendo campos para padronizar', () => {
    expect(selects.length).toBeGreaterThan(10);
    expect(inputs.length).toBeGreaterThan(10);
  });

  it('todo select declara a família dele', () => {
    const semClasse = selects.filter((t) => !/svf-box|svf-line|svr-sel/.test(t));
    expect(semClasse.map((t) => t.slice(0, 120))).toEqual([]);
  });

  it('todo input de texto declara a família dele', () => {
    const semClasse = inputs.filter((t) => !/svf-box|svf-line/.test(t));
    expect(semClasse.map((t) => t.slice(0, 120))).toEqual([]);
  });

  it('nenhum campo cai em duas famílias', () => {
    const ambas = [...selects, ...inputs].filter((t) => /svf-box/.test(t) && /svf-line/.test(t));
    expect(ambas).toEqual([]);
  });

  it('as duas famílias existem de verdade no template', () => {
    const todos = [...selects, ...inputs];
    expect(todos.filter((t) => /svf-box/.test(t)).length).toBeGreaterThan(0);
    expect(todos.filter((t) => /svf-line/.test(t)).length).toBeGreaterThan(0);
  });

  it('a folha define as duas famílias com a mesma altura canônica', () => {
    // 44px é o valor do próprio designer em .svr-sel; se alguém mudar um dos
    // lados e esquecer o outro, as famílias voltam a divergir.
    expect(CSS).toMatch(/select\.svf-box[\s\S]*?height:\s*44px\s*!important/);
    expect(CSS).toMatch(/select\.svf-line[\s\S]*?min-height:\s*44px\s*!important/);
    expect(CSS).toMatch(/\.svr-sel[\s\S]*?height:\s*44px\s*!important/);
  });
});
