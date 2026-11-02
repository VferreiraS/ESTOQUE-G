/* v116: nenhum S vermelho — S de partículas (entrada e Início), S da abertura e logo da tela de entrar seguem a cor de destaque
   do tema (Lilás, Violeta + Lima, Cinza + Lima), PC 1440×900 e iPhone 13. Mede a cor real dos pixels. Prints: SHOTS=<pasta>. */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs'),path=require('path');
const OUT=process.env.SHOTS||path.join(require('os').tmpdir(),'stok-v116');fs.mkdirSync(OUT,{recursive:true});
const NEON={lilas:[231,184,239],violeta:[198,255,52],cinza:[199,255,46]};
const isRed=c=>c[0]>170&&c[1]<110&&c[2]<110;
const near=(c,t)=>Math.abs(c[0]-t[0])+Math.abs(c[1]-t[1])+Math.abs(c[2]-t[2])<120;
/* cor média dos pixels mais fortes do canvas de partículas */
const particle=sel=>{const cv=document.querySelector(sel);if(!cv)return null;const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let r=0,g=0,b=0,n=0,red=0;for(let i=0;i<d.length;i+=4){if(d[i+3]>200&&d[i]+d[i+1]+d[i+2]>200){r+=d[i];g+=d[i+1];b+=d[i+2];n++;if(d[i]>170&&d[i+1]<90&&d[i+2]<90)red++}}return n?{c:[r/n|0,g/n|0,b/n|0],n,red}:null};
const imgColor=async(p,sel)=>p.evaluate(async sel=>{const im=document.querySelector(sel);if(!im)return null;await new Promise(r=>{if(im.complete)r();else im.onload=r});const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');x.drawImage(im,0,0,64,64);const d=x.getImageData(0,0,64,64).data;let best=null,bs=-1;const cnt={};for(let i=0;i<d.length;i+=4){if(d[i+3]<200)continue;const s=Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2]);if(s>bs){bs=s;best=[d[i],d[i+1],d[i+2]]}}return best},sel);
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['pc',{viewport:{width:1440,height:900}}],['iphone',L.devices['iPhone 13']]]){
  for(const t of ['lilas','violeta','cinza']){
   const c=await b.newContext(opts);await c.addInitScript(t=>{localStorage.setItem('lojasg.estoque99.ui-theme',t);localStorage.removeItem('lojasg.estoque99.fx-pause')},t);
   const P=await c.newPage();P.on('pageerror',e=>errs.push(nome+' '+t+' '+e.message));P.on('dialog',d=>d.accept());
   /* abertura (só na 1ª abertura da sessão) */
   await P.addInitScript(()=>{try{sessionStorage.removeItem('e99-intro')}catch(e){}});
   await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1300);
   const intro=await P.evaluate(()=>{const m=document.querySelector('#stok-intro .si-mark');return m?getComputedStyle(m).fill:''});
   if(intro){const m=intro.match(/\d+/g).map(Number);ok(!isRed(m)&&near(m,NEON[t]),nome+' '+t+': S da abertura na cor do tema ('+intro+')');await P.screenshot({path:path.join(OUT,nome+'-'+t+'-abertura.png')})}
   else ok(true,nome+' '+t+': (abertura já tinha passado)');
   await P.waitForTimeout(5000);
   const logo=await imgColor(P,'#auth-screen .brand .logo img');ok(logo&&!isRed(logo)&&near(logo,NEON[t]),nome+' '+t+': logo da tela de entrar na cor do tema ('+logo+')');
   const pl=await P.evaluate(particle,'#auth-screen .fx-g');ok(pl&&pl.n>50&&pl.red/pl.n<.02&&!isRed(pl.c),nome+' '+t+': S de partículas da entrada sem vermelho ('+(pl&&pl.c)+')');
   await P.screenshot({path:path.join(OUT,nome+'-'+t+'-entrar.png')});
   await L.signup(P,'s6'+nome[0]+t+T);await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});go('home');scrollTo(0,0)});await P.waitForTimeout(5000);
   const ph=await P.evaluate(particle,'#view .hero-home .fx-g');ok(ph&&ph.n>50&&ph.red/ph.n<.02&&!isRed(ph.c),nome+' '+t+': S de partículas do Início sem vermelho ('+(ph&&ph.c)+')');
   const side=await imgColor(P,'.logo img');ok(side&&!isRed(side),nome+' '+t+': logo do menu sem vermelho');
   await P.screenshot({path:path.join(OUT,nome+'-'+t+'-inicio.png')});
   await c.close();
  }
 }
 /* trocar de tema com a página aberta recolore na hora */
 const c=await b.newContext({viewport:{width:1440,height:900}});const P=await c.newPage();P.on('pageerror',e=>errs.push('troca '+e.message));
 await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(5000);
 await P.evaluate(()=>e99Theme.set('violeta'));await P.waitForTimeout(1500);
 const after=await imgColor(P,'#auth-screen .brand .logo img');ok(after&&near(after,NEON.violeta),'trocar de tema recolore o logo na hora');
 const pp=await P.evaluate(particle,'#auth-screen .fx-g');ok(pp&&near(pp.c,NEON.violeta)||(pp&&pp.c[1]>pp.c[0]),'trocar de tema recolore as partículas na hora ('+(pp&&pp.c)+')');
 ok(/icon-192-v36\.png/.test(fs.readFileSync(path.join(__dirname,'..','manifest.webmanifest'),'utf8')),'ícones instalados (PNG do manifest) continuam os mesmos');
 console.log('shots',OUT);console.log('errors',errs);await b.close()})();
