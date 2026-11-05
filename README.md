# Saint Village XX Century · Oráculo

Narrador de crônicas solo numa metrópole portuária da Costa Oeste, ao longo de cinco eras
(1934, 1946, 1974, 1994, 1999). Motor de regras baseado no GUMSHOE SRD, com ficha de personagem,
gerador de casos, mapa da cidade navegável, elenco de Personagens do Diretor e um narrador ligado a
uma LLM.

Baseado em *Saint Village XX Century*, de Felipe Malorgio · GUMSHOE SRD (CC-BY 3.0).

---

## O que é este repositório

A interface e o motor de regras vêm de um **Claude Artifact compilado** (um HTML de 6 MB, em
`source/original.html`). Este projeto o transforma em produto — contas, área de membro, múltiplas
crônicas, narrador em LLM real — **sem alterar um pixel da interface**.

Três coisas o artifact não tinha e aqui existem:

| | Antes | Agora |
|---|---|---|
| Narrador | `window.claude.complete`, só dentro do runtime de artifacts | `/api/narrate` com dois providers por env |
| Progresso | `localStorage`, perdido ao trocar de navegador | conta, com N crônicas por era |
| Texto do livro | 414 KB baixados pelo navegador | só no servidor, na montagem do prompt |

---

## Fidelidade visual: como ela é garantida

O layout **não foi reescrito**. Foi traduzido mecanicamente, e a fidelidade é **verificada por diff
de imagem**, não por inspeção visual.

### O código gerado

Três scripts transformam `source/` em código, e rodam juntos com `npm run gen`:

| Script | Entrada | Saída |
|---|---|---|
| `tools/extract-css.mjs` | `source/template.html` | `app/oracle.css` — os 2 blocos `<style>` verbatim |
| `tools/transpile-template.mjs` | `source/template.html` | `components/generated/OracleView.tsx` + `hover.css` |
| `tools/port-logic.mjs` | `source/component.js` | `lib/oracle/logic.tsx` + `lib/server/prompt.ts` |
| `tools/split-data.mjs` | `source/sv_*.js` | `lib/oracle/data/*.json` (cliente) + `lib/server/book/*.json` (servidor) |

Os arquivos gerados são commitados e marcados `GENERATED`. **Não edite à mão** — mexa no script ou
na fonte e rode `npm run gen`.

### As regras do transpilador

O conjunto de construções do template é fechado, e as contagens são conferidas a cada geração
(se divergirem, o script falha):

| Construção | Ocorrências | Tradução |
|---|---|---|
| `<sc-if value="{{ x }}">` | 80 | `{v.x ? (<>…</>) : null}` |
| `<sc-for list="{{ xs }}" as="t">` | 62 | `.map((t, i) => <Fragment key={i}>…</Fragment>)` |
| `sc-camel-on-*` | 137 | `onClick`, `onChange`, `onPointerDown`… |
| `style-hover` | 31 | regra `.svh-N:hover{…}` gerada + `className` |
| `<sc-raw-select>` | 15 | `<select>` controlado |
| `style="…"` inline | ~900 | objeto JS, **valores preservados** |

Duas regras não negociáveis:

- **Nenhum valor de CSS é normalizado.** Nada de reordenar, encurtar cores ou mexer em espaços
  dentro do valor. O splitter respeita parênteses, porque `clamp(68px,13vw,156px)`,
  `polygon(0 0,calc(100% - 12px) 0,…)` e gradientes múltiplos com `rgba()` têm vírgulas aninhadas.
- **Texto sai como string literal** (`{"…"}`), não como texto JSX. O JSX apara espaços nas bordas
  de linha, e isso mudaria o render em limites de elementos inline.

### A responsividade vem de graça

Contando no template original:

| | Ocorrências |
|---|---|
| Breakpoints em JS (`innerWidth`, `matchMedia`, `resize`) | **0** |
| `@media` de layout | **0** (a única é `prefers-reduced-motion`) |
| `clamp()` / `flex-wrap` / `auto-fit` / `minmax()` / `vw` | 20 / 52 / 26 / 26 / 18 |

Toda a responsividade é fluida e mora **dentro dos valores inline**. Como o transpilador não
normaliza valor nenhum, ela é preservada por construção: não há media query para portar errado nem
breakpoint para reimplementar.

### Fontes

As **59 regras `@font-face`** saem verbatim do original, com cada `unicode-range` de subset.
Deliberadamente **sem `next/font`**: ele reescreve nomes de família e `font-display`, que é
justamente o tipo de mudança que desloca tipografia por fração de pixel.

O artifact empacotava 24 dos arquivos; as outras **12 regras ainda apontavam para
`fonts.gstatic.com`** (Limelight, Monoton, Playfair Display). Foram baixadas e auto-hospedadas — os
mesmos bytes, então o render é idêntico, e o app não depende de CDN de terceiro. O extrator falha se
sobrar qualquer URL remota no CSS.

### O gate: `npm run verify:pixel`

Compara o HTML original com o app novo, lado a lado:

- **4 viewports** (390, 768, 1280, 1680) × **tela de eras + 8 abas × 5 eras** = 164 comparações.
- Mesmo save injetado em `localStorage` nas duas pontas (a mesma chave do artifact, de propósito).
- `Math.random` com semente fixa, animações e transições desligadas, fontes servidas do disco nas
  duas pontas (inclusive as 12 que o original buscava no Google).
- Tolerância de **0,1%** dos pixels; acima disso falha e salva original, novo e diff em
  `tests/pixel/__diff__/`.

```bash
npm run build && npm run verify:pixel
npm run verify:pixel -- --viewport 1280 --era 1934 --tab ficha   # um caso só
```

**Resultado: 164/164 em exatamente 0,000%.** Nenhum pixel de diferença em nenhuma das 4 viewports,
8 abas e 5 eras.

| Viewport | Comparações | Falhas |
|---|---|---|
| 390 | 41 | 0 |
| 768 | 41 | 0 |
| 1280 | 41 | 0 |
| 1680 | 41 | 0 |

O artifact de 6 MB às vezes não termina de se desempacotar dentro do tempo; o gate repete o caso
até 3 vezes antes de reprovar, porque isso é lentidão dele, não divergência de layout.

#### Controles de formulário: comparados pelo DOM, não por pixel

Uma divergência real apareceu no caminho e vale registrar, porque explica uma decisão do gate.

No 390px a aba Dados diferia em 0,14%. Medindo: caixa, padding, fonte, número de opções e opção
selecionada **idênticos** nos dois lados, com a mesma posição fracionária (453,796875px) — e
**969 de 969 pixels divergentes dentro de `<select>`, zero fora**. O texto interno de um `<select>`
é desenhado pelo caminho do controle *nativo* do Chromium, não por CSS, e dois documentos que
chegam ao mesmo layout por caminhos de reflow diferentes podem pousá-lo um pixel acima ou abaixo.

Afrouxar a tolerância global mascararia regressões de verdade. Em vez disso:

- a **geometria e o conteúdo** dos controles (posição, tamanho, valor, opção selecionada, número de
  opções) são comparados pelo DOM — o que é **mais rigoroso** que pixel: pega opção errada, valor
  errado ou tamanho errado, que um diff de imagem poderia deixar passar;
- e só o **interior** deles é achatado antes do diff, com recuo de 2px, preservando a borda, que é
  desenhada por CSS e continua sendo comparada.

> Não rode `next build` enquanto o gate estiver no ar: trocar o `.next` debaixo do `next start`
> esvazia as páginas e derruba todos os casos. O gate compara o `BUILD_ID` antes e depois e avisa
> se isso aconteceu.

### A única adição à interface

`components/AccountChip.tsx` — o acesso a entrar/cadastrar. É `position: fixed`, portanto **fora do
fluxo**: não desloca um pixel. O gate o esconde por CSS, então a comparação continua cobrindo a
página inteira. Se ele deixar de ser `fixed`, a altura da página muda e o gate falha.

---

## O porte da lógica

`DCLogic`, a classe-base do runtime de artifacts, expõe exatamente `state`, `setState`, `props` e
chama `renderVals()`. Então:

```ts
class OracleLogic extends React.Component {   // antes: extends DCLogic
  render() { return <OracleView v={this.renderVals()} />; }
}
```

Um shim de 5 linhas. As 572 linhas do motor de regras — GUMSHOE, parser de marcações, rolagem de
dados, choques de Sangue-Frio, Fios do Mural, salto de era com herdeiro, navegação do mapa — são
copiadas **verbatim** em duas fatias (`21-141` e `212-572`). `ingest()`, que lê as marcações da
resposta e aplica na ficha, não muda uma linha.

O que mudou, e só:

1. `systemPrompt()` (linhas 144-195) foi para `lib/server/prompt.ts` — depende do texto do livro.
2. `narrate()` fala com `/api/narrate` em vez de `window.claude`.
3. `genNpc()` fala com `/api/npc` (também usava o texto do livro).
4. `load()`/`save()` passam pelo `Store` (localStorage na demo, API na conta).
5. `DCLogic` → `React.Component`.

O porter valida cada substituição e falha se o arquivo de origem mudar de forma.

`lib/oracle/logic.tsx` tem `@ts-nocheck` **de propósito**: é código verbatim, validado pelo diff de
pixels e pelos testes do parser, não pelo compilador. Todo código novo é tipado normalmente.

---

## Cliente × servidor

`textos` e `geral` — 414 KB de prosa do livro — são usados **só** na montagem do prompt
(`component.js:162` e `:549`). Vão inteiros para o servidor:

| | Antes | Depois |
|---|---|---|
| Payload de dados no cliente | 617 KB | **203 KB** |
| Prosa do livro baixável | sim | não |

`tools/split-data.mjs` verifica isso: se um trecho do livro aparecer nos dados do cliente, falha.

> `sv_seculo.js` **estende** `SV_REGRAS` e `SV_LIVROS` (é ele que acrescenta as eras 1946/1974/1999),
> então a ordem de avaliação importa e o script snapshota o estado final dos globais.

---

## O narrador

### Dois providers, por env

```
LLM_PROVIDER=claude     # Anthropic Messages API, nativa
LLM_PROVIDER=opencode   # qualquer endpoint OpenAI-compatível
```

O segundo atende OpenCode Zen, Vercel AI Gateway, OpenRouter, Ollama, LM Studio — trocar de backend
é mexer em variável, sem deploy.

### Custo por turno, e como ele foi cortado

Medido no prompt do artifact:

| Bloco | Chars | ~Tokens |
|---|---|---|
| Texto da região (`textos[cena]`) | 11.000 | 3.050 |
| Facções e cidade (`geral`) | 5.375 | 1.490 |
| Regras da era | 3.036 | 845 |
| Regras do século + cânone | 4.389 | 1.220 |
| Cronologia + testemunhas | 1.676 | 465 |
| **Subtotal estável** | **25.476** | **~7.075** |
| Ficha, caso, PdDs, histórico | — | ~2.400 |
| **Entrada total** | | **~9.500** |

Esses ~7.100 tokens são **idênticos entre turnos** da mesma crônica na mesma região. Então o prompt
sai em dois blocos e o estável leva `cache_control` — leitura de cache custa ~10% da entrada normal,
e a entrada efetiva cai para **~3.100 tokens** (−67%).

Com `claude-haiku-5-5` (US$ 0,10/MTok entrada, 0,50 saída), isso dá da ordem de **US$ 0,0008 por
turno**, ou ~US$ 0,80 por mil turnos. Com `claude-sonnet-5-5` (US$ 2,00 / 10,00), cerca de 20×
mais.

Três botões, todos por env e sem deploy:

- `BOOK_CONTEXT_CHARS` (11000) — o maior bloco do prompt; 6000 corta ~1.400 tokens/turno.
- `HISTORY_TURNS` (18, o valor do original) — reduz a entrada em crônicas longas.
- Tamanho da narração, por usuário — "curto" contra "longo" é ~2,5× no custo de saída.

Mais a cota diária: `DAILY_TURNS_PER_USER` e `DEMO_TURNS_PER_IP`.

### Streaming sem quebrar as regras

A prosa chega em stream e aparece na tela conforme sai, com um filtro que esconde marcações — até
uma `[PIST` pela metade no fim do buffer. As marcações só são aplicadas no fim, pelo `ingest()`
original, sobre o texto completo. O motor de regras não é tocado.

---

## Dados

### Por que Neon e não Vercel Blob

O Blob seria first-party, mas o plano gratuito dele é dimensionado para assets, não para escritas de
aplicação:

| | Teto que importa aqui | Armazenamento | Ao estourar |
|---|---|---|---|
| **Vercel Blob** (Hobby) | **10.000 operações/mês** | 1 GB | Blob bloqueado; não cobra |
| **Neon** (Free) | **sem teto de operações** (100 CU-h) | 1 GB | computação suspensa; não cobra excedente |
| **Upstash Redis** (Free) | 500.000 comandos/mês | 250 MB | não cobra excedente |

Este app gasta ~4 operações por turno. No Blob isso daria **~2.500 turnos/mês para o app inteiro**,
e o modo de falha é o Blob *bloquear* — app quebrado. O Neon não tem teto de operações, tem 4× o
armazenamento do Upstash, e guarda save games em que a pessoa investe horas (o Redis gratuito
arquiva bancos após 30 dias sem uso).

O Neon é instalado pelo **Marketplace da Vercel**, com as envs injetadas e gestão no painel da
Vercel.

### Reversibilidade

Tudo passa por `DataStore` (`lib/store/index.ts`), escolhido por `DATA_BACKEND`:

- `fs` — grava em `.data/`. Para desenvolvimento e testes; **não** serve em serverless.
- `neon` — produção. SQL à mão, driver HTTP (sem pool, que não se reaproveita em serverless).

Quatro tabelas: `users`, `campaigns` (estado em `jsonb` + `rev`), `quota`, `shares`.

`campaigns.state` guarda **exatamente** a forma que `blankEra()` produz — é isso que torna o porte
trivial: o shape do dado não muda, só o meio. O lock otimista é `WHERE rev = $n`; a cota é atômica
num único `INSERT … ON CONFLICT … DO UPDATE`.

### Sessão

JWT-like assinado com HMAC-SHA256 em cookie httpOnly, **sem estado no servidor** — zero leitura de
banco por request, o que importa num plano gratuito. Senha com `scrypt` do `node:crypto` (nativo,
sem dependência binária, que em serverless é fonte comum de falha de deploy).

Esta versão **não envia e-mails**: não há verificação nem recuperação automática de senha. Ligar o
Resend depois é acrescentar um provider, não refazer o auth.

---

## Rodando local

```bash
npm install
cp .env.example .env.local      # preencha ANTHROPIC_API_KEY e AUTH_SECRET
npm run gen                     # regenera o código a partir de source/
npm run dev
```

Gere a `AUTH_SECRET` com:

```bash
openssl rand -base64 32
```

Sem `ANTHROPIC_API_KEY`, o app roda e a interface funciona inteira; só a narração responde 503 com
a mensagem de configuração.

## Verificação

```bash
npm run typecheck        # tsc --noEmit
npm run test             # Vitest: construtor de prompt (5 eras) + rota de narração
npm run build            # build de produção
npm run verify:pixel     # 164 comparações contra o HTML original
npm run test:smoke       # ponta a ponta contra um servidor no ar (ver abaixo)
```

O smoke test precisa de um servidor rodando:

```bash
AUTH_SECRET=$(openssl rand -base64 32) DATA_BACKEND=fs npx next start -p 3102 &
npm run test:smoke
```

Ele cobre cadastro, sessão, criação de crônica, lock otimista, progresso derivado, exportação e
link público — e três controles que um teste de UI não pegaria: rev obsoleto é rejeitado, o link
anônimo **não** entrega a verdade oculta do caso, e uma conta não enxerga a crônica de outra.

## Deploy

```bash
vercel install neon      # provisiona o Postgres (plano Free) e injeta DATABASE_URL
vercel deploy --prod
```

Envs obrigatórias em produção: `ANTHROPIC_API_KEY`, `AUTH_SECRET`, `DATA_BACKEND=neon`,
`DATABASE_URL`. As demais têm padrão — ver `.env.example`.

> O **plano Hobby da Vercel é restrito a uso não comercial** pelos termos deles. Enquanto o jogo for
> gratuito, tudo certo; no dia em que cobrar algo, a Vercel passa a exigir o Pro.

### O que cada credencial destrava

O app sobe e funciona por etapas — não é tudo ou nada:

| Com | O que funciona |
|---|---|
| nada | A interface inteira, navegável nas 5 eras e 8 abas. Sem narração, sem contas. |
| `ANTHROPIC_API_KEY` | **O jogo completo em modo demo**: narração, dados, pistas, geração de PdD. O progresso fica no navegador. |
| `+ DATABASE_URL` | Contas, área de membro, N crônicas por era, exportação, link público, painel do século. |

Sem um banco durável configurado, as contas se **desligam explicitamente**: o cadastro responde 503
com uma mensagem clara e o chip de conta some, em vez de aceitar um cadastro que sumiria depois (o
backend de arquivo é efêmero em serverless). O critério é `VERCEL=1`, não `NODE_ENV`, porque num
servidor próprio o disco persiste e o backend de arquivo é legítimo.
