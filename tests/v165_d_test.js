/* v165-d · paleta harmônica (app/css/v165-cores.css, docs/paleta.md).
   3 temas × PC/iPhone: tokens de cor existem; contraste AA dos pares da paleta (texto 1/2/3 × superfícies, tinta × acento, semânticas × fundo suave,
   texto × balões, nomes do chat); ≤3 matizes de acento por tela (fora semânticas); nenhum #fff/#000 puro como texto/superfície principal; 0 erro de console. */
const L=require('./lib.js');const {ok}=L;
const U=(process.env.BASE||'http://localhost:8000')+'/index.html';
const TOK=['--p-bg','--p-s1','--p-s2','--p-s3','--p-s4','--p-t1','--p-t2','--p-t3','--p-accent','--p-accent-ink','--p-accent-text','--p-accent-soft','--p-accent-line','--p-accent-2',
 '--p-ok','--p-warn','--p-danger','--p-info','--p-ok-soft','--p-danger-soft','--area-notas','--area-plano','--area-equipe','--area-chat','--area-painel','--area-corredores','--area-alertas',
 '--p-chart-1','--p-chart-5','--p-bubble-out','--p-bubble-in','--chat-name-1','--chat-name-8'];
const PAGE=(TOK)=>{const cs=getComputedStyle(document.body);const g=n=>cs.getPropertyValue(n).trim();
  const P=v=>{const m=String(v).match(/^#([0-9a-f]{6})$/i);if(m)return [0,2,4].map(i=>parseInt(m[1].substr(i,2),16)).concat(1);const r=String(v).match(/[\d.]+/g);return r?r.map(Number).concat(r.length<4?[1]:[]):null};
  const lin=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)},lum=c=>.2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2]);
  const over=(f,b)=>[0,1,2].map(i=>f[i]*f[3]+b[i]*(1-f[3]));const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  const miss=TOK.filter(n=>!g(n));const c=n=>P(g(n));const bad=[];const chk=(name,f,b,min)=>{const fb=over(f,b);const x=cr(fb,b);if(x<min)bad.push(name+' '+x.toFixed(2))};
  for(const s of ['--p-bg','--p-s1','--p-s2','--p-s3'])for(const t of ['--p-t1','--p-t2','--p-t3'])chk(t+'/'+s,c(t),c(s),4.5);
  chk('ink/acento',c('--p-accent-ink'),c('--p-accent'),4.5);chk('acento-texto/s1',c('--p-accent-text'),c('--p-s1'),4.5);
  for(const k of ['ok','warn','danger','info']){const soft=over(c('--p-'+k+'-soft'),c('--p-s1'));chk(k+'/suave',c('--p-'+k),soft,4.5)}
  chk('balão enviado',c('--p-bubble-out-ink'),c('--p-bubble-out'),4.5);chk('balão recebido',c('--p-bubble-in-ink'),c('--p-bubble-in'),4.5);
  for(let i=1;i<=8;i++)chk('nome '+i,c('--chat-name-'+i),c('--p-s2'),4.5);
  for(const a of ['notas','plano','equipe','chat','painel','corredores','alertas'])chk('área '+a,c('--area-'+a),c('--p-s1'),4.5);
  const pure=[...document.querySelectorAll('#view h1,#view .stat strong,#view .pn-kpi strong,body')].filter(e=>{const s=getComputedStyle(e);return /rgb\(255, 255, 255\)/.test(s.color)||(e===document.body&&false)});
  const bgPure=['--p-bg','--p-s1','--p-t1'].filter(n=>/^#(000000|ffffff)$/i.test(g(n)));
  /* matizes de acento visíveis (fora semânticas e badges de status) */
  const hue=(r,gg,b)=>{r=lin(r);gg=lin(gg);b=lin(b);const l=Math.cbrt(.4122*r+.5363*gg+.0514*b),m=Math.cbrt(.2119*r+.6807*gg+.1074*b),s=Math.cbrt(.0883*r+.2817*gg+.63*b);const A=1.978*l-2.4286*m+.4506*s,B=.0259*l+.7828*m-.8087*s;let H=Math.atan2(B,A)*180/Math.PI;return [Math.hypot(A,B),(H+360)%360]};
  const bins=new Set();document.querySelectorAll('#view *,aside *,#mobile-bottom *').forEach(e=>{if(e.closest('.badge,.notice,.danger,.logo,.chat-msg .who,.vd-av,.avatar,.sc-av'))return;const r=e.getBoundingClientRect();if(!r.width)return;const s=getComputedStyle(e);
    for(const v of [s.color,s.backgroundColor,e instanceof SVGElement?s.stroke:'',e instanceof SVGElement?s.fill:'']){const p=P(v);if(!p||p[3]<.3)continue;const [C,H]=hue(p[0],p[1],p[2]);if(C>.06)bins.add(Math.round(H/40)%9)}});
  return {miss,bad,pure:pure.length,bgPure,bins:bins.size}};
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 for(const dev of ['PC','iPhone']){const ctx=await b.newContext(dev==='iPhone'?L.devices['iPhone 13']:{viewport:{width:1440,height:900}});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(dev+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(dev+' '+m.text())});
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'cor'+dev.toLowerCase()+T);
  for(const th of ['lilas','violeta','cinza']){await p.evaluate(t=>e99Theme.set(t),th);
   for(const pg of ['home','nfs','plans','chat']){await p.evaluate(pg=>go(pg),pg);await p.waitForTimeout(500);const r=await p.evaluate(PAGE,TOK);
    if(pg==='home'){ok(!r.miss.length,dev+' '+th+': tokens de cor definidos'+(r.miss.length?' (faltam '+r.miss.join(',')+')':''));
     ok(!r.bad.length,dev+' '+th+': pares da paleta com contraste AA'+(r.bad.length?' → '+r.bad.join(' | '):''));ok(!r.bgPure.length,dev+' '+th+': sem #000/#fff puro nos tokens principais')}
    ok(!r.pure,dev+' '+th+' '+pg+': nenhum título/número em branco puro');ok(r.bins<=3,dev+' '+th+' '+pg+': '+r.bins+' matiz(es) de acento na tela (≤3)')}}
  await ctx.close()}
 ok(!errs.length,'0 erro de console'+(errs.length?' → '+errs.slice(0,3).join(' | '):''));await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
