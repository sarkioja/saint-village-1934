'use client';

import { useEffect, useState } from 'react';

type P = { tamanhoNarracao?: string; modeloIA?: string };

/**
 * Os dois ajustes que no artifact eram props fixos do editor (tamanhoNarracao e
 * modeloIA) agora sao configuracao da conta — antes nao havia onde mexer neles.
 */
export default function Prefs({ initial }: { initial: P }) {
  const [tam, setTam] = useState(initial.tamanhoNarracao || 'medio');
  const [mod, setMod] = useState(initial.modeloIA || 'haiku');
  const [estado, setEstado] = useState<'' | 'salvando' | 'salvo'>('');

  // Quais modelos cada opção usa de verdade. Vem de /api/health, que já expõe
  // isso sem segredo nenhum. Sem isto, "Rápido / Apurado" poderia estar
  // apontando para o mesmo modelo e o seletor mentiria para quem escolhe.
  const [modelos, setModelos] = useState<{ rapido?: string; apurado?: string }>({});
  useEffect(() => {
    let vivo = true;
    fetch('/api/health')
      .then((r) => r.json())
      .then((j) => {
        if (!vivo) return;
        setModelos({ rapido: j?.narrador?.modeloRapido, apurado: j?.narrador?.modeloApurado });
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  const iguais = !!modelos.rapido && modelos.rapido === modelos.apurado;

  async function salvar(next: P) {
    setEstado('salvando');
    await fetch('/api/me', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tamanhoNarracao: tam, modeloIA: mod, ...next }),
    });
    setEstado('salvo');
    setTimeout(() => setEstado(''), 1800);
  }

  return (
    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <label className="sv-field" style={{ minWidth: 240 }}>
        <span className="sv-label">Tamanho da narração</span>
        <select
          className="sv-input"
          value={tam}
          onChange={(e) => {
            setTam(e.target.value);
            void salvar({ tamanhoNarracao: e.target.value });
          }}
        >
          <option value="curto">Curto — 60 a 110 palavras</option>
          <option value="medio">Médio — 90 a 170 palavras</option>
          <option value="longo">Longo — 150 a 260 palavras</option>
        </select>
      </label>

      <label className="sv-field" style={{ minWidth: 240 }}>
        <span className="sv-label">Narrador</span>
        <select
          className="sv-input"
          value={mod}
          onChange={(e) => {
            setMod(e.target.value);
            void salvar({ modeloIA: e.target.value });
          }}
        >
          <option value="haiku">Rápido{modelos.rapido ? ` — ${modelos.rapido}` : ''}</option>
          <option value="sonnet">Apurado{modelos.apurado ? ` — ${modelos.apurado}` : ''}</option>
        </select>
      </label>

      <div className="sv-note" style={{ marginTop: 28, maxWidth: 320 }}>
        {estado === 'salvando' && 'Anotando…'}
        {estado === 'salvo' && 'Anotado.'}
        {!estado && iguais &&
          'Nesta instalação as duas opções usam o mesmo modelo, então a escolha não muda nada por enquanto.'}
        {!estado && !iguais &&
          'Narrações curtas custam menos tokens; o narrador apurado escreve melhor e custa mais.'}
      </div>
    </div>
  );
}
