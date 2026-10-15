// 시청 행사 목록을 수집하고 새 제목·장소를 번역한다. 실패하면 기존 행사 파일을 유지한다.
import Anthropic from '@anthropic-ai/sdk';
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

// 로컬에서는 .env 의 VITE_CLAUDE_API_KEY 를 쓴다. Actions 에서는 env 로 들어온다. 키는 절대 출력하지 않는다.
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* .env 없음 */ }
const KEY = process.env.VITE_CLAUDE_API_KEY || '';
const MODEL = process.env.VITE_CLAUDE_MODEL || 'claude-haiku-5-5';
const client = KEY ? new Anthropic({ apiKey: KEY, maxRetries: 3 }) : null;

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

/** 한 번의 Claude 호출로 여러 건의 제목·장소를 4개 언어로 번역. 실패하면 null */
async function translate(items) {
  const prompt = `Translate each Korean event title and place into English (en), Simplified Chinese (zh), Vietnamese (vi), Nepali (ne).
Keep proper nouns romanized the way Korean government sites do (e.g. Yangju, Hoeamsa); for Chinese write place names in Chinese characters (장흥면 → 长兴面). Never leave Hangul in the output. Keep it short, no explanations.
Return ONLY a JSON array, same order as input, each item: {"nttNo":"...","title":{"en":"","zh":"","vi":"","ne":""},"place":{"en":"","zh":"","vi":"","ne":""}}.
Input:
${JSON.stringify(items.map(({ nttNo, title, place }) => ({ nttNo, title, place })))}`;
  let raw;
  try { // 429·5xx 는 SDK 가 재시도(maxRetries 3)
    const res = await client.messages.create({
      model: MODEL, max_tokens: 8192, thinking: { type: 'disabled' },
      system: 'Respond with a single JSON value only. No prose, no markdown fences.',
      messages: [{ role: 'user', content: prompt }],
    });
    raw = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  } catch (e) { console.warn(`[events] Claude 오류: ${e.status ?? ''} ${e.message}`); return null; }
  try {
    const arr = JSON.parse(raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim());
    return Array.isArray(arr) ? arr : null;
  } catch { console.warn('[events] Claude 응답이 JSON 이 아님'); return null; }
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
  } else if (todo.length) console.warn(`[events] VITE_CLAUDE_API_KEY 없음 — ${todo.length}건 한국어 그대로 (draft)`);
  // Actions 로그에서 키가 들어왔는지 바로 보이게 (값은 절대 찍지 않는다)
  console.log(`[events] 번역 키 ${KEY ? '있음' : '없음'}, 번역 대상 ${todo.length}건`);

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

// fetch 뒤에 process.exit() 를 부르면 Windows 의 Node 24 가 libuv assertion 으로 죽는다. 그냥 끝내면 종료 코드 0
main().catch((e) => { console.warn(`[events] 실패, 기존 events.json 유지: ${e.message}`); });
