// 실제 API 연결 점검. E2E_URL이 없으면 건너뛰며, 지정하면 API 비용과 호출 한도를 사용한다.
import path from 'node:path';
import { URL, check, launch, wait } from './lib.mjs';

if (!process.env.E2E_URL) { console.log('E2E_URL 이 없어 건너뜀 (배포본 대상 전용)'); process.exit(0); }
const { page, click, fresh, done } = await launch();
const posts = []; page.on('response', (r) => { if (r.url().includes('workers.dev') && r.request().method() === 'POST') posts.push(r.status()); });
await fresh('ko');

const t0 = Date.now();
await click('.fab'); await page.type('#ask-in', '양주에서 외국인도 도서관 회원 가입할 수 있나요'); await page.keyboard.press('Enter');
for (let i = 0; i < 100; i++) { await wait(300); const last = await page.evaluate(() => [...document.querySelectorAll('.msg.bot')].pop()?.textContent || ''); if (last && !last.includes('…')) break; }
const answer = await page.evaluate(() => [...document.querySelectorAll('.msg.bot')].pop()?.textContent.trim());
check(`상담 응답 ${((Date.now() - t0) / 1000).toFixed(1)}s`, posts.length === 1 && posts[0] === 200, answer.slice(0, 60));
await page.keyboard.press('Escape'); await wait(200);

await click('.task', 1);
await (await page.$('input[type=file]')).uploadFile(path.resolve('tests/notices/sample-auto-143000.png')); await wait(800);
const t1 = Date.now();
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('AI'))?.click());
for (let i = 0; i < 100; i++) { await wait(300); if (await page.$('.toast')) break; }
check(`가릴 곳 찾기 ${((Date.now() - t1) / 1000).toFixed(1)}s`, (await page.$eval('.toast', (e) => e.textContent)).includes('찾았어요'));
await click('.bbar .btn.primary');
const t2 = Date.now();
for (let i = 0; i < 150; i++) { await wait(300); if (await page.$('#f-amt')) break; }
const amt = await page.$eval('#f-amt', (e) => e.value).catch(() => '');
check(`고지서 읽기 ${((Date.now() - t2) / 1000).toFixed(1)}s, 금액 ${amt}`, amt.replace(/\D/g, '') === '143000');
check('중계 서버 응답 전부 200', posts.every((s) => s === 200), JSON.stringify(posts));
const errors = await done();
check('페이지 오류 없음', errors.length === 0, errors.join(' | '));
console.log('대상:', URL);
