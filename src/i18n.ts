// 다국어 문구 선택과 날짜·금액 서식. 화면에서는 useApp으로 언어를 연결해 사용한다.
import { LANGS, TODAY, UI, type T5 } from '@/data/content';

export type Lang = 'ko' | 'en' | 'zh' | 'vi' | 'ne';
export const LANG_CODES = LANGS.map((l) => l.code as Lang);

const languageIndex = (lang: Lang) => Math.max(0, LANGS.findIndex((l) => l.code === lang));

/** [ko,en,zh,vi,ne] 배열에서 현재 언어 칸. 비어 있으면 영어로 */
export const tx = (arr: T5 | undefined, lang: Lang): string => (arr && (arr[languageIndex(lang)] || arr[1])) || '';

/** {n} 같은 자리표시자를 vars 로 치환 */
export function fill(text: string, vars?: Record<string, string | number>): string {
  if (vars) for (const key in vars) text = text.replace(`{${key}}`, String(vars[key]));
  return text;
}

/** UI 사전 키 → 문구. 모르는 키는 키 그대로 돌려줘서 화면에서 바로 눈에 띄게 */
export function t(key: string, lang: Lang, vars?: Record<string, string | number>): string {
  const translations = (UI as Record<string, T5>)[key];
  return fill(translations ? tx(translations, lang) : key, vars);
}

// 런타임 ICU 에 해당 로캘이 없으면 Intl 이 브라우저 기본 로캘(예: ko)로 조용히 떨어진다.
// 그래서 지원 여부를 확인하고, 없으면 영어 형식으로 폴백해 한국어가 새지 않게 한다.
const localeSupport: Record<string, boolean> = {};
export function loc(lang: Lang): string {
  const locale = LANGS[languageIndex(lang)].locale;
  if (!(locale in localeSupport)) {
    try { localeSupport[locale] = Intl.DateTimeFormat.supportedLocalesOf([locale]).length > 0; } catch { localeSupport[locale] = false; }
  }
  return localeSupport[locale] ? locale : 'en-GB';
}

export const parseDate = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

export const fmtDate = (s: string, lang: Lang, opt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) =>
  new Intl.DateTimeFormat(loc(lang), opt).format(parseDate(s));

/** 날짜가 같으면 한 번만 표시한다. 언어별 형식을 유지하기 위해 두 날짜를 각각 포맷한다. */
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
  const missingTranslations: string[] = [];
  const visitTranslations = (value: unknown, path: string) => {
    if (Array.isArray(value)) {
      if (value.length === 5 && value.every((x) => typeof x === 'string')) { if (value.some((x) => !String(x).trim())) missingTranslations.push(path); }
      else value.forEach((x, i) => visitTranslations(x, `${path}[${i}]`));
    } else if (value && typeof value === 'object') {
      for (const k in value as Record<string, unknown>) visitTranslations((value as Record<string, unknown>)[k], `${path}.${k}`);
    }
  };
  visitTranslations(tables, 'root');
  for (const k in UI) if ((UI as Record<string, T5>)[k].length !== 5) missingTranslations.push(`UI.${k}`);
  if (missingTranslations.length) console.warn('Missing translations:', missingTranslations);
}
