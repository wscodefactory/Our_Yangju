// 상태 표시류: 범례(Legend), 로딩(Thinking), 시연 모드 뱃지(AiModeBadge), 체크 목록 한 줄(CheckItemRow).
// 원본 index.html의 템플릿 문자열 조각을 컴포넌트로 옮긴 것. 화면 쪽 파일이 커지지 않게 여기 모아둠.
import type { ReactNode } from 'react';
import { UI } from '@/data/ui';
import { useApp } from '@/context/AppContext';

/** 로딩 표시. <i>는 css로 도는 점이고 children이 "읽고 있어요… (10~40초)" 같은 문구 */
export function Thinking({ children }: { children: ReactNode }) {
  return (
    <div className="thinking" role="status">
      <i />
      <span>{children}</span>
    </div>
  );
}

/** 혜택 타일의 점 색 범례: 가능성 높음 / 확인 필요 / 양주시 자체 사업. StageScreen 하단 */
export function Legend() {
  const { L } = useApp();
  return (
    <div className="legend">
      <span><i style={{ background: 'var(--accent)' }} />{L(UI.lgHigh)}</span>
      <span><i style={{ background: 'var(--check)' }} />{L(UI.lgCheck)}</span>
      <span><i style={{ background: 'var(--yj)' }} />{L(UI.lgYj)}</span>
    </div>
  );
}

/**
 * 체크 가능한 목록 한 줄 (준비물 체크리스트, 민원 가져갈 것).
 * 체크 상태는 어디에도 저장하지 않는다 — 창구 앞에서 잠깐 확인하는 용도라 비제어 input으로 둠.
 * id는 label htmlFor 연결용이라 한 화면 안에서만 유일하면 된다.
 */
export function CheckItemRow({ id, children }: { id: string; children: ReactNode }) {
  return (
    <label className="item" htmlFor={id}>
      <input type="checkbox" id={id} /> {children}
    </label>
  );
}

/** getAi()가 null일 때 제목 옆에 붙이는 "시연 모드" 뱃지. 고지서 확인·세금 질문·담당자 등록 화면에서 씀 */
export function AiModeBadge() {
  const { T } = useApp();
  return <span className="mode">{T('시연 모드: AI 연결 없음', 'Demo mode: AI not connected')}</span>;
}
