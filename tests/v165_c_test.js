/* v165 · telas C (app/css/v165-c.css): entrar, navegação, Equipe, Corredores, Administração, Perfil, "Mais".
   3 temas × PC 1440×900 e iPhone 13: escala de fontes e raios do v164, alvos ≥44 px no iPhone, sem rolagem lateral, contraste AA,
   aba/menu ativo claro, login num cartão só com campos de 48 px, linhas de corredor/pessoa padronizadas, 0 erro de console.
   Prints 2x (tema Lilás) em docs/prints/v165/c/teste (fora do git). */
const L=require('./lib.js');const {ok}=L;const fs=require('fs'),path=require('path');
const U='http://localhost:8000/index.html',OUT=process.env.SHOTS||'docs/prints/v165/c/teste';
const SCALE=['12px','13px','15px','16px','22px','28px','40px','34px'];const RADII=['0px','8px','12px','20px','28px','999px','50%','22.5%'];
function watch(p,tag,errs){p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept())}
const MEASURE=(mob)=>{const vis=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return false;const s=getComputedStyle(e);return s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>0.05};
 const roots=[...document.querySelectorAll('.layout,#mobile-bottom,#auth-screen')].filter(vis);const els=new Set();roots.forEach(r=>{els.add(r);r.querySelectorAll('*').forEach(e=>{if(!(e instanceof SVGElement)&&!/^(BR|SCRIPT|STYLE|OPTION|IMG|CANVAS)$/.test(e.nodeName))els.add(e)})});
 const P=x=>{const m=String(x).match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0]};
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
 const bgOf=e=>{let x=e;while(x&&x.nodeType===1){const s=getComputedStyle(x);if(s.backgroundImage&&s.backgroundImage!=='none'&&!/^(BODY|HTML)$/.test(x.nodeName))return null;if(s.backgroundColor!=='rgba(0, 0, 0, 0)'){const c=P(s.backgroundColor);if(c.length<4||c[3]>=.95)return c.slice(0,3);if(c[3]>.3)return null}x=x.parentElement}
   return getComputedStyle(document.documentElement).getPropertyValue('--p-bg').trim().replace('#','').match(/../g).map(h=>parseInt(h,16))};
 const fs=new Set(),rad=new Set(),low=[],small=[],off=[];
 for(const e of els){if(!vis(e)||e.closest('.chat-wrap,#chat-list,.cv-wrap,.logo'))continue;const s=getComputedStyle(e);const own=[...e.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim());
  if(own){fs.add(s.fontSize);if(!SC.includes(s.fontSize))off.push(e.nodeName+'.'+String(e.className).split(' ')[0]+' '+s.fontSize);
   if(!e.closest('[disabled],[aria-disabled=true]')){const bg=bgOf(e);if(bg){const fg=P(s.color);const a=fg.length>3?fg[3]:1;const c=[0,1,2].map(i=>fg[i]*a+bg[i]*(1-a));const L1=lum(c),L2=lum(bg);const cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
    const big=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&+s.fontWeight>=700);if(cr<(big?3:4.5))low.push((e.id?'#'+e.id:e.nodeName+'.'+String(e.className).split(' ')[0])+' '+cr.toFixed(2)+' "'+e.textContent.trim().slice(0,20)+'"')}}}
  if(s.backgroundColor!=='rgba(0, 0, 0, 0)'||(parseFloat(s.borderTopWidth)>0&&s.borderTopStyle!=='none'))rad.add(s.borderTopLeftRadius);
  if(mob&&/^(BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(e.nodeName)&&!/^(hidden|checkbox|radio)$/.test(e.type)){const lab=e.closest('label');const r=(lab&&e.type==='file'?lab:e).getBoundingClientRect();if(Math.min(r.height,r.width)<43.5)small.push((e.getAttribute('aria-label')||e.textContent||e.name||e.nodeName).trim().slice(0,20)+' '+Math.round(r.width)+'×'+Math.round(r.height))}}
 return {fs:[...fs],r:[...rad].filter(x=>!RD.includes(x)),off,low,small,scroll:document.documentElement.scrollWidth-innerWidth}};
const M=(mob)=>`(()=>{const SC=${JSON.stringify(SCALE)},RD=${JSON.stringify(RADII)};return (${MEASURE.toString()})(${mob})})()`;
(async()=>{const b=await L.chromium.launch();const errs=[];fs.mkdirSync(OUT,{recursive:true});const T=Date.now().toString(36);
 for(const dev of ['PC','iPhone']){const mob=dev==='iPhone';
  const ctx=await b.newContext(mob?{...L.devices['iPhone 13'],deviceScaleFactor:2}:{viewport:{width:1440,height:900},deviceScaleFactor:2});const p=await ctx.newPage();watch(p,dev,errs);
  await p.goto(U);await p.waitForTimeout(2500);await p.addStyleTag({content:'.firebase-emulator-warning{display:none!important}'});
  /* entrar: um cartão só, campos de 48, um primário */
  const lg=await p.evaluate(()=>{const c=document.querySelector('#auth-screen .auth-card'),f=document.getElementById('auth-form');const cs=getComputedStyle(f);const ins=[...document.querySelectorAll('#auth-form input:not([type=checkbox])')].map(i=>i.getBoundingClientRect().height);
    return {nested:cs.backgroundColor!=='rgba(0, 0, 0, 0)'||parseFloat(cs.borderTopWidth)>0,inside:f.getBoundingClientRect().left>=c.getBoundingClientRect().left&&f.getBoundingClientRect().right<=c.getBoundingClientRect().right,h:Math.min(...ins),prim:document.querySelectorAll('#auth-screen button.primary').length,w:c.getBoundingClientRect().width}});
  ok(!lg.nested&&lg.inside&&lg.h>=47.5&&lg.prim===1&&lg.w<=440,dev+': entrar num cartão só ('+Math.round(lg.w)+' px), campos de '+Math.round(lg.h)+' px, um primário');
  for(const th of ['lilas','violeta','cinza']){await p.evaluate(t=>{try{e99Theme.set(t)}catch(e){}},th);await p.waitForTimeout(200);const m=await p.evaluate(M(mob));
   ok(!m.low.length&&!m.scroll&&(!mob||!m.small.length),dev+' '+th+': entrar com AA, sem rolagem lateral'+(mob?', toques ≥44':'')+([...m.low,...m.small].length?' → '+[...m.low,...m.small].slice(0,4).join(' | '):''))}
  await p.screenshot({path:path.join(OUT,'login-'+(mob?'iphone':'pc')+'.png')});
  ok(await L.gestorWithTeam(p,'v165c'+dev.toLowerCase()+T),dev+': gestor com equipe');
  await p.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});
  await p.evaluate(async()=>{authSession.payload.role='gestor';state.team=[{id:'ana',name:'Ana Souza',role:'Repositora'},{id:'b',name:'Bruno Lima',role:'Conferente'}];state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'ana'},{id:'c8',number:'08',sector:'Utilidades plásticas',owner:'b'}];await save()});
  const pages=[['inicio','home'],['equipe','team'],['corredores','corridors'],['admin','admin'],['perfil','profile']].concat(mob?[['mais','mobile-menu']]:[]);
  for(const th of ['lilas','violeta','cinza']){await p.evaluate(t=>e99Theme.set(t),th);const bad=[],fsz=new Set(),rr=new Set();
   for(const [n,pg] of pages){await p.evaluate(g=>{go(g);scrollTo(0,0)},pg);await p.waitForTimeout(700);const m=await p.evaluate(M(mob));m.fs.forEach(x=>fsz.add(x));m.r.forEach(x=>rr.add(n+':'+x));
    m.low.forEach(x=>bad.push(n+' AA '+x));m.small.forEach(x=>bad.push(n+' toque '+x));if(m.scroll>1)bad.push(n+' rolagem +'+m.scroll);if(th==='lilas')await p.screenshot({path:path.join(OUT,n+'-'+(mob?'iphone':'pc')+'.png')});
    /* navegação: um item ativo, distinto dos outros */
    const nav=await p.evaluate(mob=>{const q=mob?'#mobile-bottom button':'aside .nav button';const a=[...document.querySelectorAll(q)].filter(x=>x.matches('.active,[aria-current=page]'));const o=document.querySelector(q+':not(.active):not([aria-current=page])');
      if(a.length!==1||!o)return a.length+' ativos';const sa=getComputedStyle(mob?a[0].querySelector('span')||a[0]:a[0]),so=getComputedStyle(mob?o.querySelector('span')||o:o);return sa.backgroundColor!==so.backgroundColor||sa.boxShadow!==so.boxShadow?'':'ativo igual aos outros'},mob);
    if(nav&&pg!=='admin'&&pg!=='profile')bad.push(n+' navegação: '+nav)}
   ok(!bad.length,dev+' '+th+': telas C com AA, sem rolagem lateral'+(mob?', toques ≥44':'')+' e item ativo claro'+(bad.length?' → '+bad.slice(0,5).join(' | '):''));
   const offF=[...fsz].filter(x=>!SCALE.includes(x));ok(offF.length<=1,dev+' '+th+': fontes na escala ('+[...fsz].sort((a,b)=>parseFloat(a)-parseFloat(b)).join(' ')+')');
   ok(rr.size<=1,dev+' '+th+': raios na escala'+(rr.size?' (fora: '+[...rr].slice(0,4).join(' ')+')':''))}
  /* linhas padronizadas */
  await p.evaluate(()=>{e99Theme.set('lilas');go('corridors')});await p.waitForTimeout(600);
  ok(await p.evaluate(()=>{const c=[...document.querySelectorAll('#view .corridor-card')];if(c.length<2)return false;const pos=x=>{const r=x.getBoundingClientRect(),h=x.querySelector('.sector-heading').getBoundingClientRect(),e=x.querySelector('.cardtop>button').getBoundingClientRect();return [Math.round(h.top-r.top),e.top>h.top]};const a=pos(c[0]),b2=pos(c[1]);return a[0]===b2[0]&&a[1]&&b2[1]}),dev+': cartões de corredor padronizados (setor no topo, ações embaixo)');
  await p.evaluate(()=>go('team'));await p.waitForTimeout(600);
  ok(await p.evaluate(()=>{const c=[...document.querySelectorAll('#view .cards>.card')].slice(0,2);return c.length===2&&c.every(x=>{const t=x.querySelector('.cardtop');return t&&t.getBoundingClientRect().height<60})}),dev+': cartões de pessoa com avatar e ações numa linha');
  ok(await p.evaluate(()=>!/⚖/.test(document.body.innerText)&&(go('corridors'),!!document.querySelector('.cor-dist svg.ic')||!document.querySelector('.cor-dist'))),dev+': "Corredores por conta" com ícone do conjunto (sem emoji)');
  await p.evaluate(()=>go('team'));await p.waitForTimeout(400);
  ok(await p.evaluate(()=>{const l=document.querySelector('#view .sc-file');return !l||(!!l.querySelector('svg.ic')&&l.getBoundingClientRect().height>=43.5)}),dev+': botão de foto do mural com ícone e 44 px');
  await ctx.close()}
 ok(!errs.length,'0 erro de console'+(errs.length?' → '+errs.slice(0,4).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
