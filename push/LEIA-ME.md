# Avisos com o app fechado (Web Push) — para uma versão futura

O que faz: manda "Nova nota fiscal", "Mensagem nova no chat" ou "Prazo vencendo" para o celular mesmo com o Stok fechado. Nenhum dado da nota sai do aparelho — só o tipo do aviso.

## 1. Conta grátis na Cloudflare
1. Abra https://dash.cloudflare.com/sign-up e crie a conta (não pede cartão).
2. No computador, com Node instalado, entre na pasta `push` e rode: `npx wrangler login` (abre o navegador para autorizar).

## 2. Lugar das inscrições (KV)
`npx wrangler kv namespace create SUBS` → copie o `id` mostrado para o `wrangler.jsonc` (no lugar de `COLE_AQUI_O_ID_DO_KV`).

## 3. Chaves (nunca no repositório)
1. `npx web-push generate-vapid-keys` → mostra Public Key e Private Key.
2. `npx wrangler secret put VAPID_PUBLIC` → cole a Public Key.
3. `npx wrangler secret put VAPID_PRIVATE` → cole a Private Key.
Guarde a Private Key só num lugar seguro seu (gerenciador de senhas).

## 4. Publicar
`npx wrangler deploy` → mostra o endereço, ex.: `https://stok-push.SEU-USUARIO.workers.dev`.

## 5. O que colar no app depois (pedir ao Claude)
- Em `client.js`: `PUSH_URL` = endereço do passo 4 e `VAPID_PUBLIC` = a Public Key (pública, pode ficar no app).
- `sw-push.js` vai no `sw.js`; `client.js` no `index.html` + um botão "Ligar avisos".
- No iPhone só funciona com o Stok adicionado à Tela de Início (iOS 16.4 ou mais novo).

Limites: só aceita pedidos do site do Stok; 30 por minuto por endereço; inscrições que o celular cancelou são apagadas sozinhas.
