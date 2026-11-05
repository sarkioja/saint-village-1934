import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '@/lib/server/prompt';
import { loadBook } from '@/lib/server/book';
import REGRAS from '@/lib/oracle/data/regras.json';

const ERAS = ['1934', '1946', '1974', '1994', '1999'];

function fixture(era: string) {
  return {
    era,
    char: {
      nome: 'Nora Vance',
      conceito: 'repórter que perdeu o emprego',
      arq: 'Jornalista',
      ori: 'Downtown',
      mot: 'provar que o irmão foi incriminado',
      lado: 'Contrato',
      inv: { 'História da Cidade': 3, Pesquisa: 2, Atletismo: 1 },
      esp: ['Atletismo'],
      saude: 8,
      sf: 6,
      med: 7,
      imp: 4,
      adr: 1,
      vicioTr: 1,
      imprensa: 2,
      ficha: 0,
      ruido: 0,
      medalha: '',
      anoNasc: '1902',
      lacoEra: '',
      lacoDe: '',
      herancas: '',
      testamento: '',
      antepassado: '',
      regras: '',
      fontes: 'uísque e o arquivo do jornal',
      vicio: 'bebida',
      segredo: 'ela viu quem atirou',
      equip: 'câmera',
      notas: '',
    },
    caso: {
      titulo: 'O corpo no Píer 9',
      premissa: 'um estivador aparece morto com um bilhete no bolso',
      segredo: 'o bilhete é do próprio delegado',
      pistas: [
        { id: 'p1', t: 'o bilhete tem letra de médico' },
        { id: 'p2', t: 'o galpão 14 foi esvaziado na véspera' },
      ],
      provas: [{ id: 'e1', t: 'o bilhete', peso: 2 }],
      vant: ['o zelador deve um favor'],
      prob: ['a polícia sabe seu nome'],
      nec: 4,
      fios: [{ a: 'p1', b: 'p2', rel: 'o mesmo médico assinou a liberação', st: 'aberto' }],
      medalhaUsos: 0,
      flash: false,
      jaVi: false,
    },
    cena: 'Downtown',
    naCena: ['Zack — jornaleiro (banca da Rua Post). Virtude: lealdade. Pecado: fofoca.'],
    npc: null,
    prefs: { tamanhoNarracao: 'medio', modeloIA: 'haiku' },
    book: loadBook(era),
  };
}

describe('buildSystemPrompt', () => {
  for (const era of ERAS) {
    it(`monta o prompt de ${era} com as secoes do artifact`, () => {
      const { full, stable, volatile } = buildSystemPrompt(fixture(era) as any);

      // As secoes que o narrador precisa para seguir o cenario.
      expect(full).toContain('Você é o Diretor e narrador de uma crônica SOLO');
      expect(full).toContain('REGRAS:');
      expect(full).toContain('O SÉCULO (Saint Village XX Century, Edição Omni):');
      expect(full).toContain('FACÇÕES E CIDADE (do livro):');
      expect(full).toContain('FICHA DO PERSONAGEM:');
      expect(full).toContain('O CASO:');
      expect(full).toContain('MARCAÇÕES — o app lê e aplica');

      // Estado do jogo chegou ao prompt.
      expect(full).toContain('Nora Vance');
      expect(full).toContain('O corpo no Píer 9');
      expect(full).toContain('VERDADE OCULTA');
      expect(full).toContain('o bilhete é do próprio delegado');

      // O texto do livro da regiao entrou como autoridade de cenario.
      expect(full).toContain('REGIÃO DA CENA: Downtown');

      // O corte estavel/volatil cobre o prompt inteiro, sem perder nem duplicar.
      expect(stable + volatile).toBe(full);
      expect(stable.length).toBeGreaterThan(3000);
      expect(volatile).toContain('FICHA DO PERSONAGEM:');
      expect(stable).not.toContain('FICHA DO PERSONAGEM:');
    });
  }

  it('o medidor da era aparece com o nome certo nas marcacoes', () => {
    for (const era of ERAS) {
      const med = (REGRAS as any)[era].medidor.n;
      const { full } = buildSystemPrompt(fixture(era) as any);
      const tag = med === 'Integridade' ? '[INTEGRIDADE: -N]' : '[CODIGO: -N]';
      expect(full, `era ${era} (medidor ${med})`).toContain(tag);
    }
  });

  it('o tamanho da narracao muda a contagem de palavras pedida', () => {
    const mk = (t: string) => buildSystemPrompt({ ...fixture('1934'), prefs: { tamanhoNarracao: t } } as any).full;
    expect(mk('curto')).toContain('60 a 110 palavras');
    expect(mk('medio')).toContain('90 a 170 palavras');
    expect(mk('longo')).toContain('150 a 260 palavras');
  });

  it('quando um PdD fala, o prompt vira a voz dele', () => {
    const { full } = buildSystemPrompt({
      ...fixture('1934'),
      npc: { n: 'Zack', perfil: 'Zack — jornaleiro. Quer: vender jornal. Teme: a polícia.' },
    } as any);
    expect(full).toContain('NESTA RESPOSTA você fala como Zack');
    expect(full).toContain('Teme: a polícia.');
  });

  it('a metade estavel e' + ' grande o bastante para valer cache de prompt', () => {
    const { stable } = buildSystemPrompt(fixture('1934') as any);
    // A Anthropic exige um minimo de tokens para cachear; ~4 chars/token em pt-BR.
    expect(stable.length / 4).toBeGreaterThan(1024);
  });
});
