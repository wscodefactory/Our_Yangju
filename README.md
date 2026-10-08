# 한눈에 양주 | Our Yangju

헤매는 시간 없이, 모두가 함께하는 양주.
외국인 주민이 받은 안내를 모국어로 이해하고 바로 할 일까지 잇는 AI 생활·행정 길잡이 — 2026 양주시 미래인재 AI 공모전 12팀 프로토타입.

이 저장소는 단일 `index.html` 시안을 **Vite + React 18 + TypeScript** 프로젝트로 옮긴 것이다.
원본 단일 파일은 `legacy/index.html`에 그대로 두었다.

## 실행

```bash
npm install
cp .env.example .env     # 선택: VITE_GEMINI_API_KEY 입력. 비우면 데모 모드
npm run dev              # http://localhost:3000  (같은 Wi-Fi 휴대폰은 Network 주소로)
npm run build            # dist/ 정적 파일
npm run preview          # 빌드 결과 미리보기 (4173)
```

- Gemini 키가 있으면 고지서 사진 읽기 · 공고문 규칙 추출 · 질문 분류 · zh/vi/ne 번역이 AI로 동작한다.
- 키가 없으면 **데모 모드**로 동작한다. 샘플 고지서, 예시 공고, 키워드 규칙으로 같은 흐름을 끝까지 볼 수 있다.
- `.env`는 git에 올라가지 않는다. 키는 브라우저 번들에 들어가므로 시연용으로만 쓰고, 운영 시에는 서버 프록시를 두어야 한다.
- **공유 링크(배포본)에서 사진 읽기가 안 보이면** 빌드 때 `.env`에 키가 없었던 것이다. `npm run build`를 키가 든 `.env`로 다시 돌리거나, 배포본의 "받은 문서 찍기" 화면에서 **AI 키 넣고 사진 읽기 켜기**로 시연 기기에 키를 한 번 넣는다(그 기기 localStorage에만 저장).

## 화면 구성 (2026-10-08 디자인시스템 개편)

휴대폰 한 손 사용 기준의 모바일 웹앱. 앱 폭 480px 한 열, 밝은 테마 하나, 양주시 CI 헤더.
모든 문구는 `[ko, en, zh, vi, ne]` 다섯 칸으로 내장되어 AI 키 없이 5개 언어가 즉시 바뀐다.

1. **언어 선택** (첫 실행) — 이후에는 헤더 지구본 아이콘 → 시트
2. **홈** — 서비스 소개(히어로) → 할 수 있는 일 4가지(시청·주민센터 업무 / 받은 고지서 읽기 / 지원 혜택 찾기 / 생활 정보) → 양주 둘러보기(행사·명소·소개)
3. **시청과 주민센터 업무** — 목록 → 상세(장소·기한·준비물 체크리스트) + 하단 바 [1345 전화] [창구 직원에게 보여주기(한국어 전체 화면)]
4. **받은 고지서 읽기** — 사진 → 기기에서 가림 → 가린 이미지만 AI 전송 → 내용 확인(세목·금액·기한·전자납부번호·가상계좌) → 결과(요약 카드 + 탭: 납부 방법 / 자주 묻는 질문 / 상담) + 하단 [위택스에서 납부하기]. 샘플 고지서·직접 입력 경로도 있음
5. **지원 혜택 찾기** — 대상 칩 → 단계 탭 → 혜택 카드(북마크) → 상세 탭(자격 확인 / 준비물 / 신청 방법) + 하단 [저장] [문의 메모]
6. **생활 정보** — 긴급 전화(tel: 링크), 쓰레기, 아플 때, 교통, 일터
7. **AI 상담** — 오른쪽 아래 플로팅 버튼 하나. 한 문장 → 볼 화면 추천 (Gemini 있으면 AI, 없으면 5개 언어 키워드 규칙)
8. **담당자 화면** — 시민 화면에서 분리. `#admin` 해시로만 진입 (공고 → 규칙 초안 → 근거 대조 → 게시 / 창구 모드)

## 코드 구조

```
src/
├─ main.tsx / App.tsx           진입점, Provider 조립 (App → Doc → Guide), 앱 바·하단 바·FAB·시트·토스트
├─ styles/global.css            양주시 디자인시스템(Yangju DS) 토큰·컴포넌트 CSS. 참고용 html의 <style> 그대로
├─ i18n.ts                      tx/t(5개 언어 문구), Intl 날짜·금액 서식, 로캘 폴백, 누락 번역 점검
├─ data/content.ts              모든 문구와 콘텐츠 (UI 사전, VISIT, LIFE, BEN, EVENTS, PLACES, FAQ, INTENTS, SAMPLE …)
├─ data/admin.ts                담당자 화면 시연 데이터
├─ types/index.ts               DocInfo · Screen(내비게이션 스택 유니온) · 담당자 화면 타입
├─ context/AppContext.tsx       언어 · 큰 글씨 · 저장 혜택 · 내비 스택(history 연동) · 시트 · 토스트
├─ context/DocContext.tsx       고지서 흐름 상태 (캔버스·가림·DocInfo)
├─ context/GuideContext.tsx     AI 상담 대화 (Gemini → INTENTS 규칙 폴백)
├─ components/layout/Chrome.tsx AppBar · Title · BottomBar · Fab · Footer · Sheet · Toast
├─ components/layout/Overlays.tsx 언어 시트 · AI 상담 · 고지서 원본 · 문의 메모 · 직원용 전체 화면
├─ components/ui/               Ic(Lucide 아이콘 맵) · Bits(Seg·Checklist·RowBtn·배지·Callout) · LangOptions
├─ screens/                     Home · Lang · Explore · Saved · visit/ · life/ · doc/ · welfare/ · admin/
├─ services/ai.ts, prompts.ts   Gemini 호출 (고지서 읽기 · 공고 규칙 추출 · 상담 분류)
└─ utils/                       browser(저장소·음성·복사) · sampleNotice(가상 고지서·가림) · rule(담당자)
legacy/v1/                      개편 전 화면·데이터 (참고용, 빌드에 포함되지 않음)
요청사항/                        리서치·디자인 문서 (프로토타입 문구, 디자인시스템, UI/UX 개선 방향, 참고용 html)
```

## 원칙

- AI는 세액·자격을 판정하지 않는다. 인쇄된 금액·기한을 읽기만 하고, 원본 고지서 확인을 안내한다.
- 원본 사진은 기기 밖으로 나가지 않는다. 사용자가 가린 이미지만 전송하고 문서·질문 원문은 저장하지 않는다.
- 납부 링크는 공식 주소(위택스)만 쓴다.
- 업무 안내는 일반 법령 기준 예시이며 양주시 창구별 접수 범위는 확인 중이다. 중국어·베트남어·네팔어 문구는 내장 번역(팀 작성)으로 원어민·1345 통번역 인력 검수 전이다.

## 다음 개발

- [ ] 흐림·불확실 값 재촬영 안내, 기한 경과·복수 금액 상담 전환, 확인 전 납부 연결 보류
- [ ] 실제 고지서 3~5장 인식 테스트(정답률 기록)
- [x] 중·베·네 문구 고정 번역 내장 (2026-10-08) · [ ] 원어민 검수 반영
- [ ] 담당자 게시 혜택 공유 저장소(서버) 연결
- [ ] Gemini 호출 서버 프록시화
