
(function(){
'use strict';
/* Corredores dos cartazes impressos (PDF "Cartazes_Corredores_Estoque99_LojasG"): um toque cadastra os 15. */
var MAPA=[
 ['01','Escolar','Cadernos, Lápis, Mochilas, Materiais',''],
 ['02','Decoração e Vidros','Vasos, Porta-retratos, Objetos de vidro, Castiçais',''],
 ['03','Vidros #02','Taças, Copos, Potes, Vasos de vidro',''],
 ['04','Vidros em Geral','Copos, Jarras, Recipientes, Canecas','Leonardo'],
 ['05','Plásticos em Geral','Potes, Organizadores, Utensílios, Garrafas','Leonardo'],
 ['06','Jardinagem e Vidros','Vasos de plantas, Regadores, Garrafas de vidro, Ferramentas','Leonardo'],
 ['07','Cutelaria, Térmicos e Panelas em Geral','Cutelaria, Térmicos, Panelas, Frigideiras','Thomaz DSL'],
 ['08','Aramados e Aramados de Pia','Escorredores, Cestos, Porta-talheres, Organizadores','Thomaz DSL'],
 ['09','Aramados de Banheiro','Prateleiras, Suportes, Porta-papel, Ganchos','Thomaz DSL'],
 ['10','Banheiro','Dispensers, Porta-escovas, Espelhos, Organizadores','Augusto'],
 ['11','Elétrica e Ferramentas em Geral','Martelos, Chaves, Tomadas, Lâmpadas','Augusto'],
 ['12','Cabides, Pet e Baby','Cabides, Pet, Mamadeiras, Baby','Augusto'],
 ['13','Alimentício','Embalados, Bebidas, Enlatados, Grãos','todos'],
 ['14','Cama, Mesa e Banho','Toalhas, Lençóis, Travesseiros, Roupas de cama',''],
 ['Novo','Baldes, Lixeiras e Bacias','Baldes, Lixeiras, Bacias, Basculantes','']];
function k(n){n=String(n||'').trim();return /^\d+$/.test(n)?String(+n):normalText(n)}
function can(){return !!(authSession&&authSession.payload.role!=='auxiliar')}
function plan(){var people=[],ops=[],byName={};(state.team||[]).forEach(function(p){byName[normalText(p.name)]=p.id});
  MAPA.forEach(function(m){var who=m[3];if(who&&who!=='todos'&&!byName[normalText(who)]&&people.indexOf(who)<0)people.push(who)});
  MAPA.forEach(function(m){var cur=(state.corridors||[]).find(function(c){return k(c.number)===k(m[0])});var owner=m[3]==='todos'?'todos':m[3]?(byName[normalText(m[3])]||'@'+m[3]):'';
    if(!cur)ops.push({t:'new',m:m,owner:owner});else{var keepOwner=cur.owner&&!m[3]?cur.owner:owner;if(cur.sector!==m[1]||(cur.products||'')!==m[2]||(owner&&cur.owner!==owner))ops.push({t:'upd',m:m,c:cur,owner:keepOwner})}});
  return {people:people,ops:ops}}
window.cartazesOpen=function(){if(!can())return;var p=plan();var d=document.getElementById('cartazes-dlg');if(!d){d=document.createElement('dialog');d.id='cartazes-dlg';d.style.cssText='border:0;border-radius:20px;padding:0;max-width:min(560px,94vw);background:var(--ds-surface);color:var(--ds-ink)';document.body.appendChild(d)}
  var news=p.ops.filter(function(o){return o.t==='new'}).length,ups=p.ops.length-news;
  d.innerHTML=!p.ops.length&&!p.people.length?'<div style="padding:18px;display:grid;gap:12px"><h2 style="margin:0">Tudo certo</h2><p>Os corredores dos cartazes já estão cadastrados.</p><button class="primary" type="button" onclick="this.closest(\'dialog\').close()">Ok</button></div>'
   :'<div style="padding:18px;display:grid;gap:12px"><h2 style="margin:0">Corredores dos cartazes</h2><p class="small" style="margin:0">'+news+' novos · '+ups+' atualizados'+(p.people.length?' · pessoas criadas na Equipe: '+p.people.map(esc).join(', '):'')+'.</p>'
   +'<div style="max-height:46vh;overflow:auto;display:grid;gap:6px">'+p.ops.map(function(o){return '<div class="small" style="border:1px solid var(--ds-line);border-radius:12px;padding:8px 10px"><b>'+(o.t==='new'?'Novo':'Atualizar')+' · Corredor '+esc(o.m[0])+'</b> — '+esc(o.m[1])+'<br>'+esc(o.m[2])+' · Responsável: '+esc(o.m[3]==='todos'?'TODOS':o.m[3]||'A definir')+'</div>'}).join('')+'</div>'
   +'<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button type="button" onclick="this.closest(\'dialog\').close()">Cancelar</button><button class="primary" type="button" onclick="cartazesApply()">Cadastrar</button></div></div>';
  d.showModal()};
window.cartazesApply=async function(){if(!can())return;var p=plan(),made={};
  p.people.forEach(function(n){var id=uid();state.team.push({id:id,name:n,role:'Auxiliar de estoque'});made[n]=id});
  p.ops.forEach(function(o){var owner=String(o.owner||'');if(owner.charAt(0)==='@')owner=made[owner.slice(1)]||'';
    if(o.t==='new')state.corridors.push({id:uid(),number:o.m[0],sector:o.m[1],owner:owner,products:o.m[2]});
    else{o.c.sector=o.m[1];o.c.products=o.m[2];o.c.owner=owner}});
  var d=document.getElementById('cartazes-dlg');if(d)d.close();await save();render();notify('Corredores dos cartazes cadastrados: '+p.ops.length+' alterações.')};
var rr=render;render=function(){var r=rr.apply(this,arguments);try{if(page==='corridors'&&can()){var v=document.getElementById('view'),tb=v&&v.querySelector('.hero .toolbar,.hero');if(tb&&!v.querySelector('.cartazes-btn')){var b=document.createElement('button');b.type='button';b.className='cartazes-btn';b.textContent='Cadastrar corredores dos cartazes (15)';b.onclick=window.cartazesOpen;var imp=v.querySelector('[onclick*="openCorridorImport"],[onclick*="corridorImport"]');if(imp&&imp.parentNode)imp.parentNode.insertBefore(b,imp.nextSibling);else tb.appendChild(b)}}}catch(x){}return r};
})();
