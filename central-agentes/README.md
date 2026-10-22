# Grupo Ferreira S.A. · Central de Agentes

Um prédio 3D no navegador onde aparecem, como bonecos trabalhando nos andares, os agentes do **Claude Code**: a sessão principal, os subagentes que ela cria e as ferramentas que cada um usa (ler arquivo, editar, rodar comando…).

Funciona de dois jeitos:

- **Demo** — agentes de mentira andando pelo prédio. Não precisa de nada além do navegador.
- **Ao vivo** — o Claude Code avisa o `server.js` a cada passo (por *hooks*) e o prédio mostra o que está acontecendo de verdade.

Arquivos:

| Arquivo | Para quê |
|---|---|
| `index.html` | O prédio 3D (a interface). |
| `server.js` | Servidor local, sem dependências: recebe os eventos dos hooks e repassa ao navegador. |
| `.claude/settings.json` | Hooks do Claude Code que mandam os eventos para o servidor. |

## Requisitos

- **Node 18+** (só para o modo ao vivo).
- **curl** (usado pelos hooks).
- Navegador com **WebGL** (Chrome, Edge, Firefox ou Safari atuais).

## Modo demo

Escolha um:

1. Abra o `index.html` direto no navegador (duplo clique), **ou**
2. Rode `node server.js` nesta pasta e abra <http://localhost:3099>.

Sem eventos chegando, o prédio fica no modo demo.

## Modo ao vivo

1. Nesta pasta, rode:

   ```bash
   node server.js
   ```

   Deve aparecer `Central de Agentes em http://localhost:3099`. Para outra porta: `PORT=3100 node server.js` (aí troque a porta também nos hooks).

2. Abra <http://localhost:3099>. No modo *Auto* (o padrão) o prédio entra sozinho no modo ao vivo quando conecta e mostra "Aguardando agentes do Claude Code…" até chegar o primeiro evento. O botão **Modo** também força *Demo* ou *Ao vivo*.

   - **Outra porta:** se usou `PORT` diferente de 3099, abra a página com `?sse=` apontando para ela, por exemplo <http://localhost:3100/?sse=http://localhost:3100/events>. Sem isso a página procura o servidor na 3099.
   - **Página pública (GitHub Pages, https):** o navegador pode bloquear a conversa de uma página `https://` com `http://localhost`. Para o modo ao vivo, abra <http://localhost:3099/>, servida pelo próprio `server.js`.
3. Ligue os hooks, de um destes jeitos:
   - Use o Claude Code **dentro da pasta `central-agentes/`** — o `.claude/settings.json` daqui já vem pronto; **ou**
   - Copie o bloco `"hooks"` deste `.claude/settings.json` para o `.claude/settings.json` do seu projeto; **ou**
   - Copie para `~/.claude/settings.json` para valer em todos os projetos.

   Se já existir um bloco `"hooks"` no destino, junte os eventos em vez de substituir.

Eventos enviados: `SessionStart`, `SessionEnd`, `UserPromptSubmit`, `SubagentStart`, `SubagentStop`, `Stop`, `PreToolUse` e `PostToolUse` (estes dois com `"matcher": "*"`, ou seja, toda ferramenta).

O comando de cada hook é:

```bash
curl -s -m 1 -X POST -H 'Content-Type: application/json' --data-binary @- http://localhost:3099/event >/dev/null 2>&1 || true
```

Ele espera no máximo 1 segundo e nunca dá erro: se o servidor estiver desligado, o Claude Code segue normal.

### Rotas do servidor

| Rota | O que faz |
|---|---|
| `POST /event` | Recebe o JSON do hook (até 1 MB), marca a hora (`_t`) e repassa. Responde `204`. JSON inválido → `400`. |
| `GET /events` | Fluxo SSE. Ao conectar manda `event: hello`, depois os eventos dos últimos 2 minutos. `: ping` a cada 15 s. |
| `GET /` | Serve o `index.html`. |
| `GET /health` | `{"ok":true,"clients":N,"buffer":N}` |

## Testar com curl

Com o `node server.js` rodando e o prédio aberto em <http://localhost:3099>:

```bash
# 1) Começa uma sessão
curl -X POST -H 'Content-Type: application/json' http://localhost:3099/event \
  -d '{"hook_event_name":"SessionStart","session_id":"demo-123","cwd":"/home/voce/projeto","source":"startup"}'

# 2) A sessão lê um arquivo
curl -X POST -H 'Content-Type: application/json' http://localhost:3099/event \
  -d '{"hook_event_name":"PreToolUse","session_id":"demo-123","cwd":"/home/voce/projeto","tool_name":"Read","tool_input":{"file_path":"/home/voce/projeto/src/app.js"}}'

# 3) Entra um subagente revisor de código (vai para o andar de TI)
curl -X POST -H 'Content-Type: application/json' http://localhost:3099/event \
  -d '{"hook_event_name":"SubagentStart","session_id":"demo-123","cwd":"/home/voce/projeto","agent_id":"ag-001","agent_type":"code-reviewer"}'

# 4) O subagente termina
curl -X POST -H 'Content-Type: application/json' http://localhost:3099/event \
  -d '{"hook_event_name":"SubagentStop","session_id":"demo-123","cwd":"/home/voce/projeto","agent_id":"ag-001","agent_type":"code-reviewer"}'

# 5) Fim da sessão
curl -X POST -H 'Content-Type: application/json' http://localhost:3099/event \
  -d '{"hook_event_name":"SessionEnd","session_id":"demo-123","cwd":"/home/voce/projeto","reason":"exit"}'
```

Para ver o fluxo cru no terminal: `curl -N http://localhost:3099/events`.

## Controles da interface

- **Modo** — alterna entre *Auto* (ao vivo quando o servidor responde, senão demo), *Demo* e *Ao vivo*.
- **Pausar** — congela a animação.
- **Velocidade** — 1×, 2× ou 4× (só no modo demo).
- **Esconder teto** — tira o teto para ver os andares de cima.
- **Resetar câmera** — volta a câmera para a posição inicial.
- **Clicar num boneco** — a câmera passa a seguir aquele agente.

## Em que andar cada agente fica

O setor sai do tipo/nome do agente (`agent_type`), por palavras-chave:

| Palavras-chave | Setor |
|---|---|
| marketing, seo, copy, social | Marketing |
| financ, contab, budget, custo | Financeiro |
| juridic, legal, contrato, lgpd | Jurídico |
| dev, code, test, review, explore, plan, general | TI |
| nenhuma das acima | o andar mais vazio |

## Privacidade

- O servidor escuta **só no seu computador** (`127.0.0.1`) e guarda os eventos **só na memória, por 2 minutos** (no máximo 500). Nada vai para disco nem para a internet.
- Mas os eventos trazem **comandos, caminhos de arquivos e trechos do que o Claude está fazendo**. **Não exponha a porta 3099 na internet** (nada de túnel, redirecionamento de porta ou `HOST=0.0.0.0` em rede aberta).
