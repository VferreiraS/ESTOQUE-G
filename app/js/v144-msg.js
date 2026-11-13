/* v144 · Mensagens mais bonitas para WhatsApp e Outlook.
   window.e99Msg.text(payload)      → texto para o WhatsApp (*negrito*, seções com "•", separador e rodapé)
   window.e99Msg.banner(payload)    → Promise<Blob PNG> 1080×420, cores do tema, logo do app (sem rede)
   window.e99Msg.preview(payload,o) → folha com o banner e o texto: Compartilhar (WhatsApp), Copiar para o Outlook, Abrir no e-mail
   payload = {title, subtitle?, when?, sections:[{title?, lines:[texto | {b, t?, sub:[texto]}]}], note?, subject?, file?}
   Tudo o que vem do usuário passa por clean() (tira * _ ~ ` e quebras de linha) no texto e por esc() no DOM/HTML. */
(function(){'use strict';var D=document,W=window;
var FOOT='Stok · Lojas G · Estoque 99',SEP='──────────',LOGO='icons/icon-512-v123.png';
function E(s){return (typeof esc==='function'?esc:function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})})(s)}
function clean(v){return String(v==null?'':v).replace(/[*_~`]/g,'').replace(/[\r\n\u2028\u2029]+/g,' ').replace(/\s{2,}/g,' ').trim()}
function two(n){return ('0'+n).slice(-2)}
function stamp(d){d=d||new Date();return two(d.getDate())+'/'+two(d.getMonth()+1)+'/'+d.getFullYear()+' às '+two(d.getHours())+':'+two(d.getMinutes())}
function norm(p){p=p&&typeof p==='object'?p:{};var secs=Array.isArray(p.sections)?p.sections:[];
  return {title:clean(p.title)||'Stok',subtitle:clean(p.subtitle),when:clean(p.when)||stamp(),note:clean(p.note),subject:clean(p.subject),file:String(p.file||'').replace(/[^a-z0-9-]/gi,'').slice(0,60),
    sections:secs.map(function(s){s=s||{};return {title:clean(s.title),lines:(Array.isArray(s.lines)?s.lines:[]).map(function(l){
      if(l&&typeof l==='object')return {b:clean(l.b),t:clean(l.t),sub:(Array.isArray(l.sub)?l.sub:[]).map(clean).filter(Boolean)};var t=clean(l);return t?{b:'',t:t,sub:[]}:null}).filter(Boolean)}}).filter(function(s){return s.title||s.lines.length})}}
function subLine(n){return [n.subtitle,n.when].filter(Boolean).join(' · ')}
/* opts.plain = sem marcas de negrito/itálico (corpo de e-mail) */
function text(p,opts){var n=norm(p),pl=!!(opts&&opts.plain),B=function(s){return s?(pl?s:'*'+s+'*'):''},I=function(s){return s?(pl?s:'_'+s+'_'):''};
  var out=[B(n.title),I(subLine(n)),SEP];
  n.sections.forEach(function(s,i){if(i)out.push('');if(s.title)out.push(B(s.title));
    if(!s.lines.length)out.push('• Nada por aqui.');
    s.lines.forEach(function(l){out.push('• '+(l.b?B(l.b)+(l.t?' — '+l.t:''):l.t));l.sub.forEach(function(x){out.push('   '+x)})})});
  if(n.note){out.push('');out.push(I(n.note))}
  out.push(SEP);out.push(FOOT);return out.join('\n')}
/* ---------- cores do tema (tokens do body) ---------- */
function tok(name,def){try{var v=getComputedStyle(D.body||D.documentElement).getPropertyValue(name).trim();return v||def}catch(e){return def}}
function solid(v,def){v=String(v||'').trim();return /^#[0-9a-f]{3,8}$/i.test(v)||/^rgba?\([\d\s.,%]+\)$/i.test(v)?v:def}
function theme(){var rgb=(tok('--neon-rgb','219,35,24').match(/\d+/g)||[219,35,24]).slice(0,3).join(',');
  return {bg:solid(tok('--e99-bg','#0B0B0D'),'#0B0B0D'),neon:solid(tok('--neon','#FF2A1F'),'#FF2A1F'),btn:solid(tok('--neon-btn','#DB2318'),'#DB2318'),hot:solid(tok('--neon-hot','#FF8A7A'),'#FF8A7A'),ink:solid(tok('--neon-ink','#FFFFFF'),'#FFFFFF'),rgb:rgb,
    font:tok('--font-head','')||"system-ui,-apple-system,'Segoe UI',sans-serif",body:tok('--font-text','')||"system-ui,-apple-system,'Segoe UI',sans-serif"}}
/* ---------- banner PNG ---------- */
var logoP=null;
function logo(){if(logoP)return logoP;logoP=new Promise(function(res){var im=new Image(),done=false,t=setTimeout(function(){if(!done){done=true;res(null)}},2500);
  im.onload=function(){if(!done){done=true;clearTimeout(t);res(im)}};im.onerror=function(){if(!done){done=true;clearTimeout(t);logoP=null;res(null)}};im.src=LOGO});return logoP}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function fit(c,s,max,lines){var words=String(s).split(' '),out=[],cur='';words.forEach(function(w){var t=cur?cur+' '+w:w;if(c.measureText(t).width<=max||!cur)cur=t;else{out.push(cur);cur=w}});if(cur)out.push(cur);
  if(out.length>lines){out=out.slice(0,lines);var last=out[lines-1];while(last.length>1&&c.measureText(last+'…').width>max)last=last.slice(0,-1);out[lines-1]=last+'…'}
  return out.map(function(l){while(l.length>1&&c.measureText(l).width>max)l=l.slice(0,-2)+'…';return l})}
function banner(p){var n=norm(p),th=theme(),Wd=1080,H=420;
  return logo().then(function(img){var cv=D.createElement('canvas');cv.width=Wd;cv.height=H;var c=cv.getContext('2d');
    c.fillStyle=th.bg;c.fillRect(0,0,Wd,H);
    var g=c.createRadialGradient(Wd*.88,-40,10,Wd*.88,-40,Wd*.75);g.addColorStop(0,'rgba('+th.rgb+',.42)');g.addColorStop(1,'rgba('+th.rgb+',0)');c.fillStyle=g;c.fillRect(0,0,Wd,H);
    var g2=c.createRadialGradient(-60,H+60,10,-60,H+60,Wd*.55);g2.addColorStop(0,'rgba('+th.rgb+',.18)');g2.addColorStop(1,'rgba('+th.rgb+',0)');c.fillStyle=g2;c.fillRect(0,0,Wd,H);
    c.fillStyle=th.neon;c.fillRect(0,H-10,Wd,10);
    var L=72,S=236,Y=(H-10-S)/2;
    c.save();rr(c,L,Y,S,S,54);c.clip();
    if(img){c.drawImage(img,L,Y,S,S)}else{c.fillStyle='#121216';c.fillRect(L,Y,S,S);c.fillStyle='#FF2A1F';c.font='800 188px '+th.font;c.textAlign='center';c.textBaseline='middle';c.fillText('S',L+S/2,Y+S/2+8)}
    c.restore();c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=2;rr(c,L+1,Y+1,S-2,S-2,53);c.stroke();
    var X=L+S+56,MW=Wd-X-64;c.textAlign='left';c.textBaseline='alphabetic';
    c.fillStyle=th.neon;c.font='700 26px '+th.body;c.fillText('STOK · LOJAS G · ESTOQUE 99',X,118);
    c.fillStyle='#FFFFFF';c.font='700 60px '+th.font;var tl=fit(c,n.title,MW,2),y=192;tl.forEach(function(l){c.fillText(l,X,y);y+=68});
    c.fillStyle='rgba(255,255,255,.74)';c.font='500 30px '+th.body;fit(c,subLine(n),MW,2).forEach(function(l){c.fillText(l,X,y+4);y+=40});
    return new Promise(function(res,rej){try{cv.toBlob(function(b){b?res(b):rej(Error('Não deu para gerar o banner.'))},'image/png')}catch(e){rej(e)}})})}
/* ---------- HTML para o Outlook (estilos inline; sem imagem: o Outlook descarta data: ao colar) ---------- */
function html(p){var n=norm(p),th=theme(),F="font-family:'Segoe UI',Calibri,Arial,sans-serif;";
  var h='<div style="'+F+'color:#1b1b1f;max-width:640px">'
   +'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#141218"><tr><td style="padding:18px 22px;border-left:6px solid '+E(th.neon)+'">'
   +'<div style="'+F+'font-size:11px;letter-spacing:1px;text-transform:uppercase;color:'+E(th.neon)+'">'+E(FOOT)+'</div>'
   +'<div style="'+F+'font-size:22px;font-weight:700;color:#ffffff;margin-top:4px">'+E(n.title)+'</div>'
   +'<div style="'+F+'font-size:13px;color:#c9c9cf;margin-top:2px">'+E(subLine(n))+'</div></td></tr></table>';
  n.sections.forEach(function(s){if(s.title)h+='<h3 style="'+F+'font-size:15px;margin:18px 0 6px;color:#1b1b1f;border-bottom:1px solid #e3e3e8;padding-bottom:4px">'+E(s.title)+'</h3>';
    h+='<ul style="'+F+'font-size:14px;margin:0 0 6px;padding-left:20px;color:#2a2a30">'+(s.lines.length?s.lines.map(function(l){return '<li style="margin:3px 0">'+(l.b?'<b>'+E(l.b)+'</b>'+(l.t?' — '+E(l.t):''):E(l.t))+(l.sub.length?'<div style="color:#5a5a63;font-size:13px">'+l.sub.map(E).join('<br>')+'</div>':'')+'</li>'}).join(''):'<li>Nada por aqui.</li>')+'</ul>'});
  if(n.note)h+='<p style="'+F+'font-size:13px;color:#5a5a63;font-style:italic;margin:14px 0 0">'+E(n.note)+'</p>';
  h+='<p style="'+F+'font-size:12px;color:#8a8a93;border-top:1px solid #e3e3e8;margin-top:18px;padding-top:8px">'+E(FOOT)+'</p></div>';return h}
/* ---------- folha de prévia ---------- */
var cur=null;
function slug(n){return (n.file||n.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'mensagem')}
function say(m){if(typeof notify==='function')notify(m);var s=D.getElementById('e99m-status');if(s)s.textContent=m}
function sheet(){var d=D.getElementById('e99-msg');if(d)return d;d=D.createElement('dialog');d.id='e99-msg';d.setAttribute('aria-labelledby','e99m-title');
  d.innerHTML='<div class="e99m-wrap"><div class="e99m-head"><h2 id="e99m-title">Enviar mensagem</h2><button type="button" class="e99m-x" aria-label="Fechar" onclick="e99Msg.close()">'+(typeof e99Icon==='function'?e99Icon('close'):'✕')+'</button></div>'
   +'<div class="e99m-banner"><img id="e99m-img" alt="" width="1080" height="420"><span id="e99m-wait">Preparando o banner…</span></div>'
   +'<pre class="e99m-text" id="e99m-text" tabindex="0" aria-label="Prévia do texto"></pre>'
   +'<div class="e99m-manual" id="e99m-manual" hidden><label>Selecione e copie (Ctrl+C) <textarea id="e99m-copy" readonly rows="6"></textarea></label></div>'
   +'<p class="small" id="e99m-status" role="status" aria-live="polite"></p>'
   +'<div class="e99m-actions"><button type="button" class="primary" id="e99m-share" onclick="e99Msg.share()" disabled>Compartilhar (WhatsApp)</button>'
   +'<button type="button" id="e99m-outlook" onclick="e99Msg.outlook()">Copiar para o Outlook</button>'
   +'<button type="button" id="e99m-dl" onclick="e99Msg.download()" hidden>Baixar banner (PNG)</button>'
   +'<a id="e99m-mail" class="e99m-mail" href="#">Abrir no e-mail</a></div></div>';
  d.addEventListener('close',function(){var c=cur;cur=null;if(c){if(c.url)try{URL.revokeObjectURL(c.url)}catch(e){}if(c.from&&c.from.isConnected&&c.from.focus)try{c.from.focus()}catch(e){}}});
  d.addEventListener('click',function(e){if(e.target===d)d.close()});
  D.body.appendChild(d);return d}
function preview(p,o){o=o||{};var n=norm(p),d=sheet(),t=text(p),from=o.from||D.activeElement;
  if(cur&&cur.url)try{URL.revokeObjectURL(cur.url)}catch(e){}
  var c=cur={n:n,payload:p,text:t,html:html(p),blob:null,file:null,url:'',from:from,files:(Array.isArray(o.files)?o.files:[]).filter(function(f){return f instanceof Blob}),name:'stok-'+slug(n)+'.png'};
  D.getElementById('e99m-title').textContent=o.heading||'Enviar mensagem';
  D.getElementById('e99m-text').textContent=t;D.getElementById('e99m-manual').hidden=true;D.getElementById('e99m-status').textContent='';
  var img=D.getElementById('e99m-img'),wait=D.getElementById('e99m-wait'),sh=D.getElementById('e99m-share'),dl=D.getElementById('e99m-dl');
  img.removeAttribute('src');img.alt='';wait.hidden=false;wait.textContent='Preparando o banner…';sh.disabled=true;dl.hidden=!!navigator.share;
  var body=t.replace(/[*_]/g,'');if(body.length>1800)body=body.slice(0,1800)+'\n… (continua no Stok)';
  D.getElementById('e99m-mail').href='mailto:?subject='+encodeURIComponent((n.subject||n.title+' · '+FOOT).slice(0,180))+'&body='+encodeURIComponent(body);
  if(!d.open){try{d.showModal()}catch(e){d.setAttribute('open','')}}
  try{sh.focus()}catch(e){}
  return banner(p).then(function(b){if(cur!==c)return;c.blob=b;try{c.file=new File([b],c.name,{type:'image/png'})}catch(e){c.file=b}c.url=URL.createObjectURL(b);img.src=c.url;img.alt='Banner: '+n.title;wait.hidden=true;sh.disabled=false;return b},
    function(){if(cur!==c)return;wait.textContent='Banner indisponível; o texto vai sozinho.';sh.disabled=false;return null})}
function canFiles(f){try{return !!(navigator.canShare&&navigator.canShare({files:f}))}catch(e){return false}}
function share(){var c=cur;if(!c)return Promise.resolve(false);
  if(navigator.share){var files=null;if(c.file){var all=[c.file].concat(c.files);if(canFiles(all))files=all;else if(canFiles([c.file]))files=[c.file]}
    var data=files?{files:files,text:c.text}:{title:c.n.title,text:c.text};
    return navigator.share(data).then(function(){say('Pronto.');return true},function(e){if(e&&e.name==='AbortError')return false;say('Não deu para compartilhar daqui. Use Copiar para o Outlook ou Abrir no e-mail.');return false})}
  try{W.open('https://wa.me/?text='+encodeURIComponent(c.text),'_blank','noopener')}catch(e){}
  D.getElementById('e99m-dl').hidden=false;say('Abrindo o WhatsApp. Para mandar o banner, baixe a imagem e anexe na conversa.');return Promise.resolve(true)}
function download(){var c=cur;if(!c||!c.blob)return;var a=D.createElement('a'),u=URL.createObjectURL(c.blob);a.href=u;a.download=c.name;D.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},15000);say('Banner baixado.')}
function manual(c){var box=D.getElementById('e99m-manual'),ta=D.getElementById('e99m-copy');ta.value=c.text.replace(/[*_]/g,'');box.hidden=false;try{ta.focus();ta.select()}catch(e){}say('Não deu para copiar sozinho. O texto está selecionado: copie e cole no Outlook.')}
function outlook(){var c=cur;if(!c)return Promise.resolve(false);var plain=c.text.replace(/[*_]/g,'');
  try{if(navigator.clipboard&&navigator.clipboard.write&&W.ClipboardItem){return navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([c.html],{type:'text/html'}),'text/plain':new Blob([plain],{type:'text/plain'})})]).then(function(){say('Copiado. Cole no corpo do e-mail no Outlook.');return true},function(){manual(c);return false})}}catch(e){}
  manual(c);return Promise.resolve(false)}
function close(){var d=D.getElementById('e99-msg');if(d&&d.open)d.close()}
W.e99Msg={text:text,banner:banner,preview:preview,html:html,share:share,outlook:outlook,download:download,close:close,clean:clean,current:function(){return cur?{text:cur.text,html:cur.html,ready:!!cur.blob,name:cur.name}:null}};

/* ===================== pontos de envio ===================== */
/* Plano de ação: "Copiar para WhatsApp / Outlook" e "Compartilhar com fotos" abrem a folha (com as fotos junto no compartilhar) */
function planPayload(p){var st=authSession&&authSession.payload?authSession.payload.store:'';var acts=p.activities||[];
  return {title:'Plano de ação · '+(typeof date==='function'?date(p.date):p.date),subtitle:[p.title,st].filter(Boolean).join(' · '),file:'plano-'+p.date,subject:'Plano de ação · '+p.title,
    sections:[{title:'Atividades ('+acts.filter(function(a){return a.done}).length+' de '+acts.length+' feitas)',lines:acts.map(function(a,i){var sub=['Responsável: '+(a.owner||'A definir')];
      if(a.demanda){var dr='';try{dr=typeof demResp==='function'?demResp(a.demanda):''}catch(e){}sub.push('Demanda: '+a.demanda+(dr?' (responsável da demanda: '+dr+')':''))}
      if(a.notes)sub.push('Orientações: '+a.notes);if(a.photos&&a.photos.length)sub.push('Fotos: '+a.photos.length+' (enviadas junto)');
      return {b:(i+1)+'. '+a.title,t:[a.time?'até '+a.time:'',a.done?'✓ feita':''].filter(Boolean).join(' · '),sub:sub}})}],
    note:'Se alguma atividade não for concluída, informe o motivo da pendência.'}}
W.e99Msg.planPayload=planPayload;
function hook(){if(typeof planById!=='function')return;
  W.copyPlan=function(id){var p=planById(id);if(!p)return;preview(planPayload(p),{heading:'Enviar plano'})};
  W.sharePlan=function(id){var p=planById(id);if(!p)return;var files=[];try{(p.activities||[]).forEach(function(a,i){(a.photos||[]).forEach(function(ph,j){files.push(photoFile(ph,'atividade-'+(i+1)+'-foto-'+(j+1)+'.jpg'))})})}catch(e){}
    preview(planPayload(p),{heading:'Enviar plano com fotos',files:files})}}
hook();
})();
