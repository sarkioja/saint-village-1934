import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { accountsEnabled, ACCOUNTS_OFF_MESSAGE } from '@/lib/store/availability';
import { getStore, today } from '@/lib/store';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { issue, setSessionCookie } from '@/lib/auth/session';
import { EmailTaken } from '@/lib/store';

export const runtime = 'nodejs';

/**
 * Entrar pelo nome do investigador — o fluxo único do jogo.
 *
 * A tela é a do designer (nome + PIN de 4 números) e a conta é real: Postgres,
 * sessão em cookie e sincronização entre dispositivos. O nome vira `slug` e
 * ocupa a coluna de e-mail, que já é única — não há e-mail nenhum a coletar, e
 * nenhuma migração de esquema para isso.
 *
 * O PIN é a chave da conta, e são 4 dígitos: 10.000 combinações.
 * -----------------------------------------------------------------
 * Dentro do navegador isso protegia um perfil local e perder não custava nada.
 * Ligado a uma conta com sync, passa a guardar tudo — e o nome do investigador
 * é público por natureza. Duas defesas, porque o PIN sozinho não basta:
 *
 *   1. scrypt no servidor, sempre. O SHA-256 que o artifact calcula no
 *      navegador é sem sal e não serve como guarda de credencial; aqui ele
 *      nem é recebido.
 *   2. teto de tentativas ERRADAS por dia, por nome e por IP. Com 10 por dia
 *      contra 10.000 combinações, varrer o espaço leva anos. Só erro conta:
 *      quem acerta nunca se tranca sozinho.
 *
 * Sem PIN a conta não existe no servidor — fica no navegador, como no artifact
 * original. É a mesma distinção que a interface do designer já faz entre
 * "Salvo neste navegador" e "Salvo na nuvem"; aqui ela passa a ser verdade.
 */

const MAX_ERROS_POR_NOME = 10;
const MAX_ERROS_POR_IP = 30;

/** Mesmo svSlug() do artifact: é ele que dá a identidade da conta. */
function svSlug(t: string): string {
  return String(t || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

const hashIp = (req: NextRequest) =>
  createHash('sha256')
    .update((req.headers.get('x-forwarded-for') || '0.0.0.0').split(',')[0].trim())
    .digest('hex');

export async function POST(req: NextRequest) {
  if (!accountsEnabled()) {
    return Response.json({ error: 'accounts_off', message: ACCOUNTS_OFF_MESSAGE }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const nome = String(body?.nome ?? '').trim().replace(/\s+/g, ' ');
  const pin = String(body?.pin ?? '').trim();
  const slug = svSlug(nome);

  // As mesmas validações da tela, para a mensagem bater com a do artifact.
  if (nome.length < 2 || !slug) {
    return Response.json({ error: 'Escreva um nome com pelo menos 2 letras.' }, { status: 400 });
  }
  if (nome.length > 40) {
    return Response.json({ error: 'Nome muito longo.' }, { status: 400 });
  }
  if (!/^\d{4}$/.test(pin)) {
    return Response.json(
      {
        error: 'local',
        message: 'Sem PIN o arquivo fica só neste navegador. Para guardá-lo na nuvem, escolha 4 números.',
      },
      { status: 400 },
    );
  }

  const store = await getStore();
  const ip = hashIp(req);

  // Tentativas erradas já gastas hoje. Consulta antes de verificar, para um
  // ataque não conseguir nem o oráculo de "existe/não existe".
  const errosNome = await store.getQuota(`pin:${slug}`, today()).catch(() => 0);
  const errosIp = await store.getQuota(`pinip:${ip}`, today()).catch(() => 0);
  if (errosNome >= MAX_ERROS_POR_NOME || errosIp >= MAX_ERROS_POR_IP) {
    return Response.json(
      { error: 'Tentativas demais por hoje. Tente de novo amanhã.' },
      { status: 429 },
    );
  }

  const existente = await store.getUserByEmail(slug);

  if (existente) {
    const ok = await verifyPassword(pin, existente.passwordHash);
    if (!ok) {
      await store.bumpQuota(`pin:${slug}`, today()).catch(() => 0);
      await store.bumpQuota(`pinip:${ip}`, today()).catch(() => 0);
      return Response.json({ error: 'PIN não confere.' }, { status: 401 });
    }
    await setSessionCookie(issue(existente.id, existente.email));
    return Response.json({
      perfil: { slug: existente.email, nome: existente.nome || nome },
      novo: false,
    });
  }

  // Nome livre: a primeira pessoa a usá-lo com um PIN fica com ele.
  try {
    const criado = await store.createUser({
      email: slug,
      passwordHash: await hashPassword(pin),
      nome,
      prefs: {},
    });
    await setSessionCookie(issue(criado.id, criado.email));
    return Response.json({ perfil: { slug: criado.email, nome: criado.nome || nome }, novo: true });
  } catch (err) {
    // Corrida: alguém criou o mesmo nome entre a consulta e a gravação.
    if (err instanceof EmailTaken) {
      return Response.json({ error: 'Esse nome acabou de ser tomado. Tente outro.' }, { status: 409 });
    }
    throw err;
  }
}
