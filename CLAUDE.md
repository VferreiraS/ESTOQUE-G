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
