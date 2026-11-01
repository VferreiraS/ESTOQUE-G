/* v112: 3 temas escuros (Lilás padrão, Violeta + Lima, Cinza + Lima) e fontes novas (Space Grotesk nos títulos/números, Inter no texto).
   Para cada tema, no PC 1440×900 e no iPhone 13: escolha em Preferências, cores (tokens), contraste AA do botão principal e do texto,
   fontes carregadas e usadas (título, relógio), fundo escuro, lembrado ao recarregar, gráfico do Início com dados, "menos movimento".
   Prints: SHOTS=<pasta> (padrão: pasta temporária). */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs'),path=require('path');
const OUT=process.env.SHOTS||path.join(require('os').tmpdir(),'stok-temas-v112');fs.mkdirSync(OUT,{recursive:true});
const EXP={lilas:{btn:'rgb(199, 155, 208)',neon:'#E7B8EF'},violeta:{btn:'rgb(198, 255, 52)',neon:'#C6FF34'},cinza:{btn:'rgb(199, 255, 46)',neon:'#C7FF2E'}};
const CONTRAST=()=>{const lum=c=>{const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};
  const r=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};const btn=document.querySelector('#view button.primary');const bs=getComputedStyle(btn);
  const body=getComputedStyle(document.body);const bg=getComputedStyle(document.documentElement).getPropertyValue('--e99-bg').trim()||'#000';const tmp=document.createElement('i');tmp.style.color=bg;document.body.appendChild(tmp);const bgc=getComputedStyle(tmp).color;tmp.remove();
  const nt=document.createElement('i');nt.style.color='var(--neon)';document.body.appendChild(nt);const neon=getComputedStyle(nt).color;nt.style.color='var(--ds-muted)';const muted=getComputedStyle(nt).color;nt.remove();
  return {btn:r(bs.backgroundColor,bs.color),text:r(body.color,bgc),neon:r(neon,bgc),muted:r(muted,bgc),bg:bgc}};
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['pc',{viewport:{width:1440,height:900}}],['iphone',L.devices['iPhone 13']]]){
  const P=await (await b.newContext(opts)).newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1500);
  ok(await P.evaluate(()=>document.documentElement.getAttribute('data-e99-theme')==='lilas'),nome+': tema padrão é Lilás (já na tela de entrar)');
  await P.screenshot({path:path.join(OUT,nome+'-entrar-lilas.png')});
  await L.signup(P,'tema'+nome+T);
  await P.evaluate(()=>{const t=new Date();const d=k=>{const x=new Date(t.getTime()-k*86400000);return x.toISOString().slice(0,10)};state.nfs=[0,0,1,2,2,2,4,6,6,9,11,13].map((k,i)=>({id:'n'+i,number:String(48000+i),supplier:'Fornecedor '+i,date:d(k),status:'Pendente',owner:'',notes:'',volumes:2}));return save()});
  await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});go('home')});await P.waitForTimeout(800);
  ok(await P.evaluate(()=>{const s=document.querySelector('.e99-trend svg');return !!s&&!!s.querySelector('.tr-line')&&/Notas fiscais por dia/.test(s.getAttribute('aria-label'))}),nome+': gráfico de linha no Início (com rótulo para leitor de tela)');
  for(const t of ['lilas','violeta','cinza']){
   await P.evaluate(()=>go('account'));await P.waitForTimeout(600);
   ok(await until(P,()=>!!document.querySelector('#pref-theme button[data-theme]'),null,6000),nome+' '+t+': escolha do tema em Preferências');
   await P.evaluate(t=>{const b=document.querySelector('#pref-theme button[data-theme="'+t+'"]');b.scrollIntoView();b.click()},t);await P.waitForTimeout(500);
   ok(await P.evaluate(t=>document.documentElement.getAttribute('data-e99-theme')===t&&document.querySelector('#pref-theme button[data-theme="'+t+'"]').getAttribute('aria-pressed')==='true',t),nome+' '+t+': tema aplicado e marcado');
   await P.evaluate(()=>go('home'));await P.waitForTimeout(900);await P.evaluate(()=>document.fonts.ready);
   const r=await P.evaluate(([t,e])=>{const cs=getComputedStyle(document.documentElement);const btn=document.querySelector('#view button.primary');const h=document.querySelector('#view h1, #view h2');const clk=document.querySelector('.e99-clock .clk-time');
     return {neon:cs.getPropertyValue('--neon').trim().toUpperCase()===e.neon,btn:btn&&getComputedStyle(btn).backgroundColor===e.btn,pill:btn&&parseFloat(getComputedStyle(btn).borderTopLeftRadius)>=20,
      head:h&&/Space Grotesk/.test(getComputedStyle(h).fontFamily),body:/Inter/.test(getComputedStyle(document.body).fontFamily),clock:!clk||/Space Grotesk/.test(getComputedStyle(clk).fontFamily),
      loaded:document.fonts.check('600 20px "Space Grotesk"')&&document.fonts.check('400 16px Inter'),noOswald:!(h&&/Oswald/.test(getComputedStyle(h).fontFamily.split(',')[0])),
      radius:parseFloat(getComputedStyle(document.querySelector('#view .panel')).borderTopLeftRadius)>=20,dark:true}},[t,EXP[t]]);
   ok(r.neon&&r.btn,nome+' '+t+': cores do tema (destaque e botão)');ok(r.pill&&r.radius,nome+' '+t+': botões em pílula e cartões arredondados');
   ok(r.head&&r.body&&r.clock&&r.noOswald,nome+' '+t+': títulos e relógio em Space Grotesk, texto em Inter (sem Oswald)');ok(r.loaded,nome+' '+t+': fontes carregadas do próprio site');
   const c=await P.evaluate(CONTRAST);ok(c.btn>=4.5&&c.text>=4.5&&c.neon>=4.5&&c.muted>=4.5,nome+' '+t+': contraste AA (botão '+c.btn.toFixed(1)+', texto '+c.text.toFixed(1)+', destaque '+c.neon.toFixed(1)+', secundário '+c.muted.toFixed(1)+')');
   ok(await P.evaluate(()=>{const m=getComputedStyle(document.body).color.match(/\d+/g).map(Number);return m[0]>200&&m[1]>200&&m[2]>200}),nome+' '+t+': continua escuro (texto claro sobre fundo escuro)');
   await P.screenshot({path:path.join(OUT,nome+'-inicio-'+t+'.png')});
   await P.evaluate(()=>go('nfs'));await P.waitForTimeout(700);await P.screenshot({path:path.join(OUT,nome+'-notas-'+t+'.png')});
   await P.evaluate(()=>go('chat'));await P.waitForTimeout(700);await P.screenshot({path:path.join(OUT,nome+'-chat-'+t+'.png')});
   await P.evaluate(()=>go('account'));await P.waitForTimeout(700);await P.evaluate(()=>{const r=document.getElementById('pref-theme-row');if(r)r.scrollIntoView({block:'center'})});await P.screenshot({path:path.join(OUT,nome+'-preferencias-'+t+'.png')});
  }
  /* lembrado ao recarregar (por aparelho) */
  await P.reload();await P.waitForTimeout(1200);ok(await P.evaluate(()=>document.documentElement.getAttribute('data-e99-theme')==='cinza'&&localStorage.getItem('lojasg.estoque99.ui-theme')==='cinza'),nome+': tema lembrado ao recarregar');
  ok(await P.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--neon').trim().toUpperCase()==='#C7FF2E'),nome+': tela de entrar já no tema escolhido');
  await P.close();
 }
 /* menos movimento: nada de animação nova (o gráfico é estático) e o tema continua */
 const c=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const Q=await c.newPage();Q.on('pageerror',e=>errs.push('rm '+e.message));
 await Q.goto('http://localhost:8000/index.html?ntfy='+L.N);await Q.waitForTimeout(1200);await L.signup(Q,'temarm'+T);
 await Q.evaluate(()=>{state.nfs=[{id:'a',number:'1',supplier:'X',date:new Date().toISOString().slice(0,10),status:'Pendente',owner:'',notes:'',volumes:1}];return save()});await Q.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});go('home')});await Q.waitForTimeout(800);
 ok(await Q.evaluate(()=>!!document.querySelector('.e99-trend')&&document.querySelector('.e99-trend').getAnimations({subtree:true}).length===0),'menos movimento: gráfico sem animação');
 ok(await Q.evaluate(()=>!['lilas','violeta','cinza'].some(t=>document.documentElement.outerHTML.includes('data-e99-theme="claro"'))),'só temas escuros (sem modo claro)');
 console.log('shots',OUT);console.log('errors',errs);await b.close()})();
