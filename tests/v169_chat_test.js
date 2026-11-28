/* v169: chat no padrão do print do dono + logo StoK na barra de cima do celular + Demandas do estoque sem vão no celular.
   iPhone 390×844 (DPR 2, gestor Vitor) + PC 1440×900 (Leonardo) + 3º aparelho (Augusto manda um PDF). Prints em docs/prints/v169 (fora do git). */
const L=require('./lib.js');const {ok,until}=L;const path=require('path'),fs=require('fs');
const OUT=path.join(__dirname,'..','docs','prints','v169');fs.mkdirSync(OUT,{recursive:true});
const PDF=path.join(OUT,'Checklist de recebimento.pdf');fs.writeFileSync(PDF,Buffer.concat([Buffer.from('%PDF-1.4\n%teste\n'),Buffer.alloc(20000,65)]));
function lum(c){const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const B=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:L.devices['iPhone 13'].userAgent})).newPage();
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const C=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
 [['iPhone',B],['PC',A],['C',C]].forEach(([n,p])=>{p.on('pageerror',e=>errs.push(n+' '+e.message));p.on('response',r=>{if(r.status()===404)errs.push(n+' 404 '+r.url())});p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|firestore|Firestore|WebChannel/i.test(m.text()))errs.push(n+' console: '+m.text().slice(0,140))});p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(B,'vt'+T),'iPhone: gestor com equipe');const code=await B.evaluate(()=>e99Team.get().code);
 for(const [P,n,l] of [[A,'Leonardo','lo'+T],[C,'Augusto','au'+T]]){await P.goto('http://localhost:8000/index.html');await P.waitForTimeout(2500);await L.signup(P,l);await P.evaluate(([c,n])=>e99Team.join(c,n),[code,n]);await P.evaluate(()=>go('chat'));await P.waitForTimeout(800)}
 for(const P of [A,B,C])await P.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});
 await B.evaluate(()=>chatSend('Pessoal, vamos liberar o corredor 05 antes do recebimento.'));await B.waitForTimeout(600);
 await A.evaluate(()=>chatSend('Já estou finalizando a organização.'));await A.waitForTimeout(600);
 await C.evaluate(()=>chatSend('Conferência dos volumes concluída.'));await C.waitForTimeout(600);
 await C.setInputFiles('#chat-file-in',PDF);
 ok(await until(B,()=>document.querySelectorAll('#chat-list .chat-msg[data-id]').length>=4&&!!document.querySelector('#chat-list .chat-file .cf-dl'),null,40000),'iPhone: 4 mensagens com o PDF');
 await B.evaluate(()=>window.e99MsgMenu(document.querySelector('#chat-list .chat-msg[data-id]').getAttribute('data-id')));await B.click('#msg-menu [data-a=pin]');
 ok(await until(B,()=>{const p=document.getElementById('chat-pin');return p&&!p.hidden&&/Aviso importante/i.test(p.innerText)&&/corredor 05/.test(p.innerText)},null,15000),'aviso fixado vira o cartão "Aviso importante"');
 await B.waitForTimeout(2500);await B.evaluate(()=>scrollTo(0,0));
 const r=await B.evaluate(()=>{const q=s=>document.querySelector(s),R=s=>{const e=q(s);return e?e.getBoundingClientRect():null},cs=(s,k)=>{const e=q(s);return e?getComputedStyle(e)[k]:''};
  const hd=q('main>header'),br=q('.v169-brand'),lg=q('.v169-brand img');
  const who=[...document.querySelectorAll('#chat-list .v169-who')].map(w=>({n:w.querySelector('.v169-n b').textContent,cg:(w.querySelector('.v169-cg')||{}).textContent||'',g:w.classList.contains('g'),crown:!!w.querySelector('.v169-crown'),on:w.querySelector('.v169-av').classList.contains('on'),h:w.getBoundingClientRect().height,next:w.nextElementSibling&&w.nextElementSibling.classList.contains('chat-msg')}));
  const msgs=[...document.querySelectorAll('#chat-list .chat-msg[data-id]')];const lr=q('#chat-list').getBoundingClientRect();
  const small=[...document.querySelectorAll('main>header button,.chat-head button,#chat-form .chat-plus,#chat-send,.v169-emo,#chat-pin button,#chat-list .chat-file .cf-dl')].filter(e=>e.offsetParent&&getComputedStyle(e).display!=='none').filter(e=>{const r=e.getBoundingClientRect();return r.width<43.5||r.height<43.5}).map(e=>e.getAttribute('aria-label')||e.className);
  return {brand:!!br&&getComputedStyle(br).display!=='none'&&/StoK/.test(br.textContent)&&/ESTOQUE 99/.test(br.textContent),logo:lg?lg.getAttribute('src').slice(0,30):'',menu:!!q('.v169-menu')&&q('.v169-menu').offsetParent!==null,me:!!q('.v169-me')&&q('.v169-me').offsetParent!==null,
   line:cs('main>header','borderBottomColor'),title:q('#chat-h').textContent,sub:(q('.v169-sub')||{}).textContent||'',calls:document.querySelectorAll('.chat-head .v169-call').length,
   who,left:msgs.every(m=>m.getBoundingClientRect().left-lr.left>=60&&m.getBoundingClientRect().left-lr.left<=70),tk:!!q('#chat-list .chat-msg.mine .v169-tk'),
   mineBg:cs('#chat-list .chat-msg.mine','backgroundImage')+cs('#chat-list .chat-msg.mine','backgroundColor'),inBg:cs('#chat-list .chat-msg:not(.mine)','backgroundColor'),
   pdf:!!q('#chat-list .chat-file[data-ext=pdf] .cf-ic svg text'),dl:q('#chat-list .chat-file .cf-dl')?q('#chat-list .chat-file .cf-dl').textContent.trim():'',
   ph:q('#chat-text').placeholder,mic:q('#chat-mic').parentNode.id,send:!!q('#chat-send').offsetParent,emo:!!q('.v169-emo'),nav:getComputedStyle(q('#mobile-bottom')).display,
   sw:document.documentElement.scrollWidth,vw:innerWidth,small,txt:[getComputedStyle(q('#chat-list .chat-msg .chat-txt')).color,getComputedStyle(q('#chat-list .chat-msg:not(.mine)')).backgroundColor],
   comp:q('.chat-compose').getBoundingClientRect().bottom<=innerHeight+1}});
 ok(r.brand&&r.menu&&r.me,'barra de cima: ☰, logo + StoK / ESTOQUE 99 e Minha conta');
 ok(/^data:image\/svg/.test(r.logo),'barra de cima: logo vigente (SVG da prateleira)');
 ok(r.title==='Equipe do Estoque'&&/participantes? • \d+ online/.test(r.sub)&&r.calls===2,'cabeçalho: "Equipe do Estoque", "'+r.sub+'", telefone e vídeo');
 ok(r.who.length===3&&r.who.every(w=>w.next&&w.h>=40)&&r.who.filter(w=>w.cg).length>=2&&!!r.who[0].cg,'cada sequência com foto, nome e cargo ('+r.who.map(w=>w.n+'/'+w.cg).join(', ')+')');
 ok(r.who[0].g&&r.who[0].crown&&r.who.filter(w=>w.crown).length===1,'coroa só no gestor');
 ok(r.who[0].on&&r.who.some((w,i)=>i&&w.on),'bolinha de online (eu e quem está com o app aberto, pela presença da nuvem)');
 ok(r.left&&r.tk,'balões à esquerda (depois da foto) e dois tiques na própria');
 ok(/rgb\(1[0-9], (6[0-9]|7[0-9]), 2[0-9]\)/.test(r.mineBg)&&r.inBg==='rgb(46, 48, 53)','cores do print: próprio verde escuro, dos outros cinza ('+r.inBg+')');
 ok(ratio(...r.txt)>=7,'contraste do texto do balão '+ratio(...r.txt).toFixed(1));
 ok(r.pdf&&r.dl==='Baixar','anexo: ícone vermelho de PDF e botão quadrado "Baixar"');
 ok(r.ph==='Mensagem...'&&r.mic==='chat-attach'&&r.send&&r.emo,'campo: "Mensagem...", emoji, enviar sempre à vista, áudio no "+"');
 ok(r.nav==='none'&&r.comp,'conversa sem a barra de baixo; campo dentro da tela');
 ok(r.sw<=r.vw&&!r.small.length,'sem rolagem lateral e alvos ≥44 px'+(r.small.length?' ('+r.small.join('|')+')':''));
 await B.screenshot({path:path.join(OUT,'iphone-chat.png')});
 /* emoji */
 await B.click('.v169-emo');await B.click('#v169-emo-box button >> nth=0');ok(/👍/.test(await B.inputValue('#chat-text')),'emoji entra no campo');await B.fill('#chat-text','');
 /* chamadas */
 await B.evaluate(()=>{window.__n='';const n0=notify;notify=function(t){window.__n=t;return n0.apply(this,arguments)}});await B.click('.chat-head .v169-call >> nth=0');
 ok(/Chamadas ainda não estão disponíveis/.test(await B.evaluate(()=>window.__n)),'telefone avisa que não há chamadas');
 /* áudio continua no "+" */
 await B.click('#chat-form .chat-plus');ok(await B.evaluate(()=>!!document.getElementById('chat-mic').offsetParent),'botão de áudio no menu do "+"');await B.keyboard.press('Escape');
 /* outras telas: barra com logo, sem o verde do chat */
 await B.evaluate(()=>go('home'));await B.waitForTimeout(500);
 const h=await B.evaluate(()=>({b:!!document.querySelector('.v169-brand').offsetParent,c:document.body.classList.contains('v169c'),nav:getComputedStyle(document.getElementById('mobile-bottom')).display}));
 ok(h.b&&!h.c&&h.nav!=='none','Início: logo StoK na barra, paleta do chat desligada, barra de baixo de volta');
 /* Demandas do estoque (celular): rótulo em cima, campo na largura toda, nada para fora */
 const d=await B.evaluate(()=>{const c=document.querySelector('.e99-demandas,#view .e99-dem-list');if(!c)return null;const card=c.closest('.panel,.card,.pn-card,section')||c;const cr=card.getBoundingClientRect();
   const f=[...document.querySelectorAll('.e99-dem-field')];return {n:f.length,out:[...card.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>cr.right+1||r.left<cr.left-1)}).length,
    stack:f.every(x=>{const s=x.querySelector('span').getBoundingClientRect(),i=x.querySelector('input').getBoundingClientRect();return i.top>=s.bottom-1&&i.width>=x.getBoundingClientRect().width-1}),
    gap:f.every(x=>x.getBoundingClientRect().height<120),sw:document.documentElement.scrollWidth}});
 ok(d&&d.n>0&&d.out===0&&d.stack&&d.gap&&d.sw<=390,'Demandas do estoque no celular: rótulo em cima, campo inteiro, sem vão e nada fora do cartão'+(d?' ('+JSON.stringify(d)+')':' (cartão não achado)'));
 const dc=await B.$('.e99-dem-list');if(dc){await dc.scrollIntoViewIfNeeded();await B.screenshot({path:path.join(OUT,'iphone-demandas.png')})}
 /* PC */
 await A.evaluate(()=>{localStorage.setItem('e99-test-chatgeral','1');go('chat')});await A.waitForTimeout(1500);
 const p=await A.evaluate(()=>({brand:getComputedStyle(document.querySelector('.v169-brand')).display,acts:[...document.querySelectorAll('.chat-head-acts button')].filter(e=>e.offsetParent).length,sw:document.documentElement.scrollWidth,who:document.querySelectorAll('#chat-list .v169-who').length}));
 ok(p.brand==='none'&&p.acts===4&&p.sw<=1440&&p.who>=3,'PC: barra de sempre, cabeçalho com telefone, vídeo, busca e convite');
 await A.screenshot({path:path.join(OUT,'pc-chat.png')});
 const dm=await A.evaluate(()=>{go('home');return new Promise(r=>setTimeout(()=>{const f=document.querySelector('.e99-dem-field');r(f?getComputedStyle(f).flexDirection:'-')},400))});ok(dm!=='column','PC: Demandas do estoque como antes ('+dm+')');
 ok(!errs.length,'0 erro de console e 0 404'+(errs.length?': '+errs.slice(0,3).join(' | '):''));console.log('errors',errs);await b.close()})().catch(e=>{console.log('FAIL erro',e);process.exit(1)});
