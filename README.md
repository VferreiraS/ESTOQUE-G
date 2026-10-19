# Estoque 99 · Lojas G

Sistema de estoque, tarefas e notas fiscais que funciona no **computador**, no **iPhone/iPad** e no **Android**.
Tudo roda no navegador; os dados ficam salvos (criptografados) no próprio aparelho.

## Publicar o site (uma vez só)

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Escolha a branch (`main`, ou a branch destas mudanças) e a pasta **/ (root)** → **Save**.
4. Em 1–2 minutos o site fica em: **https://vferreiras.github.io/ESTOQUE-G/**

> Por que publicar? No iPhone, abrir o arquivo `.html` pelo app Arquivos só mostra uma prévia:
> o login, a câmera e a criptografia não funcionam. Pelo endereço `https://` tudo funciona.

## Usar no iPhone / iPad (Safari)

1. Abra **https://vferreiras.github.io/ESTOQUE-G/** no Safari.
2. Toque em **Compartilhar** (quadrado com seta para cima).
3. Toque em **Adicionar à Tela de Início** → **Adicionar**.
4. Abra pelo ícone **Estoque 99**: abre em tela cheia e funciona sem internet.

## Usar no Android (Chrome)

Abra o endereço no Chrome e toque em **Instalar** (aviso na tela de login) ou em **⋮ → Instalar app**.

## Usar no computador (Chrome ou Edge)

Abra o endereço. Para ter um ícone de app, clique no ícone de instalar na barra de endereço.
O arquivo `index.html` também pode ser aberto direto no computador.

## Usar a IA (OmniRoute ou Ollama) no computador

A IA é opcional e roda no seu computador. Ela não funciona no celular, porque o celular não alcança o programa instalado no computador.

1. **Ollama** (mais simples): instale em https://ollama.com e baixe um modelo, por exemplo `ollama pull qwen2.5:3b`.
2. **OmniRoute** (opcional): instale com `npm i -g omniroute` (exige Node.js 22.22.2 ou mais novo) e rode `omniroute`. Conecte um provedor no painel (http://localhost:20128) e copie a chave de API.
3. Dê dois cliques em **iniciar-site.bat** (Windows) ou rode **./iniciar-site.sh** (Mac/Linux). O site abre em http://localhost:8000.
4. Vá em **Assistente**, toque em **Usar Ollama** (ou **Usar OmniRoute**), depois em **Testar conexão**, marque **Ativar**, salve e use **Perguntar à IA**.

Não abra o `index.html` com duplo clique para usar o Ollama: o Ollama bloqueia páginas abertas direto do arquivo. O OmniRoute funciona de qualquer jeito.

Se você usar o endereço publicado no GitHub Pages, o Ollama precisa ser iniciado com `OLLAMA_ORIGINS=https://vferreiras.github.io`.

## Esqueci a senha

Ao criar a conta, o app mostra um **código de recuperação** de 24 caracteres. Ele aparece uma vez. Guarde em lugar seguro, fora do navegador.

- Se esquecer a senha: na tela de login, toque em **Esqueci a senha**, informe o login, o código e a nova senha. Os cadastros continuam os mesmos.
- Contas criadas antes desta versão: entre com a senha, vá em **Minha conta** e gere um código em **Recuperação de acesso**.
- Trocar a senha gera um novo código, e o anterior deixa de valer.
- Sem o código e sem a senha, os cadastros não podem ser recuperados. O recurso não usa e-mail nem servidor.

## Tema sazonal

O app troca de cores e de logo conforme o mês do aparelho: janeiro (verão), fevereiro (carnaval), março (outono), abril (Páscoa), maio (flores), junho (festa junina), julho (inverno), agosto (Dia dos Pais), setembro (primavera), outubro (Dia das Bruxas), novembro (Consciência Negra) e dezembro (Natal).

- O botão **Sazonal** (no canto inferior) liga ou desliga o tema neste aparelho.
- Quem já instalou o app na tela inicial mantém o ícone instalado. O ícone só muda ao reinstalar.

## Compartilhar relatórios

Em cada aba com lista (Notas fiscais, Tarefas, Agenda, Equipe, Corredores e Planos de ação) há um botão **Compartilhar ↗**. Ele gera o relatório do grupo escolhido: **Pendentes**, **Concluídas** ou **Todas**.

- **Enviar**: no celular, abre o menu de compartilhamento com texto e planilha CSV. WhatsApp e Outlook aparecem nele.
- **Copiar texto**: cole no WhatsApp ou no e-mail.
- **Baixar CSV**: planilha para Excel, para anexar.
- **Baixar PDF**: abre a janela de impressão. Escolha "Salvar como PDF" e anexe o arquivo.

As notas respeitam a busca e o filtro de status que estão na tela.

## Importante sobre os dados

- Os cadastros ficam **só no aparelho e navegador** onde foram feitos. Celular e computador **não sincronizam sozinhos**.
- Para levar uma conta para outro aparelho: **Minha conta → Exportar conta protegida** e, no outro aparelho,
  **Importar conta protegida** na tela de login (com a mesma senha).
- Se você já usava o arquivo HTML antigo, exporte a conta nele e importe no site: o site começa vazio.
- Faça backups com frequência. Limpar os dados do navegador apaga as contas.

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | O sistema completo |
| `manifest.webmanifest` | Nome, cores e ícones para instalar como app |
| `sw.js` | Permite abrir sem internet |
| `icons/` | Ícones do app (iPhone, Android, computador) |
| `iniciar-site.bat` / `iniciar-site.sh` | Abrem o site em localhost:8000 para usar a IA no computador |
