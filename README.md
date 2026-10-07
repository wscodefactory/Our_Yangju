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

## 화면 구성

1. **내 언어 선택** — 한국어 · English · 中文 · Tiếng Việt · नेपाली (첫 방문 시)
2. **용건 선택(홈)** — 시청·주민센터에 왔어요 / 받은 종이가 있어요 / 양주에서 살기, 하단에 행사·소개
3. **행정 업무 6종 카드** — 어디서 · 언제까지 · 가져갈 것 + 창구에 보여줄 한국어 한 줄, 읽어주기
4. **고지서 할 일 카드** — 사진(또는 샘플) → 기기에서 개인정보 가림 → 가린 이미지만 AI 전송 → 금액·기한 확인 → 내 언어 할 일 카드 → 추가 질문(지방세 시나리오 20종) → 상담 연결(1345 · 한국어 메모)
5. **복지 혜택** — 누구 → 생애 단계 → 혜택 → 받을 수 있나요?(예/아니오 사전 확인) → 준비물 → 신청, 내 혜택 담기
6. **담당자 화면(시연)** — 공고문 붙여넣기 → 규칙 초안 → 근거 문장 형광펜 대조 → 전부 확인 후 게시 / 사각지대 신호 / 창구 모드(주민 언어 ↔ 한국어 나란히)
7. **양주무관** — 한 문장으로 상황을 말하면 볼 단계를 추천하고, 담당자에게 보낼 한국어 문의문 초안을 만들어 준다

## 코드 구조

```
src/
├─ main.tsx / App.tsx          진입점, Provider 조립 (App → Doc → Guide)
├─ styles/global.css           원본 <style> 3블록을 그대로 합친 전역 스타일
├─ types/index.ts              Benefit · Stage · Screen(내비게이션 스택 유니온) 등 공용 타입
├─ data/                       정적 데이터. 문구는 전부 [ko, en] 쌍
│  ├─ ui.ts                    공통 문구
│  ├─ benefits.ts              청년 생애 단계별 혜택, 그룹
│  ├─ info.ts                  양주 소개 · 행사 · 명소 · 맛집 · 인증, 외부 링크, 출처 문구
│  ├─ tax.ts                   카드 언어(ko/en/zh/vi/ne) 문구, 지방세 시나리오 20종, 예시 공고
│  ├─ civic.ts                 행정 업무 6종, 양주에서 살기, 양주무관 추천 문장·키워드 규칙
│  └─ icons.tsx                SVG 아이콘
├─ context/
│  ├─ AppContext.tsx           UI 언어 · 카드 언어 · 큰 글씨 · 내비 스택 · 내 혜택 · 게시 혜택 · 토스트
│  ├─ DocContext.tsx           고지서 흐름: 캔버스 · 가린 영역 · 읽은 결과
│  └─ GuideContext.tsx         양주무관 대화 (AI → 실패 시 키워드 규칙)
├─ hooks/useTranslate.ts       zh/vi/ne 화면 문구 번역 + 세션 캐시
├─ services/
│  ├─ ai.ts                    AiProvider 인터페이스 + GeminiProvider. 다른 모델로 바꾸려면 여기만
│  ├─ prompts.ts               프롬프트 전부
│  └─ benefitsStore.ts         담당자 게시 혜택 저장소 (지금은 localStorage, 서버 붙이면 교체)
├─ utils/                      언어 선택 · 날짜/금액 포맷 · 샘플 고지서 그리기 · 가림 · 규칙 하이라이트
├─ components/
│  ├─ layout/                  Header · Crumb · Chrome(GuideButton · DemoNote · Toast)
│  ├─ ui/                      Tile(Tile · Grid · Stack) · WideButton · BenefitTile · LangRow · Tr(번역 텍스트)
│  │                           Cards(InfoCard · ResultBox) · Notes(Note · Hint · SourceLine · ForeignNote)
│  │                           Status(Legend · Thinking · AiModeBadge · CheckItemRow)
│  └─ guide/GuideSheet.tsx     양주무관 채팅 시트
└─ screens/                    화면 하나 = 파일 하나
   ├─ ScreenRouter.tsx         Screen → 화면 컴포넌트
   ├─ LangScreen / HomeScreen
   ├─ welfare/                 Welfare → Group → Stage → Item → Quiz → Docs → Apply, Mine, Soon
   ├─ info/                    About · AboutItem · Events · Event(+EventStatusTag) · Local · Places · Eats · Cert · CertItem
   ├─ doc/                     Doc → Mask → Reading → Confirm / Manual(useConfirm) → Card → TaxQ → Counsel
   ├─ admin/                   AdminScreen(혜택 등록 · 사각지대 신호) · RegisterPanel · CounterScreen
   └─ visit/                   Visit → Task, Life → LifeItem
legacy/index.html              원본 단일 파일 시안 (claude.ai 아티팩트용)
```

라우터 라이브러리 없이 `AppContext`의 `nav: Screen[]` 스택으로 화면을 오간다. 원본도 자체 스택이었고 시연용이라 URL이 바뀔 필요가 없어 그대로 두었다.

### 원본과 달라진 점

| 원본 (index.html) | React 버전 |
|---|---|
| `window.claude.use('sample')` | `services/ai.ts` — `.env`에 키가 있으면 Gemini(`gemini-2.5-flash`), 없으면 데모 모드 |
| `window.claude.use('db')` 공유 저장소 | `services/benefitsStore.ts` — 이 기기 localStorage |
| nav 항목에 끼워 넣던 임시 상태(퀴즈 답, 공고문 입력) | 각 화면의 로컬 state |
| `EXT[화면]` / `ACT[동작]` 확장 훅으로 덧씌운 스크립트 3묶음 | 화면별 컴포넌트와 컨텍스트로 분리 |

브라우저 저장 키(`hy-lang`, `hy-cl`, `hy-mine`, `hy-newb`)는 원본과 같다.

## 원칙

- AI는 세액·자격을 판정하지 않는다. 인쇄된 금액·기한을 읽기만 하고, 원본 고지서 확인을 안내한다.
- 원본 사진은 기기 밖으로 나가지 않는다. 사용자가 가린 이미지만 전송하고 문서·질문 원문은 저장하지 않는다.
- 납부 링크는 공식 주소(위택스)만 쓴다.
- 업무 안내는 일반 법령 기준 예시이며 양주시 창구별 접수 범위는 확인 중이다. 중국어·베트남어·네팔어 문구는 AI 초안으로 원어민 검토 전이며, 화면에도 그렇게 표시한다.

## 다음 개발

- [ ] 흐림·불확실 값 재촬영 안내, 기한 경과·복수 금액 상담 전환, 확인 전 납부 연결 보류
- [ ] 실제 고지서 3~5장 인식 테스트(정답률 기록)
- [ ] 중·베·네 메뉴 문구 고정 번역(원어민 검토 반영)
- [ ] 담당자 게시 혜택 공유 저장소(서버) 연결
- [ ] Gemini 호출 서버 프록시화
