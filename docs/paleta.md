# Paleta v165 ("Use cores que combinem")

Arquivo: `app/css/v165-cores.css`. Ele carrega logo depois do `v164-pro.css` e antes dos `v165-a/b/c.css`. Os valores foram escolhidos em OKLCH e gravados em hex.
Só muda cor. Leiaute, tamanhos, logo Prateleira e o S da abertura ficam como estão. O app continua só com tema escuro.

## Por que mudou (auditoria, 24/11, prints em `docs/prints/v165/d/antes/`, fora do git)
- **Arco-íris por área (v158):** havia 8 a 11 faixas de matiz por tela no PC (azul das Notas, laranja do Plano, verde da Equipe, ciano do Chat, rosa do Painel, amarelo dos Corredores, vermelho dos Alertas), além do acento do tema.
- **Branco puro:** `#FFFFFF` aparecia no título do Início (`.hero h1`) e nos números do resumo (`.stat strong`, `.pn-kpi strong`).
- **Cinzas sem relação com o tema:** o avatar `#E9EFDD`, a barra de progresso `#17251C`, o ícone "visto por" `#E3C0BB` e o fundo `#000000` do Violeta.
- **Status das notas em preto e branco (mono-grupo):** "Conferido" era um bloco branco cheio e "Divergência" tinha borda de 2 px.
- **Lima saturado (C 0,22):** fica só onde é o acento do tema (botão primário, link). Não foi usado em áreas grandes.

## Regras
1. **Neutros tingidos:** usam o matiz do tema com croma de 0,008 a 0,018. Fundo em 15 % de luminosidade. As superfícies s1 a s4 vão de 19 a 30,5 %. Texto 1 em 94,5 % (sem branco puro). Texto 2 em 80 % e texto 3 em 70 %.
2. **Acento:** é o mesmo de cada tema (`--p-accent` = `--neon-btn`). Tem degraus hover/press, fundo suave de 10 % (`--p-accent-soft`) e borda de 28 % (`--p-accent-line`).
3. **Acento secundário análogo** (`--p-accent-2`): Lilás usa 285° (lavanda, −35°). Violeta usa o próprio violeta 295° (o par complementar do tema com o lima). Cinza usa aço 240°.
4. **Semânticas da mesma família:** todas têm luminosidade de 80 % e croma 0,11, com matiz ok 155°, atenção 80°, perigo 25° e informação 245°. A versão suave é o fundo de 12 % com borda de 30 %. O texto forte fica por cima.
5. **Áreas:** as 7 cores da v158 viram uma família do tema. São tons do matiz do tema ±35° (no Violeta, a família do violeta; no Cinza, aço de croma baixo). No menu, só o item ativo leva a cor da área: os outros ícones ficam em texto 2 (um acento por tela).
6. **Gráficos:** 5 cores com luminosidades bem diferentes (de 50 a 93 %), para se distinguirem também em escala de cinza e para quem tem daltonismo. A barra e o anel de progresso usam a cor da área sobre a superfície s3.
7. **Chat:** `--p-bubble-out` é um tom escuro do acento com texto 1. O lima não serve como fundo de balão. `--p-bubble-in` = s3. `--chat-name-1…8` são 8 matizes a cada 45° a partir do tema, todos em L 80 % e C 0,085.

## Tokens por tema
| Token | Uso | Lilás | Violeta+Lima | Cinza+Lima |
|---|---|---|---|---|
| `--p-bg` | fundo | `#0D0A0E` | `#0B0A10` | `#090C0E` |
| `--p-s1` | cartão | `#171218` | `#14121A` | `#111417` |
| `--p-s2` | campo, item | `#1E1920` | `#1B1A23` | `#171C1F` |
| `--p-s3` | ativo, balão recebido | `#28222A` | `#25232D` | `#202529` |
| `--p-s4` | linha forte | `#332C35` | `#302D39` | `#2A3034` |
| `--p-t1` | texto principal | `#F1EAF2` | `#EDEBF6` | `#E9EEF1` |
| `--p-t2` | texto secundário | `#C4B9C7` | `#BEBBCD` | `#B7BFC5` |
| `--p-t3` | dica, metadado | `#A59AA7` | `#9F9CAD` | `#98A0A6` |
| `--p-accent` | botão primário (= --neon-btn) | `#C79BD0` | `#C6FF34` | `#C7FF2E` |
| `--p-accent-text` | link, foco | `#E7B8EF` | `#C6FF34` | `#C7FF2E` |
| `--p-accent-2` | acento secundário análogo | `#B8B8ED` | `#AC8FF8` | `#A7C2D5` |
| `--p-ok` | sucesso | `#81D39F` | `#81D39F` | `#81D39F` |
| `--p-warn` | atenção | `#E3B667` | `#E3B667` | `#E3B667` |
| `--p-danger` | erro, divergência | `#FDA19A` | `#FDA19A` | `#FDA19A` |
| `--p-info` | informação | `#81C5FE` | `#81C5FE` | `#81C5FE` |
| `--area-notas` | área Notas | `#B8B8ED` | `#B7A1F5` | `#A4C2D8` |
| `--area-plano` | área Plano | `#E8B2CA` | `#ABB9FE` | `#ADD2D9` |
| `--area-equipe` | área Equipe | `#A4C0E4` | `#D2A2E8` | `#A2BAD8` |
| `--area-chat` | área Chat | `#E2BAEB` | `#CEC0FE` | `#BAD6E2` |
| `--area-painel` | área Painel | `#BEA3DF` | `#9D98F2` | `#91AFC9` |
| `--area-corredores` | área Corredores | `#F6C2C1` | `#DDC4FC` | `#C2DEDF` |
| `--area-alertas` | área Alertas | `#DCA2CE` | `#E6A4E0` | `#B1BDDF` |
| `--p-chart-1` | gráfico 1 | `#C79CD1` | `#C9FD53` | `#C9FD53` |
| `--p-chart-2` | gráfico 2 | `#CCCCF8` | `#9B7BE9` | `#A7C2D5` |
| `--p-chart-3` | gráfico 3 | `#BA7295` | `#C8B7FF` | `#6B8BA2` |
| `--p-chart-4` | gráfico 4 | `#F7DAAA` | `#7C54CD` | `#E8D89B` |
| `--p-chart-5` | gráfico 5 | `#7DA4C0` | `#53C1C7` | `#4F6778` |
| `--p-bubble-out` | balão enviado (texto t1) | `#603E68` | `#693ABB` | `#394A56` |
| `--chat-name-1` | nome no chat (1 de 8) | `#D7ACE0` | `#C1B3EF` | `#8BC6EF` |

Neutros completos, `-rgb`, `-soft` e `-line` de cada cor: ver `app/css/v165-cores.css`. O arquivo também redefine `--ds-bg`, `--e99-bg`, `--ds-ink`, `--ds-muted`, `--glass-card` e `--glass-edge` para os blocos antigos seguirem a mesma paleta.

## Contraste (132 pares calculados, 0 falha)
- Texto 1, 2 e 3 sobre bg/s1/s2/s3: o menor resultado é t3 sobre s3, com 5,75:1 (AA para texto).
- Texto do botão sobre o acento: 7,96:1 no Lilás e 16,6:1 no Violeta e no Cinza. Link (`--p-accent-text`) sobre s1: ≥ 4,5:1.
- Semânticas sobre s1 e sobre o próprio fundo suave: ≥ 7,6:1. Áreas sobre s1: ≥ 4,5:1. Gráficos sobre s1: ≥ 3:1 (componente de UI).
- Texto 1 no balão enviado: Lilás 7,46, Violeta 6,09, Cinza 7,85. Nomes do chat sobre s2: ≥ 8,9:1.

## Componentes recoloridos (camada `@layer p164`, só cor)
- `.hero h1`, `.stat strong`, `.pn-kpi strong`, `h1–h3` → `--p-t1`.
- `.badge.Pendente/Em-conferência/Conferido/Em-divergência` → semânticas suaves.
- `.progress`, `.vd-bar`, `.vd-ring-bg` → s3.
- `.chat-msg` e `.chat-msg.mine` → balões. `.chat-msg .who` → acento 2.
- Ícones do menu que não estão ativos → t2.
