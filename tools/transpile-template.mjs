// Transpila source/template.html (markup declarativo do artifact) para JSX.
//
// REGRA CENTRAL: nenhum valor de CSS e' normalizado. Nada e' reordenado, encurtado
// ou reescrito. So' o que e' estrutural muda (sc-if -> ternario, style="" -> objeto).
// Texto e' emitido como string literal explicita para que o JSX nao apare espacos
// em branco nas bordas de linha, que mudaria render em limites de elementos inline.
//
// Conjunto de construcoes e' fechado e foi medido no arquivo real (ver censo no README).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parseDocument } from 'htmlparser2';

const SRC = 'source/template.html';
const OUT_TSX = 'components/generated/OracleView.tsx';
const OUT_CSS = 'components/generated/hover.css';

// ---------------------------------------------------------------- utilidades

const VOID = new Set(['img', 'input', 'br', 'hr', 'link', 'meta', 'source', 'area', 'col']);

// Atributos que sao dicas do editor de artifacts, nao renderizam.
const isHint = (n) => n.startsWith('hint-');

// Elementos declarativos do runtime antigo -> elemento HTML real.
const TAG_MAP = { 'sc-raw-select': 'select' };

// Em HTML tudo e' string; em React estes atributos sao number ou boolean.
// Valores literais sao convertidos; expressoes passam direto (valor vem em runtime).
const NUMERIC_ATTRS = new Set([
  'rows', 'cols', 'size', 'span', 'start', 'maxLength', 'minLength',
  'tabIndex', 'colSpan', 'rowSpan',
]);

// `width` e `height` sao number no HTML (<img width="200">) mas aceitam unidade
// no SVG (<filter width="112%">). Converte quando o valor e' um numero puro,
// mantem string caso contrario — correto nos dois contextos, sem precisar saber
// em qual deles o elemento esta'.
const NUMERIC_OU_UNIDADE = new Set(['width', 'height']);
const BOOLEAN_ATTRS = new Set([
  'draggable', 'disabled', 'checked', 'readOnly', 'required',
  // `open` chega como open="" em <details>: em HTML a presenca do atributo ja e'
  // o valor; em React precisa ser o booleano.
  'multiple', 'autoFocus', 'hidden', 'autoPlay', 'controls', 'loop', 'muted', 'open',
]);

// Atributos HTML com nome diferente em React.
const ATTR_MAP = {
  class: 'className',
  for: 'htmlFor',
  inputmode: 'inputMode',
  draggable: 'draggable',
  maxlength: 'maxLength',
  readonly: 'readOnly',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  tabindex: 'tabIndex',
  autocomplete: 'autoComplete',
  spellcheck: 'spellCheck',
};

// Assets que o artifact referenciava por UUID (do manifest empacotado) e que agora
// sao servidos de /public. Toda ocorrencia precisa estar nesta tabela: um UUID de
// 36 chars que sobre sem mapeamento faz o build falhar (ver checagem no fim).
// Gerado por tools/sync-assets.mjs a partir do que o artifact realmente trouxe.
// Nao escreva UUIDs a mao aqui: eles mudam a cada exportacao.
const ASSET_URLS = JSON.parse(readFileSync('source/asset-map.json', 'utf8'));

/** Troca UUID de asset por caminho servido, em qualquer valor (style, src, etc.). */
function mapAssets(value) {
  let out = value;
  for (const [uuid, url] of Object.entries(ASSET_URLS)) {
    out = out.split(uuid).join(url);
  }
  return out;
}

/** Split de declaracoes CSS que respeita parenteses: `clamp(a,b,c)` tem virgulas dentro. */
function splitDecls(css) {
  const out = [];
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

/** Separa `prop: valor` no PRIMEIRO `:` com profundidade zero (urls tem `:` dentro). */
function splitDecl(d) {
  let depth = 0;
  for (let i = 0; i < d.length; i++) {
    const ch = d[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ':' && depth === 0) return [d.slice(0, i).trim(), d.slice(i + 1).trim()];
  }
  return null;
}

/** `background-color` -> `backgroundColor`; `--sv-bg` fica literal; `-webkit-x` -> `WebkitX`. */
function cssPropToReact(prop) {
  if (prop.startsWith('--')) return null; // chave literal, precisa de quoting
  const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return prop.startsWith('-') ? camel[0].toUpperCase() + camel.slice(1) : camel;
}

// ------------------------------------------------------- escopo de expressoes

/**
 * Toda expressao do template e' identificador ou caminho pontuado (verificado: 554/554).
 * Se a raiz for variavel de um sc-for em escopo, fica nua; senao recebe prefixo `v.`.
 */
function scopeExpr(expr, scope) {
  const e = expr.trim();
  const root = e.split('.')[0];
  if (scope.includes(root)) return e;
  if (root === 'true' || root === 'false' || root === 'null') return root;
  return 'v.' + e;
}

/**
 * Converte uma string que pode misturar texto literal e `{{ expr }}` numa expressao JS.
 * Sem `{{` -> string literal. So' uma expressao -> a expressao. Misto -> template literal.
 */
function interp(rawIn, scope) {
  const raw = mapAssets(rawIn);
  if (!raw.includes('{{')) return JSON.stringify(raw);
  const only = raw.match(/^\s*\{\{([^{}]*)\}\}\s*$/);
  if (only) return scopeExpr(only[1], scope);
  const tpl = raw.replace(/[`\\$]/g, (m) => '\\' + m).replace(
    /\{\{([^{}]*)\}\}/g,
    (_, e) => '${' + scopeExpr(e, scope) + '}',
  );
  return '`' + tpl + '`';
}

// ------------------------------------------------------------ regras de hover

/** Campos de uma linha classificados por familia (ver familiaDeCampo). */
const campos = [];

const hoverRules = [];
function addHoverRule(decls) {
  const cls = 'svh-' + hoverRules.length;
  hoverRules.push(`.${cls}:hover{${decls}}`);
  return cls;
}

// ------------------------------------------------------------------ emissores

function emitStyle(raw, scope) {
  const parts = [];
  for (const d of splitDecls(raw)) {
    if (!d.trim()) continue;
    const kv = splitDecl(d);
    if (!kv) throw new Error('declaracao CSS sem ":" -> ' + JSON.stringify(d));
    const [prop, value] = kv;
    const key = cssPropToReact(prop);
    const v = interp(value, scope);
    parts.push(key === null ? `${JSON.stringify(prop)}: ${v}` : `${key}: ${v}`);
  }
  // Propriedades customizadas (--d, --tab-bg) sao validas em runtime e o React
  // as repassa, mas CSSProperties so conhece as padrao. O cast fica restrito aos
  // objetos que de fato tem uma: todo o resto continua sendo checado pelo tsc.
  const custom = parts.some((p) => p.startsWith('"--'));
  return '{' + parts.join(', ') + '}' + (custom ? ' as React.CSSProperties' : '');
}

/**
 * Familia visual de um campo de uma linha, lida do style inline do designer.
 *
 * E a mesma leitura que o olho faz: `border:` nos quatro lados e um campo com
 * caixa; `border:none` mais `border-bottom:` e um campo sublinhado. A classe
 * resultante e o gancho de app/campos.css, que iguala altura e recuo dentro de
 * cada familia — ver o comentario de la para os numeros medidos.
 *
 * Devolve null para o que nao e campo de uma linha (textarea, checkbox, o
 * range do player) ou nao tem style inline (o .svr-sel ja nasce canonico).
 */
function familiaDeCampo(tag, attribs) {
  if (tag !== 'select' && tag !== 'input') return null;
  const tipo = (attribs.type || 'text').toLowerCase();
  const TEXTO = ['text', 'search', 'tel', 'url', 'email', 'number', 'password'];
  if (tag === 'input' && !TEXTO.includes(tipo)) return null;
  const style = attribs.style || '';
  if (/(^|;)\s*border\s*:\s*(?!none)/.test(style)) return 'svf-box';
  if (/(^|;)\s*border-bottom\s*:/.test(style)) return 'svf-line';
  return null;
}

function emitAttrs(node, scope) {
  const out = [];
  let hoverClass = null;
  const familia = familiaDeCampo(TAG_MAP[node.name] || node.name, node.attribs);
  if (familia) campos.push(familia);
  // O v2 passou a usar class= e style-hover no MESMO elemento. Emitir os dois
  // daria dois className no JSX — erro de compilacao, e em runtime o React
  // ficaria so com o ultimo, perdendo as classes do template.
  let classAttr = null;

  for (const [name, raw] of Object.entries(node.attribs)) {
    if (isHint(name)) continue;

    // style-hover: vira regra CSS gerada + className
    if (name === 'style-hover') {
      if (raw.includes('{{')) throw new Error('style-hover com expressao nao suportado');
      hoverClass = addHoverRule(raw);
      continue;
    }

    // handlers: sc-camel-on-click -> onClick, sc-camel-on-pointer-down -> onPointerDown
    if (name.startsWith('sc-camel-on-')) {
      const ev = name
        .slice('sc-camel-on-'.length)
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      out.push(`on${ev[0].toUpperCase() + ev.slice(1)}={${interp(raw, scope)}}`);
      continue;
    }

    // Demais sc-camel-*: atributo em camelCase. E' assim que os atributos de SVG
    // chegam, porque o HTML os minuscula e o React os quer camelCase:
    //   sc-camel-view-box       -> viewBox
    //   sc-camel-base-frequency -> baseFrequency
    //   sc-camel-std-deviation  -> stdDeviation
    if (name.startsWith('sc-camel-')) {
      const attr = name.slice('sc-camel-'.length).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      out.push(`${attr}={${interp(raw, scope)}}`);
      continue;
    }

    if (name === 'style') {
      out.push(`style={${emitStyle(raw, scope)}}`);
      continue;
    }

    if (name === 'ref') {
      out.push(`ref={${interp(raw, scope)}}`);
      continue;
    }

    const reactName = ATTR_MAP[name] || name;

    if (reactName === 'className') {
      classAttr = interp(raw, scope);
      continue;
    }

    // Literal numerico/booleano: converte. Com `{{ }}`, deixa o valor de runtime.
    if (!raw.includes('{{')) {
      if (NUMERIC_OU_UNIDADE.has(reactName)) {
        const t = raw.trim();
        out.push(/^-?\d+(\.\d+)?$/.test(t) ? `${reactName}={${Number(t)}}` : `${reactName}=${JSON.stringify(t)}`);
        continue;
      }
      if (NUMERIC_ATTRS.has(reactName)) {
        if (!/^-?\d+(\.\d+)?$/.test(raw.trim())) {
          throw new Error(`${reactName} nao e' numerico: ${JSON.stringify(raw)}`);
        }
        out.push(`${reactName}={${Number(raw.trim())}}`);
        continue;
      }
      if (BOOLEAN_ATTRS.has(reactName)) {
        const t = raw.trim();
        if (t !== 'true' && t !== 'false' && t !== '' && t !== reactName) {
          throw new Error(`${reactName} nao e' booleano: ${JSON.stringify(raw)}`);
        }
        // `open=""` e' FALSO, nao verdadeiro. Em HTML puro a presenca do
        // atributo bastaria, mas o artifact tambem e' React: ele entrega o
        // valor do template como string, e o React omite o atributo booleano
        // quando a string e' vazia. Medido no gate — os <details class=
        // "sv-step" open=""> do original renderizam FECHADOS, e emiti-los
        // abertos esticava a aba Ficha de 995px para 1719px.
        const vera = t === 'true' || t === reactName;
        out.push(`${reactName}={${vera}}`);
        continue;
      }
    }

    out.push(`${reactName}={${interp(raw, scope)}}`);
  }

  const classes = [hoverClass, familia].filter(Boolean).join(' ');
  if (classAttr && classes) {
    out.push('className={' + classAttr + ' + ' + JSON.stringify(' ' + classes) + '}');
  } else if (classAttr) {
    out.push('className={' + classAttr + '}');
  } else if (classes) {
    out.push(`className=${JSON.stringify(classes)}`);
  }
  return out.length ? ' ' + out.join(' ') : '';
}

/** Texto sai como string literal explicita: o JSX nao toca em espacos em branco assim. */
function emitText(data, scope) {
  if (!data) return '';
  if (!data.includes('{{')) {
    if (!data.trim() && !data.includes(' ')) {
      // Espaco em branco puro entre elementos: preserva do jeito que esta'.
      return `{${JSON.stringify(data)}}`;
    }
    return `{${JSON.stringify(data)}}`;
  }
  // Texto com interpolacao: quebra em pedacos para nao perder nada.
  const pieces = [];
  let last = 0;
  for (const m of data.matchAll(/\{\{([^{}]*)\}\}/g)) {
    if (m.index > last) pieces.push(JSON.stringify(data.slice(last, m.index)));
    pieces.push(scopeExpr(m[1], scope));
    last = m.index + m[0].length;
  }
  if (last < data.length) pieces.push(JSON.stringify(data.slice(last)));
  return pieces.map((p) => `{${p}}`).join('');
}

function emitChildren(children, scope, indent) {
  return children.map((c) => emitNode(c, scope, indent)).join('');
}

function emitNode(node, scope, indent) {
  const pad = '  '.repeat(indent);

  if (node.type === 'text') return emitText(node.data, scope);
  if (node.type === 'comment') return '';
  if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') return '';

  const tag = node.name;

  // ---- sc-if -> ternario
  if (tag === 'sc-if') {
    const cond = interp(node.attribs.value ?? '', scope);
    const inner = emitChildren(node.children, scope, indent + 1);
    return `\n${pad}{${cond} ? (<>${inner}</>) : null}`;
  }

  // ---- sc-for -> map
  if (tag === 'sc-for') {
    const list = interp(node.attribs.list ?? '', scope);
    const as = (node.attribs.as || 'item').trim();
    const idx = `${as}__i`;
    const inner = emitChildren(node.children, [...scope, as], indent + 1);
    return `\n${pad}{(${list} ?? []).map((${as}: any, ${idx}: number) => (<Fragment key={${idx}}>${inner}</Fragment>))}`;
  }

  // ---- elemento comum
  const name = TAG_MAP[tag] || tag;
  const attrs = emitAttrs(node, scope);

  if (VOID.has(name)) return `\n${pad}<${name}${attrs} />`;

  const inner = emitChildren(node.children, scope, indent + 1);
  if (!inner) return `\n${pad}<${name}${attrs} />`;
  return `\n${pad}<${name}${attrs}>${inner}</${name}>`;
}

// ---------------------------------------------------------------------- main

const html = readFileSync(SRC, 'utf8');

// O conteudo renderizavel e' o que esta' dentro de <x-dc>, menos o <helmet>
// (link/style/script do helmet ja' viraram app/oracle.css e imports de modulo).
const doc = parseDocument(html, { decodeEntities: true, lowerCaseTags: false });

function findTag(nodes, want) {
  for (const n of nodes) {
    if (n.type === 'tag' && n.name === want) return n;
    if (n.children) {
      const hit = findTag(n.children, want);
      if (hit) return hit;
    }
  }
  return null;
}

const xdc = findTag(doc.children, 'x-dc');
if (!xdc) throw new Error('<x-dc> nao encontrado em ' + SRC);

const body = xdc.children.filter((n) => !(n.type === 'tag' && n.name === 'helmet'));

const jsx = emitChildren(body, [], 2);

const tsx = `// GENERATED por tools/transpile-template.mjs — NAO EDITAR A MAO.
// Regenere com \`npm run gen\`. A fonte e' source/template.html.
//
// Os estilos inline vem do template original com os valores preservados; nenhuma
// normalizacao de CSS e' feita. Textos sao strings literais para que o JSX nao
// altere espacos em branco.
import React, { Fragment } from 'react';
import './hover.css';

export default function OracleView({ v }: { v: any }) {
  return (
    <>${jsx}
    </>
  );
}
`;

mkdirSync('components/generated', { recursive: true });
writeFileSync(OUT_TSX, tsx);
writeFileSync(
  OUT_CSS,
  `/* GENERATED por tools/transpile-template.mjs — NAO EDITAR A MAO.\n   Vem dos atributos style-hover do template original, verbatim. */\n` +
    hoverRules.join('\n') +
    '\n',
);

// ---------------------------------------------------------------- invariantes

// Nenhum atributo ou elemento do runtime antigo pode sobrar: um `sc-camel-x`
// que escape vira atributo desconhecido no DOM, que o React descarta em
// silencio — e o efeito simplesmente nao acontece, sem erro nenhum.
const sobrou = tsx.match(/\bsc-[a-z-]+=/g);
if (sobrou) {
  throw new Error('atributo sc-* nao traduzido: ' + [...new Set(sobrou)].join(', '));
}
const tagSobrou = tsx.match(/<sc-[a-z-]+/g);
if (tagSobrou) {
  throw new Error('elemento sc-* nao traduzido: ' + [...new Set(tagSobrou)].join(', '));
}

// Um UUID de asset que escape do mapeamento vira um 404 silencioso (foi o que
// aconteceu com a imagem de fundo da tela de eras na primeira versao). Falha alto.
const leftover = tsx.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g);
if (leftover) {
  throw new Error(
    'UUID de asset sem mapeamento em ASSET_URLS: ' + [...new Set(leftover)].join(', '),
  );
}

// Nenhuma referencia externa deve aparecer no markup.
const remoteRefs = tsx.match(/https?:\/\/(?!www\.w3\.org)[^"'`\s)]+/g);
if (remoteRefs) {
  throw new Error('referencia remota no markup: ' + [...new Set(remoteRefs)].join(', '));
}

// ------------------------------------------------------------------ relatorio

const count = (re) => (html.match(re) || []).length;
const report = {
  'sc-if no template': count(/<sc-if[\s>]/g),
  'sc-if emitidos': (tsx.match(/\? \(<>/g) || []).length,
  'sc-for no template': count(/<sc-for[\s>]/g),
  'sc-for emitidos': (tsx.match(/\)\.map\(/g) || []).length,
  'style-hover no template': count(/style-hover=/g),
  'regras de hover geradas': hoverRules.length,
  'handlers no template': count(/sc-camel-on-/g),
  'handlers emitidos': (tsx.match(/\bon[A-Z][A-Za-z]*=\{/g) || []).length,
  'sc-raw-select -> select': count(/<sc-raw-select[\s>]/g),
  'campos com caixa (svf-box)': campos.filter((c) => c === 'svf-box').length,
  'campos sublinhados (svf-line)': campos.filter((c) => c === 'svf-line').length,
  'atributos sc-camel-* (nao-evento)': count(/sc-camel-(?!on-)[a-z-]+=/g),
  'elementos SVG no DOM': (tsx.match(/<(svg|defs|filter|fe[A-Z][A-Za-z]*|animate|linearGradient|stop|path|rect|g)[\s/>]/g) || []).length,
};
for (const [k, n] of Object.entries(report)) console.log(String(n).padStart(5), k);

const pairs = [
  ['sc-if no template', 'sc-if emitidos'],
  ['sc-for no template', 'sc-for emitidos'],
  ['style-hover no template', 'regras de hover geradas'],
  ['handlers no template', 'handlers emitidos'],
];
for (const [a, b] of pairs) {
  if (report[a] !== report[b]) throw new Error(`contagem divergente: ${a}=${report[a]} vs ${b}=${report[b]}`);
}
console.log('\nOK — todas as contagens batem. ' + tsx.length + ' bytes de TSX.');
