# 한눈에 양주 | Our Yangju

[한국어](README.md) | **English**

Find your next step in Yangju, in your own language.

Our Yangju helps foreign residents understand administrative notices, prepare documents, read tax notices, and find local support. This is **Team 12's prototype for the 2026 Yangju Future Talent AI Competition**.

The app started as a single HTML design and now uses **React 18, TypeScript, and Vite**, with Claude integration through a Cloudflare Worker. The original is kept in `legacy/index.html`; earlier React screens are in `legacy/v1/`.

## Features

| Area | What is implemented |
| --- | --- |
| Language and accessibility | Korean, English, Chinese, Vietnamese, and Nepali; larger text; easy Korean; text-to-speech where supported |
| Administrative tasks | Locations, deadlines, situation-specific document checklists, official links, 1345 calling, and a full-screen Korean message for staff |
| Notice reading | Select a photo → cover personal details → extract fields → review and edit → payment, FAQ, and contact guidance. Sample and manual entry are also available |
| Notice results | Virtual-account transfer steps, copy buttons, Wetax links, overdue labels, calendar download, and optional payment records |
| Benefits | Group and stage filters, search, eligibility pre-checks, documents, application guidance, bookmarks, and inquiry notes |
| Local information | Emergency numbers, waste, healthcare, transport, work, events, places, food, and an introduction to Yangju |
| AI guide | Keyword-based screen suggestions, followed by answers using bundled reference material when no rule matches |
| My information | Visa, local area, moving date, housing, family, health insurance payment, car, and bank-app preferences; personalized guidance and data reset |
| Officer console | `#admin`: notice extraction, source review, local publishing, example gap signals, translation review status, and counter interpretation |

The main resident interface includes five-language strings and switches languages without an AI request. Officer-only text is mainly Korean and English. Collected events without a translation may still appear in Korean.

## Run locally

Use **Node.js 22.12 or later** and npm. The deployment workflow uses Node.js 22.

On Windows PowerShell:

```powershell
Set-Location 'E:\Yangju\HtmltoReactClaude'
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

- Development URL: `http://localhost:3000/`. Vite stops if that port is occupied.
- A phone on the same network can open the Network URL printed in the terminal. The default Worker allowlist excludes local IP addresses, so AI requests from that URL require an origin configuration change.
- Restart the development server after editing `.env`. Rebuild to update a production bundle.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run typecheck` | Check TypeScript types |
| `npm run build` | Check types and generate `dist/` |
| `npm run preview` | Preview the build, default port 4173 |
| `npm run e2e` | Run browser checks against the existing `dist/` |
| `npm run events` | Collect city events and translate new entries if a key is available |
| `npm run eval:notices` | Evaluate notice fixtures using the real Claude API |

### AI connection and demo mode

`src/services/ai.ts` selects the connection in this order:

1. Use `VITE_AI_PROXY` when set.
2. Otherwise use `VITE_CLAUDE_API_KEY` for direct requests.
3. Otherwise use the key saved in this browser through the officer console.
4. Without any connection, use sample data, manual entry, and keyword rules.

**The example environment file includes a proxy URL. Leaving only the API key empty does not enable demo mode.** Proxy requests still incur API usage and count toward server limits.

For a demo without AI requests, set:

```dotenv
VITE_AI_PROXY=
VITE_CLAUDE_API_KEY=
VITE_CLAUDE_MODEL=claude-haiku-5-5
```

If you previously entered a key in the officer console, clear it through the app-data reset in My information. This also removes other app preferences and saved records, except the selected language.

| Variable | Purpose |
| --- | --- |
| `VITE_AI_PROXY` | Worker base URL; the example uses `https://our-yangju.mikael8047.workers.dev` |
| `VITE_CLAUDE_API_KEY` | Key for direct browser requests and local collection/evaluation scripts |
| `VITE_CLAUDE_MODEL` | Repository default: `claude-haiku-5-5`. Must match the Worker's model allowlist when using the proxy |

These model names describe repository configuration; confirm availability in your API environment. Missing or failed notice reading falls back to manual entry. Guide questions without a usable source receive clarification and 1345 guidance. Live counter translation requires an AI connection.

A direct-call `VITE_` key becomes part of the browser bundle. Console-entered keys are stored in that browser's `localStorage`. Use the Worker for public deployments and keep direct-call keys out of public builds. `.env` is excluded from Git.

## What is sent and stored

**Notice reading and automatic personal-data detection send different images.**

- **Manual covering → reading:** the app applies black rectangles to the image pixels on the device before sending the covered image to Claude.
- **Automatic detection:** `MaskScreen.tsx` sends a JPEG copy of the pre-mask canvas, with its longest side reduced to 640px. Existing rectangles are not applied to this request. The code resizes and JPEG-encodes the image; it does not add a separate blur. Personal details may remain visible.
- **Guide, notices, interpretation:** a guide question not handled by keyword rules, an officer's notice text, and utterance text for translation are included in AI requests. The notice-result FAQ search runs locally.

The Worker forwards requests to the Anthropic endpoint configured through AI Gateway. The app and Worker do not implement persistent storage for photos or conversation text. That does not establish the logging or retention settings of the external API or Gateway.

| Data | App storage |
| --- | --- |
| Notice image, extracted fields, guide conversation | In-memory state; no app-managed persistent storage |
| Profile, language, larger text, easy Korean | Browser `localStorage` |
| Saved benefits and translation review status | Browser `localStorage` |
| Officer-published benefits | Up to 20 entries in this browser; not shared across devices |
| Optional payment records | Up to 50 entries: tax type, amount, due date, and save time; no image, name, or account number |
| Direct-call demo key | This browser's `localStorage`; key-entry control is hidden in proxy builds |

A payment record reflects the user's “Payment completed” action. It is not confirmation from a bank or Wetax. My information can clear the profile or reset all `hy-` app-storage keys except the language key.

## Layout and installation

The mobile interface uses a single column up to 480px wide and a light theme. At 960px and above, a service introduction and two QR codes appear beside the app. Larger windows scale the layout up to 2×. See `src/components/layout/DeskPanel.tsx` and `src/styles/global.css`.

The Home control closes overlays and returns to the home screen. Screen transitions update scroll and heading focus. Bottom controls, sheets, and notifications stay aligned with the app area.

`vite-plugin-pwa` generates the manifest and service worker:

- Install from the home banner or footer. Supported browsers open an install prompt; other environments show device-specific instructions.
- Dismissing the banner hides it for 14 days. It is hidden during standalone execution.
- App assets and previously fetched external fonts are cached, with automatic version updates.
- AI, external sites, maps, and some voice features need connectivity or browser support. Full offline operation is not guaranteed.
- Configuration is in `vite.config.ts`; icons are in `public/icon-*.png` and `public/apple-touch-icon.png`.

## Direct links

Append these values to the service URL. First-time visitors choose a language before continuing to the destination. The app removes the query string after reading it and keeps Home as the previous screen.

| Suffix | Destination |
| --- | --- |
| `?go=doc&from=qr` | Notice reading, with a QR-entry message |
| `?go=visit&id=reg` | Task detail; IDs: `move`, `reg`, `nhis`, `kid`, `drive` |
| `?go=welfare` | Benefits |
| `?go=life&id=trash` | Living information; IDs: `sos`, `trash`, `med`, `bus`, `work` |
| `?go=explore&tab=events` | Explore; tabs: `events`, `places`, `food`, `about` |
| `#admin` | Officer demo console; no login or role authorization is implemented |

Rules are in `src/utils/deeplink.ts`. Missing or invalid task/living-information IDs open the list; unknown `go` values open Home. For printed QR codes, use error correction M or higher and a size of at least 2cm, include explanatory text, and test the printed result on a real device.

## AI proxy

Implementation: `worker/src/index.ts`. Configuration: `worker/wrangler.toml`. The browser SDK sends `POST /v1/messages`; the Worker adds its `ANTHROPIC_API_KEY` secret.

| Setting | Current configuration or behavior |
| --- | --- |
| Allowed origins | `https://wscodefactory.github.io`, `http://localhost:3000`, `http://localhost:4173` |
| Allowed models | `claude-haiku-5-5`, `claude-sonnet-5-5` |
| Request size | `MAX_BODY_BYTES=2500000`; checks Content-Length and the decoded body string length |
| Daily limits | 150 requests per IP and 3,000 total; UTC-date KV counters |
| Output tokens | Missing or greater-than-4096 `max_tokens` is set to 4096 |
| Streaming | Not supported |
| Upstream | Anthropic route on the Cloudflare AI Gateway configured by `UPSTREAM_URL` |
| Placement | Smart Placement with a `wnam` hint |

Devices behind the same public IP share a limit. KV increments are not atomic, so these counters are not a strict concurrent spending cap. Requests that fail upstream may still count. Origin checks do not provide user authentication.

For a first deployment to your own account, update the Worker name, Gateway URL, origins, and KV ID. After running `npm ci` at the project root:

```powershell
Set-Location worker
npx wrangler login
npx wrangler kv namespace create LIMITS
# Set [[kv_namespaces]].id in wrangler.toml to the returned ID
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

Set the deployed Worker URL in `VITE_AI_PROXY` and rebuild. Keep the existing KV binding when updating an existing deployment. For 403 errors, check origins and upstream configuration; for 413, check request/image size; for 429, check Worker and upstream limits.

## Events and GitHub Pages

`.github/workflows/pages.yml` is configured for pushes to `main` and `feature/**`, manual runs, and a daily run at **06:00 Korea time**.

- `scripts/fetch-events.mjs` collects up to three pages of the city event board, excluding events that ended more than 30 days ago.
- `VITE_CLAUDE_API_KEY` enables translation of new entries. Without it, uncached entries remain Korean and are marked `draft`. Existing translations use `events-cache.json`.
- Collection or translation failure leaves the existing `src/data/events.json` available for the build. An empty event list falls back to static events in `content.ts`.
- The separate `secrets-check` job fails if the translation key is missing. `deploy` does not depend on that job and can continue.
- Pages runs `tsc -b` and `vite build --mode pages` for the `/Our_Yangju/` base path. Ordinary `npm run build` uses `/`.
- CI passes the Worker URL to the frontend build, not the direct-call key. Do not publish a local build containing a direct-call key.

Configured Pages URL: [Our Yangju](https://wscodefactory.github.io/Our_Yangju/). Configuration alone does not confirm a successful deployment or live availability.

## Project layout

```text
src/
├─ main.tsx / App.tsx       Entry point; App → Doc → Guide providers
├─ screens/ScreenRouter.tsx Screen selection, scroll and focus
├─ screens/                 Home, language, explore, saved items, profile
│  ├─ visit/ / life/        Administrative tasks and living information
│  ├─ doc/                  Upload, covering, reading, review, results
│  ├─ welfare/              Benefits, pre-checks, application guidance
│  └─ admin/                Notice registration, review, interpretation
├─ components/              Shared layout, UI, and feature components
├─ context/                 Settings, navigation, notice and guide state
├─ services/ai.ts           Connection selection and text/JSON/image requests
├─ services/prompts.ts      Feature-specific request instructions
├─ services/benefitsStore.ts Local officer-published benefits
├─ data/content.ts          Five-language strings and bundled content
├─ data/visit-detail.ts     Situation-specific documents and task notes
├─ data/links.ts            Official sites and contacts
├─ data/knowledge.ts        Bundled guide reference material
├─ data/events*.json        Collected events and translation cache
├─ data/easy-ko.json        Pre-generated easy-Korean strings
├─ i18n.ts                  Language selection and formatting
├─ types/                   Screen, notice, and rule types
├─ utils/                   Storage, masking, calendar, profile, review
└─ styles/global.css        Design tokens and responsive layout
worker/                     Proxy, KV, origin and limit configuration
scripts/                    Event collection, text generation, evaluation
tests/e2e/                  Puppeteer browser checks
tests/notices/              Notice fixtures and expected values
public/                     Logos and PWA icons
legacy/                     Original HTML and earlier React code
.github/workflows/          Pages build and deployment
```

See [프로젝트_구조.md](프로젝트_구조.md) for the detailed architecture and [tests/notices/README.md](tests/notices/README.md) for fixture instructions, both in Korean. The internal `요청사항/` folder is excluded from Git and may be absent in a fresh clone.

## Validation

### Browser checks

The checks use an installed Chrome through `puppeteer-core`. They **do not build the app**; build `dist/` first.

```powershell
npm run build
npm run e2e
# Run individual suites
npm run e2e -- flows
npm run e2e -- smoke
npm run e2e -- pc
```

| Suite | Coverage |
| --- | --- |
| `flows` | Direct links, language selection, Home, installation help, documents, benefit search, profile effects, and sample results |
| `smoke` | Main screens in five languages and officer tabs: page errors, horizontal overflow, and unintended Korean text |
| `pc` | Layout, scale, and fixed controls at widths from 1024 to 2560px |
| `live` | Real guide, personal-data detection, and notice reading when `E2E_URL` is set; skipped otherwise |

The Windows Chrome default is `C:/Program Files/Google/Chrome/Application/chrome.exe`. Override it with `$env:CHROME_PATH`. Screenshots are saved under `tests/e2e/shots/`.

Real API checks incur usage and count against server limits. Running the full suite with `E2E_URL` set also includes `live`; select the suite explicitly:

```powershell
$env:E2E_URL = 'https://wscodefactory.github.io/Our_Yangju/'
try { npm run e2e -- live }
finally { Remove-Item Env:E2E_URL }
```

### Notice evaluation and easy-Korean generation

```powershell
npm run eval:notices
npm run eval:notices -- --json
node scripts/gen-easy-ko.mjs
```

These scripts use `VITE_CLAUDE_API_KEY` from `.env` or the process environment to call Claude directly, independently of the Worker setting. Easy-Korean generation skips without a key; `--force` regenerates existing entries.

The notice evaluator shares the app's reading prompt but sends the fixture file without resizing or masking. Cover personal details before adding real notices. `cases.json` currently contains **one fictional automobile-tax notice**; its score does not establish accuracy on real notices. `--json` writes the Git-excluded `tests/notices/last-run.json`.

## Limits and remaining work

- The app does not determine final tax amounts, penalties, or benefit eligibility. Users must confirm against the original notice and official channels.
- The guide sends bundled `knowledge.ts` documents in one request. It does not perform live or vector search. A valid source ID does not verify every statement in an answer.
- Low-confidence warnings and field editing exist. Retake guidance, multiple-amount detection, and controls before payment links need further work.
- Automatic detection sends a pre-mask copy. Fully on-device automatic masking is not implemented.
- The officer console has no login. Gap signals are examples; publishing and review status have no shared server storage.
- Translation-review JSON records review status. Importing it does not replace translations. Reviewed wording must be incorporated separately.
- Add real notice fixtures, confirm office-specific handling, maintain reference material, and test installation and voice features on real devices.
