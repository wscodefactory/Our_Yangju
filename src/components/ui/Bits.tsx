// 한 파일로 만들기엔 작은 UI 조각들 모음. 카드, 결과 상자, 출처 줄, 안내 문구, 로딩, 범례 등.
// 원본 index.html에선 전부 템플릿 문자열 조각이었다. 여러 화면에서 같은 마크업을 반복하길래 여기로 모았다.
import type { CSSProperties, ReactNode } from 'react';
import { UI } from '@/data/ui';
import { useApp } from '@/context/AppContext';
import type { Bi } from '@/types';

/* ---------- 카드 ---------- */

/**
 * 정의 목록 카드. rows는 [항목명, 값] 쌍 배열이고 dt/dd로 풀린다.
 * 혜택 상세(무엇/누가/언제), 행사 상세(날짜/장소/내용), 소개·인증 상세에서 쓴다.
 * rows 대신(또는 추가로) children을 직접 넣을 수도 있다 — 고지서 카드처럼 dd 안에 큰 글씨가 들어가는 경우.
 */
export function InfoCard({ rows, children }: { rows?: [ReactNode, ReactNode][]; children?: ReactNode }) {
  return (
    <dl className="card">
      {rows?.map(([k, v], i) => (
        <RowPair key={i} k={k} v={v} />
      ))}
      {children}
    </dl>
  );
}
// dt+dd 한 쌍. 프래그먼트에 key를 못 주니까 컴포넌트로 한 겹 감쌌다
function RowPair({ k, v }: { k: ReactNode; v: ReactNode }) {
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  );
}

/**
 * 결과 상자. kind가 색을 정한다 — 'high'는 강조색(가능성 높음), 'check'는 확인 필요색.
 * 퀴즈 결과, 빈 내 혜택, 본선 예정 안내가 다 이걸 쓴다.
 */
export function ResultBox({ kind, title, sub }: { kind: 'high' | 'check'; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className={`result ${kind}`}>
      <div className="big">{title}</div>
      {sub && <p>{sub}</p>}
    </div>
  );
}

/* ---------- 안내 문구류 ---------- */

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
