/**
 * O backend `fs` grava no disco da function, que em serverless e' efemero e nao
 * e' compartilhado entre instancias: um cadastro "daria certo" e sumiria depois.
 *
 * Em producao, portanto, contas so' existem com um backend duravel configurado.
 * Sem ele o app continua inteiro em modo demo (o jogo roda em localStorage e so'
 * precisa da chave da LLM) e as telas de conta dizem isso, em vez de perder dados
 * em silencio.
 */
import { postgresUrl } from './pgurl';

export function accountsEnabled(): boolean {
  const backend = (process.env.DATA_BACKEND || (postgresUrl() ? 'postgres' : 'fs')).toLowerCase();
  if (backend === 'fs') {
    // O criterio nao e' "producao" e sim "serverless": num servidor proprio o
    // disco persiste e o backend de arquivo e' legitimo. Na Vercel, nao.
    return process.env.VERCEL !== '1';
  }
  if (backend === 'neon' || backend === 'postgres') return !!postgresUrl();
  return true;
}

export const ACCOUNTS_OFF_MESSAGE =
  'As contas ainda não estão ligadas nesta instalação: falta configurar o banco de dados. ' +
  'O jogo funciona normalmente sem conta — o progresso fica guardado neste navegador.';
