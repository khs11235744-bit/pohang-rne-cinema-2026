import './style.css';
import './themes.css';
import shin from '../data/shin.json';
import cha from '../data/cha.json';
import hu from '../data/hu.json';
import seung from '../data/seung.json';
import {visual,activate,attachInteractions} from './visuals.js';

const decks={shin,cha,hu,seung},team=document.body.dataset.team,D=decks[team];
if(!D)throw Error('Unknown team');
const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=(v)=>esc(v).replace(/\n/g,'<br>');
const badge='../assets/brand/pohang-school-symbol.png';
const storage='rne-v2-2026-'+team;
const modes=new URLSearchParams(location.search);
const isPresenter=modes.has('presenter'),isAudience=modes.has('audience'),demo=modes.has('demo');
function load(k,def){try{return JSON.parse(localStorage.getItem(k))??def}catch{return def}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
const state={index:0,speakers:load(storage+'-speakers',team==='hu'?2:1),startAt:0,sound:false,ctx:null,qaIndex:0,showAnswer:false,grades:load(storage+'-grades',{})};
let bus;try{bus=new BroadcastChannel(storage+'-bus')}catch{}
const slides=D.slides,MAX=slides.length;
const printable=(n)=>String(Math.abs(Math.floor(n))).padStart(2,'0');
function fmt(seconds){seconds=Math.abs(Math.floor(seconds));return printable(Math.floor(seconds/60))+':'+printable(seconds%60)}
function elapsed(){return state.startAt?Math.round((Date.now()-state.startAt)/1000):0}
function speaker(i){return state.speakers===1?'대표 발표자':i<Math.ceil(MAX/2)?'발표자 1':'발표자 2'}
function sync(obj){bus?.postMessage(Object.assign({from:isPresenter?'presenter':'audience'},obj))}
function fit(){
 const st=$('#screen');if(!st)return;
 const scale=Math.min(window.innerWidth/1600,window.innerHeight/900);
 st.style.transform='translate('+((window.innerWidth-1600*scale)/2)+'px,'+((window.innerHeight-900*scale)/2)+'px) scale('+scale+')';
}
function gateHTML(){
 const roster=D.students.map(x=>'<span>'+esc(x)+'</span>').join('');
 return '<div id="intro" class="intro"><div class="intro-content"><div class="intro-school"><img src="'+badge+'" alt="포항고등학교 교표"><span>2026 POHANG HIGH SCHOOL · 인문사회 R&E</span></div><div class="intro-team">'+esc(D.teamName)+'</div><h1>'+esc(D.title)+'</h1><p>'+esc(D.project)+'</p><div class="intro-roster"><strong>연구 참여</strong>'+roster+'</div><div class="intro-speakers"><span>발표 인원</span><button data-num="1" aria-pressed="'+(state.speakers===1)+'">1명</button><button data-num="2" aria-pressed="'+(state.speakers===2)+'">2명</button></div><div class="intro-actions"><button id="enter-silent">▶ 무음으로 발표 시작</button><button id="enter-sound">♪ 효과음과 시작</button></div><small>방향키·모바일 좌우 스와이프: 장면 전환 · P: 발표자 · Q: 질문 · N: 대본 · I: 출처 · F: 전체화면</small></div></div>';
}
function modalsHTML(){
 const qa=D.questions||[],sources=D.sources||[];
 return '<div id="qa-popup" class="popup" hidden><div class="popup-inside"><div class="popup-top"><div><small>R&E · STAT / DEFENSE</small><h2>'+esc(D.teamName)+' 심사위원 예상 질문</h2></div><button data-close>닫기 ×</button></div><div id="qa-count" class="popup-index"></div><h3 id="qa-question"></h3><p id="qa-answer" hidden></p><div class="popup-actions"><button id="qa-previous">◀ 이전</button><button id="qa-reveal">모범답안 보기</button><button id="qa-following">다음 ▶</button><label>자체 점검 <select id="qa-rating"><option value="">미평가</option>'+[1,2,3,4,5].map(x=>'<option value="'+x+'">'+x+'/5</option>').join('')+'</select></label></div><div id="qa-summary" class="popup-summary"></div></div></div>'+
 '<div id="references-popup" class="popup" hidden><div class="popup-inside"><div class="popup-top"><div><small>SOURCES / RESEARCH LIMITS</small><h2>근거 자료·학자·이미지 출처</h2></div><button data-close>닫기 ×</button></div>'+sources.map(s=>'<div class="source-row"><b>'+esc(s.name)+'</b><p>'+esc(s.detail)+'</p>'+(s.url?'<a target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">원문 열기 ↗</a>':'')+'</div>').join('')+'<div class="source-row"><b>인물 사진</b><p>촬영자·화가 및 이용 조건은 asset credits 자료에 기록했습니다. 소스 사진은 이론 설명을 위해 사용합니다.</p><a href="../assets/credits.json" target="_blank">인물사진 이용조건 ↗</a></div></div></div>'+
 '<div id="script-popup" class="popup" hidden><div class="popup-inside scripts"><div class="popup-top"><div><small>PRINTABLE SCRIPT / 420 SECONDS</small><h2>'+esc(D.teamName)+' 학생용 7분 발표 대본</h2></div><button data-close>닫기 ×</button></div><p class="script-tip">각 장면의 발표 대본과 권장 시간이 포함됩니다. 2인 모드는 전반·후반으로 나누어 연습합니다.</p>'+slides.map((s,i)=>'<article class="script-item"><b>'+printable(i+1)+'장 · '+esc(s.title)+' · '+(s.duration||'?')+'초</b><p>'+esc(s.notes)+'</p><small>'+esc(s.source||'')+'</small></article>').join('')+'<div class="popup-actions"><a class="button-anchor" href="./script.html" target="_blank">인쇄 전용 대본 열기 ↗</a><a class="button-anchor" href="../docs/'+team+'_7min_RNE_script.docx" download>Word 대본 다운로드 ↓</a><button onclick="window.print()">대본 인쇄</button></div></div></div>';
}
function popupClose(){$$('.popup').forEach(x=>x.hidden=true)}
function popupOpen(id){
 popupClose();const e=$('#'+id);if(!e)return;e.hidden=false;
 if(id==='qa-popup')drawQA();
}
function curQuestion(){
 const q=D.questions?.[state.qaIndex];
 if(!q)return {group:'연구',question:'연구의 출처와 한계는?',answer:'실제 설문 자료와 학생의 해석을 분리해 설명합니다.'};
 if(Array.isArray(q))return{group:q[0],question:q[1],answer:q[2]};
 return{group:q.group||q.section||q.category||'연구',question:q.q||q.question,answer:q.a||q.answer};
}
function drawQA(){
 const total=Math.max(1,(D.questions||[]).length),q=curQuestion();
 $('#qa-count').textContent=printable(state.qaIndex+1)+' / '+total+' · '+q.group;
 $('#qa-question').textContent=q.question;$('#qa-answer').textContent=q.answer;$('#qa-answer').hidden=!state.showAnswer;
 $('#qa-reveal').textContent=state.showAnswer?'모범답안 숨기기':'모범답안 보기';
 $('#qa-rating').value=state.grades[state.qaIndex]||'';
 const scores=Object.values(state.grades),mean=scores.length?(scores.reduce((a,x)=>a+Number(x),0)/scores.length).toFixed(2):'—';
 $('#qa-summary').textContent='모의 평가 '+scores.length+'/'+total+'문항 · 평균 '+mean+'/5점 · 실제 심사위원 점수 아님';
}
function initPopup(){
 $$('.popup [data-close]').forEach(b=>b.addEventListener('click',popupClose));
 $$('.popup').forEach(box=>box.addEventListener('click',e=>{if(e.target===box)popupClose()}));
 $('#qa-previous').addEventListener('click',()=>{state.qaIndex=(state.qaIndex-1+Math.max(1,D.questions?.length||0))%Math.max(1,D.questions?.length||0);state.showAnswer=false;drawQA()});
 $('#qa-following').addEventListener('click',()=>{state.qaIndex=(state.qaIndex+1)%Math.max(1,D.questions?.length||0);state.showAnswer=false;drawQA()});
 $('#qa-reveal').addEventListener('click',()=>{state.showAnswer=!state.showAnswer;drawQA()});
 $('#qa-rating').addEventListener('change',e=>{if(e.target.value)state.grades[state.qaIndex]=e.target.value;else delete state.grades[state.qaIndex];save(storage+'-grades',state.grades);drawQA()});
}
function render(){
 const s=slides[state.index],pct=Math.round((state.index+1)/MAX*100);
 document.title=printable(state.index+1)+'/'+MAX+' '+D.teamName+' | 2026 R&E';
 $('#screen').innerHTML='<section class="slide-frame kind-'+esc(s.kind)+'"><header class="frame-head"><div class="school-line"><img src="'+badge+'" alt="포항고등학교 교표"><div><b>'+esc(D.teamName)+'</b><span>2026 POHANG HIGH SCHOOL · RESEARCH & EXPLORATION</span></div></div><span class="section-name">'+esc(s.section)+'　'+printable(state.index+1)+' / '+MAX+'</span></header>'+
 '<div class="frame-main"><div class="copy"><span class="eyebrow">'+printable(state.index+1)+' / '+printable(MAX)+' · '+esc(s.section)+'</span><h1 class="headline '+(s.title.length>37?'small-title':'')+'">'+label(s.title)+'</h1><p class="subtitle">'+esc(s.subtitle)+'</p><div class="thesis"><small>이 장면의 핵심</small><strong>'+esc(s.claim)+'</strong></div>'+(state.index===0?'<div class="cover-names"><b>참여학생</b>'+D.students.map(n=>'<span>'+esc(n)+'</span>').join('')+'</div>':'')+'</div><div class="visual">'+visual(s,team)+'</div></div>'+
 '<footer class="frame-foot"><span>'+esc(s.source||'포항고 R&E 연구자료')+'</span><div class="progress-track"><i style="width:'+pct+'%"></i></div><b>'+printable(state.index+1)+' / '+printable(MAX)+'</b></footer></section>';
 fit();
 attachInteractions();
 try{activate(s,team)}catch(e){console.warn('Animation fallback',e)}
 save(storage+'-slide',state.index);
}
function tone(kind){
 if(!state.sound||!state.audio||state.audio.state!=='running')return;
 try{const notes=kind==='intro'?[196,247,294]:kind==='end'?[196,294,392,494]:[300];notes.forEach((f,i)=>{const ctx=state.audio,now=ctx.currentTime+i*.16,osc=ctx.createOscillator(),vol=ctx.createGain();osc.type=team==='hu'?'sine':team==='cha'?'square':team==='seung'?'triangle':'sine';osc.frequency.value=f;vol.gain.setValueAtTime(.0001,now);vol.gain.linearRampToValueAtTime(.020,now+.02);vol.gain.exponentialRampToValueAtTime(.0001,now+.36);osc.connect(vol).connect(ctx.destination);osc.start(now);osc.stop(now+.38)})}catch{}
}
function change(i,send=true){
 const dest=Math.min(MAX-1,Math.max(0,i));if(dest===state.index)return;
 state.index=dest;render();tone(dest===MAX-1?'end':'step');if(send)bus?.postMessage({kind:'slide',index:dest});
}
function openPresenter(){
 const u=new URL(location.href);u.search='?presenter=1';u.hash='';
 const w=window.open(u.href,'rne-v2-'+team,'popup=yes,width=1300,height=860');
 if(!w)alert('발표자 팝업 차단을 해제해 주세요.');else setTimeout(()=>bus?.postMessage({kind:'slide',index:state.index}),350);
}
function fullscreen(){if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});else document.documentElement.requestFullscreen?.().catch(()=>{})}
function sceneStart(sound){
 state.sound=!!sound;state.startAt=Date.now();
 if(sound){try{state.audio=new (window.AudioContext||window.webkitAudioContext)();state.audio.resume()}catch{state.sound=false}}
 $('#intro')?.remove();state.index=0;render();tone('intro');bus?.postMessage({kind:'slide',index:0,start:state.startAt});
}
function keydown(e){
 if(['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName))return;
 if(e.key==='Escape'){popupClose();return}
 if($('#intro')||isPresenter)return;
 if($$('.popup:not([hidden])').length)return;
 if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();change(state.index+1)}
 if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();change(state.index-1)}
 const k=e.key.toLowerCase();
 if(k==='home')change(0);if(k==='end')change(MAX-1);
 if(k==='q'){e.preventDefault();popupOpen('qa-popup')}
 if(k==='i'){e.preventDefault();popupOpen('references-popup')}
 if(k==='n'){e.preventDefault();popupOpen('script-popup')}
 if(k==='p'){e.preventDefault();openPresenter()}
 if(k==='f'){e.preventDefault();fullscreen()}
 if(k==='m'){e.preventDefault();if(state.sound){state.sound=false;state.audio?.suspend()}else{try{state.audio ||=new (window.AudioContext||window.webkitAudioContext)();state.audio.resume();state.sound=true;tone('step')}catch{}}}
}
function landing(){
 document.body.classList.toggle('audience-mode',isAudience);
 const menu='<div class="floating-tools" role="toolbar" aria-label="발표 도구"><button id="tools-notes">대본 N</button><button id="tools-quiz">심사 Q</button><button id="tools-sources">출처 I</button><button id="tools-speaker">발표자 P</button></div>';
 $('#app').innerHTML='<div id="screen" class="screen"></div>'+menu+modalsHTML()+(!isAudience&&!demo?gateHTML():'');
 initPopup();
 $('#tools-notes').addEventListener('click',()=>popupOpen('script-popup'));
 $('#tools-quiz').addEventListener('click',()=>popupOpen('qa-popup'));
 $('#tools-sources').addEventListener('click',()=>popupOpen('references-popup'));
 $('#tools-speaker').addEventListener('click',openPresenter);
 if($('#intro')){
  $$('[data-num]').forEach(btn=>btn.addEventListener('click',()=>{state.speakers=Number(btn.dataset.num);save(storage+'-speakers',state.speakers);$$('[data-num]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)))}));
  $('#enter-silent').addEventListener('click',()=>sceneStart(false));$('#enter-sound').addEventListener('click',()=>sceneStart(true));
 }else{state.index=Number(load(storage+'-slide',0))||0;render();}
 const surface=$('#screen');let touchX=0,touchY=0;
 surface.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});
 surface.addEventListener('touchend',e=>{
  if($('#intro')||$$('.popup:not([hidden])').length)return;
  const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;
  if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.3)change(state.index+(dx<0?1:-1));
 },{passive:true}); window.addEventListener('resize',fit);window.addEventListener('keydown',keydown,true);
 bus&&(bus.onmessage=e=>{const m=e.data||{};if(m.kind==='slide'&&Number.isInteger(m.index))change(m.index,false);if(m.kind==='request')bus.postMessage({kind:'slide',index:state.index});if(m.kind==='speakers')state.speakers=m.speakers});
}
function presenter(){
 document.body.classList.add('presenter-mode');
 const src=new URL(location.href);src.search='?audience=1';src.hash='';
 $('#app').innerHTML='<div class="presenter-shell"><div class="preview-frame"><iframe title="청중 발표 화면" src="'+esc(src.toString())+'"></iframe></div><aside class="speaker-notes"><div class="speaker-top"><b>'+esc(D.teamName)+' · 발표자 화면</b><span id="speaker-clock">07:00</span></div><div class="speaker-main"><div id="speaker-info"></div><h1 id="speaker-title"></h1><p id="speaker-script"></p><div class="speaker-next"><strong>다음 장면</strong><p id="speaker-after"></p></div></div><div class="speaker-controls"><button id="p-prev">◀ 이전</button><button id="p-next">다음 ▶</button><button id="p-reset">7분 시작</button><button id="p-one">1인</button><button id="p-two">2인</button></div></aside></div>';
 state.index=load(storage+'-slide',0)||0;
 let timer=null;
 const update=()=>{const s=slides[state.index];$('#speaker-info').textContent=(state.index+1)+'/'+MAX+'장 · '+(state.speakers===2?(state.index<Math.ceil(MAX/2)?'발표자 1':'발표자 2'):'대표 발표자')+' · 권장 '+s.duration+'초';
 $('#speaker-title').textContent=s.title;$('#speaker-script').textContent=s.notes;$('#speaker-after').textContent=slides[state.index+1]?.title||'발표 종료';
 const diff=state.startAt?420-Math.round((Date.now()-state.startAt)/1000):420;$('#speaker-clock').textContent=diff<0?'+'+fmt(diff):fmt(diff);
 $('#p-one').classList.toggle('selected',state.speakers===1);$('#p-two').classList.toggle('selected',state.speakers===2);
 };
 function move(k){state.index=Math.min(MAX-1,Math.max(0,state.index+k));save(storage+'-slide',state.index);bus?.postMessage({kind:'slide',index:state.index});update()}
 $('#p-prev').addEventListener('click',()=>move(-1));$('#p-next').addEventListener('click',()=>move(1));
 $('#p-reset').addEventListener('click',()=>{state.startAt=Date.now();update()});
 $('#p-one').addEventListener('click',()=>{state.speakers=1;save(storage+'-speakers',1);bus?.postMessage({kind:'speakers',speakers:1});update()});
 $('#p-two').addEventListener('click',()=>{state.speakers=2;save(storage+'-speakers',2);bus?.postMessage({kind:'speakers',speakers:2});update()});
 window.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}});
 if(bus)bus.onmessage=e=>{const m=e.data||{};if(m.kind==='slide'&&Number.isInteger(m.index))state.index=m.index; if(m.kind==='speakers')state.speakers=m.speakers;update()};
 update();timer=setInterval(update,400);bus?.postMessage({kind:'request'});
}
if(isPresenter)presenter();else landing();
window.RNEV2={team,data:D,next:()=>change(state.index+1),go:i=>change(i),slides:MAX,start:sceneStart,current:()=>state.index,openScript:()=>popupOpen('script-popup'),openQA:()=>popupOpen('qa-popup')};
