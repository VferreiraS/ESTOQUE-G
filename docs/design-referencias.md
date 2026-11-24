# Referências de design premium para o Stok · Estoque 99

Pesquisa feita em 24/11/2026. Objetivo: deixar o app escuro com cara de produto profissional (Apple, Tesla, Meta, Xiaomi, BYD e apps B2B como Linear, Stripe e Vercel), sem copiar marca alguma.

Legenda de confiança:
- **[oficial]** valor vindo de documentação oficial da empresa.
- **[terceiro]** valor de catálogo/compilação de terceiros (designsystems.one, getdesign.md, open-design, refero). Usar como ponto de partida, não como verdade.
- **[recomendação]** valor meu, derivado das referências. Ajustar testando no iPhone e no PC.

---

## 1. Dez princípios para o app

1. **Hierarquia por tamanho e peso, não por cor ou borda.** Título forte, corpo regular, rótulo pequeno em cinza. Se tudo tem cor, nada tem destaque. [oficial: Apple HIG, Meta]
2. **Poucos tamanhos de fonte.** Seis a sete passos no app inteiro e três pesos (400, 500, 600). Meta recomenda "um conjunto limitado de tamanhos e pesos" e evitar itálico. [oficial: developers.meta.com]
3. **Grade de 4 px.** Espaçamentos 4, 8, 12, 16, 24, 32, 48. Mesma escala no iPhone e no PC. Geist e Linear usam essa base. [terceiro]
4. **Camadas de superfície por luminosidade, não por sombra.** No escuro, cada nível sobe um pouco de brilho (fundo, painel, cartão, elevado). Sombra só em item flutuante. Linear constrói as superfícies com opacidades de branco e preto sobre a base. [oficial: Linear]
5. **Um acento por tela.** A cor do tema (lilás, violeta ou lima) serve para a ação principal e o estado ativo. Não pintar cartões, ícones e bordas com ela ao mesmo tempo. Vercel trata a cor de destaque "como pontuação". [terceiro]
6. **Nada de branco puro nem preto puro.** Texto em cinza-claro, fundo em cinza-azulado escuro. Meta pede evitar `#FFFFFF` e `#000000` por causar contraste duro. Stripe usa azul-marinho (`#061B31`, `#0A2540`) em vez de preto. [oficial: Meta; medido: Stripe]
7. **Vidro só na camada de controle.** Barra de navegação, menus flutuantes e folhas usam material translúcido. Conteúdo (listas, tabelas, cartões) fica em superfície sólida. Apple: "não use Liquid Glass na camada de conteúdo". [oficial: Apple HIG Materials]
8. **Movimento curto e sempre o mesmo.** Poucas durações (120, 200, 300 ms) e uma curva padrão. Nada de quique em tela de operação. Respeitar "reduzir movimento". [recomendação, baseada em Apple/M3]
9. **Densidade alta para dados, folga para toque.** Tabela e lista compactas no PC; alvos de toque de no mínimo 44 px no celular (Apple) e 48 dp (Meta). Números sempre tabulares, alinhados à direita. [oficial + recomendação]
10. **Ícones de um só estilo e raio concêntrico.** Todos em traço, mesma espessura, mesma grade. Cantos internos = canto externo menos o padding (conceito de concentricidade do iOS 26). Estado vazio sempre com um botão de ação. [oficial: Apple; recomendação]

---

## 2. Tokens recomendados

### 2.1 Tipografia

Família: sistema do aparelho (SF Pro no iPhone, Segoe UI/Inter no PC) ou Inter, que é a fonte que a Meta usa no Horizon OS. Para títulos grandes, Inter Display (Linear). Mono só para códigos e números de conferência.

Escala de referência (Apple, tamanho padrão em pt; 1 pt = 1 px no web) [oficial: Apple HIG Typography, tabela "Default"]:

| Estilo Apple | Tamanho / entrelinha | Peso |
|---|---|---|
| Large Title | 34 / 41 | Bold (700) |
| Title 1 | 28 / 34 | Bold |
| Title 2 | 22 / 28 | Bold |
| Title 3 | 20 / 25 | Semibold |
| Headline | 17 / 22 | Semibold (600) |
| Body | 17 / 22 | Regular (400) |
| Callout | 16 / 21 | Regular |
| Subheadline | 15 / 20 | Regular |
| Footnote | 13 / 18 | Regular |
| Caption 1 | 12 / 16 | Regular |
| Caption 2 | 11 / 13 | Regular |

Escala recomendada para o app (6 passos, reduzindo os 11 da Apple):

| Token | px | Linha (px) | Peso | Uso |
|---|---|---|---|---|
| `--t-title` | 28 | 34 | 600 | Título de tela (Início, Notas) |
| `--t-h2` | 20 | 26 | 600 | Título de seção, cartão grande |
| `--t-body` | 16 | 24 | 400 | Texto corrido, campo de formulário |
| `--t-ui` | 14 | 20 | 500 | Lista, tabela, botão, menu |
| `--t-small` | 13 | 18 | 400 | Metadado, data, legenda |
| `--t-label` | 12 | 16 | 500 | Cabeçalho de tabela, etiqueta (maiúsculas, tracking +0,04em) |

Regras:
- Entrelinha entre 1,3 e 1,5 para UI; 1,5 a 1,6 para texto corrido.
- Tracking: 0 no corpo; -0,01em a -0,02em em títulos acima de 24 px. [recomendação]
- Números de quantidade e de conferência: `font-variant-numeric: tabular-nums`. [recomendação]
- Tamanho mínimo: 12 px (Meta fala em 14 px mínimo em realidade mista; no app de tela pequena, 12 px só para rótulo de cabeçalho). [oficial + recomendação]
- Não usar peso 700 fora de título principal. Peso 300 e 100 proibidos no escuro (ficam fracos).

### 2.2 Espaçamento e grade

| Token | Valor | Uso |
|---|---|---|
| `--s-1` | 4 px | Entre ícone e texto dentro de chip |
| `--s-2` | 8 px | Entre itens de uma lista compacta |
| `--s-3` | 12 px | Padding interno de linha (PC) |
| `--s-4` | 16 px | Margem lateral do celular (gutter), padding de cartão |
| `--s-5` | 24 px | Entre seções |
| `--s-6` | 32 px | Entre blocos grandes |
| `--s-8` | 48 px | Respiro de topo de tela |

Grade: celular, 16 px de margem lateral, sem rolagem horizontal. PC, largura máxima de conteúdo de ~1200 px; colunas de 8 px de calha. Geist usa 4, 8, 12, 16, 24, 32, 48, 64 [terceiro]; Linear usa 4, 8, 12, 16, 48, 96 [terceiro].

Alvos de toque: mínimo 44 px (Apple) e 48 dp (Meta) no celular; no PC, 32 px para botão de ícone e 40 px para botão de texto. [oficial + recomendação]

### 2.3 Raios

| Token | Valor | Uso |
|---|---|---|
| `--r-xs` | 6 px | Chip pequeno, etiqueta, tag |
| `--r-sm` | 8 px | Botão, campo de texto, item de menu |
| `--r-md` | 12 px | Cartão, linha de nota em destaque |
| `--r-lg` | 16 px | Folha (sheet), modal, painel de vidro |
| `--r-pill` | 999 px | Pílula de status, selo, botão de ícone redondo |

Regra concêntrica: raio interno = raio externo - padding (cartão de 16 px com padding de 8 px tem botão de 8 px). [oficial: Apple, conceito de concentricidade do iOS 26 (designfornative.com)]

Geist usa 6/8/12/pill [terceiro]. Os valores acima são uma versão um pouco mais arredondada, coerente com o iOS, mas sem exagero.

### 2.4 Cores e contraste (modo escuro)

Base recomendada, em tons cinza-azulados (nunca preto puro):

| Token | Hex sugerido | Uso |
|---|---|---|
| `--bg` | `#0E1014` | Fundo da tela |
| `--surface-1` | `#15181E` | Painel, barra lateral |
| `--surface-2` | `#1C2028` | Cartão |
| `--surface-3` | `#252A34` | Elevado, item selecionado, campo |
| `--line` | `rgba(255,255,255,0.08)` | Borda padrão |
| `--line-strong` | `rgba(255,255,255,0.14)` | Foco, borda de campo ativo |
| `--text-1` | `#EEF0F4` | Texto principal |
| `--text-2` | `#A3AAB7` | Texto secundário |
| `--text-3` | `#6E7685` | Só metadado não essencial |
| `--accent` | Lilás / Violeta / Lima (por tema) | Ação principal, estado ativo |
| `--danger` | `#F06A6A` | Erro, falta de estoque |
| `--ok` | `#4CC38A` | Conferido, concluído |

Contrastes mínimos (WCAG 2.2) [oficial]:
- Texto normal: 4,5:1. Texto grande (24 px ou 18,66 px em negrito): 3:1.
- Ícone, borda de campo e estado de foco: 3:1.
- Meta de qualidade para o app: 7:1 para texto principal e 4,5:1 para texto secundário. [recomendação]

Acento: manter a saturação moderada (evitar lima ou lilás puros em área grande). Linear gera o tema com três variáveis (cor base, acento, contraste) em espaço LCH, para as cores ficarem igualmente claras. [oficial: Linear] Aplicar aos três temas: definir só três variáveis e derivar o resto.

### 2.5 Vidro, bordas e sombras

| Token | Valor |
|---|---|
| Vidro (navegação e folhas) | `background: rgba(24,27,34,0.72); backdrop-filter: blur(20px) saturate(140%);` |
| Borda de vidro | `1px solid rgba(255,255,255,0.08)` + `inset 0 1px 0 rgba(255,255,255,0.06)` |
| Sombra de elemento flutuante | `0 8px 24px rgba(0,0,0,0.35)` |
| Sombra de item comum | nenhuma; usar `--surface-2` e borda |

Limite de vidro: no máximo uma barra de vidro e um elemento flutuante por tela. Cartão e tabela ficam sólidos.

### 2.6 Movimento

| Token | Valor | Uso |
|---|---|---|
| `--d-micro` | 120 ms | Pressionar, passar o mouse, mudança de cor |
| `--d-base` | 200 ms | Troca de aba, expandir linha, estado |
| `--d-enter` | 280 ms | Folha ou modal entrando |
| `--d-exit` | 200 ms | Saída (cerca de 70% da entrada) |
| `--ease-std` | `cubic-bezier(0.2, 0, 0, 1)` | Padrão para quase tudo |
| `--ease-exit` | `cubic-bezier(0.3, 0, 1, 1)` | Saída |

Máximo 400 ms em qualquer transição de UI. Sem efeito de quique nem de partículas (o app já removeu isso na v122). Respeitar `prefers-reduced-motion: reduce`: trocar movimento por troca de opacidade, ou nada. Os valores de mola do Material 3 Expressive (rigidez e amortecimento) não foram verificados nesta pesquisa; conferir em m3.material.io/styles/motion antes de usar. [não verificado]

### 2.7 Ícones

- Um único conjunto, em traço (outline), espessura de 1,5 a 2 px na grade de 24 px; 20 px dentro de botão; 16 px ao lado de texto de 14 px. [recomendação, baseada em Meta: "ícones simples, sem traço fino demais"]
- Ícone sempre com rótulo ou `title` acessível em botão só de ícone.
- Cor: `--text-2` em repouso, `--text-1` em foco, `--accent` só no ativo.

### 2.8 Botões, campos e estados

| Componente | Altura | Padding | Raio | Observação |
|---|---|---|---|---|
| Botão primário | 44 px (celular), 40 px (PC) | 0 16 px | 8 px | Um por tela; fundo `--accent`, texto escuro |
| Botão secundário | 40 px | 0 14 px | 8 px | Fundo `--surface-2`, borda `--line` |
| Botão fantasma | 40 px | 0 12 px | 8 px | Só texto; hover `--surface-2` |
| Campo de texto | 44 px (celular), 40 px (PC) | 0 12 px | 8 px | Fundo `--surface-1`, foco `--line-strong` + anel de 2 px do acento |

Estado vazio: ícone de 32 px em `--text-3`, título de 16/600, uma linha de 14/20 em `--text-2`, e um botão de ação. Nunca só a palavra "Nada aqui".

### 2.9 Tabelas e listas (densidade)

| Item | Celular | PC |
|---|---|---|
| Altura de linha | 56 px (lista) | 40 px (tabela) |
| Texto da célula | 14/20 | 14/20 |
| Cabeçalho | 12/16, maiúsculas, `--text-2` | igual |
| Separador | `--line` de 1 px | igual, sem zebra |
| Número | tabular, à direita | tabular, à direita |

Referência: Geist e Stripe tratam números como dado e não como enfeite. [terceiro]

---

## 3. O que parece amador e como corrigir

| Sinal de amador | Como corrigir |
|---|---|
| Muitos tamanhos de fonte (dez ou mais) | Reduzir para os seis tokens da seção 2.1. Teste: se dois tamanhos diferem em menos de 2 px, unificar. |
| Pesos misturados (300, 500, 700, 800 na mesma tela) | Usar só 400, 500 e 600. Título em 600, não em 800. |
| Bordas fortes e coloridas em todo cartão | Borda de 1 px em `--line` (8% de branco). Cor de borda só para erro ou foco. |
| Cartão dentro de cartão dentro de cartão | Máximo dois níveis. Separar seções com espaço (24 px) e um título, não com caixa. |
| Cores saturadas em área grande (lilás ou lima cheio) | Acento só em botão, ícone ativo e indicador. Fundos sempre neutros. |
| Sombra pesada e escura em tudo | Sombra só em flutuante; em cartão, usar camada de luminosidade. |
| Branco puro (#FFF) no texto ou no fundo | Texto `#EEF0F4`; fundo `#0E1014`. |
| Texto cinza-claro sobre cinza-médio (contraste baixo) | Verificar com 4,5:1 (texto) e 3:1 (ícone). Texto secundário não abaixo de 7:1 se for informação. |
| Ícones de estilos diferentes (cheio, traço, colorido) | Um só conjunto, traço de 1,5–2 px, mesma grade de 24 px. |
| Espaçamento irregular (13 px, 19 px, 22 px) | Só valores da escala de 4 px. |
| Hierarquia pela cor e não pelo tamanho | Título maior e mais forte; cor só para estado. |
| Lista longa sem respiro (linhas de 40 px no celular) | Linha de 56 px no celular, toque de 44 px no mínimo. |
| Números sem alinhamento | `tabular-nums`, alinhados à direita, unidade em `--text-2`. |
| Botões de mesmo peso (três primários na tela) | Um primário; o resto secundário ou fantasma. |
| Estado vazio com texto "Nenhum item" | Ícone + título + uma linha + botão de ação. |
| Animação longa, quicando ou em loop | Máximo 400 ms; sem loop decorativo; respeitar "reduzir movimento". |
| Vidro em todo lugar (borrão atrás de conteúdo) | Vidro só na barra de navegação e em folhas; conteúdo sólido. Apple: não usar na camada de conteúdo. |
| Cantos com raios diferentes no mesmo bloco | Usar a tabela de raios e a regra concêntrica. |

---

## 4. Fontes

Apple
- Typography (tabela de tamanhos e entrelinhas): https://developer.apple.com/design/human-interface-guidelines/typography
- Materials (Liquid Glass, regular e clear, uso na camada de conteúdo): https://developer.apple.com/design/human-interface-guidelines/materials
- Fontes Apple (San Francisco): https://developer.apple.com/fonts/
- Meet Liquid Glass (WWDC25): https://developer.apple.com/videos/play/wwdc2025/219/
- Concentricidade no iOS 26 (terceiro): https://designfornative.com/ui-changes-in-ios-26-thats-not-about-liquid-glass/
- Liquid Glass, exemplos de código (terceiro): https://medium.com/codex/liquid-glass-design-5e57f5faddc3

Meta
- Typography (Horizon OS, 14 px mínimo, 18 px confortável, Inter, pesos): https://developers.meta.com/vr/design/styles_typography/
- Android design requirements (evitar #FFF e #000; 48 dp de alvo; ícones simples): https://developers.meta.com/vr/documentation/android-apps/design-requirements/

Google
- Shape (escala de raios, Material 3): https://m3.material.io/styles/shape/overview-principles
- Start building with Material 3 Expressive: https://m3.material.io/blog/building-with-m3-expressive
- Motion (página consultada, sem os valores extraídos nesta pesquisa): https://m3.material.io/styles/motion/overview/specs

Linear
- How we redesigned the Linear UI (part II; tema por três variáveis em LCH; Inter Display): https://linear.app/now/how-we-redesigned-the-linear-ui
- Espaçamento Linear (terceiro, getdesign.md): https://getdesign.md/linear.app/design-md

Stripe
- Cores escuras medidas (terceiro, design-extractor): https://www.design-extractor.com/gallery/stripe
- Sistema Stripe (terceiro, designsystems.one): https://www.designsystems.one/design-systems/stripe-design

Vercel (Geist)
- Geist (oficial): https://vercel.com/geist/introduction
- Tokens Geist (terceiro, designsystems.one): https://www.designsystems.one/design-systems/vercel-geist

Tesla
- Tipografia e cores (terceiro, Refero Styles): https://styles.refero.design/style/7266b546-2fb0-465c-acd6-79001c39829a
- Sistema Tesla (terceiro, open-design): https://open-design.ai/plugins/design-system-tesla/

Xiaomi (HyperOS)
- Anúncio do novo design de ícones (marketing, sem valores numéricos): https://www.facebook.com/XiaomiKenya/posts/meet-the-new-icon-design-in-xiaomihyperos3elegant-shades-radiant-edges-and-a-pre/1372273764930547/
- Não foram encontradas especificações oficiais de tokens do HyperOS. Usar só a direção: bordas arredondadas, brilho suave.

BYD (DiLink)
- Modos de interface claro, escuro e automático (página oficial de suporte, Nigéria): https://www.byd.com/ng/support/dilink
- Queixa de usuários sobre tela escura demais e tela inicial ruim após atualização (sinal do que evitar, não é referência de estilo): https://www.reddit.com/r/BYD/comments/1ut1j8x/what_the_heck_is_this_new_ui/

Limitações da pesquisa
- Os valores de Tesla, Linear (espaçamento), Stripe (cores) e Geist (tokens) vêm de compilações de terceiros; conferir antes de usar como norma.
- Não foi possível extrair valores numéricos de HyperOS nem de DiLink.
- Os valores de mola e curva do Material 3 Expressive não foram confirmados.
