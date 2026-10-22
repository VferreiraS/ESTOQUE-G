/* Confere o site no ar (GitHub Pages e Firebase Hosting) no iPhone e no PC: versão, erros e rolagem lateral. */
let PW;try{PW=require('playwright')}catch(e){PW=require('/opt/node22/lib/node_modules/playwright')}
const SITES=['https://vferreiras.github.io/ESTOQUE-G/','https://gen-lang-client-0167474823-295e1.web.app/'];
(async()=>{const b=await PW.chromium.launch();const out=[];
 for(const url of SITES)for(const dev of [PW.devices['iPhone 13'],{viewport:{width:1440,height:900}}]){
  const c=await b.newContext(dev);await c.addInitScript(()=>{try{sessionStorage.setItem('e99-intro','1');localStorage.setItem('e99-no-cookie-note','1')}catch(e){}});const p=await c.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  let r={url,device:dev.viewport.width<500?'iPhone':'PC'};
  try{await p.goto(url+'?t='+Date.now(),{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(2500);
   r.version=await p.evaluate(()=>(document.querySelector('meta[name="estoque99-version"]')||{}).content||'');
   r.sw=await p.evaluate(async(u)=>{try{const t=await (await fetch(u+'sw.js?'+Date.now(),{cache:'no-store'})).text();return (t.match(/estoque99-v\d+/)||[''])[0]}catch(e){return 'erro'}},url);
   r.scrollLateral=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   r.telaLogin=await p.evaluate(()=>!!document.querySelector('#auth-form'));
  }catch(e){r.falha=e.message}
  r.erros=errs.slice(0,10);out.push(r);await c.close()}
 console.log(JSON.stringify(out,null,1));await b.close()})();
