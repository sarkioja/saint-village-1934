'use client';

import { useMemo } from 'react';
import OracleLogic from '@/lib/oracle/logic';
import { RemoteStore, type SaveShape } from '@/lib/oracle/store';

/**
 * Liga o oraculo portado a' persistencia da conta.
 *
 * O componente de jogo nao sabe que existe conta ou API: ele so' chama
 * store.write() a cada mutacao, como fazia com localStorage no artifact.
 */
export default function PlayClient({
  campaignId,
  rev,
  initial,
  prefs,
}: {
  campaignId: string;
  rev: number;
  initial: SaveShape | null;
  prefs: { tamanhoNarracao?: string; modeloIA?: string };
}) {
  const store = useMemo(
    () => new RemoteStore(campaignId, initial, rev),
    [campaignId, initial, rev],
  );

  return (
    <OracleLogic
      store={store}
      initial={initial}
      tamanhoNarracao={(prefs.tamanhoNarracao as any) || 'medio'}
      modeloIA={(prefs.modeloIA as any) || 'haiku'}
    />
  );
}
