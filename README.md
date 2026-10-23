# 포항고 2026 인문사회 R&E · 네 팀 시네마틱 발표

## 공개 사이트

- 통합 홈: https://pohang-rne-cinema-2026.khs11235744.workers.dev/
- **개편판 V2:** https://pohang-rne-cinema-2026.khs11235744.workers.dev/v2/
- 신진욱: /v2/shin/ (18장)
- 차민혁: /v2/cha/ (19장)
- 허준완: /v2/hu/ (19장)
- 신승연: /v2/seung/ (18장)

각 팀의 `/v2/<team>/script.html`에서 전체 발표 대본·예상 질문·답안을 열람·인쇄할 수 있습니다. `/v2/docs/<team>_7min_RNE_script.docx`에서 Word 대본을 내려받습니다.

## 새 버전의 학술 발표 구성

- 18~19장, 학생 발표 기준 420초(7분) 목표
- 연구 질문/실제 사례 → 학자·개념 → 학생 설문 결과 → 비판적 해석 → 결론
- **설문 기간은 본편에서 생략**, 원래 조사 기록은 보존
- 각 슬라이드의 주장·근거·장면별 발표 대본 독립 표시
- 1인 또는 2인 모드, 대본 인쇄, STAT 질문·답변 연습
- 사진은 보유한 이용조건 검토 자료에서 사용하며 `v2-studio/public/assets/credits.json`에 저작정보 보존
- 원본 응답의 통계 범위와 분모를 왜곡하거나 청소년 전체로 일반화하지 않음

## 팀별 성격

| 팀 | 테마 | 자료 범위 | 특화 연출 |
|---|---|---:|---|
| 신진욱 | 따뜻한 공정성 연구 장부 | 동의 106건 · 중복 의심 3쌍 | 영수증 분담 선택·이론과 통계 |
| 차민혁 | 네온 언어 포스터·키네틱 타이포그래피 | 102건 잠정 | 신조어 모션, 혼밥·뇌피셜 등 사전 기록 사례 |
| 허준완 | 국제 수사 사건파일·동판의 증거도 | 1학년 동의 108건 | 관할권·거래흔적·전자증거 흐름 D3 모션 |
| 신승연 | 학교생활 필드노트 | 동의 99건 · 문항별 유효N 상이 | PixiJS 급식 줄 선택형 시뮬레이션 |

기존 구버전은 `/shin/`, `/cha/`, `/hu/`, `/seung/` 경로에 남겨 두어 비교할 수 있습니다. 기존 R&E 스튜디오 Worker는 수정하지 않았습니다.

## 개발 구조

- `v2-studio/src/main.js` 웹 발표 엔진(프레젠터, 키보드, 소리, 질문·대본)
- `v2-studio/src/visuals.js` 주제별 화면, D3·PixiJS·Anime.js·ECharts
- `v2-studio/src/themes.css` **4개 별도 비주얼 시스템**
- `v2-studio/data/*.json` 근거와 발표 대본이 있는 편집 가능한 슬라이드 구조
- `v2-studio/public/assets/portraits/` 원전·사진 출처를 확인한 학자 초상 이미지
- `v2-studio/public/docs/*.docx` 학생용 Word 발표 대본
- `v2-studio/scripts/prepare.py`, `export_docx.py` 논문 데이터·7분 대본 문서 출력
- `v2-studio/qa/check-data.mjs`, `smoke.mjs` 문서 구조·화면 동기화 자동 검증
- `site/v2/` 공개 정적 빌드
- `site/index.html` 개편판 허브, `site/legacy-hub.html` 구버전 허브

## 실행·배포

```powershell
cd v2-studio
npm ci
npm run check
npm run build
node qa/smoke.mjs
cd ..
wrangler deploy --config wrangler.jsonc
```

처음 만드는 보고서가 아니라 기존 세 팀의 설문 자료와 신승연팀 최신 99건 연구를 기반으로 편집한 발표입니다. 그러나 실제 고등학생 발표속도와 심사 결과는 리허설·심사를 거쳐야 하며, **95점은 목표이지 보장된 평가가 아닙니다.**
