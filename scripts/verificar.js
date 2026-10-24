#!/usr/bin/env node
/* Grava o selo verificado de uma conta na lista "verificados" do Firestore (só o administrador; o app só lê).
   Uso:  node scripts/verificar.js <uid> <s|raio> [STK-…]
         node scripts/verificar.js <uid> remover
   Usa o login da CLI do Firebase deste computador (~/.config/configstore/firebase-tools.json). Nenhum segredo fica no repositório.
   Se o token tiver vencido, rode antes: npx -y firebase-tools@latest projects:list   (ele renova o token) */
const fs=require('fs'),os=require('os'),path=require('path');
const P='gen-lang-client-0167474823';
const [uid,tipo,stk]=process.argv.slice(2);
function fail(m){console.error(m);process.exit(1)}
if(!uid||!/^[A-Za-z0-9]{10,128}$/.test(uid))fail('uid inválido. Uso: node scripts/verificar.js <uid> <s|raio> [STK-…]');
if(!['s','raio','remover'].includes(tipo))fail('tipo deve ser s, raio ou remover');
if(stk&&!/^STK-[A-Z0-9]{4,30}$/.test(stk))fail('stkId inválido (ex.: STK-0091ZHBQ21YE)');
let cfg;try{cfg=JSON.parse(fs.readFileSync(path.join(os.homedir(),'.config/configstore/firebase-tools.json'),'utf8'))}catch(e){fail('Login da CLI do Firebase não encontrado. Rode: npx -y firebase-tools@latest login')}
const t=cfg.tokens||{};if(!t.access_token)fail('Sem token. Rode: npx -y firebase-tools@latest login');
if(t.expires_at&&t.expires_at<Date.now()+60000)fail('Token vencido. Rode: npx -y firebase-tools@latest projects:list   e tente de novo.');
const url=`https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents/verificados/${uid}`;
const H={Authorization:'Bearer '+t.access_token,'Content-Type':'application/json','x-goog-user-project':P};
(async()=>{
  if(tipo==='remover'){const r=await fetch(url,{method:'DELETE',headers:H});if(!r.ok)fail('Erro '+r.status+': '+await r.text());console.log('Selo removido de',uid);return}
  const fields={tipo:{stringValue:tipo}};if(stk)fields.stkId={stringValue:stk};
  const r=await fetch(url,{method:'PATCH',headers:H,body:JSON.stringify({fields})});const b=await r.text();
  if(!r.ok)fail('Erro '+r.status+': '+b);
  const g=await (await fetch(url,{headers:H})).json();console.log('OK verificados/'+uid+' =',JSON.stringify(Object.fromEntries(Object.entries(g.fields||{}).map(([k,v])=>[k,v.stringValue]))));
})().catch(e=>fail(String(e)));
