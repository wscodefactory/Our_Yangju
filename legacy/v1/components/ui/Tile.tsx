// 2열 격자(Grid)에 들어가는 큰 타일과, 격자/세로 쌓기 래퍼.
// 복지·소개·행사·맛집 등 목록 화면 대부분이 이 세 개로 레이아웃을 짠다.
// 원본 css의 .tile / .grid / .stack 클래스를 그대로 쓴다.
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** 'now' 'off' 'high' 'home' 같은 상태 클래스. 가능성(high/check)도 여기로 들어온다 */
  className?: string;
  onClick?: () => void;
  /** 있으면 버튼 대신 새 탭으로 여는 <a>가 된다 (네이버 지도, 시청 홈페이지 등) */
  href?: string;
  ariaLabel?: string;
}

/**
 * 격자용 타일. href가 있으면 외부 링크, 없으면 버튼.
 * 안쪽 구성(.tag / .lab / .dot / .star)은 호출하는 쪽이 children으로 채운다.
 * 둘 다 같은 .tile 클래스를 쓰기 때문에 모양은 동일하고 시맨틱만 갈린다.
 */
export function Tile({ children, className = '', onClick, href, ariaLabel }: Props) {
  const cls = `tile ${className}`.trim();
  if (href) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener" aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

/** 2열 격자 */
export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid">{children}</div>;
}

/** 세로로 쌓는 버튼 묶음. mt는 바로 위 요소와 띄울 px (카드 아래 12, 목록 아래 16 정도로 쓰고 있음) */
export function Stack({ children, mt }: { children: ReactNode; mt?: number }) {
  return <div className="stack" style={mt ? { marginTop: mt } : undefined}>{children}</div>;
}
