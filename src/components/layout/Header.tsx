// 모든 화면 위에 고정으로 붙는 상단 바. App.tsx에서 ScreenRouter 바로 위에 한 번만 렌더링한다.
// 원본 index.html의 <header> 블록 그대로: 왼쪽 브랜드(홈 버튼), 오른쪽에 큰 글씨 / 언어 / 내 혜택 칩 세 개.
import { useApp } from '@/context/AppContext';
import { UI } from '@/data/ui';

/**
 * 상단 바. props 없음 — 필요한 건 전부 AppContext에서 꺼내 쓴다.
 * - 브랜드 버튼: 내비 스택을 통째로 버리고 홈으로 (goHome)
 * - 큰 글씨: <html class="big"> 토글 (실제 적용은 AppContext의 effect가 한다)
 * - 언어: 언어 선택 화면(lang)으로 push. 여기서 바로 토글하지 않는 이유는 카드 언어(zh/vi/ne)까지 고르게 하려고
 * - 내 혜택: 담은 개수 뱃지와 함께 mine 화면으로
 */
export function Header() {
  const { L, lang, big, toggleBig, goHome, go, mine } = useApp();
  const en = lang === 'en';
  return (
    <header>
      {/* 브랜드 문구는 언어별로 굵게 치는 단어가 달라서 L()로 못 뽑고 JSX로 갈랐다 */}
      <button type="button" className="brand" onClick={goHome} aria-label={L(UI.home)}>
        {en ? <><b>Our</b> Yangju</> : <>한눈에 <b>양주</b></>}
      </button>
      <div className="tools">
        <button type="button" className="chip" aria-pressed={big} onClick={toggleBig}>{L(UI.big)}</button>
        {/* 언어 칩은 "지금 언어"가 아니라 "바꿀 언어"를 스크린리더에 알려줘야 해서 lang/aria-label이 반대로 들어간다 */}
        <button
          type="button"
          className="chip"
          aria-pressed={en}
          lang={en ? 'ko' : 'en'}
          aria-label={en ? '한국어로 보기' : 'View in English'}
          onClick={() => go({ k: 'lang' })}
        >
          {L(UI.lang)}
        </button>
        <button type="button" className="chip" onClick={() => go({ k: 'mine' })}>
          {/* mine은 "stageId:index" → 1 맵이라 키 개수가 곧 담은 개수 */}
          <span>{L(UI.mine)}</span> <span className="n">{Object.keys(mine).length}</span>
        </button>
      </div>
    </header>
  );
}
