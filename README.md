# Stok · Estoque 99 (Lojas G)

App web de estoque das Lojas G: notas fiscais, conferência de volumes pela câmera, plano de ação, corredores, equipe, alertas de prazo e chat da equipe.
Funciona no **computador**, no **iPhone/iPad** e no **Android**, inclusive sem internet, e pode ser instalado na tela inicial.

- **No ar:** https://vferreiras.github.io/ESTOQUE-G/
- **Versão atual:** 128 (acabamento: textos, ícones, plural, telas vazias e toques de 44 px no celular).

## Como funciona

- **Contas no aparelho.** Cada conta fica salva e cifrada no próprio navegador (AES-GCM + PBKDF2). Não há servidor central de estoque.
- **Contas só pelo gestor.** O dono faz o "Primeiro acesso" no aparelho vazio. Depois, o gestor cria cada conta (auxiliar ou estoque) e envia um link de acesso de uso único.
- **Equipe sincronizada.** NFs, planos, corredores, equipe, conferências, perfis e o chat vão para os outros aparelhos da equipe, cifrados com o código da equipe.
- **Nuvem opcional (Firebase).** Serve para trazer a conta para outro aparelho e recuperar a senha pelo e-mail.
- **Senha perdida:** código de recuperação (mostrado ao criar a conta) ou e-mail.

## Telas

Início · Plano de ação · Painel · Equipe · Corredores · Notas fiscais (com conferência por câmera) · Dados e ajuda · Alertas · Chat · Administração (gestor) · Perfil · Minha conta.
Três temas escuros (Lilás, Violeta + Lima, Cinza + Lima) em Minha conta → Preferências.

## Para desenvolver

- Tudo está em `index.html` (HTML, CSS e JS), mais `sw.js` (funciona sem internet), `manifest.webmanifest`, `privacidade.html`, `termos.html`, `vendor/` e `icons/`.
- Testes: `bash tests/run.sh` (servidor local, serviço de mensagens falso e emulador do Firebase). Um teste só: `bash tests/run.sh v128_test`.
- Publicar: subir a versão em `index.html` e `robo.html` (`estoque99-version`) e em `sw.js` (`CACHE`), rodar os testes, enviar ao branch `claude/mobile-desktop-compatibility-tkbd2w` (GitHub Pages) e `npx firebase-tools deploy --only hosting`.
- O histórico detalhado de cada versão está no `CLAUDE.md`.

© 2026 Grupo Ferreira S/A. Todos os direitos reservados.
