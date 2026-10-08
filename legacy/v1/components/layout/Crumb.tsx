// 화면 맨 위 "← 경로" 한 줄. 홈과 언어 선택을 뺀 거의 모든 화면이 첫 줄로 이걸 그린다.
// 원본에서는 각 화면 렌더 함수가 crumb(path) 문자열을 직접 끼워 넣었는데, 뒤로가기 버튼까지 묶어 컴포넌트로 뺐다.
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UI } from '@/data/ui';

/**
 * path: 표시할 경로. 보통은 `${L(상위)} › ${L(현재)}` 꼴 문자열이지만
 * 민원·생활 화면처럼 <Tr>로 번역되는 조각을 넣어야 해서 ReactNode로 받는다.
 * 뒤로가기는 AppContext.back — 스택이 하나뿐이면 홈으로 떨어진다.
 */
export function Crumb({ path }: { path: ReactNode }) {
  const { L, back } = useApp();
  return (
    <div className="crumb">
      <button type="button" className="back" aria-label={L(UI.back)} onClick={back}><ArrowLeft aria-hidden="true" /></button>
      <span className="path">{path}</span>
    </div>
  );
}
