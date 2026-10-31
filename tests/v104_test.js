/* v104: relógio grande com data e hora no Início (PC 1440×900 e celular), atualiza a cada segundo, para em segundo plano e fora do Início,
   sem segundos e 1×/min com Pausar animação / Efeitos desligados. */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['PC',{viewport:{width:1440,height:900}}],['celular',L.devices['iPhone 13']]]){
  const P=await (await b.newContext(opts)).newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1500);await L.signup(P,'clk'+nome+T);await P.evaluate(()=>go('home'));await P.waitForTimeout(500);
  const r=await P.evaluate(()=>{const c=document.querySelector('#view .e99-clock'),t=c&&c.querySelector('.clk-time'),d=c&&c.querySelector('.clk-date');if(!c)return null;const cr=c.getBoundingClientRect();
    return {hm:c.querySelector('.clk-hm').textContent,s:c.querySelector('.clk-s').textContent,date:d.textContent,fs:parseFloat(getComputedStyle(t).fontSize),w:cr.width,right:cr.right,doc:document.documentElement.scrollWidth,vw:innerWidth}});
  const now=new Date(),hm=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  ok(!!r&&/^\d\d:\d\d$/.test(r.hm)&&/^:\d\d$/.test(r.s),nome+': relógio no Início ('+(r&&r.hm+r.s)+')');
  ok(!!r&&new RegExp(String(now.getFullYear())).test(r.date)&&/feira|sábado|domingo/i.test(r.date),nome+': data por extenso ('+(r&&r.date)+')');
  ok(!!r&&r.fs>=(nome==='PC'?100:50),nome+': hora grande ('+(r&&r.fs)+' px)');
  ok(!!r&&r.doc<=r.vw&&r.right<=r.vw,nome+': cabe na tela sem rolagem lateral');
  const s1=await P.evaluate(()=>document.querySelector('.e99-clock .clk-s').textContent);await P.waitForTimeout(2100);const s2=await P.evaluate(()=>document.querySelector('.e99-clock .clk-s').textContent);
  ok(s1!==s2,nome+': segundos andam ('+s1+' → '+s2+')');
  await P.evaluate(()=>go('nfs'));await P.waitForTimeout(1200);ok(await P.evaluate(()=>!e99Clock.running()),nome+': fora do Início o relógio para');
  await P.evaluate(()=>go('home'));await P.waitForTimeout(400);ok(await P.evaluate(()=>e99Clock.running()),nome+': volta a andar no Início');
  await P.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await P.waitForTimeout(300);
  ok(await P.evaluate(()=>!e99Clock.running()),nome+': para em segundo plano');
  await P.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await P.waitForTimeout(300);ok(await P.evaluate(()=>e99Clock.running()),nome+': volta ao abrir a aba');
  await P.evaluate(()=>{localStorage.setItem('lojasg.estoque99.fx-pause','1');render()});await P.waitForTimeout(400);
  ok(await P.evaluate(()=>{const c=document.querySelector('.e99-clock');return c.classList.contains('clk-calm')&&getComputedStyle(c.querySelector('.clk-s')).display==='none'}),nome+': com "Pausar animação" sem segundos (1 vez por minuto)');
  await P.evaluate(()=>{localStorage.setItem('lojasg.estoque99.fx-pause','0');render()});await P.waitForTimeout(1500);
  ok(await P.evaluate(()=>document.getAnimations().filter(a=>a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('.e99-clock')&&!a.effect.target.classList.contains('e99-streak')).length===0),nome+': relógio sem animação própria (o rastro de luz da v91 é o mesmo dos outros cartões)');
 }
 console.log('errors',errs);await b.close()})();
