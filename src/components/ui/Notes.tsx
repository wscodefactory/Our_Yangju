// 안내 문구류: 일반 안내(Note), 작은 힌트(Hint), 출처 줄(SourceLine), 외국인 주민 안내(ForeignNote).
// 원본 index.html에선 전부 템플릿 문자열 조각이었다. 화면마다 반복되던 <p class="note"> 류를 모아둔 것.
import type { CSSProperties, ReactNode } from 'react';
import { UI } from '@/data/ui';
import { useApp } from '@/context/AppContext';
import type { Bi } from '@/types';

/** 화면 하단 "연동: 양주시청 · 네이버 지도" 같은 출처 줄. items는 Bi 쌍이라 L()로 뽑는다 */
export function SourceLine({ items }: { items: Bi[] }) {
  const { L } = useApp();
  return (
    <p className="src">
      {L(UI.linked)} {items.map((x, i) => <b key={i}>{L(x)}</b>)}
    </p>
  );
}

/**
 * 영어 UI일 때만 보이는 외국인 주민 안내 (체류자격에 따라 대상이 다를 수 있다는 문구).
 * 한국어 UI에선 아예 렌더링하지 않으므로 UI.fr의 영어 쪽([1])만 직접 꺼낸다.
 */
export function ForeignNote() {
  const { lang } = useApp();
  if (lang !== 'en') return null;
  return <p className="note">{UI.fr[1]}</p>;
}

export function Note({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p className="note" style={style}>{children}</p>;
}
export function Hint({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p className="hint" style={style}>{children}</p>;
}
