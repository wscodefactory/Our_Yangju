// 받은 고지서 읽기 — 시작 화면. 참고용 html 의 SCREENS.doc 에 사진 경로(mask → reading)를 더한 것.
// 사진 버튼은 이미지 입력이 되는 AI 가 있을 때만 살아 있고, 없으면 키를 넣어 켜는 우회로를 준다.
import { useRef, useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Callout } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { TAX_TYPES } from '@/data/content';
import { getAi } from '@/services/ai';
import { STORAGE_KEYS, storage } from '@/utils/browser';
import { paidStore } from '@/utils/paid';
import { Stepper } from './Stepper';

export function DocScreen() {
  const { t, tx, fmtWon, fmtDate, go, toast } = useApp();
  const { startSample, startManual, loadFile } = useDoc();
  const fileRef = useRef<HTMLInputElement>(null);
  const imgOk = !!getAi()?.supportsImages;
  // 이 휴대폰에 저장한 납부 기록 (MY). 지우면 바로 사라진다
  const [paid, setPaid] = useState(() => paidStore.load());

  // 배포 번들에 키가 없을 때의 우회로: 기기 localStorage 에만 저장. getAi() 가 모듈 캐시라 새로고침이 가장 짧다
  const enterKey = () => {
    const k = window.prompt(t('keyPrompt'))?.trim();
    if (!k) return;
    storage.set(STORAGE_KEYS.geminiKey, k);
    location.reload();
  };

  const onFile = async (picked: File | undefined) => {
    if (!picked) return;
    try {
      await loadFile(picked); // HEIC 처럼 브라우저가 못 여는 포맷이면 throw
      go({ k: 'mask' });
    } catch {
      toast(t('photoFail'));
    }
  };

  return (
    <>
      <Title>{t('docT')}</Title>
      <Stepper step={0} />
      <p className="lead">{t('docLead')}</p>
      <Callout kind="green" icon="shield" style={{ marginBottom: 16 }}>{t('privacyDoc')}</Callout>
      {/* 개편 전(v1) 방식: 키가 있으면 사진 버튼, 없으면 사진 버튼 대신 안내 + 키 입력 버튼. 참고용 html 의 "비활성 사진 버튼"은 쓰지 않는다 */}
      <div className="stack">
        {imgOk ? (
          <button type="button" className="btn primary" onClick={() => fileRef.current?.click()}>
            <Ic n="camera" cls="sm" />{t('btnPhoto')}
          </button>
        ) : (
          <>
            <p className="muted" style={{ margin: 0 }}>{t('photoOff')}</p>
            <button type="button" className="btn secondary" onClick={enterKey}>
              <Ic n="camera" cls="sm" />{t('keyBtn')}
            </button>
          </>
        )}
        <button type="button" className={`btn ${imgOk ? 'secondary' : 'primary'}`} onClick={() => { startSample(); go({ k: 'docConfirm' }); }}>
          <Ic n="sample" cls="sm" />{t('btnSample')}
        </button>
        <button type="button" className="btn secondary" onClick={() => { startManual(); go({ k: 'docConfirm', manual: true }); }}>
          <Ic n="pencil" cls="sm" />{t('btnManual')}
        </button>
      </div>
      {paid.length > 0 && (
        <section className="panel" style={{ marginTop: 16 }}>
          <h2><span className="grow">{t('myRecords')}</span>
            <button type="button" className="btn ghost sm" onClick={() => { paidStore.clear(); setPaid([]); }}>{t('deleteAll')}</button>
          </h2>
          <div>
            {paid.map((r) => (
              <div key={r.paidAt} className="check" style={{ cursor: 'default' }}>
                <span style={{ flex: 1 }}><b>{tx(TAX_TYPES[r.type])}</b> · {fmtWon(r.amount)}</span>
                <span className="muted">{t('paidOn')} {fmtDate(new Date(r.paidAt).toISOString().slice(0, 10), { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
          <p className="muted" style={{ margin: '8px 0 0' }}>{t('paidNote')}</p>
        </section>
      )}
      {/* capture="environment" → 모바일은 후면 카메라, 데스크톱은 파일 선택창 */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const picked = e.target.files?.[0];
          e.target.value = ''; // 같은 파일을 다시 골라도 change 가 뜨게
          void onFile(picked);
        }}
      />
    </>
  );
}
