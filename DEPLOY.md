# Deploy e configuração

> **Estado em 06/11/2026:** a versão do designer está no ar em `saint-village-1934.vercel.app`,
> com o banco Neon ligado (esquema criado automaticamente) e o narrador funcionando via OpenRouter
> — verificado por `/api/health?probe=llm`, que fez uma chamada real e recebeu 149 palavras
> íntegras em 1,9 s.
>
> **Falta uma coisa, com você:**
>
> 1. **Deployment Protection** ainda está ligada, então visitante anônimo não abre a URL. É o
>    último passo entre o projeto e o público. Veja a seção 4.
> 2. ~~Os 19 arquivos de mídia~~ — **entregues e no ar.** `curl -s <url>/api/health | jq .midia`
>    responde `{"presentes":19,"faltando":0}`.
>
> **Um defeito encontrado e corrigido na verificação:** a sonda flagrou a narração cortada no meio
> de uma frase. O diagnóstico deu o número: `finish_reason: "length"`, 1.000 tokens de saída, **769
> deles de raciocínio** — sobravam ~231 para a prosa. Não era variação: toda narração real sairia
> cortada. O adapter agora manda `reasoning: { enabled: false }` ao OpenRouter, e repete sem o
> parâmetro se o endpoint reclamar dele. Para reativar num modelo em que o raciocínio compense,
> `OPENROUTER_REASONING=on` — e suba o orçamento junto, ou o corte volta.

---

# Variáveis de ambiente

Cole em **Vercel → projeto `saint-village-1934` → Settings → Environment Variables**. A tela aceita
colar várias linhas de uma vez (`CHAVE=valor`). Marque os três alvos: *Production*, *Preview* e
*Development*.

---

## 1. Obrigatórias

### `AUTH_SECRET`

Assina os cookies de sessão. **Gere o seu** e não reaproveite nenhum valor que tenha passado por
chat ou e-mail:

```bash
openssl rand -base64 32
```

```
AUTH_SECRET=<cole aqui o que o comando acima imprimiu>
```

### A chave da LLM — escolha **um** provedor

O `LLM_PROVIDER` decide qual adapter roda. Preencha só o bloco do provedor escolhido.

**Opção A — Anthropic (recomendada).** É o único com *prompt caching*, que corta cerca de dois
terços da entrada por turno: ~9.500 → ~3.100 tokens. Com `claude-haiku-5-5` sai na ordem de
US$ 0,80 por mil turnos.

```
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...
```

**Opção B — OpenRouter.** Um cadastro só, com acesso a centenas de modelos (inclusive Claude).

```
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_SITE_URL=https://saint-village-1934.vercel.app
```

**Opção C — OpenAI.**

```
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
```

**Opção D — qualquer endpoint OpenAI-compatível** (OpenCode Zen, Vercel AI Gateway, Ollama…).

```
LLM_PROVIDER=opencode
OPENCODE_BASE_URL=https://opencode.ai/zen/v1
OPENCODE_API_KEY=...
OPENCODE_MODEL_FAST=...
OPENCODE_MODEL_QUALITY=...
```

---

## 2. O banco

**Nada a fazer**, se a integração do Neon já injetou a URL no projeto. O app procura, nesta ordem,
por `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `DATABASE_URL_UNPOOLED` e
`POSTGRES_URL_NON_POOLING` — e, achando qualquer uma, usa o banco automaticamente.

**As tabelas também se criam sozinhas.** Na primeira vez que o app toca o banco, ele confere se a
tabela `users` existe e, não existindo, roda o esquema. Custa uma consulta barata por cold start e
não precisa de nenhum comando.

Se preferir fazer à mão (por exemplo, para conferir antes de abrir ao público):

```bash
vercel link && vercel env pull .env.local && npm run migrate
```

---

## 3. Opcionais — controle de custo

Todas têm padrão; mexa só se quiser apertar o gasto.

```
DAILY_TURNS_PER_USER=50     # turnos por dia, por conta
DEMO_TURNS_PER_IP=5         # turnos por dia para quem joga sem conta
BOOK_CONTEXT_CHARS=11000    # maior bloco do prompt; 6000 corta ~1.400 tokens/turno
HISTORY_TURNS=18            # entradas do diário enviadas como histórico
```

---

## 4. Deployment Protection — o passo que falta

O projeto está com **Vercel Authentication ligada** (`ssoProtection: all_except_custom_domains`, o
padrão do time). Com ela, quem não é do time recebe a tela de login da Vercel em vez do jogo.

**Vercel → projeto → Settings → Deployment Protection → Vercel Authentication → Disabled → Save.**

Para conferir, abra `https://saint-village-1934.vercel.app/` numa janela anônima: tem que aparecer
a tela de escolha de era, não um login.

---

## Como conferir que deu certo

Abra no navegador (ou com `curl`):

```
https://saint-village-1934.vercel.app/api/health
```

Ele responde o que está ligado — **sem expor o valor de nenhuma chave**:

```json
{
  "ok": true,
  "narrador": { "LLM_PROVIDER": "claude", "pronto": true,
                "modeloRapido": "claude-haiku-5-5", "modeloApurado": "claude-sonnet-5-5" },
  "banco":    { "urlEncontradaEm": "DATABASE_URL", "contasLigadas": true, "tabelasOk": true },
  "sessao":   { "AUTH_SECRET": "definida" }
}
```

O que olhar, em ordem:

| Campo | Se estiver errado |
|---|---|
| `narrador.pronto: false` | falta a chave do provedor, ou o `LLM_PROVIDER` aponta para um sem chave — o campo `problema` diz qual |
| `narrador.LLM_PROVIDER` com "(não definida)" | o app está assumindo `claude`; defina a variável para escolher outro |
| `banco.urlEncontradaEm: "(nenhuma)"` | a integração do banco não injetou URL nenhuma no projeto |
| `banco.tabelasOk: false` | o banco respondeu, mas o esquema falhou — o campo `problema` traz o erro |
| `sessao.AUTH_SECRET` com "(não definida)" | cadastro e login vão falhar |
| HTML de login da Vercel | Deployment Protection ainda ligada (passo 4) |

`ok: false` devolve HTTP 503, então dá para monitorar.

Depois, no app: abra a era 1934, escreva uma ação e envie. Se o narrador responder, a chave da LLM
está valendo. Se vier *"O narrador não respondeu"*, confira a chave; se vier a mensagem sobre
arquivos fechados, é a cota diária.
