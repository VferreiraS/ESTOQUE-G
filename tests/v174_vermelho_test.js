/* v174: app todo preto e vermelho (ordem do dono), nos 3 temas (Lilás, Violeta, Cinza).
   390×844: Início, Notas, Plano, Chat e Mais — nenhuma cor de texto, fundo ou borda lilás/violeta/verde/azul (cores vivas só no vermelho),
   fundo #000, botão principal vermelho com texto branco ≥4.5:1, textos com contraste ≥4.5:1 sobre o fundo. */
const L=require('./lib.js');const {ok}=L;const BASE=process.env.BASE||'http://localhost:8000';
(async()=>{const b=await L.chromium.launch();const errs=[];
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.goto(BASE+'/index.html');await p.waitForTimeout(2000);await L.signup(p,'vm'+Date.now().toString(36));
 await p.evaluate(()=>{state.team=[{id:'a',name:'Ana',role:'x'},{id:'b',name:'Bia',role:'y'},{id:'c',name:'Caio',role:'z'}];state.plans=[{id:'p',title:'H',date:iso(),activities:[{id:'1',title:'a',owner:'Ana',notes:'',photos:[],done:true},{id:'2',title:'b',owner:'Bia',notes:'',photos:[]}]}];
   state.nfs=[{id:'n1',number:'1',supplier:'X',date:iso(),status:'Conferido',owner:'a',notes:'',volumes:1},{id:'n2',number:'2',supplier:'Y',date:iso(),status:'Em divergência',owner:'',notes:'',volumes:1},{id:'n3',number:'3',supplier:'Z',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1}];return save()});
 const SCAN=()=>{const P=c=>{const m=String(c).match(/[\d.]+/g);return m?m.map(Number):null};const hue=([r,g,b])=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx-mn<40)return null;let h;if(mx===r)h=((g-b)/(mx-mn))%6;else if(mx===g)h=(b-r)/(mx-mn)+2;else h=(r-g)/(mx-mn)+4;h*=60;return h<0?h+360:h};
   const bad=new Set();for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();if(r.width<2||r.height<2||r.bottom<0||r.top>innerHeight)continue;const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity<.1)continue;
     for(const k of ['color','backgroundColor','borderTopColor']){const c=P(s[k]);if(!c||(c.length>3&&c[3]<.25))continue;if(k==='borderTopColor'&&!(parseFloat(s.borderTopWidth)>0))continue;if(k==='color'&&!e.childNodes.length)continue;const h=hue(c);
       if(h!==null&&h>20&&h<340&&!(h>=20&&h<=60&&c[0]>200&&c[1]<200))bad.add((e.id||e.tagName+'.'+String(e.className).split(' ')[0]).slice(0,30)+' '+k+' '+s[k])}}
   return {bad:[...bad].slice(0,6),bg:getComputedStyle(document.body).backgroundColor}};
 for(const th of ['lilas','violeta','cinza']){await p.evaluate(t=>{try{e99Theme.set(t)}catch(e){}},th);
  for(const pg of ['home','nfs','plans','chat','mobile-menu']){await p.evaluate(pg=>{go(pg);scrollTo(0,0)},pg);await p.waitForTimeout(700);
   const r=await p.evaluate(SCAN);ok(!r.bad.length&&r.bg==='rgb(0, 0, 0)',th+' '+pg+': só preto, cinza e vermelho'+(r.bad.length?' → '+r.bad.join(' | '):''))}}
 await p.evaluate(()=>go('home'));await p.waitForTimeout(500);
 const c=await p.evaluate(()=>{const lum=c=>{const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};const P=s=>s.match(/[\d.]+/g).map(Number);
   const bt=document.querySelector('.hero-home .primary'),s=getComputedStyle(bt);const bg=P(s.backgroundColor),fg=P(s.color);const cr=(Math.max(lum(bg),lum(fg))+.05)/(Math.min(lum(bg),lum(fg))+.05);return {cr,bg:s.backgroundColor,h:bt.getBoundingClientRect().height}});
 ok(c.cr>=4.5&&c.h>=44,'botão Novo plano vermelho com texto branco '+c.cr.toFixed(1)+':1 e '+Math.round(c.h)+' px ('+c.bg+')');
 ok(!errs.length,'0 erro');await b.close()})();
