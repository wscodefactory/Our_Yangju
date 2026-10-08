// 담당자(공무원) 화면. 시민 앱 안에 시연용으로 끼워 넣은 것이라 로그인 같은 건 없고 #admin 해시로만 들어온다.
// 혜택 등록 / 사각지대 신호 두 탭은 여기서 tab 값으로 갈리고, 창구 모드는 별도 화면(counter)으로 push.
import { useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Callout, Seg } from '@/components/ui/Bits';
import { useApp } from '@/context/AppContext';
import { GAP_SIGNALS } from '@/data/admin';
import { RegisterPanel, initialRegisterState, type RegisterState } from './RegisterPanel';

type Tab = 'reg' | 'sig';

/**
 * 담당자 화면 (시연): 혜택 등록 / 사각지대 신호 (+ 창구 모드 버튼).
 *
 * 등록 패널의 입력 상태(붙여넣은 공고문, 추출된 규칙, 체크 상태)를 RegisterPanel이 아니라 여기서 든다.
 * 탭을 넘겼다 돌아오면 RegisterPanel은 언마운트됐다 다시 마운트되는데, 그때 공고문이 날아가면
 * AI 추출(20~60초)을 또 기다려야 해서 상위에 올려둔 것.
 */
export function AdminScreen({ tab }: { tab: Tab }) {
  const { T, go, goHome, replaceNav, nav } = useApp();
  const [reg, setReg] = useState<RegisterState>(initialRegisterState);
  const patch = (p: Partial<RegisterState>) => setReg((s) => ({ ...s, ...p }));
  // 탭 전환은 push가 아니라 현재 스택 꼭대기만 교체 — 뒤로가기가 탭 이력을 되감지 않게
  const setTab = (next: Tab) => replaceNav([...nav.slice(0, -1), { k: 'admin', tab: next }]);

  return (
    <div className="stack">
      <Title>{T('담당자 화면', 'Officer console')}</Title>
      <Seg<Tab> items={[['reg', T('혜택 등록', 'Register')], ['sig', T('사각지대 신호', 'Gap signals')]]} value={tab} onChange={setTab} />
      {tab === 'sig' ? <SignalsPanel /> : <RegisterPanel state={reg} setState={patch} />}
      <div className="btn-row">
        <button type="button" className="btn secondary sm" onClick={() => go({ k: 'counter' })}>{T('창구 모드 열기', 'Open counter mode')}</button>
        <button type="button" className="btn ghost sm" onClick={goHome}>{T('시민 화면으로', 'Citizen view')}</button>
      </div>
    </div>
  );
}

/** 어디서 멈추나요? — 조건별 '잘 모르겠어요'/이탈 비율 (예시 데이터) */
function SignalsPanel() {
  const { T } = useApp();
  return (
    <section className="panel">
      <h2>{T('어디서 멈추나요?', 'Where do people stop?')}</h2>
      <p className="muted">{T('혜택 확인 중 ‘잘 모르겠어요’ 또는 이탈이 많은 조건 (비식별 집계)', 'Conditions where residents answer “not sure” or leave (anonymous counts)')}</p>
      {GAP_SIGNALS.map(([ko, en, pct]) => (
        <div key={ko} className="prog" style={{ display: 'block', marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{T(ko, en)}</span><b>{pct}%</b></div>
          {/* 최대값이 50% 근처라 2배로 늘려야 막대가 눈에 들어온다 */}
          <span className="progress" aria-hidden="true"><i style={{ width: `${pct * 2}%` }} /></span>
        </div>
      ))}
      <Callout kind="info" sm style={{ marginTop: 12 }}>{T('예시 데이터입니다. 시범 운영에서 실제 값으로 바뀝니다.', 'Example data. Real values come from the pilot.')}</Callout>
    </section>
  );
}
