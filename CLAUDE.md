# Regras do projeto StoK · Estoque 99

- Responda ao usuário em português do Brasil, curto e simples (ele lê no celular).
- Trabalhe no branch `claude/mobile-desktop-compatibility-tkbd2w`. Não abra PR sem pedido.
- Antes de cada commit, confira no diff que nenhuma chave de API (Groq, Gemini) nem senha entrou. Nunca grave chaves nem senhas no repositório. Exceção autorizada pelo usuário: o `firebaseConfig` público (apiKey do Firebase) fica no `cloud-js`. A senha da conta do robô (`robo@stok-e99.app`) nunca vai para o repositório.
- Toda publicação sobe a versão em três lugares: `<meta name="estoque99-version">` do `index.html` e do `robo.html` (hoje só redireciona para o app; IA removida na v121 — não há mais robô, agentes nem configuração de IA), e `CACHE` do `sw.js` — e, desde a v135, o `?v=` dos arquivos `app/` no `index.html`. Use `node scripts/bump-version.mjs <N>`, que faz tudo e confere.
- O site é só tema escuro. Não reintroduza modo claro.
- **Sempre salvar no Google (pedido do usuário):** depois de cada publicação, salvar no Google Drive do usuário, na pasta "Stok — Estoque 99" (id `1RYdNvtXOLyySWcU_U1UNZEzwtA7N7Er-`), uma entrada no histórico de versões (versão, data, o que mudou) e uma cópia de `index.html`, `robo.html`, `sw.js`, `manifest.webmanifest` e `README.md` numa subpasta da versão. Se o Google recusar (permissão), avisar o usuário em uma linha.
- A planilha do Google é atualizada pelo próprio app (bloco `sheets-js` + `apps-script/planilha.gs`).
- Nuvem: Firebase do projeto `gen-lang-client-0167474823` (Auth e-mail/senha + Firestore `(default)` em São Paulo, plano grátis). Regras em `firestore.rules`; publicar com `firebase deploy --only firestore:rules,hosting` (site `gen-lang-client-0167474823-295e1`). O outro site do projeto (`gen-lang-client-0167474823.web.app`) é de outro app: não mexer.
- Testes: `bash tests/run.sh` (servidor local e emulador do Firebase). Rodar antes de cada publicação.
- Segundo gestor: tarefa agendada diária confere o site, corrige o que for pequeno e seguro, envia o correio (`node tests/robo_correio.js`) e manda relatório para ferreiravitorhugo819@gmail.com e 99.estoque@lojasg.com.br.
- Forma de trabalho (pedido do usuário): o agente principal não executa o trabalho; planeja e delega cada tarefa a um subagente (um por tarefa, os independentes em paralelo) e lê só os relatórios. Modelos: Fable — arquitetura, bugs complexos e revisão de código; Opus — edições, testes, documentação e refatoração; Haiku — pesquisas e resumos. Especificar o modelo em cada chamada.

---

## Aviso automático ao Claude (pedido do usuário — 22/10/2026)

**Regra permanente:** sempre que Grok, um bot, Actions ou qualquer agente alterar o app, **atualizar esta seção** no mesmo ciclo de trabalho. O Claude deve ler isto no início de cada sessão.

### Estado atual do site
- **Versão:** 172 (`meta estoque99-version` + `CACHE` `estoque99-v172` no `sw.js` + `?v=172` nos arquivos `app/`), publicada em 28/11/2026 no GitHub Pages (Firebase Hosting ainda na versão anterior: deploy sem login neste ambiente; publicar com `firebase deploy --only hosting`). Subir versão: `node scripts/bump-version.mjs <N>` (meta do index.html e robo.html, CACHE do sw.js e todos os `?v=`; confere que cada arquivo existe e está no pré-cache).
- **Branch de deploy:** `claude/mobile-desktop-compatibility-tkbd2w` → GitHub Pages (`pages.yml`).
- **URL:** https://vferreiras.github.io/ESTOQUE-G/
- Contas são **locais** (localStorage cifrado AES-GCM + PBKDF2). Não há servidor central de estoque.
- Histórico completo de versões e pendências antigas: `docs/HISTORICO.md` (ler só quando precisar de detalhe antigo).

### Última versão publicada — não desfazer sem pedido

| Versão | O quê |
|--------|--------|
| v172 | **Início de volta ao visual da v169** (dono: "não está aparecendo nada na tela de início"; no iPhone o Início da v170/v171 ficava vazio, só com o S). No navegador de teste (Chromium) o Início da v171 aparece e recebe toque normalmente; sem WebKit aqui não deu para achar a causa no prazo de 10 min, então a arte nova saiu do `index.html` (`app/js/v170-inicio.js` e `app/css/v170-inicio.css` continuam em `app/` e no `APP_FILES`, só não carregam). Chat em tela cheia (v170-chat) continua. Teste novo `tests/v172_inicio_basico_test.js` ("Tudo no seu lugar.", "Novo plano" visível e tocável, abas, com e sem "menos movimento"); `v170_inicio_test` e `v171_inicio_visivel_test` saíram do `run.sh` até a arte voltar. **Para voltar a arte:** testar no iPhone real (Safari) e suspeitar primeiro do `::before` com foto + `mask-image` + `z-index:-1` na `.hero-home`. |

Os workflows one-shot `apply-*.yml` foram apagados na v89 (podiam regredir o site); o que vale no ar é o `index.html` + `sw.js` publicados.

### Pendências abertas e regras que ainda valem

0. **IA removida na v121** — não reintroduzir assistente, agentes, piloto automático nem chaves de IA sem pedido do dono.
6. **Código dividido (v135):** `app/js/<bloco>.js` e `app/css/<bloco>.css` (`grep -l` em `app/` acha o bloco). Arquivo novo: `<script src="app/js/novo.js?v=N">` no `index.html` na posição certa + nome no `APP_FILES` do `sw.js`. O `<head>` e o boot continuam inline.
8. **Testes** — rodar `bash tests/run.sh` antes de publicar; cobrir admin delete e reset de senha se possível.
9. **Não reintroduzir** — injeção de HTML pelo SW (`injectPatch` / `account-id-patch.js`); isso quebrou o app (SyntaxError).
11. **Visual** — desde a v122 sem efeitos pesados (sem S de partículas, grade Tron, rastros, holograma, "Pausar animação", preferência Efeitos; música removida). Ficam vidro, cores do tema e transições simples; respeita "menos movimento" (exceto a abertura, v146).
12. **Conferência / limpeza:** limpeza do IndexedDB `estoque99-conf` ainda não existe. Nova limpeza geral em todos os aparelhos = subir a época do `v126-reset-js` (`r127`). Não mexer nos stashes do git.
14. **Ainda abertos:** campos de data/hora no formato do navegador; avisos só com o app aberto (sem Web Push). ("(s)" fora do DOM: notificação do sistema corrigida na v168.)
15. **Testes que oscilam (v168):** `v162_test` mede CPU do vigia com poucos ciclos (3,5–4,2 ms contra o limite 3,5 ms na máquina de teste; passou na suíte); `v137_test` só com carga. Não são bug do app; se o vigia ficar acima de 3,5 ms no iPhone real, decidir com o dono se o limite muda.

**Conferir em aparelho real** (detalhes em `docs/HISTORICO.md`):
- v140/v141: abertura (quadradinhos → S) fluida no iPhone; "Entrar" com som; teclado/VoiceOver só alcançam o botão.
- v142: coletor Eyoyo real (iPhone por Bluetooth, PC por USB); sufixo Enter/Tab; intervalo < 60 ms (senão aumentar `KBD_GAP` no `conf.js`).
- v143: etiqueta da demanda e cartão "Demandas do estoque" no iPhone (teclado, `<datalist>`).
- v144: Compartilhar com banner no WhatsApp; colar no Outlook do PC; ativar FormSubmit em stok99.app@gmail.com.
- v145: lista de notas compacta no iPhone (5–6 por tela, toque, VoiceOver).
- v146: botão "Entrar" vermelho e abertura animada com "menos movimento" no PC/iPhone do dono.
- v147: e-mail único e perfil único em aparelhos reais.
- v148: chat/sync só pela nuvem no PC da loja (antivírus) e no iPhone.
- v149: campo da conversa acima do teclado no iPhone (Safari e app da tela inicial), sem a tela balançar.
- v150–v153: cartões escuros, título do Início, filtros das Notas e plano no WhatsApp/Outlook reais.
- v154: aba pisca (título + bolinha vermelha) no PC da loja (Chrome/Edge).
- v155: botão de clipe e Baixar no iPhone; antivírus do PC deixa baixar.
- v156: imprimir no PC da loja (impressora real) e no iPhone (AirPrint); avisos de alteração no iPhone real (cápsula abaixo do topo) e aba piscando no PC.
- v157: gesto de deslizar para voltar no iPhone (app da tela inicial) e botão voltar do Android; "‹ Voltar" no topo das telas.
- v158: ativar o FormSubmit em cada e-mail de conta (1º envio); vida no iPhone real (fluidez, cores).
- v159: logo novo no ícone da tela inicial do iPhone (reinstalar o atalho se o ícone antigo ficar) e na aba do PC; abertura com o S novo fluida no iPhone.
- v160: visualizador no iPhone real (pinça, toque duplo, deslizar, gesto de voltar fecha) e Baixar foto no Safari/app da tela inicial.
- v161: animação do mouse no PC da loja (Chrome/Edge): brilho fluido, sem pesar; nada aparece no iPhone/tablet.
- v162: auto-reparo no PC da loja e no iPhone real: ver em Dados → "Auto-reparo" o que foi reparado; nada piscando nem pulando; avisar o que repete para corrigir de vez.
- v163: aba piscando no PC do dono (Windows com efeitos de animação desligados): usar Preferências → "Testar aba piscando"; janela atrás de outra e minimizada; faixa "ResizeObserver loop" não aparece mais no iPhone.
- v164: visual novo (sistema de design) no PC da loja e no iPhone real nos 3 temas: textos legíveis, botões de 44 px, nada cortado; dizer o que ainda parece amador para a v165.
- v165: visual novo tela por tela no iPhone e no PC da loja (3 temas); chat com balões no iPhone (cauda, "Lida por", teclado); cores da paleta nova (gráficos do Painel, banner do WhatsApp/Outlook).
- v166: nome **StoK** no iPhone e no PC da loja (abertura, tela de entrar, menu, aba do navegador, WhatsApp/Outlook/impressão); no iPhone o nome do atalho da tela inicial só muda ao adicionar o atalho de novo; colar de novo os `apps-script/*.gs` no Apps Script para os e-mails e a planilha dizerem StoK.
- v167: chat no iPhone real (lista de conversas, chat da equipe, conversa privada/grupo, com e sem teclado): nada cortado à direita, balões largos, texto 17 px; dizer se ainda parece apertado.
- v168: ativar uma conta pelo link de acesso no iPhone real e ver no Início "Dados da loja na nuvem" logo depois (sem esperar 1 minuto); chat privado/grupo dessa conta chegando.
- v169: chat da equipe no iPhone real e no PC da loja comparado com o print (foto/nome/cargo/coroa, cartão "Aviso importante", PDF, campo); logo + StoK na barra de cima do celular; Demandas do estoque no iPhone (rótulo em cima, campo inteiro). Dizer o que ainda não ficou igual.
- v170: Início no iPhone real comparado com a arte (logo, foto do galpão, S, cores em qualquer tema); chat em tela cheia no iPhone (Safari e app da tela inicial): cabeçalho no topo, campo acima do teclado, botão ⋯; dizer o que ainda difere.
- v171: abrir o app no iPhone (também como app da tela inicial, com Pouca Energia) e voltar do segundo plano: o Início aparece inteiro em até 1,5 s, sem ficar só o S.
- v172: Início voltou ao visual da v169 no iPhone (aparece inteiro e responde ao toque); a arte da v170 só volta depois de testada no iPhone.

### Decisões pendentes do dono (v89 — não mudar sem perguntar)
- **Chat (v106/v108):** desde a v108 a mensagem que falhou fica guardada (cifrada) no aparelho; no celular Enter continua enviando (não há Shift+Enter no teclado do celular); "Sair da equipe" foi para baixo do chat. Se o dono quiser guardar as não enviadas ou Enter = nova linha no celular, mudar no `chat-js`.
- **E-mail obrigatório (v105/v107):** desde a v107 a tela tem "Agora não" (vale só para a sessão). O e-mail não é confirmado na hora (a confirmação chega pelo e-mail da nuvem, como antes).
- **Apagar mensagem do chat para todos (v109):** feito com `E99D:`; aparelhos com versão antiga continuam mostrando a original.
- **Quem é gestor (v101):** só `vferreiras`/`vferrreiras` ou uid com 'S' em `verificados`. A conta "Estoque 99" (semente do PC) e contas que ganharam 'gestor' sem ser o dono viraram 'estoque'. Outro gestor = marcar o uid com `node scripts/verificar.js <uid> s`.
- **Força da senha (v110):** senha forte + PBKDF2 para contas novas; antigas migram ao trocar (prazo de 30 dias, depois obrigatória).
- **Authenticator:** v89 passou a pedir a chave anotada para recuperar; quem já tinha precisa ativar de novo. Confirmar se o dono aceita esse modelo.
- **Dados pessoais no aparelho (S15/v111):** cifrados desde a v111; ainda em claro: `cloud-email:<conta>` (os avisos com nomes por app externo saíram na v148).
- **P5 (carregar chat/perfil/sync/social/plano-aux só depois do login; agentes/autopilot: IA removida na v121):** não feito — os blocos se embrulham (`render`, `authEnter`) na ordem do HTML; mudar a ordem pode quebrar. Fazer com testes dedicados.
- **Equipe só pela nuvem (v148):** o papel vem de `papeis/{uid}` (gestor confirma); quem entra só com o código fica no nível auxiliar. Aparelhos ≤v147 não conversam mais com a equipe.
- **Música ambiente:** removida na v122 (pedido do dono). Fica só o som de abertura/login (`e99Sting`, v118).

### Preferências do usuário (Vitor / vferreiras)

- Conta gestor: login **`vferreiras`** (nunca `vferrreiras`).
- Quer **Administração** visível e poder apagar/redefinir contas.
- Selos: removidos na v122. **Perfil voltou na v127 sem selos** (foto/nome no chat e na Equipe, "Ver perfil").
- **Contas só pelo gestor (v127):** ninguém cria conta pela tela de entrar; o gestor cria e manda um link de acesso de uso único.
- **Auxiliar (v127):** cria NFs e planos, edita os que criou, usa o chat e o perfil; não exclui nada.
- **Regra permanente de design:** em qualquer mudança de design, preservar o **logo vigente** (desde a v159: opção 1, "Prateleira" — S de prateleiras com caixas; menu, tela de entrar, ícones e S da abertura). Só o dono troca o logo (exceção dele na v158/v159, via `scripts/aplicar-logo.mjs`).
- Quer o app com aparência profissional de empresa global; tokens `--p-*` em `app/css/v164-pro.css` (guia em `docs/design-referencias.md`), cores em `app/css/v165-cores.css` (guia em `docs/paleta.md`).
- Nome do app: **StoK** (S e K maiúsculos). Não usar "Lojas G" em nenhum texto do app (desde a v166); chaves `lojasg.estoque99.*` e o e-mail @lojasg.com.br continuam (são técnicos).
- Quer que **qualquer mudança** seja comunicada ao Claude **automaticamente** via este arquivo.
- Dados sensíveis ficam no aparelho; nuvem só com blob já cifrado quando houver.

### Como avisar o Claude da próxima vez

1. Atualizar a linha da última versão e a lista de pendências nesta seção. **A cada versão nova, a linha anterior sai do CLAUDE.md e vai para `docs/HISTORICO.md`** (tabela de versões); o CLAUDE.md fica só com a última.
2. Commit com mensagem clara (`docs: briefing Claude — vXX …`).
3. Se a mudança for grande, acrescentar 3–5 linhas em “O que o Claude precisa melhorar”.
