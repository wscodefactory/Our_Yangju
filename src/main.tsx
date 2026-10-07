// 진입점. index.html 의 #root 에 App 을 올린다.
// 전역 CSS 는 여기서 한 번만 import (원본 html 의 <style> 블록을 합친 파일).
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// StrictMode 는 개발 중 effect 를 두 번 돌린다. AI 호출처럼 두 번 돌면 안 되는 effect 는
// ReadingScreen 처럼 ref 로 막아 두었으니, 새 effect 를 추가할 때 같은 점을 신경 쓸 것.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
