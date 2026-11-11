
(function(){
'use strict';
/* Itens repetidos (o mesmo corredor, pessoa, NF ou plano cadastrado em dois aparelhos antes de juntar a equipe):
   mostra o que é repetido e junta num só, mantendo as ligações. */
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function n(v){return String(v||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}
function corKey(c){return n(c.number).replace(/\b0+(\d)/g,'$1').replace(/[\s.\-_/]+/g,'')}
var KEYS={team:function(x){return n(x.name)},corridors:function(x){return corKey(x)},nfs:function(x){return n(x.number)?n(x.number)+'|'+n(x.supplier):''},plans:function(x){return x.date+'|'+n(x.title)}};
var NAMES={team:['pessoa','pessoas'],corridors:['corredor','corredores'],nfs:['NF','NFs'],plans:['plano','planos']};
var RANK={'Conferido':4,'Em divergência':3,'Em conferência':2,'Pendente':1};
function filled(x){return Object.keys(x).filter(function(k){var v=x[k];return v!==''&&v!=null&&!(Array.isArray(v)&&!v.length)}).length}
function score(c,x){if(c==='plans')return (x.activities||[]).length*10+(x.activities||[]).filter(function(a){return a.done}).length;if(c==='nfs')return (RANK[x.status]||0)*100+filled(x);return filled(x)}
function find(){var out={},total=0;Object.keys(KEYS).forEach(function(c){var g={};(state[c]||[]).forEach(function(x){if(!x)return;var k=KEYS[c](x);if(!k)return;(g[k]=g[k]||[]).push(x)});
  out[c]=Object.keys(g).filter(function(k){return g[k].length>1}).map(function(k){var l=g[k].slice().sort(function(a,b){return score(c,b)-score(c,a)});return {keep:l[0],drop:l.slice(1)}});total+=out[c].reduce(function(s,x){return s+x.drop.length},0)});out.total=total;return out}
window.findDuplicates=find;
function label(c,x){return c==='team'?x.name:c==='corridors'?'Corredor '+x.number+(x.sector?' · '+x.sector:''):c==='nfs'?'NF '+x.number+(x.supplier?' · '+x.supplier:''):x.title+' ('+String(x.date).split('-').reverse().join('/')+')'}
function merge(){var d=find();if(!d.total)return 0;var map={team:{},corridors:{}};
  d.team.forEach(function(g){g.drop.forEach(function(x){map.team[x.id]=g.keep.id});['role'].forEach(function(f){if(!g.keep[f])g.drop.some(function(x){if(x[f]){g.keep[f]=x[f];return true}})})});
  d.corridors.forEach(function(g){g.drop.forEach(function(x){map.corridors[x.id]=g.keep.id});['sector','owner'].forEach(function(f){if(!g.keep[f])g.drop.some(function(x){if(x[f]){g.keep[f]=x[f];return true}})})});
  d.nfs.forEach(function(g){['owner','notes','supplier'].forEach(function(f){if(!g.keep[f])g.drop.some(function(x){if(x[f]){g.keep[f]=x[f];return true}})});if(!(g.keep.items||[]).length)g.drop.some(function(x){if((x.items||[]).length){g.keep.items=x.items;return true}})});
  d.plans.forEach(function(g){var acts=(g.keep.activities||[]).slice(),by={};acts.forEach(function(a){by[n(a.title)]=a});
    g.drop.forEach(function(p){(p.activities||[]).forEach(function(a){var k=n(a.title),cur=by[k];if(!cur){if(acts.length<100){var c=JSON.parse(JSON.stringify(a));if(acts.some(function(y){return y.id===c.id}))c.id='m'+Math.random().toString(36).slice(2,10);acts.push(c);by[k]=c}}else if(a.done&&!cur.done){cur.done=true;cur.doneBy=a.doneBy;cur.doneAt=a.doneAt}})});g.keep.activities=acts});
  var drop={};Object.keys(KEYS).forEach(function(c){drop[c]={};d[c].forEach(function(g){g.drop.forEach(function(x){drop[c][x.id]=1})});state[c]=state[c].filter(function(x){return !drop[c][x.id]})});
  state.corridors.forEach(function(c){if(map.team[c.owner])c.owner=map.team[c.owner]});
  state.nfs.forEach(function(x){if(map.team[x.owner])x.owner=map.team[x.owner];if(x.corridor&&map.corridors[x.corridor])x.corridor=map.corridors[x.corridor]});
  return d.total}
function dlg(){var x=document.getElementById('dup-dlg');if(!x){x=document.createElement('dialog');x.id='dup-dlg';x.setAttribute('aria-label','Itens repetidos');document.body.appendChild(x)}return x}
window.openDupes=function(){var d=find(),x=dlg();
  if(!d.total){x.innerHTML='<div class="dd-body"><h2 style="margin:0">Nada repetido</h2><p>Não encontrei corredores, pessoas, NFs ou planos repetidos.</p><div class="row"><button class="primary" type="button" onclick="document.getElementById(\'dup-dlg\').close()">Ok</button></div></div>';x.showModal();return}
  var h='<div class="dd-body"><h2 style="margin:0">'+d.total+' '+(d.total>1?'itens repetidos':'item repetido')+'</h2><p class="small" style="margin:0">Fica um de cada (o mais completo). As ligações (dono do corredor, responsável da NF) passam para o que fica, e as atividades dos planos se juntam sem perder o que já foi feito.</p>';
  Object.keys(KEYS).forEach(function(c){if(!d[c].length)return;h+='<div><b>'+(NAMES[c][1][0].toUpperCase()+NAMES[c][1].slice(1))+'</b><ul>'+d[c].map(function(g){return '<li>'+e(label(c,g.keep))+' — '+(g.drop.length+1)+' cópias</li>'}).join('')+'</ul></div>'});
  h+='<div class="row"><button type="button" onclick="document.getElementById(\'dup-dlg\').close()">Agora não</button><button class="primary" type="button" onclick="mergeDupes()">Juntar repetidos</button></div></div>';x.innerHTML=h;x.showModal()};
window.mergeDupes=async function(){if(isAuxNow())return;var k=merge();dlg().close();if(!k)return;try{await save()}catch(x){}render();notify(k+(k>1?' itens repetidos juntados.':' item repetido juntado.')+(window.e99SyncInfo&&window.e99SyncInfo()?' A equipe recebe a limpeza em instantes.':''))};
function isAuxNow(){return typeof window.isAux==='function'&&window.isAux()}
var HIDE='lojasg.estoque99.dup-hide';
function sig(d){return Object.keys(KEYS).map(function(c){return d[c].map(function(g){return KEYS[c](g.keep)}).join(',')}).join('|')}
window.hideDupes=function(){try{localStorage.setItem(HIDE,sig(find()))}catch(x){}render()};
var rr=render;render=function(){var r=rr.apply(this,arguments);try{if(!authSession||isAuxNow())return r;var view=document.getElementById('view');if(!view)return r;
  if(page==='home'){var d=find();var hidden='';try{hidden=localStorage.getItem(HIDE)||''}catch(x){}if(d.total&&hidden!==sig(d)&&!view.querySelector('.dup-banner')){var parts=Object.keys(KEYS).filter(function(c){return d[c].length}).map(function(c){var k=d[c].reduce(function(s,g){return s+g.drop.length},0);return k+' '+NAMES[c][k>1?1:0]});
      var b=document.createElement('div');b.className='notice dup-banner';b.innerHTML='<span><b>Encontrei '+d.total+' '+(d.total>1?'itens repetidos':'item repetido')+'</b> ('+e(parts.join(', '))+'), provavelmente de quando dois aparelhos juntaram os dados.</span><span class="row"><button type="button" onclick="hideDupes()">Agora não</button><button class="primary" type="button" onclick="openDupes()">Revisar</button></span>';view.insertBefore(b,view.firstChild)}}
  if(page==='data'&&!view.querySelector('.dup-panel')){var p=document.createElement('div');p.className='panel help dup-panel';p.innerHTML='<h2>Itens repetidos</h2><p>Procura corredores, pessoas, NFs e planos cadastrados duas vezes e junta num só.</p><button type="button" onclick="openDupes()">Procurar repetidos</button>';view.appendChild(p)}}catch(x){}return r};
})();
