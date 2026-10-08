// 내비게이션 스택 맨 위 Screen 을 화면 컴포넌트로. 참고용 html 의 SCREENS 테이블에 해당.
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import type { Screen } from '@/types';
import { ExploreScreen } from './ExploreScreen';
import { HomeScreen } from './HomeScreen';
import { LangScreen } from './LangScreen';
import { SavedScreen } from './SavedScreen';
import { AdminScreen } from './admin/AdminScreen';
import { CounterScreen } from './admin/CounterScreen';
import { DocConfirmScreen } from './doc/DocConfirmScreen';
import { DocResultScreen } from './doc/DocResultScreen';
import { DocScreen } from './doc/DocScreen';
import { MaskScreen } from './doc/MaskScreen';
import { ReadingScreen } from './doc/ReadingScreen';
import { LifeItemScreen } from './life/LifeItemScreen';
import { LifeScreen } from './life/LifeScreen';
import { VisitItemScreen } from './visit/VisitItemScreen';
import { VisitScreen } from './visit/VisitScreen';
import { BenefitScreen } from './welfare/BenefitScreen';
import { WelfareScreen } from './welfare/WelfareScreen';

function render(s: Screen) {
  switch (s.k) {
    case 'lang': return <LangScreen />;
    case 'home': return <HomeScreen />;
    case 'visit': return <VisitScreen />;
    case 'visitItem': return <VisitItemScreen id={s.id} />;
    case 'doc': return <DocScreen />;
    case 'mask': return <MaskScreen />;
    case 'reading': return <ReadingScreen />;
    case 'docConfirm': return <DocConfirmScreen manual={!!s.manual} />;
    case 'docResult': return <DocResultScreen />;
    case 'life': return <LifeScreen />;
    case 'lifeItem': return <LifeItemScreen id={s.id} />;
    case 'welfare': return <WelfareScreen g={s.g} s={s.s} />;
    // key: 다른 혜택으로 바뀌면 탭·퀴즈 상태를 처음부터
    case 'benefit': return <BenefitScreen key={s.id} id={s.id} />;
    case 'saved': return <SavedScreen />;
    case 'explore': return <ExploreScreen tab={s.tab} />;
    case 'admin': return <AdminScreen tab={s.tab} />;
    case 'counter': return <CounterScreen />;
  }
}

/**
 * <main> 에 현재 화면. 화면이 바뀌면 맨 위로 스크롤하고 제목(앱 바 h1 또는 본문 h1)에 포커스를 옮긴다 (접근성 §9).
 */
export function ScreenRouter() {
  const { screen, nav } = useApp();
  useEffect(() => {
    window.scrollTo(0, 0);
    // 앱 바 제목 포털이 다음 렌더에 채워지므로 한 틱 뒤에
    const id = window.setTimeout(() => {
      const h = (document.getElementById('page-title') || document.querySelector('main h1')) as HTMLElement | null;
      if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }, 0);
    return () => window.clearTimeout(id);
  }, [nav.length, screen.k]);
  return <main id="main" tabIndex={-1}>{render(screen)}</main>;
}
