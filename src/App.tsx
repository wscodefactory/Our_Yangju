import { AppBar, BarHost, Fab, Footer, SkipLink, Toast } from '@/components/layout/Chrome';
import { Overlays } from '@/components/layout/Overlays';
import { AppProvider } from '@/context/AppContext';
import { DocProvider } from '@/context/DocContext';
import { GuideProvider } from '@/context/GuideContext';
import { ScreenRouter } from '@/screens/ScreenRouter';

/**
 * 앱 뼈대 (참고용 html 의 body 구조 그대로):
 *   본문 바로가기 → 앱 바 → <main> → 푸터(홈만) → 하단 고정 바 → FAB·시트 → 토스트
 * Provider 순서: App(언어·내비·저장) → Doc(고지서) → Guide(AI 상담, useApp 을 쓰므로 안쪽)
 */
export default function App() {
  return (
    <AppProvider>
      <DocProvider>
        <GuideProvider>
          <SkipLink />
          <AppBar />
          <ScreenRouter />
          <Footer />
          <BarHost />
          <Fab />
          <Overlays />
          <Toast />
        </GuideProvider>
      </DocProvider>
    </AppProvider>
  );
}
