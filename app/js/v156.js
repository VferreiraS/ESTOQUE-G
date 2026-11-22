/* v156 · Avisos de todas as alterações da equipe + imprimir o plano.
   (A) Imprimir: e99PrintPlan(id) e e99PrintPlanDay(data) usam o gerador de folha branca do v144-msg.js (e99Msg.print).
   (B) Alterações de OUTRA pessoa que chegam pela nuvem da loja (NF, plano/atividade, corredor, equipe, conferência finalizada,
       responsável de demanda): o sync.js chama window.e99OnTeamChange(aplicadas) depois de aplicar e o v136.js marca cada op com
       u = uid de quem gravou e q = carga inicial (seed / 1ª resposta do servidor). Não avisa: carga inicial, a própria conta
       (mesmo uid ou mesmo nome na equipe), eco (o aplicador já descarta o que não é mais novo).
       1) cápsula no topo (#e99-alt, role=status), some em ~5 s, toque abre a tela, fila de até 5, mesmo tipo vira "N alterações";
       2) no computador o título/ícone da aba piscam (e99TitleAlert(n,'alt'));
       3) "Alterações recentes" (últimas 30, só na memória) na tela de Alertas (aberta pelo sino).
   Preferência por aparelho: lojasg.estoque99.team-alt = 'off' desliga (1 e 2). Sem notificação do sistema e sem som.
   Tudo que vem de outras pessoas passa por esc() / textContent. */
(function(){'use strict';var D=document,W=window;
var KEY='lojasg.estoque99.team-alt',MAXL=30,MAXQ=5,SHOW=5000;
var list=[],q=[],cur=null,hideT=0;
function E(s){return (typeof esc==='function'?esc:function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})})(s)}
function on(){try{return localStorage.getItem(KEY)!=='off'}catch(e){return true}}
function first(t){return String(t==null?'':t).split('\n')[0].replace(/\s+/g,' ').trim().slice(0,60)}
function myUid(){try{var c=W.e99Loja&&e99Loja.conn&&e99Loja.conn();if(c&&c.uid)return c.uid}catch(e){}try{var u=W.e99Cloud&&e99Cloud.user&&e99Cloud.user();return u&&u.uid||''}catch(e){return ''}}
function myName(){try{var i=W.e99SyncCore&&e99SyncCore.info();return i&&i.name||''}catch(e){return ''}}
var NOUN={nfs:['notas fiscais','nfs'],plans:['planos','plans'],corridors:['corredores','corridors'],team:['equipe','team'],confs:['conferências','nfs'],dresp:['demandas','home']};
function demName(id){var i=Number(String(id||'').replace(/\D/g,''))-1;try{return (typeof E99_DEMANDAS!=='undefined'&&E99_DEMANDAS[i])||'uma demanda'}catch(e){return 'uma demanda'}}
/* texto curto: "<quem> <o quê>"; '' = não avisa */
function describe(op,prev){var x=op.x||{},p=prev||{};
  switch(op.c){
   case 'nfs':{var n=first(op.d?p.number:x.number);return op.d?'excluiu a NF '+n:!prev?'criou a NF '+n:x.status!==p.status?'mudou a NF '+n+' para '+first(x.status):'alterou a NF '+n}
   case 'plans':{var t=first(op.d?p.title:x.title);if(op.d)return 'excluiu o plano “'+t+'”';if(!prev)return 'criou o plano “'+t+'”';
     var pa=p.activities||[],xa=x.activities||[],byId=function(l,id){return l.find(function(b){return b&&b.id===id})||null};
     var done=xa.filter(function(a){return a&&a.done&&!(byId(pa,a.id)||{}).done});if(done.length)return 'marcou como feita “'+first(done[0].title)+'”'+(done.length>1?' e mais '+(done.length-1):'');
     var nw=xa.filter(function(a){return a&&!byId(pa,a.id)});if(nw.length)return 'criou a atividade “'+first(nw[0].title)+'”'+(nw.length>1?' e mais '+(nw.length-1):'')+' no plano “'+t+'”';
     return 'alterou o plano “'+t+'”'}
   case 'corridors':{var c=first(op.d?p.number:x.number);return op.d?'excluiu o corredor '+c:!prev?'criou o corredor '+c:'alterou o corredor '+c}
   case 'team':{var m=first(op.d?p.name:x.name);return op.d?'tirou '+m+' da equipe':!prev?'adicionou '+m+' à equipe':'alterou '+m+' na equipe'}
   case 'confs':return !op.d&&x.status==='finalizada'&&p.status!=='finalizada'?'finalizou a conferência '+first(x.n)+' ('+(x.total|0)+' volumes)':'';
   case 'dresp':{if(op.d)return '';var r=first(x.resp);return r?'definiu '+r+' como responsável por '+demName(x.id):'tirou o responsável de '+demName(x.id)}}
  return ''}
function fmt(t){var d=new Date(t),z=function(n){return ('0'+n).slice(-2)};return z(d.getDate())+'/'+z(d.getMonth()+1)+'/'+d.getFullYear()+' '+z(d.getHours())+':'+z(d.getMinutes())}
/* ---------- recebe do sync.js ---------- */
W.e99OnTeamChange=function(applied){if(typeof authSession==='undefined'||!authSession||!Array.isArray(applied))return;
  var uid=myUid(),nm=myName(),evs=[];
  applied.forEach(function(ch){var op=ch&&ch.op;if(!op||op.q)return;var who=String(op.b||'').slice(0,40);
    if(op.u?(uid&&op.u===uid):false)return;if(nm&&who&&who===nm)return;if(!op.u&&!who)return;
    var txt=describe(op,ch.prev);if(!txt)return;var k=NOUN[op.c]||['dados','home'];evs.push({at:Date.now(),who:who||'Alguém',text:txt,c:op.c,page:k[1]})});
  if(!evs.length)return;
  evs.forEach(function(e){list.unshift(e)});if(list.length>MAXL)list.length=MAXL;paintList();
  if(!on())return;
  try{if(W.e99TitleAlert)W.e99TitleAlert(evs.length,'alt')}catch(e){}
  /* agrupa por tipo nesta leva e com o que ainda espera na fila */
  var by={};evs.forEach(function(e){(by[e.c]=by[e.c]||[]).push(e)});
  Object.keys(by).forEach(function(c){var g=by[c],w=q.find(function(t){return t.c===c});
    if(w){w.n+=g.length;if(w.who!==g[0].who)w.who='';return}
    if(q.length>=MAXQ){var last=q[q.length-1];last.n+=g.length;last.mixed=true;return}
    q.push({c:c,n:g.length,who:g.every(function(e){return e.who===g[0].who})?g[0].who:'',text:g.length===1?g[0].text:'',page:g[0].page})});
  if(!cur)next()};
function label(t){var k=NOUN[t.c]||['dados'];if(t.mixed)return t.n+' alterações da equipe';if(t.n===1&&t.text)return (t.who||'Alguém')+' '+t.text;
  return (t.who?t.who+': ':'')+t.n+' alterações em '+k[0]}
function host(){var h=D.getElementById('e99-alt');if(h)return h;h=D.createElement('div');h.id='e99-alt';h.setAttribute('role','status');h.setAttribute('aria-live','polite');D.body.appendChild(h);return h}
function next(){clearTimeout(hideT);var h=host();cur=q.shift()||null;if(!cur){h.innerHTML='';return}
  var b=D.createElement('button');b.type='button';b.className='e99-alt-pill';b.setAttribute('data-page',cur.page);
  var dot=D.createElement('span');dot.className='e99-alt-dot';dot.setAttribute('aria-hidden','true');var tx=D.createElement('span');tx.className='e99-alt-txt';tx.textContent=label(cur);
  b.appendChild(dot);b.appendChild(tx);var pg=cur.page;b.onclick=function(){clearTimeout(hideT);cur=null;h.innerHTML='';try{if(typeof go==='function')go(pg)}catch(e){}setTimeout(next,200)};
  h.innerHTML='';h.appendChild(b);hideT=setTimeout(function(){cur=null;h.innerHTML='';setTimeout(next,250)},SHOW)}
/* ---------- "Alterações recentes" na tela de Alertas ---------- */
function listHTML(){return list.length?'<ol class="alt-list">'+list.map(function(e){return '<li><button type="button" class="alt-item" onclick="e99Alt.open(\''+E(e.page)+'\')"><span class="alt-when">'+E(fmt(e.at))+'</span><span><b>'+E(e.who)+'</b> '+E(e.text)+'</span></button></li>'}).join('')+'</ol>'
  :'<p class="small" style="margin:0">Nenhuma alteração da equipe desde que o app abriu neste aparelho.</p>'}
function panelHTML(){return '<div class="panel help" id="alt-recent"><div class="cardtop"><h2>Alterações recentes</h2><span class="small">'+list.length+' de até '+MAXL+'</span></div>'
  +'<p class="small">O que outras pessoas da equipe mudaram (só neste aparelho, some ao fechar o app).'+(on()?'':' Avisos desligados em Preferências.')+'</p><div id="alt-recent-list">'+listHTML()+'</div></div>'}
function paintList(){var el=D.getElementById('alt-recent');if(el)el.outerHTML=panelHTML()}
function mount(){if(typeof page==='undefined'||page!=='alerts'||D.getElementById('alt-recent'))return;var hero=D.querySelector('#view .hero');if(hero)hero.insertAdjacentHTML('afterend',panelHTML())}
/* ---------- preferência ---------- */
function prefRow(){var pp=D.getElementById('prefs-panel');if(!pp)return;var old=D.getElementById('pref-alt-row'),v=on();if(old&&old.getAttribute('data-on')===String(v))return;if(old)old.remove();
  var r=D.createElement('div');r.className='pref-row';r.id='pref-alt-row';r.setAttribute('data-on',String(v));
  r.innerHTML='<span><b>Avisar alterações da equipe</b><span class="small">Aviso no topo quando outra pessoa muda notas, planos, corredores, equipe ou demandas. No computador a aba pisca.</span></span>'
   +'<button type="button" id="pref-alt-btn" class="btn'+(v?' primary':'')+'" aria-pressed="'+v+'" onclick="e99Alt.set('+(!v)+')">'+(v?'Ligado':'Desligado')+'</button>';
  pp.appendChild(r)}
W.e99Alt={set:function(v){try{if(v)localStorage.removeItem(KEY);else localStorage.setItem(KEY,'off')}catch(e){}if(!v){q=[];cur=null;clearTimeout(hideT);var h=D.getElementById('e99-alt');if(h)h.innerHTML=''}prefRow();paintList();if(typeof notify==='function')notify(v?'Avisos de alterações ligados.':'Avisos de alterações desligados.')},
  on:on,list:function(){return list.slice()},queue:function(){return q.slice()},current:function(){return cur?label(cur):''},open:function(p){try{go(p)}catch(e){}},describe:describe};
/* ---------- imprimir plano ---------- */
W.e99PrintPlan=function(id){if(!W.e99Msg||typeof planById!=='function')return false;var p=planById(id);if(!p)return false;return e99Msg.print(e99Msg.planPayload(p))};
W.e99PrintPlanDay=function(day){if(!W.e99Msg||!day)return false;var ps=(state.plans||[]).filter(function(p){return p&&p.date===day});if(!ps.length)return false;
  var base=ps.map(function(p){return e99Msg.planPayload(p)}),dt=typeof date==='function'?date(day):day;
  return e99Msg.print({title:'Plano de ação',subtitle:dt+(ps.length>1?' · '+ps.length+' planos':' · '+ps[0].title),file:'plano-'+day,
    sections:base.map(function(b,i){var s=b.sections[0]||{lines:[]};return {title:ps[i].title+' — '+s.title,lines:s.lines}}),note:base[0].note})};
/* ---------- ganchos ---------- */
var r0=render;render=function(){var r=r0.apply(this,arguments);try{mount();prefRow()}catch(e){}return r};
var lo=typeof authLogout==='function'?authLogout:null;if(lo)authLogout=async function(){var r=await lo.apply(this,arguments);if(typeof authSession==='undefined'||!authSession){list=[];q=[];cur=null;clearTimeout(hideT);var h=D.getElementById('e99-alt');if(h)h.innerHTML=''}return r};
})();
