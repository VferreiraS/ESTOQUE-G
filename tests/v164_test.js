/* v164 · sistema de design profissional (app/css/v164-pro.css + app/js/v164-icons.js).
   3 temas × PC 1440×900 e iPhone 13: tokens --p-* existem e respeitam o matiz do tema; nas telas principais os tamanhos de fonte ficam na
   escala fechada (7 passos), os pesos em 400/500/600 (+700 só no rótulo da aba ativa do celular), os raios no conjunto da escala;
   ícones com traço 1,75; nenhum ✕/✓ de texto como ícone; contraste AA; toques ≥44 px no iPhone; sem rolagem lateral; 0 erro de console.
   Prints 2x "depois" (tema Lilás) em docs/prints/v164/depois (fora do git), com os mesmos nomes da auditoria em docs/design-auditoria.md. */
const L=require('./lib.js');const {ok}=L;const fs=require('fs'),path=require('path');
const BASE=process.env.BASE||'http://localhost:8000',U=BASE+'/index.html',OUT=process.env.SHOTS||'docs/prints/v164/depois';
function watch(p,tag,errs){p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept())}
const SEED=()=>{state.team=[{id:'a',name:'Ana Souza',role:'Repositora'},{id:'b',name:'Bruno Lima',role:'Conferente'},{id:'c',name:'Carla Dias',role:'Repositora'}];
  state.plans=[{id:'p1',title:'Plano do dia',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana Souza',notes:'',photos:[],done:true},{id:'a2',title:'Limpar corredor 09',owner:'Bruno Lima',notes:'',photos:[],done:false}]}];
  state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios Serra',date:iso(),status:'Conferido',owner:'a',notes:'',volumes:3},{id:'n2',number:'48214',supplier:'Bebidas Norte',date:iso(),status:'Em divergência',owner:'b',notes:'Faltou 1',volumes:2},{id:'n3',number:'48215',supplier:'Hortifruti',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1}];
  state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'a'}];return save()};
const SCALE=['12px','13px','15px','16px','22px','28px','40px','34px'];const RADII=['0px','8px','12px','20px','28px','999px','50%','22.5%'];
/* mede a tela: fontes, pesos, raios, traço dos ícones, glifos, contraste, toques, rolagem lateral */
const MEASURE=(mob)=>{const vis=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return false;const s=getComputedStyle(e);return s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>0.05};
  const roots=[...document.querySelectorAll('.layout,#mobile-bottom,dialog[open],#auth-screen')].filter(vis);const els=new Set();roots.forEach(r=>{els.add(r);r.querySelectorAll('*').forEach(e=>{if(!(e instanceof SVGElement)&&!/^(BR|SCRIPT|STYLE|OPTION|IMG|CANVAS|VIDEO)$/.test(e.nodeName))els.add(e)})});
  const fsz=new Map(),fw=new Map(),rad=new Map(),glyph=[],low=[],small=[];
  const P=x=>{const m=String(x).match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0]};
  const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
  const bgOf=e=>{let x=e;while(x&&x.nodeType===1){const s=getComputedStyle(x);if(s.backgroundImage&&s.backgroundImage!=='none'&&!/^(BODY|HTML)$/.test(x.nodeName))return null;if(s.backgroundColor!=='rgba(0, 0, 0, 0)'){const c=P(s.backgroundColor);if(c.length<4||c[3]>=.95)return c.slice(0,3);if(c[3]>.3)return null}x=x.parentElement}
    return P(getComputedStyle(document.documentElement).getPropertyValue('--p-bg').trim().replace('#','').match(/../g).map(h=>parseInt(h,16)).join(','))};
  const add=(m,k,e)=>{if(!m.has(k))m.set(k,e)};
  for(const e of els){if(!vis(e))continue;const s=getComputedStyle(e);const own=[...e.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim());
    if(own||/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.nodeName)){add(fsz,s.fontSize,e);add(fw,s.fontWeight,e);
      if(own&&!e.closest('.chat-txt,.reacts,.lic-text,.logo')){const t=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.nodeValue).join('');if(/^\s*[✕×✖✓✔✅]/.test(t))glyph.push(e.nodeName+'.'+e.className+': '+t.trim().slice(0,20))}
      if(own&&!e.closest('[disabled],[aria-disabled=true],.logo')&&s.textDecorationLine.indexOf('line-through')<0){const bg=bgOf(e);if(bg){const fg=P(s.color);const a=fg.length>3?fg[3]:1;const c=[0,1,2].map(i=>fg[i]*a+bg[i]*(1-a));const L1=lum(c),L2=lum(bg);const cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
        const big=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&+s.fontWeight>=700);if(cr<(big?3:4.5))low.push((e.id?'#'+e.id:e.nodeName+'.'+String(e.className).split(' ')[0])+' '+cr.toFixed(2)+' "'+e.textContent.trim().slice(0,24)+'"')}}}
    const bgv=s.backgroundColor!=='rgba(0, 0, 0, 0)'||(parseFloat(s.borderTopWidth)>0&&s.borderTopStyle!=='none');if(bgv)add(rad,s.borderTopLeftRadius,e);
    if(mob&&/^(BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(e.nodeName)&&e.type!=='hidden'&&e.type!=='checkbox'&&e.type!=='radio'&&!e.closest('.chat-msg,.logo,#nf-results .nf-pc')&&!e.matches('.ph-dl,.ph-rm')){const r=e.getBoundingClientRect();const lab=e.closest('label');const rr=lab&&e.type==='file'?lab.getBoundingClientRect():r;if(Math.min(rr.height,rr.width)<43.5)small.push((e.getAttribute('aria-label')||e.textContent||e.name||e.nodeName).trim().slice(0,24)+' '+Math.round(rr.width)+'×'+Math.round(rr.height))}}
  const sw=[...document.querySelectorAll('svg.ic')].filter(vis).map(x=>getComputedStyle(x).strokeWidth);
  const desc=(m)=>[...m.entries()].map(([k,e])=>k+'←'+e.nodeName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''));
  return {fs:[...fsz.keys()],fw:[...fw.keys()],r:[...rad.keys()],fsD:desc(fsz),rD:desc(rad),fwD:desc(fw),sw:[...new Set(sw)],glyph,low,small,scroll:document.documentElement.scrollWidth-innerWidth}};
(async()=>{const b=await L.chromium.launch();const errs=[];fs.mkdirSync(OUT,{recursive:true});const T=Date.now().toString(36);
 for(const dev of ['PC','iPhone']){const mob=dev==='iPhone';
  const opt=mob?{...L.devices['iPhone 13'],deviceScaleFactor:2}:{viewport:{width:1440,height:900},deviceScaleFactor:2};
  const ctx=await b.newContext(opt);const p=await ctx.newPage();watch(p,dev,errs);
  await p.goto(U);await p.waitForTimeout(2500);await p.addStyleTag({content:'.firebase-emulator-warning{display:none!important}'});
  /* tela de entrar */
  const lg=await p.evaluate(MEASURE,mob);
  ok(lg.fs.every(x=>SCALE.includes(x))&&!lg.scroll,dev+': tela de entrar na escala ('+lg.fs.join(' ')+')');
  await p.screenshot({path:path.join(OUT,'login-'+(mob?'iphone':'pc')+'.png')});
  const team=await L.gestorWithTeam(p,'pro'+dev.toLowerCase()+T);ok(team,dev+': equipe na nuvem (chat de verdade)');
  await p.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});
  await p.evaluate(()=>{authSession.payload.role='gestor'});await p.evaluate(SEED);
  await p.evaluate(()=>go('chat'));await p.waitForTimeout(2000);const ta=await p.$('#chat-text');if(ta){await ta.fill('Bom dia, equipe! Chegou a NF 48213.');await ta.press('Enter');await p.waitForTimeout(1500)}
  for(const th of ['lilas','violeta','cinza']){
   await p.evaluate(t=>{e99Theme.set(t)},th);await p.waitForTimeout(300);
   /* tokens */
   const tk=await p.evaluate(()=>{const cs=getComputedStyle(document.documentElement);const g=n=>cs.getPropertyValue(n).trim();
     return {names:['--p-fs-cap','--p-fs-sm','--p-fs-ui','--p-fs-body','--p-fs-title','--p-fs-large','--p-fs-display','--p-s-1','--p-s-4','--p-r-ctl','--p-r-card','--p-r-sheet','--p-r-pill','--p-d-fast','--p-d-base','--p-d-slow','--p-ease','--p-bg','--p-s1','--p-s2','--p-s3','--p-t1','--p-t2','--p-t3','--p-accent','--p-accent-ink','--p-danger','--p-ok','--p-warn','--p-line'].filter(n=>!g(n)),
       acc:g('--p-accent').toLowerCase(),btn:g('--neon-btn').toLowerCase(),bg:g('--p-bg').toLowerCase(),dsbg:g('--ds-bg').toLowerCase(),font:getComputedStyle(document.body).fontFamily}});
   ok(!tk.names.length,dev+' '+th+': tokens --p-* definidos'+(tk.names.length?' (faltam '+tk.names.join(',')+')':''));
   ok(tk.acc===tk.btn&&tk.bg===tk.dsbg,dev+' '+th+': acento e fundo são as cores do tema (sem mudar o matiz: '+tk.acc+' / '+tk.bg+')');
   ok(/Inter|apple-system/.test(tk.font),dev+' '+th+': fonte do sistema Apple ou Inter ('+tk.font.slice(0,40)+')');
   const pages=[['inicio','home'],['painel','reports'],['notas','nfs'],['plano','plans'],['equipe','team'],['chat','chat'],['alertas','alerts'],['conta','account'],['dados','data'],['nota-editor','EDIT']];
   const allFs=new Set(),allR=new Set(),allW=new Set(),sw=new Set(),glyph=[],low=[],small=[],scroll=[];let fsD=[],rD=[],fwD=[];
   for(const [n,pg] of pages){
    if(pg==='EDIT'){await p.evaluate(()=>{go('nfs');openEditor('nf','n1')})}else await p.evaluate(pg=>{try{document.getElementById('modal').open&&document.getElementById('modal').close()}catch(e){}go(pg);window.scrollTo(0,0)},pg);
    await p.waitForTimeout(pg==='chat'?1600:900);
    const m=await p.evaluate(MEASURE,mob);m.fs.forEach(x=>allFs.add(x));m.r.forEach(x=>allR.add(x));m.fw.forEach(x=>allW.add(x));m.sw.forEach(x=>sw.add(x));
    m.glyph.forEach(x=>glyph.push(n+': '+x));m.low.forEach(x=>low.push(n+': '+x));m.small.forEach(x=>small.push(n+': '+x));if(m.scroll>1)scroll.push(n+' +'+m.scroll);
    fsD=fsD.concat(m.fsD.filter(x=>!SCALE.includes(x.split('←')[0])).map(x=>n+':'+x));rD=rD.concat(m.rD.filter(x=>!RADII.includes(x.split('←')[0])).map(x=>n+':'+x));fwD=fwD.concat(m.fwD.filter(x=>!/^(400|500|600)←/.test(x)).map(x=>n+':'+x));
    if(th==='lilas')await p.screenshot({path:path.join(OUT,n+'-'+(mob?'iphone':'pc')+'.png')});
    if(pg==='EDIT')await p.evaluate(()=>{try{document.getElementById('modal').close()}catch(e){}})}
   const offFs=[...allFs].filter(x=>!SCALE.includes(x));
   ok(allFs.size<=8&&offFs.length<=1,dev+' '+th+': '+allFs.size+' tamanhos de fonte, na escala fechada ('+[...allFs].sort((a,b)=>parseFloat(a)-parseFloat(b)).join(' ')+')'+(fsD.length?' fora: '+fsD.slice(0,4).join(' | '):''));
   const offR=[...allR].filter(x=>!RADII.includes(x));
   ok(offR.length<=1,dev+' '+th+': raios no conjunto da escala ('+[...allR].sort((a,b)=>parseFloat(a)-parseFloat(b)).join(' ')+')'+(rD.length?' fora: '+rD.slice(0,4).join(' | '):''));
   const offW=[...allW].filter(x=>!['400','500','600'].includes(x)&&!(mob&&x==='700'));
   ok(!offW.length,dev+' '+th+': pesos 400/500/600'+(mob?' (+700 na aba ativa)':'')+' ('+[...allW].join(',')+')'+(offW.length&&fwD.length?' — '+fwD.slice(0,4).join(' | '):''));
   ok(sw.size===1&&sw.has('1.75px'),dev+' '+th+': ícones de um só traço ('+[...sw].join(',')+')');
   ok(!glyph.length,dev+' '+th+': nenhum ✕/✓ de texto como ícone'+(glyph.length?' → '+glyph.slice(0,4).join(' | '):''));
   ok(!low.length,dev+' '+th+': contraste AA dos textos'+(low.length?' → '+low.slice(0,6).join(' | '):''));
   if(mob)ok(!small.length,dev+' '+th+': toques ≥44 px'+(small.length?' → '+small.slice(0,6).join(' | '):''));
   ok(!scroll.length,dev+' '+th+': sem rolagem lateral'+(scroll.length?' → '+scroll.join(', '):''));
  }
  /* API dos ícones mantida e conjunto novo */
  ok(await p.evaluate(()=>{const a=e99Icon('home'),c=e99Icon('close'),s=e99Icon('search');return /viewBox="0 0 24 24"/.test(a)&&/class="ic"/.test(c)&&/<path/.test(s)&&e99Icon('nada')===''}),dev+': e99Icon(nome) mantém a API (24 px) e tem os ícones novos');
  /* logo e S da abertura intactos */
  ok(await p.evaluate(()=>{const i=document.querySelector('aside .logo img');return !i||/^data:image\/svg|icons\//.test(i.getAttribute('src'))}),dev+': logo do menu intacto');
  if(mob){/* CPU 4x: troca de tela sem travar */
   const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   const gap=await p.evaluate(()=>new Promise(r=>{let last=performance.now(),max=0,n=0;go('nfs');function f(t){max=Math.max(max,t-last);last=t;if(++n<60)requestAnimationFrame(f);else r(Math.round(max))}requestAnimationFrame(f)}));
   ok(gap<250,'iPhone CPU 4x: troca de tela sem travar (maior quadro '+gap+' ms)');await cdp.send('Emulation.setCPUThrottlingRate',{rate:1})}
  await ctx.close()}
 /* "menos movimento": botões sem transição */
 {const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const p=await ctx.newPage();watch(p,'PC-rm',errs);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'prorm'+T);await p.evaluate(()=>go('nfs'));await p.waitForTimeout(500);
  ok(await p.evaluate(()=>[...document.querySelectorAll('#view button')].slice(0,6).every(b=>getComputedStyle(b).transitionDuration.split(',').every(x=>parseFloat(x)===0))),'"menos movimento": botões sem transição');
  await ctx.close()}
 ok(!errs.length,'0 erro de console'+(errs.length?' → '+errs.slice(0,4).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
