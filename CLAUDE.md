# Regras do projeto Stok · Estoque 99 (Lojas G)

- Responda ao usuário em português do Brasil, curto e simples (ele lê no celular).
- Trabalhe no branch `claude/mobile-desktop-compatibility-tkbd2w`. Não abra PR sem pedido.
- Antes de cada commit, confira no diff que nenhuma chave de API (Groq, Gemini) nem senha entrou. Nunca grave chaves nem senhas no repositório. Exceção autorizada pelo usuário: o `firebaseConfig` público (apiKey do Firebase) fica no `cloud-js`. A senha da conta do robô (`robo@stok-e99.app`) nunca vai para o repositório.
- Toda publicação sobe a versão em três lugares: `<meta name="estoque99-version">` do `index.html` e do `robo.html` (hoje só redireciona para o app; o Robô-chatbot foi removido — a IA agora são os dois agentes do bloco `agents-js`: Local = Ollama, Nuvem = OmniRoute; configuração cifrada por aparelho, nunca no repositório), e `CACHE` do `sw.js`.
- O site é só tema escuro. Não reintroduza modo claro.
- **Sempre salvar no Google (pedido do usuário):** depois de cada publicação, salvar no Google Drive do usuário, na pasta "Stok — Estoque 99" (id `1RYdNvtXOLyySWcU_U1UNZEzwtA7N7Er-`), uma entrada no histórico de versões (versão, data, o que mudou) e uma cópia de `index.html`, `robo.html`, `sw.js`, `manifest.webmanifest` e `README.md` numa subpasta da versão. Se o Google recusar (permissão), avisar o usuário em uma linha.
- A planilha do Google é atualizada pelo próprio app (bloco `sheets-js` + `apps-script/planilha.gs`).
- Nuvem: Firebase do projeto `gen-lang-client-0167474823` (Auth e-mail/senha + Firestore `(default)` em São Paulo, plano grátis). Regras em `firestore.rules`; publicar com `firebase deploy --only firestore:rules,hosting` (site `gen-lang-client-0167474823-295e1`). O outro site do projeto (`gen-lang-client-0167474823.web.app`) é de outro app: não mexer.
- Testes: `bash tests/run.sh` (servidor local, ntfy falso e emulador do Firebase). Rodar antes de cada publicação.
- Segundo gestor: tarefa agendada diária confere o site, corrige o que for pequeno e seguro, envia o correio (`node tests/robo_correio.js`) e manda relatório para ferreiravitorhugo819@gmail.com e 99.estoque@lojasg.com.br.
- Forma de trabalho (pedido do usuário): o agente principal não executa o trabalho; planeja e delega cada tarefa a um subagente (um por tarefa, os independentes em paralelo) e lê só os relatórios. Modelos: Fable — arquitetura, bugs complexos e revisão de código; Opus — edições, testes, documentação e refatoração; Haiku — pesquisas e resumos. Especificar o modelo em cada chamada.

---

## Aviso automático ao Claude (pedido do usuário — 22/10/2026)

**Regra permanente:** sempre que Grok, um bot, Actions ou qualquer agente alterar o app, **atualizar esta seção** no mesmo ciclo de trabalho. O Claude deve ler isto no início de cada sessão.

### Estado atual do site
- **Versão:** 86 (`meta estoque99-version` + `CACHE` `estoque99-v86` no `sw.js`), publicada no GitHub Pages e no Firebase Hosting.
- **Branch de deploy:** `claude/mobile-desktop-compatibility-tkbd2w` → GitHub Pages (`pages.yml`).
- **URL:** https://vferreiras.github.io/ESTOQUE-G/
- Contas são **locais** (localStorage cifrado AES-GCM + PBKDF2). Não há servidor central de estoque.

### Mudanças recentes (v73 → v86) — não desfazer sem pedido

| Versão | O quê |
|--------|--------|
| v73–v76 | Typo `vferreiras` corrigido; SW network-first estável (sem injeção HTML); **ID de conta** `STK-…` em cada conta (`authNewAccountId` / `authEnsureId` no `index.html`). |
| v77 | Gestor pode **apagar** contas neste navegador (`authDeleteAccount`, `authDeleteAllOtherAccounts`). Contas protegidas: `vferreiras`, `estoque 99`, sessão atual. |
| v78 | Híbrido: backup cifrado tentando Firebase `backups/`; gestor **redefine senha** de auxiliar **com código de recuperação** (`authAdminResetPassword` em `hybrid-admin-js`). |
| v80 | Bug do menu: `applyRole` **apagava** `labels.admin` — corrigido (não pular `admin`). Administração deve aparecer para role `gestor`. |
| v81 | Selo verificado = **S de partículas vermelhas** (mesmo path da logo + canvas estilo `Field`/`sampleG`). Script `particle-badge-js`. Login `vferreiras` / gestor recebem selo mesmo offline. |
| v82 | Limita leitura/limpeza do CacheStorage aos caches próprios do Stok (`CACHE_PREFIX`) e alinha `robo.html`. |
| v83 | Tela de entrar limpa (links "Esqueci a senha" → folha `#auth-sheet` com e-mail / Authenticator / código; "Criar conta" = `#auth-create`), licença ZXing em Dados e ajuda (`#lic-panel`), fluidez (blocos `login-clean-*`, `fluid-css`) e selo de partículas mais leve. |
| v84 | Abertura nova: prateleiras acendem, scanner vermelho e o S; ~1,7 s; não bloqueia o login; tela 'Toque para abrir' removida — no iPhone o som da abertura só toca se já houve toque. |
| v85 | **IA grátis sem cartão:** Worker Cloudflare usa **Workers AI** (`env.AI`, binding `AI` no `wrangler.jsonc`, modelo `@cf/meta/llama-3.3-70b-instruct-fp8-fast`) sem chave; NVIDIA só com `nvidia/…` + segredo opcional `NVIDIA_API_KEY`; só `SENHA` é obrigatória. `ia.gs` ganhou **Google Gemini** (`GEMINI_API_KEY`, endpoint OpenAI-compatível, `gemini-3.8-flash`). Assistente: "Google Gemini (grátis)" e "Workers AI (grátis, sem chave)" / "NVIDIA (com chave)". Teste `tests/ia_free_test.js`. |
| v86 | **Auditoria de design aplicada** (blocos `v86-css` / `v86-js` no fim do `index.html`): topo 56 px com sino (`.bell-btn`, `#alert-total`), títulos curtos + "Mais ações" (`.more-actions`) em Notas/Corredores/Plano/Equipe, ícones SVG (`e99Icon`), cartões planos, cartões 3D no Início (`.stats.tilt-on`), Preferências em Minha conta (`#prefs-panel`; no PC as opções ficam no rodapé da barra lateral), respeita "menos movimento" (`__osReduceSystem`; Efeitos começam desligados), Administração montada antes do menu para `role==='gestor'`. **ZXing, Fuse e flatpickr saíram do HTML** → `vendor/*.js` carregados por `e99Need()` e pré-cacheados no `sw.js`. Cache em memória do `localStorage` (`Storage.prototype`). |

Arquivos de patch em `scripts/` e workflows one-shot em `.github/workflows/` (`apply-*.yml`) são auxiliares; o que vale no ar é o `index.html` + `sw.js` publicados.

### O que o Claude precisa melhorar / pendências

0. **IA grátis (v85)** — falta o dono criar o Worker (botão 1 toque) e/ou a `GEMINI_API_KEY` no Apps Script e testar no iPhone. Se o modelo grátis mudar, trocar `gemini-3.8-flash` (`ia.gs` + `agWizSave`) e `@cf/…` (Worker + `agCfSave`).
1. **Administração no menu** — resolvido na v86 (o item é posto antes do menu ser montado, em todo render, para `role==='gestor'`). Atenção: contas feitas em "Criar conta" têm `role:'estoque'` e **não** são gestor; só confirmar no iPhone real com a conta gestor.
2. **Selo de partículas** — v83: já pausa fora da tela e em segundo plano, ~30 fps, um só MutationObserver (com rAF). Falta só conferir no iPhone real.
3. **Redefinir senha sem código** — usuário quer autonomia total quando auxiliar perde senha; hoje **exige código de recuperação** (criptografia). Próximo passo seguro: **custódia/escrow** na criação do auxiliar (bits da chave embrulhados para o gestor), não armazenar senha em claro.
4. **Backup/restore nuvem** — `hyCloudBackupRecord` grava em `backups/{id}` se as **Firestore rules** permitirem. Revisar `firestore.rules` para backup cifrado + restore multi-aparelho. Sem rules corretas o backup falha em silêncio.
5. **Modelo híbrido completo** — fases A/B parcialmente no cliente; falta restore polido na UI e registro de metadados para o gestor ver contas além do aparelho local.
6. **Monólito** — `index.html` ~1,1 MB. Dívida técnica: modularizar com cuidado para não quebrar SW/cache.
7. **Rotas mortas** — `assistant` / `consultas` redirecionam para `home`; limpar ou reativar.
8. **Testes** — rodar `bash tests/run.sh` antes de publicar; cobrir admin delete, reset de senha e selo se possível.
9. **Não reintroduzir** — injeção de HTML pelo SW (`injectPatch` / `account-id-patch.js`); isso quebrou o app (SyntaxError).
10. **Google Drive** — após cada publicação, histórico + cópia na pasta Stok (regra acima).

### Preferências do usuário (Vitor / vferreiras)

- Conta gestor: login **`vferreiras`** (nunca `vferrreiras`).
- Quer **Administração** visível e poder apagar/redefinir contas.
- Selo verificado: **vermelho**, forma **S da logo**, efeito **vivo de partículas** (como o fundo do login), não check azul.
- Quer que **qualquer mudança** seja comunicada ao Claude **automaticamente** via este arquivo.
- Dados sensíveis ficam no aparelho; nuvem só com blob já cifrado quando houver.

### Como avisar o Claude da próxima vez

1. Atualizar a tabela de versões e a lista de pendências nesta seção.
2. Commit com mensagem clara (`docs: briefing Claude — vXX …`).
3. Se a mudança for grande, acrescentar 3–5 linhas em “O que o Claude precisa melhorar”.
