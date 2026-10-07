// 카드형 UI 조각: 정의 목록 카드(InfoCard)와 결과 상자(ResultBox).
// 원본 index.html에선 템플릿 문자열 조각이었고, 여러 화면에서 같은 마크업을 반복하길래 여기로 모았다.
import type { ReactNode } from 'react';

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
