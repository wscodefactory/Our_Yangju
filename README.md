# 한눈에 양주 | Our Yangju

헤매는 시간 없이, 모두가 함께하는 양주.
외국인 주민이 받은 안내를 모국어로 이해하고 바로 할 일까지 잇는 AI 생활·행정 길잡이 — 2026 양주시 미래인재 AI 공모전 12팀 프로토타입.

이 저장소는 단일 `index.html` 시안을 **Vite + React 18 + TypeScript** 프로젝트로 옮긴 것이다.
원본 단일 파일은 `legacy/index.html`에 그대로 두었다.

## 실행

```bash
npm install
cp .env.example .env     # 선택: VITE_CLAUDE_API_KEY 입력. 비우면 데모 모드
npm run dev              # http://localhost:3000  (같은 Wi-Fi 휴대폰은 Network 주소로)
npm run build            # dist/ 정적 파일
npm run preview          # 빌드 결과 미리보기 (4173)
```

- Claude API 키가 있으면(기본 모델 claude-haiku-5-5) 고지서 사진 읽기 · 공고문 규칙 추출 · 질문 분류 · zh/vi/ne 번역이 AI로 동작한다.
- 키가 없으면 **데모 모드**로 동작한다. 샘플 고지서, 예시 공고, 키워드 규칙으로 같은 흐름을 끝까지 볼 수 있다.
- `.env`는 git에 올라가지 않는다. 키는 브라우저 번들에 들어가므로 시연용으로만 쓰고, 운영 시에는 서버 프록시를 두어야 한다.
- **배포본**은 키 없이 중계 서버(`VITE_AI_PROXY`, 아래 worker/)를 거친다. 배포본에서 사진 읽기가 안 되면 Worker 쪽을 본다: 허용 출처·하루 상한(429)·Worker 비밀값. 로컬 빌드에 `VITE_AI_PROXY` 가 비어 있으면 담당자 화면(`#admin`)의 **AI 키 넣기**로 시연 기기에 키를 넣을 수 있다(그 기기 localStorage에만 저장).

## 앱처럼 쓰기 (PWA)

홈 화면 설치형 웹앱이다. `vite-plugin-pwa` 가 manifest 와 service worker 를 만들어 화면·글꼴을 기기에 캐시하고, 새 버전을 올리면 다음 실행 때 자동 갱신된다. 사진 읽기·AI 상담만 네트워크가 필요하다.

- 홈 화면 아래에 떠 있는 "홈 화면에 앱으로 추가" 배너 → [설치]. 안드로이드 크롬은 휴대폰 설치창이 바로 뜨고, 아이폰·그 밖의 브라우저는 기기별 2~3단계 안내 시트가 열린다
- 배너를 닫으면 14일 동안 안 보이고, 홈 푸터의 "앱으로 설치" 링크로 언제든 다시 연다. 설치를 마치면 다시 나오지 않는다
- 설치 후 홈 화면 아이콘으로 열면 주소창 없이 전체 화면으로 실행된다
- 아이콘은 `public/icon-*.png` (양주시 CI 심벌), 설정은 `vite.config.ts` 의 `VitePWA(...)`

## AI 중계 서버 (worker/)

배포본은 Claude 를 직접 부르지 않고 Cloudflare Worker `https://our-yangju.mikael8047.workers.dev` 를 거친다. 진짜 API 키는 Worker 비밀값에만 있고 브라우저에는 없다.

- 코드 `worker/src/index.ts`, 설정 `worker/wrangler.toml`. 경로는 앱의 Anthropic SDK 가 쓰는 `POST /v1/messages` 하나
- 막는 것: 허용 출처(배포 주소·localhost) 밖의 요청, 허용 모델 밖, 2.5MB 넘는 요청, 하루 상한(기기 150건·전체 3,000건, KV 카운터)
- Anthropic 으로는 Cloudflare AI Gateway(`our-yangju`)를 거쳐 가고, Worker 는 미국 쪽 센터에서 돌린다(placement hint). 홍콩 센터에서 직접 보내면 Anthropic 이 지역 차단(403)을 한다
- 배포: `cd worker && npx wrangler login && npx wrangler deploy`. 키 등록: `npx wrangler secret put ANTHROPIC_API_KEY`
- 앱 쪽 스위치는 `VITE_AI_PROXY`. 비우면 예전처럼 키로 직접 호출(로컬 개발·시연 기기용)

## 바로가기 주소 (QR·안내문·문자용)

서비스 주소 뒤에 붙인다. 언어를 이미 고른 사람은 그 화면이 바로 열리고, 처음 쓰는 사람은 언어를 고른 뒤 이어서 열린다. 방문 기록은 "홈 → 목적지"로 쌓여 뒤로 가기가 홈으로 간다. 읽은 뒤 주소창의 `?go=` 는 지운다.

| 주소 | 열리는 화면 |
|---|---|
| `?go=doc&from=qr` | 받은 고지서 읽기 ("고지서의 QR로 바로 들어왔어요" 표시) |
| `?go=visit&id=reg` | 시청·주민센터 업무 하나 (move, reg, nhis, kid, drive) |
| `?go=welfare` | 지원 혜택 찾기 |
| `?go=life&id=trash` | 생활 정보 하나 (sos, trash, med, bus, work) |
| `?go=explore&tab=events` | 양주 둘러보기 (events, places, food, about) |

고지서 인쇄 권장: QR 오류 복원 M 이상, 2cm 이상, 옆에 "휴대폰 카메라로 찍으면 내 언어로 고지서를 읽어 드려요"를 5개 언어로 한 줄씩. 규칙은 `src/utils/deeplink.ts`.

## PC 화면 (960px 이상)

앱은 휴대폰 폭(480px) 그대로 오른쪽에 두고, 왼쪽에 서비스 소개·핵심 기능 3개·QR 2개("휴대폰으로 열기", "고지서 QR 예시")를 보여 준다 (`components/layout/DeskPanel.tsx`). 하단 바·시트·설치 배너·AI 상담 버튼·토스트는 앱 폭 안에 맞춰 열린다. 태블릿·휴대폰에서는 앱만 보인다. 창이 1280×800 보다 크면 앱 전체를 비율대로 확대한다 (1920×1080 약 1.3배, 2560×1440 약 1.8배, 최대 2배).

## 화면 구성 (2026-10-08 디자인시스템 개편)

휴대폰 한 손 사용 기준의 모바일 웹앱. 앱 폭 480px 한 열, 밝은 테마 하나, 양주시 CI 헤더.
모든 문구는 `[ko, en, zh, vi, ne]` 다섯 칸으로 내장되어 AI 키 없이 5개 언어가 즉시 바뀐다.

1. **언어 선택** (첫 실행) — 이후에는 헤더 지구본 아이콘 → 시트
2. **홈** — 서비스 소개(히어로) → 할 수 있는 일 4가지(시청·주민센터 업무 / 받은 고지서 읽기 / 지원 혜택 찾기 / 생활 정보) → 양주 둘러보기(행사·명소·소개)
3. **시청과 주민센터 업무** — 목록 → 상세(장소·기한·준비물 체크리스트) + 하단 바 [1345 전화] [창구 직원에게 보여주기(한국어 전체 화면)]
4. **받은 고지서 읽기** — 사진 → 기기에서 가림 → 가린 이미지만 AI 전송 → 내용 확인(세목·금액·기한·전자납부번호·가상계좌) → 결과(요약 카드 + 탭: 납부 방법 / 자주 묻는 질문 / 상담) + 하단 [위택스에서 납부하기]. 샘플 고지서·직접 입력 경로도 있음
5. **지원 혜택 찾기** — 대상 칩 → 단계 탭 → 혜택 카드(북마크) → 상세 탭(자격 확인 / 준비물 / 신청 방법) + 하단 [저장] [문의 메모]
6. **생활 정보** — 긴급 전화(tel: 링크), 쓰레기, 아플 때, 교통, 일터
7. **AI 상담** — 오른쪽 아래 플로팅 버튼 하나. 한 문장 → 볼 화면 추천 (Claude 있으면 AI, 없으면 5개 언어 키워드 규칙)
8. **내 정보** — 앱 바의 사람 아이콘(홈에는 아직 안 넣었을 때 안내 카드). "체류지 신고에 쓰여요"(비자·사는 곳·이사한 날·거주 형태·가족 동거)와 "고지서 납부에 쓰여요"(건강보험 납부 방식·차·은행 앱)로 나눠 묻고 고르는 즉시 휴대폰에만 저장(`hy-profile`). 넣으면 이사 신고에 D-day 띠와 관할 행정복지센터·지도, 가족 서류가 붙고, 업무 상세의 "내 상황"이 자동으로 채워지며, 결과 화면은 내 은행 앱 이름과 건강보험·자동차세 안내를 더한다. 화면 아래 "이 정보로 바뀐 안내"가 달라진 것을 모아 보여 준다. 이름·번호·계좌는 받지 않는다. 맨 아래 작은 링크로 내 정보만 지우거나 앱 데이터 전부(언어 제외)를 지운다
9. **담당자 화면** — 시민 화면에서 분리. `#admin` 해시로만 진입 (공고 → 규칙 초안 → 근거 대조 → 게시 / 창구 모드 / 번역 검수 / 시연 기기 AI 키 입력 — 중계 서버 빌드에서는 숨김)

하위 화면 앱 바에는 집 모양 홈 버튼이 있어 어디서든 한 번에 홈으로 간다(열린 시트까지 닫고 방문 기록도 정리). 화면을 바꿀 때는 그리기 전에 맨 위로 스크롤하고(useLayoutEffect), 스크롤바 자리를 항상 비워 PC 에서 앱이 좌우로 흔들리지 않게 한다.

## 코드 구조

전체 폴더 구조와 데이터 흐름은 [프로젝트_구조.md](프로젝트_구조.md) 에 따로 정리했다.

```
src/
├─ main.tsx / App.tsx           진입점, Provider 조립 (App → Doc → Guide), 앱 바·하단 바·FAB·시트·토스트
├─ styles/global.css            양주시 디자인시스템(Yangju DS) 토큰·컴포넌트 CSS. 참고용 html의 <style> 그대로
├─ i18n.ts                      tx/t(5개 언어 문구), Intl 날짜·금액 서식, 로캘 폴백, 누락 번역 점검
├─ data/content.ts              모든 문구와 콘텐츠 (UI 사전, VISIT, LIFE, BEN, EVENTS, PLACES, FAQ, INTENTS, SAMPLE …)
├─ data/admin.ts                담당자 화면 시연 데이터
├─ data/knowledge.ts            AI 상담 근거 문서 18건 (출처 링크·이동 화면 포함)
├─ data/events.ts, events.json  행사·공고. json 은 scripts/fetch-events.mjs 가 시청 게시판에서 자동 수집·번역(없으면 content.ts 의 정적 목록)
├─ data/easy-ko.json            쉬운 한국어 문구 (scripts/gen-easy-ko.mjs 가 생성한 AI 초안)
├─ types/index.ts               DocInfo · Screen(내비게이션 스택 유니온) · 담당자 화면 타입
├─ context/AppContext.tsx       언어 · 큰 글씨 · 저장 혜택 · 내비 스택(history 연동) · 시트 · 토스트
├─ context/DocContext.tsx       고지서 흐름 상태 (캔버스·가림·DocInfo)
├─ context/GuideContext.tsx     AI 상담 대화 (INTENTS 규칙 → knowledge.ts 근거 문서로만 답하는 Claude → 모르면 1345 안내)
├─ components/layout/Chrome.tsx AppBar · Title · BottomBar · Fab · Footer · Sheet · Toast
├─ components/layout/Overlays.tsx 언어 시트 · AI 상담 · 고지서 원본 · 문의 메모 · 직원용 전체 화면 · 홈 화면 추가 안내(InstallSheet)
├─ components/layout/DeskPanel.tsx PC(960px 이상) 왼쪽 소개·QR 패널 (qrcode)
├─ components/ui/               Ic(Lucide 아이콘 맵) · Bits(Seg·Checklist·RowBtn·배지·Callout) · LangOptions
├─ screens/                     Home · Lang · Explore · Saved · Profile(내 정보·데이터 초기화) · visit/ · life/ · doc/ · welfare/ · admin/
├─ services/ai.ts, prompts.ts   Claude 호출 (@anthropic-ai/sdk) (고지서 읽기 · 가릴 곳 찾기 · 근거 답변 · 통역 · 공고 규칙 추출)
└─ utils/                       browser(저장소·음성·복사) · sampleNotice(가상 고지서·가림) · pii(주민번호 감지) · calendar(.ics) · review(번역 검수) · deeplink(?go= 바로가기) · profile(내 정보·초기화) · rule(담당자)
scripts/                        fetch-events(행사 수집, 배포 때 매일 06:00 실행) · gen-easy-ko · eval-notices(고지서 인식 정확도, tests/notices)
legacy/v1/                      개편 전 화면·데이터 (참고용, 빌드에 포함되지 않음)
요청사항/                        리서치·디자인 문서 (프로토타입 문구, 디자인시스템, UI/UX 개선 방향, 참고용 html)
```

## 브라우저 점검 (tests/e2e)

헤드리스 크롬으로 실제 화면을 눌러 보는 점검. `npm run e2e` 가 빌드본(dist)을 preview 로 띄우고 `tests/e2e/*.test.mjs` 를 차례로 돌린다. 먼저 `npx vite build`.

- `smoke` — 5개 언어 × 주요 화면 113개: 페이지 오류, 가로 스크롤, 외국어 화면의 한글 누수
- `flows` — 바로가기 주소 6종, 홈 버튼, 설치 배너·안내 시트, 업무 상황 선택, 목록 높이(ko·vi·ne), 혜택 검색, 내 정보 → 이사 신고 D-day·관할 센터·결과 화면
- `pc` — 1024~2560px 에서 소개 패널·확대 배율·고정 요소 정렬
- `live` — 배포본에서 실제 AI 호출(돈이 들어 따로): `E2E_URL=https://wscodefactory.github.io/Our_Yangju/ npm run e2e -- live`

크롬 경로가 다르면 `CHROME_PATH`, 하나만 돌리려면 `npm run e2e -- flows`. 스크린샷은 `tests/e2e/shots/`.

## 원칙

- AI는 세액·자격을 판정하지 않는다. 인쇄된 금액·기한을 읽기만 하고, 원본 고지서 확인을 안내한다.
- 원본 사진은 기기 밖으로 나가지 않는다. 사용자가 가린 이미지만 전송하고 문서·질문 원문은 저장하지 않는다.
- 납부 링크는 공식 주소(위택스)만 쓴다.
- 업무 안내는 일반 법령 기준 예시이며 양주시 창구별 접수 범위는 확인 중이다. 중국어·베트남어·네팔어 문구는 내장 번역(팀 작성)으로 원어민·1345 통번역 인력 검수 전이다.

## 다음 개발

- [ ] 흐림·불확실 값 재촬영 안내, 기한 경과·복수 금액 상담 전환, 확인 전 납부 연결 보류
- [x] 고지서 인식 테스트셋 `npm run eval:notices` (2026-10-13, 샘플 1장) · [ ] 실제 고지서 3~5장 추가
- [x] 중·베·네 문구 고정 번역 내장 (2026-10-08) · [x] 담당자 화면 "번역 검수" 탭 (2026-10-13) · [ ] 원어민 검수 반영
- [x] AI 상담 근거 답변(2026-10-13) · [ ] 근거 문서를 시청 공고로 확장
- [ ] 담당자 게시 혜택 공유 저장소(서버) 연결
- [x] Claude 호출 서버 프록시화 (2026-10-14, Cloudflare Worker + AI Gateway) · [ ] 담당자 게시 혜택 서버 저장
