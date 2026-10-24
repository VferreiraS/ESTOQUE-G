# Estoque 99 · Lojas G

Sistema de estoque, planos de ação e notas fiscais que funciona no **computador**, no **iPhone/iPad** e no **Android**.
Tudo roda no navegador; os dados ficam salvos (criptografados) no próprio aparelho.

## Versão 87

- **Selo de raio vermelho:** novo selo verificado em forma de raio vermelho vivo (#FF2A1F), feito de partículas como o S e do mesmo tamanho. Fica parado com Efeitos desligados ou "menos movimento" e pausa fora da tela. Leitor de tela: "Conta verificada".
- **Lista de verificados na nuvem:** o selo agora vem só da coleção `verificados/{uid}` (`tipo: 's' | 'raio'`). Só o administrador grava, com `node scripts/verificar.js <uid> <s|raio> [STK-…]`. O app só lê e guarda uma cópia para usar sem internet.
- **Brecha fechada:** antes, quem pusesse o login `vferreiras` no perfil ganhava o selo. Agora o login não conta mais; vale só o uid da conta.
- Raio gravado para a conta `STK-0091ZHBQ21YE` (leonardo69). Teste novo: `tests/verificados_test.js`.

## Versão 86
- **Consertos:** Plano e Minha conta sem rolagem lateral no iPhone (um nível de cartão só, botões quebram linha); Administração sempre no menu da conta de gestor e, para quem não é gestor, a tela explica o que fazer e tem "Voltar ao início"; "1 atividade" no singular; "Adicionar corredor"; "Usar sem e-mail (conta do PC)".
- **Menos movimento:** o app respeita o pedido do aparelho e abre com Efeitos desligados; quem quiser liga em Minha conta → Preferências.
- **Som, Efeitos e Tema do mês** saíram de cima do conteúdo: no celular ficam em Minha conta → Preferências; no PC, no rodapé da barra lateral.
- **Telas mais limpas:** topo do celular com 56 px (nome da tela + sino com contador); Notas, Corredores, Plano e Equipe com título curto, um botão principal e "Mais ações"; rótulos em letra normal; ícones SVG de uma família só; cartões planos; o número vermelho do Início não compete mais com o botão principal.
- **Cartões 3D no Início:** os 4 resumos inclinam até 8° seguindo o dedo/mouse, com reflexo de luz, e voltam ao soltar. Parados com Efeitos desligados ou menos movimento. O brilho e o pulso infinitos dos cartões e botões saíram; o S de partículas fica no login e no Início.
- **Mais rápido:** leitor de código (ZXing), busca aproximada (Fuse) e calendário (flatpickr, agora escuro) carregam só quando usados (`vendor/`) e ficam guardados pelo service worker para funcionar sem internet; fundo de estrelas numa camada fixa; busca de pessoa/corredor por Map; listas do chat e de NFs desenham só o que aparece; alertas não rodam com o app em segundo plano; leituras repetidas do armazenamento vêm da memória. O `index.html` caiu de 1,17 MB para ~0,76 MB.
- Privacidade e Termos: rolagem suave só sem "menos movimento", foco vermelho igual ao app e títulos-âncora com folga no topo.

## Versão 85
- IA grátis e sem cartão nos agentes do Stok (Minha conta → Agentes de IA).
- **Workers AI (sem chave nenhuma):** crie a conta grátis na Cloudflare → no Stok, abra "☁️ Cloudflare" e toque em **Criar o Worker com 1 toque** → invente a `SENHA` → **Create and deploy** → cole no Stok o endereço `.workers.dev` e a SENHA, deixe "Workers AI (grátis, sem chave)" e toque em Ligar. Modelo: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.
- **Google Gemini (chave grátis):** crie a chave em https://aistudio.google.com/apikey → no Apps Script, Propriedades do script → `GEMINI_API_KEY` = a chave → Implantar → **Nova implantação** → no Stok, em "Qual IA", escolha **Google Gemini (grátis)**. Modelo: `gemini-3.8-flash`.
- NVIDIA e Ollama continuam funcionando. No Worker, `NVIDIA_API_KEY` virou opcional (crie o segredo depois, no painel, só se quiser a NVIDIA).
- Testes com provedores falsos: Gemini no `ia.gs`, Workers AI e NVIDIA no Worker, senha errada (401), CORS e o assistente no navegador.

## Versão 84
- Intro curta (~1,7 s): células de prateleira acendem, um scanner vermelho percorre a cena e as prateleiras se consolidam no S da marca. Sem assets ou chamadas externas.
- Decorativa e não bloqueia o login; efeitos desligados a suprimem, movimento reduzido mostra a marca estática e o som depende das preferências/gesto já desbloqueado.
- Validação: `bash tests/run.sh` concluiu com exit 0 (20 scripts, nenhum `FAIL`), usando os emuladores locais do Firebase.
- Destino do release: branch `claude/mobile-desktop-compatibility-tkbd2w` e workflow GitHub Pages. Esta publicação não inclui deploy separado do Firebase Hosting.

## Versão 83
- Tela de entrar limpa: Login ("Login, @usuário ou e-mail"), Senha com Mostrar, Manter conectado, Entrar e dois links discretos, "Esqueci a senha" e "Criar conta".
- "Esqueci a senha" abre uma folha com as 3 formas de recuperar (pelo e-mail, pelo Authenticator, com o código de recuperação); "Importar conta protegida" fica em "Mais opções".
- Rodapé do login numa linha pequena ("Versão 83 · Privacidade · Termos") e © menor; o botão ♪ não aparece na tela de entrar.
- Licença do leitor de código de barras (ZXing 0.21.3, Apache 2.0) saiu da tela de entrar e foi para Dados e ajuda: resumo em português e texto completo recolhido, com rolagem.
- Fluidez: troca de tela mais curta (transform/opacity, respeita "menos movimento"), toque sem atraso, listeners passivos, timers e animações pausam com o app em segundo plano, sem re-render quando nada mudou.
- Selo verificado de partículas (v81) mais leve: pausa fora da tela e em segundo plano, ~30 quadros/s, desenho agrupado por cor, um só observador do DOM.
- Medido com `tests/perf_probe.js` (iPhone 13, CPU 4x): troca de tela ~123 → ~62 ms; saltos de layout parado 0,13–0,60 → 0; mutações do DOM no Início parado ~7.400 → 0 em 10 s.

## Versão 82
- O cache offline do Stok é limitado aos caches próprios; atualizar o app não apaga dados em cache de outros sites no mesmo domínio.

## Versão 72
- Política de privacidade (`privacidade.html`) e Termos de uso (`termos.html`) conforme a LGPD, com links no login, no rodapé e em Minha conta.
- Aceite obrigatório ("Li e aceito") ao criar conta, criar auxiliar e vincular e-mail; cada formulário começa desmarcado.
- Aviso único sobre o armazenamento no aparelho (sem cookies de rastreamento); na tela de entrar ele fica embaixo do cartão e não cobre o login.
- Acessibilidade e contraste: foco visível, rótulos e Esc fecha avisos.
- Correção do cache offline por página (service worker) e do toque na notificação com as páginas legais abertas.

## Versão 71
- Agente Nuvem pela Cloudflare + NVIDIA (`cloudflare/ia-worker.js`): a chave fica só nos segredos do Worker.
- Corrigido erro do contador do chat logo depois de sair da conta.

## Versão 70
- Agente Nuvem pode usar a NVIDIA (Nemotron) pelo intermediário do Google (`apps-script/ia.gs`, propriedade `NVIDIA_API_KEY`). A chave fica só no Apps Script.

## Versão 69
- Conta já criada pode virar a conta do PC (sem e-mail) pelo aviso "Vincule seu e-mail" ou em Minha conta. Só uma conta por aparelho.

## Versão 68
- Esqueci a senha com a conta aberta (Manter conectado): troca a senha pelo e-mail sem perder dados e religa a nuvem.

## Versão 67
- Conta do PC entra na nuvem com um e-mail interno automático (sem digitar e-mail): vê os perfis da equipe e o selo azul.
- Chat encerrado pelo administrador (`encerradas/{loja}`) some dos aparelhos e o app sai da equipe.

## Versão 55
- Equipe: toda conta criada (mesmo sem e-mail confirmado) e todo perfil da equipe entram sozinhos na aba Equipe, ligados ao convite; recebem os corredores sem responsável. Funciona em qualquer aparelho de gestor.

## Versão 54
- Animação única por conta: os agentes criam o tema (entrada na tela, velocidade do brilho e do pulso, tom das partículas, anel da foto). Sem IA, é uma combinação única da conta. Na tela Agentes: "Pedir outra animação".
- Som da abertura no celular: o navegador do iPhone/Android dizia que o som estava liberado, mas ficava mudo até o primeiro toque. Agora, sem toque ainda, aparece "Toque para abrir" e o som toca junto com a animação.

## Versão 53
- Piloto automático dos agentes (tela ✨ Agentes): acham erros de todos os aparelhos e verificam os dados; mandam bom dia no chat marcando cada pessoa; aviso personalizado no celular (ntfy); e-mail personalizado por dia (fila do robô); lembrete de atraso para o responsável. Cada ação tem chave liga/desliga e fica registrada.
- Sem IA configurada, os agentes usam textos prontos.
- O robô diário também lê os erros dos aparelhos (`node tests/robo_correio.js`).

## Versão 52
- Dois agentes de IA dentro do site (sem chatbot): Agente Local (Ollama, no PC, privado e grátis) e Agente Nuvem (OmniRoute, em qualquer aparelho). O site tenta o Local e, se não responder, usa a Nuvem.
- Funções: resumo do dia no Início; ✨ Sugerir atividades no plano (já com responsável); ✨ O que fazer primeiro (Alertas); ✨ Analisar NFs pendentes; ✨ melhorar o texto no chat; ✨ Resumir a conversa.
- Configuração em Minha conta → Agentes de IA (endereço, modelo e chave), cifrada só no aparelho.

## Versão 51
- Robô e IA removidos: sem página Robô, sem item no menu, sem botão "Conversar com o robô" e sem mascote no login e no Início. O endereço robo.html só leva para o app.

## Versão 50
- Perfil no celular: a capa não cobre mais o nome nem a foto; o nome fica inteiro abaixo da capa (como no Instagram).
- Avisos na tela ("Perfil salvo", "Sincronizando"): fundo escuro, texto legível.
- Arrastar para atualizar: se houver versão nova, o app recarrega já com ela.

## Versão 49
- Perfis: a mesma pessoa não aparece mais duas vezes (Equipe + perfil ficam ligados pelo login); animações na tela de perfil (entrada, brilho, anel no avatar); selo azul de verificado só na conta do Vitor.
- Chat (ideias do WhatsApp, Instagram e Facebook): "fulano está digitando…", "✓✓ Visto por", reações (segurar a mensagem ou botão direito; dois toques = ❤️), mensagem fixada no topo, @menções com sugestões, encaminhar.
- Contas com e-mail confirmado entram sozinhas na Equipe (ligadas ao convite) e recebem os corredores sem responsável; botão "Distribuir corredores" em Corredores.
- Atividades do plano, NFs e corredores: botão 💬 Encaminhar no chat, marcando o responsável.
- Avisos com o app fechado, grátis: app ntfy (Android/iPhone) ou ntfy.sh/app no PC, com canal pessoal (marcações, respostas, tarefas novas, reações) e canal da equipe. Na tela Conta e no passo "Ativar no aparelho".

## Versão 48
- Chat: responder uma mensagem específica, como no WhatsApp. No celular, arraste a mensagem para a direita; no PC, passe o mouse e toque em ↩ (ou dê dois cliques). A citação aparece em cima da resposta; tocar nela leva até a mensagem original.
- Nuvem: sem internet, o aviso "Vincule seu e-mail" não aparece mais (tenta de novo depois).

## Versão 47
- Contas com e-mail na nuvem (Firebase): cada pessoa entra com o próprio e-mail; o Firebase manda o e-mail de confirmação.
- Contas antigas e convites já enviados: no próximo login aparece "Vincule seu e-mail" (uma vez).
- Convite de auxiliar pode ir por e-mail; o e-mail já vem preenchido na criação da conta.
- Status dos convites ("✓ Conta criada", e-mail confirmado) e perfis chegam pela nuvem, mesmo com o celular fechado.
- Passo "Ativar no aparelho": notificações, som e câmera (também na tela Conta).
- Resumo diário de cada auxiliar (atividades e corredores) vai para a fila `correio`; o robô diário envia por e-mail.
- Testes em `tests/` (`bash tests/run.sh`, com emulador do Firebase).
- Site também no Firebase Hosting: https://gen-lang-client-0167474823-295e1.web.app

## Versão 46
- Nuvem (Firebase): os perfis de todas as contas da loja ficam no mesmo lugar e aparecem em todos os aparelhos; contas antigas sobem sozinhas ao abrir o app.

## Versão 45
- Abertura: se o aparelho bloquear o som, aparece "Toque para abrir" e o som toca junto com a animação, sem atraso.

## Versão 44
- Perfil do celular aparece no PC mesmo depois que o anexo expira (nome, @ e cargo); a foto é pedida de novo ao celular.

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

O site usa só preto, branco e cinza, no tema escuro.

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

## Abertura

- Ao abrir o app (uma vez por sessão) e ao entrar na conta: o S da Stok se desenha em vermelho, acende com o nome STOK e entra na tela, com um som de entrada (duas batidas graves e um acorde), sintetizado no próprio app. O som segue o botão de som; a animação segue o botão Efeitos. No iPhone o som só toca depois de um toque na tela (regra do aparelho).

## Animações

- Em todas as telas: brilho de vidro passando pelos cartões de tempos em tempos, pulso vermelho nos botões principais, na palavra vermelha do título e no menu ativo, o S de partículas no topo de cada tela e entrada animada dos cartões ao trocar de tela.
- O botão **Efeitos: desligados** para tudo.

## Puxar para atualizar (celular)

- No topo de qualquer tela, arraste para baixo e solte: aparece a bolinha que gira e o app sincroniza a equipe, procura versão nova do site e redesenha a tela.

## Conta de auxiliar pronta de uma vez

- Em Chat → Contas dos auxiliares, escolha a pessoa da Equipe (ex.: Leonardo) e toque em Criar conta e enviar link.
- O auxiliar abre o link, digita o código do convite e cria a própria senha. A conta já nasce com login, chat, equipe sincronizada e perfil (nome, @usuário e cargo da Equipe). Os corredores e atividades dele já aparecem.

## Corredores dos cartazes

- Em **Corredores → Cadastrar corredores dos cartazes (15)**, o app cadastra os 15 corredores dos cartazes impressos (01 a 14 e o Novo setor), com setor, linha de produtos e responsável (Leonardo, Thomaz DSL, Augusto, TODOS no 13). Corredor que já existe com o mesmo número é atualizado e mantém as ligações. Só gestor e conta do estoque veem o botão.

## Planilha no Google

O app pode manter uma planilha do Google Sheets sempre atualizada com planos, atividades, NFs, corredores e equipe (sem fotos).

1. Crie uma planilha no Google Sheets.
2. Abra **Extensões → Apps Script**, apague o que estiver lá e cole o arquivo [`apps-script/planilha.gs`](apps-script/planilha.gs).
3. Troque `COLE_AQUI_A_SENHA` por uma senha só sua (8 caracteres ou mais) e salve.
4. **Implantar → Nova implantação → App da Web**. Executar como: Eu. Quem pode acessar: Qualquer pessoa. Autorize.
5. Copie o URL do app da Web (termina em `/exec`).
6. No app: **Dados e ajuda → Planilha no Google**, cole o URL e a mesma senha e toque em **Salvar e enviar agora**.

- A cada mudança, o app manda uma cópia completa (no máximo a cada 2 minutos). Só gestor e conta do estoque enviam; auxiliar não.
- O endereço e a senha ficam cifrados com a senha da conta. **Na planilha, os dados ficam sem cifra.**
- A aba **Atualizado** mostra cada envio: quando, de qual conta e aparelho, e quantos itens.

## Apagar tudo e começar de novo

- Em **Dados e ajuda → Apagar tudo neste aparelho**, digite APAGAR. O aparelho apaga todas as contas, a equipe, planos, NFs, corredores, pessoas, perfis e chats. Mantém só o tema, os efeitos, o sazonal e o som.
- Não apaga nada nos outros aparelhos: no celular e no PC, cada um precisa ser limpo.

## Logo e atualização

- Os ícones do app têm nome novo (`-v36`), para o navegador não reaproveitar o ícone antigo do cache.
- Se o PC ainda mostrar a versão antiga, feche todas as abas do site, abra de novo e atualize (Ctrl+F5). A versão aparece no rodapé do login, em Dados e ajuda e em Minha conta.

## Itens repetidos

- Quando dois aparelhos juntam os dados na mesma equipe, o mesmo corredor, pessoa, NF ou plano pode ficar duas vezes. O Início avisa o gestor ("Encontrei N itens repetidos").
- Em **Revisar** (ou em Dados e ajuda → Procurar repetidos), o site mostra a lista e **Juntar repetidos** deixa um de cada: o mais completo. As ligações (dono do corredor, responsável da NF) passam para o que fica, e as atividades dos planos se juntam sem perder o que já foi feito. A limpeza vai para toda a equipe.
- A mesma conta aberta em dois aparelhos aparece como uma pessoa só no Perfil e na lista de aparelhos. A conta do PC do estoque (login Estoque 99) aparece como **Computador do estoque**.

## Perfis

- Se o PC e o celular mostram pessoas diferentes, abra **Chat → Diagnóstico da equipe**. Compare os números nos dois aparelhos. Em **Enviar tudo para a equipe agora** (só gestor), o aparelho reenvia todas as pessoas, corredores, NFs e planos, inclusive os que nunca tinham saído dele.

- Se você muda o perfil no celular, o PC com a mesma conta recebe a mudança sozinho (foto, nome, @usuário, cargo e recado). Pessoas que entram depois na equipe também recebem os perfis dos outros pelos aparelhos que já estão com o site aberto.

- Toda conta (gestor, estoque e auxiliar) tem um perfil em **Perfil** no menu: foto, capa, nome, **@usuário** (único na equipe), cargo e recado.
- Toque em **Editar perfil** para trocar foto e capa (a imagem é recortada e reduzida no próprio aparelho) e os textos. O nome do perfil também é o nome usado no chat e em "feita por".
- A foto aparece nas mensagens do chat, nos cartões da Equipe, em "feita por" no plano e no botão Minha conta. Tocar numa foto ou nome abre o perfil da pessoa, com as atividades feitas nos últimos 30 dias.
- Os perfis vão para a equipe pelo mesmo canal cifrado da sincronização. Quem entra depois recebe os perfis quando os outros aparelhos estiverem com o site aberto.

## Marca

- A logo agora é o **S da Stok** (vermelho). Ícones do app, favicon e partículas do Início e do login usam o novo símbolo.

## Visual escuro

- O site e o app têm só o tema escuro (preto). O botão de modo claro foi removido.
- Os efeitos seguem o botão **Efeitos: ligados/desligados** do site, mesmo quando o Windows está com as animações desligadas (com isso, o movimento fica mais calmo).
- O site abre no tema escuro: fundo preto estrelado, títulos grandes em Oswald (fonte livre, em `vendor/fonts`) e o "S" da Stok feito de partículas vermelhas no login e no Início.
- Detalhes em vermelho com brilho: palavra final dos títulos, botões principais, item ativo do menu (em pílula) e o primeiro cartão do Início. Cartões de vidro translúcido e bolhas de luz vermelha no fundo.
- O "G" gira devagar e se afasta do dedo ou do mouse. Ele pausa quando sai da tela ou o app fica em segundo plano, e fica parado se o aparelho pede menos movimento.

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
