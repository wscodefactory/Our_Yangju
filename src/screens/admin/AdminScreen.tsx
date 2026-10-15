// #admin으로 여는 담당자 시연 화면. 로그인 없이 혜택 등록·검수·창구 모드를 제공한다.
import { useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Callout, Seg } from '@/components/ui/Bits';
import { useApp } from '@/context/AppContext';
import { GAP_SIGNALS } from '@/data/admin';
import { getAi } from '@/services/ai';
import { STORAGE_KEYS, storage } from '@/utils/browser';
import { RegisterPanel, initialRegisterState, type RegisterState } from './RegisterPanel';
import { ReviewPanel } from './ReviewPanel';

type Tab = 'reg' | 'sig' | 'tr';

/** 공고 입력과 추출 결과는 탭을 바꿔도 유지한다. */
export function AdminScreen({ tab }: { tab: Tab }) {
  const { T, t, go, goHome, replace } = useApp();
  // 시연 기기의 AI 키. 시민 화면에는 입력 자리가 없다. localStorage 에만 저장하고, getAi() 가 모듈 캐시라 새로고침으로 반영.
  // 중계 서버(VITE_AI_PROXY)로 빌드된 배포본은 키를 안 쓰므로 버튼을 숨긴다
  const proxied = !!import.meta.env.VITE_AI_PROXY;
  const enterKey = () => {
    const k = window.prompt(t('keyPrompt'))?.trim();
    if (!k) return;
    storage.set(STORAGE_KEYS.aiKey, k);
    location.reload();
  };
  const [reg, setReg] = useState<RegisterState>(initialRegisterState);
  const patch = (p: Partial<RegisterState>) => setReg((s) => ({ ...s, ...p }));
  // 탭 전환은 맨 위 화면만 바꿔치기 (history 항목도 그대로) — 뒤로가기가 탭 이력을 되감지 않게
  const setTab = (next: Tab) => replace({ k: 'admin', tab: next });

  return (
    <div className="stack">
      <Title>{T('담당자 화면', 'Officer console')}</Title>
      <Seg<Tab> items={[['reg', T('혜택 등록', 'Register')], ['sig', T('사각지대 신호', 'Gap signals')], ['tr', T('번역 검수', 'Translation review')]]} value={tab} onChange={setTab} />
      {tab === 'sig' ? <SignalsPanel /> : tab === 'tr' ? <ReviewPanel /> : <RegisterPanel state={reg} setState={patch} />}
      <div className="btn-row">
        <button type="button" className="btn secondary sm" onClick={() => go({ k: 'counter' })}>{T('창구 모드 열기', 'Open counter mode')}</button>
        {!proxied && <button type="button" className="btn secondary sm" onClick={enterKey}>{getAi() ? T('AI 키 바꾸기', 'Change AI key') : T('AI 키 넣기 (사진 읽기 켜기)', 'Enter AI key (enable photo reading)')}</button>}
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
