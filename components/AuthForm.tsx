'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LS_KEY } from '@/lib/oracle/store';

/**
 * Formulario de entrar/cadastrar.
 *
 * No cadastro, se houver progresso da demo em localStorage (mesma chave do
 * artifact), oferece importar: a cronica local vira a primeira cronica da conta.
 */
export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const isRegister = mode === 'register';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [importar, setImportar] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /** Save local da demo, se existir. */
  function localSave(): { era: string; eras: Record<string, any> } | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s?.era || !s?.eras?.[s.era]) return null;
      const log = s.eras[s.era]?.log;
      // So' oferece importar se houver jogo de verdade.
      return Array.isArray(log) && log.length > 0 ? s : null;
    } catch {
      return null;
    }
  }

  const pendente = typeof window !== 'undefined' && isRegister ? localSave() : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErro(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, ...(isRegister ? { nome } : {}) }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(j.error || 'Não foi possível continuar.');
        setBusy(false);
        return;
      }

      // Importa a cronica da demo para a conta recem-criada.
      if (isRegister && importar && pendente) {
        try {
          const r = await fetch('/api/campaigns', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              era: pendente.era,
              nome: `Crônica de ${pendente.era}`,
              state: pendente,
            }),
          });
          if (r.ok) localStorage.removeItem(LS_KEY);
        } catch {
          /* se a importacao falhar, a conta ja existe; o save local fica onde esta' */
        }
      }

      router.push('/membro');
      router.refresh();
    } catch {
      setErro('Falha de rede. Tente de novo.');
      setBusy(false);
    }
  }

  return (
    <div className="sv-narrow">
      <div className="sv-kicker">{isRegister ? 'Abrir ficha' : 'Identifique-se'}</div>
      <h1 className="sv-h1">{isRegister ? 'Nova credencial' : 'Entrar no arquivo'}</h1>
      <p className="sv-lede">
        {isRegister
          ? 'Uma conta guarda suas crônicas nas cinco eras, com a ficha, o caso e o caderno de pistas de cada uma.'
          : 'Suas crônicas continuam de onde pararam.'}
      </p>
      <div className="sv-rule" />

      {erro && <div className="sv-error">{erro}</div>}

      <form onSubmit={submit}>
        {isRegister && (
          <label className="sv-field">
            <span className="sv-label">Como quer ser chamado</span>
            <input
              className="sv-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="nickname"
              maxLength={80}
            />
          </label>
        )}

        <label className="sv-field">
          <span className="sv-label">E-mail</span>
          <input
            className="sv-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="sv-field">
          <span className="sv-label">Senha</span>
          <input
            className="sv-input"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </label>

        {isRegister && pendente && (
          <label
            className="sv-field"
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              fontFamily: "'Special Elite', monospace",
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--sv-dim, #cfcac0)',
            }}
          >
            <input
              type="checkbox"
              checked={importar}
              onChange={(e) => setImportar(e.target.checked)}
              style={{ marginTop: 4 }}
            />
            <span>
              Trazer a crônica de {pendente.era} que você jogou sem conta
              {' '}({pendente.eras[pendente.era].log.length} entradas no diário).
            </span>
          </label>
        )}

        <button className="sv-btn" type="submit" disabled={busy}>
          {busy ? 'Conferindo…' : isRegister ? 'Abrir ficha' : 'Entrar'}
        </button>
      </form>

      <p className="sv-note">
        {isRegister ? (
          <>
            Já tem conta? <Link href="/entrar">Entrar</Link>.
          </>
        ) : (
          <>
            Sem conta ainda? <Link href="/cadastrar">Abrir ficha</Link>. Ou{' '}
            <Link href="/">jogue 1934 sem se cadastrar</Link>.
          </>
        )}
      </p>
      {!isRegister && (
        <p className="sv-note">
          Esta versão não envia e-mails, então não há recuperação automática de senha.
        </p>
      )}
    </div>
  );
}
