import { GuideSheet } from '@/components/guide/GuideSheet';
import { DemoNote, GuideButton, Toast } from '@/components/layout/Chrome';
import { Header } from '@/components/layout/Header';
import { AppProvider } from '@/context/AppContext';
import { DocProvider } from '@/context/DocContext';
import { GuideProvider } from '@/context/GuideContext';
import { ScreenRouter } from '@/screens/ScreenRouter';

/**
 * 앱 뼈대. 라우터 라이브러리 없이 AppContext 의 내비 스택을 ScreenRouter 가 읽어서 화면을 고른다.
 * 원본이 단일 html 에서 화면 div 를 바꿔 끼우는 구조였고, 뒤로가기도 자체 스택이라 그대로 옮긴 것.
 *
 * Provider 순서:
 *  AppProvider   언어·내비·내 혜택·토스트. 모두가 쓰므로 맨 바깥
 *  DocProvider   고지서 흐름 상태(캔버스·읽기 결과). 다른 컨텍스트에 의존하지 않아 어디 둬도 되지만 묶어서 여기
 *  GuideProvider 양주무관 채팅. useApp() 으로 단계 이동과 언어를 쓰므로 AppProvider 안쪽이어야 한다
 *
 * .app 컬럼 바깥에 둔 GuideButton/GuideSheet/Toast 는 position: fixed 라 레이아웃 흐름에서 빠져 있다.
 */
export default function App() {
  return (
    <AppProvider>
      <DocProvider>
        <GuideProvider>
          <div className="app">
            <Header />
            <ScreenRouter />
            <DemoNote />
          </div>
          <GuideButton />
          <GuideSheet />
          <Toast />
        </GuideProvider>
      </DocProvider>
    </AppProvider>
  );
}
