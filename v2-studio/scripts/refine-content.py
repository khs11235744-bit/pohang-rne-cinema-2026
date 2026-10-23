# -*- coding: utf-8 -*-
import json
from pathlib import Path
root=Path.home()/'Documents'/'KHS_RNE_2026'/'MultiTeamCinema_20261023'/'v2-studio'/'data'
claims={
'shin':'정확한 정보·배려·자유로운 참여가 공정한 합의의 조건이다',
'cha':'신조어는 맥락에 맞게 이해하고 사용하는 언어문화의 일부다',
'hu':'신속한 국제공조에도 적법절차와 피해자 보호가 필요하다',
'seung':'다수의 행동은 정당성의 증거가 아니며, 공정한 규범은 함께 실천해야 한다'
}
for name,claim in claims.items():
 p=root/(name+'.json')
 d=json.loads(p.read_text('utf-8'))
 d['slides'][-1]['claim']=claim
 if name=='cha':
  s=d['slides'][7]
  s.update({
  'title':'‘혼밥’과 ‘뇌피셜’, 무엇이 남았나?',
  'subtitle':'생활어 사례와 기록이 확인된 사전 수록 신어를 구분한다',
  'claim':'새로운 표현의 실제 사용과 사전 기록을 구분해 설명한다',
  'timeline':[['생활의 새말','혼밥: 변화된 식사문화 표현'],['2016년 언론 기사','뇌피셜: 사회적 사용 관찰'],['우리말샘 기록','뇌피셜: 신어 보고서와 사전에 기록']],
  'notes':'새말의 실제 기록을 살펴보겠습니다. 혼밥은 새로운 생활 경험을 간단히 표현하는 말입니다. 그리고 뇌피셜은 정한대로의 2025년 연구에서 2016년 기사 등장과 신어 보고서·우리말샘 기록이 확인된 사례입니다. 하지만 사전에 수록되었다는 사실이 곧 표준국어대사전에 등재되었다는 뜻은 아닙니다. 이번 설문으로 실제 언어 변화의 원인을 입증한 것도 아닙니다.',
  'source':'정한대로(2025), 「기록으로 바라본 혼성어의 몇 유형」; 국립국어원 우리말샘'
  })
  d['slides'][3]['source']='‘혼밥’의 일상적 용법을 이용한 사회문화적 설명 사례'
  d['sources'].append({'name':'정한대로(2025), 기록으로 바라본 혼성어의 몇 유형',
    'url':'https://scholarworks.bwise.kr/gachon/',
    'detail':'뇌피셜의 언론 등장과 우리말샘 등 신어의 실제 기록을 살핀 학술 연구'})
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n','utf-8')
 print(name,'CLOSING_CLAIM',claim)
