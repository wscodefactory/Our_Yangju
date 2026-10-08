// 앱 전역 상태의 중심. 참고용 html 의 S(state) 객체와 go/back/home/setLang/toast 를 Provider 하나로 옮겼다.
//  - 언어는 하나(ko/en/zh/vi/ne). 모든 문구가 다섯 칸 배열이라 AI 번역 없이 즉시 바뀐다 (디자인시스템 §8)
//  - 내비 스택은 history.pushState 와 같이 움직여서 휴대폰 뒤로가기가 통한다
//  - 시트·전체 화면(overlay)은 한 번에 하나. Esc 로 닫힘
//  - 큰 글씨·언어·저장 혜택은 localStorage
import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from 'react';
import { type T5 } from '@/data/content';
import * as i18n from '@/i18n';
import type { Lang } from '@/i18n';
import { benefitsStore } from '@/services/benefitsStore';
import type { PublishedBenefit, Screen, Text } from '@/types';
import { STORAGE_KEYS, storage } from '@/utils/browser';

export type Overlay =
  | { k: 'lang' }
  | { k: 'chat' }
  | { k: 'notice' }
  | { k: 'note'; id: string }
  | { k: 'full'; id: string };

export interface AppState {
  /* 언어 */
  lang: Lang;
  /** 첫 실행에서 아직 안 골랐으면 false (→ 언어 선택 화면) */
  langChosen: boolean;
  setLang: (c: Lang) => void;
  /** [ko,en,zh,vi,ne] → 현재 언어 */
  tx: (arr?: T5) => string;
  /** UI 사전 키 → 문구 */
  t: (key: string, vars?: Record<string, string | number>) => string;
  fmtDate: (s: string, opt?: Intl.DateTimeFormatOptions) => string;
  fmtRange: (a: string, b: string) => string;
  fmtWon: (n: number) => string;
  fmtNum: (n: number) => string;

  /* 큰 글씨 */
  big: boolean;
  toggleBig: () => void;

  /* 저장한 혜택 (BEN id 목록) */
  saved: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;

  /* 내비게이션 */
  nav: Screen[];
  screen: Screen;
  go: (s: Screen) => void;
  back: () => void;
  goHome: () => void;
  replaceNav: (stack: Screen[]) => void;

  /* 시트·전체 화면 */
  overlay: Overlay | null;
  openOverlay: (o: Overlay) => void;
  closeOverlay: () => void;

  /* 앱 바 제목·하단 고정 바 포털 대상 (layout/Chrome.tsx 가 채움) */
  titleEl: HTMLElement | null;
  setTitleEl: (el: HTMLElement | null) => void;
  barEl: HTMLElement | null;
  setBarEl: (el: HTMLElement | null) => void;
  /** 지금 화면이 하단 고정 바를 쓰는지. FAB 숨김·본문 여백에 쓴다 */
  barUsed: boolean;
  setBarUsed: (v: boolean) => void;

  /* 토스트 */
  toast: (msg: string) => void;
  toastMsg: string | null;

  /* 담당자 화면(#admin) 호환. 문구가 [ko,en] 두 칸이라 ko 가 아니면 영어 */
  T: (ko: string, en: string) => string;
  L: (x: Text) => string;
  published: PublishedBenefit[];
  publishBenefit: (b: PublishedBenefit) => void;
}

const Ctx = createContext<AppState | null>(null);

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (i18n.LANG_CODES as string[]).includes(v);

export function AppProvider({ children }: { children: ReactNode }) {
  /* ----- 언어 ----- */
  const [langState, setLangState] = useState<Lang | null>(() => {
    const saved = storage.get(STORAGE_KEYS.cardLang);
    return isLang(saved) ? saved : null;
  });
  const lang: Lang = langState ?? 'ko';
  const tx = useCallback((arr?: T5) => i18n.tx(arr, lang), [lang]);
  const t = useCallback((key: string, vars?: Record<string, string | number>) => i18n.t(key, lang, vars), [lang]);
  const fmtDate = useCallback((s: string, opt?: Intl.DateTimeFormatOptions) => i18n.fmtDate(s, lang, opt), [lang]);
  const fmtRange = useCallback((a: string, b: string) => i18n.fmtRange(a, b, lang), [lang]);
  const fmtWon = useCallback((n: number) => i18n.fmtWon(n, lang), [lang]);
  const fmtNum = useCallback((n: number) => i18n.fmtNum(n, lang), [lang]);
  const T = useCallback((ko: string, en: string) => (lang === 'ko' ? ko : en), [lang]);
  const L = useCallback((x: Text) => (typeof x === 'string' ? x : lang === 'ko' ? x[0] : x[1]), [lang]);

  /* ----- 큰 글씨 ----- */
  const [big, setBig] = useState(() => storage.get(STORAGE_KEYS.big) === '1');
  const toggleBig = useCallback(() => setBig((v) => { storage.set(STORAGE_KEYS.big, v ? '0' : '1'); return !v; }), []);
  useEffect(() => { document.documentElement.classList.toggle('big', big); }, [big]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  /* ----- 저장한 혜택 ----- */
  const [saved, setSaved] = useState<string[]>(() => storage.getJSON<string[]>(STORAGE_KEYS.saved, []));
  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);
  const toggleSaved = useCallback((id: string) => setSaved((prev) => {
    const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    storage.setJSON(STORAGE_KEYS.saved, next);
    return next;
  }), []);

  /* ----- 내비게이션 (history 와 동기) ----- */
  const [nav, setNav] = useState<Screen[]>(() => {
    if (location.hash === '#admin') return [{ k: 'admin', tab: 'reg' }];
    return langState ? [{ k: 'home' }] : [{ k: 'lang' }];
  });
  const navRef = useRef(nav);
  navRef.current = nav;
  const screen = nav[nav.length - 1];
  const go = useCallback((s: Screen) => { setNav((st) => [...st, s]); history.pushState({ d: Date.now() }, ''); }, []);
  const back = useCallback(() => {
    if (navRef.current.length > 1) history.back();
    else setNav([{ k: 'home' }]);
  }, []);
  const goHome = useCallback(() => {
    const n = navRef.current.length - 1;
    setNav([{ k: 'home' }]);
    if (n > 0) history.go(-n);
  }, []);
  const replaceNav = useCallback((stack: Screen[]) => {
    setNav(stack.length ? stack : [{ k: 'home' }]);
    history.pushState({ d: Date.now() }, '');
  }, []);
  useEffect(() => {
    history.replaceState({ d: 1 }, '');
    const onPop = () => setNav((st) => (st.length > 1 ? st.slice(0, -1) : st));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* ----- 시트·전체 화면 ----- */
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const openOverlay = useCallback((o: Overlay) => setOverlay(o), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOverlay(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /** 언어 고르기. 첫 실행이면 홈으로, 아니면 그 자리에서 문구만 바뀜 */
  const setLang = useCallback((c: Lang) => {
    const first = !langState;
    storage.set(STORAGE_KEYS.cardLang, c);
    setLangState(c);
    setOverlay(null);
    if (first) setNav([{ k: 'home' }]);
  }, [langState]);

  /* ----- 앱 바 제목 · 하단 바 포털 ----- */
  const [titleEl, setTitleEl] = useState<HTMLElement | null>(null);
  const [barEl, setBarEl] = useState<HTMLElement | null>(null);
  const [barUsed, setBarUsed] = useState(false);
  useEffect(() => { document.body.classList.toggle('has-bar', barUsed); }, [barUsed]);

  /* ----- 토스트 ----- */
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastMsg(null), 2600);
  }, []);

  /* ----- 담당자 게시 혜택 ----- */
  const [published, setPublished] = useState<PublishedBenefit[]>(() => benefitsStore.load());
  const publishBenefit = useCallback((b: PublishedBenefit) => setPublished(benefitsStore.add(b)), []);

  const value: AppState = {
    lang, langChosen: !!langState, setLang, tx, t, fmtDate, fmtRange, fmtWon, fmtNum,
    big, toggleBig,
    saved, isSaved, toggleSaved,
    nav, screen, go, back, goHome, replaceNav,
    overlay, openOverlay, closeOverlay,
    titleEl, setTitleEl, barEl, setBarEl, barUsed, setBarUsed,
    toast, toastMsg,
    T, L, published, publishBenefit,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <AppProvider>');
  return v;
}
