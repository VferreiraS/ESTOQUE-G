let PW;try{PW=require('playwright')}catch(e){PW=require('/opt/node22/lib/node_modules/playwright')}const devices=PW.devices;
/* todo navegador de teste usa o emulador do Firebase e não mostra o passo de permissões */
const INIT=()=>{try{sessionStorage.setItem('e99-intro','1');localStorage.setItem('e99-fb-emu','127.0.0.1:9099|127.0.0.1:8080');if(!localStorage.getItem('e99-test-perm'))localStorage.setItem('e99-no-perm-step','1');if(!localStorage.getItem('e99-test-note'))localStorage.setItem('e99-no-cookie-note','1')}catch(e){}};
const chromium={launch:async(o)=>{const b=await PW.chromium.launch(o);const nc=b.newContext.bind(b);b.newContext=async(opts)=>{const c=await nc(opts);await c.addInitScript(INIT);return c};const np=b.newPage.bind(b);b.newPage=async(opts)=>{const c=await b.newContext(opts);return c.newPage()};return b}};
let EMN=0;const RUN=Date.now().toString(36);const mail=(l)=>String(l).toLowerCase().replace(/[^a-z0-9]/g,'')+'.'+RUN+(++EMN)+'@teste.com';
const N='http://localhost:20130';
/* marca "Li e aceito a Política de privacidade e os Termos de uso" quando a caixa existir */
async function terms(p,form){const b=await p.$((form||'')+' input[name=lgpdok]');if(b&&!(await b.isChecked()))await b.check()}
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
async function signup(p,l,store){await p.click('#auth-create');await p.fill('#auth-screen input[name=store]',store||('Loja '+l));await p.fill('#auth-screen input[name=login]',l);await p.fill('#auth-screen input[name=email]',mail(l));await p.fill('#auth-screen input[name=password]','1234');await p.fill('#auth-screen input[name=confirmation]','1234');const cb=await p.$('#auth-screen input[name=remember]');if(cb&&await cb.isChecked())await cb.uncheck();await terms(p,'#auth-form');await p.click('#auth-form button[type=submit]');await p.waitForTimeout(2500);await p.fill('#recovery-last4',(await p.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await p.click('#recovery-enter');await p.waitForTimeout(2000);await p.addStyleTag({content:'#alert-popup{display:none!important}'})}
async function login(p,l,pw){await p.fill('#auth-form input[name=login]',l);await p.fill('#auth-form input[name=password]',pw||'1234');await p.click('#auth-form button[type=submit]');await p.waitForTimeout(2500);await p.addStyleTag({content:'#alert-popup{display:none!important}'})}
async function until(p,fn,arg,ms=20000){const t=Date.now();while(Date.now()-t<ms){try{if(await p.evaluate(fn,arg))return true}catch(e){}await new Promise(r=>setTimeout(r,250))}return false}
async function makeInvite(A,name,pin){await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);await A.click('#aux-box summary');await A.fill('#aux-box input[name=name]',name);
 await A.evaluate(()=>{navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await A.click('#aux-box button.primary');await A.waitForTimeout(2500);
 const text=await A.evaluate(()=>window.__inv);const link=text.match(/(http\S+#auxiliar=[A-Za-z0-9_-]+)/)[1];KEYS[link]=await A.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('lojasg.estoque99.aux-invites:'));return JSON.parse(localStorage.getItem(k))[0].key});return link}
const KEYS={};
function inviteUrl(link){return link.replace('#','index.html?ntfy='+N+'#').replace('/index.htmlindex.html','/index.html')}
async function auxAccept(B,link,pin,pw){await B.goto('about:blank');await B.goto(inviteUrl(link));await B.waitForTimeout(2500);await B.fill('#aux-form input[name=pin]',KEYS[link]||pin);await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
 if(await B.$('#aux-form input[name=email]')&&!(await B.inputValue('#aux-form input[name=email]')))await B.fill('#aux-form input[name=email]',mail('aux'));await B.fill('#aux-form input[name=password]',pw);await B.fill('#aux-form input[name=confirmation]',pw);await terms(B,'#aux-form');await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
 await B.fill('#recovery-last4',(await B.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await B.click('#recovery-enter');await B.waitForTimeout(2500);await B.addStyleTag({content:'#alert-popup{display:none!important}'})}
async function gestorWithTeam(A,l){await A.goto('http://localhost:8000/index.html?ntfy='+N);await A.waitForTimeout(2500);await signup(A,l);
 await A.evaluate(async()=>{state.team=[{id:'ana',name:'Ana',role:'Repositora'}];state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'ana'}];state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:3}];
   state.plans=[{id:'p1',title:'Plano de terça',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana',notes:'',photos:[]}]}];await save();go('chat')});
 await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 return until(A,()=>syncStatus().ready&&syncStatus().pending===0&&syncStatus().connected)}
module.exports={terms,mail,chromium,devices,N,ok,signup,login,until,makeInvite,inviteUrl,auxAccept,gestorWithTeam};
