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

## Ler print de NFs pendentes

Na aba **Notas fiscais**, toque em **Ler print de NFs** e escolha o print da planilha (colunas Núm NF, Fornecedor e Data de chegada).

- A leitura acontece no próprio aparelho, sem enviar a imagem para fora. Na primeira vez o app baixa cerca de 5 MB do leitor; depois funciona sem internet.
- Antes de salvar, confira a tabela: dá para corrigir número, fornecedor e data, e desmarcar linhas.
- NFs que já existem aparecem como **Já cadastrada** e ficam desmarcadas.
- As notas entram como **Pendentes**, com a data de chegada lida.
- Fornecedores corrigidos uma vez são reconhecidos nos próximos prints.
- Funciona pelo endereço do site (https). Abrindo o `index.html` direto do computador, o leitor não carrega.

## Bipar NF

Em **Notas fiscais → Bipar NF**, use o leitor USB, a câmera ou cole a chave de 44 dígitos.

- Se a NF já estiver na lista (por exemplo, veio do print de pendentes), o app abre essa NF, mantém fornecedor, data e volumes e acrescenta a chave. Não cria nota repetida.
- Se a chave já estiver salva, abre a NF com os dados salvos.
- O código de barras não traz volumes. Eles vêm do XML, da NF já cadastrada ou da contagem na chegada.

## Status das notas fiscais

Cada NF tem um de quatro status: **Pendente**, **Em conferência**, **Conferido** e **Em divergência**.

- No topo da lista há abas para ver as notas de cada status, com a quantidade em cada uma.
- Em cada nota, os botões **Em conferência**, **Conferido** e **Em divergência** mudam o status com um toque.
- **Em divergência** pede uma descrição (falta, sobra, avaria ou item incorreto).
- **Conferido** pede confirmação se a nota tiver itens do XML ainda não contados ou com diferença.
- Notas salvas antes desta versão como "Concluída" viram **Conferido**, e "Divergência" vira **Em divergência**.

## Relatório por e-mail

Em **Alertas → Relatório por e-mail**, confira o endereço (já vem `ferreiradasilvavitorhugo44@gmail.com`) e a **Cópia para** (já vem `99.estoque@lojasg.com.br`; aceita até 5 e-mails separados por vírgula), escolha os horários (8h e 18h) e toque em **Ativar envio automático**.

- O relatório traz NFs a conferir, NFs em divergência, tarefas atrasadas e tarefas de hoje.
- O envio é feito pelo serviço gratuito FormSubmit. O conteúdo do relatório passa por ele.
- **Na primeira vez**, chega um e-mail do FormSubmit no endereço principal: abra e clique em **Activate Form**. Os endereços em cópia não precisam confirmar. Depois disso os relatórios chegam normalmente. Use **Enviar teste agora** para disparar esse primeiro e-mail.
- Só envia com o site aberto e a conta aberta (pode estar minimizado) em algum aparelho no horário. Se o aparelho estava desligado, envia quando abrir, até 4 horas depois do horário.

## Avisos no computador e manter conectado

- Em **Alertas**, toque em **Permitir notificações no computador**. Os avisos aparecem no canto da tela do Windows mesmo usando outros programas, enquanto o site estiver aberto (pode estar minimizado).
- **Manter conectado neste aparelho** (caixa na tela de login ou em **Minha conta**): o site abre a conta sem pedir senha neste aparelho. Vem marcada no computador. **Sair** desliga.
- Para receber avisos e e-mails sem abrir o site: instale o app pelo ícone na barra do Chrome ou Edge e ative **Iniciar ao fazer login** em `chrome://apps` ou `edge://apps`.
- Com o navegador totalmente fechado, nada é enviado: os dados ficam só no aparelho e o site não tem servidor.

## Senha

A senha tem de 4 a 8 números, sem letras nem símbolos. Contas antigas continuam entrando com a senha que já têm; a regra vale ao criar a conta ou trocar a senha.

## Esqueci a senha

Ao criar a conta, o app mostra um **código de recuperação** de 24 caracteres. Ele aparece uma vez. Para entrar, digite os 4 últimos caracteres do código ou baixe o arquivo `.txt`. Assim o código fica guardado de verdade.

- **Com o código:** na tela de login, toque em **Esqueci a senha**, informe o login, o código e a nova senha. Os cadastros continuam os mesmos.
- **Com Face ID / digital:** em **Minha conta → Face ID / digital**, confirme a senha e ative. Depois dá para:
  - tocar em **Entrar com Face ID / digital** no login;
  - em **Esqueci a senha**, tocar em **Usar Face ID / digital no lugar do código**. O app cria uma senha nova e um código novo.
  - Funciona no iPhone/iPad (iOS 18 ou mais novo), no Android com Chrome e no Windows com Windows Hello. Onde não houver suporte, a opção não aparece.
  - Vale só no aparelho onde foi ativado. Trocar a senha (ou recuperar pelo código) desliga o Face ID / digital; é só ativar de novo.
- Contas criadas antes do código de recuperação: entre com a senha, vá em **Minha conta** e gere um código em **Recuperação de acesso**.
- Trocar a senha gera um novo código, e o anterior deixa de valer.

### Sem senha, sem código e sem Face ID / digital

A conta não pode ser aberta: os cadastros ficam criptografados com a senha, e nem quem fez o site consegue abrir. O que ainda dá para fazer:

1. Procure a senha salva no navegador (iPhone: app **Senhas**; Chrome: **Gerenciador de senhas**).
2. Procure o arquivo `codigo-recuperacao-estoque99.txt` em Downloads ou no app Arquivos.
3. Se a conta ainda estiver aberta em algum aparelho, vá em **Dados e ajuda → Exportar backup**.
4. Com um backup (`Estoque-99-backup-….json`): crie uma conta nova e use **Dados e ajuda → Restaurar backup**.

## Visual em preto e branco

O site usa só preto, branco e cinza, no tema claro e no escuro.

A animação de entrada aparece ao abrir o site e ao sair da conta. Em computadores com "reduzir animações" ligado, ela aparece numa versão suave. O botão **Efeitos** desliga a animação neste navegador.

## Robô (Groq, IA gratuita)

O robô fica numa página própria: **https://vferreiras.github.io/ESTOQUE-G/robo.html**. Abra pelo botão **Conversar com o robô** na Visão geral, tocando no mascote ou pelo item **Robô** do menu. Ela já abre com a sua conta, sem pedir senha de novo. **← Voltar ao estoque** também volta sem senha.

1. Crie uma chave grátis do Groq: entre em **https://console.groq.com/keys** (pode entrar com a conta Google), toque em **Create API Key** e copie a chave (começa com `gsk_`).
2. Na página do robô, toque em **Groq**, cole a chave, escolha o modelo e toque em **Testar conexão** e depois em **Salvar**.
   - **GPT-OSS 120B**: respostas melhores (padrão).
   - **GPT-OSS 20B**: mais rápido.
   - Se o Groq tirar um modelo do ar, o robô escolhe sozinho outro disponível.
3. Pergunte, por exemplo: "O que está pendente hoje?", "Quais NFs estão em divergência?", "Tarefas atrasadas".

- A chave fica criptografada com a sua conta, só neste aparelho. Se trocar a senha da conta, cole a chave de novo.
- O plano gratuito do Groq tem limite de pedidos por minuto e por dia. Se aparecer "Limite gratuito do Groq atingido", espere um pouco ou use o modelo 20B.
- O que vai para o Groq: a pergunta, as últimas mensagens da conversa e um resumo do estoque (NFs não conferidas, tarefas abertas, equipe, corredores e planos do dia).
- O robô só lê os dados. Ele não muda nada no estoque.
- **Antivírus (Bitdefender e outros):** se o antivírus barrar a resposta em partes, o robô passa a pedir a resposta inteira de uma vez. Se ainda assim não conectar, adicione `api.groq.com` e `vferreiras.github.io` às exceções da proteção da web do antivírus.

## Mascote

O robô do estoque aparece na tela de login e na Visão geral, em tons de cinza como o resto do site.

## Tema sazonal

O logo ganha um ornamento em cinza conforme o mês do aparelho: janeiro (verão), fevereiro (carnaval), março (outono), abril (Páscoa), maio (flores), junho (festa junina), julho (inverno), agosto (Dia dos Pais), setembro (primavera), outubro (Dia das Bruxas), novembro (Consciência Negra) e dezembro (Natal).

- O botão **Sazonal** (no canto inferior) liga ou desliga o ornamento neste aparelho.
- Quem já instalou o app na tela inicial mantém o ícone instalado. O ícone só muda ao reinstalar.

## Compartilhar relatórios

Em cada aba com lista (Notas fiscais, Tarefas, Agenda, Equipe, Corredores e Planos de ação) há um botão **Compartilhar ↗**. Ele gera o relatório do grupo escolhido: **Pendentes**, **Concluídas** (nas notas, **Conferidas**) ou **Todas**.

- **Enviar**: no celular, abre o menu de compartilhamento com texto e planilha CSV. WhatsApp e Outlook aparecem nele.
- **Copiar texto**: cole no WhatsApp ou no e-mail.
- **Baixar CSV**: planilha para Excel, para anexar.
- **Baixar PDF**: abre a janela de impressão. Escolha "Salvar como PDF" e anexe o arquivo.

As notas respeitam a busca e a aba de status que estão na tela.

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
| `robo.html` | Página do robô (conversa com a IA do Groq) |
| `manifest.webmanifest` | Nome, cores e ícones para instalar como app |
| `sw.js` | Permite abrir sem internet |
| `icons/` | Ícones do app (iPhone, Android, computador) e o mascote `mascote.png` |
| `vendor/tesseract/` | Leitor de texto em imagens (Tesseract.js, licença Apache 2.0) usado em Ler print de NFs |
