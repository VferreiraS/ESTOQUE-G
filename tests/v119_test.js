/* v119: aviso "Dynamic Island" — PC e iPhone 13, 3 temas, Efeitos desligados / menos movimento (sem animação), chat, prazos e NF nova. */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs'),path=require('path');
const OUT=process.env.SHOTS||path.join(require('os').tmpdir(),'stok-v119');fs.mkdirSync(OUT,{recursive:true});
const NEON={lilas:'rgb(231, 184, 239)',violeta:'rgb(198, 255, 52)',cinza:'rgb(199, 255, 46)'};
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['iphone',L.devices['iPhone 13']],['pc',{viewport:{width:1440,height:900}}]]){
  for(const t of ['lilas','violeta','cinza']){
   const calm=t==='cinza';const c=await b.newContext({...opts,reducedMotion:calm?'reduce':'no-preference'});
   await c.addInitScript(([t,f])=>{try{localStorage.setItem('lojasg.estoque99.ui-theme',t);if(f)localStorage.setItem('lojasg.estoque99.visual-effects','off')}catch(e){}},[t,calm]);
   const P=await c.newPage();P.on('pageerror',e=>{if(!/localStorage/.test(e.message))errs.push(nome+' '+e.message)});P.on('dialog',d=>d.accept());
   await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1200);await L.signup(P,'i9'+nome[0]+t+T);
   await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});go('home')});
   const k=nome+' '+t+(calm?' (sem animação)':'');
   await P.evaluate(()=>showSiteNotification('Chat · Ana','Repor arroz no corredor 7','estoque99-chat','chat'));
   ok(await until(P,()=>{const i=document.getElementById('e99-island');return !!i&&i.classList.contains('on')&&/Ana/.test(i.textContent)&&/arroz/.test(i.textContent)},null,3000),k+': cápsula do chat desce no topo');
   await P.waitForTimeout(700);const g=await P.evaluate(()=>{const i=document.getElementById('e99-island'),r=i.getBoundingClientRect(),cs=getComputedStyle(i);return {top:r.top,w:r.width,vw:innerWidth,cx:r.left+r.width/2,t:getComputedStyle(i.querySelector('.ii-t')).color,tr:cs.transitionDuration,bg:cs.backgroundColor}});
   ok(g.top>=0&&g.top<60&&Math.abs(g.cx-g.vw/2)<2&&g.w<=g.vw-20,k+': no topo, centralizada e dentro da tela');
   ok(g.t===NEON[t],k+': cor de destaque do tema ('+g.t+')');
   ok(calm?/^0s/.test(g.tr):!/^0s/.test(g.tr),k+(calm?': sem animação':': com animação de descer'));
   await P.screenshot({path:path.join(OUT,nome+'-'+t+'.png')});
   await P.click('#e99-island');ok(await until(P,()=>page==='chat'&&!document.getElementById('e99-island').classList.contains('on'),null,3000),k+': tocar abre o chat e fecha a cápsula');
   if(t==='lilas'){
    await P.evaluate(()=>go('home'));await P.waitForTimeout(600);
    await P.evaluate(()=>emitDesktop('Prazo de NF','NF 48213 vence hoje'));ok(await until(P,()=>/vence hoje/.test((document.getElementById('e99-island')||{}).textContent||''),null,3000),k+': aviso de prazo aparece');
    await P.evaluate(()=>e99IslandHide());await P.waitForTimeout(600);
    await P.evaluate(()=>{state.nfs=state.nfs.concat([{id:'nx'+Date.now(),number:'77001',supplier:'Laticínios',date:new Date().toISOString().slice(0,10),status:'Pendente',owner:'',notes:'',volumes:1}])});
    ok(await until(P,()=>/77001/.test((document.getElementById('e99-island')||{}).textContent||''),null,5000),k+': nota fiscal nova aparece');
   }
   await c.close();
  }
 }
 console.log('shots',OUT);console.log('errors',errs);await b.close()})();
