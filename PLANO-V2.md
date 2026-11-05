# Plano — atualização para a versão do designer

## Contexto

O designer entregou uma revisão do oráculo (`source/original-v2.html`, 6,2 MB). A versão no ar
(`b09c7e0`) foi portada do arquivo anterior com fidelidade de 0,000% em 164 comparações. Esta
rodada repete o mesmo cuidado sobre o novo desenho, soma quatro automações do fluxo de jogo e uma
padronização de formulário pedida explicitamente.

**O estado salvo não mudou.** `blankChar`, `blankCaso` e `blankEra` são idênticos, e a chave de
localStorage continua `sv-cronica-v2`. As crônicas existentes — no navegador e no banco —
sobrevivem sem migração. Isso elimina a classe de risco mais cara desta atualização.

---

## O que o designer mudou (medido, não estimado)

| | No ar | Nova | Observação |
|---|---|---|---|
| `template.html` | 146 KB | 216 KB | +48% |
| `component.js` | 73 KB | 83 KB | +13%, **mesmos métodos** |
| CSS global (`<style>`) | 24 KB | 65 KB | muito estilo saiu do inline |
| `@media` | 1 | 13 | breakpoint real em 768px |
| Famílias tipográficas | 10 | **18** | 8 novas |
| Arquivos `.woff2` no bundle | 24 | 37 | |
| `@font-face` | 59 | 78 | |
| Elementos `<svg>` no DOM | 0 | **2** | logotipo vetorial + filtro de tinta |
| `<sc-if>` / `<sc-for>` | 80 / 62 | 90 / 65 | |
| Abas | 8 | **7** | "Dados" sai da barra |

Mudanças de comportamento que encontrei no componente:

- **`bgLayers`** — fotografia de fundo por aba, com opacidade e escala animadas na troca.
- **`lastDice` / `lastRolls`** — histórico visual das últimas rolagens, com pips desenhados.
- **`guideSteps`** — guia de 4 passos que **se marca sozinho** a partir do estado (ficha preenchida
  → caso aberto → primeira cena → primeiro dado). O designer já pensava em automação derivada.
- **`pistasN`**, **`sendLabel`** — contadores e rótulo de botão reativo.

---

## 1. Fidelidade visual

Mesma estratégia que deu 0,000%: tradução mecânica, nenhum valor de CSS normalizado, verificação
por diff de imagem. O que o transpilador precisa **aprender**:

### 1.1 Atributos `sc-camel-*` genéricos

Hoje ele só entende `sc-camel-on-*` (eventos). A nova versão usa a forma geral para atributos SVG:

| No template | Vira |
|---|---|
| `sc-camel-view-box` | `viewBox` |
| `sc-camel-preserve-aspect-ratio` | `preserveAspectRatio` |
| `sc-camel-base-frequency` | `baseFrequency` |
| `sc-camel-num-octaves` | `numOctaves` |
| `sc-camel-std-deviation` | `stdDeviation` |
| `sc-camel-x-channel-selector` | `xChannelSelector` |
| `sc-camel-attribute-name` | `attributeName` |
| `sc-camel-repeat-count` | `repeatCount` |

Regra única: tira o prefixo, camelCaseia o resto. Os eventos continuam tratados antes, como caso
especial. O script falha se sobrar qualquer `sc-` no JSX gerado — invariante nova.

### 1.2 SVG

Dois elementos reais no DOM:

1. **Logotipo "XX Century"** vetorial (`viewBox="0 0 3016 496"`).
2. **Filtro de tinta** — `<svg width="0" height="0">` com `feTurbulence` + `feDisplacementMap` +
   `feGaussianBlur` + `feColorMatrix`, aplicado por `filter: url(#sv-ink)`. É o que dá o aspecto
   de impressão gasta.

Mais 6 SVGs dentro de `url("data:image/svg+xml;utf8,…")` em valores de CSS. Esses passam como
texto — mas contêm `;` e `:` dentro de `url(...)`, então dependem do splitter consciente de
parênteses que já existe. Vou adicionar um teste específico para esse caso, porque é exatamente
onde um splitter ingênuo quebraria.

### 1.3 Fontes

78 regras `@font-face`, 18 famílias, 37 arquivos no bundle. Como da outra vez, parte vai apontar
para `fonts.gstatic.com`: baixo e auto-hospedo, e o extrator falha se sobrar URL remota.

### 1.4 Media queries

As 13 vivem nos blocos `<style>` globais, que o extrator já copia verbatim. O gate passa a testar
**os dois lados do breakpoint** (767 e 768px) além das larguras atuais.

---

## 2. Os desvios deliberados

O pixel-perfect vale para tudo **menos** o que foi pedido de propósito. Em vez de afrouxar a
tolerância do gate — que mascararia regressões —, cada desvio vira uma exceção declarada **com teste
próprio**.

### 2.1 Padronização de selects (pedido seu)

Todo `<select>` passa a ter a mesma altura e o mesmo padding dos `<input>` de texto.

- O gate deixa de exigir altura idêntica **só para `<select>`**, e passa a exigir a invariante nova:
  *todo select tem a mesma altura e padding de um input de texto na mesma tela*. Isso é mais
  rigoroso que a comparação antiga, não menos: hoje nada garante consistência entre eles.
- Tudo o mais nos selects continua comparado: posição, largura, opção selecionada, número de opções.

### 2.2 Fundos ausentes (débito registrado)

Os 6 `fundos/*.jpg` não vieram no arquivo. Conforme combinado, **construo tudo como se existissem**:
as camadas, as opacidades, a escala e a transição entre abas ficam exatamente como desenhadas, e os
caminhos apontam para `/fundos/<nome>.jpg`. Basta soltar os arquivos lá depois.

Enquanto faltarem, a camada simplesmente não pinta — o gradiente de base aparece e nada quebra.
`/api/health` passa a listar quais faltam, para a rodada de validação de amanhã ter um checklist.

---

## 3. Automações do fluxo

As quatro que você aprovou. Princípio de implementação: **o motor de regras portado não é tocado.**

As marcações novas são tratadas por um `ingestExtensions()` que roda **antes** do `ingest()`
original: ele extrai o que é novo, aplica, remove do texto e entrega o resto ao motor verbatim.
Assim a garantia "copiado sem reescrita" continua valendo, e as automações ficam isoladas e
testáveis.

### 3.1 Região da cena — correção de bug

**O problema:** `d.cena` só muda quando o jogador clica no mapa ou carrega um caso. Se o narrador
leva o personagem para outro bairro, o app continua mandando o texto do bairro **errado** como
"autoridade máxima para lugares, gente, rumores e regras locais". O narrador passa a se contradizer,
e ninguém entende por quê.

**A correção:** marcação `[CENA: Região]`. O narrador declara para onde a cena foi; o app valida
contra as regiões reais da era e atualiza. Região inexistente é ignorada.

### 3.2 Memória longa

**O problema:** o prompt leva 18 entradas. Numa crônica de 60 turnos, o narrador esqueceu o começo —
inclusive pistas que ele mesmo entregou.

**A solução:** a cada 12 turnos, uma chamada barata gera um parágrafo de resumo do que já aconteceu,
guardado em `caso.resumo`. O prompt passa a levar **resumo + últimas 18 entradas** em vez de só as
18. Melhora a continuidade e, em crônicas longas, *reduz* o custo, porque o resumo substitui parte
do histórico cru.

### 3.3 Título e premissa do caso

Quem começa a jogar sem abrir um caso vê `"(ainda não aberto)"` no prompt para sempre. Marcação
`[CASO: título | premissa]` deixa o narrador batizar o caso quando ele toma forma — e só quando
ainda estiver vazio, para nunca sobrescrever o que o jogador escreveu.

### 3.4 Fios do Mural sugeridos

Ligar duas pistas é 100% manual hoje, embora o narrador conheça a verdade oculta. Marcação
`[FIO-NOVO: id da pista A | id da pista B | relação]` cria o Fio **no estado `aberto`** — o jogador
continua gastando o recurso para verificar, então a tensão da regra se mantém. Sem isso, a mecânica
do Mural fica subutilizada em 1974/1999, que são as eras construídas em volta dela.

---

## 4. Fases

| # | Entrega | Verificação |
|---|---|---|
| **1** | Extrair v2: template, componente, 37 fontes, baixar as remotas | zero URL remota no CSS |
| **2** | Transpilador aprende `sc-camel-*` genérico e SVG | nenhum `sc-` sobra; contagens batem |
| **3** | Regenerar view e lógica a partir do v2 | build e typecheck limpos |
| **4** | Gate de pixels contra o novo HTML, com 768px nos dois lados | **gate verde** |
| **5** | Padronização dos selects + invariante própria | teste de altura select = input |
| **6** | `ingestExtensions` com as 4 automações | testes por marcação |
| **7** | Fundos fiados + health listando os que faltam | app íntegro sem os arquivos |
| **8** | Deploy e verificação em produção | `/api/health?probe=llm` + um turno real |

---

## 5. Verificação

```bash
npm run gen && npm run typecheck && npm run test && npm run build
npm run verify:pixel     # agora com 6 viewports (390, 767, 768, 1024, 1280, 1680)
```

Testes novos:

- `sc-camel-*` → atributo camelCase, incluindo os 8 do SVG.
- Valor de CSS com `data:image/svg+xml` sobrevive ao splitter intacto.
- Cada marcação nova, incluindo os casos de recusa (região inexistente, caso já batizado).
- `ingestExtensions` não altera texto sem marcação nova — prova de que o motor verbatim segue intacto.
- Altura e padding de select iguais aos do input.

---

## 6. Riscos

| Risco | Mitigação |
|---|---|
| Efeito que depende do runtime de artifacts | Você autorizou decidir e documentar: escolho o mais fiel e registro o desvio |
| Fundos ausentes mascararem outro defeito | Camada fiada e isolada; health lista o que falta |
| Automação do narrador atrapalhar a narrativa | Cada marcação é conservadora: nunca sobrescreve o que o jogador escreveu, e Fio nasce `aberto` |
| Resumo custar mais do que economiza | Dispara a cada 12 turnos, com `max_tokens` baixo; em crônica curta nem roda |
| Regressão no que já está no ar | Estado salvo idêntico; gate cobre as 7 abas × 5 eras |

---

## 7. Fora de escopo

Ajuste fino dos fundos (rodada de amanhã, com os arquivos), mudar a aba "Dados" (fica como o
designer entregou), e desligar a Deployment Protection — segue dependendo de você.
