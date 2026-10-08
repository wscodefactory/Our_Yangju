// 여러 화면이 같이 쓰는 작은 조각들. 참고용 html 의 seg / checklist / rowBtn / lvBadge / stBadge / callout 에 해당.
// 모양은 전부 global.css 클래스(.seg .check .row .bdg .callout)가 정한다.
import { useState, type ReactNode } from 'react';
import { useApp } from '@/context/AppContext';
import { LV, ST } from '@/data/content';
import { Ic } from './Ic';

/** 세그먼트 탭. items: [값, 라벨][]. 4개면 글자를 줄이는 .s4 */
export function Seg<V extends string>({ items, value, onChange, ariaLabelledBy }: {
  items: [V, string][]; value: V; onChange: (v: V) => void; ariaLabelledBy?: string;
}) {
  return (
    <div className={`seg ${items.length > 3 ? 's4' : ''}`.trim()} role="tablist" aria-labelledby={ariaLabelledBy}>
      {items.map(([v, label]) => (
        <button key={v} type="button" role="tab" aria-selected={value === v} onClick={() => onChange(v)}>{label}</button>
      ))}
    </div>
  );
}

/** 준비물 체크리스트 + 진행률. 체크 상태는 창구 앞에서 잠깐 쓰는 것이라 화면 안에서만 산다 */
export function Checklist({ docs }: { docs: string[] }) {
  const { t } = useApp();
  const [done, setDone] = useState<boolean[]>(() => docs.map(() => false));
  const n = done.filter(Boolean).length;
  return (
    <>
      <div className="prog">
        <span className="prog-txt">{t('docsProgress', { a: n, b: docs.length })}</span>
        <span className="progress" aria-hidden="true"><i style={{ width: `${docs.length ? Math.round((n / docs.length) * 100) : 0}%` }} /></span>
      </div>
      <div>
        {docs.map((d, i) => (
          <label key={i} className="check">
            <input type="checkbox" checked={!!done[i]} onChange={(e) => setDone((p) => p.map((x, j) => (j === i ? e.target.checked : x)))} />
            <span>{d}</span>
          </label>
        ))}
      </div>
    </>
  );
}

/** 목록 행 버튼: 아이콘 상자 + 제목/설명 + 꺾쇠. .list 안에 쌓는다 */
export function RowBtn({ icon, tone = 'tone-green', title, desc, onClick }: {
  icon?: string; tone?: string; title: ReactNode; desc?: ReactNode; onClick: () => void;
}) {
  return (
    <button type="button" className="row" onClick={onClick}>
      {icon && <span className={`ibox ${tone}`}><Ic n={icon} /></span>}
      <span className="tx"><span className="t">{title}</span>{desc && <span className="d">{desc}</span>}</span>
      <Ic n="chev" cls="sm" />
    </button>
  );
}

/** 시행 주체 배지: 양주시 amber / 경기도 blue / 중앙 gray */
export function LvBadge({ lv }: { lv: 'C' | 'G' | 'Y' }) {
  const { tx } = useApp();
  return <span className={`bdg ${lv === 'Y' ? 'amber' : lv === 'G' ? 'blue' : 'gray'}`}>{tx(LV[lv])}</span>;
}

/** 가능성 배지: 색 점 대신 글자로 (디자인시스템 §2.3) */
export function StBadge({ st }: { st: 'high' | 'check' }) {
  const { tx } = useApp();
  return st === 'high'
    ? <span className="bdg green"><Ic n="check" cls="sm" />{tx(ST.high)}</span>
    : <span className="bdg orange">{tx(ST.check)}</span>;
}

/** 안내 상자 info / warn / green */
export function Callout({ kind, icon, sm, children, style }: {
  kind: 'info' | 'warn' | 'green'; icon?: string; sm?: boolean; children: ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div className={`callout ${kind} ${sm ? 'sm' : ''}`.trim()} style={style}>
      {icon && <Ic n={icon} cls={sm ? 'sm' : ''} />}<span>{children}</span>
    </div>
  );
}
