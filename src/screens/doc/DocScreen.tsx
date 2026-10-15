// 사진·샘플·직접 입력 경로와 이 기기에 저장한 납부 기록.
import { useRef, useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Callout } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { TAX_TYPES } from '@/data/content';
import { paidStore } from '@/utils/paid';
import { Stepper } from './Stepper';

// 로컬 날짜 'YYYY-MM-DD'. toISOString 은 UTC 라 한국 아침에 저장한 기록이 전날로 보인다
const localYmd = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function DocScreen() {
  const { t, tx, fmtWon, fmtDate, go, toast, qrEntry } = useApp();
  const { startSample, startManual, loadFile } = useDoc();
  const fileRef = useRef<HTMLInputElement>(null);
  // 이 휴대폰에 저장한 납부 기록. 지우면 바로 사라진다
  const [paid, setPaid] = useState(() => paidStore.load());

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
      {qrEntry && <p className="qr-badge"><Ic n="check" cls="sm" />{t('qrHere')}</p>}
      <Stepper step={0} />
      <p className="lead">{t('docLead')}</p>
      <Callout kind="green" icon="shield" style={{ marginBottom: 16 }}>{t('privacyDoc')}</Callout>
      <div className="stack">
        <button type="button" className="btn primary" onClick={() => fileRef.current?.click()}>
          <Ic n="camera" cls="sm" />{t('btnPhoto')}
        </button>
        <button type="button" className="btn secondary" onClick={() => { void startSample().then(() => go({ k: 'mask' })); }}>
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
                <span className="muted">{t('paidOn')} {fmtDate(localYmd(r.paidAt), { month: 'short', day: 'numeric' })}</span>
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
