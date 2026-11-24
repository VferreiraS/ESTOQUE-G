# Auditoria de design (antes da v164)

Feita em 24/11/2026 na v162/v163, tema Lilás, iPhone 13 e PC 1440×900 (Playwright, prints 2x em `docs/prints/v164/antes/`, fora do git).
Telas: entrar, Início, Painel, Notas (lista e editor), Plano, Equipe, Chat (conversa), Alertas, Minha conta, Dados.
Medido no DOM (elementos visíveis com texto). Guia de referência: `docs/design-referencias.md` (seção 3, "sinais de amador").

## Sinais de amador que aparecem, por ordem de impacto

| # | Sinal (doc) | Medida antes (PC / iPhone) | Depois da v164 |
|---|---|---|---|
| 1 | Muitos tamanhos de fonte | **21 / 20** tamanhos (10,5 a 84 px; até 13 numa só tela: 11, 11,5, 12, 12,5, 13, 13,5, 14, 15…) | **7 / 7**: 12, 13, 15, 16, 22, 28, 40 (34 no celular) |
| 2 | Pesos misturados | **8** pesos (400, 500, 550, 600, 650, 700, 750, 800) | **3**: 400, 500, 600 (+700 só no rótulo da aba ativa do celular, exigido pelo teste da v129) |
| 3 | Raios diferentes no mesmo bloco | **15 / 16** raios (6, 8, 10, 12, 14, 16, 18, 19, 22, 24, 26, 28, 32, 99, 999 px) | **5** + círculo: 8, 12, 20, 28, pílula (e o 22,5% do logo, intocado) |
| 4 | Hierarquia pela cor e pelo tamanho exagerado | título do Início em 84 px, títulos de tela em 56 px; número do resumo em 44 px colorido com faixa lateral colorida e degradê | título do Início 40/34 px, telas 28 px; um número em destaque por cartão, sem faixa nem degradê |
| 5 | Sombras e brilhos em tudo | **21 / 18** sombras diferentes (brilho no topo de todo cartão, anel colorido em etiquetas, faixa de 3–4 px colorida) | **15 / 8**, quase todas são foco, anel do avatar e a sombra única dos flutuantes; cartões sem sombra |
| 6 | Cores saturadas em área grande | fundo com degradê lilás forte; cartões com radial da cor da área; anel colorido ao redor da aba ativa no celular | fundo neutro com brilho suave; cartões sólidos (superfície 1/2/3); cor da área só no ícone e no número |
| 7 | Contraste baixo | "Ver plano de hoje →" no Início com **1,6–2,2:1** nos 3 temas | AA em todas as telas medidas (teste v164) |
| 8 | Botões todos iguais (pílulas) e campos de formatos diferentes | botões pílula de 999 px, campos de 14 px, filtros de 999 px; "Sair"/"Minha conta" com o mesmo peso do primário | controles de 44 px e raio 12; primário (acento), secundário (superfície), fantasma (topo) e perigo; filtros em segmento |
| 9 | Cartão dentro de cartão | até 13 cartões aninhados em 3 níveis por tela (editor da nota, Notas) | máx. 2 níveis: o interno vira superfície 2 sem borda; "Planos por dia" deixou de ser caixa |
| 10 | Duas famílias de letra | Space Grotesk nos títulos + Inter no texto | uma só: fonte do sistema da Apple em aparelho Apple, Inter nos demais |
| 11 | Ícones de texto | ✓ e ✕ de texto como ícone (concluir atividade, "✓ Enviada", fechar janela) | SVG do mesmo conjunto (24 px, traço 1,75, pontas redondas) |
| 12 | Espaço vazio sem motivo | caixa de 140 px acima do título de cada tela | título junto do conteúdo (24 px de respiro) |

Sinais que **não** apareceram: branco puro no texto, vidro atrás de conteúdo em excesso (já era só barra e folhas), animação em loop
(removida na v122/v158), lista de 40 px no celular (v145 já resolve), números desalinhados (agora `tabular-nums` em todo número).

Pendente para a v165 (tela por tela): espaçamentos ainda fora da grade de 4 px dentro de componentes antigos (35 valores distintos no PC),
botões demais numa mesma linha (Plano: 6 ações; "Excluir plano" ocupando a linha inteira), e o topo do PC com texto de conta e loja repetido.
