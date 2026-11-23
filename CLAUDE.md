# Regras do projeto Stok · Estoque 99 (Lojas G)

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
- **Versão:** 161 (`meta estoque99-version` + `CACHE` `estoque99-v161` no `sw.js` + `?v=161` nos arquivos `app/`), publicada em 23/11/2026 no GitHub Pages e no Firebase Hosting. Subir versão: `node scripts/bump-version.mjs <N>` (meta do index.html e robo.html, CACHE do sw.js e todos os `?v=`; confere que cada arquivo existe e está no pré-cache).
- **Branch de deploy:** `claude/mobile-desktop-compatibility-tkbd2w` → GitHub Pages (`pages.yml`).
- **URL:** https://vferreiras.github.io/ESTOQUE-G/
- Contas são **locais** (localStorage cifrado AES-GCM + PBKDF2). Não há servidor central de estoque.
- Histórico completo de versões e pendências antigas: `docs/HISTORICO.md` (ler só quando precisar de detalhe antigo).

### Última versão publicada — não desfazer sem pedido

| Versão | O quê |
|--------|--------|
| v161 | **Animação do mouse só no PC** (`app/js/v161-mouse.js` + `app/css/v161-mouse.css`, depois da v160 no `index.html` e no `APP_FILES`): brilho suave que segue o cursor (lerp, cor `--neon-rgb` do tema, `pointer-events:none`, `#mfx-glow`), ondinha no clique de botões/cartões (caixa fixa recortada, sem mexer no elemento; os da v158 — `button.primary`, `.stat.e99-go`, `.vd-ring` — continuam com a ondulação da v158) e botões/cartões que sobem/crescem com borda realçada (`.mfx-hot`, propriedades `translate`/`scale` via WAAPI, somam com o transform existente); cartões ≥300×120 inclinam até 3° (fora dos cartões 3D da v86). Só com `(pointer:fine) and (hover:hover)` e janela >900 px; só transform/opacity; um único rAF que para quando o brilho alcança o mouse; pausa com aba oculta, janela sem foco e cursor fora; desligado com "menos movimento", na abertura (`stok-intro-active`), na conferência (`body.conf-on`), com `e99Img` aberto e em campos de texto. Preferências → "Animação do mouse" (só no PC; `lojasg.estoque99.mouse-fx`='off'). API `window.e99Mouse` (`set`, `on`, `state`). Teste `tests/v161_mouse_test.js`. |

Os workflows one-shot `apply-*.yml` foram apagados na v89 (podiam regredir o site); o que vale no ar é o `index.html` + `sw.js` publicados.

### Pendências abertas e regras que ainda valem

0. **IA removida na v121** — não reintroduzir assistente, agentes, piloto automático nem chaves de IA sem pedido do dono.
6. **Código dividido (v135):** `app/js/<bloco>.js` e `app/css/<bloco>.css` (`grep -l` em `app/` acha o bloco). Arquivo novo: `<script src="app/js/novo.js?v=N">` no `index.html` na posição certa + nome no `APP_FILES` do `sw.js`. O `<head>` e o boot continuam inline.
8. **Testes** — rodar `bash tests/run.sh` antes de publicar; cobrir admin delete e reset de senha se possível.
9. **Não reintroduzir** — injeção de HTML pelo SW (`injectPatch` / `account-id-patch.js`); isso quebrou o app (SyntaxError).
11. **Visual** — desde a v122 sem efeitos pesados (sem S de partículas, grade Tron, rastros, holograma, "Pausar animação", preferência Efeitos; música removida). Ficam vidro, cores do tema e transições simples; respeita "menos movimento" (exceto a abertura, v146).
12. **Conferência / limpeza:** limpeza do IndexedDB `estoque99-conf` ainda não existe. Nova limpeza geral em todos os aparelhos = subir a época do `v126-reset-js` (`r127`). Não mexer nos stashes do git.
14. **Ainda abertos:** campos de data/hora no formato do navegador; avisos só com o app aberto (sem Web Push); "(s)" em `notify` fora do DOM.

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
- Quer que **qualquer mudança** seja comunicada ao Claude **automaticamente** via este arquivo.
- Dados sensíveis ficam no aparelho; nuvem só com blob já cifrado quando houver.

### Como avisar o Claude da próxima vez

1. Atualizar a linha da última versão e a lista de pendências nesta seção. **A cada versão nova, a linha anterior sai do CLAUDE.md e vai para `docs/HISTORICO.md`** (tabela de versões); o CLAUDE.md fica só com a última.
2. Commit com mensagem clara (`docs: briefing Claude — vXX …`).
3. Se a mudança for grande, acrescentar 3–5 linhas em “O que o Claude precisa melhorar”.
