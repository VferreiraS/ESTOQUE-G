/* v160: visualizador de imagens (e99Img) + miniaturas do Plano. PC 1440×900 gestor + iPhone 13 auxiliar, pela nuvem do emulador.
   Abre foto do plano e do chat, troca entre fotos (seta, teclado, deslizar), zoom (roda, pinça e toque duplo simulados),
   Baixar = bytes iguais, Esc/voltar fecham, miniaturas sem fundo verde e com tamanho certo, sem rolagem lateral, 0 erro de console. */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs'),path=require('path');
const OUT=path.join(__dirname,'..','docs','prints','v160');fs.mkdirSync(OUT,{recursive:true});
const HS=()=>document.documentElement.scrollWidth>innerWidth+1;
/* JPEGs de teste feitos no próprio navegador (canvas) */
const MAKE=()=>[[900,600,'#c0392b'],[600,900,'#2471a3'],[1000,420,'#d4ac0d']].map(([w,h,c],i)=>{const k=document.createElement('canvas');k.width=w;k.height=h;const x=k.getContext('2d');x.fillStyle=c;x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='bold 120px sans-serif';x.fillText('F'+(i+1),40,h/2);x.strokeStyle='#000';x.lineWidth=12;x.strokeRect(6,6,w-12,h-12);return k.toDataURL('image/jpeg',.85)});
const ST=()=>e99Img.state();
const THUMBS=()=>[...document.querySelectorAll('#view .plan-photos img')].map(i=>{const r=i.getBoundingClientRect(),s=getComputedStyle(i);return {w:r.width,h:r.height,fit:s.objectFit,bg:s.backgroundColor,role:i.getAttribute('role'),tab:i.tabIndex}});
const DLB=()=>[...document.querySelectorAll('#view .plan-photos .ph-dl')].map(b=>{const r=b.getBoundingClientRect();return {h:r.height,w:r.width,lbl:b.getAttribute('aria-label'),txt:b.textContent.trim()}});
async function setPhotos(p,ds){await p.evaluate(async ds=>{const pl=state.plans.find(x=>x.id==='p1');pl.activities[0].title='Repor <b>arroz</b> no 07';pl.activities[0].photos=ds.map((d,i)=>({id:'f'+(i+1),data:d}));await save();go('plans');render()},ds)}
async function dl(p,sel){const [d]=await Promise.all([p.waitForEvent('download',{timeout:15000}),p.click(sel)]);return {name:d.suggestedFilename(),buf:fs.readFileSync(await d.path())}}
/* gestos por PointerEvent no palco do visualizador */
const GEST=(kind)=>{const st=document.querySelector('#e99-img .iv-stage'),r=st.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  const ev=(t,id,x,y)=>st.dispatchEvent(new PointerEvent(t,{pointerId:id,clientX:x,clientY:y,bubbles:true,pointerType:'touch',isPrimary:id===1}));
  if(kind==='swipe'){ev('pointerdown',1,cx+120,cy);for(let k=1;k<=6;k++)ev('pointermove',1,cx+120-k*40,cy);ev('pointerup',1,cx-120,cy)}
  if(kind==='pinch'){ev('pointerdown',1,cx-40,cy);ev('pointerdown',2,cx+40,cy);for(let k=1;k<=5;k++){ev('pointermove',1,cx-40-k*20,cy);ev('pointermove',2,cx+40+k*20,cy)}ev('pointerup',1,cx-140,cy);ev('pointerup',2,cx+140,cy)}
  if(kind==='tap2'){ev('pointerdown',1,cx,cy);ev('pointerup',1,cx,cy);ev('pointerdown',1,cx,cy);ev('pointerup',1,cx,cy)}
  if(kind==='drag'){ev('pointerdown',1,cx,cy);for(let k=1;k<=4;k++)ev('pointermove',1,cx+k*25,cy+k*10);ev('pointerup',1,cx+100,cy+40)}
  return e99Img.state()};
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const hook=(p,n)=>{p.on('pageerror',e=>errs.push(n+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(n+' console '+m.text())});p.on('dialog',d=>d.accept())};
 const cA=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,acceptDownloads:true});const A=await cA.newPage();hook(A,'PC');
 ok(await L.gestorWithTeam(A,'vi'+T),'PC: gestor com equipe');
 const link=await L.makeInvite(A,'Bia','');
 const cB=await b.newContext(Object.assign({},L.devices['iPhone 13'],{deviceScaleFactor:2,acceptDownloads:true}));const B=await cB.newPage();hook(B,'iPhone');
 await L.auxAccept(B,link,'','Senha1234x');
 ok(await until(B,()=>typeof authSession!=='undefined'&&!!authSession&&!!window.e99Img,null,40000),'iPhone: auxiliar entrou');
 const DS=await A.evaluate(MAKE);
 /* ---------- PC: plano ---------- */
 await setPhotos(A,DS);await A.waitForTimeout(500);
 const th=await A.evaluate(THUMBS);
 ok(th.length===3&&th.every(t=>t.w>=96&&t.w<=120&&Math.abs(t.w-t.h)<1&&t.fit==='cover'),'PC: miniaturas quadradas 96–120 px com recorte ('+th.map(t=>Math.round(t.w)+'×'+Math.round(t.h)+' '+t.fit).join(', ')+')');
 ok(th.every(t=>t.bg!=='rgb(23, 37, 28)'&&t.bg!=='rgb(233, 232, 223)'),'PC: miniaturas sem fundo verde ('+th[0].bg+')');
 ok(th.every(t=>t.role==='button'&&t.tab===0),'PC: miniaturas alcançáveis por teclado (role=button)');
 const db=await A.evaluate(DLB);ok(db.length===3&&db.every(x=>x.h<=40&&x.w<=40&&/^Baixar foto \d$/.test(x.lbl)&&!x.txt),'PC: "Baixar foto N" virou botão de ícone pequeno ('+db.map(x=>Math.round(x.h)).join(',')+' px)');
 await A.screenshot({path:path.join(OUT,'pc-plano-miniaturas.png')});
 await A.click('#view .plan-photos img >> nth=0');await A.waitForTimeout(400);
 let s=await A.evaluate(ST);ok(s.open&&s.n===3&&s.i===0,'PC: toque na miniatura abre o visualizador (1 de 3)');
 ok(await A.evaluate(()=>{const d=document.getElementById('e99-img');const im=d.querySelector('.iv-im'),r=im.getBoundingClientRect();return d.getAttribute('aria-modal')==='true'&&d.matches(':modal')&&getComputedStyle(im).objectFit==='contain'&&r.width<=innerWidth+1&&r.height<=innerHeight+1&&im.naturalWidth>0&&document.querySelector('#e99-img .iv-count').textContent==='1/3'}),'PC: tela cheia, imagem inteira (contain), contador 1/3, aria-modal');
 ok(await A.evaluate(()=>{const x=document.querySelector('#e99-img .iv-x'),r=x.getBoundingClientRect();return r.width>=44&&r.height>=44&&/Fechar/.test(x.getAttribute('aria-label'))&&document.activeElement===x}),'PC: botão Fechar 44 px com rótulo e foco');
 ok(await A.evaluate(()=>{const c=document.querySelector('#e99-img .iv-cap');return c.textContent==='Foto 1 da atividade Repor <b>arroz</b> no 07'&&!c.querySelector('b')}),'PC: legenda/alt escapados (sem HTML)');
 await A.screenshot({path:path.join(OUT,'pc-visualizador.png')});
 await A.click('#e99-img .iv-next');s=await A.evaluate(ST);ok(s.i===1&&await A.evaluate(()=>document.querySelector('#e99-img .iv-count').textContent==='2/3'),'PC: seta próxima → 2/3');
 await A.keyboard.press('ArrowRight');s=await A.evaluate(ST);ok(s.i===2&&await A.evaluate(()=>document.querySelector('#e99-img .iv-next').disabled),'PC: seta do teclado → 3/3 (próxima desabilitada)');
 await A.keyboard.press('ArrowLeft');s=await A.evaluate(ST);ok(s.i===1,'PC: seta esquerda volta para 2/3');
 await A.mouse.move(720,450);await A.mouse.wheel(0,-300);await A.waitForTimeout(250);s=await A.evaluate(ST);ok(s.scale>1,'PC: roda do mouse amplia ('+s.scale.toFixed(2)+'x)');
 await A.evaluate(()=>e99Img.zoom(1));
 const want=Buffer.from(DS[1].split(',')[1],'base64');const d1=await dl(A,'#e99-img .iv-dl');
 ok(Buffer.compare(d1.buf,want)===0,'PC: Baixar gera arquivo com os mesmos bytes ('+d1.name+', '+d1.buf.length+' B)');
 await A.keyboard.press('Escape');await A.waitForTimeout(300);
 ok(await A.evaluate(()=>!e99Img.state().open&&document.activeElement&&document.activeElement.matches('#view .plan-photos img')),'PC: Esc fecha e o foco volta para a miniatura');
 /* teclado: Enter na miniatura abre */
 await A.focus('#view .plan-photos img >> nth=2');await A.keyboard.press('Enter');await A.waitForTimeout(300);s=await A.evaluate(ST);ok(s.open&&s.i===2,'PC: Enter na miniatura abre a foto 3');
 await A.evaluate(()=>history.back());await A.waitForTimeout(500);ok(await A.evaluate(()=>!e99Img.state().open&&page==='plans'&&!!authSession),'PC: voltar do navegador fecha o visualizador e fica no Plano');
 /* editor do plano */
 await A.evaluate(()=>openPlan('p1'));await A.waitForTimeout(500);
 ok(await A.evaluate(()=>{const b=[...document.querySelectorAll('#view .plan-photos .ph-rm')];return b.length===3&&b.every(x=>{const r=x.getBoundingClientRect();return r.height<=40&&/Remover foto/.test(x.getAttribute('aria-label'))})}),'PC: editor com "Remover foto" em ícone pequeno');
 await A.click('#view .plan-photos img >> nth=1');await A.waitForTimeout(300);s=await A.evaluate(ST);ok(s.open&&s.n===3&&s.i===1,'PC: foto do editor abre no visualizador');
 await A.keyboard.press('Escape');await A.waitForTimeout(200);await A.evaluate(()=>planCancel());await A.waitForTimeout(300);
 ok(!(await A.evaluate(HS)),'PC: sem rolagem lateral');
 /* segurança: só data:image (jpeg/png/webp/gif) ou blob do app */
 ok(await A.evaluate(()=>!e99Img.open(['data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=','https://exemplo.com/a.jpg','javascript:alert(1)'])&&!e99Img.state().open&&e99Img.safe('data:image/png;base64,AAAA')!==''),'PC: recusa SVG, endereço remoto e javascript:');
 /* ---------- chat da equipe ---------- */
 await A.evaluate(()=>{go('chat');e99Cv.open('geral')});await A.waitForSelector('#chat-text',{timeout:15000});
 ok(await A.evaluate(async ds=>{const a=await chatSend('',ds[0]);const b=await chatSend('',ds[2]);return !!a&&!!b},DS),'PC: duas fotos enviadas no chat');
 await B.evaluate(()=>{go('chat');e99Cv.open('geral')});await B.waitForSelector('#chat-text',{timeout:15000});
 ok(await until(B,()=>[...document.querySelectorAll('#chat-list img[data-chat-img]')].filter(i=>/^blob:/.test(i.src)&&i.naturalWidth>0).length>=2,null,40000),'iPhone: fotos do chat chegaram');
 await B.waitForTimeout(400);
 await B.tap('#chat-list img[data-chat-img] >> nth=0');await B.waitForTimeout(400);s=await B.evaluate(ST);
 ok(s.open&&s.n>=2&&s.i===0&&!(await B.evaluate(()=>{const d=document.getElementById('chat-img-view');return !!(d&&d.open)})),'iPhone: toque na foto do chat abre o visualizador novo (1 de '+s.n+')');
 await B.screenshot({path:path.join(OUT,'iphone-visualizador-chat.png')});
 s=await B.evaluate(GEST,'swipe');await B.waitForTimeout(300);s=await B.evaluate(ST);ok(s.i===1,'iPhone: deslizar o dedo troca para a próxima foto');
 await B.evaluate(GEST,'pinch');s=await B.evaluate(ST);ok(s.scale>1.5,'iPhone: pinça amplia ('+s.scale.toFixed(2)+'x)');
 await B.evaluate(GEST,'drag');const s2=await B.evaluate(ST);ok(s2.i===1&&(s2.tx!==s.tx||s2.ty!==s.ty),'iPhone: arrastar a foto ampliada move sem trocar de foto');
 await B.evaluate(()=>e99Img.zoom(1));await B.evaluate(GEST,'tap2');s=await B.evaluate(ST);ok(s.scale>2,'iPhone: toque duplo amplia');
 await B.waitForTimeout(400);await B.evaluate(GEST,'tap2');s=await B.evaluate(ST);ok(s.scale===1,'iPhone: toque duplo de novo volta ao tamanho');
 const chatBytes=await B.evaluate(async()=>{const r=await fetch(e99Img.state().src);const a=new Uint8Array(await r.arrayBuffer());let s='';for(const x of a)s+=String.fromCharCode(x);return btoa(s)});
 const d2=await dl(B,'#e99-img .iv-dl');ok(Buffer.compare(d2.buf,Buffer.from(chatBytes,'base64'))===0&&d2.buf.length>1000,'iPhone: Baixar a foto do chat gera os mesmos bytes ('+d2.buf.length+' B)');
 await B.evaluate(()=>history.back());await B.waitForTimeout(500);ok(await B.evaluate(()=>!e99Img.state().open&&page==='chat'&&!!authSession),'iPhone: voltar do sistema fecha o visualizador sem sair do app');
 /* ---------- iPhone: plano ---------- */
 await B.evaluate(()=>{go('plans')});
 const got=await until(B,()=>{const p=(state.plans||[]).find(x=>x.id==='p1');return !!p&&p.activities[0].photos.length===3},null,20000);
 if(!got)await setPhotos(B,DS);else await B.evaluate(()=>render());await B.waitForTimeout(500);
 const tb=await B.evaluate(THUMBS);ok(tb.length===3&&tb.every(t=>t.w>=96&&t.w<=120&&Math.abs(t.w-t.h)<1&&t.bg!=='rgb(23, 37, 28)'),'iPhone: miniaturas '+Math.round(tb[0]&&tb[0].w)+' px, sem verde'+(got?' (plano veio pela nuvem)':''));
 ok(await B.evaluate(()=>{const b=document.querySelector('#view .plan-photos .ph-dl');return !!b&&b.getBoundingClientRect().height<=40}),'iPhone: botão Baixar pequeno (ícone)');
 await B.evaluate(()=>document.querySelector('#view .plan-photos').scrollIntoView({block:'center'}));await B.waitForTimeout(200);
 await B.screenshot({path:path.join(OUT,'iphone-plano-miniaturas.png')});
 await B.tap('#view .plan-photos img >> nth=1');await B.waitForTimeout(400);s=await B.evaluate(ST);ok(s.open&&s.n===3&&s.i===1,'iPhone: foto do plano abre (2 de 3)');
 ok(await B.evaluate(()=>{const r=document.querySelector('#e99-img .iv-x').getBoundingClientRect();return r.width>=44&&r.height>=44&&r.top>=0&&r.right<=innerWidth}),'iPhone: Fechar 44 px dentro da tela');
 await B.screenshot({path:path.join(OUT,'iphone-visualizador-plano.png')});
 ok(!(await B.evaluate(HS)),'iPhone: sem rolagem lateral com o visualizador');
 await B.tap('#e99-img .iv-x');await B.waitForTimeout(300);ok(await B.evaluate(()=>!e99Img.state().open),'iPhone: Fechar fecha');
 ok(!(await B.evaluate(HS)),'iPhone: sem rolagem lateral no Plano');
 /* menos movimento: sem animação de entrada */
 await B.emulateMedia({reducedMotion:'reduce'});await B.tap('#view .plan-photos img >> nth=0');await B.waitForTimeout(200);
 ok(await B.evaluate(()=>getComputedStyle(document.getElementById('e99-img')).animationName==='none'),'iPhone: "menos movimento" tira a animação');await B.evaluate(()=>e99Img.close());
 ok(errs.length===0,'0 erro de console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
 await b.close();process.exit(0)})().catch(e=>{console.log('FAIL exceção: '+e.message);process.exit(1)});
