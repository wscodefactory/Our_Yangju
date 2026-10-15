import { AppBar, BarHost, Fab, Footer, InstallBanner, SkipLink, Toast } from '@/components/layout/Chrome';
import { DeskPanel } from '@/components/layout/DeskPanel';
import { Overlays } from '@/components/layout/Overlays';
import { AppProvider } from '@/context/AppContext';
import { DocProvider } from '@/context/DocContext';
import { GuideProvider } from '@/context/GuideContext';
import { ScreenRouter } from '@/screens/ScreenRouter';

/** Provider 순서는 App → Doc → Guide. 공통 화면과 PC 소개 패널을 함께 구성한다. */
export default function App() {
  return (
    <AppProvider>
      <DocProvider>
        <GuideProvider>
          <SkipLink />
          <AppBar />
          <InstallBanner />
          <ScreenRouter />
          <Footer />
          <BarHost />
          <Fab />
          <Overlays />
          <Toast />
          {/* PC(960px 이상)에서만 왼쪽에 소개·QR */}
          <DeskPanel />
        </GuideProvider>
      </DocProvider>
    </AppProvider>
  );
}
