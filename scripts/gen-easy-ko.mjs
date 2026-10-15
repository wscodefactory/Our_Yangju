// 긴 한국어 안내를 쉬운 문장으로 미리 생성한다. 기존 문구는 --force일 때만 다시 만든다.
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 로컬에서는 .env 의 VITE_CLAUDE_API_KEY 를 쓴다. 키는 절대 출력하지 않는다.
try { process.loadEnvFile(path.join(root, '.env')); } catch { /* .env 없음 */ }
const key = process.env.VITE_CLAUDE_API_KEY;
if (!key) { console.error('VITE_CLAUDE_API_KEY 가 없어 생성하지 않습니다.'); process.exit(0); }
const model = process.env.VITE_CLAUDE_MODEL || 'claude-haiku-5-5';
const client = new Anthropic({ apiKey: key, maxRetries: 3 });

// content.ts 에서 UI 사전 읽기 (import 가 없어 transpile 만으로 실행 가능)
const src = fs.readFileSync(path.join(root, 'src/data/content.ts'), 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const m = { exports: {} }; new Function('module', 'exports', js)(m, m.exports);
const UI = m.exports.UI;

const outPath = path.join(root, 'src/data/easy-ko.json');
const prev = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : {};
const force = process.argv.includes('--force');
const targets = Object.entries(UI).filter(([k, v]) => v[0].length >= 15 && (force || !prev[k]));
console.log(`대상 ${targets.length}개 (전체 ${Object.keys(UI).length}, 기존 ${Object.keys(prev).length})`);

const out = { ...prev };
for (let i = 0; i < targets.length; i += 25) {
  const batch = targets.slice(i, i + 25);
  const prompt = '다음 한국어 안내 문구를 어르신과 한국어 학습자가 읽기 쉬운 "쉬운 한국어"로 바꿔 주세요. 규칙: 짧은 문장, 쉬운 단어, 한 문장에 한 가지, 존댓말(~해요/~하세요), 뜻은 바꾸지 말 것, 숫자·전화번호·사이트 이름·{중괄호 자리표시자}는 그대로. 길이는 원문과 비슷하거나 짧게. JSON 객체(키 → 바꾼 문구)만 답하세요.\n' +
    JSON.stringify(Object.fromEntries(batch.map(([k, v]) => [k, v[0]])));
  let text;
  try {
    const res = await client.messages.create({
      model, max_tokens: 8192, thinking: { type: 'disabled' },
      system: 'Respond with a single JSON value only. No prose, no markdown fences.',
      messages: [{ role: 'user', content: prompt }],
    });
    text = res.content.map((p) => (p.type === 'text' ? p.text : '')).join('');
  } catch (e) { console.error('Claude 오류:', e.status ?? '', e.message); process.exitCode = 1; break; } // 여기까지 된 것만 저장하고 실패로 끝낸다
  const obj = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, ''));
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v !== 'string' || !v.trim()) continue;
    // 자리표시자가 사라졌으면 버린다
    const ph = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join(',');
    if (ph(UI[k][0]) !== ph(v)) { console.warn('자리표시자 불일치, 건너뜀:', k); continue; }
    out[k] = v;
  }
  console.log(`  ${Math.min(i + 25, targets.length)}/${targets.length}`);
}
fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
console.log(`저장: ${outPath} (${Object.keys(out).length}개)`);
