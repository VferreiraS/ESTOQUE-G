
(function(){
'use strict';
/* v92 · som de abertura (e99Sting), sintetizado com Web Audio, sem arquivos. Só depois de um toque (regra do iPhone) e com o som do app ligado.
   v122: a música ambiente e o botão ♫ saíram (pedido do dono). */
var D=document,B=D.body;

/* ---------- som de abertura (Web Audio, sem arquivos) ---------- */
function soundOn(){try{return siteSoundEnabled!==false}catch(e){return true}}
function ctxRun(){try{return siteAudio&&siteAudio.state==='running'?siteAudio:null}catch(e){return null}}
var NOISE=null;function noise(ctx){if(NOISE&&NOISE.sampleRate===ctx.sampleRate)return NOISE;var n=Math.floor(ctx.sampleRate*1.2),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;NOISE=b;return b}
function env(g,t,peak,a,len){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+len)}
function osc(ctx,type,f,t,stop,dest,det){var o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(det)o.detune.value=det;o.connect(dest);o.start(t);o.stop(stop);return o}
var stings=0;
/* abertura (~1,7 s, junto com a animação): arpejo que sobe com filtro abrindo, "vuuush" e, no S, o impacto com acorde largo */
function sting(ctx){stings++;var t0=ctx.currentTime+.03,out=ctx.createGain(),comp=ctx.createDynamicsCompressor();out.gain.value=.8;comp.threshold.value=-16;comp.ratio.value=5;out.connect(comp);comp.connect(ctx.destination);
  var f=ctx.createBiquadFilter();f.type='lowpass';f.Q.value=8;f.frequency.setValueAtTime(420,t0);f.frequency.exponentialRampToValueAtTime(4600,t0+.84);f.connect(out);
  [146.83,174.61,220,293.66,349.23,440,587.33,698.46].forEach(function(fr,i){var at=t0+i*.1,g=ctx.createGain();env(g,at,.055,.008,.17);g.connect(f);osc(ctx,'sawtooth',fr,at,at+.2,g);osc(ctx,'square',fr/2,at,at+.2,g,4)});
  var ns=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),ng=ctx.createGain();ns.buffer=noise(ctx);bp.type='bandpass';bp.Q.value=1.4;bp.frequency.setValueAtTime(380,t0+.18);bp.frequency.exponentialRampToValueAtTime(5200,t0+.86);ng.gain.setValueAtTime(.0001,t0+.18);ng.gain.exponentialRampToValueAtTime(.07,t0+.8);ng.gain.exponentialRampToValueAtTime(.0001,t0+.93);ns.connect(bp);bp.connect(ng);ng.connect(out);ns.start(t0+.18);ns.stop(t0+1);
  var hit=t0+.87,sg=ctx.createGain(),so=osc(ctx,'sine',96,hit,hit+.85,sg);so.frequency.exponentialRampToValueAtTime(36,hit+.6);env(sg,hit,.34,.01,.78);sg.connect(out);
  var lp=ctx.createBiquadFilter(),cg=ctx.createGain();lp.type='lowpass';lp.Q.value=2.5;lp.frequency.setValueAtTime(5600,hit);lp.frequency.exponentialRampToValueAtTime(520,hit+1.15);env(cg,hit,.085,.02,1.3);lp.connect(cg);cg.connect(out);
  [73.42,146.83,220,293.66,349.23,659.25].forEach(function(fr){osc(ctx,'sawtooth',fr,hit,hit+1.35,lp,-8);osc(ctx,'sawtooth',fr,hit,hit+1.35,lp,8)});
  var cs=ctx.createBufferSource(),hp=ctx.createBiquadFilter(),hg=ctx.createGain();cs.buffer=noise(ctx);hp.type='highpass';hp.frequency.value=3200;env(hg,hit,.06,.003,.32);cs.connect(hp);hp.connect(hg);hg.connect(out);cs.start(hit);cs.stop(hit+.4);
  setTimeout(function(){try{out.disconnect();comp.disconnect()}catch(e){}},2800)}
window.e99Sting=function(ctx){try{ctx=ctx||ctxRun();if(ctx&&soundOn()&&!D.hidden)sting(ctx)}catch(e){}};
window.e99Stings=function(){return stings};
function introWillShow(){return !D.hidden}
/* v93: o login costuma terminar antes do iPhone acabar de retomar o áudio (resume é assíncrono): espera até 2,5 s em vez de desistir calado */
if(typeof playSiteSound==='function'){var ps0=playSiteSound;playSiteSound=function(kind){if(kind==='login'&&introWillShow()&&soundOn()&&!D.hidden){var c=ctxRun();if(c){try{sting(c)}catch(e){}return}var s0=null;try{s0=siteAudio}catch(e){}if(s0&&s0.state!=='closed'&&s0.resume){var t0=Date.now();s0.resume().then(function(){if(s0.state==='running'&&!D.hidden&&Date.now()-t0<2500){try{sting(s0)}catch(e){}}}).catch(function(){});return}}return ps0.apply(this,arguments)}}
})();
