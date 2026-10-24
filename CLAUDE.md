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
- **Versão publicada:** 81 (`meta estoque99-version` + `CACHE` `estoque99-v81` no `sw.js`), branch `claude/mobile-desktop-compatibility-tkbd2w`, SHA `719df78`.
- **Candidata local:** v82, ainda sem commit/deploy; isola caches do Stok e alinha `robo.html`. O usuário precisa aprovar antes de publicar.
- **Branch de deploy:** `claude/mobile-desktop-compatibility-tkbd2w` → GitHub Pages (`pages.yml`).
- **URL:** https://vferreiras.github.io/ESTOQUE-G/
- Contas são **locais** (localStorage cifrado AES-GCM + PBKDF2). Não há servidor central de estoque.

### Mudanças recentes (v73 → v82 candidata) — não desfazer sem pedido

| Versão | O quê |
|--------|--------|
| v73–v76 | Typo `vferreiras` corrigido; SW network-first estável (sem injeção HTML); **ID de conta** `STK-…` em cada conta (`authNewAccountId` / `authEnsureId` no `index.html`). |
| v77 | Gestor pode **apagar** contas neste navegador (`authDeleteAccount`, `authDeleteAllOtherAccounts`). Contas protegidas: `vferreiras`, `estoque 99`, sessão atual. |
| v78 | Híbrido: backup cifrado tentando Firebase `backups/`; gestor **redefine senha** de auxiliar **com código de recuperação** (`authAdminResetPassword` em `hybrid-admin-js`). |
| v80 | Bug do menu: `applyRole` **apagava** `labels.admin` — corrigido (não pular `admin`). Administração deve aparecer para role `gestor`. |
| v81 | Selo verificado = **S de partículas vermelhas** (mesmo path da logo + canvas estilo `Field`/`sampleG`). Script `particle-badge-js`. Login `vferreiras` / gestor recebem selo mesmo offline. |
| v82 (rascunho local, não publicado) | Limita leitura/limpeza do CacheStorage aos caches próprios do Stok e alinha metadados `index.html`/`robo.html`/`sw.js`; aguarda aprovação do usuário para commit/deploy. |

Arquivos de patch em `scripts/` e workflows one-shot em `.github/workflows/` (`apply-*.yml`) são auxiliares; o que vale no ar é o `index.html` + `sw.js` publicados.

### O que o Claude precisa melhorar / pendências

1. **Administração no menu** — confirmar no celular real que **Administração** aparece após login gestor; se sumir de novo, `applyRole` / snapshot de `FULL.labels` ainda pode estar em conflito com patches.
2. **Selo de partículas** — validar performance no iPhone (90 partículas por selo + MutationObserver). Se pesar, reduzir N ou pausar fora da viewport.
3. **Redefinir senha sem código** — usuário quer autonomia total quando auxiliar perde senha; hoje **exige código de recuperação** (criptografia). Próximo passo seguro: **custódia/escrow** na criação do auxiliar (bits da chave embrulhados para o gestor), não armazenar senha em claro.
4. **Backup/restore nuvem** — `hyCloudBackupRecord` grava em `backups/{id}` se as **Firestore rules** permitirem. Revisar `firestore.rules` para backup cifrado + restore multi-aparelho. Sem rules corretas o backup falha em silêncio.
5. **Modelo híbrido completo** — fases A/B parcialmente no cliente; falta restore polido na UI e registro de metadados para o gestor ver contas além do aparelho local.
6. **Monólito** — `index.html` ~1,1 MB. Dívida técnica: modularizar com cuidado para não quebrar SW/cache.
7. **Rotas mortas** — `assistant` / `consultas` redirecionam para `home`; limpar ou reativar.
8. **Testes** — rodar `bash tests/run.sh` antes de publicar; cobrir admin delete, reset de senha e selo se possível.
9. **Não reintroduzir** — injeção de HTML pelo SW (`injectPatch` / `account-id-patch.js`); isso quebrou o app (SyntaxError).
10. **Google Drive** — após cada publicação, histórico + cópia na pasta Stok (regra acima).
11. **Candidata v82 local** — não publicar até autorização. `tests/cloud_test.js` foi ajustado para aceitar câmera já autorizada e passou isoladamente (31 verificações, exit 0). Na suíte anterior: 224 PASS, nenhum FAIL explícito; exit 1 por `TimeoutError` no seletor antigo (corrigido) e três `SecurityError` emitidos por `apis.google.com` no navegador de teste. A versão pública permanece v81.

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
