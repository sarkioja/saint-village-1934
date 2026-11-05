// Gera o bloco de variáveis de ambiente para colar na Vercel, com um
// AUTH_SECRET novo a cada execução.
//
//   node tools/gen-env.mjs [claude|openai|openrouter|opencode] > producao.env
//
// O segredo é gerado aqui e não num chat: ele assina os cookies de sessão, e
// um valor que passou por transcript, e-mail ou captura de tela deve ser
// considerado queimado.

import { randomBytes } from 'node:crypto';

const provedor = (process.argv[2] || 'claude').toLowerCase();
const VALIDOS = ['claude', 'openai', 'openrouter', 'opencode'];
if (!VALIDOS.includes(provedor)) {
  console.error(`provedor desconhecido: ${provedor} (use ${VALIDOS.join(', ')})`);
  process.exit(2);
}

const BLOCOS = {
  claude: `ANTHROPIC_API_KEY=COLE_SUA_CHAVE_AQUI
# Opcionais — só mexa para trocar de modelo:
# CLAUDE_MODEL_FAST=claude-haiku-5-5
# CLAUDE_MODEL_QUALITY=claude-sonnet-5-5`,

  openai: `OPENAI_API_KEY=COLE_SUA_CHAVE_AQUI
# Opcionais:
# OPENAI_MODEL_FAST=gpt-4o-mini
# OPENAI_MODEL_QUALITY=gpt-4o
# OPENAI_BASE_URL=https://api.openai.com/v1`,

  openrouter: `OPENROUTER_API_KEY=COLE_SUA_CHAVE_AQUI
OPENROUTER_SITE_URL=https://saint-village-1934.vercel.app
# Opcionais:
# OPENROUTER_APP_NAME=Saint Village XX Century
# OPENROUTER_MODEL_FAST=anthropic/claude-haiku-4.5
# OPENROUTER_MODEL_QUALITY=anthropic/claude-sonnet-4.5`,

  opencode: `OPENCODE_BASE_URL=https://opencode.ai/zen/v1
OPENCODE_API_KEY=COLE_SUA_CHAVE_AQUI
OPENCODE_MODEL_FAST=COLE_O_MODELO_AQUI
OPENCODE_MODEL_QUALITY=COLE_O_MODELO_AQUI`,
};

console.log(`# Saint Village XX Century — variáveis de produção
# Gerado em ${new Date().toISOString()} para o provedor: ${provedor}
# Cole em: Vercel > projeto > Settings > Environment Variables
# Marque Production, Preview e Development.

# --- qual provedor de LLM roda -----------------------------------------------
LLM_PROVIDER=${provedor}

# --- a chave do provedor escolhido -------------------------------------------
${BLOCOS[provedor]}

# --- assinatura dos cookies de sessão ----------------------------------------
# Gerado agora. Se precisar trocar, rode este script de novo; trocar invalida
# as sessões abertas (todo mundo precisa entrar de novo).
AUTH_SECRET=${randomBytes(32).toString('base64')}

# --- banco de dados -----------------------------------------------------------
# Nada a fazer: o app encontra a URL que a integração do Neon já injetou
# (DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, DATABASE_URL_UNPOOLED ou
# POSTGRES_URL_NON_POOLING) e liga o banco sozinho.
# Falta só criar as tabelas, uma vez: npm run migrate

# --- controle de custo (opcional) --------------------------------------------
# Todos têm padrão; descomente para apertar o gasto.
# DAILY_TURNS_PER_USER=50    # turnos por dia, por conta
# DEMO_TURNS_PER_IP=5        # turnos por dia para quem joga sem conta
# BOOK_CONTEXT_CHARS=11000   # maior bloco do prompt; 6000 corta ~1.400 tokens/turno
# HISTORY_TURNS=18           # entradas do diário enviadas como histórico
`);
