/* v165-e: chat com estrutura de grupo do WhatsApp e balões do iPhone.
   PC 1440×900 (gestor) e iPhone 13 (Ana, conta de equipe) + Leo; 3 temas. Prints 2x em docs/prints/v165/e (fora do git). */
const L=require('./lib.js');const {ok,until}=L;const path=require('path'),fs=require('fs');
const OUT=path.join(__dirname,'..','docs','prints','v165','e');fs.mkdirSync(OUT,{recursive:true});
function lum(c){const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const A=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage();
 const B=await (await b.newContext(L.devices['iPhone 13'])).newPage();const C=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
 [A,B,C].forEach((p,i)=>{p.on('pageerror',e=>errs.push(i+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|firestore|Firestore|WebChannel/i.test(m.text()))errs.push(i+' console: '+m.text().slice(0,120))});p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(A,'ve'+T),'PC: gestor com equipe');const code=await A.evaluate(()=>e99Team.get().code);
 for(const [P,n,l] of [[B,'Ana','vea'+T],[C,'Leo','vel'+T]]){await P.goto('http://localhost:8000/index.html');await P.waitForTimeout(2500);await L.signup(P,l);await P.evaluate(([c,n])=>e99Team.join(c,n),[code,n]);await P.evaluate(()=>go('chat'));await P.waitForTimeout(800)}
 for(const P of [A,B,C])await P.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});
 await A.evaluate(()=>chatSend('Bom dia, equipe! Chegou a NF 48213.'));
 await B.evaluate(async()=>{await chatSend('Bom dia!');await chatSend('Já estou no corredor 07.');await chatSend('Falta conferir 3 volumes.')});
 await C.evaluate(async()=>{await chatSend('Eu confiro os volumes.')});
 await A.evaluate(async()=>{await chatSend('Combinado, obrigado.');await chatSend('Depois me mandem a foto da etiqueta.')});
 ok(await until(A,()=>document.querySelectorAll('#chat-list .chat-msg[data-id]').length>=7,null,30000),'PC: 7 mensagens de 3 pessoas');
 await until(B,()=>document.querySelectorAll('#chat-list .chat-msg[data-id]').length>=7,null,30000);await A.waitForTimeout(1500);
 for(const [dev,P] of [['PC',A],['iPhone',B]]){
  const r=await P.evaluate(()=>{const l=[...document.querySelectorAll('#chat-list .chat-msg[data-id]')];const seqs=[];l.forEach((m,i)=>{const f=!m.classList.contains('cont');if(f)seqs.push([]);seqs[seqs.length-1].push(m)});
   const tailOk=seqs.every(s=>s.every((m,i)=>m.classList.contains('seq-end')===(i===s.length-1)));
   const tailCss=l.every(m=>(getComputedStyle(m,'::after').content!=='none')===m.classList.contains('seq-end'));
   const nameOk=seqs.filter(s=>!s[0].classList.contains('mine')).every(s=>s.every((m,i)=>!!m.querySelector(':scope>.prof-chip')===(i===0)));
   const avOk=seqs.filter(s=>!s[0].classList.contains('mine')).every(s=>s.every((m,i)=>!!m.querySelector(':scope>.chat-sav')===(i===s.length-1)));
   const box=document.getElementById('chat-list').getBoundingClientRect(),cs=getComputedStyle(document.documentElement);
   const out=l.filter(m=>m.classList.contains('mine')),inn=l.filter(m=>!m.classList.contains('mine'));
   /* v169 (print do dono): todos os balões à esquerda, depois da foto; o próprio se distingue pela cor */const side=l.every(m=>{const x=m.getBoundingClientRect().left-box.left;return x>=56&&x<box.width/4});
   const probe=document.createElement('div');document.body.appendChild(probe);const col=v=>{probe.style.color=v;return getComputedStyle(probe).color};
   /* v169: o chat tem paleta própria fixa (--c-balao-meu / --c-balao-outro, medidas no print); fora dela, --p-bubble-* */const v169=document.body.classList.contains('v169c'),kO=v169?'--c-balao-meu':'--p-bubble-out',kI=v169?'--c-balao-outro':'--p-bubble-in';const bgOk=out.every(m=>getComputedStyle(m).backgroundColor===col('var('+kO+')'))&&inn.every(m=>getComputedStyle(m).backgroundColor===col('var('+kI+')'));probe.remove();
   const last=out[out.length-1];
   return {tailOk,tailCss,nameOk,avOk,side,bgOk,day:!!document.querySelector('#chat-list .chat-day'),seen:!!(last&&last.querySelector('.seen-by')&&/Entregue|Lida/.test(last.querySelector('.seen-by').textContent)),
    plus:!!document.querySelector('#chat-form .chat-plus'),pill:parseFloat(getComputedStyle(document.getElementById('chat-text')).borderTopLeftRadius)>=18,
    scroll:document.documentElement.scrollWidth>innerWidth||document.getElementById('chat-list').scrollWidth>document.getElementById('chat-list').clientWidth+1}});
  ok(r.tailOk&&r.tailCss,dev+': cauda só na última bolha de cada sequência');ok(r.nameOk,dev+': nome do remetente só na 1ª recebida da sequência');ok(r.avOk,dev+': avatar só na última recebida da sequência');
  ok(r.side&&r.bgOk,dev+': balões à esquerda depois da foto (v169); próprias com --p-bubble-out, recebidas com --p-bubble-in');ok(r.day,dev+': chip de data');ok(r.seen,dev+': "Entregue/Lida" abaixo da última própria');
  ok(r.plus&&r.pill,dev+': campo com "+" e pílula');ok(!r.scroll,dev+': sem rolagem lateral');
  /* microfone ↔ enviar */
  /* v169: enviar sempre à vista (como no print); o microfone foi para o menu do "+" */
  await P.fill('#chat-text','');const m1=await P.evaluate(()=>!!document.getElementById('chat-mic').closest('#chat-attach')&&!!document.getElementById('chat-send').offsetParent);
  await P.fill('#chat-text','oi');const m2=await P.evaluate(()=>!!document.getElementById('chat-send').offsetParent);await P.fill('#chat-text','');
  await P.evaluate(()=>document.querySelector('#chat-form .chat-plus').click());const m3=await P.evaluate(()=>{const m=document.getElementById('chat-mic');const r=m.getBoundingClientRect();return !!m.offsetParent&&r.height>=44});await P.keyboard.press('Escape');
  ok(m1&&m2&&m3,dev+': enviar sempre à vista; áudio no menu do "+" (≥44 px)');
  /* menu */
  await P.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].pop().querySelector('.chat-opt-btn').click());
  ok(await until(P,()=>{const m=document.getElementById('msg-menu');return !!m&&m.querySelectorAll('.emo button').length===6&&m.getAttribute('aria-modal')==='true'},null,3000),dev+': menu com linha de 6 emojis (aria-modal)');
  await P.keyboard.press('Escape');
 }
 /* digitando (Leo digita) */
 await C.fill('#chat-text','digitando agora');await C.evaluate(()=>document.getElementById('chat-text').dispatchEvent(new Event('input',{bubbles:true})));
 ok(await until(A,()=>/digitando/.test((document.getElementById('chat-typing')||{}).textContent||''),null,15000),'PC: indicador de digitando');await C.fill('#chat-text','');
 /* contraste AA nos 3 temas */
 for(const th of ['lilas','violeta','cinza']){await A.evaluate(t=>e99Theme.set(t),th);await A.waitForTimeout(300);
  const c=await A.evaluate(()=>{const cv=document.createElement('canvas');cv.width=cv.height=1;const g=cv.getContext('2d',{willReadFrequently:true});const rgb=v=>{g.clearRect(0,0,1,1);g.fillStyle='#000';g.fillStyle=v;g.fillRect(0,0,1,1);const d=g.getImageData(0,0,1,1).data;return 'rgb('+d[0]+','+d[1]+','+d[2]+')'};const gc=(e,k)=>rgb(getComputedStyle(e)[k]);const o=document.querySelector('#chat-list .chat-msg.mine'),i=document.querySelector('#chat-list .chat-msg:not(.mine)');const n=[...document.querySelectorAll('#chat-list .chat-msg:not(.mine)>.prof-chip span:last-child')];
   const bg=getComputedStyle(document.getElementById('chat-list')).backgroundColor;
   return {o:[gc(o.querySelector('.chat-txt'),'color'),gc(o,'backgroundColor')],i:[gc(i.querySelector('.chat-txt'),'color'),gc(i,'backgroundColor')],n:n.map(x=>[gc(x,'color'),gc(x.closest('.chat-msg'),'backgroundColor')])}});
  const ro=ratio(...c.o),ri=ratio(...c.i),rn=Math.min(...c.n.map(x=>ratio(...x)));
  ok(ro>=4.5&&ri>=4.5,th+': contraste AA do texto das bolhas (enviada '+ro.toFixed(1)+', recebida '+ri.toFixed(1)+')');ok(rn>=4.5,th+': contraste AA dos nomes coloridos (mín. '+rn.toFixed(1)+')');
  await A.screenshot({path:path.join(OUT,'grupo-pc-'+th+'.png')});
  await B.evaluate(t=>e99Theme.set(t),th);await B.waitForTimeout(300);await B.screenshot({path:path.join(OUT,'grupo-iphone-'+th+'.png')});
  await B.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].pop().querySelector('.chat-opt-btn').click());await B.waitForTimeout(300);await B.screenshot({path:path.join(OUT,'menu-iphone-'+th+'.png')});await B.keyboard.press('Escape');
  await B.evaluate(()=>{const p=document.querySelector('#chat-form .chat-plus');p.click()});await B.waitForTimeout(200);await B.screenshot({path:path.join(OUT,'campo-mais-iphone-'+th+'.png')});await B.keyboard.press('Escape');
 }
 /* lista de conversas */
 await A.evaluate(()=>{localStorage.removeItem('e99-test-chatgeral');if(window.e99Cv)e99Cv.list()});await A.waitForTimeout(600);
 const lv=await A.evaluate(()=>({w:[...document.querySelectorAll('.cv-list .cv-av')].map(a=>Math.round(a.getBoundingClientRect().width)).join(','),q:!!document.getElementById('cv-q'),seg:document.querySelectorAll('.cv-seg button').length,av:(document.querySelector('.cv-list .cv-av')||{getBoundingClientRect:()=>({width:0})}).getBoundingClientRect().width}));
 ok(lv.q&&lv.seg===3&&Math.round(lv.av)===52,'PC: lista com busca, 3 filtros e avatar de 52 px ('+lv.w+')');
 await A.evaluate(()=>e99Cv.filter(null,'g'));ok(await A.evaluate(()=>[...document.querySelectorAll('.cv-list>li')].filter(li=>!li.hidden).every(li=>li.getAttribute('data-g')==='1')),'PC: filtro Grupos');await A.evaluate(()=>e99Cv.filter('',"all"));
 for(const th of ['lilas','violeta','cinza']){await A.evaluate(t=>e99Theme.set(t),th);await A.waitForTimeout(200);await A.screenshot({path:path.join(OUT,'lista-pc-'+th+'.png')})}
 ok(!errs.length,'0 erro de console'+(errs.length?': '+errs.slice(0,3).join(' | '):''));console.log('errors',errs);await b.close()})();
