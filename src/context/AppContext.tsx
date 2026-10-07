// 앱 전역 상태의 중심. 원본 index.html에선 전부 전역 변수(lang, cl, nav, mine, ...)와
// render() 한 방으로 돌아가던 걸 Provider 하나로 모았다.
// 언어 · 큰 글씨 · 내비게이션 스택 · 내 혜택 체크 · 담당자 게시 혜택 · 토스트가 여기 있고,
// Header/Chrome/ScreenRouter와 거의 모든 화면이 useApp()으로 꺼내 쓴다.
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { CARD_LANGS } from '@/data/tax';
import { YOUTH_STAGES } from '@/data/benefits';
import { benefitsStore } from '@/services/benefitsStore';
import type { CardLang, PublishedBenefit, Screen, Stage, Text, UiLang } from '@/types';
import { STORAGE_KEYS, storage } from '@/utils/browser';
import { pick } from '@/utils/lang';
import { publishedToBenefit } from '@/utils/rule';

export interface AppState {
  /* 언어
   *
   * 언어가 둘로 나뉘어 있는 이유:
   *  - lang(UiLang, ko/en): 메뉴·버튼·설명 등 화면 전체 문구. 데이터가 전부 [ko, en] 쌍이라 둘뿐이다.
   *  - cardLang(CardLang, ko/en/zh/vi/ne): 고지서 "할 일 카드"와 안내문처럼 외국인 주민이 직접 읽는
   *    부분만 모국어로. 중국어·베트남어·네팔어 UI 전체를 미리 번역해 둘 순 없으니 그 부분만 AI 번역으로
   *    메운다(useTranslate). 그래서 zh를 골라도 UI는 en으로 뜨고 카드만 zh가 된다.
   */
  lang: UiLang;
  /** 사용자가 직접 고른 카드 언어. 아직 안 골랐으면 null (→ 첫 화면이 언어 선택) */
  cardLang: CardLang | null;
  /** [ko,en] → 현재 UI 언어 */
  L: (x: Text) => string;
  /** 한국어/영어 중 현재 UI 언어 */
  T: (ko: string, en: string) => string;
  /** 카드 언어 (미선택 시 UI 언어) */
  cl: CardLang;
  /** 카드 언어만 바꿈 (DocScreen/CardScreen의 LangRow). UI 언어는 그대로 */
  setCardLang: (c: CardLang) => void;
  /** 언어 선택 화면에서 고름: 카드 언어 + UI 언어 동시 설정 */
  chooseLanguage: (c: CardLang) => void;
  /** 헤더의 KO/EN 토글 */
  toggleUiLang: () => void;

  /* 큰 글씨 */
  big: boolean;
  toggleBig: () => void;

  /* 내비게이션
   *
   * 라우터 없이 Screen 배열 하나를 스택으로 쓴다. 맨 끝이 현재 화면(screen).
   *  - go(s): push. 뒤로가기 한 번이면 이전 화면으로 돌아온다.
   *  - back(): pop. 스택이 하나뿐이면 홈으로 리셋(빈 스택이 되지 않게).
   *  - replaceNav(stack): 스택 통째로 교체. 양주무관이 "이 단계 보기 →" 로 깊은 화면에 꽂아 넣을 때,
   *    담당자 화면 탭 전환처럼 뒤로가기 경로까지 정해 주고 싶을 때 쓴다.
   *  - goHome(): [{k:'home'}] 으로 리셋.
   * URL과는 연결돼 있지 않다(원본도 그랬고, 시안이라 새로고침하면 홈부터).
   */
  nav: Screen[];
  screen: Screen;
  go: (s: Screen) => void;
  back: () => void;
  replaceNav: (stack: Screen[]) => void;
  goHome: () => void;

  /* 내 혜택 — "stageId:index" 키를 가진 집합. localStorage에 저장 */
  mine: Record<string, 1>;
  mineKey: (stageId: string, i: number) => string;
  isMine: (stageId: string, i: number) => boolean;
  toggleMine: (stageId: string, i: number) => void;

  /* 혜택 데이터 (담당자 게시분 포함)
   * 화면은 YOUTH_STAGES를 직접 import 하지 말고 이쪽을 써야 게시된 혜택이 같이 보인다 */
  youthStages: Stage[];
  stageById: (id: string) => Stage | undefined;
  /** 담당자 게시. 저장 후 그 혜택이 들어간 단계를 돌려줘서 바로 이동할 수 있게 */
  publishBenefit: (b: PublishedBenefit) => Stage;

  /* 토스트 */
  toast: (msg: string) => void;
  toastMsg: string | null;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  /* ----- 언어 ----- */
  // 저장된 값이 CARD_LANGS 밖이면(예전 버전 키 등) 무시하고 null → 언어 선택 화면부터
  const [cardLang, setCardLangState] = useState<CardLang | null>(() => {
    const saved = storage.get(STORAGE_KEYS.cardLang) as CardLang | null;
    return saved && CARD_LANGS.includes(saved) ? saved : null;
  });
  const [lang, setLang] = useState<UiLang>(() => {
    if (storage.get(STORAGE_KEYS.lang) === 'en') return 'en';
    return 'ko';
  });
  // 카드 언어를 아직 안 골랐으면 UI 언어를 따라간다
  const cl: CardLang = cardLang ?? (lang === 'en' ? 'en' : 'ko');
  const L = useCallback((x: Text) => pick(x, lang), [lang]);
  const T = useCallback((ko: string, en: string) => (lang === 'en' ? en : ko), [lang]);

  // 화면 안에서 카드 언어만 바꾸는 건 저장하지 않는다. 저장은 chooseLanguage에서만.
  // (고지서 화면에서 잠깐 다른 언어로 보여준 게 다음 방문 때 기본값이 되면 헷갈려서)
  const setCardLang = useCallback((c: CardLang) => setCardLangState(c), []);

  /* ----- 큰 글씨 ----- */
  // html 요소에 .big 클래스만 토글. 글자 크기는 CSS 변수가 알아서.
  const [big, setBig] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle('big', big); }, [big]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? 'Our Yangju' : '한눈에 양주';
  }, [lang]);

  /* ----- 내비게이션 ----- */
  // 첫 방문(카드 언어 없음)이면 언어 선택부터, 아니면 바로 홈
  const [nav, setNav] = useState<Screen[]>(() => (cardLang ? [{ k: 'home' }] : [{ k: 'lang' }]));
  const screen = nav[nav.length - 1];
  const go = useCallback((s: Screen) => setNav((stack) => [...stack, s]), []);
  // 스택이 1개일 때 back 하면 빈 배열이 돼서 screen이 undefined가 되므로 홈으로
  const back = useCallback(() => setNav((stack) => (stack.length > 1 ? stack.slice(0, -1) : [{ k: 'home' }])), []);
  const replaceNav = useCallback((stack: Screen[]) => setNav(stack.length ? stack : [{ k: 'home' }]), []);
  const goHome = useCallback(() => setNav([{ k: 'home' }]), []);

  /**
   * 언어 선택 화면(LangScreen)에서 호출. 카드 언어를 저장하고,
   * UI 언어는 ko면 ko, 나머지(en/zh/vi/ne)는 전부 en으로 맞춘 다음 홈으로.
   */
  const chooseLanguage = useCallback((c: CardLang) => {
    storage.set(STORAGE_KEYS.cardLang, c);
    setCardLangState(c);
    const ui: UiLang = c === 'ko' ? 'ko' : 'en';
    storage.set(STORAGE_KEYS.lang, ui);
    setLang(ui);
    setNav([{ k: 'home' }]);
  }, []);

  const toggleUiLang = useCallback(() => {
    setLang((prev) => {
      const next: UiLang = prev === 'en' ? 'ko' : 'en';
      storage.set(STORAGE_KEYS.lang, next);
      return next;
    });
    // '본선에서' 화면은 라벨이 언어에 묶여 있어 홈으로 되돌림 (원본 동작)
    // soon 화면의 l 값이 이미 번역된 문자열이라, 언어를 바꿔도 그 문자열은 안 바뀌기 때문
    setNav((stack) => stack.map((s) => (s.k === 'soon' ? { k: 'home' } : s)));
  }, []);

  /* ----- 내 혜택 ----- */
  // 키는 "stageId:인덱스". 혜택에 고유 id가 없어서 단계 내 위치로 식별한다.
  // 데이터 순서가 바뀌면 체크가 엉뚱한 항목에 붙을 수 있다 — 시안이라 감수. 서버 붙으면 id로.
  const [mine, setMine] = useState<Record<string, 1>>(() => storage.getJSON(STORAGE_KEYS.mine, {}));
  useEffect(() => { storage.setJSON(STORAGE_KEYS.mine, mine); }, [mine]);
  const mineKey = useCallback((stageId: string, i: number) => `${stageId}:${i}`, []);
  const isMine = useCallback((stageId: string, i: number) => !!mine[`${stageId}:${i}`], [mine]);
  const toggleMine = useCallback((stageId: string, i: number) => {
    const key = `${stageId}:${i}`;
    setMine((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = 1;
      return next;
    });
  }, []);

  /* ----- 혜택 데이터 + 담당자 게시분 ----- */
  // 담당자가 공고문으로 등록한 혜택은 benefitsStore(localStorage)에 따로 있고,
  // 화면에 보여줄 땐 YOUTH_STAGES의 해당 단계 items 뒤에 끼워 넣는다.
  // 정적 데이터 쪽에 isNew가 붙은 항목이 있으면 먼저 걷어내는데, 게시분이 isNew: true로 들어오니까
  // 두 번 표시되지 않게 하려는 것. (현재 정적 데이터엔 isNew 항목이 없지만 안전장치로 둠)
  const [published, setPublished] = useState<PublishedBenefit[]>(() => benefitsStore.load());
  const youthStages = useMemo<Stage[]>(() => {
    const stages = YOUTH_STAGES.map((st) => ({ ...st, items: st.items.filter((b) => !b.isNew) }));
    // 최신 게시분이 뒤에 오도록(원본: 오래된 것부터 push)
    // store는 최신이 앞이라 뒤집어서 돈다. 모르는 stage id가 오면 '독립·주거'로 몰아넣음.
    [...published].reverse().forEach((pub) => {
      const target = stages.find((st) => st.id === pub.stage) || stages.find((st) => st.id === 'indep')!;
      target.items = [...target.items, publishedToBenefit(pub)];
    });
    return stages;
  }, [published]);
  const stageById = useCallback((id: string) => youthStages.find((st) => st.id === id), [youthStages]);
  // 반환값은 YOUTH_STAGES 원본 Stage. 호출부(RegisterPanel)는 id만 써서 이동하므로 items 최신 여부는 상관없다.
  const publishBenefit = useCallback((b: PublishedBenefit) => {
    setPublished(benefitsStore.add(b));
    return YOUTH_STAGES.find((st) => st.id === b.stage) || YOUTH_STAGES.find((st) => st.id === 'indep')!;
  }, []);

  /* ----- 토스트 ----- */
  // 한 번에 하나만. 연달아 부르면 앞 타이머를 지우고 새 메시지로 덮는다. 3.2초는 원본 값.
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastMsg(null), 3200);
  }, []);

  // value 객체를 useMemo로 감싸지 않았다. 어차피 lang/nav/mine 중 하나는 거의 매번 바뀌고,
  // 소비하는 컴포넌트 수가 많지 않아 체감 차이가 없었다.
  const value: AppState = {
    lang, cardLang, L, T, cl, setCardLang, chooseLanguage, toggleUiLang,
    big, toggleBig: () => setBig((prev) => !prev),
    nav, screen, go, back, replaceNav, goHome,
    mine, mineKey, isMine, toggleMine,
    youthStages, stageById, publishBenefit,
    toast, toastMsg,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** AppProvider 바깥에서 부르면 바로 던진다. 조용히 기본값으로 돌아가는 것보다 낫다 */
export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <AppProvider>');
  return v;
}
