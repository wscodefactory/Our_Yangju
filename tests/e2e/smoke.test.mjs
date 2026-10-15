// 5개 언어로 주요 화면을 전부 열어 본다: 페이지 오류, 가로 스크롤, 외국어 화면의 한글 누수(lang="ko" 표시 없는 한글)
import { check, launch, wait } from './lib.mjs';

const { page, click, fresh, done } = await launch();
const hscroll = () => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
const koLeak = () => page.evaluate(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const out = []; let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.trim(); if (!/[가-힣]/.test(t)) continue;
    if (n.parentElement.closest('[lang="ko"],script,style')) continue;
    out.push(t);
  }
  return out;
});
// 결과 화면의 은행명·메뉴 이름은 일부러 한글 (은행 앱에서 찾는 이름)
const KNOWN = /농협|\[납부\]|\[이체\]|\(KB Kookmin\)|\(Shinhan\)|\(Woori\)|\(Hana\)|\(IBK\)|Bank\)|Post\)|\(Sh\)|\(CU\)|Credit\)/;
let screens = 0; const problems = [];
const look = async (lang, name) => {
  screens++;
  const leak = lang === 'ko' ? [] : (await koLeak()).filter((s) => !KNOWN.test(s));
  if (leak.length) problems.push(`[${lang}] ${name}: 한글 누수 ${JSON.stringify(leak.slice(0, 3).map((s) => s.slice(0, 24)))}`);
  if (await hscroll()) problems.push(`[${lang}] ${name}: 가로 스크롤`);
};
for (const lang of ['ko', 'en', 'zh', 'vi', 'ne']) {
  await fresh(lang); await look(lang, 'home');
  await click('.task', 0); await look(lang, 'visit');
  await click('.tcard-h', 0); await click('.tcard.open .btn.primary'); await page.select('.fld select', 'company'); await wait(150); await look(lang, 'visitItem');
  await click('.bbar .btn.primary'); await wait(200); await click('.show .x');
  await fresh(lang); await click('.task', 1); await look(lang, 'doc');
  await click('.stack .btn', 1); await page.waitForSelector('.canvaswrap canvas'); await look(lang, 'mask');
  await click('.bbar .btn.primary'); await wait(300); await look(lang, 'docConfirm');
  await click('.bbar .btn.primary'); await wait(400); await look(lang, 'docResult');
  for (let i = 1; i < 3; i++) { await click('.seg button', i); await look(lang, 'docResult tab ' + i); }
  await fresh(lang); await click('.task', 2); await look(lang, 'welfare');
  await click('.bcard-main', 0); await look(lang, 'benefit');
  for (let i = 1; i < 3; i++) { await click('.seg button', i); await look(lang, 'benefit tab ' + i); }
  await fresh(lang); await click('.task', 3); await look(lang, 'life');
  await click('.row', 1); await look(lang, 'lifeItem');
  await fresh(lang); for (let i = 0; i < 3; i++) { await click('.tile', i); await look(lang, 'explore ' + i); await page.goBack(); await wait(200); }
  await click('.tools .icon-btn', 2); await look(lang, 'saved');
  await fresh(lang); await click('.tools .icon-btn:last-child'); await look(lang, 'profile');
  await fresh(lang); await click('.fab'); await wait(200); await look(lang, 'chat'); await page.keyboard.press('Escape'); await wait(200);
  await click('.tools .icon-btn', 0); await wait(200); await look(lang, 'langSheet'); await page.keyboard.press('Escape');
}
await fresh('ko', {}, '#admin');
for (let i = 0; i < 3; i++) { await click('.seg button', i); screens++; }
check(`화면 ${screens}개 열림, 오류 없음`, problems.length === 0, problems.join(' | '));
const errors = await done();
check('페이지 오류 없음', errors.length === 0, errors.join(' | '));
