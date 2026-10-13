// 화면 바깥 고정 요소: 앱 바, 제목·하단 바 포털, FAB, 푸터, 토스트, 본문 바로가기.
// 참고용 html 의 renderHeader / renderFoot / bbar / fab / toast 에 해당한다.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Ic } from '@/components/ui/Ic';
import { useApp, type Overlay } from '@/context/AppContext';
import { LANGS } from '@/data/content';
import { storage } from '@/utils/browser';

// 로고: 한국어는 국문 시그니처(심벌 + '양주시'), 다른 언어는 심벌마크(YangJu)만. 외국어 화면에 한글이 남지 않게 (2차 개선점검 3.4)
const LOGO_KO = `${import.meta.env.BASE_URL}yangju-ci.png`;
const LOGO_SYMBOL = `${import.meta.env.BASE_URL}yangju-symbol.png`;
export const logoFor = (lang: string, chosen: boolean) => (lang === 'ko' || !chosen ? LOGO_KO : LOGO_SYMBOL);

/**
 * 앱 바. 홈·언어 화면은 양주시 CI + 서비스명, 하위 화면은 뒤로 버튼 + 제목(<Title> 이 포털로 채움).
 * 도구 버튼 3개(지구본·Aa·북마크)는 언어 선택 화면에서만 숨긴다 (디자인시스템 §6).
 */
export function AppBar() {
  const { screen, lang, langChosen, t, big, toggleBig, saved, goHome, back, go, openOverlay, setTitleEl } = useApp();
  const root = screen.k === 'home' || screen.k === 'lang';
  const n = saved.length;
  const native = LANGS.find((l) => l.code === lang)?.native ?? '';
  const onLang = screen.k === 'lang';
  return (
    <header className="appbar">
      <div className={`appbar-in ${root ? '' : 'sub'}`}>
        {root ? (
          <a className="brand" href="#" onClick={(e) => { e.preventDefault(); if (!onLang) goHome(); }} aria-label={`${t('appName')}, ${t('aHome')}`}>
            <span className="logo-plate"><img src={logoFor(lang, langChosen)} alt={t('city')} width={58} height={40} /></span>
            <span className="brand-div" aria-hidden="true" />
            {/* 언어를 고르기 전에는 한국어·영어 병기 (3.2) */}
            {onLang
              ? <span className="brand-txt"><strong><span lang="ko">한눈에 양주</span> / <span lang="en">Our Yangju</span></strong><small><span lang="ko">양주시 생활 안내</span> / <span lang="en">Yangju City living guide</span></small></span>
              : <span className="brand-txt"><strong>{t('appName')}</strong><small>{t('appSub')}</small></span>}
          </a>
        ) : (
          <>
            <button type="button" className="icon-btn" onClick={back} aria-label={t('aBack')}><Ic n="back" /></button>
            {/* 제목 글자는 각 화면이 <Title> 로 넣는다 */}
            <h1 className="bar-title" id="page-title" tabIndex={-1} ref={setTitleEl} />
          </>
        )}
        {screen.k !== 'lang' && (
          <nav className="tools" aria-label="tools">
            {/* 홈 버튼: 하위 화면에서만. QR·공유 링크로 깊은 화면에 들어온 사람이 한 번에 처음으로 (3차 개선제안 3장) */}
            {!root && <button type="button" className="icon-btn tip" onClick={goHome} aria-label={t('aHomeBtn')} data-tip={t('aHomeBtn')}><Ic n="house" /></button>}
            <button type="button" className="icon-btn tip" onClick={() => openOverlay({ k: 'lang' })} aria-haspopup="dialog" aria-label={`${t('aLang')} (${native})`} data-tip={t('aLang')}><Ic n="globe" /></button>
            <button type="button" className="icon-btn tip" onClick={toggleBig} aria-pressed={big} aria-label={t('aText')} data-tip={t('aText')}><Ic n="textsize" /></button>
            <button type="button" className="icon-btn tip" onClick={() => { if (screen.k !== 'saved') go({ k: 'saved' }); }} aria-current={screen.k === 'saved' ? 'page' : undefined} aria-label={`${t('aSaved')}${n ? ` (${n})` : ''}`} data-tip={t('aSaved')}>
              <Ic n="bookmark" />{n > 0 && <span className="badge" aria-hidden="true">{n}</span>}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

/** 하위 화면 제목. 앱 바의 <h1> 안으로 포털되고 document.title 도 맞춘다 */
export function Title({ children }: { children: string }) {
  const { titleEl, t } = useApp();
  useEffect(() => { document.title = `${children} | ${t('appName')}`; }, [children, t]);
  // 아이콘 4개 옆에서 30자 넘는 제목(베트남어 혜택 이름 등)이 잘리지 않게 글자를 줄이고 3줄까지
  useEffect(() => { titleEl?.classList.toggle('long', children.length > 30); }, [titleEl, children]);
  return titleEl ? createPortal(children, titleEl) : null;
}

/** 하단 고정 바. 화면당 하나. 안에 .btn 들을 넣는다 (참고용 html 의 bar:) */
export function BottomBar({ children }: { children: ReactNode }) {
  const { barEl, setBarUsed } = useApp();
  useEffect(() => { setBarUsed(true); return () => setBarUsed(false); }, [setBarUsed]);
  return barEl ? createPortal(children, barEl) : null;
}

/** BottomBar 가 포털로 들어갈 자리. App 에서 한 번 렌더 */
export function BarHost() {
  const { setBarEl, barUsed } = useApp();
  return <div className="bbar" ref={setBarEl} hidden={!barUsed} />;
}

// FAB 를 숨기는 화면: 하단 바가 있거나 전용 연락 수단이 있는 화면 (디자인시스템 §7.2)
// lifeItem 은 다른 연락 수단이 없는 화면이 있어(쓰레기·교통·일) FAB 를 남긴다 (2차 개선점검 3.2)
const NO_FAB = new Set(['lang', 'visitItem', 'doc', 'mask', 'reading', 'docConfirm', 'docResult', 'benefit', 'admin', 'counter']);

/** 오른쪽 아래 "AI 상담" 플로팅 버튼. 한 화면에 AI 진입점은 이것 하나 */
export function Fab() {
  const { screen, barUsed, overlay, t, openOverlay } = useApp();
  if (NO_FAB.has(screen.k) || barUsed || overlay) return null;
  return (
    <button type="button" className="fab" onClick={() => openOverlay({ k: 'chat' })} aria-haspopup="dialog">
      <Ic n="chat" /><span>{t('fab')}</span>
    </button>
  );
}

/** 푸터: 면책·시연 안내는 홈에서 한 번만 */
/* ----- 앱 설치 (PWA, 3차 개선제안 4장) ----- */
/** 크롬의 설치 신호(beforeinstallprompt). 이벤트 객체를 들고 있다가 버튼에서 prompt() 를 부른다 */
interface InstallPromptEvent extends Event { prompt: () => Promise<void> }
let installEvt: InstallPromptEvent | null = null;
const installSubs = new Set<() => void>();
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e as InstallPromptEvent; installSubs.forEach((f) => f()); });
window.addEventListener('appinstalled', () => { installEvt = null; storage.set('hy-installed', '1'); installSubs.forEach((f) => f()); });
// 이미 홈 화면 앱으로 열렸으면 설치 안내가 필요 없다
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
export const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const LATER_MS = 14 * 864e5;

/** 설치됐거나(또는 앱으로 열렸거나) 아니면 안내 가능. 배너는 '나중에' 누른 뒤 14일 동안 숨긴다 */
function useInstall() {
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick((n) => n + 1); installSubs.add(f); return () => { installSubs.delete(f); }; }, []);
  const hidden = standalone() || storage.get('hy-installed') === '1';
  const later = Number(storage.get('hy-install-later') || 0);
  return { hidden, bannerOk: !hidden && Date.now() - later > LATER_MS };
}
/** 안드로이드 크롬은 휴대폰 설치창을 바로, 아이폰·설치창 없는 브라우저는 기기별 안내 시트 */
function installNow(open: (o: Overlay) => void) {
  if (installEvt) void installEvt.prompt();
  else open({ k: 'install' });
}

/**
 * 홈 화면 아래에 떠 있는 설치 배너. 홈에서만, 시트가 없을 때만. 떠 있는 동안은 AI 상담 버튼을 숨겨 겹치지 않게 (body.has-install).
 * 크롬의 자동 배너는 체류 시간 등 자체 조건이라 타이밍을 믿을 수 없어서 직접 둔다.
 */
export function InstallBanner() {
  const { screen, overlay, t, openOverlay, toast } = useApp();
  const { bannerOk } = useInstall();
  const [closed, setClosed] = useState(false);
  const show = screen.k === 'home' && !overlay && bannerOk && !closed;
  useEffect(() => { document.body.classList.toggle('has-install', show); return () => document.body.classList.remove('has-install'); }, [show]);
  useEffect(() => {
    const f = () => toast(t('installedToast'));
    window.addEventListener('appinstalled', f);
    return () => window.removeEventListener('appinstalled', f);
  }, [toast, t]);
  if (!show) return null;
  const later = () => { storage.set('hy-install-later', String(Date.now())); setClosed(true); };
  return (
    <section className="install" role="region" aria-label={t('installT')}>
      <span className="app-ic" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" width={42} height={42} /></span>
      <span className="tx"><b>{t('installT')}</b><span>{t('installD')}</span></span>
      <button type="button" className="btn primary sm" onClick={() => installNow(openOverlay)}><Ic n="download" cls="sm" />{t('installBtn')}</button>
      <button type="button" className="icon-btn later" onClick={later} aria-label={t('later')}><Ic n="close" cls="sm" /></button>
    </section>
  );
}

export function Footer() {
  const { screen, lang, langChosen, t, openOverlay } = useApp();
  const { hidden } = useInstall();
  if (screen.k !== 'home') return null;
  return (
    <footer className="foot">
      <div className="ci"><img src={logoFor(lang, langChosen)} alt={t('city')} width={41} height={28} /><span className="demo-flag"><Ic n="info" cls="sm" />{t('proto')}</span></div>
      <p>{t('disclaimer')}</p>
      <p>{t('demoNote')}</p>
      <div className="links">
        <a href="https://www.yangju.go.kr" target="_blank" rel="noopener">{t('cityLink')}<Ic n="ext" cls="sm" /></a>
        <a href="tel:1345"><Ic n="phone" cls="sm" />{t('helpline')}</a>
        {/* 배너를 닫은 뒤에도 설치 안내를 다시 열 수 있는 자리 */}
        {!hidden && <a href="#" onClick={(e) => { e.preventDefault(); installNow(openOverlay); }}><Ic n="download" cls="sm" />{t('footInstall')}</a>}
      </div>
    </footer>
  );
}

export function Toast() {
  const { toastMsg } = useApp();
  return <div id="toast" role="status" aria-live="polite">{toastMsg && <div className="toast">{toastMsg}</div>}</div>;
}

export function SkipLink() {
  const { t } = useApp();
  return <a className="sr-only" href="#main">{t('skip')}</a>;
}

/**
 * 바텀 시트 공통 틀. 바깥 탭·닫기 버튼·Esc(AppContext) 로 닫힘. 열리면 닫기 버튼에 포커스.
 * children 이 본문(.sheet-b), footer 가 있으면 .sheet-f.
 */
export function Sheet({ id, title, icon, children, footer, onClose, bodyId }: {
  id: string; title: ReactNode; icon?: string; children: ReactNode; footer?: ReactNode; onClose: () => void; bodyId?: string;
}) {
  const { t } = useApp();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  return (
    <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={id}>
        <div className="sheet-h">
          <h2 id={id}>{icon && <Ic n={icon} />}{title}</h2>
          <button type="button" className="icon-btn" ref={closeRef} onClick={onClose} aria-label={t('aClose')}><Ic n="close" /></button>
        </div>
        <div className="sheet-b" id={bodyId}>{children}</div>
        {footer && <div className="sheet-f">{footer}</div>}
      </div>
    </div>
  );
}
