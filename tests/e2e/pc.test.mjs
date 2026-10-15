// PC 레이아웃: 960px 이상에서 소개 패널·QR, 창 크기에 따른 확대, 고정 요소(하단 바·시트·배너·FAB)가 앱 폭에 맞는지
import { check, launch, wait } from './lib.mjs';

const { page, click, fresh, done } = await launch({ width: 1280, height: 800, mobile: false });
const rect = (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width), h: Math.round(b.height) }; }, sel);

for (const [w, h, zoom] of [[1280, 800, 1], [1920, 1080, 1.3], [2560, 1440, 1.75], [1024, 768, 1]]) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(page.url().startsWith('http') ? page.url() : 'about:blank'); await fresh('ko'); await wait(300);
  const z = Number((await page.evaluate(() => document.documentElement.style.zoom)) || 1);
  const body = await rect('body'); const desk = await rect('#desk');
  check(`${w}×${h}: 패널 보임, 확대 ${z.toFixed(2)}`, !!desk && Math.abs(z - zoom) < 0.1, `zoom ${z}`);
  check(`${w}×${h}: 패널이 앱 왼쪽에`, !!desk && desk.r <= body.l);
  const fab = await rect('.fab');
  check(`${w}×${h}: FAB 한 줄, 앱 안`, !!fab && fab.h <= 60 * z + 1 && fab.r <= body.r + 1);
  check(`${w}×${h}: 가로 스크롤 없음`, !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)));
}
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 }); await fresh('ko'); await wait(200);
check('QR 2개', (await page.$$('#desk .qr svg')).length === 2);
await click('.task', 0); await click('.tcard-h', 1); await click('.tcard.open .btn.primary'); await wait(200);
const body = await rect('body'); const bar = await rect('.bbar');
check('하단 바가 앱 폭에 정렬', bar.l === body.l && bar.w === body.w);
await page.evaluate(() => document.querySelector('.tools .icon-btn:nth-child(2)').click()); await wait(300);
const sheet = await rect('.sheet');
check('시트가 앱 폭에 정렬', sheet.l === body.l && sheet.w === body.w);
await page.keyboard.press('Escape');
await page.setViewport({ width: 390, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await wait(300);
check('휴대폰 폭으로 줄이면 패널 사라짐', !(await page.$('#desk')) && !(await page.evaluate(() => document.documentElement.style.zoom)));
const errors = await done();
check('페이지 오류 없음', errors.length === 0, errors.join(' | '));
