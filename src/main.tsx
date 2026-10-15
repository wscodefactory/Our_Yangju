// #root에 앱을 연결하고 전역 스타일을 불러온다.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as content from './data/content';
import { auditTranslations } from './i18n';
import './styles/global.css';

// 다섯 칸이 안 채워진 문구가 있으면 콘솔 경고 (개발용)
if (import.meta.env.DEV) {
  const { UI, VISIT, LIFE, GROUPS, STAGES, LV, ST, BEN, EVENTS, PLACES, CERTS, HERITAGE, AREAS, TAX_TYPES, FAQ } = content;
  auditTranslations({ UI, VISIT, LIFE, GROUPS, STAGES, LV, ST, BEN, EVENTS, PLACES, CERTS, HERITAGE, AREAS, TAX_TYPES, FAQ });
}
// 음성 목록은 첫 getVoices() 뒤에야 채워지는 브라우저가 있어 미리 한 번 불러 둔다
if ('speechSynthesis' in window) speechSynthesis.getVoices();
// 뒤로 가기 때 브라우저가 스크롤을 스스로 되돌리지 않게. 화면 전환 스크롤은 ScreenRouter 가 맡는다
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// StrictMode 는 개발 중 effect 를 두 번 돌린다. AI 호출처럼 두 번 돌면 안 되는 effect 는
// ReadingScreen 처럼 ref 로 막아 두었으니, 새 effect 를 추가할 때 같은 점을 신경 쓸 것.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
