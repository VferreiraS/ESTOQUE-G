/* v163 · Aba piscando no PC também com "menos movimento", janela estreita e janela sem foco; ícone recriado; botão "Testar aba piscando";
   iPhone não pisca. E o aviso "ResizeObserver loop …" do navegador não vira faixa de erro (erro real continua aparecendo). */
const L=require('./lib.js');const {ok,until}=L;
const BASE=process.env.BASE||'http://localhost:8000',U=BASE+'/index.html';
const HID=()=>{window.__hid=false;window.__foc=true;Object.defineProperty(Document.prototype,'hidden',{configurable:true,get:()=>window.__hid});
  Object.defineProperty(Document.prototype,'visibilityState',{configurable:true,get:()=>window.__hid?'hidden':'visible'});
  Document.prototype.hasFocus=function(){return window.__foc&&!window.__hid};
  window.__setHidden=v=>{window.__hid=v;document.dispatchEvent(new Event('visibilitychange'))};
  window.__setFocus=v=>{window.__foc=v;window.dispatchEvent(new Event(v?'focus':'blur'))};
  window.__roErr=0;const oe=()=>{};window.addEventListener('error',e=>{if(/ResizeObserver/.test(e.message||''))window.__roErr++},true)};
const RO=/ResizeObserver loop/;
function watch(p,tag,errs,ro){p.on('pageerror',e=>{if(RO.test(e.message)){ro.n++;return}if(/erro real v163/.test(e.message))return;errs.push(tag+' '+e.message)});
  p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text())){if(RO.test(m.text())){ro.n++;return}if(/erro real v163/.test(m.text()))return;errs.push(tag+' console: '+m.text())}});p.on('dialog',d=>d.accept())}
const snap=p=>p.evaluate(()=>{const l=document.querySelector('link[rel~="icon"]');return {t:document.title,i:l?l.getAttribute('href'):'',k:document.querySelectorAll('link[rel~="icon"]').length}});
async function sample(p,ms=3600){const ts=new Set(),is=new Set();let multi=false;const t0=Date.now();while(Date.now()-t0<ms){const s=await p.evaluate(()=>{const l=document.querySelector('link[rel~="icon"]');return {t:document.title,i:l?l.getAttribute('href'):'',k:document.querySelectorAll('link[rel~="icon"]').length}});ts.add(s.t);is.add(s.i.slice(0,30));if(s.k!==1)multi=true;await p.waitForTimeout(250)}return {ts:[...ts],is:[...is],multi}}
async function blink(p,tag,kind,how,re){
  const o=await snap(p);
  if(how==='hidden')await p.evaluate(()=>__setHidden(true));else await p.evaluate(()=>__setFocus(false));
  const r=await p.evaluate(k=>e99TitleAlert(2,k),kind);ok(r===true,tag+': aviso aceito ('+how+')');
  await until(p,()=>e99TitleState().red,null,5000);
  const s=await sample(p);
  ok(s.ts.length===2&&s.ts.includes(o.t)&&s.ts.some(t=>re.test(t)),tag+': título alterna ('+s.ts.join(' | ')+')');
  ok(s.is.length===2&&s.is.some(x=>x.startsWith('data:image/png'))&&!s.multi,tag+': ícone com bolinha alterna, um só <link rel=icon> ('+s.is.join(' | ')+')');
  if(how==='hidden')await p.evaluate(()=>__setHidden(false));else await p.evaluate(()=>__setFocus(true));
  await p.waitForTimeout(800);const a=await snap(p);
  ok(await p.evaluate(()=>!e99TitleState().on&&!e99TitleState().timer)&&a.t===o.t&&!a.i.startsWith('data:image/png')&&a.k===1,tag+': ao voltar o foco para e restaura título e ícone ('+a.t+' · '+a.i.slice(0,30)+')');
  const s2=await sample(p,1500);ok(s2.ts.length===1&&!s2.is.some(x=>x.startsWith('data:image/png'))&&!s2.multi,tag+': depois de parar o título fica fixo e a bolinha não volta');
}
async function roStress(p,tag,ro,mobile){
  const w0=await p.evaluate(()=>({w:innerWidth,h:innerHeight}));
  const pages=['home','nfs','plans','chat','alerts','account','home'];
  for(let i=0;i<3;i++){for(const pg of pages){await p.evaluate(g=>{try{go(g)}catch(e){}},pg);await p.waitForTimeout(120)}
    if(mobile){await p.setViewportSize({width:w0.h,height:w0.w});await p.waitForTimeout(250);await p.setViewportSize({width:w0.w,height:w0.h});await p.waitForTimeout(200);
      await p.evaluate(()=>go('chat'));await p.waitForTimeout(300);
      for(const h of [w0.h-300,w0.h-330,w0.h]){await p.setViewportSize({width:w0.w,height:h});await p.waitForTimeout(150)}}
    else for(const w of [900,700,1200,520,1440]){await p.setViewportSize({width:w,height:w0.h});await p.waitForTimeout(150)}}
  await p.setViewportSize({width:w0.w,height:w0.h});await p.waitForTimeout(500);
  /* aviso sintético do navegador: não pode virar faixa */
  await p.evaluate(()=>{window.dispatchEvent(new ErrorEvent('error',{message:'ResizeObserver loop completed with undelivered notifications.'}));try{window.onerror('ResizeObserver loop limit exceeded','',0)}catch(e){}});
  await p.waitForTimeout(300);
  const bx=await p.evaluate(()=>{const b=document.getElementById('boot-status');return b?{d:getComputedStyle(b).display,t:b.textContent}:{d:'none',t:''}});
  ok(!RO.test(bx.t),tag+': nenhuma faixa "ResizeObserver loop" ao redimensionar/girar/teclado/trocar de tela ('+(ro.n)+' avisos crus do navegador)');
  ok(ro.n===0,tag+': o app não gerou laço de ResizeObserver ('+ro.n+')');
  await p.evaluate(()=>{setTimeout(()=>{throw new Error('erro real v163')},0)});await p.waitForTimeout(400);
  ok(await p.evaluate(()=>{const b=document.getElementById('boot-status');return !!b&&getComputedStyle(b).display!=='none'&&/erro real v163/.test(b.textContent)}),tag+': erro real continua mostrando a faixa');
  await p.evaluate(()=>{const b=document.getElementById('boot-status');if(b){b.style.display='none';b.textContent=''}});
}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 /* ===== PC com "menos movimento" (Windows sem efeitos de animação) ===== */
 {const ro={n:0};const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});await ctx.addInitScript(HID);const p=await ctx.newPage();watch(p,'PC-reduce',errs,ro);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'ab'+T);await p.evaluate(()=>go('home'));await p.waitForTimeout(1500);
  ok(await p.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches&&e99TitleState().desktop),'PC-reduce: menos movimento ligado e é computador');
  await blink(p,'PC-reduce msg','msg','hidden',/^\(2\) Novas mensagens · Stok$/);
  await blink(p,'PC-reduce alteração','alt','hidden',/^\(2\) Novas alterações · Stok$/);
  await blink(p,'PC-reduce sem foco','msg','blur',/^\(2\) Novas mensagens · Stok$/);
  /* worker: relógio fora do main thread */
  await p.evaluate(()=>__setHidden(true));await p.evaluate(()=>e99TitleAlert(1));ok(await p.evaluate(()=>e99TitleState().worker),'PC-reduce: relógio do piscar vem do Worker');
  await p.evaluate(()=>__setHidden(false));await p.waitForTimeout(500);
  /* com foco a mensagem não pisca */
  ok(await p.evaluate(()=>e99TitleAlert(1)===false&&!e99TitleState().on),'PC-reduce: com a aba em foco não pisca');
  /* botão de teste em Preferências */
  await p.evaluate(()=>go('account'));await p.waitForTimeout(1200);
  ok(!!(await p.$('#pref-tab-btn')),'PC: botão "Testar aba piscando" em Preferências');
  const o=await snap(p);
  await p.click('#pref-tab-btn');
  ok(await p.evaluate(()=>/Troque de aba agora/.test(document.getElementById('pref-tab-info').textContent)),'PC: mostra "Troque de aba agora"');
  await p.evaluate(()=>__setHidden(true));
  ok(await until(p,()=>e99TitleState().on&&e99TitleState().test===1,null,5000),'PC: o teste dispara o aviso depois de ~3 s');
  const s=await sample(p,2600);ok(s.ts.includes('(1) Teste do aviso · Stok')&&s.ts.length===2,'PC: teste alterna o título ('+s.ts.join(' | ')+')');
  await p.evaluate(()=>__setHidden(false));await p.waitForTimeout(800);
  ok(await p.evaluate(()=>/Funcionou\?/.test(document.getElementById('pref-tab-info').textContent)&&!e99TitleState().on),'PC: ao voltar mostra "Funcionou?" e para');
  const a=await snap(p);ok(a.t===o.t&&!a.i.startsWith('data:image/png')&&a.k===1,'PC: teste restaura título e ícone');
  await roStress(p,'PC',ro,false);
  await ctx.close()}
 /* ===== PC sem "menos movimento", janela de 800 px ===== */
 {const ro={n:0};const ctx=await b.newContext({viewport:{width:800,height:800}});await ctx.addInitScript(HID);const p=await ctx.newPage();watch(p,'PC-800',errs,ro);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'ac'+T);await p.evaluate(()=>go('home'));await p.waitForTimeout(1200);
  ok(await p.evaluate(()=>matchMedia('(pointer:fine)').matches&&innerWidth<=900&&e99TitleState().desktop),'PC-800: janela estreita com mouse conta como computador');
  await blink(p,'PC-800','msg','hidden',/^\(2\) Novas mensagens · Stok$/);
  await ctx.close()}
 /* ===== iPhone 13 ===== */
 {const ro={n:0};const ctx=await b.newContext(L.devices['iPhone 13']);await ctx.addInitScript(HID);const p=await ctx.newPage();watch(p,'iPhone',errs,ro);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'ad'+T);await p.evaluate(()=>go('home'));await p.waitForTimeout(1200);
  const t0=await p.evaluate(()=>document.title);await p.evaluate(()=>__setHidden(true));
  ok(await p.evaluate(()=>e99TitleAlert(3)===false&&e99TitleAlert(1,'alt')===false&&!e99TitleState().on&&e99TitleTest(0)===false),'iPhone: não pisca');
  await p.waitForTimeout(1500);ok(await p.evaluate(t=>document.title===t,t0),'iPhone: título não muda');
  await p.evaluate(()=>__setHidden(false));await p.evaluate(()=>go('account'));await p.waitForTimeout(1000);
  ok(!(await p.$('#pref-tab-btn')),'iPhone: sem botão de teste em Preferências');
  await roStress(p,'iPhone',ro,true);
  await ctx.close()}
 ok(!errs.length,'0 erro de console'+(errs.length?': '+errs.join(' | '):''));
 await b.close();console.log('fim')})().catch(e=>{console.log('FAIL erro',e);process.exit(1)});
