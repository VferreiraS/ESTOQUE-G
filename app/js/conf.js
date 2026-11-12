
/* v96: conferência às cegas por câmera.
   Verdade local = IndexedDB "estoque99-conf" (cada registro cifrado com AES-GCM com a chave confKey guardada no estado cifrado da conta).
   Equipe = state.confs (cópia compacta) gravada só em pontos de controle (20 leituras, 60 s, pausar, finalizar, voltar a rede) → save() → sync (ntfy).
   Máquina de estados: ARMADO → mesmo código 2× em ≤600 ms → grava → +1 → TRAVADO → rearme (toque em "Próxima caixa" ou, opcional, 1,2 s sem código).
   A tela de contagem nunca lê state.nfs (às cegas). Tudo que vem de código lido entra por esc()/textContent. */
(function(){
'use strict';
var D=document,DBN='estoque99-conf',PAIR_MS=600,AUTO_MS=1200,TICK=120,CP_READS=20,CP_MS=60000,KEEP_DAYS=90,MAX_CONFS=200;
var CODE_OK=/^[0-9A-Za-z\-./ ()+]{0,64}$/;
var FMT={EAN_13:'E13',EAN_8:'E8',UPC_A:'UA',CODE_128:'C128',ITF:'ITF'},FMT_NAME={E13:'EAN-13',E8:'EAN-8',UA:'UPC-A',C128:'Code 128',ITF:'ITF-14',M:'Manual'};
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function pad(n,w){return String(n).padStart(w||2,'0')}
function h32(str){var h=0x811c9dc5;str=String(str||'');for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function logged(){try{return !!authSession}catch(x){return false}}
function role(){try{return authSession&&authSession.payload&&authSession.payload.role||''}catch(x){return ''}}
function isAuxNow(){return role()==='auxiliar'}
function acct(){return h32(authSession.storeKey)}
function devBase(){var k='lojasg.estoque99.device',v='';try{v=localStorage.getItem(k)||''}catch(e){}if(!/^[a-z0-9]{12}$/.test(v)){v=Array.from(crypto.getRandomValues(new Uint8Array(12)),function(b){return 'abcdefghijklmnopqrstuvwxyz0123456789'[b%36]}).join('');try{localStorage.setItem(k,v)}catch(e){}}return v}
function meDev(){return devBase()+h32(authSession?authSession.storeKey:'')}
function myLogin(){try{return String(authSession.record&&authSession.record.login||'').slice(0,80)}catch(x){return ''}}
function myName(){try{var t=window.e99Team&&window.e99Team.get();if(t&&t.name)return String(t.name).slice(0,60)}catch(e){}return myLogin().slice(0,60)||'Funcionário'}
function nowIso(){return new Date().toISOString()}
function dt(ms){var d=new Date(ms);return isNaN(d)?'':d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
function tm(ms){var d=new Date(ms);return isNaN(d)?'':d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
function dur(a,b){var s=Math.max(0,Math.round((b-a)/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return (h?h+' h ':'')+m+' min '+(s%60)+' s'}
function say(t){try{notify(t)}catch(x){}}
function $i(id){return D.getElementById(id)}

/* ---------- validação dos códigos (EAN-13, EAN-8, UPC-A, ITF-14 com dígito; Code 128 ≥4) ---------- */
function gtinOk(s){var n=s.length,sum=0;for(var i=0;i<n-1;i++){var d=+s.charAt(n-2-i);sum+=i%2===0?d*3:d}return (10-sum%10)%10===+s.charAt(n-1)}
function fmtKey(f){f=String(f||'').toUpperCase().replace(/-/g,'_');if(f==='ITF14'||f==='ITF_14')f='ITF';if(f==='EAN13')f='EAN_13';if(f==='EAN8')f='EAN_8';if(f==='UPCA')f='UPC_A';if(f==='CODE128')f='CODE_128';return f}
function check(text,format){var f=fmtKey(format),t=String(text==null?'':text).replace(/[\u0000-\u001f\u007f]/g,'').trim();
  if(f==='EAN_13'&&/^\d{13}$/.test(t)&&gtinOk(t))return {code:t,fmt:'E13'};
  if(f==='EAN_8'&&/^\d{8}$/.test(t)&&gtinOk(t))return {code:t,fmt:'E8'};
  if(f==='UPC_A'&&/^\d{12}$/.test(t)&&gtinOk(t))return {code:t,fmt:'UA'};
  if(f==='ITF'&&/^\d{14}$/.test(t)&&gtinOk(t))return {code:t,fmt:'ITF'};
  if(f==='CODE_128'&&t.length>=4&&t.length<=64&&CODE_OK.test(t))return {code:t,fmt:'C128'};
  return null}
/* ITF-14 e SSCC (Code 128 com AI 00) são sempre etiqueta de caixa: contam direto */
function boxCode(v){return v.fmt==='ITF'||(v.fmt==='C128'&&/^00\d{18}$/.test(v.code))}

/* ---------- IndexedDB próprio, cifrado ---------- */
var dbP=null;
function idb(){if(dbP)return dbP;dbP=new Promise(function(ok,ko){var r;try{r=indexedDB.open(DBN,1)}catch(e){dbP=null;ko(e);return}
  r.onupgradeneeded=function(){var d=r.result;if(!d.objectStoreNames.contains('sessions'))d.createObjectStore('sessions',{keyPath:'id'});if(!d.objectStoreNames.contains('reads')){var st=d.createObjectStore('reads',{keyPath:'id'});st.createIndex('conf','conf')}};
  r.onsuccess=function(){var d=r.result;d.onversionchange=function(){try{d.close()}catch(x){}dbP=null};ok(d)};
  r.onerror=function(){dbP=null;ko(r.error||Error('IndexedDB indisponível'))};r.onblocked=function(){}});return dbP}
function run(store,mode,fn){return idb().then(function(d){return new Promise(function(ok,ko){var t;try{t=d.transaction(store,mode)}catch(e){ko(e);return}var out;try{out=fn(t.objectStore(store))}catch(e){ko(e);return}
  t.oncomplete=function(){ok(out&&typeof out==='object'&&'result' in out&&out.readyState?out.result:out)};t.onerror=t.onabort=function(){ko(t.error||Error('Falha no IndexedDB'))}})})}
function idbPut(store,rec){return run(store,'readwrite',function(st){st.put(rec)})}
function idbPutMany(store,recs){return run(store,'readwrite',function(st){recs.forEach(function(r){st.put(r)})})}
function idbAll(store){return run(store,'readonly',function(st){return st.getAll()})}
function idbDropConf(id){return Promise.all([run('sessions','readwrite',function(st){st.delete(id)}),run('reads','readwrite',function(st){var c=st.index('conf').openCursor(IDBKeyRange.only(id));c.onsuccess=function(){var cur=c.result;if(!cur)return;cur.delete();cur.continue()}})])}
function idbByConf(id){return run('reads','readonly',function(st){return st.index('conf').getAll(id)})}
var keyP=null,keyFor='';
function b64(u){var s='';for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s)}
async function ckey(){if(!logged())throw Error('Entre na conta.');if(!state.confKey){state.confKey=b64(crypto.getRandomValues(new Uint8Array(32)));await save()}
  if(keyP&&keyFor===state.confKey)return keyP;keyFor=state.confKey;var raw=Uint8Array.from(atob(state.confKey),function(c){return c.charCodeAt(0)});keyP=crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);return keyP}
async function seal(obj,aad){var k=await ckey(),iv=crypto.getRandomValues(new Uint8Array(12));var ct=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:new TextEncoder().encode(aad)},k,new TextEncoder().encode(JSON.stringify(obj)));return {iv:iv,ct:new Uint8Array(ct)}}
async function unseal(rec,aad){var k=await ckey();var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:rec.iv,additionalData:new TextEncoder().encode(aad)},k,rec.ct);return JSON.parse(new TextDecoder().decode(pt))}
function rid(c,seq){return c+'-'+pad(seq,5)}

/* ---------- sessão atual ---------- */
var S=null,lockRel=null,M={st:'off',cand:null,lockCode:'',lastSeen:0,hintAt:0,otherAt:0,saving:false,ask:null},cp={n:0,t:0,seq:0,dirty:false},saveOk=true,tickT=0;
function metaOf(s){return {id:s.id,n:s.n,by:s.by,login:s.login,role:s.role,dev:s.dev,start:s.start,end:s.end,status:s.status,mode:s.mode,rule:s.rule,fixes:s.fixes,nf:s.nf||'',assocBy:s.assocBy||'',assocAt:s.assocAt||'',note:s.note||'',src:s.src==='coletor'?'coletor':''}}
async function putMeta(){if(!S)return;var r=await seal(metaOf(S),'s|'+S.id);await idbPut('sessions',{id:S.id,acct:S.acct,iv:r.iv,ct:r.ct})}
async function putRead(x){var r=await seal({seq:x.seq,at:x.at,code:x.code,fmt:x.fmt,m:x.m,st:x.st},'r|'+S.id+'|'+x.seq);return {id:rid(S.id,x.seq),acct:S.acct,conf:S.id,seq:x.seq,synced:x.synced?1:0,iv:r.iv,ct:r.ct}}
function valid(s){return (s||S).reads.filter(function(r){return r.st==='v'})}
function nextSeq(){return S.reads.reduce(function(m,r){return Math.max(m,r.seq)},0)+1}
function nextNumber(){var k='lojasg.estoque99.conf-n:'+acct(),n=0;try{n=+localStorage.getItem(k)||0}catch(e){}n++;
  (state.confs||[]).forEach(function(c){var m=String(c.n||'').match(/-(\d+)$/);if(c.dev===meDev()&&m)n=Math.max(n,+m[1]+1)});try{localStorage.setItem(k,String(n))}catch(e){}return 'CF-'+devBase().slice(0,3).toUpperCase()+'-'+pad(n,4)}
async function addRead(code,fmt,m){var x={seq:nextSeq(),at:Date.now(),code:code,fmt:fmt,m:m,st:'v',synced:0};
  try{await idbPut('reads',await putRead(x))}catch(e){saveOk=false;paint();return null}
  saveOk=true;S.reads.push(x);cp.n++;cp.dirty=true;return x}
function compact(s){var st=Date.parse(s.start)||Date.now();return {id:s.id,n:s.n,by:s.by,login:s.login,role:s.role,dev:s.dev,start:s.start,end:s.end||'',status:s.status,mode:s.mode,rule:{codes:Object.assign({},s.rule&&s.rule.codes||{})},
  reads:s.reads.slice().sort(function(a,b){return a.seq-b.seq}).slice(-5000).map(function(r){return [r.seq,Math.max(0,Math.round((r.at-st)/1000)),r.code,r.fmt,r.m,r.st]}),fixes:(s.fixes||[]).slice(-2000),total:valid(s).length,nf:s.nf||'',assocBy:s.assocBy||'',assocAt:s.assocAt||'',note:s.note||'',...(s.src==='coletor'?{src:'coletor'}:{})}}
function expand(c){var st=Date.parse(c.start)||Date.now();return {id:c.id,n:c.n,by:c.by,login:c.login,role:c.role,dev:c.dev,start:c.start,end:c.end||'',status:c.status,mode:c.mode||'toque',rule:{codes:Object.assign({},c.rule&&c.rule.codes||{})},fixes:(c.fixes||[]).slice(),nf:c.nf||'',assocBy:c.assocBy||'',assocAt:c.assocAt||'',note:c.note||'',src:c.src==='coletor'?'coletor':'',
  reads:(c.reads||[]).map(function(r){return {seq:r[0],at:st+r[1]*1000,code:r[2],fmt:r[3],m:r[4],st:r[5],synced:1}})}}
/* ponto de controle: copia para state.confs (preserva a associação feita por outro aparelho) e grava/sincroniza */
async function checkpoint(why){if(!S||!logged()||S.acct!==acct())return false;var c=compact(S),list=(state.confs||[]).slice(),i=list.findIndex(function(x){return x&&x.id===c.id});
  if(i>=0){var o=list[i];['nf','assocBy','assocAt','note'].forEach(function(k){if(o[k]&&!c[k])c[k]=o[k]});S.nf=c.nf;S.assocBy=c.assocBy;S.assocAt=c.assocAt;S.note=c.note;list[i]=c}else list.unshift(c);
  state.confs=prune(list);var seq=c.reads.length?c.reads[c.reads.length-1][0]:0;cp.n=0;cp.t=Date.now();cp.dirty=false;
  try{await save()}catch(e){}cp.seq=seq;paint();return true}
function prune(list){var lim=Date.now()-KEEP_DAYS*864e5;list=list.filter(function(c){return !(c&&(c.status==='finalizada'||c.status==='cancelada')&&Date.parse(c.end||c.start)<lim)});
  if(list.length>MAX_CONFS){var fin=list.filter(function(c){return c.status==='finalizada'||c.status==='cancelada'}).sort(function(a,b){return a.start<b.start?-1:1});var drop=new Set(fin.slice(0,list.length-MAX_CONFS).map(function(c){return c.id}));list=list.filter(function(c){return !drop.has(c.id)})}
  return validateConfs(list)}
function teamOn(){try{var s=window.syncStatus&&window.syncStatus();return !!(s&&s.active)}catch(e){return false}}
function pendingMine(id){try{return (state.sync&&state.sync.pending||[]).indexOf('confs|'+id)>=0}catch(e){return false}}
function syncText(){if(!S)return '';if(!teamOn())return 'Só neste aparelho (sem equipe sincronizada)';if(cp.dirty)return navigator.onLine===false?'Sem internet: fica no aparelho e envia quando voltar':'Próximo envio para a equipe em instantes';
  if(pendingMine(S.id))return navigator.onLine===false?'Sem internet: fica no aparelho e envia quando voltar':'Enviando para a equipe…';return 'Equipe sincronizada ✓'}
/* marca como sincronizadas no aparelho as leituras que já saíram (nunca apaga nada local) */
async function markSynced(){if(!S||!teamOn()||cp.dirty||!cp.seq||pendingMine(S.id))return;var todo=S.reads.filter(function(r){return !r.synced&&r.seq<=cp.seq});if(!todo.length)return;
  try{var recs=[];for(var i=0;i<todo.length;i++){todo[i].synced=1;recs.push(await putRead(todo[i]))}await idbPutMany('reads',recs)}catch(e){todo.forEach(function(r){r.synced=0})}}

/* ---------- carregar / recuperar ---------- */
async function loadMetas(){if(!logged())return [];var a=acct(),out=[];try{var rows=await idbAll('sessions');for(var i=0;i<rows.length;i++){var r=rows[i];if(!r||r.acct!==a)continue;try{out.push(await unseal(r,'s|'+r.id))}catch(e){}}}catch(e){}return out}
async function readsOf(id){var out=[],a=acct(),rows=await idbByConf(id);for(var i=0;i<rows.length;i++){if(rows[i].acct!==a)continue;try{var x=await unseal(rows[i],'r|'+id+'|'+rows[i].seq);x.synced=rows[i].synced;out.push(x)}catch(e){}}return out.sort(function(a,b){return a.seq-b.seq})}
async function interrupted(){if(!logged())return [];var me=meDev(),seen={},out=[],metas=await loadMetas();for(var i=0;i<metas.length;i++){var m=metas[i];if(m.dev===me&&(m.status==='ativa'||m.status==='pausada')){seen[m.id]=1;try{var st0=(state.confs||[]).find(function(c){return c.id===m.id}),rr=await readsOf(m.id),mx={};rr.forEach(function(r){mx[r.seq]=r.st});if(st0)st0.reads.forEach(function(r){if(!(r[0] in mx))mx[r[0]]=r[5]});m.total=Object.keys(mx).filter(function(k){return mx[k]==='v'}).length}catch(e){}out.push(m)}}
  (state.confs||[]).forEach(function(c){if(!seen[c.id]&&c.dev===me&&(c.status==='ativa'||c.status==='pausada'))out.push(c)});
  if(S&&S.status!=='finalizada'&&!out.some(function(m){return m.id===S.id}))out.unshift(S);return out}
async function loadSession(id){var me=null;try{var row=(await idbAll('sessions')).find(function(r){return r&&r.id===id&&r.acct===acct()});if(row)me=await unseal(row,'s|'+id)}catch(e){}
  var st=(state.confs||[]).find(function(c){return c.id===id}),s=me?Object.assign({},me):st?expand(st):null;if(!s)return null;s.acct=acct();var bySeq={};
  if(me){try{var rows2=await idbByConf(id);for(var i=0;i<rows2.length;i++){var r=rows2[i];if(r.acct!==s.acct)continue;try{var x=await unseal(r,'r|'+id+'|'+r.seq);x.synced=r.synced;bySeq[x.seq]=x}catch(e){}}}catch(e){}}
  var missing=[];if(st){expand(st).reads.forEach(function(x){if(!bySeq[x.seq]){bySeq[x.seq]=x;missing.push(x)}});if(!me||(st.fixes||[]).length>(s.fixes||[]).length)s.fixes=(st.fixes||[]).slice();['nf','assocBy','assocAt','note'].forEach(function(k){if(st[k])s[k]=st[k]})}
  s.reads=Object.keys(bySeq).map(function(k){return bySeq[k]}).sort(function(a,b){return a.seq-b.seq});if(!s.rule||!s.rule.codes)s.rule={codes:{}};if(!Array.isArray(s.fixes))s.fixes=[];
  S=s;if(!me||missing.length){try{await putMeta();var recs=[];for(var j=0;j<missing.length;j++)recs.push(await putRead(missing[j]));if(recs.length)await idbPutMany('reads',recs)}catch(e){}}
  cp={n:0,t:Date.now(),seq:st&&st.reads.length?st.reads[st.reads.length-1][0]:0,dirty:false};return S}
function lock(id){if(!navigator.locks||!navigator.locks.request)return Promise.resolve(true);release();
  return new Promise(function(ok){navigator.locks.request('e99-conf-'+id,{ifAvailable:true},function(l){if(!l){ok(false);return}ok(true);return new Promise(function(r){lockRel=r})}).catch(function(){ok(true)})})}
function release(){if(lockRel){try{lockRel()}catch(e){}lockRel=null}}

/* ---------- câmera e leitor ---------- */
/* v97: foco de perto. A v96 abria a câmera sem pedir foco/zoom e lia um recorte fixo reduzido, sem TRY_HARDER.
   Agora: 1920×1080 a 30 qps, foco/exposição contínuos quando o aparelho deixa, zoom leve (1,5×) para ler a 15–20 cm,
   recorte = área do retângulo na tela (com folga), quadro borrado é descartado e há 3 tentativas (cheia, metade com contraste, quadro inteiro). */
var cam={stream:null,track:null,timer:0,busy:false,torch:false,wake:null,token:0,devs:[],devId:'',cur:'',canvas:null,reader:null,bd:null,err:'',
  caps:{},adv:{},focus:[],zoom:0,zooms:[],refocusAt:0,okVar:0,cost:0,helpAt:0,since:0,lastOk:0,st:{n:0,blur:0,dark:0,flat:0},tip:false};
var ZK='lojasg.estoque99.conf-zoom',BLUR_MIN=0.04,HELP_MS=5000;
function camMsg(t){var el=$i('cf-msg');if(el)el.textContent=t}
function hint(t,now){now=now||performance.now();if(now-M.hintAt<1500)return;M.hintAt=now;camMsg(t)}
function stopCam(){cam.token++;clearTimeout(cam.timer);if(cam.stream){try{cam.stream.getTracks().forEach(function(t){t.stop()})}catch(e){}}cam.stream=null;cam.track=null;cam.torch=false;cam.adv={};cam.caps={};cam.focus=[];cam.zooms=[];cam.zoom=0;
  if(cam.wake){try{cam.wake.release()}catch(e){}cam.wake=null}var v=$i('cf-video');if(v){try{v.pause()}catch(e){}v.srcObject=null}if(M.st!=='ask')M.st='off';M.cand=null;paintCam()}
function camError(e){var n=e&&e.name||'';cam.err=n==='NotAllowedError'||n==='SecurityError'||n==='PermissionDeniedError'?'Permissão da câmera negada. Libere a câmera para este site (no iPhone: Ajustes › Safari › Câmera › Permitir) e toque em "Tentar de novo". Você pode continuar adicionando volumes à mão.'
  :n==='NotFoundError'||n==='OverconstrainedError'||n==='DevicesNotFoundError'?'Nenhuma câmera encontrada neste aparelho. Você pode adicionar volumes à mão.'
  :n==='NotReadableError'||n==='TrackStartError'||n==='AbortError'?'A câmera está em uso por outro app. Feche o outro app e toque em "Tentar de novo".'
  :n==='nosupport'?'Câmera indisponível neste navegador ou nesta página. Abra o site pelo Safari/Chrome (endereço https) ou adicione volumes à mão.'
  :'Não foi possível abrir a câmera. Toque em "Tentar de novo" ou adicione volumes à mão.';camMsg(cam.err);paintCam()}
/* v131: motor principal zxing-wasm (MIT; zxing-cpp Apache-2.0), mesmo 5 formatos; o .wasm vem do próprio site (nunca do CDN padrão da biblioteca). Se não carregar, fica o ZXing JS de antes. */
var WOPT={formats:['EAN13','EAN8','UPCA','Code128','ITF'],tryHarder:true,maxNumberOfSymbols:1};
async function prepWasm(){try{if(window.e99Need)await window.e99Need('zxingwasm');var W=window.ZXingWASM;if(!W||!W.readBarcodes||!W.prepareZXingModule)return false;
  if(!W.__e99){W.__e99=1;W.prepareZXingModule({overrides:{locateFile:function(p,pre){return /\.wasm$/.test(p)?new URL('vendor/zxing-wasm/zxing_reader.wasm',location.href).href:new URL('vendor/zxing-wasm/'+p,location.href).href}}})}
  var probe=D.createElement('canvas');probe.width=probe.height=8;await Promise.race([W.readBarcodes(probe.getContext('2d').getImageData(0,0,8,8),WOPT),new Promise(function(_,ko){setTimeout(function(){ko(Error('tempo'))},8000)})]);
  cam.wasm=W;cam.engine='zxing-wasm';return true}catch(e){return false}}
async function prepDecoder(){if(window.__confDecode)return;if(cam.reader||cam.bd||cam.wasm)return;
  try{if(window.BarcodeDetector&&BarcodeDetector.getSupportedFormats){var f=await BarcodeDetector.getSupportedFormats();var want=['ean_13','ean_8','upc_a','code_128','itf'].filter(function(x){return f.indexOf(x)>=0});if(want.indexOf('ean_13')>=0&&want.indexOf('code_128')>=0){cam.bd=new BarcodeDetector({formats:want});cam.engine='nativo';return}}}catch(e){}
  if(await prepWasm())return;
  if(typeof ZXing==='undefined'&&window.e99Need)await window.e99Need('zxing');
  var Z=window.ZXing,h=new Map();h.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.EAN_13,Z.BarcodeFormat.EAN_8,Z.BarcodeFormat.UPC_A,Z.BarcodeFormat.CODE_128,Z.BarcodeFormat.ITF]);h.set(Z.DecodeHintType.ALLOWED_LENGTHS,Int32Array.from([14]));h.set(Z.DecodeHintType.TRY_HARDER,true);
  var r=new Z.MultiFormatReader();r.setHints(h);cam.reader=r;cam.engine='zxing-js'}
function decodeCanvas(c){var Z=window.ZXing;try{var res=cam.reader.decodeWithState(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(c))));return {text:res.getText(),format:Z.BarcodeFormat[res.getBarcodeFormat()]}}catch(e){return null}finally{try{cam.reader.reset()}catch(e){}}}
/* qualidade do quadro: brilho, faixa de contraste e nitidez (maior degrau entre pixels vizinhos ÷ contraste, nas duas direções) */
function quality(c){var g=c.getContext('2d',{willReadFrequently:true}),w=c.width,h=c.height,K=9,lh=new Uint32Array(256),gx=new Uint32Array(256),gy=new Uint32Array(256),sum=0,n=0,k,i,d,L,p;
  if(w<8||h<8)return {blur:false,dark:false,flat:true,sharp:0,range:0,mean:0,lo:0,hi:255};
  for(k=1;k<=K;k++){d=g.getImageData(0,Math.floor(h*(.15+.7*k/(K+1))),w,1).data;p=-1;for(i=0;i<w;i++){L=(d[i*4]*77+d[i*4+1]*150+d[i*4+2]*29)>>8;lh[L]++;sum+=L;n++;if(p>=0)gx[Math.abs(L-p)]++;p=L}}
  for(k=1;k<=K;k++){d=g.getImageData(Math.floor(w*(.1+.8*k/(K+1))),0,1,h).data;p=-1;for(i=0;i<h;i++){L=(d[i*4]*77+d[i*4+1]*150+d[i*4+2]*29)>>8;if(p>=0)gy[Math.abs(L-p)]++;p=L}}
  function pct(hh,q){var tot=0,j;for(j=0;j<256;j++)tot+=hh[j];var lim=tot*q,acc=0;for(j=0;j<256;j++){acc+=hh[j];if(acc>=lim)return j}return 255}
  var lo=pct(lh,.02),hi=pct(lh,.98),range=hi-lo,edge=Math.max(pct(gx,.995),pct(gy,.995)),sharp=range>0?edge/range:0,mean=n?sum/n:0;
  return {lo:lo,hi:hi,range:range,mean:mean,sharp:sharp,flat:range<48,dark:mean<45,blur:range>=48&&sharp<BLUR_MIN}}
/* estica o contraste (cinza normalizado) para a tentativa extra */
function boost(c,q){var g=c.getContext('2d',{willReadFrequently:true}),im=g.getImageData(0,0,c.width,c.height),d=im.data,lo=q.lo,sc=255/Math.max(16,q.hi-q.lo);
  for(var i=0;i<d.length;i+=4){var L=((d[i]*77+d[i+1]*150+d[i+2]*29)>>8)-lo;L=L<0?0:L*sc;if(L>255)L=255;d[i]=d[i+1]=d[i+2]=L}g.putImageData(im,0,0)}
/* área do retângulo da tela convertida para pixels do vídeo (object-fit:cover), com folga para etiqueta grande/perto */
function frameRect(v){var vw=v.videoWidth,vh=v.videoHeight,full={x:0,y:0,w:vw,h:vh},fr=D.querySelector('#conf-dlg .cf-frame');if(!fr)return full;
  var vr=v.getBoundingClientRect(),r=fr.getBoundingClientRect();if(!vr.width||!vr.height||!r.width)return full;
  var s=Math.max(vr.width/vw,vr.height/vh),ox=(vr.width-vw*s)/2,oy=(vr.height-vh*s)/2,x=(r.left-vr.left-ox)/s,y=(r.top-vr.top-oy)/s,w=r.width/s,h=r.height/s,ex=w*.2,ey=h*.4;
  x=Math.max(0,x-ex);y=Math.max(0,y-ey);w=Math.min(vw-x,w+2*ex);h=Math.min(vh-y,h+2*ey);return w<32||h<32?full:{x:x,y:y,w:w,h:h}}
/* tentativas: 0 = retângulo em resolução cheia (até 1280); 1 = retângulo pela metade com contraste esticado; 2 = quadro inteiro reduzido */
var VARS=[{max:1280,full:false,boost:false},{max:640,full:false,boost:true},{max:960,full:true,boost:false}];
function draw(v,k){var o=VARS[k],r=o.full?{x:0,y:0,w:v.videoWidth,h:v.videoHeight}:frameRect(v),sc=Math.min(1,o.max/r.w),c=D.createElement('canvas');
  c.width=Math.max(1,Math.round(r.w*sc));c.height=Math.max(1,Math.round(r.h*sc));c.getContext('2d',{willReadFrequently:true}).drawImage(v,r.x,r.y,r.w,r.h,0,0,c.width,c.height);return c}
async function tryDecode(c){if(cam.wasm){try{var im=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,c.width,c.height),w=await cam.wasm.readBarcodes(im,WOPT);return w&&w.length?{text:w[0].text,format:w[0].format}:null}catch(e){return null}}if(cam.bd){try{var a=await cam.bd.detect(c);return a&&a.length?{text:a[0].rawValue,format:a[0].format}:null}catch(e){return null}}return cam.reader?decodeCanvas(c):null}
/* um quadro: descarta borrado; tenta primeiro a variação que leu por último e mais uma se der tempo */
async function scanFrame(first,more){var t0=performance.now(),q=quality(first);cam.st.n++;if(q.dark)cam.st.dark++;if(q.flat)cam.st.flat++;
  if(q.blur){cam.st.blur++;return {blur:true,q:q}}
  if(q.flat&&!window.__confDecode)return {q:q};/* quadro liso (sem contraste): não há código para ler */
  if(window.__confDecode)return window.__confDecode(first);
  var oth=[0,1,2].filter(function(k){return k!==cam.okVar}),order=[cam.okVar,oth[(cam.alt=(cam.alt|0)+1)%2]];
  for(var i=0;i<order.length;i++){var k=order[i],c=k===order[0]&&first.__k===k?first:more(k);if(!c)continue;if(VARS[k].boost)boost(c,k===first.__k?q:quality(c));
    var r=await tryDecode(c);if(r&&r.text){cam.okVar=k;r.q=q;return r}}
  return {q:q}}
async function grab(){var v=$i('cf-video');if(!v||v.readyState<2||!v.videoWidth)return null;var c=draw(v,0);c.__k=0;
  var r=await scanFrame(c,function(k){return k===0?c:draw(v,k)});return r}
function lastActivity(){return Math.max(cam.since,cam.lastOk,M.lastSeen||0)}
function helpTick(now,r){if(r&&r.text){cam.lastOk=now;cam.st={n:0,blur:0,dark:0,flat:0};return}
  if(M.st!=='armado'||now-lastActivity()<HELP_MS||now-cam.helpAt<HELP_MS)return;cam.helpAt=now;var s=cam.st,n=Math.max(1,s.n);
  var t=s.blur/n>.4?'Fora de foco: afaste uns 15 cm, segure parado e espere o foco'+(cam.stream?' (ou toque em "Ajustar foco").':'.')
   :s.dark/n>.5?(hasTorch()?'Pouca luz: acenda a lanterna ou procure mais luz.':'Pouca luz: procure mais luz sobre a etiqueta.')
   :'Ainda sem leitura: aproxime ou afaste, mais luz e código reto dentro do retângulo.';
  cam.st={n:0,blur:0,dark:0,flat:0};camMsg(t);
  if(cam.focus.indexOf('single-shot')>=0&&now-cam.refocusAt>3000)refocus(false)}
/* ritmo: período = maior entre 120 ms e 1,5× o tempo de leitura (aparelho lento lê menos vezes, sem travar a tela) */
function period(){return Math.max(TICK,Math.min(600,Math.round(cam.cost*1.5)))}
function pairWin(){return cam.stream?Math.max(PAIR_MS,Math.min(1500,Math.round(period()*2.2))):PAIR_MS}
function loop(){clearTimeout(cam.timer);if(!cam.stream||D.hidden||!S||S.status!=='ativa')return;var tok=cam.token,wait=Math.max(40,period()-Math.round(cam.cost));
  cam.timer=setTimeout(async function(){if(tok!==cam.token)return;var r=null;if(!cam.busy){cam.busy=true;var t0=performance.now();try{r=await grab()}catch(e){r=null}cam.cost=performance.now()-t0;cam.busy=false;
    if(tok===cam.token){var now=performance.now();feed(r&&r.text?r:null,now);helpTick(now,r)}}loop()},wait)}
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
/* aplica uma restrição avançada mantendo as anteriores; confere em getSettings() e desfaz se o aparelho ignorou */
async function setC(o){var t=cam.track;if(!t||!t.applyConstraints)return false;var m=Object.assign({},cam.adv,o);
  try{await t.applyConstraints({advanced:[m]})}catch(e){try{await t.applyConstraints({advanced:[cam.adv]})}catch(x){}return false}
  try{var s=t.getSettings&&t.getSettings()||{};for(var k in o){if(k in s&&(typeof o[k]==='number'?Math.abs(s[k]-o[k])>.05:s[k]!==o[k])){try{await t.applyConstraints({advanced:[cam.adv]})}catch(x){}return false}}}catch(e){}
  cam.adv=m;return true}
async function tune(tok){var t=cam.track,c={};if(!t)return;try{c=t.getCapabilities&&t.getCapabilities()||{}}catch(e){c={}}cam.caps=c;cam.adv={};
  cam.focus=Array.isArray(c.focusMode)?c.focusMode.slice():[];
  var fm=cam.focus.indexOf('continuous')>=0?'continuous':cam.focus.indexOf('single-shot')>=0?'single-shot':'';
  if(fm)await setC({focusMode:fm});if(tok!==cam.token)return;
  if(Array.isArray(c.exposureMode)&&c.exposureMode.indexOf('continuous')>=0)await setC({exposureMode:'continuous'});
  if(Array.isArray(c.whiteBalanceMode)&&c.whiteBalanceMode.indexOf('continuous')>=0)await setC({whiteBalanceMode:'continuous'});
  cam.zooms=[];cam.zoom=0;if(c.zoom&&typeof c.zoom.max==='number'&&c.zoom.max>=1.4){var mn=Math.max(1,+c.zoom.min||1);cam.zooms=[1,1.5,2,3].filter(function(z){return z>=mn&&z<=c.zoom.max});
    var want=+lsGet(ZK)||1.5;if(cam.zooms.indexOf(want)<0)want=cam.zooms.indexOf(1.5)>=0?1.5:cam.zooms[0];if(tok===cam.token&&await setC({zoom:want}))cam.zoom=want;else cam.zooms=[]}
  cam.refocusAt=performance.now();cam.tip=!fm}
/* "Ajustar foco": com foco por toque (single-shot) pede um novo foco; sem controle de foco (iPhone) reabre a câmera, que foca de novo */
async function refocus(manual){if(!cam.track)return;var tok=cam.token;cam.refocusAt=performance.now();
  if(cam.focus.indexOf('single-shot')>=0){var ok=await setC({focusMode:'single-shot'});if(manual)camMsg(ok?'Focando… segure parado a uns 15 cm.':'Não deu para focar. Afaste uns 15 cm.');
    if(ok&&cam.focus.indexOf('continuous')>=0)setTimeout(function(){if(tok===cam.token)setC({focusMode:'continuous'})},1200);return ok}
  if(!manual)return false;camMsg('Reabrindo a câmera para focar…');await startCam('Câmera reaberta. Segure parado a uns 15 cm até focar.');return true}
async function cycleZoom(){if(cam.zooms.length<2)return;var i=cam.zooms.indexOf(cam.zoom),z=cam.zooms[(i+1)%cam.zooms.length];if(await setC({zoom:z})){cam.zoom=z;lsSet(ZK,String(z));camMsg('Zoom '+zl(z)+'. Se a etiqueta não couber, diminua.')}else say('Zoom indisponível nesta câmera.');paintCam()}
function zl(z){return String(z).replace('.',',')+'×'}
async function startCam(okMsg){if(!S||S.status!=='ativa')return;if(S.src==='coletor')return startKbd(okMsg);stopCam();var tok=cam.token;cam.err='';camMsg('Abrindo a câmera…');paintCam();
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){camError({name:'nosupport'});return}
  var prep=prepDecoder().catch(function(e){return e});
  var video=Object.assign(cam.devId?{deviceId:{exact:cam.devId}}:{facingMode:{ideal:'environment'}},{width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30}}),stream;
  try{stream=await navigator.mediaDevices.getUserMedia({video:video,audio:false})}catch(e){if(tok===cam.token){if(cam.devId&&e&&e.name==='OverconstrainedError'){cam.devId='';startCam();return}camError(e)}return}
  if(tok!==cam.token||!S||S.status!=='ativa'){stream.getTracks().forEach(function(t){t.stop()});return}
  var pe=await prep;if(pe instanceof Error){stream.getTracks().forEach(function(t){t.stop()});camMsg(pe.message||'Não foi possível abrir o leitor de código.');return}
  if(tok!==cam.token){stream.getTracks().forEach(function(t){t.stop()});return}
  cam.stream=stream;cam.track=stream.getVideoTracks()[0]||null;var v=$i('cf-video');if(v){v.muted=true;v.setAttribute('playsinline','');v.srcObject=stream;try{await v.play()}catch(e){}}
  try{var s=cam.track&&cam.track.getSettings&&cam.track.getSettings();cam.cur=s&&s.deviceId||''}catch(e){}
  try{await tune(tok)}catch(e){}if(tok!==cam.token)return;
  try{var all=await navigator.mediaDevices.enumerateDevices();cam.devs=all.filter(function(d){return d.kind==='videoinput'&&d.deviceId})}catch(e){cam.devs=[]}
  try{if(navigator.wakeLock&&navigator.wakeLock.request)navigator.wakeLock.request('screen').then(function(w){if(tok===cam.token)cam.wake=w;else try{w.release()}catch(e){}}).catch(function(){})}catch(e){}
  if(M.st!=='ask'){M.st='armado';M.cand=null}cam.since=performance.now();cam.st={n:0,blur:0,dark:0,flat:0};
  camMsg(okMsg||(cam.tip?'Afaste uns 10–15 cm e aguarde o foco. Barras na horizontal dentro do retângulo.':'Aponte para a etiqueta da caixa, com as barras na horizontal dentro do retângulo.'));paintCam();loop()}
async function switchCam(){if(cam.devs.length<2)return;var i=cam.devs.findIndex(function(d){return d.deviceId===(cam.devId||cam.cur)});cam.devId=cam.devs[(i+1)%cam.devs.length].deviceId;await startCam()}
async function toggleTorch(){if(!cam.track)return;var want=!cam.torch;if(await setC({torch:want}))cam.torch=want;else say('Lanterna indisponível nesta câmera.');paintCam()}
function hasTorch(){try{var c=cam.track&&cam.track.getCapabilities&&cam.track.getCapabilities();return !!(c&&c.torch)}catch(e){return false}}

/* ---------- máquina de estados ---------- */
function ruleFor(v){if(boxCode(v))return 1;var r=S.rule.codes[v.code];return r===0||r===1?r:null}
function feed(r,now){now=now==null?performance.now():now;if(!S||S.status!=='ativa'||M.saving||M.st==='off'||M.st==='ask')return;var seen=!!(r&&r.text);if(seen)M.lastSeen=now;var v=seen?check(r.text,r.format):null;
  if(M.st==='travado'){if(S.mode==='auto'&&!seen&&now-M.lastSeen>=AUTO_MS){rearm('auto')}else{if(v&&v.code!==M.lockCode&&ruleFor(v)!==0&&now-M.otherAt>1500){M.otherAt=now;camMsg('Outro código na tela. Toque em "Próxima caixa" para contar.')}return}}
  if(M.st!=='armado')return;
  if(!seen){if(M.cand&&now-M.cand.t>pairWin())M.cand=null;return}
  if(!v){M.cand=null;hint('Código não aceito (formato ou dígito errado). Não contou.',now);return}
  var rule=ruleFor(v);if(rule===0){M.cand=null;hint('Código do produto: não conta. Aponte para a etiqueta da caixa.',now);return}
  if(M.cand&&M.cand.code===v.code&&now-M.cand.t<=pairWin()){M.cand=null;if(rule===null)askBox(v,now);else countIt(v,now);return}
  M.cand={code:v.code,t:now}}
async function countIt(v,now,m){M.saving=true;var x=await addRead(v.code,v.fmt,m||'c');M.saving=false;
  if(!x){M.st='armado';camMsg('Não salvo — tente de novo.');paint();return null}
  if(S&&S.src==='coletor'){M.st='armado';feedback();camMsg('Contou! Leia a próxima caixa.');paint();maybeCheckpoint();return x}
  M.st='travado';M.lockCode=v.code;M.lastSeen=now==null?performance.now():now;M.otherAt=M.lastSeen;feedback();
  camMsg(S.mode==='auto'?'Contou! Tire a câmera da etiqueta e aponte para a próxima caixa.':'Contou! Toque em "Próxima caixa" e aponte para a próxima etiqueta.');
  paint();maybeCheckpoint();var nx=$i('cf-next');if(nx&&S.mode!=='auto')try{nx.focus({preventScroll:true})}catch(e){}return x}
function rearm(){if(!S)return;M.st=armable()?'armado':'off';M.cand=null;M.lockCode='';cam.since=performance.now();camMsg('Pronto para a próxima caixa.');paint()}
function askBox(v,now){M.st='ask';v.now=now;M.ask=v;sheet('',false);var box=$i('cf-ask');if(box){box.hidden=false;box.innerHTML='<p><b>Este código é da CAIXA?</b></p><p class="small">'+esc(FMT_NAME[v.fmt]||v.fmt)+' · <code>'+esc(v.code)+'</code></p><p class="small">A resposta vale para esta conferência.</p><div class="cf-askbtns"><button type="button" class="primary" id="cf-yes">Sim, é da caixa (conta 1)</button><button type="button" id="cf-no">Não, é do produto (não conta)</button></div>';var y=$i('cf-yes');if(y)try{y.focus({preventScroll:true})}catch(e){}}camMsg('Código novo nesta conferência: responda abaixo.')}
async function answer(yes){var v=M.ask;if(!S||!v)return;M.ask=null;var box=$i('cf-ask');if(box){box.hidden=true;box.innerHTML=''}S.rule.codes[v.code]=yes?1:0;cp.dirty=true;var pm=putMeta().catch(function(){});
  if(yes){M.st='armado';await countIt(v,v.now)}else{M.st=armable()?'armado':'off';camMsg(S.src==='coletor'?'Certo: esse código não conta. Leia a etiqueta da caixa.':'Certo: esse código não conta. Aponte para a etiqueta da caixa.');paint()}await pm;if(S&&S.src==='coletor')kbdDrain()}
function feedback(){try{if(window.siteSoundEnabled!==false&&typeof playSiteSound==='function')playSiteSound('tap')}catch(e){}try{if(navigator.vibrate)navigator.vibrate(60)}catch(e){}
  var c=$i('cf-count');if(c){c.classList.add('hit');setTimeout(function(){c.classList.remove('hit')},260)}}
function maybeCheckpoint(){if(S&&cp.n>=CP_READS)checkpoint('20')}

/* ---------- ações ---------- */
async function undo(){if(!S||S.status==='finalizada')return;var l=valid().slice(-1)[0];if(!l){say('Nada para desfazer.');return}var old=l.st;l.st='x';l.synced=0;
  try{await idbPut('reads',await putRead(l))}catch(e){l.st=old;saveOk=false;paint();say('Não salvo — tente de novo.');return}
  S.fixes.push([S.fixes.length+1,nowIso(),myName(),'undo',l.seq]);try{await putMeta()}catch(e){}cp.n++;cp.dirty=true;if(M.st==='travado'&&M.lockCode===l.code)rearm();camMsg('Leitura '+pad(l.seq)+' desfeita.');paint();maybeCheckpoint()}
async function manual(code){if(!S||S.status==='finalizada')return null;code=String(code||'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,64);if(!CODE_OK.test(code)){say('Código inválido: use só letras, números, - . / ( ) +');return null}
  var x=await addRead(code,'M','h');if(!x){say('Não salvo — tente de novo.');return null}S.fixes.push([S.fixes.length+1,nowIso(),myName(),'add',x.seq]);try{await putMeta()}catch(e){}feedback();camMsg('Volume adicionado à mão.');paint();maybeCheckpoint();return x}
async function pause(why){if(!S||S.status!=='ativa')return;stopCam();S.status='pausada';try{await putMeta()}catch(e){}await checkpoint('pausa');paint();if(why)camMsg(why)}
async function resume(){if(!S||S.status!=='pausada')return;S.status='ativa';try{await putMeta()}catch(e){}paint();try{if(typeof unlockSiteAudio==='function')unlockSiteAudio()}catch(e){}await startCam()}
async function finish(){if(!S||S.status==='finalizada')return;if(!confirm('Finalizar a conferência '+S.n+' com '+valid().length+' volume(s)? Depois de finalizar não dá para contar mais nesta conferência.'))return;
  stopCam();S.status='finalizada';S.end=nowIso();try{await putMeta()}catch(e){}await checkpoint('fim');release();var id=S.id;showReport(id);say('Conferência '+S.n+' finalizada: '+valid().length+' volume(s).');try{window.e99PowerUp&&window.e99PowerUp()}catch(e){}}

/* v98: descartar = apaga a sessão e as leituras do aparelho, sem relatório. Na equipe fica só um marcador "cancelada" sem leituras
   (o sync não aceita apagar pelo ntfy; o aparelho dono pode atualizar, então as cópias dos outros também perdem as leituras). */
async function discard(){if(!S||S.status==='finalizada')return;if(S.dev!==meDev()||S.acct!==acct()){say('Só quem fez a conferência, neste aparelho, pode descartar.');return}
  if(!confirm('Descartar a conferência '+S.n+' ('+valid().length+' volume(s))? As leituras serão apagadas e não haverá relatório. Não dá para desfazer.'))return;
  var id=S.id,n=S.n,c=compact(S);stopCam();clearInterval(tickT);tickT=0;S=null;M.st='off';M.ask=null;release();
  try{await idbDropConf(id)}catch(e){}
  var list=(state.confs||[]).filter(function(x){return x&&x.id!==id});
  if((state.confs||[]).some(function(x){return x&&x.id===id}))list.unshift(Object.assign(c,{status:'cancelada',end:nowIso(),reads:[],fixes:[],rule:{codes:{}},total:0,nf:'',assocBy:'',assocAt:'',note:''}));
  state.confs=validateConfs(list);try{await save()}catch(e){}
  var d=$i('conf-dlg');if(d&&d.open)try{d.close()}catch(x){d.removeAttribute('open')}D.body.classList.remove('conf-on');
  try{if(typeof page!=='undefined'&&page==='nfs')render()}catch(e){}say('Conferência '+n+' descartada.')}

/* ---------- tela de contagem (v97: tela cheia, minimalista, holograma) ---------- */
var IC={pause:'<path d="M8 5v14M16 5v14"/>',play:'<path d="M7 5l12 7-12 7z"/>',plus:'<path d="M12 5v14M5 12h14"/>',torch:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  swap:'<path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/>',focus:'<circle cx="12" cy="12" r="3"/><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/>',
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',done:'<path d="m5 12 5 5 9-10"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',up:'<path d="m6 15 6-6 6 6"/>',next:'<path d="M5 12h14M13 6l6 6-6 6"/>'};
function ic(n){return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+IC[n]+'</svg>'}
function sheetOpen(){return ['cf-hsheet','cf-manual-form'].some(function(id){var e=$i(id);return e&&!e.hidden})}
function sheet(id,show){['cf-hsheet','cf-manual-form'].forEach(function(k){var e=$i(k);if(e)e.hidden=k===id?!show:true});var hb=$i('cf-histbtn');if(hb)hb.setAttribute('aria-expanded',String(id==='cf-hsheet'&&show));
  if(show){var f=id==='cf-manual-form'?$i('cf-mcode'):$i('cf-hclose');if(f)try{f.focus({preventScroll:true})}catch(e){}}}
function dlg(){var d=$i('conf-dlg');if(!d){d=D.createElement('dialog');d.id='conf-dlg';d.setAttribute('aria-labelledby','cf-title');D.body.appendChild(d);
  d.addEventListener('click',onClick);d.addEventListener('submit',function(ev){ev.preventDefault();if(ev.target&&ev.target.id==='cf-manual-form'){var i=$i('cf-mcode');manual(i?i.value:'').then(function(x){if(x){sheet('cf-manual-form',false);if(i)i.value=''}})}});
  d.addEventListener('change',function(ev){if(ev.target&&ev.target.id==='cf-autochk'&&S){S.mode=ev.target.checked?'auto':'toque';putMeta().catch(function(){});cp.dirty=true;paint()}});
  d.addEventListener('cancel',function(ev){ev.preventDefault();if(sheetOpen()){sheet('',false);return}closeDlg()});d.addEventListener('close',function(){D.body.classList.remove('conf-on')})}return d}
function openDlg(){var d=dlg();if(!d.open)try{d.showModal()}catch(x){d.setAttribute('open','')}D.body.classList.add('conf-on')}
async function closeDlg(){var counting=!!$i('cf-count');if(S&&S.status==='ativa')await pause();var d=$i('conf-dlg');stopCam();if(d&&d.open)try{d.close()}catch(x){d.removeAttribute('open')}D.body.classList.remove('conf-on');clearInterval(tickT);tickT=0;
  if(counting&&S&&S.status!=='finalizada')say('Conferência '+S.n+' pausada. Continue pela tela de Notas fiscais.');if(S&&S.status==='finalizada'){S=null}try{if(typeof page!=='undefined'&&page==='nfs')render()}catch(e){}}
function onClick(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var id=b.id;
  if(id==='cf-x')closeDlg();else if(id==='cf-next'){rearm()}else if(id==='cf-pause'){if(S&&S.status==='ativa')pause('Pausada. A contagem está salva.');else resume()}else if(id==='cf-resume')resume();
  else if(id==='cf-manual'){var f=$i('cf-manual-form');sheet('cf-manual-form',!!(f&&f.hidden))}
  else if(id==='cf-mcancel'||id==='cf-hclose')sheet('',false);else if(id==='cf-histbtn'){var h=$i('cf-hsheet');sheet('cf-hsheet',!!(h&&h.hidden))}
  else if(id==='cf-undo')undo();else if(id==='cf-finish')finish();else if(id==='cf-discard')discard();else if(id==='cf-yes')answer(true);else if(id==='cf-no')answer(false);
  else if(id==='cf-switch')switchCam();else if(id==='cf-torch')toggleTorch();else if(id==='cf-retry'){cam.err='';startCam()}else if(id==='cf-focus')refocus(true);else if(id==='cf-zoom')cycleZoom();
  else if(id==='cf-csv')csv(b.dataset.id);else if(id==='cf-xlsx')xlsx(b.dataset.id);else if(id==='cf-pdf')pdf(b.dataset.id);else if(id==='cf-assoc-go')assocSave(b.dataset.id);else if(id==='cf-close')closeDlg();
  else if(id==='cf-mark')markNF(b.dataset.id,b.dataset.st)}
function shell(){var d=dlg();d.innerHTML='<div class="cf-bg" aria-hidden="true"></div><div class="cf-wrap cf-scan">'
  +'<div class="cf-top"><div class="cf-topt"><h2 id="cf-title"></h2><p class="cf-sub"><span class="cf-st" id="cf-st"></span><span id="cf-save" role="status"></span></p></div><button type="button" class="cf-ib cf-x" id="cf-x" aria-label="Fechar (a conferência fica pausada)">'+ic('x')+'</button></div>'
  +'<div class="cf-cam" id="cf-cam"><video id="cf-video" muted playsinline autoplay aria-label="Imagem da câmera"></video><div class="cf-frame" aria-hidden="true"><i></i></div>'
  +'<div class="cf-camoff" id="cf-camoff" hidden><p id="cf-camofft"></p><button type="button" id="cf-retry" hidden>Tentar de novo</button><button type="button" class="primary" id="cf-resume" hidden>Continuar</button></div>'
  +'<div class="cf-tools" role="toolbar" aria-label="Câmera e opções"><button type="button" class="cf-ib" id="cf-pause" aria-label="Pausar" title="Pausar">'+ic('pause')+'</button><button type="button" class="cf-ib" id="cf-manual" aria-label="Adicionar volume à mão" title="Volume à mão">'+ic('plus')+'</button>'
  +'<button type="button" class="cf-ib" id="cf-torch" hidden aria-pressed="false" aria-label="Lanterna" title="Lanterna">'+ic('torch')+'</button><button type="button" class="cf-ib" id="cf-switch" hidden aria-label="Trocar câmera" title="Trocar câmera">'+ic('swap')+'</button></div>'
  +'<div class="cf-camfoot"><button type="button" class="cf-pill" id="cf-focus" hidden>'+ic('focus')+'<span>Ajustar foco</span></button><button type="button" class="cf-pill" id="cf-zoom" hidden aria-label="Zoom da câmera"></button></div></div>'
  +'<p class="cf-msg" id="cf-msg" role="status" aria-live="polite"></p>'
  +'<div class="cf-panel"><div class="cf-countwrap"><div class="cf-countbox"><div class="cf-count" id="cf-count" aria-live="polite" aria-atomic="true">00</div></div><div class="cf-countlab" id="cf-countlab">volumes contados</div></div>'
  +'<p class="cf-last">Último: <code id="cf-last">—</code></p>'
  +'<button type="button" class="primary cf-next" id="cf-next" disabled><span>Próxima caixa</span>'+ic('next')+'</button>'
  +'<div class="cf-row2"><button type="button" class="cf-sec" id="cf-undo">'+ic('undo')+'<span>Desfazer</span></button><button type="button" class="cf-sec cf-finish" id="cf-finish">'+ic('done')+'<span>Finalizar</span></button></div>'
  +'<button type="button" class="cf-discard" id="cf-discard">Descartar conferência</button>'
  +'<button type="button" class="cf-handle" id="cf-histbtn" aria-expanded="false" aria-controls="cf-hsheet">'+ic('up')+'<span>Histórico · <span id="cf-hn">0</span></span></button></div></div>'
  +'<div class="cf-sheet cf-ask" id="cf-ask" hidden></div>'
  +'<section class="cf-sheet" id="cf-hsheet" hidden aria-labelledby="cf-htitle"><div class="cf-shead"><h3 id="cf-htitle">Histórico</h3><button type="button" class="cf-ib" id="cf-hclose" aria-label="Fechar histórico">'+ic('x')+'</button></div>'
  +'<p class="cf-meta" id="cf-meta"></p><label class="cf-auto"><input type="checkbox" id="cf-autochk"> Rearme automático: conta de novo quando nenhum código aparece por 1,2 s</label><ol class="cf-hist" id="cf-hist"></ol></section>'
  +'<form class="cf-sheet cf-manual" id="cf-manual-form" hidden><div class="cf-shead"><h3>Volume à mão</h3><button type="button" class="cf-ib" id="cf-mcancel" aria-label="Cancelar">'+ic('x')+'</button></div><label>Código da caixa (opcional)<input id="cf-mcode" maxlength="64" inputmode="text" autocomplete="off" spellcheck="false" placeholder="Deixe vazio se não tiver código"></label><button type="submit" class="primary">Adicionar 1 volume</button></form>'}
var ST={ativa:'Contando',pausada:'Pausada',finalizada:'Finalizada',cancelada:'Cancelada'};
function paintCam(){if(!S)return;var box=$i('cf-cam'),off=$i('cf-camoff');if(!box)return;if(S.src==='coletor')return paintKbd(box,off);var on=!!cam.stream,pz=S.status==='pausada';box.classList.toggle('off',!on);
  if(off){off.hidden=on;var t=$i('cf-camofft');if(t)t.textContent=pz?'Pausada':cam.err?'Câmera desligada':'Ligando a câmera…'}
  var r=$i('cf-retry');if(r)r.hidden=!(cam.err&&S.status==='ativa');var rs=$i('cf-resume');if(rs)rs.hidden=!pz;
  var sw=$i('cf-switch');if(sw)sw.hidden=!(on&&cam.devs.length>1);
  var t2=$i('cf-torch');if(t2){t2.hidden=!(on&&hasTorch());t2.setAttribute('aria-pressed',String(!!cam.torch));t2.setAttribute('aria-label',cam.torch?'Desligar lanterna':'Ligar lanterna')}
  var fo=$i('cf-focus');if(fo)fo.hidden=!on;var z=$i('cf-zoom');if(z){z.hidden=!(on&&cam.zooms.length>1);z.textContent=cam.zoom?zl(cam.zoom):'';z.setAttribute('aria-label','Zoom da câmera: '+(cam.zoom?zl(cam.zoom):'')+'. Toque para trocar.')}
  var p=$i('cf-pause');if(p){var a=S.status==='ativa';p.innerHTML=ic(a?'pause':'play');p.setAttribute('aria-label',a?'Pausar':'Continuar');p.title=a?'Pausar':'Continuar';p.disabled=S.status==='finalizada'}}
function lastTxt(r){if(!r)return '—';var c=r.code||'';return (c?c+(c.length>4?' (final '+c.slice(-4)+')':''):'sem código')+(r.m==='h'?' · à mão':'')+(r.st==='x'?' · desfeita':'')}
function paint(){if(!S||!$i('cf-count'))return;var v=valid(),n=v.length;
  $i('cf-title').textContent='Conferência '+S.n;var mt=$i('cf-meta');if(mt)mt.textContent=S.by+' · início '+dt(Date.parse(S.start))+' · ID '+S.id;
  var st=$i('cf-st');st.textContent=ST[S.status]||S.status;st.dataset.st=S.status;
  $i('cf-save').textContent=(saveOk?'Salvo no aparelho ✓':'Não salvo — tente de novo')+' · '+syncText();
  var c=$i('cf-count');var txt=pad(n);if(c.textContent!==txt)c.textContent=txt;c.setAttribute('aria-label',n+(n===1?' volume contado':' volumes contados'));
  var nx=$i('cf-next');nx.disabled=!(M.st==='travado'&&S.status==='ativa');
  $i('cf-undo').disabled=!n;var dc=$i('cf-discard');if(dc)dc.disabled=S.status==='finalizada';var ac=$i('cf-autochk');if(ac)ac.checked=S.mode==='auto';
  $i('cf-last').textContent=lastTxt(S.reads.slice(-1)[0]);
  $i('cf-hn').textContent=String(S.reads.length);
  $i('cf-hist').innerHTML=S.reads.slice(-50).reverse().map(function(r){return '<li class="'+(r.st==='x'?'x':'')+'"><b>'+pad(r.seq)+'</b><span>'+esc(tm(r.at))+'</span><code>'+esc(r.code||'(sem código)')+'</code><span class="small">'+mName(S,r).toLowerCase()+(r.st==='x'?' · desfeita':'')+'</span></li>'}).join('');
  if(S.src==='coletor')nx.hidden=true;
  paintCam()}
function tick(){if(!S){clearInterval(tickT);tickT=0;return}if(!logged()||S.acct!==acct()){stopCam();S=null;var d=$i('conf-dlg');if(d&&d.open)try{d.close()}catch(e){}return}
  if(S.status==='ativa'&&cp.dirty&&Date.now()-cp.t>=CP_MS)checkpoint('60s');markSynced().then(function(){var el=$i('cf-save');if(el&&S)el.textContent=(saveOk?'Salvo no aparelho ✓':'Não salvo — tente de novo')+' · '+syncText()})}
async function openCounting(s){S=s;M={st:'off',cand:null,lockCode:'',lastSeen:0,hintAt:0,otherAt:0,saving:false,ask:null};cam.err='';kbd.q=[];kbd.buf='';shell();if(S.src==='coletor')kbdShell();openDlg();paint();clearInterval(tickT);tickT=setInterval(tick,3000);
  if(S.status==='ativa')await startCam();else camMsg('Conferência pausada. Toque em "Continuar" para seguir contando.')}

/* ---------- v142: coletor de dados (leitor tipo Eyoyo no modo teclado HID: digita o código e manda Enter) ----------
   Sem câmera e sem ZXing. Ouvinte de teclado no documento enquanto a tela de contagem do coletor está aberta e ativa
   (sem campo focado: o teclado virtual do celular não abre). Junta as teclas que chegam rápidas (≤60 ms entre elas)
   até Enter/Tab, ou fecha sozinho 80 ms depois da última tecla quando vieram ≥6 caracteres (coletor sem Enter no fim).
   Digitação lenta (pessoa) zera o pedaço e não conta. Cada leitura conta 1 na hora (mesmo código de novo = mais 1).
   As leituras gravam m:'c' (como a câmera, para aparelhos antigos aceitarem) e a conferência leva src:'coletor'. */
var KBD_SVG='<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10v4M10 10v4M12.5 10v4M15 10v4M17 10v4"/>';
var kbd={buf:'',last:0,timer:0,q:[],busy:false},KBD_GAP=60,KBD_IDLE=80,KBD_MIN=6;
function armable(){return !!(cam.stream||M.fake||(S&&S.src==='coletor'&&S.status==='ativa'))}
function mName(c,r){return r.m==='h'?'Manual':c&&c.src==='coletor'?'Coletor':'Câmera'}
function errSound(){try{if(window.siteSoundEnabled===false||typeof siteSoundEnabled!=='undefined'&&!siteSoundEnabled)return;var ctx=typeof siteAudio!=='undefined'?siteAudio:null;if(!ctx||ctx.state!=='running'||D.hidden)return;var t=ctx.currentTime;
  [[220,0],[175,.12]].forEach(function(n){var o=ctx.createOscillator(),g=ctx.createGain();o.type='square';o.frequency.setValueAtTime(n[0],t+n[1]);g.gain.setValueAtTime(0,t+n[1]);g.gain.linearRampToValueAtTime(.03,t+n[1]+.01);g.gain.exponentialRampToValueAtTime(.0001,t+n[1]+.11);o.connect(g);g.connect(ctx.destination);o.start(t+n[1]);o.stop(t+n[1]+.13)})}catch(e){}
  try{if(navigator.vibrate)navigator.vibrate([40,40,40])}catch(e){}}
/* o mesmo check() da câmera, sem saber o formato: só números de 8/12/13/14 dígitos exigem o dígito verificador */
function kbdCheck(t){t=String(t==null?'':t).replace(/[\u0000-\u001f\u007f]/g,'').trim();if(!t)return null;
  if(/^\d+$/.test(t)&&[8,12,13,14].indexOf(t.length)>=0)return check(t,t.length===13?'EAN_13':t.length===8?'EAN_8':t.length===12?'UPC_A':'ITF');
  if(t.length<4||t.length>40)return null;return check(t,'CODE_128')}
async function startKbd(okMsg){if(!S||S.status!=='ativa')return;stopCam();kbd.buf='';var tok=cam.token;
  try{if(navigator.wakeLock&&navigator.wakeLock.request)navigator.wakeLock.request('screen').then(function(w){if(tok===cam.token)cam.wake=w;else try{w.release()}catch(e){}}).catch(function(){})}catch(e){}
  if(M.st!=='ask')M.st='armado';try{var a=D.activeElement;if(a&&a!==D.body&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))a.blur()}catch(e){}
  camMsg(okMsg||'Pronto. Aponte o coletor para a etiqueta da caixa e aperte o gatilho.');paintCam();kbdDrain()}
function kbdShell(){var box=$i('cf-cam');if(!box)return;box.classList.add('cf-kbdbox');['cf-video'].forEach(function(id){var e=$i(id);if(e)e.remove()});
  Array.prototype.forEach.call(box.querySelectorAll('.cf-frame,.cf-camfoot,#cf-torch,#cf-switch'),function(e){e.remove()});
  var i=D.createElement('div');i.className='cf-kbdinfo';i.id='cf-kbdinfo';i.innerHTML='<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+KBD_SVG+'</svg><p class="cf-kbdst" id="cf-kbdst">Pronto para ler</p><p class="cf-kbdtip">Aponte o coletor e aperte o gatilho. O coletor precisa estar no modo teclado (HID).</p>';
  box.insertBefore(i,box.firstChild);var tl=box.querySelector('.cf-tools');if(tl)tl.setAttribute('aria-label','Coletor e opções');
  var au=$i('cf-autochk');if(au&&au.closest('label'))au.closest('label').remove();var nx=$i('cf-next');if(nx)nx.hidden=true;
  var d=$i('conf-dlg');if(d)d.classList.add('cf-kbdmode')}
function paintKbd(box,off){var on=S.status==='ativa',pz=S.status==='pausada';box.classList.toggle('off',!on);if(off){off.hidden=on;var t=$i('cf-camofft');if(t)t.textContent=pz?'Pausada':'Finalizada'}
  var r=$i('cf-retry');if(r)r.hidden=true;var rs=$i('cf-resume');if(rs)rs.hidden=!pz;var inf=$i('cf-kbdinfo');if(inf)inf.hidden=!on;
  var st=$i('cf-kbdst');if(st)st.textContent=M.st==='ask'?'Responda a pergunta abaixo':'Pronto para ler';
  var p=$i('cf-pause');if(p){p.innerHTML=ic(on?'pause':'play');p.setAttribute('aria-label',on?'Pausar':'Continuar');p.title=on?'Pausar':'Continuar';p.disabled=S.status==='finalizada'}}
/* 1 = captura e conta; 2 = engole (pergunta "é da CAIXA?" aberta: o Enter do coletor não pode responder sozinho); 0 = não mexe */
function kbdActive(){if(!S||S.src!=='coletor'||S.status!=='ativa')return 0;var d=$i('conf-dlg');if(!d||!d.open||!$i('cf-count'))return 0;
  var a=D.activeElement;if(a&&(a.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)))return 0;if(sheetOpen())return 0;return M.st==='ask'?2:1}
function kbdEnd(){clearTimeout(kbd.timer);kbd.timer=0;var c=kbd.buf;kbd.buf='';if(c.length<4)return;if(kbd.swallow){camMsg('Responda a pergunta antes de ler outro código.');return}kbd.q.push({t:c,now:performance.now()});kbdDrain()}
async function kbdDrain(){if(kbd.busy)return;kbd.busy=true;try{while(kbd.q.length&&S&&S.src==='coletor'&&S.status==='ativa'&&M.st!=='ask'){var it=kbd.q.shift(),v=kbdCheck(it.t);
    if(!v){errSound();camMsg('Código não aceito (formato ou dígito errado). Não contou.');continue}
    var rule=ruleFor(v);if(rule===0){errSound();camMsg('Código do produto: não conta. Leia a etiqueta da caixa.');continue}
    if(rule===null){askBox(v,it.now);paintCam();break}
    M.st='armado';await countIt(v,it.now,'c')}}finally{kbd.busy=false}}
D.addEventListener('keydown',function(ev){var mode=kbdActive();if(!mode){if(kbd.buf){kbd.buf='';clearTimeout(kbd.timer)}return}kbd.swallow=mode===2;if(ev.ctrlKey||ev.metaKey||ev.altKey||ev.isComposing)return;var k=ev.key,now=performance.now();
  if(k==='Enter'||k==='Tab'){if(kbd.buf&&now-kbd.last<=400){var long=kbd.buf.length>=4;if(long){ev.preventDefault();ev.stopPropagation()}kbdEnd()}else kbd.buf='';return}
  if(typeof k!=='string'||k.length!==1)return;
  if(kbd.buf&&now-kbd.last>KBD_GAP)kbd.buf='';kbd.buf+=k;kbd.last=now;if(kbd.buf.length>64)kbd.buf=kbd.buf.slice(-64);ev.preventDefault();ev.stopPropagation();
  clearTimeout(kbd.timer);kbd.timer=setTimeout(function(){if(kbd.buf.length>=KBD_MIN&&performance.now()-kbd.last>=KBD_IDLE-5)kbdEnd();else kbd.buf=''},KBD_IDLE)},true);
D.addEventListener('keyup',function(ev){if(kbdActive()&&(ev.key===' '||ev.key==='Enter')&&kbd.last&&performance.now()-kbd.last<200)ev.preventDefault()},true);

/* ---------- começar ---------- */
window.confStart=async function(src){src=src==='coletor'?'coletor':'';if(!logged())return;try{if(typeof unlockSiteAudio==='function')unlockSiteAudio()}catch(e){}
  if(S&&S.status!=='finalizada'&&S.acct===acct()){openCounting(S);if(S.status==='pausada')resume();return}
  var open=await interrupted();if(open.length){var o=open[0],tot=(o.reads||[]).filter(function(r){return Array.isArray(r)?r[5]==='v':r.st==='v'}).length||o.total||0;
    if(confirm('Existe a conferência '+o.n+' interrompida. Continuar essa?\n\nOK = continuar · Cancelar = começar uma nova')){return window.confResume(o.id)}}
  var id='cf-'+devBase()+'-'+Date.now().toString(36);
  try{await ckey()}catch(e){say(e.message||'Não foi possível preparar a conferência.');return}
  if(!(await lock(id))){say('Esta conferência está aberta em outra aba.');return}
  var s={id:id,acct:acct(),n:nextNumber(),by:myName(),login:myLogin(),role:['auxiliar','estoque','gestor'].indexOf(role())>=0?role():'estoque',dev:meDev(),start:nowIso(),end:'',status:'ativa',mode:'toque',rule:{codes:{}},fixes:[],reads:[],nf:'',assocBy:'',assocAt:'',note:''};if(src)s.src=src;
  S=s;cp={n:0,t:Date.now(),seq:0,dirty:true};try{await putMeta()}catch(e){saveOk=false;say('Este navegador não deixa salvar a conferência no aparelho (modo privado?). A contagem fica só na memória até o próximo ponto de controle.')}
  await openCounting(s);checkpoint('inicio')};
window.confResume=async function(id){if(!logged())return;if(S&&S.id===id&&S.status!=='finalizada'){openCounting(S).then(function(){if(S&&S.status==='pausada')resume()});return}
  if(!(await lock(id))){say('Esta conferência está aberta em outra aba.');return}var s=await loadSession(id);if(!s){release();say('Conferência não encontrada neste aparelho.');return}
  if(s.status==='ativa')s.status='pausada';await openCounting(s);await resume()};
window.confReport=function(id){showReport(id)};

/* ---------- relatório ---------- */
function confById(id){if(S&&S.id===id)return compact(S);return (state.confs||[]).find(function(c){return c.id===id})||null}
function data(c){var st=Date.parse(c.start)||0,rs=c.reads||[],v=rs.filter(function(r){return r[5]==='v'}),codes={};v.forEach(function(r){var k=r[2]||'(sem código)';codes[k]=(codes[k]||0)+1});
  return {c:c,src:c.src==='coletor',total:v.length,camN:v.filter(function(r){return r[4]==='c'}).length,manN:v.filter(function(r){return r[4]==='h'}).length,undone:rs.filter(function(r){return r[5]==='x'}).length,
    codes:Object.keys(codes).map(function(k){return [k,codes[k]]}).sort(function(a,b){return b[1]-a[1]||(a[0]<b[0]?-1:1)}),reads:rs.map(function(r){return {seq:r[0],at:st+r[1]*1000,code:r[2],fmt:r[3],m:r[4],st:r[5]}}),fixes:c.fixes||[],start:st,end:Date.parse(c.end)||0}}
function nfOf(c){return c&&c.nf?(state.nfs||[]).find(function(n){return n.id===c.nf})||null:null}
function compare(nf){var list=(state.confs||[]).filter(function(c){return c.nf===nf.id&&c.status==='finalizada'}),total=list.reduce(function(s,c){return s+(c.total|0)},0),byCode={};
  list.forEach(function(c){(c.reads||[]).forEach(function(r){if(r[5]==='v'&&r[2])byCode[r[2]]=(byCode[r[2]]||0)+1})});
  var exp=Number.isSafeInteger(nf.volumes)&&nf.volumes>0?nf.volumes:null,dec=Number.isSafeInteger(nf.declaredVolumes)?nf.declaredVolumes:null,items=[];
  var want=exp!=null?exp:dec;return {sessions:list,total:total,volumes:exp,declared:dec,items:items,xml:xmlCheck(nf,byCode),ok:want==null?null:total===want,want:want}}
/* v132: confere a nota pelo XML — cada leitura conta 1 unidade do código; compara por EAN (cEAN; sem cEAN, cEANTrib). Mostra só o que faltou, sobrou ou não está na nota. */
function gtin(v){v=String(v||'').replace(/\s/g,'');return /^\d{8,14}$/.test(v)?v:''}
function xmlCheck(nf,byCode){var its=Array.isArray(nf.items)?nf.items:[];if(!its.length)return null;var want={},name={},alias={},noEan=0;
  its.forEach(function(it){if(!it)return;var e=gtin(it.ean),t=gtin(it.eanTrib),k=e||t,q=Number(k===e?it.quantity:(it.qtyTrib||it.quantity));if(!k){noEan++;return}want[k]=(want[k]||0)+(isFinite(q)?q:0);if(!name[k])name[k]=String(it.description||'').slice(0,80);if(e&&t&&t!==e&&!want[t])alias[t]=e});
  var miss=[],over=[],extra=[],pack=[];Object.keys(want).forEach(function(k){var got=byCode[k]||0,w=Math.round(want[k]*1000)/1000;if(got<w)miss.push([k,name[k],w,got]);else if(got>w)over.push([k,name[k],w,got])});
  Object.keys(byCode).forEach(function(c){if(want[c]!=null)return;if(alias[c])pack.push([c,name[alias[c]]||'',byCode[c]]);else extra.push([c,byCode[c]])});
  return {codes:Object.keys(want).length,noEan:noEan,miss:miss,over:over,extra:extra,pack:pack,ok:!miss.length&&!over.length&&!extra.length&&!pack.length}}
function nb(v){return Number(v).toLocaleString('pt-BR',{maximumFractionDigits:3})}
function xmlHtml(x){if(!x)return '<div class="cf-xml" id="cf-xml"><h3>Itens da nota (XML)</h3><p class="small">Importe o XML da NF-e para conferir item por item.</p></div>';
  var t=function(title,cls,head,rows){return rows.length?'<h4 class="cf-xml-'+cls+'">'+title+' ('+rows.length+')</h4><table class="cf-table"><thead><tr>'+head.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>':''};
  var h='<div class="cf-xml'+(x.ok?' ok':' bad')+'" id="cf-xml"><h3>Itens da nota (XML)</h3>';
  if(!x.codes)h+='<p class="small">Os itens deste XML não trazem EAN: confira à mão.</p>';
  else if(x.ok)h+='<p class="cf-xml-okmsg"><b>Tudo confere:</b> '+(x.codes===1?'o código da nota bate':'os '+x.codes+' códigos da nota batem')+' com o que foi lido.</p>';
  else h+=t('Faltou','miss',['Item','EAN','Na nota','Lidos'],x.miss.map(function(r){return '<tr><td>'+esc(r[1])+'</td><td><code>'+esc(r[0])+'</code></td><td>'+nb(r[2])+'</td><td>'+r[3]+'</td></tr>'}))
    +t('Sobrou','over',['Item','EAN','Na nota','Lidos'],x.over.map(function(r){return '<tr><td>'+esc(r[1])+'</td><td><code>'+esc(r[0])+'</code></td><td>'+nb(r[2])+'</td><td>'+r[3]+'</td></tr>'}))
    +t('Não está na nota','extra',['Código lido','Lidos'],x.extra.map(function(r){return '<tr><td><code>'+esc(r[0])+'</code></td><td>'+r[1]+'</td></tr>'}))
    +t('Lido pelo código da embalagem (confira à mão)','pack',['Código lido','Item','Lidos'],x.pack.map(function(r){return '<tr><td><code>'+esc(r[0])+'</code></td><td>'+esc(r[1])+'</td><td>'+r[2]+'</td></tr>'}));
  if(x.noEan)h+='<p class="small">'+(x.noEan===1?'1 item da nota não tem EAN':x.noEan+' itens da nota não têm EAN')+': confira à mão.</p>';
  return h+'<p class="small">Cada leitura conta 1 unidade do código lido.</p></div>'}
function showReport(id){var c=confById(id);if(!c){say('Conferência não encontrada.');return}stopCam();var d=dlg(),x=data(c),aux=isAuxNow(),nf=aux?null:nfOf(c);
  var h='<div class="cf-wrap cf-rep"><div class="cf-head"><div><h2 id="cf-title">Relatório · '+esc(c.n)+'</h2><p class="small">'+esc(ST[c.status]||c.status)+'</p></div><button type="button" class="cf-x" id="cf-close" aria-label="Fechar">✕</button></div>'
   +'<dl class="cf-kv"><dt>Número</dt><dd>'+esc(c.n)+'</dd><dt>ID</dt><dd>'+esc(c.id)+'</dd><dt>Funcionário</dt><dd>'+esc(c.by)+(c.login?' ('+esc(c.login)+')':'')+'</dd><dt>Início</dt><dd>'+esc(dt(x.start))+'</dd><dt>Término</dt><dd>'+esc(x.end?dt(x.end):'—')+'</dd>'
   +(x.end?'<dt>Duração</dt><dd>'+esc(dur(x.start,x.end))+'</dd>':'')+'<dt>Total de volumes</dt><dd><b>'+x.total+'</b></dd><dt>'+(x.src?'Pelo coletor':'Pela câmera')+'</dt><dd>'+x.camN+'</dd><dt>À mão</dt><dd>'+x.manN+'</dd><dt>Desfeitas</dt><dd>'+x.undone+'</dd>'
   +(nf?'<dt>NF associada</dt><dd>NF '+esc(nf.number)+' · '+esc(nf.supplier)+'</dd>':c.nf&&!aux?'<dt>NF associada</dt><dd>(NF apagada)</dd>':'')+'</dl>'
   +'<h3>Quantidade por código</h3>'+(x.codes.length?'<table class="cf-table"><thead><tr><th>Código</th><th>Volumes</th></tr></thead><tbody>'+x.codes.map(function(r){return '<tr><td><code>'+esc(r[0])+'</code></td><td>'+r[1]+'</td></tr>'}).join('')+'</tbody></table>':'<p class="small">Nenhuma leitura válida.</p>')
   +'<h3>Correções</h3>'+(x.fixes.length?'<ul>'+x.fixes.map(function(f){return '<li class="small">'+esc(dt(Date.parse(f[1])))+' · '+esc(f[2])+' · '+(f[3]==='undo'?'desfez a leitura ':'adicionou à mão a leitura ')+pad(f[4])+'</li>'}).join('')+'</ul>':'<p class="small">Nenhuma correção.</p>');
  if(!aux&&c.status==='finalizada'){h+='<div class="cf-assoc"><h3>Associar a uma NF</h3><p class="small">Depois de associar, o app compara o total contado com a NF.</p><label>Nota fiscal<select id="cf-assoc-sel"><option value="">— escolha a NF —</option>'
     +(state.nfs||[]).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'')}).slice(0,300).map(function(n){return '<option value="'+esc(n.id)+'"'+(n.id===c.nf?' selected':'')+'>NF '+esc(n.number)+' · '+esc(n.supplier)+' · '+esc(date(n.date))+'</option>'}).join('')+'</select></label><button type="button" id="cf-assoc-go" data-id="'+esc(c.id)+'">Associar</button></div>';
    if(nf){var k=compare(nf),bad=k.ok===false;h+='<div class="cf-cmp'+(bad?' bad':'')+'" id="cf-cmp"><h3>Comparação com a NF '+esc(nf.number)+'</h3><dl class="cf-kv"><dt>Contados (todas as conferências desta NF)</dt><dd><b>'+k.total+'</b> em '+k.sessions.length+' conferência(s)</dd><dt>Volumes na NF</dt><dd>'+(k.volumes==null?'não informado':k.volumes)+'</dd><dt>Volumes no XML</dt><dd>'+(k.declared==null?'não informado':k.declared)+'</dd></dl>'
      +xmlHtml(k.xml)
      +(k.ok===null?'<p class="small">A NF não tem volumes informados para comparar.</p>':bad?'<p><b>Divergência:</b> contados '+k.total+' de '+k.want+' volumes.</p><div class="cf-repbtns"><button type="button" id="cf-mark" data-id="'+esc(c.id)+'" data-st="Em divergência">Marcar NF em divergência</button></div>':'<p><b>Confere:</b> '+k.total+' de '+k.want+' volumes.</p><div class="cf-repbtns"><button type="button" id="cf-mark" data-id="'+esc(c.id)+'" data-st="Conferido">Marcar NF como Conferido</button></div>')+'</div>'}}
  h+='<div class="cf-repbtns"><button type="button" class="primary" id="cf-csv" data-id="'+esc(c.id)+'">Baixar CSV</button><button type="button" id="cf-xlsx" data-id="'+esc(c.id)+'">Excel (.xlsx)</button><button type="button" id="cf-pdf" data-id="'+esc(c.id)+'">PDF / Imprimir</button></div>'
   +'<details class="cf-histbox"><summary>Todas as leituras ('+x.reads.length+')</summary><ol class="cf-hist">'+x.reads.slice().reverse().map(function(r){return '<li class="'+(r.st==='x'?'x':'')+'"><b>'+pad(r.seq)+'</b><span>'+esc(tm(r.at))+'</span><code>'+esc(r.code||'(sem código)')+'</code><span class="small">'+mName(c,r).toLowerCase()+(r.st==='x'?' · desfeita':'')+'</span></li>'}).join('')+'</ol></details></div>';
  d.innerHTML=h;openDlg()}
async function assocSave(id){if(isAuxNow()){say('Só gestor ou estoque associa a NF.');return}var sel=$i('cf-assoc-sel'),nfId=sel?sel.value:'';if(!nfId){say('Escolha a NF.');return}
  var list=(state.confs||[]).slice(),i=list.findIndex(function(c){return c.id===id});if(i<0)return;if(list[i].status!=='finalizada'){say('Finalize a conferência antes de associar.');return}
  list[i]=Object.assign({},list[i],{nf:nfId,assocBy:myName(),assocAt:nowIso()});state.confs=validateConfs(list);if(S&&S.id===id){S.nf=nfId;S.assocBy=list[i].assocBy;S.assocAt=list[i].assocAt}await save();say('Conferência associada à NF.');showReport(id)}
async function markNF(id,st){if(isAuxNow())return;var c=confById(id),nf=nfOf(c);if(!nf)return;var k=compare(nf);if(st!=='Em divergência'&&st!=='Conferido')return;
  if(!confirm(st==='Conferido'?'Marcar a NF '+nf.number+' como Conferido?':'Marcar a NF '+nf.number+' em divergência?'))return;
  if(st==='Em divergência'){var note=prompt('Nota da divergência:',('Contados '+k.total+' de '+k.want+' volumes ('+k.sessions.map(function(s){return s.n}).join(', ')+'). '+(nf.notes||'')).trim().slice(0,10000));if(note===null)return;if(!note.trim()){say('Descreva a divergência.');return}nf.notes=note.trim().slice(0,10000)}
  nf.status=st;await save();try{checkAlerts()}catch(e){}say('NF '+nf.number+': '+st+'.');showReport(id)}
function csvText(c){return '\ufeff'+csvRows(c).map(function(r){return r.map(csvCell).join(';')}).join('\r\n')}
function csvRows(c){var x=data(c),nf=isAuxNow()?null:nfOf(c),rows=[['Conferência',c.n],['ID',c.id],['Funcionário',c.by],['Login',c.login],['Início',dt(x.start)],['Término',x.end?dt(x.end):''],['Status',ST[c.status]||c.status],['Total de volumes',x.total],[x.src?'Leituras pelo coletor':'Leituras pela câmera',x.camN],['Adicionados à mão',x.manN],['Leituras desfeitas',x.undone],['NF associada',nf?nf.number+' · '+nf.supplier:''],[],['Código','Quantidade']];
  x.codes.forEach(function(r){rows.push([r[0],r[1]])});rows.push([],['Seq','Data/hora','Código','Formato','Método','Status']);x.reads.forEach(function(r){rows.push([r.seq,dt(r.at)+':'+pad(new Date(r.at).getSeconds()),r.code,FMT_NAME[r.fmt]||r.fmt,mName(c,r),r.st==='v'?'Válida':'Desfeita'])});
  rows.push([],['Correção','Data/hora','Quem','Tipo','Leitura']);x.fixes.forEach(function(f){rows.push([f[0],dt(Date.parse(f[1])),f[2],f[3]==='undo'?'Desfez':'Adicionou à mão',f[4]])});
  return rows}
function xlsx(id){var c=confById(id);if(!c)return;try{planDownload(window.e99Xlsx(csvRows(c),'Conferência'),'conferencia-'+c.n+'-'+String(c.start).slice(0,10)+'.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');say('Excel baixado. Confira os downloads.')}catch(e){say('Não foi possível gerar o Excel.')}}
function csv(id){var c=confById(id);if(!c)return;planDownload(csvText(c),'conferencia-'+c.n+'-'+String(c.start).slice(0,10)+'.csv','text/csv;charset=utf-8');say('Planilha baixada (abre no Excel). Confira os downloads.')}
function printHtml(c){var x=data(c),nf=isAuxNow()?null:nfOf(c);return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Conferência '+esc(c.n)+'</title><style>body{font:13px -apple-system,Segoe UI,system-ui,sans-serif;color:#111;background:#fff;margin:28px}h1{font-size:18px;margin:0 0 6px}h2{font-size:14px;margin:18px 0 6px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left}th{font-size:11px;text-transform:uppercase;color:#555}.x{color:#888;text-decoration:line-through}</style></head><body>'
  +'<h1>Conferência de volumes '+esc(c.n)+'</h1><table><tbody>'+[['Funcionário',c.by+(c.login?' ('+c.login+')':'')],['ID',c.id],['Início',dt(x.start)],['Término',x.end?dt(x.end):'—'],['Total de volumes',x.total],[x.src?'Pelo coletor':'Pela câmera',x.camN],['À mão',x.manN],['Desfeitas',x.undone],['NF associada',nf?'NF '+nf.number+' · '+nf.supplier:'—']].map(function(r){return '<tr><th>'+esc(r[0])+'</th><td>'+esc(r[1])+'</td></tr>'}).join('')+'</tbody></table>'
  +'<h2>Quantidade por código</h2><table><thead><tr><th>Código</th><th>Volumes</th></tr></thead><tbody>'+x.codes.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td>'+r[1]+'</td></tr>'}).join('')+'</tbody></table>'
  +'<h2>Correções</h2>'+(x.fixes.length?'<table><tbody>'+x.fixes.map(function(f){return '<tr><td>'+esc(dt(Date.parse(f[1])))+'</td><td>'+esc(f[2])+'</td><td>'+(f[3]==='undo'?'Desfez':'Adicionou à mão')+' a leitura '+pad(f[4])+'</td></tr>'}).join('')+'</tbody></table>':'<p>Nenhuma.</p>')
  +'<h2>Leituras</h2><table><thead><tr><th>Seq</th><th>Hora</th><th>Código</th><th>Método</th></tr></thead><tbody>'+x.reads.map(function(r){return '<tr class="'+(r.st==='x'?'x':'')+'"><td>'+pad(r.seq)+'</td><td>'+esc(tm(r.at))+'</td><td>'+esc(r.code||'(sem código)')+'</td><td>'+mName(c,r)+(r.st==='x'?' (desfeita)':'')+'</td></tr>'}).join('')+'</tbody></table></body></html>'}
function pdf(id){var c=confById(id);if(!c)return;var html=printHtml(c),w=null;try{w=window.open('','_blank')}catch(e){}
  if(w){w.document.open();w.document.write(html);w.document.close();setTimeout(function(){try{w.focus();w.print()}catch(e){}},300);say('Na janela de impressão, escolha "Salvar como PDF".');return}
  var f=D.createElement('iframe');f.setAttribute('aria-hidden','true');f.style.cssText='position:fixed;width:0;height:0;border:0;right:0;bottom:0';D.body.appendChild(f);var fd=f.contentDocument;fd.open();fd.write(html);fd.close();
  setTimeout(function(){try{f.contentWindow.focus();f.contentWindow.print()}catch(e){say('Não deu para imprimir aqui. Use "Baixar planilha".')}setTimeout(function(){f.remove()},60000)},300);say('Na janela de impressão, escolha "Salvar como PDF".')}

/* ---------- tela de Notas fiscais: botão principal, sessão interrompida e lista ---------- */
function histHtml(){var me=meDev(),aux=isAuxNow(),list=(state.confs||[]).filter(function(c){return c.status!=='cancelada'&&(!aux||c.dev===me)}).slice(0,10);if(!list.length)return '';
  return '<details class="conf-hist"><summary>Conferências por câmera ('+list.length+')</summary><ul class="conf-hist-list">'+list.map(function(c){var nf=aux?null:nfOf(c);
    return '<li><span><b>'+esc(c.n)+'</b>'+(c.src==='coletor'?' (coletor)':'')+' · '+esc(c.by)+' · '+esc(dt(Date.parse(c.start)))+' · '+(c.total|0)+' volume(s) · '+esc(ST[c.status]||c.status)+(nf?' · NF '+esc(nf.number):'')+'</span><button type="button" data-conf-rep="'+esc(c.id)+'">Relatório</button>'+(c.dev===me?'<button type="button" class="danger" data-conf-del="'+esc(c.id)+'">Excluir</button>':'')+'</li>'}).join('')+'</ul></details>'}
function ctaHtml(){return '<section class="panel conf-cta" id="conf-cta" aria-label="Conferência por câmera"><button type="button" class="primary conf-go" id="conf-go" onclick="confStart()"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 8v8M11 8v8M13.5 8v8M16 8v8"/></svg>Iniciar conferência por câmera</button>'
  +'<button type="button" class="conf-go conf-go-kbd" id="conf-go-kbd" onclick="confStart(\'coletor\')"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+KBD_SVG+'</svg>Conferir com coletor</button>'
  +'<p class="small">Conte os volumes lendo o código de barras de cada caixa com a câmera ou com o coletor de dados (leitor no modo teclado). A contagem é às cegas: a quantidade da nota não aparece. Funciona sem internet.</p><div class="conf-resume" id="conf-resume"></div>'+histHtml()+'</section>'}
async function banner(){var box=$i('conf-resume');if(!box||!logged())return;var open=await interrupted();box=$i('conf-resume');if(!box)return;
  box.innerHTML=open.map(function(o){var tot=Array.isArray(o.reads)?o.reads.filter(function(r){return Array.isArray(r)?r[5]==='v':r.st==='v'}).length:(o.total|0);
    return '<div class="conf-banner" role="status"><b>Conferência '+esc(o.n)+(o.src==='coletor'?' (coletor)':'')+' interrompida · '+tot+' volume(s) salvos</b><button type="button" class="primary" data-conf-res="'+esc(o.id)+'">Continuar</button><button type="button" data-conf-rep="'+esc(o.id)+'">Ver</button><button type="button" class="danger" data-conf-del="'+esc(o.id)+'">Excluir</button></div>'}).join('')}
/* v103: excluir uma conferência (finalizada ou interrompida). Só o aparelho/conta que fez; fica só o marcador 'cancelada' (como no Descartar). */
async function delConf(id){if(S&&S.id===id&&S.status!=='finalizada')return discard();var c=(state.confs||[]).find(function(x){return x&&x.id===id})||null,rec=null;if(!c){try{rec=(await idbAll('sessions')).find(function(x){return x&&x.id===id})}catch(e){}}
  var dev=c?c.dev:(rec&&rec.dev),n=c?c.n:(rec&&rec.n)||'';if(dev&&dev!==meDev()){say('Só quem fez a conferência, neste aparelho, pode excluir.');return}
  if(!confirm('Excluir a conferência '+n+'? As leituras e o relatório serão apagados. Não dá para desfazer.'))return;
  if(S&&S.id===id){S=null;M.st='off'}try{await idbDropConf(id)}catch(e){}
  if(c){var list=(state.confs||[]).filter(function(x){return x&&x.id!==id});list.unshift(Object.assign({},c,{status:'cancelada',end:c.end||nowIso(),reads:[],fixes:[],rule:{codes:{}},total:0,nf:'',assocBy:'',assocAt:'',note:''}));state.confs=validateConfs(list);try{await save()}catch(e){}}
  try{if(typeof page!=='undefined'&&page==='nfs')render()}catch(e){}say('Conferência '+n+' excluída.')}
window.e99ConfDelete=delConf;
D.addEventListener('click',function(ev){var x=ev.target&&ev.target.closest&&ev.target.closest('[data-conf-del]');if(!x||!logged())return;ev.stopPropagation();delConf(x.getAttribute('data-conf-del'))},true);
D.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-conf-res],[data-conf-rep]');if(!b||!logged())return;
  if(b.hasAttribute('data-conf-res'))window.confResume(b.getAttribute('data-conf-res'));else{var id=b.getAttribute('data-conf-rep');if(confById(id))showReport(id);else say('Toque em "Continuar" para abrir essa conferência.')}});
if(typeof upgradedNFs==='function'){var baseNFs=upgradedNFs;upgradedNFs=function(){var h=baseNFs.apply(this,arguments);try{if(logged()&&typeof h==='string'&&h.indexOf('conf-cta')<0){var at=h.indexOf('<div class="panel"><div class="panelhead"><h2>Notas fiscais');h=at>=0?h.slice(0,at)+ctaHtml()+h.slice(at):h+ctaHtml()}setTimeout(banner,0)}catch(e){}return h}}

/* segundo plano / sair / voltar a rede */
D.addEventListener('visibilitychange',function(){if(D.hidden&&S&&S.status==='ativa')pause('Pausada porque o app saiu da tela. Toque em "Continuar".')});
window.addEventListener('pagehide',function(){if(S&&S.status==='ativa'){stopCam();S.status='pausada';putMeta().catch(function(){})}});
window.addEventListener('online',function(){if(S&&(cp.dirty||pendingMine(S.id)))checkpoint('online')});
window.e99ConfPurge=function(storeKey){var a=h32(storeKey);['sessions','reads'].forEach(function(st){try{run(st,'readwrite',function(o){var c=o.openCursor();c.onsuccess=function(){var cur=c.result;if(!cur)return;if(cur.value&&cur.value.acct===a)cur.delete();cur.continue()}}).catch(function(){})}catch(e){}})};
/* para os testes (leitor falso): alimentar a máquina de estados quadro a quadro */
window.e99Conf={check:check,kbdCheck:kbdCheck,compare:function(nf){return nf?compare(nf):null},feed:function(r,t){feed(r,t)},arm:function(){if(S&&S.status==='ativa'){M.fake=true;M.st='armado';M.cand=null}},state:function(){return S?{id:S.id,n:S.n,status:S.status,machine:M.st,total:valid().length,seq:S.reads.length?S.reads[S.reads.length-1].seq:0,cpSeq:cp.seq,dirty:cp.dirty,mode:S.mode,src:S.src||'',synced:S.reads.filter(function(r){return r.synced}).length}:null},
  checkpoint:function(){return checkpoint('teste')},idbReads:readsOf,
  rawRows:function(){return idbAll('reads')},csv:function(id){var c=confById(id);return c?csvText(c):''},decodeCanvas:async function(c){await prepDecoder();return cam.wasm||cam.bd?tryDecode(c):cam.reader?decodeCanvas(c):null},engine:function(){return cam.engine||''},quality:quality,scan:async function(c){await prepDecoder();c.__k=0;var r=await scanFrame(c,function(k){return k===0?c:null});return r&&r.text?{text:r.text,format:r.format}:{blur:!!(r&&r.blur),sharp:r&&r.q?r.q.sharp:0}},cam:function(){return {zoom:cam.zoom,zooms:cam.zooms.slice(),focus:cam.focus.slice(),torch:cam.torch,adv:Object.assign({},cam.adv),devs:cam.devs.length,cur:cam.cur,tick:period(),cost:Math.round(cam.cost),pair:pairWin()}},feedScan:function(c,t){return this.scan(c).then(function(r){feed(r&&r.text?r:null,t);return r})},answer:answer,current:function(){return S}};
})();
