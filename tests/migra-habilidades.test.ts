import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import { migrarInvestigativas, migrarEspecialidades } from '@/lib/oracle/migra-habilidades';

/**
 * lib/oracle/migra-habilidades.ts é uma reescrita à mão de
 * `window.SV_HAB_MIGRA`, que no artifact é um objeto de funções e por isso não
 * cabe no snapshot JSON dos outros dados. Reescrita à mão merece prova: este
 * teste roda o código ORIGINAL do designer lado a lado com o porte e exige que
 * concordem — inclusive nos casos chatos, que são os de fusão de perícia.
 *
 * Se o designer mexer nas funções dele, isto falha na hora em vez de deixar a
 * ficha de alguém sair errada do carregamento.
 */
let orig: { inv: Function; esp: Function };
let regras: any;

beforeAll(() => {
  const require = createRequire(import.meta.url);
  (globalThis as any).window = {};
  require('../source/sv_regras.js');
  require('../source/sv_livros.js');
  require('../source/sv_seculo.js');
  orig = (globalThis as any).window.SV_HAB_MIGRA;
  regras = (globalThis as any).window.SV_REGRAS;
});

describe('migração de habilidades confere com o artifact', () => {
  it('o artifact realmente expõe as duas funções', () => {
    expect(typeof orig.inv).toBe('function');
    expect(typeof orig.esp).toBe('function');
  });

  it('investigativas: nomes renomeados batem', () => {
    const antes = { Tiro: 2, Pesquisa: 3, 'História da Cidade': 1 };
    expect(migrarInvestigativas(antes, [])).toEqual(orig.inv(antes, []));
  });

  it('investigativas: duas perícias que viraram a mesma não perdem pontos', () => {
    // 'Atletismo' e 'Fuga' fundiram em 'Fôlego e Resistência'.
    const antes = { Atletismo: 3, Fuga: 3, Pesquisa: 1 };
    expect(migrarInvestigativas(antes, [])).toEqual(orig.inv(antes, []));
  });

  it('investigativas: o pool recebe a sobra da fusão', () => {
    const antes = { Atletismo: 3, Fuga: 2 };
    const pool = ['Pesquisa', 'Medicina Legal'];
    expect(migrarInvestigativas(antes, pool)).toEqual(orig.inv(antes, pool));
  });

  it('investigativas: ficha vazia e nula não explodem', () => {
    expect(migrarInvestigativas({}, [])).toEqual(orig.inv({}, []));
    expect(migrarInvestigativas(null, [])).toEqual(orig.inv({}, []));
  });

  it('especialidades: renomeia, tira duplicata e completa a lista', () => {
    for (const antes of [
      ['Tiro', 'Briga'],
      ['Atletismo', 'Fuga'],
      [],
      ['Pesquisa'],
      ['Tiro', 'Tiro', 'Briga'],
    ]) {
      expect(migrarEspecialidades(antes)).toEqual(orig.esp(antes));
    }
  });

  it('concorda com o original em fichas aleatórias', () => {
    const invAll = [
      ...(regras['1934'].invAcad || []),
      ...(regras['1934'].invTec || []),
      ...(regras['1934'].invInter || []),
    ];
    const antigos = ['Tiro', 'Briga', 'Atletismo', 'Fuga', 'Faro de Encrenca', ...invAll];

    let s = 12345;
    const rnd = (n: number) => ((s = (s * 1103515245 + 12345) & 0x7fffffff) % n);

    for (let caso = 0; caso < 200; caso++) {
      const ficha: Record<string, number> = {};
      for (let i = 0; i < 1 + rnd(6); i++) ficha[antigos[rnd(antigos.length)]] = 1 + rnd(3);
      const pool = [invAll[rnd(invAll.length)], invAll[rnd(invAll.length)]];
      expect(migrarInvestigativas(ficha, pool)).toEqual(orig.inv(ficha, pool));
    }
  });
});
