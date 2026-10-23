# -*- coding: utf-8 -*-
from pathlib import Path
root=Path.home()/'Documents'/'KHS_RNE_2026'/'MultiTeamCinema_20261023'/'v2-studio'
p=root/'src'/'visuals.js'
s=p.read_text('utf-8')
start=s.index(" if(k==='case')return")
end=s.index("\n if(k==='method')return",start)
new=""" if(k==='case'){
  if(team==='cha')return '<div class="cha-case-story"><div class="cha-explain">새로운 생활방식의 언어</div><div class="cha-word-pair"><span>혼자 밥을 먹다</span><strong>혼밥</strong></div><div class="cha-process-pills"><span>경험</span><span>표현</span><span>공유</span></div><p>신어의 필요를 설명하는 사례. 사전 표제어의 검증은 뒤 장면에서 분리해 설명합니다.</p></div>';
  if(team==='shin')return '<div class="shin-dilemma"><div class="shin-dilemma-title">만약 친구의 사정이 어렵다면?</div><div class="shin-choices"><article><span>01</span><strong>똑같이 부담</strong><p>평등한 금액</p></article><article><span>02</span><strong>사정을 고려</strong><p>필요에 따른 분담</p></article><article><span>03</span><strong>함께 협의</strong><p>자유로운 합의</p></article></div><div class="shin-dilemma-note">배려는 ‘다른 사람의 추가 부담’을 강요할 면허가 아닙니다.</div></div>';
  if(team==='seung')return '<div class="seung-asch-demo"><div class="seung-line-note">애쉬의 선 길이 판단 실험 · 원실험을 단순화한 재구성</div><div class="seung-lines"><div class="seung-reference"><small>기준선</small><i></i><b>?</b></div><div class="seung-answer-options"><div><small>A</small><i></i></div><div><small>B</small><i></i></div><div><small>C</small><i></i></div></div></div><p>다수가 같은 답을 말해도 자신의 관찰과 비교해 판단해야 합니다.</p></div>';
  return '<div class="case-file"><div class="case-label">CASE FILE / EVIDENCE</div><h3>'+esc(slide.claim)+'</h3><div class="case-facts">'+(slide.caseFacts||[['조사 대상','실제 사건']]).map(v=>'<p><small>'+esc(v[0])+'</small><strong>'+esc(v[1])+'</strong></p>').join('')+'</div><div class="case-warning">실제 사건과 가상 사례는 구분하여 설명합니다.</div></div>';
 }
"""
s=s[:start]+new+s[end:]
old="d3.selectAll('.slide-frame .step-item').style('opacity',.06).transition().duration(650).delay((d,i)=>i*160).style('opacity',1)"
s=s.replace(old,"d3.selectAll('.slide-frame .step-item').style('opacity',1).transition().duration(540).delay((d,i)=>i*100).style('box-shadow','0 0 12px #dfa36f77')")
p.write_text(s,'utf-8')
print('CASE_FORKS',s.count("team==='cha'"),'D3_DIM_REMOVED',".style('opacity',.06)" not in s)
