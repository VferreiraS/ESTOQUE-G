/* v154: no computador, a aba pisca (título alterna) quando chega mensagem nova no chat com o Stok em segundo plano.
   Junto do título o ícone da aba alterna para o mesmo ícone com uma bolinha vermelha (#FF2A1F), desenhada por canvas na hora (sem arquivo, sem rede).
   v156: alterações da equipe (NF, plano, corredor…) usam o mesmo aviso (e99TitleAlert(n,'alt')).
   v163 (não funcionava no PC do dono):
   - trocar título/ícone da aba é aviso, não animação: pisca mesmo com "menos movimento" (Windows com efeitos de animação desligados);
   - "computador" = não é celular/tablet (userAgent móvel, iPad, ou pointer:coarse + hover:none), sem exigir largura: janela estreita e tela touch+mouse piscam;
   - pisca com a aba oculta, a janela minimizada ou a janela visível sem foco; para ao voltar o foco (ou ao clicar/teclar na página);
   - o <link rel="icon"> é removido e recriado a cada troca (o Chrome às vezes ignora só mudar o href);
   - o relógio do piscar vem de um Worker (o Chrome segura timers de aba oculta há > 5 min a 1 por minuto); sem Worker, setInterval de 1 s;
   - Preferências (só no computador): botão "Testar aba piscando" (espera 3 s e dispara o aviso).
   Sem som e sem notificação do sistema; no título só o número. Relógio só enquanto há aviso pendente. */
(function(){
'use strict';
var D=document,W=window;
var base='',lastSet='',n=0,nm=0,na=0,nt=0,timer=0,on=false,flip=false,icoBase=null,icoRed='',wk=null,wkFail=false,testT=0,testState='';
function link(){return D.querySelector('link[rel~="icon"]')}
function mkRed(){if(icoRed)return;var l=link();var href=l?l.href:'';
  function draw(img){try{var c=D.createElement('canvas');c.width=c.height=32;var g=c.getContext('2d');if(img)g.drawImage(img,0,0,32,32);
    g.beginPath();g.arc(23,9,8.5,0,Math.PI*2);g.fillStyle='#FF2A1F';g.fill();g.lineWidth=2;g.strokeStyle='#000';g.stroke();icoRed=c.toDataURL('image/png');if(on&&flip)setIco(true)}catch(e){}}
  if(!href||/^data:/.test(href)&&!/^data:image\/png/.test(href)){draw(null);return}var im=new Image();im.onload=function(){draw(im)};im.onerror=function(){draw(null)};im.src=href}
/* remove todos os ícones da aba e recria um <link rel="icon"> novo */
function putIcon(href,type){try{var h=D.head||D.documentElement;D.querySelectorAll('link[rel~="icon"]').forEach(function(x){x.parentNode&&x.parentNode.removeChild(x)});
  var l=D.createElement('link');l.rel='icon';if(type)l.type=type;l.setAttribute('href',href);h.appendChild(l)}catch(e){}}
function setIco(red){if(red){if(!icoRed)return;if(!icoBase){var l=link();icoBase={href:l?(l.getAttribute('href')||''):'icons/favicon-v159.png',type:l?(l.getAttribute('type')||''):'image/png'}}
    var c=link();if(c&&c.getAttribute('href')===icoRed)return;putIcon(icoRed,'image/png')}
  else if(icoBase){var b=icoBase;var c2=link();if(!c2||c2.getAttribute('href')!==b.href)putIcon(b.href||'icons/favicon-v159.png',b.type||'image/png')}}
function mobile(){try{var ua=navigator.userAgent||'';if(/iPhone|iPad|iPod|Android|Mobile|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(ua))return true;
  if(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)return true;
  return W.matchMedia('(pointer:coarse)').matches&&W.matchMedia('(hover:none)').matches}catch(e){return false}}
function desktop(){return !mobile()}
function calm(){try{return W.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}
function away(){try{return D.hidden||!D.hasFocus()}catch(e){return !!D.hidden}}
function msg(){if(!nm&&!na)return '(1) Teste do aviso · Stok';var k=nm?nm:na,c='('+(k>99?'99+':k)+') ';return c+(nm?(k>1?'Novas mensagens':'Nova mensagem'):(k>1?'Novas alterações':'Nova alteração'))+' · Stok'}
function tick(){if(!on)return;if(D.title!==lastSet&&D.title!==msg())base=D.title;flip=!flip;lastSet=flip?msg():base;D.title=lastSet;setIco(flip)}
function worker(){if(wk||wkFail)return wk;try{if(!W.Worker||!W.Blob||!W.URL||!URL.createObjectURL)throw 0;
  var u=URL.createObjectURL(new Blob(['var t=0;onmessage=function(e){clearInterval(t);t=0;if(e.data)t=setInterval(function(){postMessage(1)},1000)}'],{type:'text/javascript'}));
  wk=new Worker(u);wk.onmessage=function(){tick()};wk.onerror=function(ev){try{ev.preventDefault()}catch(x){}wkFail=true;wk=null;if(on&&timer===-1){timer=setInterval(tick,1000)}}}catch(e){wkFail=true;wk=null}return wk}
function startClock(){if(timer)return;var w=worker();if(w){w.postMessage(1);timer=-1}else timer=setInterval(tick,1000)}
function stopClock(){if(timer===-1){try{wk&&wk.postMessage(0)}catch(e){}}else if(timer)clearInterval(timer);timer=0}
function stop(){if(!on)return;var wasTest=nt>0;stopClock();on=false;flip=false;n=0;nm=0;na=0;nt=0;if(D.title===lastSet||D.title===msg())D.title=base;else if(D.title!==base)base=D.title;setIco(false);icoBase=null;lastSet='';
  if(wasTest){testState='back';prefRow(true)}}
function start(k,kind){if(!on){base=D.title;on=true;n=0;nm=0;na=0;nt=0;flip=false;mkRed()}
  n+=k;if(kind==='alt')na+=k;else if(kind==='test')nt+=k;else nm+=k;
  if(!timer){tick();startClock()}
  return true}
W.e99TitleAlert=function(k,kind){
  k=Math.max(1,Math.floor(Number(k)||1));
  if(!desktop()||!away())return false;
  return start(k,kind)};
W.e99TitleStop=stop;
W.e99TitleState=function(){var l=link();return {on:on,n:n,msgs:nm,alts:na,test:nt,timer:!!timer,worker:timer===-1,base:base,icon:l?l.getAttribute('href'):'',red:!!icoRed&&!!l&&l.getAttribute('href')===icoRed,desktop:desktop(),calm:calm(),away:away()}};
/* teste em Preferências: espera 3 s e dispara o aviso (mesmo se a pessoa não trocou de aba: aí pisca até clicar na página) */
W.e99TitleTest=function(ms){if(!desktop())return false;clearTimeout(testT);testState='wait';prefRow(true);try{if(typeof notify==='function')notify('Troque de aba agora: em 3 segundos a aba do Stok pisca.')}catch(e){}
  testT=setTimeout(function(){testT=0;testState='on';start(1,'test');prefRow(true)},ms==null?3000:ms);return true};
function back(){if(D.hidden)return;if(D.hasFocus())stop()}
D.addEventListener('visibilitychange',function(){if(!D.hidden){back();setTimeout(back,300)}});
W.addEventListener('focus',stop);
['pointerdown','keydown'].forEach(function(t){D.addEventListener(t,function(){if(on&&!D.hidden)stop()},true)});
/* ---------- Preferências (só computador) ---------- */
function prefRow(force){var pp=D.getElementById('prefs-panel');if(!pp)return;var old=D.getElementById('pref-tab-row');if(!desktop()){if(old)old.remove();return}
  if(old&&!force&&old.getAttribute('data-st')===testState)return;if(old)old.remove();
  var r=D.createElement('div');r.className='pref-row';r.id='pref-tab-row';r.setAttribute('data-st',testState);
  var info=testState==='wait'?'Troque de aba agora (ou abra outra janela por cima). Em 3 segundos a aba do Stok pisca.'
    :testState==='on'?'A aba está piscando. Volte para o Stok para parar.'
    :testState==='back'?'Funcionou? A aba piscou com a bolinha vermelha? Se não piscou, avise o gestor.'
    :'A aba pisca (título e bolinha vermelha) quando chega mensagem ou alteração da equipe com o Stok em outra aba, minimizado ou atrás de outra janela.';
  r.innerHTML='<span><b>Testar aba piscando</b><span class="small" id="pref-tab-info" role="status" aria-live="polite"></span></span>'
   +'<button type="button" id="pref-tab-btn" class="btn" onclick="e99TitleTest()"'+(testState==='wait'?' disabled':'')+'>Testar aba piscando</button>';
  r.querySelector('#pref-tab-info').textContent=info;pp.appendChild(r)}
if(typeof render==='function'){var r0=render;render=function(){var r=r0.apply(this,arguments);try{prefRow(false)}catch(e){}return r}}
/* prepara o ícone vermelho cedo (só no computador) para o 1º piscar já trocar o ícone */
setTimeout(function(){if(desktop())mkRed()},1500);
})();
