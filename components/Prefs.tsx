'use client';

import { useState } from 'react';

type P = { tamanhoNarracao?: string; modeloIA?: string };

/**
 * Os dois ajustes que no artifact eram props fixos do editor (tamanhoNarracao e
 * modeloIA) agora sao configuracao da conta — antes nao havia onde mexer neles.
 */
export default function Prefs({ initial }: { initial: P }) {
  const [tam, setTam] = useState(initial.tamanhoNarracao || 'medio');
  const [mod, setMod] = useState(initial.modeloIA || 'haiku');
  const [estado, setEstado] = useState<'' | 'salvando' | 'salvo'>('');

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
          <option value="haiku">Rápido</option>
          <option value="sonnet">Apurado</option>
        </select>
      </label>

      <div className="sv-note" style={{ marginTop: 28, maxWidth: 320 }}>
        {estado === 'salvando' && 'Anotando…'}
        {estado === 'salvo' && 'Anotado.'}
        {!estado && 'Narrações curtas custam menos tokens; o narrador apurado escreve melhor e custa mais.'}
      </div>
    </div>
  );
}
