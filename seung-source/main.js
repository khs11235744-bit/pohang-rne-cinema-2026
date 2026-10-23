import './style.css';
import {startMobile} from './mobile.js';
import './mobile.css';
import {D,slidesHTML,esc} from './scenes.js';
import {Application,Graphics,Text} from 'pixi.js';
import {animate,stagger} from 'animejs';

if(!D||D.survey.submitted!==99||D.slides.reduce((x,s)=>x+s.sec,0)!==420)throw new Error('설문 99건 / 420초 연구 데이터 검증 실패');
const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const KEY='khs-seung-2026-v99',params=new URLSearchParams(location.search);
const mode=params.has('presenter')?'presenter':params.has('audience')?'audience':'stage';
const state={index:0,speakers:localStorage.getItem(KEY+'-speakers')==='2'?2:1,start:Number(localStorage.getItem(KEY+'-start')||0),question:0,answer:false};
const bc='BroadcastChannel'in window?new BroadcastChannel(KEY):null;
const app=$('#app');
const fmt=n=>String(Math.floor(Math.max(n,0)/60)).padStart(2,'0')+':'+String(Math.floor(Math.max(n,0)%60)).padStart(2,'0');
const role=i=>state.speakers===1?'대표 발표자':i<5?'발표자 1':'발표자 2';
const grades=()=>{try{return JSON.parse(localStorage.getItem(KEY+'-grades')||'{}')}catch{return {}}};
function emit(){if(mode==='audience')return;bc?.postMessage({index:state.index,speakers:state.speakers,start:state.start});localStorage.setItem(KEY+'-start',String(state.start));localStorage.setItem(KEY+'-index',String(state.index));localStorage.setItem(KEY+'-speakers',String(state.speakers));}
function modalHTML(){
 const items=D.sources.map(s=>'<div class="ref"><b>'+esc(s.label)+'</b> · '+esc(s.description)+(s.url?'<p><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">자료 확인 ↗</a></p>':'')+'</div>').join('');
 return '<div class="info-overlay" id="qa" role="dialog" aria-modal="true"><div class="info-panel"><div class="top"><div><div class="small">STAT / RESEARCH DEFENSE</div><h2>신승연팀 · 심사 질문 24개</h2></div><button data-close>닫기 ×</button></div><p class="small" id="qa-step"></p><div class="qa-q" id="qa-question"></div><div class="qa-a" id="qa-answer" hidden></div><div class="qa-controls"><button id="qa-prev">← 이전</button><button id="qa-show" class="active">모범답안 보기</button><button id="qa-next">다음 →</button><label style="margin-left:auto">연습 평가 <select id="qa-grade"><option value="">미평가</option>'+[1,2,3,4,5].map(i=>'<option value="'+i+'">'+i+'/5</option>').join('')+'</select></label></div><p id="qa-status" style="font-size:15px;color:#aedbd5"></p></div></div><div class="info-overlay" id="refs" role="dialog" aria-modal="true"><div class="info-panel"><div class="top"><div><div class="small">RESEARCH TRANSPARENCY</div><h2>자료 출처와 연구의 한계</h2></div><button data-close>닫기 ×</button></div><p class="note" style="font-size:18px">자발적 참여 동의 99건. 문항별 척도 0 값은 유효 응답에서 제외하고 분모를 별도로 계산했습니다. 동일 인적사항 3쌍은 확인 필요 기록이며, 개인별 응답은 공개하지 않았습니다.</p>'+items+'</div></div>';
}
function startHTML(){
 return slidesHTML()+'<div id="mini-keys"><button id="speaker-toggle">P 발표자</button><button id="qa-toggle">Q 질문</button><button id="source-toggle">I 출처</button><button id="full-toggle">F 전체화면</button></div><div id="intro-curtain"><div class="badge">POHANG HIGH SCHOOL · SCHOOL LIFE LAB</div><h1><strong>다른 사람이 하면</strong><br>나도 괜찮을까?</h1><p class="sub">신승연팀 · 학교 급식 줄에서 나타나는 집단행동과 사회적 신호</p><p class="sub" style="font-size:17px">연구 참여 학생: 신승연 · 이시훈 · 김민기 · 김현우</p><div class="choices"><button id="select-one" class="selected">1명 발표</button><button id="select-two">2명 발표</button></div><button id="start-show" style="margin-top:15px">▶ 발표 시작</button><p class="minor">조사 날짜는 발표 화면에 표시하지 않습니다. 원본 응답의 문항별 유효N에 따라 수치를 구성했습니다.</p></div>'+modalHTML();
}
function fit(){
 const e=$('#canvas-stage');if(!e)return;
 const scale=Math.min(innerWidth/1600,innerHeight/900);
 const left=(innerWidth-1600*scale)/2,top=(innerHeight-900*scale)/2;
 e.style.transform='translate('+left+'px,'+top+'px) scale('+scale+')';
}
function reveal(i,announce=true){
 state.index=Math.max(0,Math.min(D.slides.length-1,i));
 $$('.slide').forEach((e,j)=>e.classList.toggle('active',state.index===j));
 if(announce)emit();
 const current=$('.slide.active');if(!current)return;
 if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
  try{animate($$('.entrance',current),{opacity:[0,1],translateY:[26,0],delay:stagger(95),duration:720,ease:'out(3)'})}catch(e){console.warn('Anime.js fallback',e)}
 }
 requestAnimationFrame(()=>$$('[data-bar]',current).forEach(e=>e.style.width=e.dataset.bar+'%'));
}
const next=()=>reveal(state.index+1),prev=()=>reveal(state.index-1);
function showQA(){closeModal();$('#qa').classList.add('open');$('#qa-show').focus()}
function showRefs(){closeModal();$('#refs').classList.add('open')}
function closeModal(){$$('.info-overlay.open').forEach(e=>e.classList.remove('open'))}
function redrawQA(){
 const q=D.questions[state.question];if(!$('#qa-step'))return;
 $('#qa-step').textContent=String(state.question+1).padStart(2,'0')+' / '+D.questions.length+' · '+q[0];
 $('#qa-question').textContent=q[1];$('#qa-answer').textContent=q[2];$('#qa-answer').hidden=!state.answer;$('#qa-show').textContent=state.answer?'답안 숨기기':'모범답안 보기';
 const g=grades();$('#qa-grade').value=g[state.question]??'';
 const values=Object.values(g),avg=values.length?(values.reduce((s,v)=>s+Number(v),0)/values.length).toFixed(2):'—';
 $('#qa-status').textContent='자체 연습 평가 '+values.length+'/24 · 평균 '+avg+'/5. 실제 심사위원 평가가 아닙니다.';
}
function bindModals(){
 $$('.info-overlay [data-close]').forEach(b=>b.addEventListener('click',closeModal));
 $('#qa-prev').addEventListener('click',()=>{state.question=(state.question+23)%24;state.answer=false;redrawQA()});
 $('#qa-next').addEventListener('click',()=>{state.question=(state.question+1)%24;state.answer=false;redrawQA()});
 $('#qa-show').addEventListener('click',()=>{state.answer=!state.answer;redrawQA()});
 $('#qa-grade').addEventListener('change',e=>{const g=grades();if(e.target.value)g[state.question]=Number(e.target.value);else delete g[state.question];localStorage.setItem(KEY+'-grades',JSON.stringify(g));redrawQA()});
 redrawQA();
}
function full(){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else document.documentElement.requestFullscreen?.().catch(()=>{})}
function presenter(){
 const u=new URL(location.href);u.search='?presenter=1';u.hash='';
 const w=window.open(u.href,'SeungRNEPresenter','popup=yes,width=1300,height=830');
 if(!w)alert('팝업이 차단되었습니다. 발표자 창을 허용해 주세요.');else setTimeout(emit,400);
}
function keypress(e){
 if(['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName))return;
 if($('#intro-curtain'))return;
 if($$('.info-overlay.open').length){if(e.key==='Escape'){e.preventDefault();closeModal()}return;}
 switch(e.key.toLowerCase()){
 case 'arrowright':case ' ':e.preventDefault();next();break;
 case 'arrowleft':e.preventDefault();prev();break;
 case 'q':e.preventDefault();showQA();break;
 case 'i':e.preventDefault();showRefs();break;
 case 'p':e.preventDefault();presenter();break;
 case 'f':e.preventDefault();full();break;
 }
}
let queueApp=null,joiner=null,queueDone=false;
async function initQueue(){
 if(queueDone)return;queueDone=true;
 const host=$('#queue-stage');if(!host)return;
 try{
  const p=new Application();await p.init({width:770,height:340,backgroundAlpha:0,antialias:true,preference:'webgl'});
  queueApp=p;host.querySelector('.fallback')?.remove();host.appendChild(p.canvas);
  const counter=new Graphics().roundRect(17,40,151,104,14).fill(0x12877c).stroke({width:3,color:0x1c4554});
  const label=new Text({text:'급식 배식대',style:{fontSize:22,fill:0xffffff,fontFamily:'Malgun Gothic',fontWeight:'bold'}});label.x=28;label.y=74;
  const carpet=new Graphics().roundRect(187,135,552,42,18).fill({color:0xffffff,alpha:.65}).stroke({width:3,color:0x99bbb0});
  p.stage.addChild(carpet);p.stage.addChild(counter);p.stage.addChild(label);
  function actor(x,col,label,extra){
   const g=new Graphics().roundRect(-27,-6,54,58,13).fill(col).stroke({width:2,color:0x1c4352}).circle(0,-27,24).fill(0xffdfb7).stroke({width:2,color:0x1c4352}).roundRect(-20,-48,40,10,5).fill(0x193d50);
   g.x=x;g.y=153;p.stage.addChild(g);
   const t=new Text({text:String(label),style:{fontSize:15,fill:0x1b4253,fontFamily:'Arial',fontWeight:'bold'}});t.x=x-6;t.y=195;p.stage.addChild(t);
   if(extra){const nt=new Text({text:'새로 온 친구',style:{fontSize:18,fill:0xbc5a46,fontFamily:'Malgun Gothic',fontWeight:'bold'}});nt.x=x-57;nt.y=270;p.stage.addChild(nt)}
   return g;
  }
  const cols=[0x55b6a4,0xf8c477,0x97bbdb,0xb4cf9a,0xeea48a];
  for(let i=0;i<5;i++)actor(253+i*92,cols[i],i+1,false);
  joiner=actor(674,0xeb795e,'?',true);joiner.y=248;
 }catch(err){console.warn('PixiJS WebGL fallback',err);host.querySelector('.fallback').style.display='flex'}
}
function queueSelect(choice){
 const messages={allow:'친구라는 이유로 허용하면 먼저 기다린 학생에게 불공정할 수 있습니다. 이는 실제 설문 응답 결과가 아닌 토론을 위한 가상 상황입니다.',ask:'먼저 기다린 사람의 의견을 물어보는 방식입니다. 그러나 모두가 동의할 조건인지도 살펴야 합니다.',deny:'모두 마지막에 줄을 서도록 하는 일관된 규칙입니다. 다만 잠시 이탈했다 돌아오는 상황과 구별할 필요가 있습니다.'};
 $$('.queue-options button').forEach(b=>b.classList.toggle('selected',b.dataset.queue===choice));
 $('#queue-feedback').textContent=messages[choice];
 if(joiner){
  const target=choice==='deny'?674:choice==='ask'?433:281;
  try{animate(joiner,{x:target,y:choice==='deny'?248:153,duration:850,ease:'out(3)'})}catch{joiner.x=target;joiner.y=choice==='deny'?248:153}
 }
}
function setSpeakers(n){
 state.speakers=n===2?2:1;
 $('#select-one')?.classList.toggle('selected',state.speakers===1);
 $('#select-two')?.classList.toggle('selected',state.speakers===2);
 emit();
}
function stage(){
 app.innerHTML=startHTML();document.body.classList.toggle('audience',mode==='audience');
 $('#select-one').addEventListener('click',()=>setSpeakers(1));$('#select-two').addEventListener('click',()=>setSpeakers(2));
 if(mode!=='audience')setSpeakers(state.speakers);
 $('#start-show').addEventListener('click',()=>{$('#intro-curtain')?.remove();state.start=Date.now();reveal(0);initQueue()});
 $$('.queue-options button').forEach(b=>b.addEventListener('click',()=>queueSelect(b.dataset.queue)));
 $('#speaker-toggle').addEventListener('click',presenter);
 $('#qa-toggle').addEventListener('click',showQA);
 $('#source-toggle').addEventListener('click',showRefs);
 $('#full-toggle').addEventListener('click',full);
 bindModals();fit();window.addEventListener('resize',fit);window.addEventListener('keydown',keypress,true);
 let tx=0;$('#canvas-stage').addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
 $('#canvas-stage').addEventListener('touchend',e=>{if($$('.info-overlay.open').length)return;const diff=e.changedTouches[0].clientX-tx;if(Math.abs(diff)>85)diff<0?next():prev()},{passive:true});
 if(mode==='audience'||params.has('preview')){$('#intro-curtain').remove();reveal(0,false);initQueue()}
 if(bc)bc.onmessage=ev=>{const m=ev.data;if(Number.isInteger(m?.index)&&state.index!==m.index)reveal(m.index,false);if(m?.speakers)state.speakers=m.speakers;if(m?.start)state.start=m.start;};
}
function speaker(){
 app.innerHTML='<div id="speaker-panel" class="open"><div class="speaker-preview"><iframe title="관객 화면" src="./index.html?audience=1"></iframe></div><div class="speaker-text"><div class="speaker-head">신승연팀 / SPEAKER NOTES</div><div class="time" id="speaker-time">07:00</div><div id="speaker-role" style="font-size:19px;color:#0d8179;font-weight:900"></div><h2 id="speaker-title"></h2><p id="speaker-note"></p><div class="bubble" style="font-size:20px;margin-top:20px"><b>다음 장면</b><div id="speaker-next" style="margin-top:10px"></div></div><div class="control-row"><button id="speaker-prev">◀ 이전</button><button id="speaker-next-btn">다음 ▶</button><button id="speaker-reset">7분 다시 시작</button><button id="speaker-one">1인</button><button id="speaker-two">2인</button></div></div></div>';
 state.index=Number(localStorage.getItem(KEY+'-index')||0);state.speakers=Number(localStorage.getItem(KEY+'-speakers')||1);
 const render=()=>{
  const slide=D.slides[state.index],n=state.index;
  $('#speaker-role').textContent=role(n)+' · '+(n+1)+'/10장 · 권장 '+slide.sec+'초';
  $('#speaker-title').textContent=slide.title.replace('\n',' ');$('#speaker-note').textContent=slide.notes;
  $('#speaker-next').textContent=D.slides[n+1]?.title.replace('\n',' ')||'발표 종료';
  const remain=D.duration-(Date.now()-state.start)/1000;
  $('#speaker-time').textContent=state.start?(remain<0?'+'+fmt(-remain):fmt(remain)):'07:00';
  $('#speaker-one').classList.toggle('selected',state.speakers===1);$('#speaker-two').classList.toggle('selected',state.speakers===2);
 };
 const move=diff=>{state.index=Math.max(0,Math.min(9,state.index+diff));emit();render()};
 $('#speaker-prev').addEventListener('click',()=>move(-1));$('#speaker-next-btn').addEventListener('click',()=>move(1));
 $('#speaker-reset').addEventListener('click',()=>{state.start=Date.now();emit();render()});
 $('#speaker-one').addEventListener('click',()=>{state.speakers=1;emit();render()});
 $('#speaker-two').addEventListener('click',()=>{state.speakers=2;emit();render()});
 window.addEventListener('keydown',e=>{if(['ArrowRight',' '].includes(e.key)){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}});
 if(bc)bc.onmessage=ev=>{const m=ev.data;if(Number.isInteger(m?.index))state.index=m.index;if(m?.speakers)state.speakers=m.speakers;if(m?.start)state.start=m.start;render()};
 render();setInterval(render,400);bc?.postMessage({index:state.index,speakers:state.speakers,start:state.start});
}
if(mode==='presenter')speaker();else if(matchMedia('(max-width:700px) and (orientation:portrait)').matches)startMobile();else stage();
