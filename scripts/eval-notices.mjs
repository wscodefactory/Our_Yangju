// 고지서 사진 인식 정확도 테스트: tests/notices/cases.json 의 각 사진을 앱과 같은 프롬프트로 Claude 에 보내 expected 와 비교한다.
// 사용법: npm run eval:notices [-- --json]   (--json 이면 tests/notices/last-run.json 에 결과 저장)
// 앱은 사진을 긴 변 1200px JPEG 0.8 로 줄여 보내지만 여기서는 원본을 그대로 보낸다 (Node 에 canvas 없음).
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'tests', 'notices');
const writeJson = process.argv.includes('--json');

// .env 의 키/모델 (키는 절대 출력하지 않는다)
try { process.loadEnvFile(path.join(root, '.env')); } catch { /* .env 없음 */ }
const apiKey = process.env.VITE_CLAUDE_API_KEY;
if (!apiKey) { console.error('.env 에 VITE_CLAUDE_API_KEY 가 없습니다'); process.exit(2); }
const model = process.env.VITE_CLAUDE_MODEL || 'claude-haiku-5-5';
const client = new Anthropic({ apiKey, maxRetries: 3 });

// 앱 프롬프트를 그대로 가져온다 (prompts.ts 는 import 가 없어 transpile 만으로 실행 가능)
const src = fs.readFileSync(path.join(root, 'src', 'services', 'prompts.ts'), 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const m = { exports: {} };
new Function('module', 'exports', js)(m, m.exports);
const prompt = m.exports.READ_NOTICE_PROMPT;

// 앱(services/ai.ts)과 같은 요청 모양: 이미지 블록 + 프롬프트, system 으로 JSON 만 지시
async function readNotice(file) {
  const media_type = /\.jpe?g$/i.test(file) ? 'image/jpeg' : 'image/png';
  const res = await client.messages.create({
    model, max_tokens: 4096, temperature: 0.2,
    system: 'Respond with a single JSON value only. No prose, no markdown fences.',
    messages: [{ role: 'user', content: [
      { type: 'image', source: { type: 'base64', media_type, data: fs.readFileSync(path.join(dir, file)).toString('base64') } },
      { type: 'text', text: prompt },
    ] }],
  });
  const raw = res.content.map(b => (b.type === 'text' ? b.text : '')).join('');
  return JSON.parse(raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim());
}

const digits = s => String(s ?? '').replace(/\D/g, '');
// 모델이 "auto (자동차세)" 처럼 프롬프트의 선택지 문자열을 통째로 돌려주는 경우 → 앞의 키만 쓴다
const taxKey = s => String(s ?? '').trim().split(/[\s(]/)[0];
const FIELDS = {
  tax_type: (got, exp) => taxKey(got.tax_type) === exp.tax_type,
  amount_won: (got, exp) => Number(got.amount_won) === exp.amount_won,
  due_date: (got, exp) => got.due_date === exp.due_date,
  epay_no: (got, exp) => digits(got.epay_no) === digits(exp.epay_no),
  vacct: (got, exp) => digits(got.vacct).includes(digits(exp.vacct_digits)),
};
const names = Object.keys(FIELDS);

const cases = JSON.parse(fs.readFileSync(path.join(dir, 'cases.json'), 'utf8'));
const results = [];
for (const c of cases) {
  const t0 = Date.now();
  let got = null, error = null;
  try { got = await readNotice(c.file); } catch (e) { error = e.message; }
  const ms = Date.now() - t0;
  const ok = Object.fromEntries(names.map(k => [k, !!got && FIELDS[k](got, c.expected)]));
  results.push({ file: c.file, ms, ok, all: names.every(k => ok[k]), got, error, at: new Date().toISOString() });
}

const mark = b => (b ? '✓' : '✗');
console.log(`model: ${model}, cases: ${cases.length}\n`);
console.log(['file', ...names, 'ms'].join(' | '));
for (const r of results) {
  console.log([r.file, ...names.map(k => mark(r.ok[k])), r.ms].join(' | '));
  if (r.error) console.log(`  error: ${r.error}`);
  else if (!r.all) console.log(`  got: ${JSON.stringify({ tax_type: r.got.tax_type, amount_won: r.got.amount_won, due_date: r.got.due_date, epay_no: r.got.epay_no, vacct: r.got.vacct, confidence: r.got.confidence })}`);
}
const pct = n => `${Math.round((n / results.length) * 100)}%`;
console.log('');
for (const k of names) console.log(`${k.padEnd(11)} ${pct(results.filter(r => r.ok[k]).length)}`);
const allOk = results.filter(r => r.all).length;
console.log(`\n정답률 (모든 항목 일치) ${allOk}/${results.length} = ${pct(allOk)}`);

if (writeJson) {
  const out = path.join(dir, 'last-run.json');
  fs.writeFileSync(out, JSON.stringify({ model, ran_at: new Date().toISOString(), results }, null, 2));
  console.log(`→ ${path.relative(root, out)}`);
}
// fetch 뒤에 process.exit() 를 부르면 Windows 의 Node 24 가 libuv assertion 으로 죽는다. exitCode 로 끝낸다
process.exitCode = allOk === results.length ? 0 : 1;
