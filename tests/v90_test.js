/* v90: partículas param e pausam (P1), busca e "Mostrar mais" nas NFs (P2/P3), erro certo para dado salvo inválido (P17),
   Administração bloqueada (P18), cartões 3D no toque, inclusive arrasto vertical (P19), ouvinte único (P20), aviso de prazos compacto (P22). */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 const c=await b.newContext({...L.devices['iPhone 13']});await c.addInitScript(()=>{try{localStorage.removeItem('lojasg.estoque99.fx-pause')}catch(e){}});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForTimeout(1500);
 ok(await until(A,()=>window.e99Fx&&e99Fx().login,null,5000),'partículas da entrada animam ao abrir');
 ok(await until(A,()=>window.e99Fx&&!e99Fx().login,null,9000),'partículas param sozinhas depois de assentar');
 ok(!!await A.$('#auth-screen .fx-pause'),'botão "Pausar animação" na tela de entrar');
 await A.click('#auth-screen .fx-pause');ok(await A.evaluate(()=>localStorage.getItem('lojasg.estoque99.fx-pause')==='1'&&/Retomar/.test(document.querySelector('#auth-screen .fx-pause').textContent)),'pausa fica lembrada');
 await A.click('#auth-screen .fx-pause');
 /* P17: senha certa + dado salvo inválido não diz "Senha incorreta" e não apaga nada */
 const l='v9'+T;await L.signup(A,l);
 await A.evaluate(async()=>{const sk=authSession.storeKey;const raw=localStorage.getItem(sk);const rec=JSON.parse(raw);const pl=Object.assign({},authSession.payload,{store:'x'.repeat(200)});const r2=await authEncrypt(authSession.key,rec,pl);localStorage.setItem(sk,JSON.stringify(r2));window.__sk=sk});
 const saved=await A.evaluate(()=>localStorage.getItem(window.__sk));
 await A.evaluate(()=>{authSession=null;renderAuth()});await A.waitForTimeout(600);
 await A.fill('#auth-form input[name=login]',l);await A.fill('#auth-form input[name=password]','1234');await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);
 const msg=await A.evaluate(()=>document.getElementById('auth-screen').innerText);
 ok(!/Senha incorreta/.test(msg)&&/Nada foi apagado/.test(msg),'dado inválido tem mensagem própria');ok(await A.evaluate(s=>localStorage.getItem(window.__sk)===s,saved),'nada foi apagado');
 await A.evaluate(s=>localStorage.removeItem(window.__sk));
 /* conta nova para o resto */
 await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForTimeout(1500);await L.signup(A,'w'+l);
 /* P2/P3: 120 NFs → 50 por vez; busca espera e filtra */
 await A.evaluate(async()=>{for(let i=0;i<120;i++)state.nfs.push({id:'z'+i,number:String(10000+i),supplier:i===77?'Laticínios Especial':'Forn '+i,date:iso(),status:'Pendente',owner:'',notes:'',volumes:1});await save();go('nfs')});await A.waitForTimeout(800);
 ok(await A.evaluate(()=>document.querySelectorAll('#nf-results tbody tr').length===50),'mostra 50 NFs');
 await A.click('#nf-results .more-row button');await A.waitForTimeout(400);ok(await A.evaluate(()=>document.querySelectorAll('#nf-results tbody tr').length===100),'"Mostrar mais" traz mais 50');
 await A.fill('#view input[name=nf-busca]','especial');const fast=await A.evaluate(()=>document.querySelectorAll('#nf-results tbody tr:not([hidden])').length);await A.waitForTimeout(500);
 ok(fast>1&&await A.evaluate(()=>document.querySelectorAll('#nf-results tbody tr:not([hidden])').length===1),'busca espera 150 ms e acha a NF');
 ok(await A.evaluate(()=>!document.querySelector('#nf-tabs [role=tab]')&&!!document.querySelector('#nf-tabs [aria-pressed]')),'filtros com aria-pressed (sem abas falsas)');
 /* P18 */
 await A.evaluate(()=>go('admin'));await A.waitForTimeout(400);ok(await A.evaluate(()=>/Só o gestor/.test(document.getElementById('view').innerText)&&!document.querySelector('#view button.danger')),'Administração bloqueada para conta comum');
 /* P19/P20: cartões 3D no toque */
 await A.evaluate(()=>{localStorage.setItem('lojasg.estoque99.fx','on');document.body.classList.remove('fx-user-off');window.__osReduce=false;go('home')});await A.waitForTimeout(800);
 await A.evaluate(()=>{go('nfs');go('home');go('nfs');go('home')});await A.waitForTimeout(500);
 const st=await A.$('#view .stats .stat');await st.scrollIntoViewIfNeeded();const bb=await st.boundingBox();const cdp=await c.newCDPSession(A);
 async function drag(dx,dy){const x=bb.x+bb.width*.5,y=bb.y+bb.height*.5;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});let m='';for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i,y:y+dy*i}]});await A.waitForTimeout(40)}
   m=await A.evaluate(()=>{const s=document.querySelector('#view .stats .stat');return s.style.getPropertyValue('--rx')+'|'+s.style.getPropertyValue('--ry')});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});return m}
 const h=await drag(10,0);ok(/deg/.test(h)&&h!=='0.00deg|0.00deg','toque com arrasto horizontal inclina ('+h+')');await A.waitForTimeout(700);
 const v=await drag(0,-8);ok(/deg/.test(v),'arrasto vertical também inclina ('+v+')');
 ok(await A.evaluate(()=>getComputedStyle(document.querySelector('#view .stats .stat')).touchAction==='pan-y'),'rolagem vertical continua liberada (pan-y)');
 await A.waitForTimeout(700);ok(await A.evaluate(()=>!document.querySelector('#view .stats .stat').style.getPropertyValue('--rx')),'volta ao normal depois de soltar');
 await A.evaluate(()=>{document.body.classList.add('fx-user-off')});const off=await drag(10,0);ok(!/deg/.test(off),'com Efeitos desligados não inclina');
 console.log('errors',errs);await b.close()})();
