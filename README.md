# Estoque 99 · Lojas G

Sistema de estoque, planos de ação e notas fiscais que funciona no **computador**, no **iPhone/iPad** e no **Android**.
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
Menu **Painel** (no celular: **Mais → Painel**, ou **Ver painel com gráficos** no início). Período de 7, 14 ou 30 dias.
- **Números do topo:** atividades de hoje feitas, % de atividades feitas no período, NFs aguardando e NFs em divergência.
- **Gráficos:** atividades por responsável, atividades por dia (feitas e a fazer), notas fiscais por dia e notas por status.
- **Detalhes:** toque numa barra para ver o número; **Ver como tabela** mostra os valores em lista.

## Plano de ação (lugar das antigas Tarefas e Rupturas)
As abas **Tarefas**, **Rupturas** e **Validade** saíram do site.
- **Dados antigos:** os que existiam foram apagados ao entrar na versão nova.
- **Onde aparece:**
  - na barra do celular, em **Plano**;
  - no Início ("Plano de ação de hoje");
  - na Agenda.
- **Marcar como feita:** toque no círculo de uma atividade. Fica registrado quem fez e a hora. Toque de novo para desmarcar.
- **Horário (opcional):** no editor do plano, preencha "Até que horas?". Se a atividade não for marcada como feita até lá, ela ganha a etiqueta **Atrasada**, entra na central de alertas (e no aviso do aparelho) e no aviso diário do app ntfy.

## Importar mapa de corredores (Excel)
Em **Corredores**, toque em **⇪ Importar mapa (Excel)** e escolha a planilha (.xlsx ou .csv). Ela precisa ter as colunas **Corredor**, **Setor** e **Responsável**.
- **Prévia:** antes de aplicar, mostra o que muda (por exemplo "A definir → Leonardo"), os corredores novos e as pessoas que ainda não estão na Equipe (são cadastradas automaticamente).
- **Responsável:** "A definir" deixa sem responsável; "TODOS" (mesmo com texto entre parênteses) vira atividade coletiva.
- **Corredores fora da planilha:** continuam como estão.
- **Se a equipe mudar enquanto a prévia está aberta,** nada é aplicado: importe de novo.
- **Leitura no aparelho:** a planilha é lida no próprio aparelho. Com a equipe sincronizada, o mapa novo vai para todos.

## Contas dos auxiliares
No **Chat**, quem criou a equipe vê **Contas dos auxiliares**.
1. Informe o nome do auxiliar. O site cria um **código do convite** aleatório (ex.: `7K2QP-M9XRA`), que aparece na lista até a conta ser criada.
2. Toque em **Criar conta e enviar link** e mande o link pelo WhatsApp. Passe o código do convite por fora (ligação ou pessoalmente).
3. O auxiliar abre o link no celular dele, digita o código do convite, escolhe a própria senha e guarda o código de recuperação. Ele já entra na equipe com os dados sincronizados.

O que a conta de auxiliar faz:
- **Vê:** Início, Plano de ação, Notas fiscais e Chat.
- **Pode:** marcar atividades como feitas, bipar e conferir NFs e conversar no chat.
- **Não pode:**
  - criar ou apagar planos nem apagar cadastros;
  - mexer em equipe, corredores, painel, alertas, backup, robô e administração;
  - sair da equipe.
- **Mudanças de equipe e corredores** que venham de um auxiliar são ignoradas pelos outros aparelhos.
- **Para tirar o acesso de alguém**, crie uma equipe nova e convide só quem fica. Quem tem o código da equipe consegue ler os dados.

- **Quem já criou a conta:** em **Chat → Contas dos auxiliares**, cada convite mostra **✓ Conta criada em dd/mm · login · ativo há X**, ou **○ Ainda não criou a conta**. Embaixo aparecem os outros aparelhos que estão na equipe. O status chega pela equipe sincronizada quando o aparelho do auxiliar tem internet.
## Chat da equipe (com fotos)
Aba **Chat** (no celular fica na barra de baixo; **Planos** foi para o menu **Mais**).
1. O gestor toca em **Criar equipe**. O site gera um código, por exemplo `ABCD-EFGH-JKLM`.
2. Toque em **Convidar** e mande o link pelo WhatsApp. O auxiliar abre o link, entra na conta dele e toca em **Entrar no chat**. Ou ele pode digitar o código em **Chat → Entrar com código**.
3. Mande texto ou fotos (📷 câmera ou 🖼 galeria).
4. **Áudio:** toque no microfone, fale e toque em **Enviar áudio** (ou **Cancelar**). Máximo de 2 minutos por áudio. Na primeira vez o navegador pede permissão para usar o microfone.

Como funciona:
- **Entrega:** as mensagens passam pelo serviço gratuito **ntfy.sh**, sem cadastro.
- **Privacidade:**
  - Tudo é criptografado no aparelho com o código da equipe, então o ntfy.sh só vê texto embaralhado.
  - Quem tem o código lê o chat. Para tirar alguém, crie outra equipe e mande o código novo só para quem fica.
- **Áudio:** gravado em formato que toca no iPhone, Android e computador sempre que o aparelho permite. Se um áudio vier num formato que o aparelho não toca, aparece um aviso.
- **Prazo para receber:** com o site aberto, chega em segundos (com aviso no sistema, se os avisos estiverem ligados). Se o site estiver fechado, a mensagem chega quando abrir, desde que dentro de **12 horas**. Fotos ficam no servidor só **3 horas**.
- **Histórico:** as últimas 500 mensagens ficam salvas em cada aparelho.
- **Limite grátis:** cerca de **250 mensagens por dia por internet** (o Wi-Fi da loja conta como uma só). Se aparecer o aviso de limite, use os dados móveis ou espere o dia seguinte.

## Equipe sincronizada (dados em todos os aparelhos)
Usa a mesma equipe do **Chat**. Com ela ligada, **notas fiscais, planos de ação, equipe e corredores** ficam iguais em todos os aparelhos: quando a auxiliar marca uma atividade como feita no celular, você vê no computador em segundos.
- **Quem cria a equipe** já começa compartilhando os dados do aparelho dele.
- **Quem entra** escolhe:
  - **Usar só os dados da equipe neste aparelho** (marcado por padrão): os cadastros do aparelho são trocados pelos da equipe;
  - ou desmarca para **juntar** o que já tem com os da equipe.
- Na tela do **Chat**, toque na linha **Equipe sincronizada** para:
  - ligar ou desligar o compartilhamento neste aparelho;
  - tocar em **Sincronizar agora**;
  - ver as **últimas mudanças da equipe** ("Ana fez “Repor arroz”", "Leo mudou a NF 123 para Conferido").
- O rodapé do site mostra "Equipe sincronizada · há 1 min".

Como funciona:
- **Envio:** cada mudança vai cifrada com o código da equipe pelo ntfy.sh. Várias gravações em sequência viram uma mensagem só.
- **Edições ao mesmo tempo:** se duas pessoas editarem o mesmo item, vale a última edição.
- **Validação:** mudanças inválidas são recusadas.
- **Quem ficou fora:** se ficou mais de 10 horas fora (ou é novo na equipe), o aparelho pede uma cópia completa a quem estiver com o site aberto. Anexos grandes ficam no servidor por 3 horas.
- **O que não vai para a equipe:** alertas, planos, senha e chaves do robô.
- **Permissões:** todos da equipe podem editar e apagar. Para tirar alguém, crie uma equipe nova.
- **Limite:** chat e dados somados contam no limite grátis de cerca de 250 envios por dia por internet.

## Status das notas fiscais

Cada NF tem um de quatro status: **Pendente**, **Em conferência**, **Conferido** e **Em divergência**.

- No topo da lista há abas para ver as notas de cada status, com a quantidade em cada uma.
- Em cada nota, os botões **Em conferência**, **Conferido** e **Em divergência** mudam o status com um toque.
- **Em divergência** pede uma descrição (falta, sobra, avaria ou item incorreto).
- **Conferido** pede confirmação se a nota tiver itens do XML ainda não contados ou com diferença.
- Notas salvas antes desta versão como "Concluída" viram **Conferido**, e "Divergência" vira **Em divergência**.

## Relatório por e-mail

Em **Alertas → Relatório por e-mail**, confira o endereço (já vem `ferreiradasilvavitorhugo44@gmail.com`) e a **Cópia para** (já vem `99.estoque@lojasg.com.br`; aceita até 5 e-mails separados por vírgula), escolha os horários (8h e 18h) e toque em **Ativar envio automático**.

- O relatório traz NFs a conferir, NFs em divergência e as atividades do plano de hoje que faltam fazer.
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
3. Pergunte, por exemplo: "O que falta do plano de hoje?", "Quais NFs estão em divergência?".

- Se um modelo sair do ar, o robô escolhe sozinho outro disponível no mesmo serviço.
- Se o antivírus barrar a resposta em partes, o robô passa a pedir a resposta inteira de uma vez. Se o computador bloquear um serviço inteiro, use o outro.
- As chaves ficam criptografadas com a sua conta, só neste aparelho. Se trocar a senha da conta, cole as chaves de novo.
- Os planos gratuitos têm limite de pedidos por minuto e por dia.
- O que vai para o serviço escolhido: a pergunta, as últimas mensagens da conversa e um resumo do estoque (NFs não conferidas, planos de ação, equipe e corredores). No plano gratuito do Gemini, o Google pode usar as conversas para melhorar os modelos.
- O robô só lê os dados. Ele não muda nada no estoque.

## Mascote

O robô do estoque aparece na tela de login e na Visão geral, em tons de cinza como o resto do site.

## Perfis

- Toda conta (gestor, estoque e auxiliar) tem um perfil em **Perfil** no menu: foto, capa, nome, **@usuário** (único na equipe), cargo e recado.
- Toque em **Editar perfil** para trocar foto e capa (a imagem é recortada e reduzida no próprio aparelho) e os textos. O nome do perfil também é o nome usado no chat e em "feita por".
- A foto aparece nas mensagens do chat, nos cartões da Equipe, em "feita por" no plano e no botão Minha conta. Tocar numa foto ou nome abre o perfil da pessoa, com as atividades feitas nos últimos 30 dias.
- Os perfis vão para a equipe pelo mesmo canal cifrado da sincronização. Quem entra depois recebe os perfis quando os outros aparelhos estiverem com o site aberto.

## Marca

- A logo agora é o **S da Stok** (vermelho). Ícones do app, favicon e partículas do Início e do login usam o novo símbolo.

## Visual escuro

- O site abre no tema escuro: fundo preto estrelado, títulos grandes em Oswald (fonte livre, em `vendor/fonts`) e o "S" da Stok feito de partículas vermelhas no login e no Início.
- Detalhes em vermelho com brilho: palavra final dos títulos, botões principais, item ativo do menu (em pílula) e o primeiro cartão do Início. Cartões de vidro translúcido e bolhas de luz vermelha no fundo.
- O "G" gira devagar e se afasta do dedo ou do mouse. Ele pausa quando sai da tela ou o app fica em segundo plano, e fica parado se o aparelho pede menos movimento.
- O botão de tema volta para o modo claro, que continua em preto e branco e sem partículas.

## Tema sazonal

O logo ganha um ornamento em cinza conforme o mês do aparelho: janeiro (verão), fevereiro (carnaval), março (outono), abril (Páscoa), maio (flores), junho (festa junina), julho (inverno), agosto (Dia dos Pais), setembro (primavera), outubro (Dia das Bruxas), novembro (Consciência Negra) e dezembro (Natal).

- O botão **Sazonal** (no canto inferior) liga ou desliga o ornamento neste aparelho.
- Quem já instalou o app na tela inicial mantém o ícone instalado. O ícone só muda ao reinstalar.

## Compartilhar relatórios

Em cada aba com lista (Notas fiscais, Agenda, Equipe, Corredores e Planos de ação) há um botão **Compartilhar ↗**. Ele gera o relatório do grupo escolhido: **Pendentes**, **Concluídas** (nas notas, **Conferidas**) ou **Todas**.

- **Enviar**: no celular, abre o menu de compartilhamento com texto e planilha CSV. WhatsApp e Outlook aparecem nele.
- **Copiar texto**: cole no WhatsApp ou no e-mail.
- **Baixar CSV**: planilha para Excel, para anexar.
- **Baixar PDF**: abre a janela de impressão. Escolha "Salvar como PDF" e anexe o arquivo.

As notas respeitam a busca e a aba de status que estão na tela.

## Notificações
- **Com o site aberto ou em segundo plano:** em **Alertas**, ative os avisos no aparelho. As mensagens do chat e as NFs atrasadas aparecem como notificação do sistema. No iPhone, isso só funciona com o site **instalado na Tela de Início** (Safari → Compartilhar → Adicionar à Tela de Início) e aberto por lá, com iOS 16.4 ou mais novo. No Safari comum, o iPhone não mostra notificação de site.
- **Com o app fechado ou o celular bloqueado:** o site sozinho não consegue avisar, então usamos o app gratuito **ntfy**.
  1. Instale o ntfy (iPhone ou Android).
  2. Em **Alertas → Avisos com o app fechado**, toque em **Assinar avisos da equipe** (ou copie o canal e cole no app).
  3. Chegam avisos curtos de **mensagem nova no chat** (no máximo 1 a cada 2 minutos por pessoa) e, uma vez por dia a partir das 8h, de **NFs aguardando conferência**. O aviso de NF sai quando algum aparelho da equipe abre o site no dia.
- **Relatórios por e-mail:** o FormSubmit só envia depois que o formulário é ativado. Abra o e-mail "Activate Form" do FormSubmit na caixa do destinatário principal (veja também o spam) e clique no link. A cópia para o e-mail do estoque só sai depois disso. Se não chegar, peça à TI para liberar o remetente formsubmit.co.

## Atualizações do site
- **Quando procura:** o site procura versão nova ao abrir, ao voltar para o app (inclusive o instalado na tela inicial do iPhone), quando a internet volta e a cada 30 minutos.
- **Recarga:** se nada estiver sendo editado, a página se atualiza sozinha e continua na conta, sem pedir senha. Se houver algo aberto (rascunho de plano, mensagem digitada, código de recuperação na tela…), aparece a barra **Nova versão do site pronta · Atualizar agora**.
- **Internet lenta:** o site abre a cópia salva em até 6 segundos, termina de baixar a versão nova em segundo plano e então atualiza.
- **Conferir a versão:** em **Mais** (ou **Minha conta**) → **↻ Procurar atualização · versão N**.
- **Se um aparelho ainda tiver uma versão anterior à 24:** feche o app de vez (arraste para cima) e abra de novo; no Safari, puxe a página para baixo para recarregar. Depois disso as atualizações chegam sozinhas.

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
