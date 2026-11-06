// Monta lib/oracle/logic.tsx e lib/server/prompt.ts a partir de source/component.js.
//
// O corpo e o prelúdio são copiados VERBATIM do artifact, porque são o motor de
// regras do jogo (GUMSHOE, parser de marcações, dados, Fios, saltos de era) e a
// animação de rolagem. Qualquer reescrita seria risco puro.
//
// As fatias são localizadas POR PADRÃO, não por número de linha. A primeira
// versão usava linhas fixas e quebrou inteira quando o designer entregou uma
// revisão: o prelúdio passou de 20 para 85 linhas. Procurar pelo texto custa o
// mesmo e sobrevive à próxima rodada.
//
// Trocamos exatamente quatro coisas:
//   1. os globais window.SV_* viram imports de JSON
//   2. systemPrompt() sai para o servidor (depende do texto do livro)
//   3. narrate() e genNpc() passam a falar com a API
//   4. load()/save() passam pelo Store; DCLogic vira React.Component
//
// Rode com `npm run gen`. NÃO edite os arquivos gerados a mão.

import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('source/component.js', 'utf8');
const linhas = src.split('\n');

/** Índice (1-based) da primeira linha que casa, ou erro com contexto. */
function acha(re, oque) {
  for (let i = 0; i < linhas.length; i++) if (re.test(linhas[i])) return i + 1;
  throw new Error(`não encontrei ${oque} em source/component.js (padrão ${re})`);
}

const L_CLASSE = acha(/^class Component extends DCLogic \{/, 'a declaração da classe');
const L_PROMPT = acha(/^\s{2}systemPrompt\(/, 'systemPrompt()');
const L_NARRATE = acha(/^\s{2}async narrate\(/, 'narrate()');
const L_INGEST = acha(/^\s{2}ingest\(/, 'ingest()');

if (!(L_CLASSE < L_PROMPT && L_PROMPT < L_NARRATE && L_NARRATE < L_INGEST)) {
  throw new Error('a ordem dos métodos mudou — revise o porter antes de confiar nas fatias');
}

/** Fatia 1-based inclusiva. */
const slice = (a, b) => linhas.slice(a - 1, b).join('\n');

const PRELUDE_ORIG = slice(1, L_CLASSE - 1); // helpers de módulo: dados, toast, animação
const HEAD = slice(L_CLASSE, L_PROMPT - 1); // classe + métodos até systemPrompt
// Corpo de systemPrompt() sem a assinatura e sem a chave que o fecha: a função
// geradora em prompt.ts fecha a sua. A fatia vai até narrate() e por isso pega
// linhas em branco e o `  }` final — removidos aqui, com verificação, para um
// `}` sobrando não virar um erro de sintaxe a 120 linhas de distância.
const PROMPT_BODY = (() => {
  const l = slice(L_PROMPT + 1, L_NARRATE - 1).split('\n');
  while (l.length && !l[l.length - 1].trim()) l.pop();
  if (l[l.length - 1].trim() !== '}') {
    throw new Error('systemPrompt() não termina em "}": ' + JSON.stringify(l[l.length - 1]));
  }
  l.pop();
  return l.join('\n');
})();
const TAIL = slice(L_INGEST, linhas.length); // ingest() ... renderVals() ... fecha a classe

// ---------------------------------------------------------------- prelúdio
//
// Copiado inteiro. Só os acessores aos globais mudam: no artifact os dados
// vinham de <script> no documento; aqui são módulos JSON.
let prelude = PRELUDE_ORIG
  .replace(
    'const R = () => window.SV_REGRAS, L = () => window.SV_LIVROS, S = () => window.SV_SECULO;',
    'const R = () => REGRAS as any, L = () => LIVROS as any, S = () => SECULO as any;',
  )
  .replace(
    'const modsOf = e => (window.SV_REGRAS && window.SV_REGRAS[e] && window.SV_REGRAS[e].mods) || [];',
    'const modsOf = e => (R() && R()[e] && R()[e].mods) || [];',
  );

if (prelude.includes('window.SV_')) {
  throw new Error('sobrou acesso a window.SV_* no prelúdio: ' + (prelude.match(/window\.SV_\w+/g) || []).join(', '));
}

const CABECALHO = `// GENERATED por tools/port-logic.mjs a partir de source/component.js — NAO EDITAR A MAO.
//
// O prelúdio e o corpo desta classe são o motor do artifact original, copiados
// verbatim. ts-nocheck é deliberado: o porte é validado pelo diff de pixels
// (tests/pixel) e pelos testes das marcações, não pelo compilador. Todo código
// NOVO do projeto (rotas, store, auth, automações) é tipado normalmente.
// @ts-nocheck
'use client';

import React, { Fragment } from 'react';
import OracleView from '@/components/generated/OracleView';
import REGRAS from './data/regras.json';
import LIVROS from './data/livros.json';
import SECULO from './data/seculo.json';
import { lerExtensoes, aplicarExtensoes, stripMarks } from './extensions';
import type { Store, SaveShape } from './store';

type Props = {
  /** Persistência: localStorage na demo, API na conta. */
  store: Store;
  /** Estado inicial já carregado (SSR ou localStorage). */
  initial: SaveShape | null;
  /** Preferências do narrador, antes props fixos do artifact. */
  tamanhoNarracao?: 'curto' | 'medio' | 'longo';
  modeloIA?: 'haiku' | 'sonnet';
  /** Quantas entradas do log vão como histórico (o servidor impõe o teto). */
  historyTurns?: number;
  /** Mensagem exibida quando a cota diária estoura. */
  onQuota?: (msg: string) => void;
};

`;

// ------------------------------------------------------------------ narrate
//
// A montagem do prompt foi para o servidor; aqui só fica o transporte. O texto
// completo volta no evento 'done' e é o ingest() original que o interpreta.
const NARRATE = `
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
          resumo: d.caso && d.caso.resumo ? d.caso.resumo : '',
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

      if(opened) this.upd(e=>({...e,log:e.log.filter(x=>x.id!==streamId)}));

      // As marcações NOVAS (cena, caso, fio) saem do texto ANTES do motor
      // original — que segue intocado e recebe só o vocabulário dele — e são
      // gravadas DEPOIS, porque ingest() reescreve caso e cena por inteiro a
      // partir de uma leitura que fez antes de rodar.
      const ext = lerExtensoes(full||'');
      this.ingest(ext.texto, opts);
      aplicarExtensoes(ext, this);
      this.talvezResumir();
    }catch(err){
      this.upd(e=>({...e,log:e.log.filter(x=>x.id!==streamId)}));
      this.addLog({k:'mech',who:'Erro',text:'O narrador não respondeu. Tente de novo.'});
    }
    this.setState({busy:false});
  }

  /**
   * Memória longa: a cada N turnos pede um parágrafo de resumo e o guarda no
   * caso. O prompt passa a levar resumo + histórico recente, em vez de só as
   * últimas entradas — o narrador para de esquecer o começo da crônica, e em
   * crônicas longas o custo cai.
   */
  async talvezResumir(){
    const d=this.cur(); if(!d) return;
    const narrativas=d.log.filter(e=>e.k==='narr'||e.k==='npc').length;
    const PASSO=12;
    if(narrativas < PASSO) return;
    if((d.caso.resumoEm||0) + PASSO > narrativas) return;
    try{
      const res=await fetch('/api/resumo',{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({ era:this.state.era, anterior:d.caso.resumo||'',
          history:d.log.slice(-40).map(e=>this.fmt(e)),
          prefs:{modeloIA:this.props.modeloIA||'haiku'} })});
      if(!res.ok) return;
      const j=await res.json();
      if(j && j.resumo) this.setCaso({resumo:String(j.resumo), resumoEm:narrativas});
    }catch(e){ /* resumo e' melhoria, nao requisito: falhar aqui nao atrapalha a cena */ }
  }
`;

const RENDER = `
  /** DCLogic chamava renderVals() por fora; aqui a própria classe renderiza. */
  render(){
    return <OracleView v={this.renderVals()} />;
  }
`;

// --------------------------------------------------------- substituições
const SUBS_HEAD = [
  ['class Component extends DCLogic {', 'export default class OracleLogic extends React.Component<Props, any> {'],
  [
    "state = Object.assign({ era:null, tab:'cronica', eras:{} }, load()||{}, {",
    "state = Object.assign({ era:null, tab:'cronica', eras:{} }, this.props.initial||{}, {",
  ],
  [
    // O v2 passou a persistir também a câmera do mapa (zoom e pan).
    "save(){ const {era,tab,eras,mapZ,mapX,mapY,mapFz}=this.state; try{ localStorage.setItem(LS, JSON.stringify({era,tab,eras,mapZ,mapX,mapY,mapFz})); }catch(e){} }",
    "save(){ const {era,tab,eras,mapZ,mapX,mapY,mapFz}=this.state; this.props.store.write({era,tab,eras,mapZ,mapX,mapY,mapFz}); }",
  ],
];

let head = HEAD;
for (const [de, para] of SUBS_HEAD) {
  if (!head.includes(de)) throw new Error('substituição não encontrada no HEAD: ' + de.slice(0, 60));
  head = head.split(de).join(para);
}

// genNpc() também falava com o runtime do artifact, e usava LL.textos — que
// agora só existe no servidor.
const mGen = TAIL.match(/ {6}genNpc:async\(\)=>\{[\s\S]*?this\.setState\(\{busy:false\}\); \},/);
if (!mGen) throw new Error('bloco genNpc não encontrado no TAIL');

const GEN_NPC_NOVO = `      genNpc:async()=>{ if(this.state.busy) return; this.setState({busy:true});
        try{
          const res=await fetch('/api/npc',{method:'POST',headers:{'content-type':'application/json'},
            body:JSON.stringify({era, cena:d.cena||'', evitar:npcs.map(n=>n.n).slice(-40),
              prefs:{modeloIA:this.props.modeloIA||'haiku'}})});
          if(res.status===429){ const q=await res.json().catch(()=>({}));
            this.addLog({k:'mech',who:'Arquivo',text:q.message||'Os arquivos da cidade fecham por hoje.'}); }
          else if(!res.ok){ throw new Error('npc '+res.status); }
          else { const j=await res.json();
            this.upd(e=>({...e,custom:[...(e.custom||[]),{cid:uid(),...j.npc,r:d.cena||''}]}));
            this.setState({npcReg:'__meus'}); }
        }catch(err){ this.addLog({k:'mech',who:'Erro',text:'Não foi possível gerar o NPC.'}); }
        this.setState({busy:false}); },`;

let tail = TAIL.replace(mGen[0], GEN_NPC_NOVO);
if (/window\.claude/.test(tail)) {
  throw new Error('sobrou window.claude no corpo portado');
}

// ---- mídia por caminho relativo -> absoluto -------------------------------
//
// O designer escreve 'fundos/bar.jpg' porque no artifact a página era um
// arquivo solto e o caminho resolvia ao lado dele. No app a mesma string
// resolve contra a ROTA: em /jogar/<id> viraria /jogar/fundos/bar.jpg. Como os
// arquivos ainda não chegaram, o sintoma seria um 404 silencioso e um fundo
// preto — exatamente igual ao que se vê hoje, e portanto invisível até alguém
// entregar as imagens e elas continuarem não aparecendo.
const RE_MIDIA = /(['"])((?:fundos|musica|sons)\/[^'"]+|fundo-eras\.png)\1/g;
const achouMidia = new Set();
tail = tail.replace(RE_MIDIA, (todo, q, caminho) => {
  achouMidia.add(caminho);
  return `${q}/${caminho}${q}`;
});
if (!achouMidia.size) {
  throw new Error('nenhum caminho de mídia encontrado — o designer mudou a forma de referenciar os fundos?');
}
if (RE_MIDIA.test(tail)) throw new Error('sobrou caminho de mídia relativo no corpo portado');

const out =
  CABECALHO +
  prelude +
  '\n\n' +
  head +
  '\n' +
  NARRATE +
  '\n' +
  tail.replace(/\}\s*$/, '') +
  RENDER +
  '}\n';

writeFileSync('lib/oracle/logic.tsx', out);

// ===========================================================================
// lib/server/prompt.ts — systemPrompt() verbatim, no servidor.
//
// Fica aqui porque depende dos ~414 KB de texto do livro, que nunca devem ir
// para o navegador, e porque é onde a chave de API é usada.
// ===========================================================================

let body = PROMPT_BODY;

const SUBS_PROMPT = [
  [
    "    const s=this.state, era=s.era, RR=R()[era], LL=L()[era], d=this.cur(), c=d.char, med=RR.medidor.n;",
    "    const RR: any = (REGRAS as any)[era], SS: any = SECULO as any, med = RR.medidor.n;\n" +
      "    const LL: any = { ...(LIVROS as any)[era], textos: book.textos, geral: book.geral };\n" +
      "    const d: any = { char: input.char, caso: input.caso, cena: input.cena, naCena: input.naCena };\n" +
      "    const c: any = input.char;",
  ],
  ['this.props.tamanhoNarracao', 'prefs.tamanhoNarracao'],
  ['this.fioTxt(f,i)', 'fioTxt(f,i,d.caso.pistas)'],
  [
    "d.naCena.map(id=>this.npcById(id)).filter(Boolean).map(n=>this.fmtNpc(n)).join('\\n')",
    "d.naCena.join('\\n')",
  ],
  ['this.fmtNpc(npc)', 'npc.perfil'],
];

for (const [de, para] of SUBS_PROMPT) {
  if (!body.includes(de)) throw new Error('substituição do prompt não encontrada: ' + de.slice(0, 70));
  body = body.split(de).join(para);
}

body = body.replace(
  "    const has=m=>(RR.mods||[]).includes(m), SS=S();",
  "    const has = (m: string) => (RR.mods||[]).includes(m);",
);

// O resumo rolante entra logo antes do histórico do caso, para o narrador ler
// o que já aconteceu antes de ler o estado atual.
body = body.replace(
  'const caso = d.caso;',
  "const caso = d.caso;\n    const resumoTxt = input.resumo ? `\\nO QUE JÁ ACONTECEU NESTA CRÔNICA (resumo; o histórico recente vem depois): ${input.resumo}\\n` : '';",
);
body = body.replace('O CASO: ${casoTxt}', 'O CASO: ${casoTxt}${resumoTxt}');

// ------------------------------------------------- marcações das automações
//
// Três chaves novas, lidas por lib/oracle/extensions.ts e NUNCA por ingest().
// Existem porque o jogo já pedia essas três coisas ao narrador em prosa e
// deixava o jogador transcrevê-las à mão: o prompt manda "escolha uma região
// coerente e diga onde estamos" sem dar como avisar o app, o caso nasce com
// título e premissa em branco, e os Fios do Mural só existiam se o jogador os
// digitasse. Agora o narrador diz, e a ficha acompanha.
body = body.replace(
  "    const lista = LL.npcs.map(n=>n.n).join('; ');",
  "    const lista = LL.npcs.map(n=>n.n).join('; ');\n" +
    "    const regioesTxt = (LL.regioes||[]).map(r=>r.nome).join('; ');",
);

body = body.replace(
  '${reg}\n\nPERSONAGENS DO DIRETOR EM CENA',
  '${reg}\n\nREGIÕES DESTA ERA (nomes exatos): ${regioesTxt}\n\nPERSONAGENS DO DIRETOR EM CENA',
);

const MARCACOES_NOVAS =
  '[NPC: Nome exato] quando um Personagem do Diretor do livro entrar em cena.\n' +
  '[CENA: Nome exato da região] sempre que a cena mudar de região, e também no primeiro turno em que a região ainda não estiver definida. Use um dos nomes da lista REGIÕES DESTA ERA, escrito igual.\n' +
  "${caso.titulo && caso.premissa ? '' : '[CASO: Título curto | premissa em uma frase] quando o caso ganhar forma, para o app preencher a aba Caso. O que o jogador já escreveu não é sobrescrito.\\n'}" +
  "${has('mural') ? '[FIO-NOVO: pista | pista | relação em poucas palavras] quando duas pistas já anotadas se ligarem. Identifique cada pista pelo número dela na lista de pistas já obtidas, ou por um trecho literal do texto dela. O Fio nasce solto; quem o verifica é o jogador.\\n' : ''}";

if (!body.includes('[NPC: Nome exato] quando um Personagem do Diretor do livro entrar em cena.')) {
  throw new Error('bloco de MARCAÇÕES não encontrado: o designer mudou o prompt');
}
body = body.replace(
  '[NPC: Nome exato] quando um Personagem do Diretor do livro entrar em cena.',
  MARCACOES_NOVAS,
);

if (body.includes('S()')) throw new Error('sobrou chamada a S() no prompt');
if (/this\./.test(body)) {
  throw new Error('sobrou `this.` no prompt: ' + (body.match(/this\.[a-zA-Z]+/g) || []).join(', '));
}

const prompt = `// GENERATED por tools/port-logic.mjs a partir de source/component.js — NAO EDITAR A MAO.
//
// systemPrompt() do artifact, copiado verbatim. Fica no SERVIDOR porque depende
// dos ~414 KB de texto do livro (lib/server/book/*.json), que nunca devem ir
// para o navegador, e porque é aqui que a chave de API é usada.
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
  /** PdDs em cena, já formatados pelo cliente via fmtNpc(). */
  naCena: string[];
  /** Quando a resposta é a fala de um PdD. */
  npc?: { n: string; perfil: string } | null;
  /** Resumo rolante da crônica, quando já existe (memória longa). */
  resumo?: string;
  prefs: { tamanhoNarracao?: string; modeloIA?: string };
  book: BookText;
};

/** Do prelúdio do artifact, usado na descrição da ficha. */
const stateOf = (v: number, kind: string) =>
  kind === 'saude'
    ? v > 0 ? 'Inteiro' : v > -6 ? 'Ferido' : v > -12 ? 'Gravemente ferido' : 'Morto'
    : v > 0 ? 'Inteiro' : v > -6 ? 'Abalado' : v > -12 ? 'Marcado' : 'Quebrado';

/** Era método da classe; aqui recebe as pistas do caso. */
function fioTxt(f: any, i: number, pistas: any[]) {
  const a = (pistas || []).find((p: any) => p.id === f.a);
  const b = (pistas || []).find((p: any) => p.id === f.b);
  return \`Fio \${i + 1}: “\${a ? a.t : '?'}” ↔ “\${b ? b.t : '?'}” — \${f.rel}\`;
}

/**
 * Monta o prompt de sistema do narrador.
 *
 * Devolve as duas metades separadas de propósito: \`stable\` é idêntico entre
 * turnos da mesma crônica na mesma região (~7.100 tokens) e por isso recebe
 * cache_control no adapter da Anthropic; \`volatile\` muda a cada turno.
 */
export function buildSystemPrompt(input: PromptInput): { stable: string; volatile: string; full: string } {
  const full = systemPromptBody(input);
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

console.log('prelúdio    : linhas 1-' + (L_CLASSE - 1), `(${PRELUDE_ORIG.split('\n').length} linhas, verbatim)`);
console.log('HEAD        : linhas ' + L_CLASSE + '-' + (L_PROMPT - 1));
console.log('systemPrompt: linhas ' + L_PROMPT + '-' + (L_NARRATE - 1) + ' -> lib/server/prompt.ts');
console.log('TAIL        : linhas ' + L_INGEST + '-' + linhas.length);
console.log('midia       :', achouMidia.size, 'caminhos absolutizados:', [...achouMidia].sort().join(', '));
console.log('logic.tsx   :', out.length, 'bytes');
console.log('prompt.ts   :', prompt.length, 'bytes');
