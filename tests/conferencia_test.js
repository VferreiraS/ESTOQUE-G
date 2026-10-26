/* v96: conferência às cegas por câmera (Notas fiscais).
   A) câmera falsa do Chromium com um vídeo de etiqueta EAN-13 (leitor ZXing de verdade) no tamanho do iPhone 13;
   B) leitor falso (e99Conf.feed) para a máquina de estados quadro a quadro, sem permissão de câmera;
   C) gestor + auxiliar pelo ntfy falso: offline e volta sem duplicar, papéis. */
/* v97: D) etiqueta de PERTO (código maior que o retângulo, levemente borrado) com câmera que expõe foco/zoom/lanterna (getCapabilities simulado);
   E) duas câmeras (trocar câmera de verdade) e ajuda depois de 5 s sem leitura; F) PC e iPhone com/sem Efeitos e "menos movimento" (holograma não atrapalha a leitura). */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs'),os=require('os'),path=require('path');
const URL0='http://localhost:8000/index.html?ntfy='+L.N;
/* ---------- vídeo y4m com EAN-13 (2 s com a etiqueta, 1,6 s sem: folga sobre o rearme de 1,2 s quando a máquina está carregada) ---------- */
const LC=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],RC=LC.map(s=>s.replace(/./g,c=>c==='0'?'1':'0')),GC=RC.map(s=>s.split('').reverse().join(''));
const PAR=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
function dv(s){let sum=0;for(let i=0;i<s.length;i++){const d=+s[s.length-1-i];sum+=i%2===0?d*3:d}return String((10-sum%10)%10)}
function ean13Bits(code){const d=code.split('').map(Number),p=PAR[d[0]];let b='101';for(let i=1;i<=6;i++)b+=(p[i-1]==='L'?LC:GC)[d[i]];b+='01010';for(let i=7;i<=12;i++)b+=RC[d[i]];return b+'101'}
const EAN_A='789100031550'+dv('789100031550'),EAN_B='789650'+'00012'+'0',EB=EAN_B.slice(0,12)+dv(EAN_B.slice(0,12)),ITF14='1789100031550'+dv('1789100031550');
function y4m(file){const W=640,H=480,F=10,bits=ean13Bits(EAN_A),mw=4,x0=Math.floor((W-bits.length*mw)/2),fr=Buffer.alloc(W*H*3/2),blank=Buffer.alloc(W*H*3/2);
  fr.fill(235,0,W*H);fr.fill(128,W*H);blank.fill(90,0,W*H);blank.fill(128,W*H);
  for(let y=150;y<330;y++)for(let i=0;i<bits.length;i++)if(bits[i]==='1')fr.fill(16,y*W+x0+i*mw,y*W+x0+(i+1)*mw);
  const out=[Buffer.from(`YUV4MPEG2 W${W} H${H} F${F}:1 Ip A1:1 C420jpeg\n`)];for(let k=0;k<36;k++){out.push(Buffer.from('FRAME\n'));out.push(k<20?fr:blank)}fs.writeFileSync(file,Buffer.concat(out))}
/* etiqueta de perto: barras ocupam quase a largura toda (passam do retângulo da tela) e a altura toda, com leve desfoque */
function y4mClose(file){const W=640,H=480,F=10,bits=ean13Bits(EAN_A),mw=6,x0=Math.floor((W-bits.length*mw)/2),row=new Uint8Array(W).fill(235);
  for(let i=0;i<bits.length;i++)if(bits[i]==='1')row.fill(16,x0+i*mw,x0+(i+1)*mw);const sm=new Uint8Array(W);for(let x=0;x<W;x++){let a=0,n=0;for(let d=-1;d<=1;d++){const k=x+d;if(k>=0&&k<W){a+=row[k];n++}}sm[x]=Math.round(a/n)}
  const fr=Buffer.alloc(W*H*3/2);for(let y=0;y<H;y++)fr.set(sm,y*W);fr.fill(128,W*H);const out=[Buffer.from(`YUV4MPEG2 W${W} H${H} F${F}:1 Ip A1:1 C420jpeg\n`)];for(let k=0;k<10;k++){out.push(Buffer.from('FRAME\n'));out.push(fr)}fs.writeFileSync(file,Buffer.concat(out))}
/* lanterna/foco/zoom: o Chromium de teste não tem; simulamos o que o celular expõe e registramos cada applyConstraints */
const CAPS=()=>{if(!window.MediaStreamTrack||!navigator.mediaDevices)return;const P=MediaStreamTrack.prototype,gc=P.getCapabilities,gs=P.getSettings;let cur={};window.__ac=[];
  P.getCapabilities=function(){return Object.assign({},gc?gc.call(this):{},{focusMode:['manual','single-shot','continuous'],exposureMode:['manual','continuous'],zoom:{min:1,max:5,step:.1},torch:true})};
  P.getSettings=function(){return Object.assign({},gs.call(this),cur)};P.applyConstraints=function(o){window.__ac.push(JSON.stringify(o));cur=Object.assign({},o&&o.advanced&&o.advanced[0]||{});return Promise.resolve()};
  const md=navigator.mediaDevices,gum=md.getUserMedia.bind(md);md.getUserMedia=c=>{window.__gum=JSON.stringify(c);return gum(c)}};
async function openConf(p,login,setup){await p.goto(URL0);await p.waitForSelector('#auth-form input[name=login]');await p.waitForTimeout(600);await L.signup(p,login);await setupNF(p);await p.click('#conf-go')}
const shine=p=>p.evaluate(()=>document.getAnimations().filter(a=>a.animationName==='cf-shine').map(a=>a.playState).join(','));
const NO_CAM=()=>{try{navigator.mediaDevices.getUserMedia=()=>Promise.reject(new DOMException('negado','NotAllowedError'))}catch(e){}};
async function setupNF(p){await p.evaluate(async()=>{state.team=[{id:'ana',name:'Ana',role:'Repositora'}];state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios Serra',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:437,declaredVolumes:437,items:[]}];await save();go('nfs')});await p.waitForTimeout(400)}
const count=p=>p.evaluate(()=>{const c=document.getElementById('cf-count');return c?+c.textContent:-1});
const st=p=>p.evaluate(()=>e99Conf.state());
(async()=>{const file=path.join(os.tmpdir(),'e99-conf-ean13.y4m');y4m(file);const errs=[];
 const b=await L.chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-video-capture='+file]});

 /* ================= A) câmera falsa + ZXing ================= */
 {const c=await b.newContext({...L.devices['iPhone 13'],permissions:['camera']});const p=await c.newPage();p.on('pageerror',e=>errs.push('A '+e.message));p.on('dialog',d=>d.accept(d.defaultValue()));
  await p.goto(URL0);await p.waitForSelector('#auth-form input[name=login]');await p.waitForTimeout(600);await L.signup(p,'confa'+Date.now().toString(36));await setupNF(p);
  ok(await p.isVisible('#conf-go')&&/INICIAR CONFERÊNCIA POR CÂMERA/.test(await p.textContent('#conf-go')),'botão principal "INICIAR CONFERÊNCIA POR CÂMERA" na tela de Notas fiscais');
  ok(await p.evaluate(()=>{const b=document.getElementById('conf-go').getBoundingClientRect();return b.height>=44&&b.width>=200}),'botão grande (≥44 px)');
  await p.click('#conf-go');
  ok(await until(p,()=>{const v=document.getElementById('cf-video');return !!(v&&v.videoWidth>0&&document.getElementById('conf-dlg').open)},null,15000),'pede a câmera e mostra a imagem (câmera falsa do Chromium)');
  ok(await until(p,()=>{const a=document.getElementById('cf-ask');return a&&!a.hidden},null,20000),'ZXing leu a etiqueta EAN-13 do vídeo e pergunta se é código da caixa');
  ok(await p.evaluate(e=>document.getElementById('cf-ask').textContent.includes(e),EAN_A),'pergunta mostra o código lido ('+EAN_A+')');
  await p.click('#cf-yes');ok(await until(p,()=>+document.getElementById('cf-count').textContent===1,null,5000),'"Sim" conta 1 volume (contador 01)');
  await p.waitForTimeout(4500);ok(await count(p)===1,'etiqueta aparecendo de novo no vídeo não conta sem "Próxima caixa" (modo toque)');
  ok(await p.isVisible('#cf-next')&&await p.isEnabled('#cf-next'),'botão "Próxima caixa" fica ativo depois de contar');
  await p.click('#cf-next');ok(await until(p,()=>+document.getElementById('cf-count').textContent===2,null,12000),'depois de "Próxima caixa" a mesma etiqueta conta de novo (02)');
  ok(await p.evaluate(()=>!document.getElementById('conf-dlg').classList.contains('holo-off')&&document.getAnimations().some(a=>a.animationName==='cf-shine'&&a.playState==='running')),'v97: holograma ligado (brilho correndo no contador) enquanto a câmera lê');
  ok(await p.isHidden('#cf-torch')&&await p.isHidden('#cf-switch')&&await p.evaluate(()=>e99Conf.cam().devs===1),'v97: câmera do teste sem lanterna e só 1 câmera: "Lanterna" e "Trocar câmera" não aparecem');
  ok(await p.isVisible('#cf-focus'),'v97: "Ajustar foco" visível com a câmera ligada');
  await p.click('#cf-histbtn');const hl=await p.evaluate(()=>({li:[...document.querySelectorAll('#cf-hist li')].map(l=>l.textContent),n:e99Conf.current().reads.length,hn:document.getElementById('cf-hn').textContent}));
  ok(await p.isVisible('#cf-hsheet')&&hl.li.length===hl.n&&hl.n===2&&hl.li.every(t=>t.includes(EAN_A))&&hl.hn==='2','v97: gaveta do histórico sobe e lista as leituras reais ('+hl.li.length+')');
  await p.click('#cf-hclose');ok(await p.isHidden('#cf-hsheet'),'v97: gaveta fecha');
  ok(await p.evaluate(e=>document.getElementById('cf-last').textContent.includes(e)&&document.getElementById('cf-last').textContent.includes('final '+e.slice(-4)),EAN_A),'v97: linha "Último: código (final ****)"');
  if(process.env.SHOT){await p.evaluate(()=>{document.getElementById('conf-dlg').scrollTop=0});await until(p,()=>{const v=document.getElementById('cf-video'),c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const g=c.getContext('2d');g.drawImage(v,0,0);const d=g.getImageData(0,c.height>>1,c.width,1).data;let mn=255;for(let i=0;i<d.length;i+=4)mn=Math.min(mn,d[i]);return mn<60},null,5000);await p.screenshot({path:process.env.SHOT})}
  await p.click('#cf-histbtn');await p.check('#cf-autochk');await p.click('#cf-hclose');ok(await until(p,()=>+document.getElementById('cf-count').textContent>=4,null,20000),'rearme automático: conta de novo a cada vez que a etiqueta sai e volta ('+await count(p)+')');
  await p.click('#cf-histbtn');await p.uncheck('#cf-autochk');await p.click('#cf-hclose');
  const lay=await p.evaluate(()=>{const d=document.getElementById('conf-dlg'),r=d.getBoundingClientRect(),small=[...d.querySelectorAll('button')].filter(b=>b.offsetParent&&b.getBoundingClientRect().height<44).map(b=>b.id||b.textContent);return {w:r.width,sx:d.scrollWidth-d.clientWidth,doc:document.documentElement.scrollWidth,small}});
  ok(lay.w<=390&&lay.sx<=0&&lay.doc<=390&&!lay.small.length,'iPhone 13: janela cabe em 390 px, sem rolagem lateral, toques ≥44 px ('+JSON.stringify(lay)+')');
  await p.click('#cf-pause');ok(await until(p,()=>{const v=document.getElementById('cf-video');return !v.srcObject&&e99Conf.state().status==='pausada'},null,5000),'Pausar desliga a câmera e a conferência fica pausada');
  {const n0=await count(p);await p.waitForTimeout(2500);ok(await count(p)===n0&&await p.isVisible('#cf-resume')&&await p.isDisabled('#cf-next'),'v97: pausada não lê nada ("Continuar" na câmera, "Próxima caixa" inativa)')}
  await p.click('#cf-pause');ok(await until(p,()=>{const v=document.getElementById('cf-video');return v.srcObject&&v.videoWidth>0&&e99Conf.state().status==='ativa'},null,10000),'Continuar liga a câmera de novo');
  await p.click('#cf-x');ok(await until(p,()=>!document.getElementById('conf-dlg').open&&e99Conf.state().status==='pausada',null,5000),'fechar a janela pausa (não finaliza)');
  await c.close()}

 /* ================= B) leitor falso, sem permissão de câmera ================= */
 const c=await b.newContext({...L.devices['iPhone 13']});await c.addInitScript(NO_CAM);let p=await c.newPage();p.on('pageerror',e=>errs.push('B '+e.message));p.on('dialog',d=>d.accept(d.defaultValue()));
 await p.goto(URL0);await p.waitForSelector('#auth-form input[name=login]');await p.waitForTimeout(600);const login='confb'+Date.now().toString(36);await L.signup(p,login);await setupNF(p);
 await p.click('#conf-go');
 ok(await until(p,()=>/Permissão da câmera negada/.test(document.getElementById('cf-msg').textContent),null,8000),'sem permissão: mensagem clara ("Permissão da câmera negada…")');
 ok(await p.isVisible('#cf-retry')&&await p.isVisible('#cf-manual'),'sem permissão: "Tentar de novo" e "Volume à mão" continuam disponíveis');
 const blind=await p.evaluate(()=>{const t=document.getElementById('conf-dlg').innerText;return {t:/48213|Laticínios|437/.test(t),hid:getComputedStyle(document.getElementById('view')).visibility==='hidden'}});
 ok(!blind.t&&blind.hid,'às cegas: nada da NF (número 48213, fornecedor, 437 volumes) na tela da contagem e a lista fica escondida');
 await p.evaluate(()=>e99Conf.arm());
 const F=(code,fmt,t)=>p.evaluate(([c,f,t])=>e99Conf.feed(c?{text:c,format:f}:null,t),[code,fmt,t]);
 await F(EAN_A,'EAN_13',1000);ok((await st(p)).total===0,'uma leitura sozinha não conta (precisa de 2 iguais em 600 ms)');
 await F(EAN_A,'EAN_13',1120);ok(await until(p,()=>!document.getElementById('cf-ask').hidden,null,3000),'1ª leitura do código: pergunta se é da caixa');
 await p.click('#cf-yes');ok(await until(p,()=>e99Conf.state().total===1&&+document.getElementById('cf-count').textContent===1),'leitura válida: +1 (01)');
 for(let t=1240;t<=6000;t+=120)await F(EAN_A,'EAN_13',t);ok((await st(p)).total===1&&(await st(p)).machine==='travado','código parado por 5 s conta 1 vez só');
 await F(EB,'EAN_13',6100);await F(EB,'EAN_13',6220);ok((await st(p)).total===1&&/Outro código/.test(await p.textContent('#cf-msg')),'outro código com a tela travada não conta e avisa');
 await p.click('#cf-next');await F(EAN_A,'EAN_13',7000);await F(EAN_A,'EAN_13',7120);ok(await until(p,()=>e99Conf.state().total===2),'mesmo código depois de rearmar ("Próxima caixa") conta de novo');
 await p.click('#cf-next');await F(EB,'EAN_13',8000);await F(EB,'EAN_13',8100);await until(p,()=>!document.getElementById('cf-ask').hidden,null,3000);await p.click('#cf-yes');
 ok(await until(p,()=>e99Conf.state().total===3),'código diferente em sequência conta (03)');
 await p.click('#cf-next');await F(ITF14,'ITF',9000);await F(ITF14,'ITF',9120);ok(await until(p,()=>e99Conf.state().total===4)&&await p.isHidden('#cf-ask'),'ITF-14 é caixa: conta direto, sem perguntar');
 await p.click('#cf-next');const bad=EAN_A.slice(0,12)+((+EAN_A[12]+1)%10);
 for(const [code,fmt,t] of [[bad,'EAN_13',10000],[bad,'EAN_13',10120],['178910003155','ITF',10500],['178910003155','ITF',10620],['https://x','QR_CODE',11000],['https://x','QR_CODE',11120],['<b>x</b>','CODE_128',11500],['<b>x</b>','CODE_128',11620]])await F(code,fmt,t);
 ok((await st(p)).total===4,'inválidos não contam: EAN com dígito errado, ITF ≠14, QR, Code 128 com caracteres estranhos');
 {const bits=ean13Bits(EAN_A);const r=await p.evaluate(async([bits,e])=>{const mk=blur=>{const c=document.createElement('canvas');c.width=1280;c.height=360;const g=c.getContext('2d');g.fillStyle='#ececec';g.fillRect(0,0,1280,360);g.fillStyle='#111';for(let i=0;i<bits.length;i++)if(bits[i]==='1')g.fillRect(70+i*12,40,12,280);
     if(!blur)return c;const d=document.createElement('canvas');d.width=1280;d.height=360;const h=d.getContext('2d');h.fillStyle='#ececec';h.fillRect(0,0,1280,360);h.filter='blur('+blur+'px)';h.drawImage(c,0,0);return d};
   const sharp=await e99Conf.scan(mk(0)),soft=await e99Conf.scan(mk(2)),bl=await e99Conf.scan(mk(18)),q=e99Conf.quality(mk(18));const before=e99Conf.state().total;
   await e99Conf.feedScan(mk(18),11700);await e99Conf.feedScan(mk(18),11800);return {sharp,soft,bl,q,before,after:e99Conf.state().total}},[bits,EAN_A]);
  ok(r.sharp.text===EAN_A&&r.soft.text===EAN_A,'v97: leitor (ZXing com TRY_HARDER) lê etiqueta nítida e levemente desfocada');
  ok(r.bl.blur===true&&r.after===r.before,'v97: quadro borrado é descartado e não conta (nitidez '+(r.q.sharp||0).toFixed(3)+', contraste '+r.q.range+')')}
 ok(await p.evaluate(()=>[e99Conf.check('12345670','EAN_8'),e99Conf.check('036000291452','UPC_A'),e99Conf.check('ABC-123','CODE_128')].every(Boolean)&&!e99Conf.check('12345678','EAN_8')&&!e99Conf.check('abc','CODE_128')),'validação: EAN-8, UPC-A e Code 128 aceitos; dígito/tamanho errados recusados');
 const D1='789123456789'+dv('789123456789');await F(D1,'EAN_13',12000);await F(D1,'EAN_13',12100);await until(p,()=>!document.getElementById('cf-ask').hidden,null,3000);await p.click('#cf-no');
 await F(D1,'EAN_13',13000);await F(D1,'EAN_13',13100);ok((await st(p)).total===4&&await p.isHidden('#cf-ask'),'"Não, é do produto": esse código não conta e não pergunta de novo');
 await F(EAN_A,'EAN_13',14000);await F(EAN_A,'EAN_13',14100);await until(p,()=>e99Conf.state().total===5);
 await p.click('#cf-histbtn');await p.check('#cf-autochk');await p.click('#cf-hclose');for(let t=14300;t<=15200;t+=120)await F(null,null,t);ok((await st(p)).machine==='travado','automático: menos de 1,2 s sem código ainda não rearma');
 await F(null,null,15500);ok((await st(p)).machine==='armado','automático: 1,2 s sem código rearma');
 await F(EAN_A,'EAN_13',15700);await F(EAN_A,'EAN_13',15800);ok(await until(p,()=>e99Conf.state().total===6),'automático: a etiqueta voltou e contou (06)');
 await p.click('#cf-histbtn');await p.uncheck('#cf-autochk');await p.click('#cf-hclose');
 await p.click('#cf-undo');ok(await until(p,()=>e99Conf.state().total===5&&+document.getElementById('cf-count').textContent===5),'desfazer: volta para 05');
 await p.click('#cf-manual');await p.fill('#cf-mcode','<img src=x onerror=window.__xss=1>');await p.click('#cf-manual-form button[type=submit]');await p.waitForTimeout(400);
 ok((await st(p)).total===5&&!(await p.evaluate(()=>window.__xss)),'manual: código com HTML é recusado (não vira HTML)');
 await p.fill('#cf-mcode','CX-01');await p.click('#cf-manual-form button[type=submit]');await until(p,()=>e99Conf.state().total===6);
 await p.click('#cf-manual');await p.fill('#cf-mcode','');await p.click('#cf-manual-form button[type=submit]');ok(await until(p,()=>e99Conf.state().total===7),'manual: com código e sem código (07)');
 const id=(await st(p)).id;
 let rec=await p.evaluate(i=>e99Conf.idbReads(i),id);
 ok(rec.length===8&&rec.filter(r=>r.st==='v').length===7&&rec.filter(r=>r.st==='x').length===1&&rec.every((r,i)=>r.seq===i+1)&&rec.filter(r=>r.m==='h').length===2&&rec.every(r=>r.at>0&&typeof r.code==='string'),'IndexedDB: 8 registros (seq 1–8, data/hora, código, método), 1 desfeito, 2 manuais');
 await p.click('#cf-histbtn');{const li=await p.$$eval('#cf-hist li',l=>l.map(x=>({t:x.textContent,x:x.classList.contains('x')})));
  ok(li.length===rec.length&&li.filter(l=>l.x).length===1&&li.filter(l=>/manual/.test(l.t)).length===2&&li[li.length-1].t.includes(rec[0].code),'v97: histórico = registros do IndexedDB (8, 1 desfeita riscada, 2 manuais)')}await p.click('#cf-hclose');
 ok(await p.evaluate(()=>+document.getElementById('cf-count').textContent===e99Conf.current().reads.filter(r=>r.st==='v').length),'v97: contador = leituras válidas (depois de desfazer e manual)');
 const raw=await p.evaluate(()=>e99Conf.rawRows().then(r=>JSON.stringify(r.map(x=>({id:x.id,acct:x.acct,conf:x.conf,seq:x.seq,ct:Array.from(x.ct).slice(0,40)})))));
 ok(!raw.includes(EAN_A)&&!raw.includes('CX-01')&&/"ct":\[/.test(raw),'IndexedDB cifrado: código não aparece em claro');
 await p.evaluate(()=>e99Conf.checkpoint());
 const integ=await p.evaluate(i=>{const c=state.confs.find(x=>x.id===i);return {screen:+document.getElementById('cf-count').textContent,mem:e99Conf.state().total,state:c.total,valid:c.reads.filter(r=>r[5]==='v').length,fixes:c.fixes.map(f=>f[3]).join(','),csv:e99Conf.csv(i)}},id);
 ok(integ.screen===7&&integ.mem===7&&integ.state===7&&integ.valid===7&&integ.fixes==='undo,add,add','integridade: tela = IndexedDB = state.confs = 7; correções registradas ('+integ.fixes+')');
 ok(/Total de volumes";"7"/.test(integ.csv)&&/"CX-01";"1"/.test(integ.csv)&&/Desfez/.test(integ.csv)&&integ.csv.charCodeAt(0)===0xfeff,'CSV (abre no Excel): total, quantidade por código e correções');
 /* fechar de repente e reabrir */
 await c.setOffline(true);await p.close();p=await c.newPage();p.on('pageerror',e=>errs.push('B2 '+e.message));p.on('dialog',d=>d.accept(d.defaultValue()));await c.setOffline(false);
 await p.goto(URL0);await p.waitForSelector('#auth-form input[name=login]');await p.waitForTimeout(600);await L.login(p,login);await p.evaluate(()=>go('nfs'));
 ok(await until(p,()=>{const b=document.querySelector('.conf-banner');return b&&/interrompida · 7 volume/.test(b.textContent)},null,8000),'reabrir: aviso "Conferência … interrompida · 7 volume(s) salvos"');
 ok(await p.evaluate(i=>state.confs.some(c=>c.id===i&&c.total===7),id),'persistência: state.confs passou pelo validate() e continua depois de sair e entrar');
 await p.click('.conf-banner button.primary');ok(await until(p,()=>document.getElementById('conf-dlg').open&&+document.getElementById('cf-count').textContent===7,null,8000),'Continuar: recupera a sessão com 07');
 await p.evaluate(()=>e99Conf.arm());await p.evaluate(e=>{e99Conf.feed({text:e,format:'EAN_13'},50000);e99Conf.feed({text:e,format:'EAN_13'},50100)},EAN_A);
 ok(await until(p,()=>e99Conf.state().total===8&&e99Conf.state().seq===9),'depois de recuperar: lembra a regra do código e a sequência continua (seq 9)');
 /* offline: continua contando e salvando no aparelho */
 await c.setOffline(true);await p.click('#cf-manual');await p.fill('#cf-mcode','');await p.click('#cf-manual-form button[type=submit]');
 ok(await until(p,()=>e99Conf.state().total===9)&&/Salvo no aparelho/.test(await p.textContent('#cf-save')),'sem internet: conta e mostra "Salvo no aparelho"');await c.setOffline(false);
 /* finalizar e relatório */
 await p.click('#cf-finish');ok(await until(p,()=>/Relatório/.test(document.getElementById('cf-title').textContent),null,5000),'Finalizar (com confirmação) abre o relatório');
 const rep=await p.evaluate(()=>document.getElementById('conf-dlg').innerText);
 ok(/Total de volumes\s*9/.test(rep)&&/Pela câmera\s*6/.test(rep)&&/À mão\s*3/.test(rep)&&/Desfeitas\s*1/.test(rep)&&/Correções/.test(rep),'relatório: total 9, câmera 6, à mão 3, desfeitas 1, correções');
 ok(await p.evaluate(i=>state.confs.find(c=>c.id===i).status==='finalizada'&&state.confs.find(c=>c.id===i).end!=='',id),'finalizada gravada com término');
 ok(await p.isVisible('#cf-csv')&&await p.isVisible('#cf-pdf'),'botões "Baixar planilha (Excel/CSV)" e "PDF / Imprimir"');
 {const [dl]=await Promise.all([p.waitForEvent('download',{timeout:8000}).catch(()=>null),p.click('#cf-csv')]);let txt='';if(dl){const f=await dl.path();txt=fs.readFileSync(f,'utf8')}
  const rows=txt.split('\r\n').filter(l=>/^"?\d+"?;.*;"?(Câmera|Manual)"?;"?(Válida|Desfeita)"?$/.test(l));
  ok(dl&&/\.csv$/.test(dl.suggestedFilename())&&rows.length===10&&/Total de volumes";"9"/.test(txt),'v97: "Baixar planilha" baixa o CSV com as 10 leituras reais e total 9 ('+rows.length+')');
  const html=await p.evaluate(async()=>{let out='';const w0=window.open;window.open=()=>({document:{open(){},write(h){out+=h},close(){}},focus(){},print(){}});document.getElementById('cf-pdf').click();window.open=w0;return out});
  ok((html.match(/<tr class="(x)?"><td>\d+<\/td>/g)||[]).length===10&&/Total de volumes<\/th><td>9/.test(html),'v97: "PDF / Imprimir" monta a página com as 10 leituras e total 9')}
 ok(await p.isVisible('#cf-assoc-sel'),'gestor/estoque: "Associar a uma NF" depois de finalizar');
 await p.selectOption('#cf-assoc-sel','n1');await p.click('#cf-assoc-go');
 ok(await until(p,()=>{const c=document.getElementById('cf-cmp');return c&&/Divergência: contados 9 de 437/.test(c.textContent)},null,5000),'comparação depois de associar: "contados 9 de 437"');
 await p.click('#cf-mark');ok(await until(p,()=>state.nfs[0].status==='Em divergência'&&/Contados 9 de 437/.test(state.nfs[0].notes)),'"Marcar NF em divergência" com a nota pronta');
 await p.click('#cf-close');ok(await p.evaluate(()=>!document.body.classList.contains('conf-on')&&getComputedStyle(document.getElementById('view')).visibility==='visible'),'fechar o relatório mostra a tela de novo');
 ok(await until(p,()=>!document.querySelector('.conf-banner')&&/Conferências por câmera \(1\)/.test(document.getElementById('conf-cta').textContent),null,4000),'sem aviso de interrompida; lista "Conferências por câmera (1)"');
 await c.close();

 /* ================= C) equipe: gestor + auxiliar pelo ntfy ================= */
 const cA=await b.newContext();await cA.addInitScript(NO_CAM);const A=await cA.newPage();A.on('pageerror',e=>errs.push('GA '+e.message));A.on('dialog',d=>d.accept(d.defaultValue()));
 const cB=await b.newContext();await cB.addInitScript(NO_CAM);const B=await cB.newPage();B.on('pageerror',e=>errs.push('AB '+e.message));B.on('dialog',d=>d.accept(d.defaultValue()));
 ok(await L.gestorWithTeam(A,'confg'+Date.now().toString(36)),'gestor com equipe');const link=await L.makeInvite(A,'Ana');await L.auxAccept(B,link,null,'4321');
 ok(await until(B,()=>state.nfs.some(n=>n.number==='48213'),null,30000),'auxiliar recebeu as NFs');
 await B.evaluate(()=>go('nfs'));await B.waitForTimeout(400);
 ok(await B.evaluate(()=>{const th=document.querySelector('#nf-results th:nth-child(3)'),td=document.querySelector('#nf-results td:nth-child(3)');return isAux()&&th&&getComputedStyle(th).display==='none'&&td&&getComputedStyle(td).display==='none'}),'auxiliar: coluna Volumes escondida na lista de NFs');
 await B.click('#conf-go');await until(B,()=>document.getElementById('conf-dlg').open);await B.evaluate(()=>e99Conf.arm());
 await cB.setOffline(true);
 for(let k=0;k<5;k++){const t=20000+k*2000;await B.evaluate(([e,t])=>{e99Conf.feed({text:e,format:'ITF'},t);e99Conf.feed({text:e,format:'ITF'},t+100)},[ITF14,t]);await B.waitForTimeout(150);await B.click('#cf-next')}
 ok(await until(B,()=>e99Conf.state().total===5),'auxiliar sem internet contou 5');
 const bid=(await st(B)).id;await B.click('#cf-pause');await B.waitForTimeout(800);
 ok(await A.evaluate(i=>!(state.confs||[]).some(c=>c.id===i&&c.total===5),bid),'gestor ainda não recebeu (auxiliar offline)');
 await cB.setOffline(false);await B.evaluate(()=>dispatchEvent(new Event('online')));
 ok(await until(A,i=>(state.confs||[]).some(c=>c.id===i&&c.total===5),bid,40000),'voltou a internet: gestor recebeu a conferência com 5');
 await B.evaluate(()=>e99Conf.checkpoint());await B.waitForTimeout(5000);
 const ga=await A.evaluate(i=>{const l=state.confs.filter(c=>c.id===i);return {n:l.length,seq:l[0].reads.map(r=>r[0]).join(','),total:l[0].total}},bid);
 ok(ga.n===1&&ga.seq==='1,2,3,4,5'&&ga.total===5,'reenvio não duplica: 1 conferência, leituras 1–5 em ordem ('+JSON.stringify(ga)+')');
 ok(await until(B,()=>e99Conf.state().synced===5,null,15000),'auxiliar: leituras marcadas como sincronizadas depois do envio');
 await B.click('#cf-pause');await B.click('#cf-finish');await until(B,()=>/Relatório/.test(document.getElementById('cf-title').textContent),null,5000);
 ok(!(await B.$('#cf-assoc-sel'))&&!(await B.evaluate(()=>/Associar/.test(document.getElementById('conf-dlg').innerText))),'auxiliar finaliza a própria contagem, mas não vê "Associar a uma NF"');
 ok(await until(A,i=>(state.confs||[]).some(c=>c.id===i&&c.status==='finalizada'),bid,30000),'gestor vê a conferência finalizada');
 await B.evaluate(async i=>{const c=state.confs.find(x=>x.id===i);c.nf='n1';c.assocBy='Ana';await save()},bid);await B.waitForTimeout(6000);
 ok(await A.evaluate(i=>state.confs.find(c=>c.id===i).nf==='',bid),'associação enviada por auxiliar é ignorada pelo gestor');
 await A.evaluate(i=>{go('nfs');confReport(i)},bid);await A.waitForTimeout(400);
 ok(await A.isVisible('#cf-assoc-sel'),'gestor associa a conferência do auxiliar');
 await b.close();
 /* ================= D) etiqueta de perto + foco/zoom/lanterna ================= */
 const fileC=path.join(os.tmpdir(),'e99-conf-perto.y4m');y4mClose(fileC);
 const b2=await L.chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-video-capture='+fileC]});
 {const c=await b2.newContext({...L.devices['iPhone 13'],viewport:{width:390,height:844},permissions:['camera']});await c.addInitScript(CAPS);const p=await c.newPage();p.on('pageerror',e=>errs.push('D '+e.message));p.on('dialog',d=>d.accept(d.defaultValue()));
  await openConf(p,'confd'+Date.now().toString(36));
  ok(await until(p,()=>{const a=document.getElementById('cf-ask');return a&&!a.hidden},null,20000)&&await p.evaluate(e=>document.getElementById('cf-ask').textContent.includes(e),EAN_A),'v97: etiqueta de PERTO (maior que o retângulo, levemente borrada) é lida');
  const g=JSON.parse(await p.evaluate(()=>window.__gum||'{}')).video||{};
  ok(g.width&&g.width.ideal===1920&&g.height.ideal===1080&&g.frameRate.ideal===30&&g.facingMode&&g.facingMode.ideal==='environment','v97: câmera pedida em 1920×1080, 30 qps, traseira');
  const k=await p.evaluate(()=>e99Conf.cam());
  ok(k.adv.focusMode==='continuous'&&k.adv.exposureMode==='continuous'&&k.zoom===1.5&&k.adv.zoom===1.5,'v97: aplica foco contínuo, exposição contínua e zoom leve 1,5× ('+JSON.stringify(k.adv)+')');
  await p.click('#cf-yes');ok(await until(p,()=>+document.getElementById('cf-count').textContent===1,null,5000),'v97: de perto conta 01');
  await p.waitForTimeout(400);await p.evaluate(()=>{document.getElementById('conf-dlg').dispatchEvent(new PointerEvent('pointermove',{clientX:340,clientY:120,pointerType:'touch',buttons:1,bubbles:true}))});await p.waitForTimeout(120);
  await p.screenshot({path:'scratchpad/v97/holograma.png'});
  ok(await p.evaluate(()=>Math.abs(+getComputedStyle(document.getElementById('conf-dlg')).getPropertyValue('--px'))>.3),'v97: holograma: reflexo/parallax segue o dedo');
  await p.evaluate(()=>window.dispatchEvent(new Event('blur')));ok(/paused/.test(await shine(p))&&!/running/.test(await shine(p))&&await p.evaluate(()=>document.getElementById('conf-dlg').classList.contains('holo-pause')),'v97: tela sem foco: holograma congela');
  await p.evaluate(()=>window.dispatchEvent(new Event('focus')));ok(/running/.test(await shine(p)),'v97: volta o foco: holograma anda de novo');
  await p.evaluate(()=>{window.__ac=[]});await p.click('#cf-focus');ok(await until(p,()=>window.__ac.some(x=>/single-shot/.test(x)),null,3000)&&await until(p,()=>/continuous/.test(window.__ac[window.__ac.length-1]||''),null,4000),'v97: "Ajustar foco" pede foco único e volta ao contínuo');
  ok(await p.textContent('#cf-zoom')==='1,5×','v97: botão de zoom mostra 1,5×');await p.click('#cf-zoom');ok(await until(p,()=>e99Conf.cam().zoom===2&&document.getElementById('cf-zoom').textContent==='2×',null,3000)&&await p.evaluate(()=>/"zoom":2/.test(window.__ac[window.__ac.length-1])),'v97: zoom troca para 2× de verdade (applyConstraints)');
  ok(await p.isVisible('#cf-torch'),'v97: lanterna aparece quando a câmera tem torch');await p.click('#cf-torch');
  ok(await until(p,()=>e99Conf.cam().torch&&document.getElementById('cf-torch').getAttribute('aria-pressed')==='true'&&/"torch":true/.test(window.__ac[window.__ac.length-1]),null,3000),'v97: lanterna liga (torch:true)');
  await p.click('#cf-torch');ok(await until(p,()=>!e99Conf.cam().torch&&/"torch":false/.test(window.__ac[window.__ac.length-1]),null,3000),'v97: lanterna desliga (torch:false)');
  const lay=await p.evaluate(()=>{const d=document.getElementById('conf-dlg'),vis=[...d.querySelectorAll('button')].filter(b=>b.offsetParent),small=vis.filter(b=>{const r=b.getBoundingClientRect();return r.height<44||r.width<44}).map(b=>b.id||b.textContent),
    sec=[...document.querySelectorAll('#conf-dlg .cf-scan button')].filter(b=>b.offsetParent&&!b.closest('.cf-cam')&&b.id!=='cf-x'&&b.id!=='cf-histbtn').map(b=>b.id);return {small,sec,sx:d.scrollWidth-d.clientWidth,emoji:/\p{Extended_Pictographic}/u.test([...vis].map(b=>b.textContent).join(''))}});
  ok(!lay.small.length&&lay.sx<=0&&lay.sec.join()==='cf-next,cf-undo,cf-finish,cf-discard'&&!lay.emoji,'v97/v98: iPhone 13 (390×844): só 3 ações no painel (Próxima, Desfazer, Finalizar) + Descartar, toques ≥44 px, sem emoji ('+JSON.stringify(lay)+')');
  await c.close()}
 /* ================= F) PC e iPhone, com e sem Efeitos, menos movimento ================= */
 for(const [nm,opt,fx] of [['PC Efeitos ligados',{viewport:{width:1280,height:800}},'on'],['PC Efeitos desligados',{viewport:{width:1280,height:800}},'off'],['iPhone Efeitos desligados',{...L.devices['iPhone 13'],viewport:{width:390,height:844}},'off'],['iPhone menos movimento',{...L.devices['iPhone 13'],viewport:{width:390,height:844},reducedMotion:'reduce'},null]]){
  const c=await b2.newContext({...opt,permissions:['camera']});if(fx)await c.addInitScript(v=>{try{localStorage.setItem('lojasg.estoque99.visual-effects',v)}catch(e){}},fx);const p=await c.newPage();p.on('pageerror',e=>errs.push('F '+e.message));p.on('dialog',d=>d.accept(d.defaultValue()));
  await openConf(p,'conff'+Date.now().toString(36));const read=await until(p,()=>{const a=document.getElementById('cf-ask');return a&&!a.hidden},null,20000);
  await p.evaluate(()=>document.getElementById('conf-dlg').dispatchEvent(new PointerEvent('pointermove',{clientX:20,clientY:20,pointerType:'mouse',bubbles:true})));await p.waitForTimeout(150);
  const r=await p.evaluate(()=>{const d=document.getElementById('conf-dlg'),s=d.querySelector('.cf-scan').getBoundingClientRect();return {off:d.classList.contains('holo-off'),px:+getComputedStyle(d).getPropertyValue('--px')||0,scan:getComputedStyle(d.querySelector('.cf-countbox'),'::after').display,run:document.getAnimations().filter(a=>a.playState==='running'&&/cf-shine|cf-scanline/.test(a.animationName)).length,w:s.width,full:Math.abs(d.getBoundingClientRect().height-innerHeight)<2,sx:d.scrollWidth-d.clientWidth,small:[...d.querySelectorAll('button')].filter(b=>b.offsetParent&&b.getBoundingClientRect().height<44).length}});
  const still=fx!=='on';ok(read&&r.full&&r.sx<=0&&!r.small&&(still?(r.off&&!r.run&&r.px===0&&r.scan==='none'):(!r.off&&r.run>=2&&r.px!==0)),'v97: '+nm+': lê o código, tela cheia, '+(still?'holograma parado (sem brilho, varredura nem parallax)':'holograma animado com parallax')+' ('+JSON.stringify(r)+')');
  if(nm==='PC Efeitos ligados')await p.screenshot({path:'scratchpad/v97/holograma-pc.png'});
  await c.close()}
 await b2.close();try{fs.unlinkSync(fileC)}catch(e){}
 /* ================= E) duas câmeras + ajuda depois de 5 s sem leitura ================= */
 const b3=await L.chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream=device-count=2']});
 {const c=await b3.newContext({...L.devices['iPhone 13'],permissions:['camera']});const p=await c.newPage();p.on('pageerror',e=>errs.push('E '+e.message));p.on('dialog',d=>d.accept(d.defaultValue()));
  await openConf(p,'confe'+Date.now().toString(36));await until(p,()=>{const v=document.getElementById('cf-video');return v&&v.videoWidth>0},null,15000);
  ok(await until(p,()=>e99Conf.cam().devs===2&&!document.getElementById('cf-switch').hidden,null,8000),'v97: com 2 câmeras aparece "Trocar câmera"');
  const before=await p.evaluate(()=>e99Conf.cam().cur);await p.click('#cf-switch');
  ok(await until(p,b=>{const v=document.getElementById('cf-video'),t=v.srcObject&&v.srcObject.getVideoTracks()[0];return t&&t.readyState==='live'&&t.getSettings().deviceId!==b&&e99Conf.cam().cur!==b},before,10000),'v97: "Trocar câmera" troca o track de verdade (outro deviceId)');
  ok(await until(p,()=>/sem leitura|Fora de foco|Pouca luz/.test(document.getElementById('cf-msg').textContent),null,12000),'v97: depois de ~5 s sem leitura mostra ajuda curta ("'+(await p.textContent('#cf-msg'))+'")');
  await c.close()}
 /* ================= G) v98: descartar a conferência ================= */
 {const c=await b3.newContext({...L.devices['iPhone 13'],permissions:['camera']});const p=await c.newPage();p.on('pageerror',e=>errs.push('G '+e.message));let ans=false,asked=[];p.on('dialog',d=>{asked.push(d.message());ans?d.accept():d.dismiss()});
  await openConf(p,'confg'+Date.now().toString(36));await until(p,()=>!!e99Conf.state(),null,8000);
  for(const code of ['CX-01','CX-02']){await p.click('#cf-manual');await p.fill('#cf-mcode',code);await p.click('#cf-manual-form button[type=submit]');await p.waitForTimeout(200)}
  await until(p,()=>e99Conf.state().total===2);await p.evaluate(()=>e99Conf.checkpoint());const id=(await st(p)).id;
  ok(await p.isVisible('#cf-discard')&&/Descartar conferência/.test(await p.textContent('#cf-discard'))&&await p.isEnabled('#cf-discard'),'v98: botão "Descartar conferência" aparece na tela da conferência');
  await p.click('#cf-discard');await p.waitForTimeout(300);
  ok(asked.length===1&&/Descartar a conferência/.test(asked[0])&&(await st(p)).total===2&&await p.evaluate(()=>document.getElementById('conf-dlg').open)&&(await p.evaluate(i=>e99Conf.idbReads(i),id)).length===2,'v98: pede confirmação; "Cancelar" não apaga nada');
  ans=true;await p.click('#cf-discard');
  ok(await until(p,()=>!document.getElementById('conf-dlg').open&&!document.body.classList.contains('conf-on')&&!e99Conf.state(),null,5000),'v98: depois de confirmar, a conferência fecha');
  const r=await p.evaluate(async i=>{const rows=await e99Conf.rawRows(),sess=await new Promise(ok=>{const q=indexedDB.open('estoque99-conf');q.onsuccess=()=>{const t=q.result.transaction('sessions').objectStore('sessions').getAll();t.onsuccess=()=>{ok(t.result.filter(x=>x.id===i).length);q.result.close()}}});const c=state.confs.find(x=>x.id===i);return {reads:rows.filter(x=>x.conf===i).length,sess,c:c?{st:c.status,n:c.reads.length,t:c.total}:null}},id);
  ok(r.reads===0&&r.sess===0&&(!r.c||(r.c.st==='cancelada'&&r.c.n===0&&r.c.t===0)),'v98: descartar apaga a sessão e as leituras do IndexedDB e de state.confs ('+JSON.stringify(r)+')');
  await until(p,()=>!!document.getElementById('conf-go'),null,5000);await p.waitForTimeout(500);
  ok(await p.isVisible('#conf-go')&&!(await p.$('.conf-banner'))&&!(await p.evaluate(()=>(document.querySelector('.conf-hist')||{}).textContent||'')).includes('Cancelada'),'v98: volta ao início (botão "INICIAR CONFERÊNCIA", sem aviso de interrompida nem item no histórico)');
  await p.click('#conf-go');ok(await until(p,i=>{const s=e99Conf.state();return s&&s.id!==i&&s.total===0&&+document.getElementById('cf-count').textContent===0},id,8000),'v98: nova conferência começa do zero, sem perguntar pela descartada');ok(asked.length===2,'v98: nenhuma pergunta de conferência interrompida depois de descartar');
  await c.close()}
 await b3.close();
 console.log('errors',JSON.stringify(errs));if(errs.length)console.log('FAIL erros de página');
 try{fs.unlinkSync(file)}catch(e){}
})().catch(e=>{console.log('FAIL exceção: '+(e&&e.stack||e));process.exit(1)});
