# 한눈에 양주 | Our Yangju

**한국어** | [English](README.en.md)

헤매는 시간 없이, 모두가 함께하는 양주.

외국인 주민이 행정 안내와 고지서를 자신의 언어로 이해하고, 준비물 확인·납부 안내·상담까지 이어갈 수 있도록 만든 **2026 양주시 미래인재 AI 공모전 12팀 프로토타입**입니다.

단일 HTML 시안을 **React 18 + TypeScript + Vite**로 옮겼으며, Claude 연동과 Cloudflare Worker 중계 서버를 포함합니다. 원본은 `legacy/index.html`, 개편 전 React 화면은 `legacy/v1/`에 보관되어 있습니다.

## 주요 기능

| 화면 | 현재 구현 |
| --- | --- |
| 언어·접근성 | 한국어·영어·중국어·베트남어·네팔어, 큰 글씨, 쉬운 한국어, 지원 기기의 음성 읽기 |
| 시청·주민센터 업무 | 업무별 장소·기한·준비물, 상황별 체크리스트, 공식 사이트, 1345 연결, 직원에게 보여주는 한국어 전체 화면 |
| 받은 고지서 읽기 | 사진 선택 → 개인정보 가리기 → 내용 읽기 → 금액·기한 등 확인·수정 → 납부·질문·상담 안내. 샘플과 직접 입력도 지원 |
| 고지서 결과 | 가상계좌 이체 순서, 계좌·금액 복사, 위택스 연결, 납기 경과 표시, 달력 파일 다운로드, 선택한 납부 기록 저장 |
| 지원 혜택 찾기 | 대상·단계별 목록, 검색, 자격 사전 확인, 준비물·신청 방법, 혜택 저장, 문의 메모 |
| 생활·지역 정보 | 긴급 전화, 쓰레기·의료·교통·일터 안내, 행사·명소·음식·양주 소개 |
| AI 상담 | 다국어 키워드로 화면 추천. 규칙에 없는 질문은 내장 근거 문서를 Claude에 제공하고 근거가 있는 답변만 표시 |
| 내 정보 | 비자·읍면동·이사일·거주 형태·가족·건강보험 납부 방식·차·은행 앱 저장, 업무 안내에 반영, 데이터 초기화 |
| 담당자 화면 | `#admin`으로 진입. 공고 규칙 초안·원문 대조·기기 내 게시, 사각지대 예시, 번역 검수 상태, 창구 통역 |

시민 화면의 기본 문구는 5개 언어로 내장되어 별도 AI 호출 없이 바뀝니다. 담당자 전용 문구는 주로 한국어·영어이며, 번역되지 않은 수집 행사는 다른 언어에서도 한국어로 표시될 수 있습니다.

## 로컬 실행

Node.js **22.12 이상**과 npm을 권장합니다. GitHub Actions는 Node.js 22를 사용합니다.

Windows PowerShell 기준:

```powershell
Set-Location 'E:\Yangju\HtmltoReactClaude'
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

- 개발 서버: `http://localhost:3000/`. 포트가 사용 중이면 다른 포트로 옮기지 않고 종료합니다.
- 같은 네트워크의 휴대폰에서는 터미널에 표시되는 Network 주소로 기본 화면을 확인할 수 있습니다. 기본 Worker 허용 출처에는 로컬 IP 주소가 없으므로 AI 호출에는 별도 출처 설정이 필요합니다.
- `.env` 수정 후 개발 서버를 다시 시작하세요. 빌드본에는 다시 빌드해야 반영됩니다.

| 명령 | 동작 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run build` | 타입 검사 후 `dist/`에 정적 파일 생성 |
| `npm run preview` | 빌드 결과 확인, 기본 포트 4173 |
| `npm run e2e` | 기존 `dist/`를 대상으로 브라우저 점검 실행 |
| `npm run events` | 시청 행사 수집, 키가 있으면 새 항목 번역 |
| `npm run eval:notices` | 실제 Claude API로 고지서 테스트셋 평가 |

### AI 연결과 데모 모드

`src/services/ai.ts`는 다음 순서로 연결을 선택합니다.

1. `VITE_AI_PROXY`가 있으면 Worker를 사용합니다.
2. 없으면 `VITE_CLAUDE_API_KEY`로 직접 호출합니다.
3. 환경 변수 키도 없으면 담당자 화면에서 해당 브라우저에 저장한 키를 사용합니다.
4. 모두 없으면 AI 없이 샘플·직접 입력·키워드 규칙을 사용합니다.

**`.env.example`에는 중계 서버 주소가 기본으로 들어 있습니다. API 키만 비워서는 데모 모드가 되지 않습니다.** 중계 서버 사용 시에도 서버 쪽 API 비용과 호출 한도가 적용됩니다.

AI 호출 없이 시연하려면 `.env`를 아래처럼 설정하고, 이전에 담당자 화면에서 키를 넣었다면 내 정보의 앱 데이터 초기화로 저장한 키도 지워 주세요. 초기화하면 언어를 제외한 다른 앱 저장값도 삭제됩니다.

```dotenv
VITE_AI_PROXY=
VITE_CLAUDE_API_KEY=
VITE_CLAUDE_MODEL=claude-haiku-5-5
```

| 설정 | 용도 |
| --- | --- |
| `VITE_AI_PROXY` | Worker 기본 주소. 예제 값은 `https://our-yangju.mikael8047.workers.dev` |
| `VITE_CLAUDE_API_KEY` | 브라우저 직접 호출 또는 로컬 수집·평가 스크립트에서 사용하는 키 |
| `VITE_CLAUDE_MODEL` | 저장소의 기본 설정값은 `claude-haiku-5-5`. Worker 사용 시 허용 모델 목록과 일치해야 함 |

모델 이름은 코드의 설정값을 설명한 것이며, 실제 사용 가능 여부는 연결한 API 환경에서 확인해야 합니다. AI가 없거나 고지서 읽기가 실패하면 직접 입력으로, 상담 근거를 찾지 못하면 추가 설명·1345 안내로 이어집니다. 창구의 실시간 번역에는 AI 연결이 필요합니다.

직접 호출용 `VITE_` 키는 브라우저 번들에 포함됩니다. 담당자 화면의 키도 해당 브라우저 `localStorage`에 저장됩니다. 공개 배포에는 키를 넣지 말고 Worker 방식을 사용하세요. `.env`는 Git 제외 대상입니다.

## 사진·질문 전송과 저장 범위

**고지서 읽기와 ‘AI 가릴 곳 찾기’는 전송하는 이미지가 다릅니다.**

- **직접 가리기 → 읽기:** 기기에서 검은 상자를 이미지 픽셀에 적용한 뒤, 가린 이미지를 Claude에 전송합니다.
- **AI 가릴 곳 찾기:** `MaskScreen.tsx`가 가리기 전 캔버스의 긴 변 640px JPEG 사본을 전송해 위치를 받습니다. 이미 그려 놓은 가림 상자도 이 요청에는 적용되지 않습니다. 현재 코드는 축소·JPEG 변환만 하며 별도 흐림 처리를 하지 않으므로, 저해상도라도 개인정보가 포함될 수 있습니다.
- **상담·공고·통역:** 규칙으로 처리하지 못한 상담 질문, 담당자가 입력한 공고문, 통역할 발화 텍스트가 AI 요청에 포함됩니다. 고지서 결과의 FAQ 질문은 기기 내 키워드로 처리합니다.

Worker는 요청을 AI Gateway의 Anthropic 경로로 전달합니다. 앱과 Worker 코드에는 사진·대화 원문을 영구 저장하는 처리가 없지만, 이것만으로 외부 API·Gateway의 로그·보관 설정까지 보장하지는 않습니다.

| 데이터 | 앱의 저장 방식 |
| --- | --- |
| 고지서 이미지·추출 결과·상담 대화 | 실행 중 메모리 상태. 앱 자체의 영구 저장소에는 기록하지 않음 |
| 내 정보·언어·큰 글씨·쉬운 한국어 | 브라우저 `localStorage` |
| 저장한 혜택·번역 검수 상태 | 브라우저 `localStorage` |
| 담당자가 게시한 혜택 | 같은 브라우저에 최대 20건. 다른 기기와 공유되지 않음 |
| 사용자가 저장을 선택한 납부 기록 | 세목·금액·납기·저장 시각만 최대 50건. 사진·이름·계좌번호 제외 |
| 시연용 직접 호출 키 | 입력한 브라우저의 `localStorage`. 중계 서버 설정 시 키 입력 버튼 숨김 |

납부 기록은 사용자가 누른 ‘납부 완료’의 기록이며, 은행·위택스와 연동한 실제 납부 확인 결과는 아닙니다. 내 정보에서 개인 정보만 지우거나, 언어를 제외한 `hy-` 접두어의 앱 저장값을 초기화할 수 있습니다.

## 화면 동작과 PWA

모바일 화면은 최대 480px 한 열이며 밝은 테마를 사용합니다. 960px 이상에서는 왼쪽에 서비스 소개·QR 두 개, 오른쪽에 앱을 표시합니다. 큰 창에서는 너비와 높이에 맞춰 최대 2배로 확대합니다. 관련 코드는 `src/components/layout/DeskPanel.tsx`와 `src/styles/global.css`입니다.

하위 화면의 홈 버튼은 열린 시트를 닫고 홈으로 이동합니다. 화면 전환 시 스크롤과 제목 포커스를 조정하며, 하단 버튼·시트·토스트는 앱 영역에 맞춰 표시합니다.

`vite-plugin-pwa`가 manifest와 service worker를 생성합니다.

- 홈의 설치 배너 또는 푸터 ‘앱으로 설치’에서 설치를 진행합니다. 지원 브라우저는 설치창, 그 외 환경은 기기별 안내를 보여 줍니다.
- 배너를 닫으면 14일간 숨기며, 설치형 실행 중에는 배너를 표시하지 않습니다.
- 화면 자산과 한 번 받은 외부 글꼴을 캐시하고 새 버전을 자동 갱신합니다.
- AI, 외부 사이트·지도, 일부 음성 기능에는 네트워크나 브라우저 지원이 필요합니다. 모든 기능의 오프라인 동작을 보장하지 않습니다.
- 설정은 `vite.config.ts`, 아이콘은 `public/icon-*.png`와 `public/apple-touch-icon.png`입니다.

## 바로가기 주소

서비스 기본 주소 뒤에 아래 값을 붙입니다. 언어를 처음 선택하는 사람은 선택 후 목적지로 이동합니다. 목적지를 읽으면 쿼리 문자열을 지우며, 방문 기록은 홈에서 목적지로 이어집니다.

| 주소 | 화면 |
| --- | --- |
| `?go=doc&from=qr` | 고지서 읽기, QR 진입 안내 표시 |
| `?go=visit&id=reg` | 업무 상세. ID: `move`, `reg`, `nhis`, `kid`, `drive` |
| `?go=welfare` | 지원 혜택 찾기 |
| `?go=life&id=trash` | 생활 정보 상세. ID: `sos`, `trash`, `med`, `bus`, `work` |
| `?go=explore&tab=events` | 둘러보기. 탭: `events`, `places`, `food`, `about` |
| `#admin` | 담당자 시연 화면. 로그인·권한 검사는 구현되어 있지 않음 |

처리 규칙은 `src/utils/deeplink.ts`에 있습니다. 업무·생활 정보의 ID가 없거나 잘못되면 목록으로, 알 수 없는 `go` 값이면 홈으로 이동합니다. 인쇄용 QR은 오류 복원 M 이상·가로세로 2cm 이상을 권장하며, 안내 문구와 실제 기기 인식 여부를 함께 확인하세요.

## AI 중계 서버

코드는 `worker/src/index.ts`, 설정은 `worker/wrangler.toml`입니다. 브라우저의 Anthropic SDK가 `POST /v1/messages`로 요청하며, Worker가 비밀값 `ANTHROPIC_API_KEY`를 붙여 전달합니다.

| 항목 | 현재 설정·동작 |
| --- | --- |
| 허용 출처 | `https://wscodefactory.github.io`, `http://localhost:3000`, `http://localhost:4173` |
| 허용 모델 | `claude-haiku-5-5`, `claude-sonnet-5-5` |
| 요청 크기 | `MAX_BODY_BYTES=2500000`. Content-Length와 읽은 본문 문자열 길이 검사 |
| 일일 상한 | IP당 150회, 전체 3,000회. UTC 날짜 기준 KV 카운터 |
| 응답 토큰 | `max_tokens`가 없거나 4096을 넘으면 4096으로 조정 |
| 스트리밍 | 지원하지 않음 |
| 상위 연결 | `UPSTREAM_URL`에 설정한 Cloudflare AI Gateway의 Anthropic 경로 |
| 배치 설정 | Smart Placement, `wnam` 힌트 |

같은 공용 IP의 여러 기기는 한도를 공유합니다. KV 카운터는 원자적 증가 방식이 아니므로 동시 요청의 엄격한 과금 상한으로 볼 수 없으며, 상위 API가 실패한 요청도 카운터에 반영될 수 있습니다. 출처 검사는 사용자 인증을 대신하지 않습니다.

본인 계정에 처음 배포할 때는 기존 설정을 그대로 쓰지 말고 Worker 이름·Gateway 주소·허용 출처·KV ID를 맞춰 주세요. 루트에서 `npm ci`를 마친 뒤 실행합니다.

```powershell
Set-Location worker
npx wrangler login
npx wrangler kv namespace create LIMITS
# 출력된 ID로 wrangler.toml의 [[kv_namespaces]] id를 수정
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

배포된 Worker 주소를 앱의 `VITE_AI_PROXY`에 넣고 다시 빌드합니다. 기존 Worker를 갱신할 때는 이미 연결된 KV를 유지하세요. 403은 허용 출처·상위 API 설정, 413은 이미지·요청 크기, 429는 Worker 한도와 상위 API 제한을 확인합니다.

## 행사 수집과 GitHub Pages

`.github/workflows/pages.yml`은 `main`·`feature/**` 푸시, 수동 실행, 매일 **06:00 한국시간**에 행사 수집과 Pages 배포를 수행하도록 설정되어 있습니다.

- `scripts/fetch-events.mjs`가 양주시 행사 게시판을 최대 3페이지 수집합니다. 종료 후 30일이 지난 행사는 제외합니다.
- 새 항목은 `VITE_CLAUDE_API_KEY`가 있으면 번역합니다. 키가 없으면 새 번역 대상은 한국어로 남고 `draft`로 표시됩니다. 기존 번역은 `events-cache.json`을 재사용합니다.
- 수집·번역 실패 시 기존 `src/data/events.json`으로 계속 빌드합니다. 파일의 목록이 비어 있으면 앱에서 `content.ts`의 고정 행사를 사용합니다.
- CI의 별도 `secrets-check` 작업은 번역 키가 없으면 실패하지만, `deploy` 작업은 이에 의존하지 않아 배포를 계속합니다.
- Pages 빌드는 `tsc -b` 후 `vite build --mode pages`로 `/Our_Yangju/` 경로를 사용합니다. 일반 `npm run build`는 `/` 경로입니다.
- CI 빌드에는 직접 호출 키를 넘기지 않고 Worker 주소를 지정합니다. 로컬에서 직접 호출 키를 넣은 채 빌드한 `dist/`는 공개하지 마세요.

설정된 Pages 주소: [한눈에 양주](https://wscodefactory.github.io/Our_Yangju/). 워크플로 설정과 실제 배포 성공·서비스 가동 여부는 구분해서 확인해야 합니다.

## 코드 구조

```text
src/
├─ main.tsx / App.tsx       진입점, App → Doc → Guide Provider 조립
├─ screens/ScreenRouter.tsx 화면 선택, 스크롤·포커스 조정
├─ screens/                 홈·언어·둘러보기·저장·내 정보
│  ├─ visit/ / life/        행정 업무·생활 정보
│  ├─ doc/                  사진·가림·읽기·확인·납부 안내
│  ├─ welfare/              혜택 목록·자격 사전 확인·신청 안내
│  └─ admin/                공고 등록·번역 검수·창구 통역
├─ components/              layout·ui·doc·guide·visit·welfare 공통 화면
├─ context/                 언어·내비게이션·고지서·상담 상태
├─ services/ai.ts           Claude 연결 선택, 텍스트·JSON·이미지 요청
├─ services/prompts.ts      고지서·개인정보 위치·공고·근거 답변·통역 지시
├─ services/benefitsStore.ts 담당자 게시 혜택의 기기 내 저장
├─ data/content.ts          5개 언어 문구와 기본 콘텐츠
├─ data/visit-detail.ts     상황별 업무 준비물·안내
├─ data/links.ts            공식 사이트·연락처
├─ data/knowledge.ts        상담에 제공하는 내장 근거 문서
├─ data/events*.json        수집 행사·번역 캐시
├─ data/easy-ko.json        미리 생성한 쉬운 한국어 문구
├─ i18n.ts                  번역 선택·날짜·금액·누락 점검
├─ types/                   화면·고지서·공고 규칙 타입
├─ utils/                   저장소·가림·개인정보 패턴·달력·프로필·검수
└─ styles/global.css        디자인 토큰·화면·PC 레이아웃
worker/                     Cloudflare Worker와 KV·출처·한도 설정
scripts/                    행사 수집·쉬운 한국어 생성·고지서 평가
tests/e2e/                  Puppeteer 브라우저 점검
tests/notices/              고지서 이미지·기대값
public/                     로고·PWA 아이콘
legacy/                     원본 HTML과 개편 전 React 코드
.github/workflows/          Pages 빌드·배포
```

추가 구조 설명은 [프로젝트_구조.md](프로젝트_구조.md), 고지서 테스트셋 작성법은 [tests/notices/README.md](tests/notices/README.md)를 참고하세요. `요청사항/`은 Git에서 제외한 팀 내부 자료 폴더로, 새로 복제한 저장소에는 없을 수 있습니다.

## 검증

### 로컬 브라우저 점검

설치된 Chrome을 `puppeteer-core`로 실행합니다. `npm run e2e`는 **빌드하지 않고 기존 `dist/`**를 preview로 띄우므로 먼저 빌드하세요.

```powershell
npm run build
npm run e2e
# 하나씩 실행할 때
npm run e2e -- flows
npm run e2e -- smoke
npm run e2e -- pc
```

| 점검 | 범위 |
| --- | --- |
| `flows` | 바로가기·언어 선택·홈 이동·설치 안내·업무 준비물·혜택 검색·프로필 반영·샘플 결과 |
| `smoke` | 5개 언어 주요 화면과 담당자 탭의 페이지 오류·가로 넘침·한글 노출 검사 |
| `pc` | 1024~2560px PC 레이아웃·배율·고정 요소 정렬 |
| `live` | `E2E_URL`이 있을 때 실제 상담·가릴 곳 찾기·사진 읽기 호출. 없으면 건너뜀 |

기본 Chrome 경로는 Windows의 `C:/Program Files/Google/Chrome/Application/chrome.exe`입니다. 다른 경로는 `$env:CHROME_PATH`로 지정하며, 스크린샷은 `tests/e2e/shots/`에 저장됩니다.

실제 API 점검은 비용과 서버 한도를 사용합니다. `E2E_URL`을 설정한 채 전체 테스트를 실행하면 `live`도 포함되므로, 아래처럼 대상을 명시하세요.

```powershell
$env:E2E_URL = 'https://wscodefactory.github.io/Our_Yangju/'
try { npm run e2e -- live }
finally { Remove-Item Env:E2E_URL }
```

### 고지서 인식 평가·문구 생성

```powershell
npm run eval:notices
npm run eval:notices -- --json
node scripts/gen-easy-ko.mjs
```

이 명령들은 Worker 설정과 별도로 `.env` 또는 실행 환경의 `VITE_CLAUDE_API_KEY`로 Claude에 직접 요청합니다. 쉬운 한국어 생성은 키가 없으면 건너뛰며, `--force`로 기존 문구도 다시 생성할 수 있습니다.

고지서 평가기는 앱과 같은 읽기 프롬프트를 쓰지만 이미지 파일은 축소·가림 없이 그대로 전송합니다. 실제 고지서는 미리 개인정보를 가리고 추가하세요. 현재 `cases.json`에는 가상 자동차세 샘플 **1장**이 있으며, 이것만으로 실제 고지서 인식 정확도를 일반화할 수 없습니다. `--json` 결과는 Git에서 제외한 `tests/notices/last-run.json`에 기록합니다.

## 현재 한계와 후속 작업

- 세액·가산금·최종 지원 자격을 확정하지 않습니다. 고지서 원문과 공식 접수·납부 채널에서 확인하도록 안내합니다.
- 상담은 실시간 검색이나 벡터 검색이 아니라, `knowledge.ts`에 내장한 문서를 한 번의 요청에 제공하는 방식입니다. 출처 ID 확인이 답변 내용 전체의 정확성을 검증하는 것은 아닙니다.
- 낮은 인식 신뢰도 안내와 사용자 수정 화면은 있지만, 흐림 재촬영·복수 금액 판별·확인 전 연결 제한을 더 보완해야 합니다.
- ‘가릴 곳 찾기’는 가리기 전 이미지 사본을 전송합니다. 완전히 기기 안에서 처리하는 자동 가림 기능은 아직 없습니다.
- `#admin`은 로그인 없는 시연 화면이며 사각지대 신호는 예시 데이터입니다. 담당자 게시·번역 검수 상태의 서버 공유는 구현되어 있지 않습니다.
- 번역 검수는 완료 여부를 기기에 기록하는 기능입니다. 검수 상태 JSON을 가져오는 것만으로 번역 문구가 수정되지는 않습니다. 원어민 검토 결과는 별도 반영이 필요합니다.
- 실제 고지서 테스트셋, 창구별 접수 범위 확인, 근거 문서 갱신, 음성·설치 기능의 실제 기기 검증을 추가해야 합니다.
