// 양주시 누리집 행사 게시판을 긁어 src/data/events.json 을 만든다. (빌드 전 `npm run events`)
// 제목·장소는 Gemini 로 en/zh/vi/ne 번역하고, 번역 결과는 events-cache.json 에 nttNo 별로 쌓아 재실행 때 새 글만 번역한다.
// 가져오기·파싱이 실패하면 기존 events.json 을 건드리지 않고 0 으로 끝낸다 (마지막 성공 데이터로 빌드).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/data/events.json');
const CACHE = path.join(ROOT, 'src/data/events-cache.json');
const BOARD = 'https://www.yangju.go.kr/www/selectBbsNttList.do?bbsNo=14&key=203';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OurYangju/1.0';
const KEEP_DAYS = 30;   // 종료일이 이보다 오래된 행사는 버린다
const MAX_PAGES = 3;

// 로컬에서는 .env 의 VITE_GEMINI_API_KEY 를 쓴다. Actions 에서는 env 로 들어온다. 키는 절대 출력하지 않는다.
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* .env 없음 */ }
const KEY = process.env.VITE_GEMINI_API_KEY || '';
const MODEL = process.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash-lite';

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&#39;': "'", '&nbsp;': ' ' };
const decode = (s) => s.replace(/&(?:amp|lt|gt|quot|nbsp|#0?39);/g, (m) => ENT[m]).replace(/<[^>]+>/g, '').trim();

/** 목록 HTML 한 장 → 행 배열. 열 순서는 번호·제목·시작일·종료일·장소·담당부서·조회수 */
function parseRows(html) {
  const body = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)?.[1];
  if (!body) throw new Error('tbody 없음');
  const rows = [];
  for (const tr of body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    if (tds.length < 5) continue;
    const nttNo = tds[1].match(/nttNo=(\d+)/)?.[1];
    const title = decode(tds[1].match(/<a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? '');
    const [start, end] = [tds[2], tds[3]].map((d) => decode(d).match(/\d{4}-\d{2}-\d{2}/)?.[0]);
    if (!nttNo || !title || !start || !end) continue;
    rows.push({ nttNo, title, start, end, place: decode(tds[4]),
      url: `https://www.yangju.go.kr/www/selectBbsNttView.do?key=203&bbsNo=14&nttNo=${nttNo}` });
  }
  return rows;
}

async function fetchText(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.text();
}

/** 한 번의 Gemini 호출로 여러 건의 제목·장소를 4개 언어로 번역. 실패하면 null */
async function translate(items) {
  const prompt = `Translate each Korean event title and place into English (en), Simplified Chinese (zh), Vietnamese (vi), Nepali (ne).
Keep proper nouns romanized the way Korean government sites do (e.g. Yangju, Hoeamsa). Keep it short, no explanations.
Return ONLY a JSON array, same order as input, each item: {"nttNo":"...","title":{"en":"","zh":"","vi":"","ne":""},"place":{"en":"","zh":"","vi":"","ne":""}}.
Input:
${JSON.stringify(items.map(({ nttNo, title, place }) => ({ nttNo, title, place })))}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(KEY)}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json', thinkingConfig: { thinkingLevel: 'minimal' } },
  };
  let r;
  for (let i = 0; i < 3; i++) { // 503(과부하)·429 는 잠깐 쉬고 다시
    r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.ok || (r.status !== 503 && r.status !== 429)) break;
    await new Promise((res) => setTimeout(res, 3000 * (i + 1)));
  }
  if (!r.ok) { console.warn(`[events] Gemini HTTP ${r.status}`); return null; }
  const j = await r.json();
  const text = (j.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
  try {
    const arr = JSON.parse(text);
    return Array.isArray(arr) ? arr : null;
  } catch { console.warn('[events] Gemini 응답이 JSON 이 아님'); return null; }
}

const LANGS = ['en', 'zh', 'vi', 'ne'];
const t5 = (ko, tr) => [ko, ...LANGS.map((l) => (tr?.[l] || '').trim() || ko)];

async function main() {
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // KST 기준 오늘
  const cutoff = new Date(Date.now() - KEEP_DAYS * 86400e3 + 9 * 3600e3).toISOString().slice(0, 10);

  // 1) 수집. 마지막 행의 종료일이 아직 기간 안이면 다음 페이지도 본다
  let rows = [];
  for (let p = 1; p <= MAX_PAGES; p++) {
    const page = parseRows(await fetchText(p === 1 ? BOARD : `${BOARD}&pageIndex=${p}`));
    if (!page.length) break;
    rows.push(...page);
    if (page[page.length - 1].end < cutoff) break;
  }
  const fetched = rows.length;
  rows = rows.filter((r) => r.end >= cutoff);
  if (!rows.length) throw new Error('기간 내 행사가 0건 — 파싱이 깨졌을 가능성');

  // 2) 번역 (캐시에 없는 것만, 한 번의 호출)
  const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
  const todo = rows.filter((r) => !cache[r.nttNo] || cache[r.nttNo].title[0] !== r.title || cache[r.nttNo].place[0] !== r.place);
  let translated = 0;
  if (todo.length && KEY) {
    const res = await translate(todo);
    for (const item of res ?? []) {
      const row = todo.find((r) => r.nttNo === String(item.nttNo));
      if (!row || !item.title?.en) continue;
      cache[row.nttNo] = { title: t5(row.title, item.title), place: t5(row.place, item.place) };
      translated++;
    }
    writeFileSync(CACHE, JSON.stringify(cache, null, 1) + '\n');
  } else if (todo.length) console.warn(`[events] VITE_GEMINI_API_KEY 없음 — ${todo.length}건 한국어 그대로 (draft)`);

  // 3) events.json. 번역이 없는 건은 다섯 칸 모두 한국어 + draft:true
  const fetchedAt = new Date().toISOString();
  const events = rows.map((r) => {
    const c = cache[r.nttNo];
    const name = c?.title ?? t5(r.title), place = c?.place ?? t5(r.place);
    return { id: `city-${r.nttNo}`, range: [r.start, r.end], map: r.place || r.title, url: r.url, name, place, what: name, draft: !c, fetchedAt };
  });
  writeFileSync(OUT, JSON.stringify(events, null, 1) + '\n');
  console.log(`[events] ${fetched}행 수집, ${rows.length}건 유지(종료일 ≥ ${cutoff}, 오늘 ${today}), ${translated}건 새로 번역, ${events.filter((e) => e.draft).length}건 draft → ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => { console.warn(`[events] 실패, 기존 events.json 유지: ${e.message}`); process.exit(0); });
