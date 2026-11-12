'use client';

import { useEffect, useMemo, useState } from 'react';
import OracleLogic from '@/lib/oracle/logic';
import { LocalStore, type SaveShape } from '@/lib/oracle/store';
import TrilhaAmbiente from '@/components/TrilhaAmbiente';

/**
 * A tela única do jogo.
 *
 * O login agora é a recepção do próprio artifact (nome + PIN), dentro do
 * oráculo — não há mais chip de conta por cima nem página de entrar separada.
 * Quem entra sem PIN joga local, como no artifact; com PIN, a conta é real.
 *
 * Demo aberta: joga sem conta, com o estado em localStorage na mesma chave do
 * artifact original ('sv-cronica-v2'), para que o progresso local possa ser
 * importado quando a pessoa criar uma conta.
 *
 * Monta so' depois da hidratacao porque o estado inicial vem de localStorage.
 * O fundo do body ja' e' #0b0a09, entao nao ha' flash branco — mesmo
 * comportamento da tela de carregamento do artifact.
 */
export default function DemoPage() {
  const store = useMemo(() => new LocalStore(), []);
  const [initial, setInitial] = useState<SaveShape | null | undefined>(undefined);

  useEffect(() => {
    setInitial(store.read());
  }, [store]);

  if (initial === undefined) return null;

  return (
    <>
      <OracleLogic store={store} initial={initial} />
      <TrilhaAmbiente />
    </>
  );
}
