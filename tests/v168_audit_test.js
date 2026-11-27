/* v168: auditoria de erros. iPhone 13 + PC 1440×900, temas Lilás e Violeta. Visita as telas principais (gestor com equipe na nuvem)
   e coleta: pageerror, console.error, respostas 4xx/5xx do próprio site, requisições do site que falharam e
   "undefined/null/NaN/Invalid Date" no texto visível. Porta: E99_PORT (padrão 8000). */
const L=require('./lib.js');const {ok}=L;const PORT=process.env.E99_PORT||'8000';const BASE='http://localhost:'+PORT+'/';
const BAD=/\b(undefined|NaN|Invalid Date)\b|\bnull\b(?! ?\w)/;
(async()=>{const b=await L.chromium.launch();const rows=[];
 for(const [dev,opts] of [['iPhone',{...L.devices['iPhone 13']}],['PC',{viewport:{width:1440,height:900}}]]){
  const c=await b.newContext(opts);const P=await c.newPage();let tela='entrar';
  P.on('pageerror',e=>rows.push([tela,dev,'pageerror',e.message.slice(0,160)]));
  P.on('console',m=>{const lu=(m.location()&&m.location().url)||'';/* 'Failed to load resource' do site já aparece em HTTP 4xx/5xx; o do emulador/rede externa fica fora */if(m.type()==='error'&&!/firestore|Firestore|WebChannel|identitytoolkit|127\.0\.0\.1:(8080|9099)/i.test(m.text()+' '+lu)&&!(/Failed to load resource/.test(m.text())&&!lu.startsWith(BASE)))rows.push([tela,dev,'console.error',m.text().slice(0,160)+' @'+(m.location()&&m.location().url||'').slice(0,140)])});
  P.on('response',r=>{if(r.status()>=400&&!/127\.0\.0\.1:(8080|9099)|googleapis|gstatic/.test(r.url()))rows.push([tela,dev,'HTTP '+r.status(),r.url().replace(BASE,'').slice(0,160)])});
  P.on('requestfailed',r=>{if(r.url().startsWith(BASE)&&!/ERR_ABORTED/.test(r.failure()&&r.failure().errorText||''))rows.push([tela,dev,'requestfailed',r.url().replace(BASE,'')+' '+(r.failure()&&r.failure().errorText)])});
  P.on('dialog',d=>d.accept());
  const txt=async()=>{const t=await P.evaluate(()=>{const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let x;while((x=w.nextNode())){const e=x.parentElement;if(!e||/SCRIPT|STYLE|TEXTAREA/.test(e.nodeName))continue;if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')continue;out.push(x.nodeValue)}
    document.querySelectorAll('input,textarea').forEach(i=>{if(i.offsetParent&&i.type!=='password')out.push(i.value+' '+(i.placeholder||''))});return out.join('\n')});
   t.split('\n').forEach(l=>{if(BAD.test(l))rows.push([tela,dev,'texto',l.trim().slice(0,120)])})};
  await P.goto(BASE+'index.html');await P.waitForTimeout(2500);await txt();
  await L.signup(P,'aud'+dev.toLowerCase());
  await P.evaluate(async()=>{state.team=[{id:'ana',name:'Ana',role:'Repositora'}];state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'ana'}];
   state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:3},{id:'n2',number:'1',supplier:'X',date:'',status:'Conferido',owner:'',notes:''}];
   state.plans=[{id:'p1',title:'Plano de terça',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana',notes:'',photos:[]}]}];await save();go('chat')});
  await P.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor').catch(()=>{});await P.click('text=Criar equipe e gerar código').catch(()=>{});
  await L.until(P,()=>window.syncStatus&&syncStatus().ready&&syncStatus().connected,null,20000);
  const pages=await P.evaluate(()=>Object.keys(labels));
  for(const th of ['lilas','violeta']){await P.evaluate(t=>window.e99Theme&&e99Theme.set(t),th);
   for(const pg of pages.concat(['painel','admin','profile'])){tela=pg+'/'+th;await P.evaluate(p=>{try{go(p)}catch(e){console.error('go '+p+': '+e.message)}},pg);await P.waitForTimeout(700);await txt()}
   tela='editor-nf/'+th;await P.evaluate(()=>{go('nfs');openEditor('nf')}).catch(e=>rows.push([tela,dev,'eval',e.message.slice(0,120)]));await P.waitForTimeout(700);await txt();await P.keyboard.press('Escape');
   tela='editor-nf-existente/'+th;await P.evaluate(()=>{go('nfs');openEditor('nf','n2')}).catch(e=>rows.push([tela,dev,'eval',e.message.slice(0,120)]));await P.waitForTimeout(700);await txt();await P.keyboard.press('Escape');
   tela='editor-plano/'+th;await P.evaluate(()=>{go('plans');openPlan()}).catch(e=>rows.push([tela,dev,'eval',e.message.slice(0,120)]));await P.waitForTimeout(700);await txt();await P.keyboard.press('Escape');
   tela='editor-plano-existente/'+th;await P.evaluate(()=>{go('plans');openPlan('p1')}).catch(e=>rows.push([tela,dev,'eval',e.message.slice(0,120)]));await P.waitForTimeout(700);await txt();await P.keyboard.press('Escape');
   tela='chat-msg/'+th;await P.evaluate(()=>go('chat'));await P.waitForTimeout(800);const f=await P.$('#chat-text');if(f){await f.fill('Oi equipe');await P.keyboard.press('Enter');await P.waitForTimeout(1200)}await txt()}
  tela='sair';await P.evaluate(()=>{try{authLogout&&authLogout()}catch(e){}});await P.waitForTimeout(1500);await txt();await c.close()}
 const seen=new Set();const uniq=rows.filter(r=>{const k=r.join('|').replace(/\/(lilas|violeta)/,'');if(seen.has(k))return false;seen.add(k);return true});
 console.log('tela | dispositivo | tipo | detalhe');uniq.forEach(r=>console.log(r.join(' | ')));
 ok(uniq.length===0,'auditoria: '+uniq.length+' problema(s) de console/rede/texto');await b.close()})();
