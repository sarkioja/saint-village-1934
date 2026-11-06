# Saint Village XX Century · Oráculo

Narrador de crônicas solo numa metrópole portuária da Costa Oeste, ao longo de cinco eras
(1934, 1946, 1974, 1994, 1999). Motor de regras baseado no GUMSHOE SRD, com ficha de personagem,
gerador de casos, mapa da cidade navegável, elenco de Personagens do Diretor e um narrador ligado a
uma LLM.

Baseado em *Saint Village XX Century*, de Felipe Malorgio · GUMSHOE SRD (CC-BY 3.0).

---

## O que é este repositório

A interface e o motor de regras vêm de um **Claude Artifact compilado** (um HTML de 6,5 MB, em
`source/original-v2.html` — a revisão do designer; a primeira versão continua em
`source/original.html`). Este projeto o transforma em produto — contas, área de membro, múltiplas
crônicas, narrador em LLM real — **sem alterar um pixel da interface**, com uma exceção declarada e
verificada (campos de uma linha, abaixo).

Cada rodada do designer é reprocessada por script, não à mão:

```bash
node tools/extract-artifact.mjs source/original-v2.html   # desempacota o bundle
npm run gen:assets                                        # fontes e imagens -> public/
npm run gen                                               # CSS, JSX, dados, lógica, trilha
npm run build && npm run verify:pixel                     # e o gate decide se valeu
```

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

- **6 viewports** (390, 767, 768, 1024, 1280, 1680) × **tela de eras + 7 abas × 5 eras, mais a
  variante da Ficha com os `<details>` abertos** = 246 comparações.
- 767 e 768 são o par em volta do ponto onde os grids `auto-fit` trocam de número de colunas — é a
  largura em que um arredondamento diferente apareceria.
- Mesmo save injetado em `localStorage` nas duas pontas (a mesma chave do artifact, de propósito).
- `Math.random` com semente fixa, fontes servidas do disco nas duas pontas (inclusive as 18 que o
  original buscava no Google), e animações congeladas **depois** do load — o artifact reescreve o
  documento ao se desempacotar e levava junto a folha que as desliga.
- Tolerância de **0,1%** dos pixels; acima disso falha e salva original, novo e diff em
  `tests/pixel/__diff__/`.

```bash
npm run build && npm run verify:pixel
npm run verify:pixel -- --viewport 1280 --era 1934 --tab ficha   # um caso só
SV_TOL=0 npm run verify:pixel -- --viewport 390 --tab cronica    # investigar resíduo
```

**Resultado: 246/246 dentro da tolerância; 216 em exatamente 0,000%.**

| Viewport | Comparações | Falhas | Em 0,000% |
|---|---|---|---|
| 390 | 41 | 0 | 36 |
| 767 | 41 | 0 | 36 |
| 768 | 41 | 0 | 36 |
| 1024 | 41 | 0 | 36 |
| 1280 | 41 | 0 | 36 |
| 1680 | 41 | 0 | 36 |

#### O resíduo de 0,06%, e por que ele fica

As 30 comparações não-zero são todas a aba **Crônica**, e todas no mesmo lugar: a coluna de rótulos
dos medidores do painel lateral (*Saúde*, *Sangue-Frio*, *Integridade*, *Impulsos*). Medindo pixel a
pixel, a razão de brilho é constante — 0,706 — e a causa está no DOM:

```
original:  span.sc-interp   color = rgb(212,212,212)   ← wrapper do runtime de artifacts
           span             color = rgb(149,150,153)   ← o que o designer escreveu
novo:      span             color = rgb(149,150,153)
```

O runtime de artifacts embrulha cada interpolação `{{ }}` num `<span class="sc-interp">` e o pinta
com a cor de tinta padrão, ignorando o `color` que o designer deu ao rótulo. Onde a cor herdada já
é a padrão — quase a página inteira — não se nota; nesses rótulos propositalmente apagados, sim.

Reproduzir isso exigiria emitir um wrapper em volta de **toda** interpolação do template só para
copiar o override de cor de um host que não faz parte do produto. A conta não fecha: seria uma
mudança estrutural grande, com risco de deslocamento em linha, para replicar um comportamento do
runtime do artifact que o designer nunca pediu — e que some quando ele mesmo olha o CSS que
escreveu. Fica registrado aqui, medido, em vez de escondido numa tolerância frouxa.

O artifact de 6,5 MB às vezes não termina de se desempacotar dentro do tempo; o gate repete o caso
até 3 vezes antes de reprovar, porque isso é lentidão dele, não divergência de layout.

#### Por que a Ficha tem duas variantes

No v2 a aba Ficha nasce com **todo** o conteúdo dentro de cinco `<details>` fechados. Comparar só
esse estado cobriria cinco cabeçalhos e mais nada — a ficha inteira ficaria fora do gate. Cada era
tem então `ficha` (como abre) e `ficha-aberto`, com os `<details>` abertos nos dois lados.

Controles dentro de `<details>` fechado ficam fora da comparação de DOM: o Chromium devolve ora a
última caixa conhecida, ora `0x0`, conforme o momento da medição.

#### Controles de formulário: comparados pelo DOM, não por pixel

Uma divergência real apareceu no caminho e vale registrar, porque explica uma decisão do gate.

Na v1, a aba Dados a 390px diferia em 0,14%. Medindo: caixa, padding, fonte, número de opções e opção
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

Ele aparece **só na tela de escolha de era**, no canto superior direito. Em jogo não existe canto
livre, e isso foi medido: no canto inferior direito o player da trilha (também `fixed`, com
`z-index` 70 contra 50) cobria os botões; subindo o chip acima dele, ele passa a cobrir o contador
de Impulsos no desktop e o botão **Enviar** do compositor a 390px. Tapar um controle é pior que o
defeito original, e empilhar o chip sobre a prosa da crônica é feio sem resolver. O acesso à conta
continua a um clique: *Trocar era* volta para a tela onde ele está.

### A trilha ambiente vai verbatim

O v2 trouxe `sv_audio.js`: uma IIFE que monta o player de trilha direto no DOM, sem React e sem
template. `tools/sync-audio.mjs` a publica em `public/sv_audio.js` **copiada byte a byte**, mudando
só os dois caminhos de mídia para absolutos — e falhando se não os encontrar, em vez de publicar um
player mudo. Ela desenha parte do layout que o gate compara; reescrevê-la em JSX seria trocar uma
garantia por um risco sem ganho nenhum.

### O desvio deliberado: campos de uma linha

Esta é a **única** diferença intencional de aparência em relação ao artifact, e foi pedida: selects
e inputs de uma linha não tinham a mesma altura nem o mesmo recuo. Medido antes:

| Onde | Input de texto | Select ao lado |
|---|---|---|
| Caso (nova pista) | 42px | 44px |
| Crônica (região da cena) | — | 46px |
| Elenco (busca) | recuo 14px | recuo 10px |
| Ficha (grade sublinhada) | 39,4px | 44px |

Cada número vem de um `style` inline diferente, escrito campo a campo. O valor canônico não foi
inventado: é o `height:44px; padding:0 12px` que o próprio designer usa em `.svr-sel`, no painel de
dados — e 44px já era o mínimo de alvo de toque que ele aplicava aos selects.

`tools/transpile-template.mjs` lê a família de cada campo do próprio `style` inline — **caixa**
(borda nos quatro lados) ou **sublinhado** (só `border-bottom`) — e marca a classe; `app/campos.css`
iguala altura e recuo dentro de cada família. A altura do sublinhado é mínima, não fixa, para não
espremer o título do caso, que é um campo de 28px.

Duas verificações, porque uma só não bastaria:

- `tests/campos.test.ts` prova que **todo** campo de uma linha declara a família dele. Um campo novo
  numa revisão futura, sem classe, voltaria a ter a altura do `style` inline e desalinharia a linha
  — e falharia aqui, na geração, não no navegador.
- o gate aplica `app/campos.css` **também ao artifact original**. Assim ele continua provando que
  todo o resto é idêntico, em vez de virar uma lista de exceções onde qualquer regressão se
  esconderia.

---

## O porte da lógica

`DCLogic`, a classe-base do runtime de artifacts, expõe exatamente `state`, `setState`, `props` e
chama `renderVals()`. Então:

```ts
class OracleLogic extends React.Component {   // antes: extends DCLogic
  render() { return <OracleView v={this.renderVals()} />; }
}
```

Um shim de 5 linhas. As 663 linhas do motor de regras — GUMSHOE, parser de marcações, rolagem de
dados, choques de Sangue-Frio, Fios do Mural, salto de era com herdeiro, navegação do mapa, e a
animação 3D de dados que o v2 trouxe — são copiadas **verbatim**. `ingest()`, que lê as marcações da
resposta e aplica na ficha, não muda uma linha.

As fatias são localizadas **por padrão de texto**, não por número de linha. A primeira versão do
porter usava linhas fixas e quebrou inteira quando o designer entregou a revisão: o prelúdio passou
de 20 para 85 linhas. Procurar pelo texto custa o mesmo e sobrevive à próxima rodada.

O que mudou, e só:

1. `systemPrompt()` foi para `lib/server/prompt.ts` — depende do texto do livro.
2. `narrate()` fala com `/api/narrate` em vez de `window.claude`.
3. `genNpc()` fala com `/api/npc` (também usava o texto do livro).
4. `load()`/`save()` passam pelo `Store` (localStorage na demo, API na conta).
5. `DCLogic` → `React.Component`.
6. Os caminhos de mídia relativos (`fundos/bar.jpg`, `musica/…`) viram absolutos — no artifact a
   página era um arquivo solto e o caminho resolvia ao lado dela; aqui resolveria contra a rota, e
   em `/jogar/<id>` viraria `/jogar/fundos/bar.jpg`.

O porter valida cada substituição e falha se o arquivo de origem mudar de forma.

`lib/oracle/logic.tsx` tem `@ts-nocheck` **de propósito**: é código verbatim, validado pelo diff de
pixels e pelos testes do parser, não pelo compilador. Todo código novo é tipado normalmente.

---

## Cliente × servidor

`textos` e `geral` — 414 KB de prosa do livro — são usados **só** na montagem do prompt. Vão
inteiros para o servidor:

| | Antes | Depois |
|---|---|---|
| Payload de dados no cliente | 617 KB | **203 KB** |
| Prosa do livro baixável | sim | não |

`tools/split-data.mjs` verifica isso: se um trecho do livro aparecer nos dados do cliente, falha.

> `sv_seculo.js` **estende** `SV_REGRAS` e `SV_LIVROS` (é ele que acrescenta as eras 1946/1974/1999),
> então a ordem de avaliação importa e o script snapshota o estado final dos globais.

---

## O narrador

### Quatro provedores, por env

```
LLM_PROVIDER=claude      # Anthropic Messages API, nativa
LLM_PROVIDER=openai      # api.openai.com
LLM_PROVIDER=openrouter  # openrouter.ai — centenas de modelos, inclusive Claude
LLM_PROVIDER=opencode    # OpenCode Zen, ou qualquer endpoint OpenAI-compatível
```

Os três últimos compartilham um adapter só (`/v1/chat/completions`), que difere em base URL, nome
da variável de chave, modelos padrão e cabeçalhos. `opencode` é o genérico: aponte
`OPENCODE_BASE_URL` para OpenCode Zen, Vercel AI Gateway, Ollama, LM Studio ou qualquer outro
compatível. Trocar de provedor é mexer em variável, sem deploy.

Três detalhes que o adapter trata sozinho:

- **`max_completion_tokens`** — alguns modelos de raciocínio da OpenAI recusam `max_tokens`. Em vez
  de perder o turno, o adapter repete a chamada com o campo que o modelo aceita.
- **Erro no meio do stream** — o OpenRouter pode mandar um objeto de erro já dentro do SSE; ele vira
  exceção, não texto narrado.
- **Raciocínio desligado no OpenRouter** — achado pela sonda em produção, não por suposição: o
  `deepseek-v4.1-flash` devolvia `finish_reason: "length"` com **769 dos 1.000 tokens de saída
  gastos em raciocínio**, sobrando ~231 para a prosa, e a cena chegava ao jogador cortada no meio
  de uma frase. O orçamento de 1.000 é o do artifact original e é de sobra para as 260 palavras do
  tamanho "longo" — o que o estourava era o modelo pensando dentro dele. O adapter manda
  `reasoning: { enabled: false }` e repete sem o parâmetro se o endpoint reclamar. Para reativar,
  `OPENROUTER_REASONING=on` — e suba o orçamento junto, ou o corte volta.

**O `claude` é o único com prompt caching**, que corta ~2/3 da entrada por turno (§4.2). Nos
provedores OpenAI-compatíveis o protocolo não tem `cache_control`, então os dois blocos de system
vão concatenados e cada turno paga a entrada inteira. Se tiver a chave da Anthropic, prefira-a.

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

### Automações do fluxo

Quatro coisas que o jogo já pedia ao narrador em prosa e deixava o jogador transcrever à mão.
Vivem em `lib/oracle/extensions.ts`, **fora** do `ingest()` verbatim:

| Marcação | O que automatiza |
|---|---|
| `[CENA: região]` | o prompt manda "escolha uma região coerente e diga onde estamos" — e não dava ao narrador como avisar o app. A região da cena passava a só mudar se o jogador a trocasse no seletor. |
| `[CASO: título \| premissa]` | o caso nascia com título e premissa em branco, e só o jogador os preenchia. Agora o narrador abre o caso e a aba Caso acompanha. **Nada que o jogador tenha escrito é sobrescrito.** |
| `[FIO-NOVO: pista \| pista \| relação]` | os Fios do Mural só existiam se o jogador os digitasse. O Fio nasce **solto**; quem o verifica continua sendo ele. Só nas eras com Mural. |
| resumo rolante | a cada 12 turnos narrativos, `/api/resumo` condensa a crônica num parágrafo que passa a ir no prompt junto com o histórico recente. Sem isso, a janela de 18 entradas rola para fora e o narrador contradiz o que ele mesmo narrou. |

Duas decisões de desenho valem registro:

**Por que não dentro do `ingest()`.** O `switch` dele não tem caso para estas chaves: hoje uma
marcação desconhecida cai no `default: return m` e sobra como lixo no meio da prosa — era esse o
sintoma de `[CENA: …]`. Em vez de editar o motor, o que destruiria a garantia de porte verbatim, as
chaves novas são lidas e **removidas antes**, e o motor recebe só o vocabulário que conhece.

**Por que a gravação vem depois.** `ingest()` lê o estado fora do `setState` e depois regrava
`char`, `caso` e `naCena` inteiros. Qualquer escrita feita antes dele seria sobrescrita. Então
`lerExtensoes()` limpa o texto antes e `aplicarExtensoes()` grava depois, dentro de um updater
funcional — que é também o único jeito de um `[FIO-NOVO]` enxergar a pista que o próprio `ingest()`
acabou de criar no mesmo turno.

O resumo tem **cota própria**, separada dos turnos do dia: resumir é automático, o jogador não
pediu, e descontá-lo dos turnos tiraria dele o que ele pediu. O teto existe para um cliente
adulterado não virar torneira.

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

### O banco não é preso a fornecedor

Tudo passa por `DataStore` (`lib/store/index.ts`), escolhido por `DATA_BACKEND`:

- `fs` — grava em `.data/`. Desenvolvimento e servidor próprio; **não** serve em serverless.
- `postgres` — produção. O SQL vive em `lib/store/sql.ts` e o **driver é escolhido pela própria
  `DATABASE_URL`**: HTTP (`@neondatabase/serverless`) para `*.neon.tech`, `pg` para qualquer outro
  Postgres. `neon` continua valendo como apelido.

Quatro tabelas — `users`, `campaigns` (estado em `jsonb` + `rev`), `quota`, `shares` — em Postgres
padrão, sem extensão e sem recurso proprietário. O esquema tem **fonte única**
(`lib/store/schema.mjs`), compartilhada entre o app e os scripts de linha de comando.

`campaigns.state` guarda **exatamente** a forma que `blankEra()` produz — é isso que torna o porte
trivial: o shape do dado não muda, só o meio. O lock otimista é `WHERE rev = $n`; a cota é atômica
num único `INSERT … ON CONFLICT … DO UPDATE`.

Esse SQL roda contra um **Postgres de verdade** nos testes (PGlite, o Postgres compilado para WASM),
sem servidor: unicidade de e-mail sob criações simultâneas, duas gravações concorrentes com o mesmo
`rev` (só uma passa), oito incrementos paralelos de cota sem perder contagem, e deletes em cascata.

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
npm run test             # Vitest: prompt, narração, resumo, automações, campos, store
npm run build            # build de produção
npm run verify:pixel     # 246 comparações contra o HTML original
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

### Mídia que o artifact não traz

O designer referencia fundos, trilha e efeitos por caminho; **nenhum** desses 19 arquivos vem no
bundle — eles chegaram depois, à parte. `/api/health` publica o inventário, e
`tools/scan-midia.mjs` o regenera conferindo `public/` contra as referências extraídas do artifact:

```bash
curl -s https://<seu-deploy>/api/health | jq .midia   # {"presentes":19,"faltando":0,...}
```

Sem essa lista, "o fundo não apareceu" tem duas explicações indistinguíveis, porque arquivo ausente
e caminho errado dão o mesmo 404.

| Pasta | Arquivos | Para quê |
|---|---|---|
| `public/fundos/` | 6 `.jpg` | o fundo de cada aba |
| `public/` | `fundo-eras.png` | o fundo da aba Século |
| `public/musica/` | 11 `.mp3` | a trilha ambiente |
| `public/sons/` | `papel.mp3` | o som de papel ao trocar de aba |

**Os fundos chegaram como PNG de ~2,8 MB cada**, e o código do designer já os referencia como
`.jpg` — então é para JPEG que eles vão (qualidade 82, 4:2:0): ~350 KB cada, de 16,8 MB para 2,1 MB
nos seis, invisível atrás de uma camada de fundo. `fundo-eras.png` é o único que o código pede em
`.png` e fica como veio. As **faixas vão bit-exatas** (256 kbps, 70 MB no total): o player toca uma
por vez, e reencodar seria uma decisão de qualidade que ninguém pediu.

**Nomes:** o arquivo do designer casa com o slot por palavra — *…no **bar*** → `bar.jpg`,
***Briga** no beco* → `briga.jpg`, ***Perseguição** noir* → `perseguicao.jpg`, *Três **silhuetas***
→ `silhuetas.jpg`, *…da **mesa** de armeiro* → `mesa.jpg`. Dois não casam por palavra e foram
decididos pelo conteúdo: `cais.jpg` é *Detetive sob a ponte inacabada* (a ponte em construção é o
cânone de 1934) e `fundo-eras.png` é *SS Excalibur sob céu noturno* — o único com proporção
diferente, como `fundo-eras.png` é o único `.png` no código.

`briga.jpg` fica no repositório mas **não é usado**: era o fundo da aba Dados, que o v2 dissolveu
no painel flutuante. O `bgLayers` do designer ainda tem a chave, então o arquivo acompanha.

> **O gate precisa dos mesmos arquivos nos dois lados.** O artifact original os referencia por
> caminho relativo, resolvido ao lado do HTML; `npm run gen:assets` espelha `public/` em
> `source/{fundos,musica,sons}` (ignorado pelo git — é cópia byte a byte do que já está
> versionado). Sem o espelho, o lado original daria 404 e fundo preto, e o gate acusaria uma
> divergência que não existe no porte.

## Deploy

```bash
vercel install neon      # provisiona o Postgres (plano Free) e injeta DATABASE_URL
vercel deploy --prod
```

Envs obrigatórias em produção: `ANTHROPIC_API_KEY`, `AUTH_SECRET`, `DATA_BACKEND=neon`,
`DATABASE_URL`. As demais têm padrão — ver `.env.example`.

## Transferir o projeto para outra pessoa

Sim, as três partes mudam de dono — mas por caminhos diferentes, e a do banco é a que exige
atenção.

**1. Repositório no GitHub.** Settings → *Transfer ownership*. Leva issues, PRs e histórico. Você
precisa ser admin, e quem recebe precisa aceitar.

**2. Projeto na Vercel.** Tem transferência de primeira classe: a Vercel gera um código válido por
24 h e quem recebe aceita pelo link de claim. Leva domínios, deployments e variáveis de ambiente.
Pela CLI/API:

```bash
vercel api /projects/<projeto>/transfer-request --method POST
```

Quem recebe abre `https://vercel.com/claim-deployment?code=<code>`. Depois é preciso reconectar o
repositório, que agora está na conta nova.

**3. Banco de dados — o ponto de atenção.** Um recurso do Marketplace (o Neon) está amarrado à
*instalação* do Marketplace na conta de origem, não ao projeto. Existe um mecanismo de transferência
de recurso, mas ele é da API de integração, conduzido pelo fornecedor, e não um botão que você
aperta. **Não conte com ele.**

Por isso o banco deste projeto foi feito para não depender disso:

- o esquema é Postgres padrão, sem extensão nem recurso proprietário;
- o driver é escolhido pela `DATABASE_URL`, então qualquer Postgres serve — Neon, Supabase,
  Railway, RDS ou um servidor próprio;
- e existe `npm run handover`, que leva os dados inteiros num arquivo JSON.

O caminho garantido, que não depende de o Marketplace cooperar:

```bash
# na conta de origem
DATABASE_URL=<origem> node tools/handover.mjs export dados.json
```

```bash
# na conta de destino, com um Postgres novo já provisionado
DATABASE_URL=<destino> npm run migrate
DATABASE_URL=<destino> node tools/handover.mjs import dados.json
```

Isso preserva hashes de senha (os logins continuam valendo), as crônicas byte a byte, a cota, os
links públicos e o `rev` de cada crônica — então o lock otimista segue coerente depois da mudança.
A importação é idempotente: rodar duas vezes não duplica nada. O caminho inteiro é coberto por
teste (`tests/handover.test.ts`): exporta, apaga o banco, importa e confere.

> O arquivo contém hashes de senha, e-mails e crônicas inteiras. Trate-o como backup sensível e
> apague depois da migração.

**4. As chaves de LLM** não se transferem: quem recebe põe as próprias em `ANTHROPIC_API_KEY`,
`OPENAI_API_KEY` ou `OPENROUTER_API_KEY`. Como o provedor é escolhido por variável de ambiente,
quem recebe pode usar um provedor diferente do seu sem tocar em código.

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
