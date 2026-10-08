// 화면 바깥 고정 요소: 앱 바, 제목·하단 바 포털, FAB, 푸터, 토스트, 본문 바로가기.
// 참고용 html 의 renderHeader / renderFoot / bbar / fab / toast 에 해당한다.
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { LANGS } from '@/data/content';

const LOGO = `${import.meta.env.BASE_URL}yangju-ci.png`;

/**
 * 앱 바. 홈·언어 화면은 양주시 CI + 서비스명, 하위 화면은 뒤로 버튼 + 제목(<Title> 이 포털로 채움).
 * 도구 버튼 3개(지구본·Aa·북마크)는 언어 선택 화면에서만 숨긴다 (디자인시스템 §6).
 */
export function AppBar() {
  const { screen, lang, t, big, toggleBig, saved, goHome, back, go, openOverlay, setTitleEl } = useApp();
  const root = screen.k === 'home' || screen.k === 'lang';
  const n = saved.length;
  const native = LANGS.find((l) => l.code === lang)?.native ?? '';
  return (
    <header className="appbar">
      <div className={`appbar-in ${root ? '' : 'sub'}`}>
        {root ? (
          <a className="brand" href="#" onClick={(e) => { e.preventDefault(); if (screen.k !== 'lang') goHome(); }} aria-label={`${t('appName')}, ${t('aHome')}`}>
            <span className="logo-plate"><img src={LOGO} alt={t('city')} width={58} height={40} /></span>
            <span className="brand-div" aria-hidden="true" />
            <span className="brand-txt"><strong>{t('appName')}</strong><small>{t('appSub')}</small></span>
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
const NO_FAB = new Set(['lang', 'visitItem', 'doc', 'mask', 'reading', 'docConfirm', 'docResult', 'benefit', 'lifeItem', 'admin', 'counter']);

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
export function Footer() {
  const { screen, t } = useApp();
  if (screen.k !== 'home') return null;
  return (
    <footer className="foot">
      <div className="ci"><img src={LOGO} alt={t('city')} width={41} height={28} /><span className="demo-flag"><Ic n="info" cls="sm" />{t('proto')}</span></div>
      <p>{t('disclaimer')}</p>
      <p>{t('demoNote')}</p>
      <div className="links">
        <a href="https://www.yangju.go.kr" target="_blank" rel="noopener">{t('cityLink')}<Ic n="ext" cls="sm" /></a>
        <a href="tel:1345"><Ic n="phone" cls="sm" />{t('helpline')}</a>
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
