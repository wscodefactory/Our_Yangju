// 담당자 창구 모드. 창구에서 공무원이 자기 기기로 띄워놓고 쓰는 화면이라
// 위는 주민 모국어, 아래는 한국어가 같은 내용으로 나란히 선다.
// 데이터는 시청·주민센터 화면과 같은 VISIT(다섯 언어 배열)을 쓴다. AI 번역 없음.
import { useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { useApp } from '@/context/AppContext';
import { LANGS, VISIT } from '@/data/content';
import { tx, type Lang } from '@/i18n';

// 한국어 주민이면 창구 모드가 필요 없으니 선택지에서 뺀다
const RES_LANGS = LANGS.filter((l) => l.code !== 'ko');

/**
 * 담당자 창구 모드: 주민 언어 패널과 담당자용 한국어 패널을 위아래로.
 * 여기서 고르는 언어(cl)는 로컬 state다. 앱 전체 언어를 건드리면 담당자 기기의 다른 화면까지 바뀌므로 분리.
 * 기본값 'vi'는 양주 외국인 주민 상위 국적 중 하나라서.
 */
export function CounterScreen() {
  const { T } = useApp();
  const [cl, setCl] = useState<Lang>('vi');
  const [taskId, setTaskId] = useState(VISIT[0].id);
  const task = VISIT.find((x) => x.id === taskId) ?? VISIT[0];
  // 주민 쪽 패널은 앱 언어와 무관하게 여기서 고른 언어로
  const my = (arr: string[]) => tx(arr, cl);

  return (
    <div className="stack">
      <Title>{T('창구 모드', 'Counter mode')}</Title>
      <p className="lead" style={{ margin: 0 }}>
        {T('주민의 언어와 업무를 고르면, 주민에게 보여줄 문장(모국어)과 담당자용 문장(한국어)이 함께 나와요.',
          "Pick the resident's language and the task. The resident sees their language, you see Korean.")}
      </p>
      <span className="field-label" style={{ margin: 0 }}>{T('주민 언어', "Resident's language")}</span>
      <div className="chips">
        {RES_LANGS.map((l) => (
          <button key={l.code} type="button" className="chip" aria-pressed={cl === l.code} onClick={() => setCl(l.code as Lang)} lang={l.code}>{l.native}</button>
        ))}
      </div>
      <span className="field-label" style={{ margin: 0 }}>{T('업무', 'Task')}</span>
      <div className="chips">
        {VISIT.map((x) => (
          <button key={x.id} type="button" className="chip" aria-pressed={task.id === x.id} onClick={() => setTaskId(x.id)}>{T(x.name[0], x.name[1])}</button>
        ))}
      </div>

      {/* 주민 쪽 — 라벨까지 전부 그 언어 */}
      <section className="panel say" lang={cl}>
        <h2>{my(task.name)}</h2>
        <p className="ko">{my(task.sayT)}</p>
        <dl className="kv">
          <dt>{my(['어디서', 'Where', '在哪里', 'Ở đâu', 'कहाँ'])}</dt><dd>{my(task.where)}</dd>
          <dt>{my(['언제까지', 'When', '什么时候', 'Khi nào', 'कहिले'])}</dt><dd>{my(task.when)}</dd>
          <dt>{my(['가져갈 것', 'Bring', '携带物品', 'Mang theo', 'ल्याउनुपर्ने'])}</dt>
          <dd><ul style={{ margin: 0, paddingLeft: 18 }}>{task.docs.map((d, i) => <li key={i}>{my(d)}</li>)}</ul></dd>
        </dl>
      </section>

      {/* 담당자 쪽 — UI 언어가 영어여도 한국어 고정. 출처 메모(src)는 이쪽에만 */}
      <section className="panel" lang="ko">
        <h2>{task.name[0]} <span className="bdg gray">한국어 · 담당자</span></h2>
        <p className="ko" style={{ fontWeight: 700, lineHeight: 1.55 }}>{task.say}</p>
        <dl className="kv">
          <dt>어디서</dt><dd>{task.where[0]}</dd>
          <dt>언제까지</dt><dd>{task.when[0]}</dd>
          <dt>가져갈 것</dt><dd><ul style={{ margin: 0, paddingLeft: 18 }}>{task.docs.map((d, i) => <li key={i}>{d[0]}</li>)}</ul></dd>
        </dl>
        {task.src && <p className="src">{task.src[0]}</p>}
      </section>
    </div>
  );
}
