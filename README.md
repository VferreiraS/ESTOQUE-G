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

## Painel com gráficos
Menu **Painel** (no celular: **Mais → Painel**, ou o botão **Ver painel com gráficos** no início).
- Escolha o período: 7, 14 ou 30 dias.
- Números do topo: rupturas em falta, tempo médio para abastecer (da foto até "Abastecido"), NFs em divergência e tarefas atrasadas (ou produtos que vencem em 7 dias, quando houver controle de validade).
- Gráficos: rupturas em falta por corredor, rupturas abertas × abastecidas por dia, tarefas por pessoa (atrasadas, abertas, concluídas) e notas fiscais por dia e por status.
- Toque (ou passe o mouse) numa barra para ver o número; **Ver como tabela** mostra os valores em lista.
- Tudo em tons de cinza, com hachura para diferenciar as séries.

## Rupturas (fotos para abastecer)

Na aba **Rupturas** (barra de baixo no celular, menu lateral no computador), toque em **📷 Nova ruptura**:

1. Tire a foto da prateleira vazia (**Câmera**) ou escolha da **Galeria**. São até 6 fotos por ruptura.
2. Toque em **🤖 Robô identificar produtos** para o robô olhar a foto e sugerir os produtos em falta. Confira e ajuste o texto.
3. Escolha o **corredor**; o responsável do corredor é preenchido sozinho, e você pode trocar.
4. Toque em **Salvar**.

- As abas **Em falta**, **Abastecidas** e **Todas** mostram quantas há em cada uma. Toque na foto para ver em tela cheia.
- Quando abastecer, toque em **Abastecido** no cartão.
- As fotos ficam **só neste aparelho**, criptografadas. Elas não entram em Exportar backup nem em Exportar conta protegida. Trocar a senha não apaga as fotos.
- **Excluir** uma ruptura apaga as fotos dela.
- O robô que lê a foto usa o **Google Gemini**: configure a chave na página do Robô (**IA → Serviço: Google Gemini**). A foto é enviada ao Google.
- Na página do Robô dá para perguntar "O que falta abastecer?". As rupturas em aberto entram no resumo, só em texto, sem fotos.

## Chat da equipe (com fotos)
Aba **Chat** (no celular fica na barra de baixo; **Planos** foi para o menu **Mais**).
1. O gestor toca em **Criar equipe**. O site gera um código, por exemplo `ABCD-EFGH-JKLM`.
2. Toque em **Convidar** e mande o link pelo WhatsApp. O auxiliar abre o link, entra na conta dele e toca em **Entrar no chat**. Ou ele pode digitar o código em **Chat → Entrar com código**.
3. Mande texto, fotos (📷 câmera ou 🖼 galeria) ou, na janela de uma ruptura, toque em **Enviar no chat**.

Como funciona:
- **Entrega:** as mensagens passam pelo serviço gratuito **ntfy.sh**, sem cadastro.
- **Privacidade:**
  - Tudo é criptografado no aparelho com o código da equipe, então o ntfy.sh só vê texto embaralhado.
  - Quem tem o código lê o chat. Para tirar alguém, crie outra equipe e mande o código novo só para quem fica.
- **Prazo para receber:** com o site aberto, chega em segundos (com aviso no sistema, se os avisos estiverem ligados). Se o site estiver fechado, a mensagem chega quando abrir, desde que dentro de **12 horas**. Fotos ficam no servidor só **3 horas**.
- **Histórico:** as últimas 500 mensagens ficam salvas em cada aparelho.
- **Limite grátis:** cerca de **250 mensagens por dia por internet** (o Wi-Fi da loja conta como uma só). Se aparecer o aviso de limite, use os dados móveis ou espere o dia seguinte.

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

## Contas criadas por outras pessoas

Em **Minha conta → Contas criadas no site** aparece o total de contas criadas em qualquer aparelho e quantas foram criadas no mês. Se você entrar como Site Gestor, o mesmo quadro aparece em **Administração**.

- A contagem começou em 19/10/2026. Contas criadas antes disso, em outros aparelhos, não têm como ser contadas.
- A cada conta nova, chega um e-mail para `ferreiradasilvavitorhugo44@gmail.com` com o nome do estoque, o login, o tipo de conta, a data e o aparelho. Usa o mesmo FormSubmit dos relatórios, então o endereço precisa estar confirmado (Activate Form).
- A tela de criar conta avisa quem cria que esses dados vão para o responsável pelo site. A senha e os cadastros não saem do aparelho.
- O total vem de um contador gratuito e público (Abacus). Serve como acompanhamento, não como número oficial: alguém mal-intencionado poderia somar contas falsas. Os e-mails são o registro confiável.
- Sem internet na hora de criar a conta, o aviso fica guardado no aparelho e é enviado quando o site abrir com internet.

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

## Robô (IA gratuita: Groq ou Google Gemini)

O robô fica numa página própria: **https://vferreiras.github.io/ESTOQUE-G/robo.html**. Abra pelo botão **Conversar com o robô** na Visão geral, tocando no mascote ou pelo item **Robô** do menu. Ela já abre com a sua conta, sem pedir senha de novo. **← Voltar ao estoque** também volta sem senha.

1. Na página do robô, toque em **IA** e escolha o **Serviço**:
   - **Google Gemini**: chave grátis em **https://aistudio.google.com/apikey** (entre com a conta Google → **Create API key**). Costuma funcionar em computadores de empresa com antivírus (ex.: Bitdefender).
   - **Groq**: chave grátis em **https://console.groq.com/keys** (**Create API Key**, começa com `gsk_`).
2. Cole a chave, escolha o modelo e toque em **Testar conexão** e depois em **Salvar**. Cada serviço guarda a sua própria chave.
3. Pergunte, por exemplo: "O que está pendente hoje?", "Quais NFs estão em divergência?", "Tarefas atrasadas".

- Se um modelo sair do ar, o robô escolhe sozinho outro disponível no mesmo serviço.
- Se o antivírus barrar a resposta em partes, o robô passa a pedir a resposta inteira de uma vez. Se o computador bloquear um serviço inteiro, use o outro.
- As chaves ficam criptografadas com a sua conta, só neste aparelho. Se trocar a senha da conta, cole as chaves de novo.
- Os planos gratuitos têm limite de pedidos por minuto e por dia.
- O que vai para o serviço escolhido: a pergunta, as últimas mensagens da conversa e um resumo do estoque (NFs não conferidas, tarefas abertas, equipe, corredores e planos do dia). No plano gratuito do Gemini, o Google pode usar as conversas para melhorar os modelos.
- O robô só lê os dados. Ele não muda nada no estoque.

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
| `robo.html` | Página do robô (conversa com a IA: Groq ou Google Gemini) |
| `manifest.webmanifest` | Nome, cores e ícones para instalar como app |
| `sw.js` | Permite abrir sem internet |
| `icons/` | Ícones do app (iPhone, Android, computador) e o mascote `mascote.png` |
| `vendor/tesseract/` | Leitor de texto em imagens (Tesseract.js, licença Apache 2.0) usado em Ler print de NFs |
