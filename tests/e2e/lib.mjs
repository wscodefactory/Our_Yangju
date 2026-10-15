// 브라우저 점검 공통. 휴대폰 크기(390×740)의 헤드리스 크롬을 띄우고 자주 쓰는 동작을 묶는다.
// 크롬 경로는 CHROME_PATH, 대상 주소는 E2E_URL 로 바꾼다 (기본: 로컬 preview 4173).
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

export const URL = process.env.E2E_URL || 'http://localhost:4173/';
export const SHOTS = path.resolve('tests/e2e/shots');
fs.mkdirSync(SHOTS, { recursive: true });

const CHROME = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome');

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ width = 390, height = 740, mobile = true } = {}) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  // headless 크롬도 설치창 신호를 쏜다 → 안내 시트 경로가 보이게 막는다
  await page.evaluateOnNewDocument(() => { const o = window.addEventListener.bind(window); window.addEventListener = (t, ...a) => (t === 'beforeinstallprompt' ? undefined : o(t, ...a)); });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/404|Manifest/.test(m.text())) errors.push('console: ' + m.text().slice(0, 160)); });

  const click = async (sel, i = 0) => {
    const els = await page.$$(sel);
    if (!els[i]) throw new Error(`없음: ${sel}[${i}] (화면: ${await h1()})`);
    await els[i].evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await els[i].click();
    await wait(250);
  };
  const h1 = () => page.evaluate(() => (document.querySelector('#page-title') || document.querySelector('main h1'))?.textContent?.trim() || '-');
  const texts = (sel) => page.$$eval(sel, (els) => els.map((e) => e.textContent.trim()));
  /** 언어·내 정보 등을 심고 새로 연다. 설치 배너는 닫아 둔다 */
  const fresh = async (lang = 'ko', storage = {}, hash = '') => {
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.evaluate((l, st) => {
      localStorage.clear();
      localStorage.setItem('hy-cl', l);
      localStorage.setItem('hy-install-later', String(Date.now()));
      for (const [k, v] of Object.entries(st)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    }, lang, storage);
    if (hash) await page.goto('about:blank');
    await page.goto(URL + hash, { waitUntil: 'networkidle0' });
    await wait(250);
  };
  const shot = (name, opts = {}) => page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true, ...opts });
  const done = async () => { await browser.close(); return errors; };
  return { browser, page, click, h1, texts, fresh, shot, errors, done };
}

/** 결과 한 줄. ok 가 false 면 프로세스 종료 코드를 1 로 */
export function check(name, ok, detail = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
}
