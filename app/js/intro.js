
(function(){
'use strict';
var S='M42 14h30.5a7.5 7.5 0 0 1 0 15H42a3.5 3.5 0 0 0 0 7H58a21 21 0 0 1 0 42H27.5a7.5 7.5 0 0 1 0-15H58a6 6 0 0 0 0-12H42a18.5 18.5 0 0 1 0-37z';
var active=null,removeTimer=0;
function off(){return false}
function reduced(){try{if(typeof window.__osReduce==='boolean')return window.__osReduce;return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(x){return false}}
function clear(){if(removeTimer)clearTimeout(removeTimer);removeTimer=0;if(active&&active.parentNode)active.remove();active=null;document.body&&document.body.classList.remove('stok-intro-active')}
function show(first){if(off()||document.hidden||!document.body)return;if(active&&active.parentNode)return;clear();
  var d=document.createElement('div');d.id='stok-intro';d.setAttribute('aria-hidden','true');if(reduced())d.setAttribute('data-reduced-motion','true');
  var cells='';[[42,24],[91,24],[140,24],[189,24],[238,24],[42,66],[91,66],[140,66],[189,66],[238,66],[42,108],[91,108],[140,108],[189,108],[238,108]].forEach(function(c,i){var w=i%3===0?24:29,h=i%4===0?20:25;cells+='<rect class="si-cell" x="'+c[0]+'" y="'+(c[1]-h)+'" width="'+w+'" height="'+h+'" rx="2"/>'});
  d.innerHTML='<svg class="si-scene" viewBox="0 0 320 160" role="presentation"><g class="si-racks"><path class="si-shelf" d="M27 32h266M27 74h266M27 116h266"/><path class="si-upright" d="M32 27v94M288 27v94"/>'+cells+'</g><path class="si-scan" pathLength="100" d="M276 17H70q-9 0-9 9v34q0 9 9 9h180q9 0 9 9v33q0 9-9 9H72q-9 0-9 9v10q0 9 9 9h175"/><defs><linearGradient id="si-tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38343f"/><stop offset="1" stop-color="#08070a"/></linearGradient></defs><g transform="translate(102 24) scale(1.16)"><rect class="si-tile" x="0" y="-4" width="100" height="100" rx="22.5"/><g transform="translate(50 47.5) scale(.74) translate(-50 -46)"><path class="si-mark" d="'+S+'"/></g></g></svg><div class="si-word">STOK</div><div class="si-sub">LOJAS G · ESTOQUE 99</div>';
  active=d;document.body.classList.add('stok-intro-active');document.body.appendChild(d);d.classList.add('si-ending');
  /* v124: na abertura do app, botão "Toque para abrir" (destrava o áudio e toca o som de abertura); segura a abertura até 3,4 s */
  var hold=first===true&&wantTap();if(hold)addTap(d);removeTimer=setTimeout(clear,reduced()?(hold?2600:950):(hold?3400:1710))}
function wantTap(){try{if(typeof siteSoundEnabled!=='undefined'&&!siteSoundEnabled)return false;if(window.e99LoginSound&&window.e99LoginSound.played())return false;if(navigator.userActivation&&navigator.userActivation.hasBeenActive)return false;return true}catch(x){return false}}
function soundGone(){try{return (typeof siteSoundEnabled!=='undefined'&&!siteSoundEnabled)||!!(window.e99LoginSound&&window.e99LoginSound.played())}catch(x){return true}}
function addTap(d){var t0=Date.now();d.classList.add('si-hold');d.removeAttribute('aria-hidden');Array.prototype.forEach.call(d.children,function(c){c.setAttribute('aria-hidden','true')});
  var b=document.createElement('button');b.type='button';b.id='si-tap';b.className='si-tap';b.textContent='Toque para abrir';b.setAttribute('aria-label','Toque para abrir o app com som');d.appendChild(b);
  var done=false,w=0;function end(ms){if(done)return;done=true;clearInterval(w);if(b.parentNode)b.remove();if(removeTimer)clearTimeout(removeTimer);removeTimer=setTimeout(clear,Math.max(0,ms))}
  b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();window.__e99IntroTap=Date.now();try{if(typeof unlockSiteAudio==='function')unlockSiteAudio()}catch(x){}try{if(typeof playSiteSound==='function')playSiteSound('login')}catch(x){}d.classList.add('si-tapped');end(220)});
  /* som já tocou sozinho (PC/Android) ou som desligado: tira o botão e a abertura termina no tempo normal */
  w=setInterval(function(){if(!d.isConnected){clearInterval(w);return}if(!done&&soundGone())end((reduced()?950:1710)-(Date.now()-t0))},250)}
/* Som sintético só em contexto já desbloqueado e quando o som do app está ligado. */
function tudum(ctx){var t=ctx.currentTime+.02,out=ctx.createGain();out.gain.value=.75;out.connect(ctx.destination);
  function thud(at,f0,f1,len,vol){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f0,at);o.frequency.exponentialRampToValueAtTime(f1,at+len);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(vol,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+len);o.connect(g);g.connect(out);o.start(at);o.stop(at+len+.05)}
  thud(t,78,42,.32,.18);thud(t+.3,64,30,.48,.2);var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.Q.value=4;lp.frequency.setValueAtTime(260,t+.32);lp.frequency.exponentialRampToValueAtTime(1800,t+1.2);var cg=ctx.createGain();cg.gain.setValueAtTime(.0001,t+.32);cg.gain.exponentialRampToValueAtTime(.045,t+.8);cg.gain.exponentialRampToValueAtTime(.0001,t+1.25);lp.connect(cg);cg.connect(out);[110,164.81,220].forEach(function(f,i){var o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(f,t+.32);o.connect(lp);o.start(t+.32);o.stop(t+1.35)})}
function play(){try{if(document.hidden||typeof siteSoundEnabled!=='undefined'&&!siteSoundEnabled)return;if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;var ctx=typeof unlockSiteAudio==='function'?unlockSiteAudio():null;if(!ctx)return;var go=function(){if(ctx.state==='running'){if(window.e99Sting)window.e99Sting(ctx);else tudum(ctx)}};if(ctx.state==='running')go();else ctx.resume().then(go).catch(function(){})}catch(x){}}
window.playStokIntro=function(withSound){show();if(withSound&&!off())play()};
var en=typeof authEnter==='function'?authEnter:null;if(en)authEnter=function(){var r=en.apply(this,arguments);show();return r};
window.replayEntrySplash=function(){show()};
document.addEventListener('visibilitychange',function(){if(document.hidden)clear()});
try{if(!sessionStorage.getItem('e99-intro')){sessionStorage.setItem('e99-intro','1');show(true)}}catch(x){show(true)}
})();
