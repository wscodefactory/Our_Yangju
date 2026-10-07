// 담당자 창구 모드. 창구에서 공무원이 자기 기기로 띄워놓고 쓰는 화면이라
// 왼쪽은 주민 모국어, 오른쪽은 한국어가 같은 내용으로 나란히 선다.
// 데이터는 시청·주민센터 화면(VisitScreens)과 같은 TASKS를 쓴다. 원본 html의 #counter.
import { useState } from 'react';
import { Crumb } from '@/components/layout/Crumb';
import { Hint, Note } from '@/components/ui/Bits';
import { LangRow } from '@/components/ui/LangRow';
import { Tr } from '@/components/ui/Tr';
import { useApp } from '@/context/AppContext';
import { TASKS } from '@/data/civic';
import { LANG_NAME } from '@/data/tax';
import type { CardLang } from '@/types';

/**
 * 담당자 창구 모드: 주민 언어 화면과 담당자용 한국어 화면을 나란히.
 *
 * 여기서 고르는 언어(cl)는 로컬 state다. 앱 전체의 카드 언어(useApp().cl)를 건드리면
 * 담당자 기기의 다른 화면까지 베트남어로 바뀌어 버리므로 일부러 분리했다.
 * 기본값 'vi'는 양주 외국인 주민 상위 국적 중 하나라서.
 */
export function CounterScreen() {
  const { T } = useApp();
  const [cl, setCl] = useState<CardLang>('vi');
  const [taskId, setTaskId] = useState<string | null>(null);
  const task = taskId ? TASKS.find((x) => x.id === taskId) : null;

  // 주민 쪽 패널은 앱의 카드 언어와 무관하게 여기서 고른 언어로 강제 번역.
  // Tr의 force prop이 없으면 전역 cl을 따라가 버려서 한국어 담당자 기기에선 번역이 안 뜬다.
  const my = (ko: string, en: string) => <Tr ko={ko} en={en} force={cl} />;

  return (
    <>
      <Crumb path={T('담당자 창구 모드', 'Officer counter mode')} />
      <h1>{T('창구 모드', 'Counter mode')}</h1>
      <Hint>
        {T('주민의 언어를 고르고 업무를 누르면, 주민에게 보여줄 화면(모국어)과 담당자용 화면(한국어)이 나란히 나와요.',
          "Pick the resident's language and the task. The resident sees their language, you see Korean, side by side.")}
      </Hint>
      {/* 한국어 주민이면 창구 모드가 필요 없으니 선택지에서 뺀다 */}
      <LangRow value={cl} onChange={setCl} exclude={['ko']} />
      <div className="chips" style={{ marginBottom: 14 }}>
        {TASKS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTaskId(x.id)}
            style={task?.id === x.id ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' } : undefined}
          >
            {x.name[0]}
          </button>
        ))}
      </div>
      {task && (
        <>
          <div className="twin">
            {/* 주민 쪽 — 라벨("어디서" 등)까지 전부 번역 */}
            <div className="pane" lang={cl}>
              <h3>{LANG_NAME[cl]}</h3>
              <p><b>{my(task.name[0], task.name[1])}</b></p>
              <p>{my('어디서', 'Where')}: {my(task.where[0], task.where[1])}</p>
              <p>{my('언제까지', 'When')}: {my(task.when[0], task.when[1])}</p>
              <p>{my('가져갈 것', 'Bring')}:</p>
              <ul>{task.docs.map((d, i) => <li key={i}>{my(d[0], d[1])}</li>)}</ul>
            </div>
            {/* 담당자 쪽 — UI 언어가 영어여도 한국어 고정. 출처 메모(src)는 이쪽에만 */}
            <div className="pane ko" lang="ko">
              <h3>한국어 (담당자)</h3>
              <p><b>{task.name[0]}</b></p>
              <p>어디서: {task.where[0]}</p>
              <p>언제까지: {task.when[0]}</p>
              <p>가져갈 것:</p>
              <ul>{task.docs.map((d, i) => <li key={i}>{d[0]}</li>)}</ul>
              {task.src && <Note>{task.src}</Note>}
            </div>
          </div>
          <p className="trnote">
            {T('모국어 문구는 AI 번역 초안입니다. 시 공식 다국어 안내문이 확보되면 그 문장으로 교체합니다.',
              "Native-language text is an AI draft; replaced by the city's official translations when available.")}
          </p>
        </>
      )}
    </>
  );
}
