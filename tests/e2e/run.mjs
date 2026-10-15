// 전체 점검 실행: 빌드본을 preview 로 띄우고 tests/e2e/*.test.mjs 를 차례로 돌린다.
//   npm run e2e            — 로컬 빌드본(dist) 대상. 먼저 `npx vite build` 가 되어 있어야 한다
//   E2E_URL=https://... npm run e2e -- live   — 배포본 대상 (live.test.mjs 만)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const only = process.argv[2];
const dir = path.resolve('tests/e2e');
const tests = fs.readdirSync(dir).filter((f) => f.endsWith('.test.mjs') && (!only || f.startsWith(only))).sort();
const useLocal = !process.env.E2E_URL;

let preview;
if (useLocal) {
  preview = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore', shell: true });
  for (let i = 0; i < 60; i++) {
    try { await fetch('http://localhost:4173/'); break; } catch { await new Promise((r) => setTimeout(r, 500)); }
  }
}
let failed = 0;
for (const f of tests) {
  console.log(`\n=== ${f}`);
  const code = await new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(dir, f)], { stdio: 'inherit', env: process.env });
    p.on('exit', resolve);
  });
  if (code !== 0) failed++;
}
if (preview) { preview.kill(); if (process.platform === 'win32') spawn('taskkill', ['/pid', String(preview.pid), '/f', '/t'], { stdio: 'ignore' }); }
console.log(`\n${tests.length - failed}/${tests.length} 통과`);
process.exitCode = failed ? 1 : 0;
