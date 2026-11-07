/* v122 ("Remova tudo, menos o chat"): sem S de partículas, grade Tron, rastros, holograma, "Pausar animação", Efeitos, música ♫,
   aviso "ilha", relógio, selos/perfis, gráfico do Início, "O que mudou?" e Authenticator. Logo S e S da abertura continuam.
   Login, Início, NFs, conferência e chat funcionando no PC 1440×900 e no iPhone 13; dados antigos dessas funções apagados. */
const L=require('./lib.js');const {ok,until}=L;
const URL0='http://localhost:8000/index.html?ntfy='+L.N;
const SEED=()=>{try{if(sessionStorage.getItem('seeded'))return;sessionStorage.setItem('seeded','1');['lojasg.estoque99.visual-effects','lojasg.estoque99.fx-pause','lojasg.estoque99.music','lojasg.estoque99.nv-seen:abc','lojasg.estoque99.verificados-login','lojasg.estoque99.profile-pub:abc','lojasg.estoque99.aux-profile:abc','lojasg.estoque99.totp:abc'].forEach(k=>localStorage.setItem(k,'1'));
  localStorage.setItem('lojasg.estoque99.chat:abc','fica');localStorage.setItem('lojasg.estoque99.ui-theme','violeta');const q=indexedDB.open('estoque99-profiles',1);q.onsuccess=()=>q.result.close()}catch(e){}};
(async()=>{const b=await L.chromium.launch();const errs=[];
 for(const [nome,opts] of [['PC',{viewport:{width:1440,height:900}}],['iPhone',L.devices['iPhone 13']]]){
  const c=await b.newContext(opts);await c.addInitScript(SEED);const P=await c.newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  await P.goto(URL0);await until(P,()=>!!window.__e99Boot,null,8000);await P.waitForTimeout(400);
  const ls=await P.evaluate(()=>Object.keys(localStorage));
  ok(!ls.some(k=>/visual-effects|fx-pause|\.music|nv-seen|verificados-login|profile-pub|aux-profile|\.totp/.test(k)),nome+': dados das funções removidas apagados do aparelho');
  ok(ls.includes('lojasg.estoque99.chat:abc')&&ls.includes('lojasg.estoque99.ui-theme'),nome+': o resto (chat, tema) fica intacto');
  const dbs=await P.evaluate(async()=>indexedDB.databases?(await indexedDB.databases()).map(d=>d.name):[]);
  ok(!dbs.includes('estoque99-profiles'),nome+': banco de perfis apagado');
  ok(await P.evaluate(()=>!document.querySelector('#auth-screen canvas,.tron-grid,.fx-pause,#effects-toggle')&&!window.e99Fx&&!window.toggleVisualEffects),nome+': tela de entrar sem partículas, grade, pausa e Efeitos');
  ok(await P.evaluate(()=>{const i=[...document.querySelectorAll('#auth-screen img')].find(x=>/^data:image\/svg/.test(x.getAttribute('src')||''));return !!i&&i.getBoundingClientRect().width>0}),nome+': logo S na tela de entrar');
  ok(await P.evaluate(()=>getComputedStyle(document.querySelector('#auth-screen form')).pointerEvents!=='none'),nome+': formulário liberado');
  await L.signup(P,'v122'+nome.toLowerCase());await P.waitForTimeout(1500);
  ok(await P.evaluate(()=>!!authSession&&page==='home'),nome+': entrou e está no Início');
  ok(await P.evaluate(()=>{const v=document.getElementById('view');return !!v.querySelector('.hero-home')&&!v.querySelector('canvas,.tron-grid,.e99-clock,.e99-trend,.fx-pause,.e99-streak')}),nome+': Início sem S de partículas, grade, relógio, gráfico e pausa');
  ok(await P.evaluate(()=>!document.getElementById('music-btn')&&!document.getElementById('e99-island')&&!window.e99Music&&!window.e99Island&&!window.e99Clock),nome+': sem música ♫, ilha e relógio');
  ok(await P.evaluate(()=>!labels.profile&&!labels.novidades&&!window.openProfile&&!window.e99VerTipo&&!document.querySelector('.vbadge')),nome+': sem perfil, "O que mudou?" e selos');
  ok(await P.evaluate(()=>{go('profile');const a=page;go('novidades');return a==='home'&&page==='home'}),nome+': endereços antigos levam ao Início');
  ok(await P.evaluate(()=>typeof window.e99Sting==='function'&&typeof window.playStokIntro==='function'),nome+': som e abertura (S) continuam');
  await P.evaluate(()=>{window.playStokIntro(false)});ok(await P.evaluate(()=>!!document.querySelector('#stok-intro .si-mark')),nome+': S da abertura aparece');
  await P.waitForTimeout(2000);ok(await P.evaluate(()=>!document.getElementById('stok-intro')),nome+': abertura termina');
  await P.evaluate(()=>go('account'));await P.waitForTimeout(400);
  ok(await P.evaluate(()=>!!document.getElementById('prefs-panel')&&!document.getElementById('pref-fx')&&!document.getElementById('pref-music')&&!/Authenticator/.test(document.getElementById('view').textContent)),nome+': Preferências sem Efeitos/música; sem Authenticator');
  await P.evaluate(async()=>{state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios',date:iso(),status:'Recebida',volumes:3,owner:''}];await save();go('nfs')});await P.waitForTimeout(500);
  ok(await P.evaluate(()=>page==='nfs'&&/48213/.test(document.getElementById('view').textContent)),nome+': Notas fiscais lista a NF');
  ok(await P.evaluate(()=>/CONFER/i.test(document.getElementById('view').textContent)&&typeof window.confStart==='function'),nome+': conferência por câmera disponível');
  ok(await P.evaluate(()=>!/holo-|cf-shine|cf-scanline/.test([...document.styleSheets].map(s=>{try{return [...s.cssRules].map(r=>r.cssText).join('')}catch(e){return ''}}).join(''))),nome+': conferência sem holograma');
  await P.evaluate(()=>go('chat'));await P.waitForTimeout(500);
  await P.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await P.click('text=Criar equipe e gerar código');
  ok(await until(P,()=>!!document.getElementById('chat-text'),null,15000),nome+': chat aberto na equipe');
  await P.fill('#chat-text','Oi equipe v122');await P.press('#chat-text','Enter');
  ok(await until(P,()=>[...document.querySelectorAll('#chat-list .chat-msg.mine')].some(m=>/Oi equipe v122/.test(m.textContent)&&!/Enviando/.test(m.textContent)),null,15000),nome+': mensagem enviada no chat');
  await c.close()}
 ok(!errs.length,'sem erros de página'+(errs.length?': '+errs.join(' | '):''));
 await b.close()})();
