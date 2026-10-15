// 흐름 점검: 바로가기 주소, 홈 버튼, 설치 배너·안내 시트, 업무 상황 선택, 혜택 검색, 내 정보 → 이사 신고 D-day·결과 화면
import { URL, check, launch, wait } from './lib.mjs';

const { page, click, h1, texts, fresh, done } = await launch();

// 바로가기 (언어 있음) — 알 수 없는 값은 홈
for (const [q, exp] of [['?go=doc&from=qr', '받은 고지서'], ['?go=visit&id=reg', '외국인등록'], ['?go=welfare', '지원 혜택'], ['?go=life&id=trash', '쓰레기'], ['?go=explore&tab=events', '양주 둘러보기'], ['?go=nope', '양주 생활']]) {
  await fresh('ko', {}, q);
  check(`바로가기 ${q}`, (await h1()).includes(exp), await h1());
}
check('바로가기 뒤 주소에서 ?go= 제거', !(await page.evaluate(() => location.search)));
await fresh('ko', {}, '?go=doc&from=qr');
check('QR 진입 표시', !!(await page.$('.qr-badge')));
await page.goBack(); await wait(300);
check('QR 진입 뒤로 가기 → 홈', !!(await page.$('.hero')));

// 언어 없음 + QR → 언어 선택 안내 → 고르면 고지서
await page.goto(URL, { waitUntil: 'networkidle0' }); await page.evaluate(() => localStorage.clear());
await page.goto('about:blank'); await page.goto(URL + '?go=doc&from=qr', { waitUntil: 'networkidle0' }); await wait(250);
check('언어 전 QR 안내', !!(await page.$('.callout')));
await click('.opt', 3); await wait(300);
check('언어 고른 뒤 고지서 화면', (await h1()).includes('giấy báo'), await h1());

// 홈 버튼: 시트 열린 채 → 홈, 뒤로 가기 해도 하위 화면 안 나옴
await fresh('ko'); await click('.task', 0); await click('.tcard-h', 0); await click('.tcard.open .btn.primary'); await click('.bbar .btn.primary'); await wait(200);
await page.evaluate(() => document.querySelector('.tools .icon-btn').click()); await wait(300);
check('홈 버튼 → 홈 (시트도 닫힘)', !!(await page.$('.hero')) && !(await page.$('.show')));
await page.goBack(); await wait(300);
check('홈에서 뒤로 가기 해도 홈', !!(await page.$('.hero')));

// 설치 배너 → 안내 시트 → 나중에 보기
await page.goto(URL, { waitUntil: 'networkidle0' }); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('hy-cl', 'ko'); });
await page.goto(URL, { waitUntil: 'networkidle0' }); await wait(250);
const fabHidden = () => page.evaluate(() => { const f = document.querySelector('.fab'); return !f || getComputedStyle(f).display === 'none'; });
check('설치 배너 표시, FAB 숨김', !!(await page.$('.install')) && (await fabHidden()));
await click('.install .btn'); await wait(300);
check('설치 안내 시트', (await page.$$('ol.steps li')).length === 3);
await click('.sheet .icon-btn'); await wait(200); await click('.install .later'); await wait(200);
check('나중에 보기 → 배너 숨김, FAB 복귀', !(await page.$('.install')) && !(await fabHidden()));

// 업무 상세: 상황 고르면 준비물이 늘어남
await fresh('ko'); await click('.task', 0); await click('.tcard-h', 0); await click('.tcard.open .btn.primary');
const before = (await page.$$('.check')).length; await page.select('.fld select', 'company'); await wait(200);
check('상황 선택 → 준비물 추가', (await page.$$('.check')).length > before);
for (const lang of ['ko', 'vi', 'ne']) {
  await fresh(lang); await click('.task', 0);
  const hgt = await page.evaluate(() => document.documentElement.scrollHeight);
  check(`업무 목록 한 화면 (${lang} 390×740)`, hgt <= 740, `${hgt}px`);
}

// 혜택 검색
await fresh('ko'); await click('.task', 2); await page.type('.search input', '월세'); await wait(200);
check('혜택 검색 "월세"', (await texts('.bcard .t')).some((t) => t.includes('월세')));

// 내 정보 → 이사 신고 D-day·관할 센터·가족 서류 → 결과 화면 은행 앱
const moved = new Date(); moved.setDate(moved.getDate() - 4);
await fresh('ko', { 'hy-profile': { visa: 'e7', area: 'nam', movedOn: moved.toISOString().slice(0, 10), housing: 'company', family: true, nhisSelf: true, car: true, bank: 'KB국민' } });
check('내 정보 있으면 홈 안내 카드 없음', !(await page.$('.promo')));
await click('.task', 0); await click('.tcard-h', 0); await click('.tcard.open .btn.primary'); await wait(200);
check('이사 신고 D-11 띠', (await page.$eval('.dday .n', (e) => e.textContent)) === 'D-11');
check('관할 센터·주소·전화', (await page.$eval('.kv dd', (e) => e.textContent)).includes('남면 행정복지센터') && !!(await page.$('.kv dd a[href^="tel:"]')));
check('가족 서류 포함', (await texts('.check span')).some((t) => t.includes('가족')));
await click('.dday .acts button', 0); await wait(200);
check('신고 끝냈어요 → 띠 사라짐', !(await page.$('.dday')));
await page.evaluate(() => document.querySelector('.tools .icon-btn').click()); await wait(200);
await click('.task', 1); await click('.stack .btn', 1); await page.waitForSelector('.canvaswrap canvas'); await click('.bbar .btn.primary'); await wait(200); await click('.bbar .btn.primary'); await wait(300);
check('결과 화면 내 은행 앱', (await page.$eval('.panel p', (e) => e.textContent)).includes('KB국민'));
check('건강보험 직접 납부 안내', (await page.$$('.callout.info')).length >= 1);

const errors = await done();
check('페이지 오류 없음', errors.length === 0, errors.join(' | '));
