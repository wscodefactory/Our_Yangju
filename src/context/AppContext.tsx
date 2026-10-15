// 앱 설정과 화면 이동 상태. 화면·시트의 뒤로 가기는 브라우저 history와 함께 처리한다.
import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from 'react';
import { type T5 } from '@/data/content';
import EASY_KO from '@/data/easy-ko.json';
import * as i18n from '@/i18n';
import type { Lang } from '@/i18n';
import { benefitsStore } from '@/services/benefitsStore';
import type { PublishedBenefit, Screen } from '@/types';
import { STORAGE_KEYS, stopSpeaking, storage } from '@/utils/browser';
import { readDeepLink } from '@/utils/deeplink';

export type Overlay =
  | { k: 'lang' }
  | { k: 'chat' }
  | { k: 'notice' }
  | { k: 'note'; id: string }
  | { k: 'full'; id: string }
  | { k: 'install' };

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
  /** 쉬운 한국어 (한국어 화면 전용). 켜면 t() 가 easy-ko.json 문장을 우선 쓴다 */
  easy: boolean;
  toggleEasy: () => void;

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
  /** 스택을 통째로 바꾼다. 길어지면 history 도 한 칸 늘고, 같은 길이면 맨 위만 바꿔치기 */
  replaceNav: (stack: Screen[]) => void;
  /** 맨 위 화면만 바꿔치기 (history 항목은 그대로). "읽는 중" 처럼 스택에 남으면 안 되는 화면이 결과로 넘어갈 때 */
  replace: (s: Screen) => void;
  /** 고지서 QR(?go=doc&from=qr) 로 들어와 아직 다른 화면으로 안 옮긴 상태 — 고지서 첫 화면에 표시 */
  qrEntry: boolean;
  /** 언어를 고르기 전인데 QR 바로가기가 기다리는 중 — 언어 선택 화면 안내 */
  pendingQr: boolean;

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

  /* 담당자 화면(#admin). 문구가 [ko,en] 두 칸이라 ko 가 아니면 영어 */
  T: (ko: string, en: string) => string;
  published: PublishedBenefit[];
  publishBenefit: (b: PublishedBenefit) => void;
}

const Ctx = createContext<AppState | null>(null);

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (i18n.LANG_CODES as string[]).includes(v);

export function AppProvider({ children }: { children: ReactNode }) {
  /* 언어 */
  const [langState, setLangState] = useState<Lang | null>(() => {
    const saved = storage.get(STORAGE_KEYS.cardLang);
    return isLang(saved) ? saved : null;
  });
  const lang: Lang = langState ?? 'ko';
  const tx = useCallback((arr?: T5) => i18n.tx(arr, lang), [lang]);

  /* 쉬운 한국어 */
  // 한국어 화면에서만. 켜면 UI 사전의 긴 문장을 미리 다듬어 둔 쉬운 문장(easy-ko.json)으로 바꾼다
  const [easy, setEasy] = useState(() => storage.get(STORAGE_KEYS.easy) === '1');
  const toggleEasy = useCallback(() => setEasy((v) => { storage.set(STORAGE_KEYS.easy, v ? '0' : '1'); return !v; }), []);
  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const e = lang === 'ko' && easy ? (EASY_KO as Record<string, string>)[key] : undefined;
    return e ? i18n.fill(e, vars) : i18n.t(key, lang, vars);
  }, [lang, easy]);
  const fmtDate = useCallback((s: string, opt?: Intl.DateTimeFormatOptions) => i18n.fmtDate(s, lang, opt), [lang]);
  const fmtRange = useCallback((a: string, b: string) => i18n.fmtRange(a, b, lang), [lang]);
  const fmtWon = useCallback((n: number) => i18n.fmtWon(n, lang), [lang]);
  const fmtNum = useCallback((n: number) => i18n.fmtNum(n, lang), [lang]);
  const T = useCallback((ko: string, en: string) => (lang === 'ko' ? ko : en), [lang]);

  /* 큰 글씨 */
  const [big, setBig] = useState(() => storage.get(STORAGE_KEYS.big) === '1');
  const toggleBig = useCallback(() => setBig((v) => { storage.set(STORAGE_KEYS.big, v ? '0' : '1'); return !v; }), []);
  useEffect(() => { document.documentElement.classList.toggle('big', big); }, [big]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  /* 저장한 혜택 */
  const [saved, setSaved] = useState<string[]>(() => storage.getJSON<string[]>(STORAGE_KEYS.saved, []));
  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);
  const toggleSaved = useCallback((id: string) => setSaved((prev) => {
    const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    storage.setJSON(STORAGE_KEYS.saved, next);
    return next;
  }), []);

  /* 시트 상태 (내비게이션이 참조하므로 먼저 선언) */
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  overlayRef.current = overlay;

  /* 내비게이션 */
  // 불변식: history 항목 수 = nav.length - 1 + (시트가 열려 있으면 1). 시트도 history 한 칸을 차지한다.
  // 바로가기(?go=): 언어가 있으면 '홈, 목적지' 로 쌓아 뒤로 가기가 홈으로 가게 하고, 없으면 언어를 고를 때까지 기억
  const [deep] = useState(readDeepLink);
  const [pending, setPending] = useState(() => (deep && !langState ? deep : null));
  const [qrEntry, setQrEntry] = useState(!!deep?.qr);
  const [nav, setNav] = useState<Screen[]>(() => {
    if (location.hash === '#admin') return [{ k: 'admin', tab: 'reg' }];
    if (!langState) return [{ k: 'lang' }];
    return deep ? [{ k: 'home' }, deep.screen] : [{ k: 'home' }];
  });
  const navRef = useRef(nav);
  navRef.current = nav;
  const screen = nav[nav.length - 1];

  // 시트가 열린 채 화면을 옮기면(AI 상담 → 이동) 시트의 history 칸을 새 화면 칸으로 바꿔 쓴다
  const go = useCallback((s: Screen) => {
    setQrEntry(false);
    setNav((st) => [...st, s]);
    if (overlayRef.current) { setOverlay(null); history.replaceState(null, ''); } else history.pushState(null, '');
  }, []);
  const back = useCallback(() => {
    if (navRef.current.length > 1) history.back();
    else setNav([{ k: 'home' }]);
  }, []);
  // 한 번에 홈으로: 열린 시트의 history 칸까지 같이 되감아 홈에서 뒤로 가기를 눌러도 방금 화면이 다시 안 나온다
  const goHome = useCallback(() => {
    const n = navRef.current.length - 1 + (overlayRef.current ? 1 : 0);
    setQrEntry(false);
    setOverlay(null);
    setNav([{ k: 'home' }]);
    if (n > 0) history.go(-n);
  }, []);
  // back 후 go를 연달아 호출하면 popstate와 충돌하므로 현재 항목을 직접 바꾼다.
  const replace = useCallback((s: Screen) => {
    setNav((st) => [...st.slice(0, -1), s]);
    history.replaceState(null, '');
  }, []);
  const replaceNav = useCallback((stack: Screen[]) => {
    const next = stack.length ? stack : [{ k: 'home' } as Screen];
    const grew = next.length > navRef.current.length;
    setNav(next);
    // 시트가 열려 있으면 그 칸을 새 화면 칸으로 쓴다. 같은 길이(담당자 탭 전환)면 history 칸을 늘리지 않는다
    if (overlayRef.current) { setOverlay(null); history.replaceState(null, ''); }
    else if (grew) history.pushState(null, '');
    else history.replaceState(null, '');
  }, []);
  const historyReady = useRef(false);
  useEffect(() => {
    // StrictMode 는 effect 를 두 번 돌리는데 history 칸이 두 번 쌓이면 안 된다
    if (!historyReady.current) {
      historyReady.current = true;
      history.replaceState(null, '');
      // 바로가기로 '홈, 목적지' 두 칸으로 시작했으면 history 도 두 칸
      if (navRef.current.length > 1) history.pushState(null, '');
    }
    // 뒤로 가기: 시트가 열려 있으면 시트만 닫는다
    const onPop = () => { if (overlayRef.current) { setOverlay(null); return; } setNav((st) => (st.length > 1 ? st.slice(0, -1) : st)); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* 시트·전체 화면 */
  // 화면이 바뀌거나 시트가 닫히면 읽어주기를 멈춘다 (뒤로 가기 포함). 안 그러면 다음 화면에서도 계속 들린다
  useEffect(() => { stopSpeaking(); }, [nav, overlay]);
  // 열 때 push, 닫을 때는 history.back() → popstate 가 닫는다. 닫기 버튼·Esc·바깥 탭·휴대폰 뒤로 가기가 전부 같은 길
  const openOverlay = useCallback((o: Overlay) => { setOverlay(o); history.pushState(null, ''); }, []);
  const closeOverlay = useCallback(() => { if (overlayRef.current) history.back(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOverlay(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeOverlay]);

  /** 언어 고르기. 첫 실행이면 홈(또는 기다리던 QR 목적지)으로, 아니면 그 자리에서 문구만 바뀜 */
  const setLang = useCallback((c: Lang) => {
    const first = !langState;
    storage.set(STORAGE_KEYS.cardLang, c);
    setLangState(c);
    if (overlayRef.current) history.back();
    if (!first) return;
    if (pending) {
      setNav([{ k: 'home' }, pending.screen]);
      history.pushState(null, '');
      setPending(null);
    } else {
      setNav([{ k: 'home' }]);
    }
  }, [langState, pending]);

  /* 앱 바 제목 · 하단 바 포털 */
  const [titleEl, setTitleEl] = useState<HTMLElement | null>(null);
  const [barEl, setBarEl] = useState<HTMLElement | null>(null);
  const [barUsed, setBarUsed] = useState(false);
  useEffect(() => { document.body.classList.toggle('has-bar', barUsed); }, [barUsed]);

  /* 토스트 */
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastMsg(null), 2600);
  }, []);

  /* 담당자 게시 혜택 */
  const [published, setPublished] = useState<PublishedBenefit[]>(() => benefitsStore.load());
  const publishBenefit = useCallback((b: PublishedBenefit) => setPublished(benefitsStore.add(b)), []);

  const value: AppState = {
    lang, langChosen: !!langState, setLang, tx, t, fmtDate, fmtRange, fmtWon, fmtNum,
    big, toggleBig, easy, toggleEasy,
    saved, isSaved, toggleSaved,
    nav, screen, go, back, goHome, replaceNav, replace,
    qrEntry, pendingQr: !!pending?.qr,
    overlay, openOverlay, closeOverlay,
    titleEl, setTitleEl, barEl, setBarEl, barUsed, setBarUsed,
    toast, toastMsg,
    T, published, publishBenefit,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <AppProvider>');
  return v;
}
