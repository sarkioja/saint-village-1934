import type { CSSProperties } from 'react';

/**
 * Converte uma string de CSS inline num objeto de estilo do React.
 *
 * Por que isto existe
 * -------------------
 * O designer passou a montar alguns `style` inteiros em runtime, como string:
 * `style="{{ r.zs }}"`, onde `zs` é `'left:42%;top:17%;width:8%;…'`. No HTML
 * isso funciona; no React, `style` tem de ser objeto. O transpilador não pode
 * resolver isso em tempo de build porque o valor só existe quando a cena é
 * desenhada — então a conversão acontece aqui, na hora.
 *
 * As regras de divisão são as MESMAS de tools/transpile-template.mjs, de
 * propósito: um `style` escrito à mão no template e um montado em runtime têm
 * de chegar ao mesmo objeto. Daí a divisão consciente de parênteses — valores
 * como `clamp(68px,13vw,156px)`, `var(--sv-bg,#0b0a09)` e gradientes com
 * vírgulas aninhadas quebrariam num split ingênuo por `;` e `:`.
 *
 * NENHUM valor é normalizado: nada de reordenar, encurtar cor ou mexer em
 * espaço interno. O que entra é o que sai — é essa a garantia que o gate de
 * pixels mede.
 */
export function cssInline(css: unknown): CSSProperties | undefined {
  if (typeof css !== 'string' || !css.trim()) return undefined;

  const out: Record<string, string> = {};
  for (const decl of dividirDeclaracoes(css)) {
    const kv = dividirDeclaracao(decl);
    if (!kv) continue; // declaração sem ":" é lixo; ignorar é o que o browser faz
    const [prop, valor] = kv;
    if (!prop) continue;
    // Propriedade customizada (--sv-x) vai com a chave literal: o React a
    // repassa, e CSSProperties não a conhece (daí o cast no retorno).
    out[prop.startsWith('--') ? prop : paraCamel(prop)] = valor;
  }
  return out as CSSProperties;
}

/** Divide por `;` só na profundidade zero de parênteses. */
function dividirDeclaracoes(css: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of css) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ';' && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

/** Divide no PRIMEIRO `:` na profundidade zero — `url(data:…)` não conta. */
function dividirDeclaracao(d: string): [string, string] | null {
  let depth = 0;
  for (let i = 0; i < d.length; i++) {
    const ch = d[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ':' && depth === 0) return [d.slice(0, i).trim(), d.slice(i + 1).trim()];
  }
  return null;
}

/** `background-color` -> `backgroundColor`; `-webkit-mask` -> `WebkitMask`. */
function paraCamel(prop: string): string {
  const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  return prop.startsWith('-') ? camel[0].toUpperCase() + camel.slice(1) : camel;
}
