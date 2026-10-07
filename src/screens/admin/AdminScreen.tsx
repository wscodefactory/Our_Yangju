// 담당자(공무원) 화면. 시민 앱 안에 시연용으로 끼워 넣은 것이라 로그인 같은 건 없다.
// 탭 세 개 중 '창구 모드'만 별도 화면(counter)이고, 나머지 둘은 이 컴포넌트 안에서 tab 값으로 갈린다.
// 원본 html의 #admin 섹션.
import { useState } from 'react';
import { Crumb } from '@/components/layout/Crumb';
import { Hint, Note } from '@/components/ui/Bits';
import { useApp } from '@/context/AppContext';
import { GAP_SIGNALS } from '@/data/tax';
import { RegisterPanel, initialRegisterState, type RegisterState } from './RegisterPanel';

type Tab = 'reg' | 'sig';

/**
 * 담당자 화면 (시연): 창구 모드 / 혜택 등록 / 사각지대 신호.
 *
 * 등록 패널의 입력 상태(붙여넣은 공고문, 추출된 규칙, 체크 상태)를 RegisterPanel이 아니라 여기서 든다.
 * 탭을 '사각지대 신호'로 넘겼다 돌아오면 RegisterPanel은 언마운트됐다 다시 마운트되는데,
 * 그때 공고문이 날아가면 AI 추출(20~60초)을 또 기다려야 해서 상위에 올려둔 것.
 * AdminScreen 자체는 tab이 바뀌어도 같은 컴포넌트가 리렌더만 되므로 state가 살아남는다.
 */
export function AdminScreen({ tab }: { tab: Tab }) {
  const { T, go, replaceNav, nav } = useApp();
  const [reg, setReg] = useState<RegisterState>(initialRegisterState);
  const patch = (p: Partial<RegisterState>) => setReg((s) => ({ ...s, ...p }));
  // 탭 전환은 push가 아니라 현재 스택 꼭대기만 교체 — 뒤로가기가 탭 이력을 되감지 않게
  const setTab = (next: Tab) => replaceNav([...nav.slice(0, -1), { k: 'admin', tab: next }]);

  return (
    <>
      <Crumb path={T('담당자 화면 (시연)', 'Officer view (demo)')} />
      <div className="tabs" role="tablist">
        {/* 창구 모드는 다른 화면으로 push. 여기 와 있는 동안엔 선택 표시가 안 뜬다 */}
        <button type="button" role="tab" aria-selected={false} onClick={() => go({ k: 'counter' })}>{T('창구 모드', 'Counter')}</button>
        <button type="button" role="tab" aria-selected={tab === 'reg'} onClick={() => setTab('reg')}>{T('혜택 등록', 'Register')}</button>
        <button type="button" role="tab" aria-selected={tab === 'sig'} onClick={() => setTab('sig')}>{T('사각지대 신호', 'Gap signals')}</button>
      </div>
      {tab === 'sig' ? <SignalsPanel /> : <RegisterPanel state={reg} setState={patch} />}
    </>
  );
}

/** 어디서 멈추나요? — 조건별 '잘 모르겠어요'/이탈 비율 (예시 데이터) */
function SignalsPanel() {
  const { T } = useApp();
  return (
    <>
      <h1>{T('어디서 멈추나요?', 'Where do people stop?')}</h1>
      <Hint>{T('혜택 확인 중 ‘잘 모르겠어요’ 또는 이탈이 많은 조건 (비식별 집계)', 'Conditions where residents answer “not sure” or leave (anonymous counts)')}</Hint>
      <div className="bars">
        {GAP_SIGNALS.map((row) => (
          <div key={row[0]} className="bar">
            <span>{T(row[0], row[1])}</span><b>{row[2]}%</b>
            {/* 최대값이 50% 근처라 2배로 늘려야 막대가 눈에 들어온다 */}
            <span className="t"><i style={{ width: `${row[2] * 2}%` }} /></span>
          </div>
        ))}
      </div>
      <Note>{T('예시 데이터입니다. 시범 운영에서 실제 값으로 바뀝니다.', 'Example data. Real values come from the pilot.')}</Note>
    </>
  );
}
