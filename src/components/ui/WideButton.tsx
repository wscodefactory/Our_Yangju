// 화면 폭을 꽉 채우는 행동 버튼. "받을 수 있나요?", "준비물 보기", "신청하러 가기", 예/아니오 등
// 상세·결과 화면의 거의 모든 CTA가 이걸로 그려진다. 원본 css .wide 계열.
import type { CSSProperties, ReactNode } from 'react';

interface Props {
  label: ReactNode;
  /** 오른쪽 끝 표시. 기본 '→'. "3 →"처럼 개수를 붙이기도 하고, null이면 아예 안 그린다 */
  arrow?: ReactNode | null;
  /** 강조색 (한 화면에 하나만 쓰는 게 원칙) */
  primary?: boolean;
  /** 담김(★) 상태 — 체크색으로 바뀜 */
  on?: boolean;
  /** 외부 링크. 있으면 <a>로 바뀌고 css가 ↗를 붙여준다 */
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** 라벨 가운데 정렬. 예/아니오 2열 버튼처럼 화살표가 어색한 곳에서 씀 */
  center?: boolean;
}

/**
 * 가로로 긴 행동 버튼.
 * - href가 있으면 링크로 렌더링하고 화살표 span은 생략 (css .ext가 ↗ 처리)
 * - center면 화살표도 같이 숨긴다. 가운데 정렬인데 오른쪽에 → 가 붙으면 중심이 틀어져서
 * - disabled는 속성과 함께 opacity 0.5를 인라인으로 준다 (원본과 같은 처리)
 */
export function WideButton({ label, arrow = '→', primary, on, href, onClick, disabled, className = '', style, center }: Props) {
  const cls = ['wide', primary && 'primary', on && 'on', href && 'ext', className].filter(Boolean).join(' ');
  // 호출부 style이 마지막에 와서 center/disabled 기본값을 덮어쓸 수 있게 순서를 잡아뒀다
  const st: CSSProperties = { ...(center ? { justifyContent: 'center' } : {}), ...(disabled ? { opacity: 0.5 } : {}), ...style };
  if (href) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener" style={st}>
        <span className="lab">{label}</span>
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} style={st}>
      <span className="lab">{label}</span>
      {arrow !== null && !center && <span className="arr">{arrow}</span>}
    </button>
  );
}
