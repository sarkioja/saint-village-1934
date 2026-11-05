import { describe, it, expect } from 'vitest';
import {
  lerExtensoes,
  calcularExtensoes,
  temExtensoes,
  stripMarks,
} from '@/lib/oracle/extensions';

/** Estado de era mínimo, na mesma forma que blankEra() produz. */
const estado = (over: any = {}) => ({
  char: {},
  log: [],
  caso: { titulo: '', premissa: '', pistas: [], provas: [], vant: [], prob: [], nec: 4, fios: [] },
  cena: '',
  naCena: [],
  custom: [],
  ...over,
});

describe('lerExtensoes — o que sai do texto', () => {
  it('tira [CENA: …] da prosa e guarda a região', () => {
    const r = lerExtensoes('A chuva não para. [CENA: Downtown]');
    expect(r.cena).toBe('Downtown');
    expect(r.texto).toBe('A chuva não para. ');
  });

  it('não toca nas marcações do motor original', () => {
    const t = 'Ele some na neblina. [PISTA: o bilhete] [SAUDE: -2] [TESTE: Vigilância]';
    const r = lerExtensoes(t);
    expect(r.texto).toBe(t);
    expect(temExtensoes(r)).toBe(false);
  });

  it('lê título e premissa do caso', () => {
    const r = lerExtensoes('[CASO: O homem do Píer 9 | Um estivador some na véspera da greve]');
    expect(r.caso).toEqual({
      titulo: 'O homem do Píer 9',
      premissa: 'Um estivador some na véspera da greve',
    });
  });

  it('lê Fios novos, com a relação podendo conter |', () => {
    const r = lerExtensoes('[FIO-NOVO: 1 | 2 | ambos citam o mesmo nome]');
    expect(r.fios).toEqual([{ a: '1', b: '2', rel: 'ambos citam o mesmo nome' }]);
  });

  it('descarta marcação incompleta: nada aplicado, nada na tela', () => {
    // Sem a relação não dá para criar o Fio — mas deixar a marcação na prosa
    // mostraria ao jogador a engrenagem crua, que é o defeito que isto conserta.
    const r = lerExtensoes('[FIO-NOVO: 1 | 2]');
    expect(r.fios).toEqual([]);
    expect(r.texto).toBe('');
  });

  it('aceita acento e caixa como o ingest aceita', () => {
    expect(lerExtensoes('[cena: Chinatown]').cena).toBe('Chinatown');
  });
});

describe('calcularExtensoes — CENA', () => {
  it('resolve o nome contra as regiões reais da era', () => {
    const { estado: e, efeitos } = calcularExtensoes(
      lerExtensoes('[CENA: Downtown]'),
      estado(),
      '1934',
    );
    expect(e.cena).toBe('Downtown');
    expect(efeitos).toEqual(['Cena: Downtown']);
  });

  it('casa o nome curto com o nome completo da região', () => {
    const { estado: e } = calcularExtensoes(lerExtensoes('[CENA: Black Rock]'), estado(), '1934');
    expect(e.cena).toBe('Black Rock e a Ponte');
  });

  it('região inventada não mexe em nada', () => {
    const { estado: e, efeitos } = calcularExtensoes(
      lerExtensoes('[CENA: Gotham]'),
      estado({ cena: 'Downtown' }),
      '1934',
    );
    expect(e.cena).toBe('Downtown');
    expect(efeitos).toEqual([]);
  });
});

describe('calcularExtensoes — CASO', () => {
  it('preenche título e premissa quando estão em branco', () => {
    const { estado: e } = calcularExtensoes(
      lerExtensoes('[CASO: A viúva de Waterford | Ela quer o corpo de volta]'),
      estado(),
      '1934',
    );
    expect(e.caso.titulo).toBe('A viúva de Waterford');
    expect(e.caso.premissa).toBe('Ela quer o corpo de volta');
  });

  it('nunca sobrescreve o que o jogador escreveu', () => {
    const meu = estado({ caso: { ...estado().caso, titulo: 'Meu título', premissa: 'minha' } });
    const { estado: e, efeitos } = calcularExtensoes(
      lerExtensoes('[CASO: Outro | outra]'),
      meu,
      '1934',
    );
    expect(e.caso.titulo).toBe('Meu título');
    expect(e.caso.premissa).toBe('minha');
    expect(efeitos).toEqual([]);
  });
});

describe('calcularExtensoes — FIO-NOVO', () => {
  const comPistas = () =>
    estado({
      caso: {
        ...estado().caso,
        pistas: [
          { id: 'p1', t: 'o bilhete rasgado' },
          { id: 'p2', t: 'a fita de rolo' },
          { id: 'p3', t: 'o carro parado na esquina' },
        ],
      },
    });

  it('liga duas pistas pelo número', () => {
    const { estado: e, efeitos } = calcularExtensoes(
      lerExtensoes('[FIO-NOVO: 1 | 2 | mesma letra]'),
      comPistas(),
      '1974',
    );
    expect(e.caso.fios).toHaveLength(1);
    expect(e.caso.fios[0]).toMatchObject({ a: 'p1', b: 'p2', rel: 'mesma letra', st: 'solto' });
    expect(efeitos).toEqual(['Fio novo no Mural']);
  });

  it('liga duas pistas por trecho do texto', () => {
    const { estado: e } = calcularExtensoes(
      lerExtensoes('[FIO-NOVO: fita de rolo | carro parado | foram gravados no mesmo dia]'),
      comPistas(),
      '1974',
    );
    expect(e.caso.fios[0]).toMatchObject({ a: 'p2', b: 'p3' });
  });

  it('não repete um Fio que já existe, em qualquer ordem', () => {
    const base = comPistas();
    base.caso.fios = [{ id: 'f1', a: 'p2', b: 'p1', rel: 'já ligado', st: 'firme' }];
    const { estado: e, efeitos } = calcularExtensoes(
      lerExtensoes('[FIO-NOVO: 1 | 2 | de novo]'),
      base,
      '1974',
    );
    expect(e.caso.fios).toHaveLength(1);
    expect(efeitos).toEqual([]);
  });

  it('ignora pista que não existe', () => {
    const { estado: e } = calcularExtensoes(
      lerExtensoes('[FIO-NOVO: 1 | 9 | nada]'),
      comPistas(),
      '1974',
    );
    expect(e.caso.fios).toHaveLength(0);
  });

  it('não cria Fios em era sem Mural', () => {
    const { estado: e, efeitos } = calcularExtensoes(
      lerExtensoes('[FIO-NOVO: 1 | 2 | mesma letra]'),
      comPistas(),
      '1934',
    );
    expect(e.caso.fios).toHaveLength(0);
    expect(efeitos).toEqual([]);
  });
});

describe('as três automações num turno só', () => {
  it('aplicam juntas e rendem uma linha de mecânica', () => {
    const ext = lerExtensoes(
      'O estivador aponta para a doca.\n' +
        '[PISTA: o bilhete rasgado]\n' +
        '[CENA: Embarcadouro]\n' +
        '[CASO: O homem do Píer 9 | Um estivador some]\n' +
        '[FIO-NOVO: 1 | 2 | a mesma letra]',
    );
    // O ingest() verbatim continua vendo só a marcação dele.
    expect(ext.texto).toContain('[PISTA: o bilhete rasgado]');
    expect(ext.texto).not.toContain('[CENA');
    expect(ext.texto).not.toContain('[CASO');
    expect(ext.texto).not.toContain('[FIO-NOVO');

    // Estado como ficaria DEPOIS do ingest, que já anotou a pista.
    const depois = estado({
      caso: {
        ...estado().caso,
        pistas: [
          { id: 'p1', t: 'o bilhete rasgado' },
          { id: 'p2', t: 'a fita de rolo' },
        ],
      },
    });
    const { estado: e, efeitos } = calcularExtensoes(ext, depois, '1974');
    expect(e.cena).toBe('Embarcadouro'); // nome da região em 1974
    expect(e.caso.titulo).toBe('O homem do Píer 9');
    expect(e.caso.fios).toHaveLength(1);
    expect(efeitos).toHaveLength(3);
  });
});

describe('stripMarks (filtro do stream)', () => {
  it('esconde as marcações novas enquanto o texto chega', () => {
    expect(stripMarks('Chove. [CENA: Down')).toBe('Chove. ');
    expect(stripMarks('Chove. [CENA: Downtown] Fim.')).toBe('Chove.  Fim.');
  });
});
