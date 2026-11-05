import REGRAS from '@/lib/oracle/data/regras.json';

/**
 * Monta a cronica inteira como um dossie em Markdown.
 *
 * Le o mesmo estado que o jogo grava (a forma de blankEra()), entao nao ha'
 * conversao: o diario, a ficha e o caso saem como estao.
 */

type Entry = Record<string, any>;

const stateOf = (v: number, kind: 'saude' | 'sf') =>
  kind === 'saude'
    ? v > 0 ? 'Inteiro' : v > -6 ? 'Ferido' : v > -12 ? 'Gravemente ferido' : 'Morto'
    : v > 0 ? 'Inteiro' : v > -6 ? 'Abalado' : v > -12 ? 'Marcado' : 'Quebrado';

/** Rotulo de cada entrada do diario, igual ao que a tela mostra. */
function quem(e: Entry, nomePJ: string): string {
  if (e.k === 'narr') return 'Narrador';
  if (e.k === 'npc') return e.who || 'Personagem do Diretor';
  if (e.k === 'action') return nomePJ || 'Você';
  if (e.k === 'speech') return (nomePJ || 'Você') + (e.to ? ` → ${e.to}` : '');
  return e.who || 'Ficha';
}

export function exportMarkdown(opts: {
  nome: string;
  era: string;
  state: any;
  /** Quando true, omite a verdade oculta do caso (usado no link publico). */
  esconderSegredo?: boolean;
}): string {
  const { nome, era, state, esconderSegredo } = opts;
  const d = state?.eras?.[era] ?? {};
  const c = d.char ?? {};
  const caso = d.caso ?? {};
  const RR: any = (REGRAS as any)[era] ?? {};
  const med = RR?.medidor?.n ?? 'Integridade';

  const L: string[] = [];
  const h = (s: string) => L.push(s);

  h(`# ${nome}`);
  h('');
  h(`**Arquivo nº SV-${era}** · ${RR.sub ?? ''} · Confidencial`);
  h('');
  h(`> ${RR.titulo ?? 'Saint Village XX Century'}`);
  h('');
  h('---');
  h('');

  // ---- o caso ----
  h('## O caso');
  h('');
  h(`**Título:** ${caso.titulo || '—'}`);
  h('');
  if (caso.premissa) {
    h(caso.premissa);
    h('');
  }
  if (caso.segredo && !esconderSegredo) {
    h(`**Verdade oculta:** ${caso.segredo}`);
    h('');
  }

  const pistas: Entry[] = Array.isArray(caso.pistas) ? caso.pistas : [];
  if (pistas.length) {
    h('### Caderno de pistas');
    h('');
    for (const p of pistas) h(`- ${p.t}`);
    h('');
  }

  const provas: Entry[] = Array.isArray(caso.provas) ? caso.provas : [];
  const peso = provas.reduce((a, p) => a + (Number(p.peso) || 0), 0);
  if (provas.length) {
    h('### Provas');
    h('');
    for (const p of provas) h(`- ${p.t} *(Peso ${p.peso})*`);
    h('');
    h(`**Peso total:** ${peso} de ${caso.nec ?? 4} necessários`);
    h('');
  }

  const vant: string[] = Array.isArray(caso.vant) ? caso.vant : [];
  const prob: string[] = Array.isArray(caso.prob) ? caso.prob : [];
  if (vant.length || prob.length) {
    h('### Vantagens e Problemas');
    h('');
    for (const v of vant) h(`- ✓ ${v}`);
    for (const p of prob) h(`- ✗ ${p}`);
    h('');
  }

  // ---- a ficha ----
  h('---');
  h('');
  h('## A ficha');
  h('');
  h(`**${c.nome || 'Sem nome'}** — ${c.arq || 'sem arquétipo'}`);
  h('');
  if (c.conceito) {
    h(`*${c.conceito}*`);
    h('');
  }

  const linha = (k: string, v: unknown) => {
    if (v === undefined || v === null || v === '') return;
    h(`| ${k} | ${v} |`);
  };
  h('| | |');
  h('|---|---|');
  linha(era === '1934' ? 'Origem' : 'Bairro', c.ori);
  linha('Motivação', c.mot);
  linha('Saúde', `${c.saude} (${stateOf(Number(c.saude), 'saude')})`);
  linha('Sangue-Frio', `${c.sf} (${stateOf(Number(c.sf), 'sf')})`);
  linha(med, c.med);
  linha('Impulsos', c.imp);
  linha('Vício', c.vicio ? `${c.vicio} (traços ${c.vicioTr ?? 0}/3)` : '');
  linha('Fontes de Sangue-Frio', c.fontes);
  linha('Equipamento', c.equip);
  if (!esconderSegredo) linha('Segredo', c.segredo);
  linha('Nascido em', c.anoNasc);
  linha('Laço de Herança', c.lacoEra ? `${c.lacoEra}${c.lacoDe ? ` (de ${c.lacoDe})` : ''}` : '');
  linha('Testamento', c.testamento);
  h('');

  const inv = c.inv && typeof c.inv === 'object' ? c.inv : {};
  const reforcadas = Object.entries(inv).filter(([, v]) => Number(v) > 1);
  if (reforcadas.length) {
    h(`**Investigativas reforçadas:** ${reforcadas.map(([k, v]) => `${k} ${v}`).join(', ')}`);
    h('');
  }
  if (Array.isArray(c.esp) && c.esp.length) {
    h(`**Especialidades gerais (+1):** ${c.esp.join(', ')}`);
    h('');
  }

  // ---- o diario ----
  const log: Entry[] = Array.isArray(d.log) ? d.log : [];
  h('---');
  h('');
  h('## O diário');
  h('');
  if (d.cena) {
    h(`*Cena atual: ${d.cena}*`);
    h('');
  }
  if (!log.length) {
    h('*A crônica ainda não começou.*');
    h('');
  }
  for (const e of log) {
    const autor = quem(e, c.nome);
    const txt = String(e.text ?? '').trim();
    if (!txt) continue;
    if (e.k === 'mech') {
      h(`> \`${autor}\` ${txt}`);
    } else if (e.k === 'speech') {
      h(`**${autor}:** ${txt}`);
    } else {
      h(`**${autor}**`);
      h('');
      h(txt);
    }
    h('');
  }

  h('---');
  h('');
  h('Baseado em *Saint Village XX Century*, de Felipe Malorgio · GUMSHOE SRD (CC-BY 3.0).');
  h('');

  return L.join('\n');
}

/** Nome de arquivo seguro, sem acento nem barra. */
export function exportFilename(nome: string, era: string): string {
  const slug = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 50);
  return `saint-village-${era}-${slug || 'cronica'}.md`;
}
