// Monta lib/oracle/logic.tsx a partir de source/component.js.
//
// O corpo da classe e' copiado VERBATIM do artifact, em duas fatias, porque e' o
// motor de regras do jogo (GUMSHOE, parser de marcacoes, dados, Fios, saltos de
// era) e qualquer reescrita seria risco puro. Trocamos exatamente tres coisas:
//
//   1. prelude  — os globais SV_* viram imports de JSON; load() vira o Store
//   2. systemPrompt() + narrate() (linhas 143-210) saem: a montagem do prompt
//      vai para o servidor (lib/server/prompt.ts, que tem o texto do livro) e
//      narrate() passa a falar com /api/narrate
//   3. render()  — DCLogic vira React.Component renderizando OracleView
//
// Rode com `npm run gen`. NAO edite lib/oracle/logic.tsx a mao.

import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('source/component.js', 'utf8').split('\n');

// Fatias verbatim (1-indexed, inclusivo), conferidas contra o arquivo original.
const slice = (a, b) => src.slice(a - 1, b).join('\n');
const HEAD = slice(21, 141); // `class Component extends DCLogic {` ... isGeral()
const TAIL = slice(212, 572); // ingest() ... renderVals() ... fecha a classe

// Guarda: se o arquivo de origem mudar, as fatias param de casar e isso grita.
if (!HEAD.startsWith('class Component extends DCLogic {')) {
  throw new Error('fatia HEAD nao comeca na classe — source/component.js mudou?');
}
if (!TAIL.trimStart().startsWith('ingest(text, opts){')) {
  throw new Error('fatia TAIL nao comeca em ingest() — source/component.js mudou?');
}
if (!TAIL.trimEnd().endsWith('}')) throw new Error('fatia TAIL nao fecha a classe');
if (slice(143, 143).trim() !== 'systemPrompt(npc){') {
  throw new Error('systemPrompt nao esta na linha 143 — source/component.js mudou?');
}

const PRELUDE = `// GENERATED por tools/port-logic.mjs a partir de source/component.js — NAO EDITAR A MAO.
//
// O corpo desta classe e' o motor de regras do artifact original, copiado verbatim.
// ts-nocheck e' deliberado: o porte e' validado pelo diff de pixels (tests/pixel) e
// pelos testes de unidade do parser de marcacoes, nao pelo compilador. Todo codigo
// NOVO do projeto (rotas, store, auth) e' tipado normalmente.
// @ts-nocheck
'use client';

import React, { Fragment } from 'react';
import OracleView from '@/components/generated/OracleView';
import REGRAS from './data/regras.json';
import LIVROS from './data/livros.json';
import SECULO from './data/seculo.json';
import type { Store, SaveShape } from './store';

// ---- os globais do artifact, agora modulos ----------------------------------
const R = () => REGRAS as any;
const L = () => LIVROS as any;
const S = () => SECULO as any;

// ---- prelude do artifact (linhas 1-20), preservado -------------------------
const TABS = [['cronica','Crônica'],['caso','Caso'],['ficha','Ficha'],['dados','Dados'],['elenco','Elenco'],['cidade','Cidade'],['seculo','Século'],['tutorial','Como jogar']];
const ERAS = ['1934','1946','1974','1994','1999'];
const modsOf = e => (R() && R()[e] && R()[e].mods) || [];
const triCount = fios => { const E=new Set(), V=new Set(); (fios||[]).filter(f=>f.st==='firme').forEach(f=>{E.add(f.a+'|'+f.b);E.add(f.b+'|'+f.a);V.add(f.a);V.add(f.b);}); const v=[...V]; let n=0; for(let i=0;i<v.length;i++)for(let j=i+1;j<v.length;j++)for(let k=j+1;k<v.length;k++) if(E.has(v[i]+'|'+v[j])&&E.has(v[j]+'|'+v[k])&&E.has(v[i]+'|'+v[k])) n++; return n; };
const rnd = n => 1 + Math.floor(Math.random()*n);
const pick = a => a[Math.floor(Math.random()*a.length)];
const uid = () => Math.random().toString(36).slice(2,9);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const norm = s => (s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toUpperCase().trim();
const sign = n => (n>0?'+':n<0?'−':'') + Math.abs(n);
function invList(era){ const r=R(); return [...r.comum.invAcad, ...r.comum.invInter, ...(r[era].invInterExtra||[]), ...r[era].invTec]; }
function blankChar(era){ const inv={}; invList(era).forEach(k=>inv[k]=1); return {nome:'',conceito:'',arq:'',ori:'',mot:'',lado:'Contrato',inv,esp:[],saude:8,sf:8,med:7,imp:4,adr:1,vicioTr:0,imprensa:0,ficha:0,ruido:0,medalha:'',anoNasc:'',lacoEra:'',lacoDe:'',herancas:'',testamento:'',antepassado:'',regras:'',fontes:'',vicio:'',segredo:'',equip:'',notas:''}; }
function blankCaso(){ return {titulo:'',premissa:'',segredo:'',pistas:[],provas:[],vant:[],prob:[],nec:4,fios:[],medalhaUsos:0,flash:false,jaVi:false}; }
function blankEra(era){ return {char:blankChar(era),log:[],caso:blankCaso(),cena:'',naCena:[],custom:[]}; }
const stateOf = (v,kind) => kind==='saude' ? (v>0?'Inteiro':v>-6?'Ferido':v>-12?'Gravemente ferido':'Morto') : (v>0?'Inteiro':v>-6?'Abalado':v>-12?'Marcado':'Quebrado');

// ---- props -----------------------------------------------------------------
type Props = {
  /** Persistencia: localStorage na demo, API na conta. */
  store: Store;
  /** Estado inicial ja' carregado (SSR ou localStorage). */
  initial: SaveShape | null;
  /** Preferencias do narrador, antes props fixos do artifact. */
  tamanhoNarracao?: 'curto' | 'medio' | 'longo';
  modeloIA?: 'haiku' | 'sonnet';
  /** Quantas entradas do log vao como historico (botao de custo; padrao 18 = original). */
  historyTurns?: number;
  /** Mensagem exibida quando a cota diaria estoura. */
  onQuota?: (msg: string) => void;
};

`;

// narrate(): a montagem do prompt foi para o servidor; aqui so' sobra o transporte.
const NARRATE = `
  /**
   * Pede uma narracao ao servidor. O prompt de sistema (com o texto do livro) e'
   * montado em lib/server/prompt.ts; o cliente manda apenas o estado do jogo.
   *
   * A prosa chega em stream para aparecer na tela conforme sai, mas as marcacoes
   * ([PISTA: ...], [TESTE: ...]) so' sao aplicadas no fim, pelo ingest() original,
   * sobre o texto completo — o motor de regras nao e' tocado.
   */
  async narrate(instr, opts={}){
    if(this.state.busy) return;
    this.setState({busy:true});
    const d=this.cur();
    const streamId=uid();
    try{
      const res = await fetch('/api/narrate', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({
          era: this.state.era,
          instr,
          npcId: opts.npc ? opts.npc.id : null,
          npc: opts.npc ? {n:opts.npc.n, perfil:this.fmtNpc(opts.npc)} : null,
          char: d.char,
          caso: d.caso,
          cena: d.cena,
          naCena: d.naCena.map(id=>this.npcById(id)).filter(Boolean).map(n=>this.fmtNpc(n)),
          history: d.log.slice(-(this.props.historyTurns||18)).map(e=>this.fmt(e)),
          prefs: {
            tamanhoNarracao: this.props.tamanhoNarracao || 'medio',
            modeloIA: this.props.modeloIA || 'haiku',
          },
        }),
      });

      if(res.status===429){
        const j = await res.json().catch(()=>({}));
        const msg = j.message || 'Os arquivos da cidade fecham à meia-noite. Volte amanhã.';
        this.addLog({k:'mech',who:'Arquivo',text:msg});
        if(this.props.onQuota) this.props.onQuota(msg);
        this.setState({busy:false});
        return;
      }
      if(!res.ok || !res.body) throw new Error('narrate ' + res.status);

      // Stream: mostra a prosa chegando numa entrada provisoria.
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf='', full='', opened=false;
      for(;;){
        const {value, done} = await reader.read();
        if(done) break;
        buf += dec.decode(value, {stream:true});
        let nl;
        while((nl = buf.indexOf('\\n')) >= 0){
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl+1);
          if(!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if(!payload) continue;
          let ev; try{ ev = JSON.parse(payload); }catch(e){ continue; }
          if(ev.t==='delta'){
            full += ev.v;
            if(!opened){ opened=true; this.upd(e=>({...e,log:[...e.log,{id:streamId,k:'narr',who:opts.npc?opts.npc.n:'Narrador',text:stripMarks(full),streaming:true}]})); }
            else this.patchEntry(streamId, {text:stripMarks(full)});
          } else if(ev.t==='error'){
            throw new Error(ev.v || 'erro do narrador');
          } else if(ev.t==='done'){
            if(ev.v) full = ev.v;
          }
        }
      }

      // Remove a entrada provisoria e deixa o ingest() original fazer o trabalho.
      if(opened) this.upd(e=>({...e,log:e.log.filter(x=>x.id!==streamId)}));
      this.ingest(full||'', opts);
    }catch(err){
      this.upd(e=>({...e,log:e.log.filter(x=>x.id!==streamId)}));
      this.addLog({k:'mech',who:'Erro',text:'O narrador não respondeu. Tente de novo.'});
    }
    this.setState({busy:false});
  }
`;

const RENDER = `
  /** DCLogic chamava renderVals() por fora; aqui a propria classe renderiza. */
  render(){
    return <OracleView v={this.renderVals()} />;
  }
`;

// Esconde marcacoes (inclusive uma `[PISTA: ...` ainda pela metade) durante o stream,
// para que nenhuma apareca piscando na tela.
const HELPERS = `
/**
 * Durante o stream, remove marcacoes completas e qualquer marcacao parcial no fim
 * do buffer, para que nada como "[PIST" apareca na tela.
 */
export function stripMarks(t: string): string {
  return t
    .replace(/\\[[^\\[\\]]{1,240}\\]/g, '')
    .replace(/\\[[^\\[\\]]{0,240}$/, '')
    .replace(/[ \\t]+\\n/g, '\\n')
    .replace(/\\n{3,}/g, '\\n\\n');
}
`;

// O artifact fazia `load()` de localStorage e `save()` direto. Agora vem do Store.
const head = HEAD
  .replace(
    'class Component extends DCLogic {',
    'export default class OracleLogic extends React.Component<Props, any> {',
  )
  .replace(
    'state = Object.assign({ era:null, tab:\'cronica\', eras:{} }, load()||{}, {',
    'state = Object.assign({ era:null, tab:\'cronica\', eras:{} }, this.props.initial||{}, {',
  )
  .replace(
    'save(){ const {era,tab,eras}=this.state; try{ localStorage.setItem(LS, JSON.stringify({era,tab,eras})); }catch(e){} }',
    'save(){ const {era,tab,eras}=this.state; this.props.store.write({era,tab,eras}); }',
  );

// Checa que as tres substituicoes pegaram (se o original mudar, falha ruidosamente).
for (const [what, needle] of [
  ['classe', 'export default class OracleLogic'],
  ['estado inicial', 'this.props.initial||{}'],
  ['save via store', 'this.props.store.write'],
]) {
  if (!head.includes(needle)) throw new Error('substituicao falhou: ' + what);
}

const out = PRELUDE + HELPERS + '\n' + head + '\n' + NARRATE + '\n' + TAIL.replace(/\}\s*$/, '') + RENDER + '}\n';

writeFileSync('lib/oracle/logic.tsx', out);

// ===========================================================================
// lib/server/prompt.ts — systemPrompt() do artifact, verbatim, no servidor.
//
// O corpo (linhas 144-195) e' copiado sem reescrita: ele carrega TODAS as regras
// que o narrador precisa seguir, e uma reformulacao minha poderia mudar o jogo.
// Declarando no topo os mesmos nomes que o metodo usava (RR, LL, SS, d, c, med),
// o corpo roda intacto; restam 5 substituicoes pontuais, checadas uma a uma.
// ===========================================================================

let body = slice(144, 195);

const SUBS = [
  // 1. cabecalho: vinha de this.state/this.cur(); agora vem dos argumentos.
  [
    "    const s=this.state, era=s.era, RR=R()[era], LL=L()[era], d=this.cur(), c=d.char, med=RR.medidor.n;",
    // Nao desestruturamos `caso` nem `naCena`: o proprio corpo declara esses nomes.
    "    const RR: any = (REGRAS as any)[era], SS: any = SECULO as any, med = RR.medidor.n;\n" +
      "    const LL: any = { ...(LIVROS as any)[era], textos: book.textos, geral: book.geral };\n" +
      "    const d: any = { char: input.char, caso: input.caso, cena: input.cena, naCena: input.naCena };\n" +
      "    const c: any = input.char;",
  ],
  // 2. preferencia do narrador, antes prop fixo do artifact.
  ["this.props.tamanhoNarracao", "prefs.tamanhoNarracao"],
  // 3. fioTxt era metodo da classe (lia this.cur().caso.pistas).
  ["this.fioTxt(f,i)", "fioTxt(f,i,d.caso.pistas)"],
  // 4. os PdDs em cena chegam ja' formatados pelo cliente (que tem os dados deles).
  [
    "d.naCena.map(id=>this.npcById(id)).filter(Boolean).map(n=>this.fmtNpc(n)).join('\\n')",
    "d.naCena.join('\\n')",
  ],
  // 5. o perfil do PdD que fala tambem chega formatado.
  ["this.fmtNpc(npc)", "npc.perfil"],
];

for (const [from, to] of SUBS) {
  if (!body.includes(from)) throw new Error('substituicao do prompt nao encontrada: ' + from.slice(0, 70));
  body = body.split(from).join(to);
}

// A segunda linha do metodo redeclarava `has` e `SS`; SS ja' vem do nosso cabecalho.
body = body.replace(
  "    const has=m=>(RR.mods||[]).includes(m), SS=S();",
  "    const has = (m: string) => (RR.mods||[]).includes(m);",
);
if (body.includes('S()')) throw new Error('sobrou chamada a S() no prompt');
if (/this\./.test(body)) throw new Error('sobrou `this.` no prompt: ' + body.match(/this\.[a-zA-Z]+/g));

const prompt = `// GENERATED por tools/port-logic.mjs a partir de source/component.js — NAO EDITAR A MAO.
//
// systemPrompt() do artifact, copiado verbatim das linhas 144-195. Fica no SERVIDOR
// porque depende dos ~414 KB de texto do livro (lib/server/book/*.json), que nunca
// devem ir para o navegador — e porque e' aqui que a chave de API e' usada.
// @ts-nocheck
import REGRAS from '@/lib/oracle/data/regras.json';
import LIVROS from '@/lib/oracle/data/livros.json';
import SECULO from '@/lib/oracle/data/seculo.json';

export type BookText = { textos: Record<string, string>; geral: string };

export type PromptInput = {
  era: string;
  char: Record<string, any>;
  caso: Record<string, any>;
  cena: string;
  /** PdDs em cena, ja' formatados pelo cliente via fmtNpc(). */
  naCena: string[];
  /** Quando a resposta e' a fala de um PdD. */
  npc?: { n: string; perfil: string } | null;
  prefs: { tamanhoNarracao?: string; modeloIA?: string };
  book: BookText;
};

/** Do prelude do artifact (linha 20), usado na descricao da ficha. */
const stateOf = (v: number, kind: string) =>
  kind === 'saude'
    ? v > 0 ? 'Inteiro' : v > -6 ? 'Ferido' : v > -12 ? 'Gravemente ferido' : 'Morto'
    : v > 0 ? 'Inteiro' : v > -6 ? 'Abalado' : v > -12 ? 'Marcado' : 'Quebrado';

/** Era metodo da classe; aqui recebe as pistas do caso. */
function fioTxt(f: any, i: number, pistas: any[]) {
  const a = (pistas || []).find((p: any) => p.id === f.a);
  const b = (pistas || []).find((p: any) => p.id === f.b);
  return \`Fio \${i + 1}: “\${a ? a.t : '?'}” ↔ “\${b ? b.t : '?'}” — \${f.rel}\`;
}

/**
 * Monta o prompt de sistema do narrador.
 *
 * Devolve as duas metades separadas de proposito: \`stable\` e' identico entre
 * turnos da mesma cronica na mesma regiao (~7.100 tokens) e por isso recebe
 * cache_control no adapter da Anthropic; \`volatile\` muda a cada turno.
 */
export function buildSystemPrompt(input: PromptInput): { stable: string; volatile: string; full: string } {
  const { era, char, caso, cena, naCena, npc, prefs, book } = input;
  const full = systemPromptBody({ era, char, caso, cena, naCena, npc, prefs, book });
  // O corte e' feito no marcador que separa cenario (estavel) de ficha (volatil).
  const MARK = '\\nFICHA DO PERSONAGEM:';
  const at = full.indexOf(MARK);
  if (at < 0) return { stable: full, volatile: '', full };
  return { stable: full.slice(0, at), volatile: full.slice(at), full };
}

function systemPromptBody(input: PromptInput): string {
  const { era, prefs, book, npc } = input;
${body}
}
`;

writeFileSync('lib/server/prompt.ts', prompt);

console.log('HEAD  linhas 21-141  :', HEAD.split('\n').length);
console.log('TAIL  linhas 212-572 :', TAIL.split('\n').length);
console.log('systemPrompt 144-195 : -> lib/server/prompt.ts (' + SUBS.length + ' substituicoes)');
console.log('saida lib/oracle/logic.tsx :', out.length, 'bytes');
console.log('saida lib/server/prompt.ts :', prompt.length, 'bytes');
