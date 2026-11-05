// Estado de jogo usado nas duas pontas da comparacao de pixels.
//
// Precisa exercitar o maximo de UI possivel: log com entradas de cada tipo, caso
// com pistas/provas/vantagens/problemas/Fios, ficha preenchida, PdD em cena e um
// PdD criado pelo jogador. A forma e' exatamente a que blankEra() produz.

const char = (era) => ({
  nome: 'Nora Vance',
  conceito: 'repórter demitida que não devolveu as chaves do arquivo',
  arq: 'Jornalista',
  ori: 'Downtown',
  mot: 'provar que o irmão foi incriminado',
  lado: 'Contrato',
  inv: { 'História da Cidade': 3, Pesquisa: 2, 'Faro para Mentiras': 2 },
  esp: ['Atletismo', 'Vigilância'],
  saude: 6,
  sf: 5,
  med: 6,
  imp: 3,
  adr: 1,
  vicioTr: 1,
  imprensa: 2,
  ficha: 1,
  ruido: 2,
  medalha: era === '1946' ? 'Estrela de Bronze' : '',
  anoNasc: '1902',
  lacoEra: '',
  lacoDe: '',
  herancas: '',
  testamento: 'o envelope lacrado fica com quem souber a senha',
  antepassado: '',
  regras: 'não mentir para quem já me ajudou; nunca entregar uma fonte; sair antes do amanhecer',
  fontes: 'uísque, o arquivo do jornal e a banca do Zack',
  vicio: 'bebida',
  segredo: 'ela viu quem atirou e ficou calada',
  equip: 'câmera, bloco, um níquel para o telefone',
  notas: 'o zelador do Píer 9 deve um favor',
});

const caso = {
  titulo: 'O corpo no Píer 9',
  premissa: 'Um estivador aparece morto no galpão 14, com um bilhete dobrado no bolso do casaco.',
  segredo: 'o bilhete é do próprio delegado',
  pistas: [
    { id: 'p1', t: 'o bilhete tem letra de médico' },
    { id: 'p2', t: 'o galpão 14 foi esvaziado na véspera' },
    { id: 'p3', t: 'o relógio da vítima parou às 3h20' },
  ],
  provas: [
    { id: 'e1', t: 'o bilhete, fotografado antes de desaparecer', peso: 2 },
    { id: 'e2', t: 'o livro de carga do galpão', peso: 1 },
  ],
  vant: ['o zelador deve um favor', 'ninguém sabe que você esteve lá'],
  prob: ['a polícia já sabe seu nome'],
  nec: 4,
  fios: [
    { a: 'p1', b: 'p2', rel: 'o mesmo médico assinou a liberação da carga', st: 'firme' },
    { a: 'p2', b: 'p3', rel: 'a carga saiu no horário em que o relógio parou', st: 'aberto' },
  ],
  medalhaUsos: 0,
  flash: false,
  jaVi: false,
};

const log = [
  {
    id: 'l1',
    k: 'narr',
    who: 'Narrador',
    text:
      'A chuva chega de lado no Píer 9 e o galpão 14 está aberto de par em par. O guarda-noturno olha para os seus sapatos antes de olhar para o seu rosto, e isso já diz o bastante. No concreto, uma mancha que a água ainda não levou.',
    acts: [],
  },
  { id: 'l2', k: 'action', text: 'Procuro pelo livro de carga na sala do encarregado.' },
  {
    id: 'l3',
    k: 'narr',
    who: 'Narrador',
    text:
      'O livro está onde deveria estar, e é justamente por isso que incomoda: a página de ontem foi arrancada com régua, não com pressa.',
    acts: [{ t: 'teste', v: 'Vigilância' }],
  },
  { id: 'l4', k: 'mech', who: 'Ficha', text: 'Pista anotada · Prova registrada' },
  { id: 'l5', k: 'speech', to: 'Zack', text: 'Quem comprou jornal aqui às três da manhã?' },
  {
    id: 'l6',
    k: 'npc',
    who: 'Zack',
    text:
      '— Moça, a essa hora só compra jornal quem não quer dormir. E ontem teve dois. Um de chapéu bom. O outro pagou com moeda molhada.',
    acts: [],
  },
];

export function makeSave(era, tab) {
  return {
    era,
    tab,
    eras: {
      [era]: {
        char: char(era),
        log,
        caso,
        cena: 'Downtown',
        naCena: ['b0'],
        custom: [
          {
            cid: 'c1',
            n: 'Dona Ilda',
            p: 'zeladora do galpão 14, 61 anos',
            d: 'Varre o mesmo chão há trinta anos e sabe de quem é cada passo.',
            v: 'lealdade',
            pe: 'silêncio',
            q: 'que a filha saia da cidade',
            t: 'ser testemunha',
            r: 'Criado por você',
          },
        ],
      },
    },
  };
}

export const ERAS = ['1934', '1946', '1974', '1994', '1999'];
export const TABS = ['cronica', 'caso', 'ficha', 'dados', 'elenco', 'cidade', 'seculo', 'tutorial'];
