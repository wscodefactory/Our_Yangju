// 화면 바깥을 감싸는 자잘한 고정 요소 모음. 전부 App.tsx에서 한 번씩만 쓴다.
// 하단 "양주무관" 버튼, 시안 안내 문구, 토스트. 특정 화면에 속하지 않아서 layout 쪽에 뒀다.
import { useApp } from '@/context/AppContext';
import { useGuide } from '@/context/GuideContext';
import { UI } from '@/data/ui';

/**
 * 화면 하단 고정 "양주무관에게 물어보기".
 * 누르면 GuideContext.openGuide → GuideSheet가 뜬다. 아바타 글자 '무'는 장식이라 aria-hidden.
 */
export function GuideButton() {
  const { L } = useApp();
  const { openGuide } = useGuide();
  return (
    <button type="button" className="guide" onClick={openGuide}>
      <span className="av" aria-hidden="true">무</span>
      <span>{L(UI.guide)}</span>
    </button>
  );
}

/** 모든 화면 아래에 붙는 "이것은 시안입니다" 한 줄 */
export function DemoNote() {
  const { L } = useApp();
  return <p className="demo">{L(UI.demo)}</p>;
}

/**
 * 토스트. 메시지와 사라지는 타이머는 AppContext.toast()가 관리하고
 * 여기선 toastMsg가 있을 때만 그린다. role=status라 스크린리더가 끼어들지 않고 읽어준다.
 */
export function Toast() {
  const { toastMsg } = useApp();
  if (!toastMsg) return null;
  return <div className="toast" role="status">{toastMsg}</div>;
}
