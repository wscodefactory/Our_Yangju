// 5개 언어 문자열·서식 도우미. 원본 참고용 html의 tx/t/fmt* 를 옮긴 것.
// 언어 코드(ko/en/zh/vi/ne)는 AppContext가 들고 있고, 여기 함수들은 전부 코드를 인자로 받는다.
// 화면에서는 useApp()의 tx/t/fmt* 바인딩을 쓰면 되고, 컨텍스트 밖(서비스 등)에서는 이 파일을 직접 쓴다.
import { LANGS, TODAY, UI, type T5 } from '@/data/content';

export type Lang = 'ko' | 'en' | 'zh' | 'vi' | 'ne';
export const LANG_CODES = LANGS.map((l) => l.code as Lang);

const idx = (lang: Lang) => Math.max(0, LANGS.findIndex((l) => l.code === lang));

/** [ko,en,zh,vi,ne] 배열에서 현재 언어 칸. 비어 있으면 영어로 */
export const tx = (arr: T5 | undefined, lang: Lang): string => (arr && (arr[idx(lang)] || arr[1])) || '';

/** UI 사전 키 → 문구. {n} 같은 자리표시자는 vars로 치환. 모르는 키는 키 그대로 돌려줘서 화면에서 바로 눈에 띄게 */
export function t(key: string, lang: Lang, vars?: Record<string, string | number>): string {
  const arr = (UI as Record<string, T5>)[key];
  let s = arr ? tx(arr, lang) : key;
  if (vars) for (const v in vars) s = s.replace(`{${v}}`, String(vars[v]));
  return s;
}

/* 런타임 ICU에 해당 로캘이 없으면 Intl이 브라우저 기본 로캘(예: ko)로 조용히 떨어진다.
   그래서 지원 여부를 확인하고, 없으면 영어 형식으로 폴백해 한국어가 새지 않게 한다. */
const LOC_OK: Record<string, boolean> = {};
export function loc(lang: Lang): string {
  const l = LANGS[idx(lang)].locale;
  if (!(l in LOC_OK)) {
    try { LOC_OK[l] = Intl.DateTimeFormat.supportedLocalesOf([l]).length > 0; } catch { LOC_OK[l] = false; }
  }
  return LOC_OK[l] ? l : 'en-GB';
}

export const parseDate = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

export const fmtDate = (s: string, lang: Lang, opt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) =>
  new Intl.DateTimeFormat(loc(lang), opt).format(parseDate(s));

/** 기간. 같은 날이면 하루만. 범위 구분자는 하이픈으로 통일(디자인시스템 §8).
 *  formatRange 는 브라우저·언어에 따라 서식이 들쭉날쭉해서(중국어에서 숫자형으로 떨어지는 경우가 있었다) 날짜 둘을 그냥 잇는다 */
export function fmtRange(a: string, b: string, lang: Lang): string {
  const opt: Intl.DateTimeFormatOptions = { year: 'numeric', month: lang === 'zh' ? 'long' : 'short', day: 'numeric' };
  const f = (s: string) => new Intl.DateTimeFormat(loc(lang), opt).format(parseDate(s));
  return a === b ? f(a) : `${f(a)} - ${f(b)}`;
}

/** 한국어는 "143,000원", 다른 언어는 ₩143,000 / 143.000 ₩ 처럼 로캘 통화 서식 */
export const fmtWon = (n: number, lang: Lang) =>
  lang === 'ko'
    ? `${new Intl.NumberFormat('ko-KR').format(n)}원`
    : new Intl.NumberFormat(loc(lang), { style: 'currency', currency: 'KRW', currencyDisplay: 'symbol' }).format(n);

export const fmtNum = (n: number, lang: Lang) => new Intl.NumberFormat(loc(lang)).format(n);

/** 오늘 0시 기준 남은 일수. 음수면 지남 */
export const daysUntil = (s: string) => Math.round((parseDate(s).getTime() - TODAY.getTime()) / 86400000);

/** 개발용: 다섯 칸이 안 채워진 문구를 콘솔에 경고 */
export function auditTranslations(tables: Record<string, unknown>) {
  const bad: string[] = [];
  const walk = (o: unknown, p: string) => {
    if (Array.isArray(o)) {
      if (o.length === 5 && o.every((x) => typeof x === 'string')) { if (o.some((x) => !String(x).trim())) bad.push(p); }
      else o.forEach((x, i) => walk(x, `${p}[${i}]`));
    } else if (o && typeof o === 'object') {
      for (const k in o as Record<string, unknown>) walk((o as Record<string, unknown>)[k], `${p}.${k}`);
    }
  };
  walk(tables, 'root');
  for (const k in UI) if ((UI as Record<string, T5>)[k].length !== 5) bad.push(`UI.${k}`);
  if (bad.length) console.warn('Missing translations:', bad);
}
