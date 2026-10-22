/* KHS R&E Cinema Layer 1.0 — generated procedural soundtrack, stage transitions, single/duo presenter configuration. No external audio or tracking. */
(()=>{'use strict';
const cfg=Object.assign({id:'rne',name:'포항고 인문사회 R&E',presenters:1,lead:'연구의 질문을 따라가 봅시다.',soundLevel:.16},window.RNE_CINEMA_TEAM||{});
const key='khs-rne-cinema-config-'+cfg.id;
const prefs=(()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}})();
let speakers=Number(prefs.speakers)||cfg.presenters,soundEnabled=false,ctx=null,last=-1,started=false,firstCue=true;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s);
const $create=(tag,className,txt)=>{const e=document.createElement(tag);if(className)e.className=className;if(txt!==undefined)e.textContent=txt;return e};
const modeLabel=n=>n===1?'1인 발표':'2인 발표';
const save=()=>{try{localStorage.setItem(key,JSON.stringify({speakers}))}catch{}};
function currentSlide(){
 if(cfg.id==='shin'&&document.querySelector('#presenter-shell')){
  const raw=localStorage.getItem('khs-rne-shinjw-cinema-2026-slide');
  const index=Number(raw||0);
  return Number.isFinite(index)?Math.max(0,Math.min(index,10)):0;
 }
 const v=$('#slide-counter')?.textContent||$('#current')?.textContent||$('#count')?.textContent||'1';
 const k=Number((v.match(/(\d+)/)||[])[1]);return Number.isFinite(k)?k-1:0;
}
function pressMode(){
 const i=currentSlide();
 if(cfg.id==='shin'){
  document.querySelectorAll('#current-role,#presenter-role').forEach(el=>{
   el.textContent=speakers===1?'신진욱팀 · 대표 발표자':(i<6?'발표자 1':'발표자 2');
  });
 }
 if(cfg.id==='cha'){
  const el=document.querySelector('#speaker');
  if(el)el.textContent=speakers===1?'01 / 차민혁':(i<6?'01 / 발표자 1':'02 / 발표자 2');
 }
 if(cfg.id==='hu'&&speakers===1){
  const tag=document.querySelector('#speakerTitle');
  if(tag&&tag.textContent.trim())tag.textContent=tag.textContent.replace(/허준완|김주찬/g,'대표 발표자');
 }
}
const groups={0:[196,247,294.5],1:[146.83,196,293.66],2:[164.81,220,329.63],3:[174.61,233.08,349.23]};
function beep(frequency,dur,gain=.08,type='sine',when=0,dest=null){
 if(!ctx||ctx.state!=='running')return;
 const now=ctx.currentTime+when,osc=ctx.createOscillator(),amp=ctx.createGain();
 osc.type=type;osc.frequency.setValueAtTime(frequency,now);amp.gain.setValueAtTime(.0001,now);
 amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),now+Math.min(.045,dur*.2));
 amp.gain.exponentialRampToValueAtTime(.0001,now+dur);
 osc.connect(amp).connect(dest||ctx.destination);osc.start(now);osc.stop(now+dur+.06);
}
function swoosh(power=.4){
 if(!ctx||ctx.state!=='running')return;
 const duration=.38,buffer=ctx.createBuffer(1,Math.round(ctx.sampleRate*duration),ctx.sampleRate);
 const a=buffer.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*Math.pow(Math.sin(Math.PI*i/a.length),1.1);
 const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 src.buffer=buffer;filter.type='bandpass';filter.Q.value=.9;filter.frequency.setValueAtTime(260,ctx.currentTime);
 filter.frequency.exponentialRampToValueAtTime(2200,ctx.currentTime+.2);filter.frequency.exponentialRampToValueAtTime(290,ctx.currentTime+.38);
 gain.gain.value=.12*power;src.connect(filter).connect(gain).connect(ctx.destination);src.start();
}
function impact(intensity=1){
 if(!ctx||ctx.state!=='running')return;
 const now=ctx.currentTime,o=ctx.createOscillator(),gain=ctx.createGain();
 o.type='sine';o.frequency.setValueAtTime(92,now);o.frequency.exponentialRampToValueAtTime(42,now+.52);
 gain.gain.setValueAtTime(Math.max(.0002,cfg.soundLevel*.65*intensity),now);
 gain.gain.exponentialRampToValueAtTime(.0001,now+.7);
 o.connect(gain).connect(ctx.destination);o.start(now);o.stop(now+.72);
}
function chord(index=0,soft=false){
 if(!ctx||ctx.state!=='running')return;
 const notes=groups[index%4];notes.forEach((f,i)=>beep(f,soft?1.6:2.4,soft?.007:.020,'sine',i*.12));
}
function introSound(){swoosh(.75);impact(.9);[196,246.94,293.66,391.99].forEach((f,i)=>beep(f,1.5,.025,'triangle',.10+i*.17))}
function outroSound(){swoosh(.72);impact(1.2);[146.83,196,246.94,293.66,392].forEach((f,i)=>beep(f,3.4,.024,'sine',.12+i*.21))}
function sceneSound(i){
 if(!soundEnabled)return;
 if(i===0){if(firstCue)introSound();firstCue=false;return}
 if(i>=getTotal()-1){outroSound();return}
 swoosh(i===2||i===5?.35:.22);
 if(i===3||i===7)impact(.37);
 if(i===8)chord(2,true);
}
function getTotal(){return cfg.id==='hu'?12:cfg.id==='cha'?12:11}
async function enableAudio(){
 try{if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();await ctx.resume();soundEnabled=true;}catch(e){soundEnabled=false;console.warn('브라우저 음향 미지원: 무음으로 진행',e)}
 paintAudio();
}
function mute(){soundEnabled=false;try{ctx?.suspend()}catch{}paintAudio()}
async function toggleAudio(){if(soundEnabled)mute();else{await enableAudio();beep(530,.15,.025)}}
function paintAudio(){
 const b=$('#cine-audio');if(!b)return;
 b.textContent=soundEnabled?'♫ 음향 켜짐':'♪ 음향 꺼짐';b.setAttribute('aria-pressed',String(soundEnabled));
}
function displayTransition(i){
 if(!started||reduce)return;
 const mask=$('#cine-wipe');if(!mask)return;
 mask.classList.remove('active');void mask.offsetWidth;mask.classList.add('active');
 const el=$('#cine-scene-label');el.textContent=(i+1<10?'0':'')+(i+1)+' / '+(getTotal()<10?'0':'')+getTotal();
}
function observedChange(){
 if(!started)return;
 const i=currentSlide();
 if(i===last)return;last=i;pressMode();displayTransition(i);sceneSound(i);
 if(i===getTotal()-1)document.body.classList.add('cine-final');else document.body.classList.remove('cine-final');
}
function resetDuration(){
 try{
  window.dispatchEvent(new CustomEvent('rne-cinematic-start',{detail:{team:cfg.id,speakers}}));
  if(cfg.id==='hu')window.dispatchEvent(new KeyboardEvent('keydown',{key:'r',bubbles:true}));
 }catch{}
}
function createGate(){
 const gate=$create('div','cine-gate');gate.id='cine-gate';
 gate.innerHTML='<div class="cine-gate__grain"></div><div class="cine-gate__content"><div class="cine-gate__kicker">POHANG HIGH SCHOOL · R&E 2026</div><div class="cine-gate__team"></div><div class="cine-gate__line"></div><h1 class="cine-gate__heading"></h1><p class="cine-gate__lead"></p><div class="cine-gate__label">발표 인원</div><div class="cine-gate__choose" role="group" aria-label="발표 인원"><button id="cine-one">1명 발표</button><button id="cine-two">2명 발표</button></div><div class="cine-gate__actions"><button id="cine-start-sound" class="cine-gate__main">▶ 영화관 모드 · 사운드 시작</button><button id="cine-start-silent" class="cine-gate__quiet">무음으로 시작</button></div><p class="cine-gate__fine">사운드는 발표 시작을 직접 누른 뒤에만 켜집니다. 전체 화면은 F, 음소거는 M, 슬라이드 이동은 방향키를 사용합니다.</p></div>';
 document.body.append(gate);
 $('.cine-gate__team').textContent=cfg.name;
 $('.cine-gate__heading').textContent=cfg.heading||'하나의 질문이,\n하나의 연구가 되다.';
 $('.cine-gate__lead').textContent=cfg.lead;
 const select=n=>{speakers=n;save();$('#cine-one').setAttribute('aria-pressed',String(n===1));$('#cine-two').setAttribute('aria-pressed',String(n===2));pressMode()};
 $('#cine-one').addEventListener('click',()=>select(1));$('#cine-two').addEventListener('click',()=>select(2));select(speakers);
 $('#cine-start-sound').addEventListener('click',()=>start(true));
 $('#cine-start-silent').addEventListener('click',()=>start(false));
}
function liveSetup(){
 const wipe=$create('div','cine-wipe');wipe.id='cine-wipe';wipe.setAttribute('aria-hidden','true');
 wipe.innerHTML='<div class="cine-wipe__bars"></div><span id="cine-scene-label"></span>';document.body.append(wipe);
 const audio=$create('button','cine-audio','♪ 음향 꺼짐');audio.id='cine-audio';audio.title='사운드 켜기·끄기 (M)';audio.setAttribute('aria-label','음향 켜기 및 끄기');audio.addEventListener('click',toggleAudio);document.body.append(audio);
 paintAudio();
}
async function start(sound){
 if(started)return;started=true;document.body.classList.add('cine-started');
 if(sound)await enableAudio();
 if(cfg.id==='cha')$('#startscreen')?.classList.add('hidden');
 $('#cine-gate')?.classList.add('leaving');
 setTimeout(()=>$('#cine-gate')?.remove(),750);
 resetDuration();last=-1;observedChange();
 if(!reduce)document.body.classList.add('cine-camera');
}
function keys(e){
 if(e.key?.toLowerCase()==='m'&&!e.repeat){e.preventDefault();toggleAudio();return}
 if(e.key?.toLowerCase()==='h'&&e.ctrlKey){e.preventDefault();$('#cine-gate')?.classList.toggle('leaving');}
 if(!started&&[' ','Enter'].includes(e.key)&&!['INPUT','TEXTAREA'].includes(e.target?.tagName)){e.preventDefault();start(false)}
}
function bootstrap(){
 if(!document.body)return;
 document.body.classList.add('cine-'+cfg.id);document.documentElement.dataset.cineTeam=cfg.name;
 liveSetup();
 const q=new URLSearchParams(location.search);
 if(cfg.id==='shin'&&(q.has('presenter')||q.has('audience'))){started=true;document.body.classList.add('cine-started');}
 else createGate();
 addEventListener('keydown',keys,true);
 setInterval(observedChange,170);
 if(q.has('preview')&&!started)start(false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootstrap);else bootstrap();
window.KHSRNECinema={start,toggleAudio,getSound:()=>soundEnabled,getSpeakers:()=>speakers,setSpeakers:n=>{speakers=n===2?2:1;save();pressMode()},config:cfg};
})();
