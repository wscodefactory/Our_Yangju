// 고지서 흐름 3단계: 읽은(또는 입력할) 내용 확인. 참고용 html 의 SCREENS.docConfirm + docform submit.
// 사진 경로면 가린 캔버스의 축소 이미지를 위에 보여 준다.
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { BottomBar, Title } from '@/components/layout/Chrome';
import { Callout } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { TAX_TYPES } from '@/data/content';
import type { DocInfo, TaxType } from '@/types';
import { Stepper } from './Stepper';

const EMPTY: DocInfo = { type: 'auto', amount: 0, due: '', epay: '', vacct: '' };

export function DocConfirmScreen({ manual }: { manual: boolean }) {
  const { lang, t, tx, fmtNum, go, openOverlay } = useApp();
  const { canvas, doc, setDoc } = useDoc();
  const d = doc ?? EMPTY;
  const [type, setType] = useState<TaxType>(d.type);
  const [amount, setAmount] = useState(d.amount ? fmtNum(d.amount) : '');
  const [due, setDue] = useState(d.due);
  const [epay, setEpay] = useState(d.epay);
  const [vacct, setVacct] = useState(d.vacct);
  const [err, setErr] = useState(false);
  const amtRef = useRef<HTMLInputElement>(null);
  const dueRef = useRef<HTMLInputElement>(null);
  // 사진 경로의 가린 캔버스 (ReadingScreen 을 거쳤으면 이미 가린 버전)
  const thumb = useMemo(() => (canvas && !d.sample ? canvas.toDataURL('image/jpeg', 0.6) : null), [canvas, d.sample]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amt = Number(amount.replace(/[^0-9]/g, '')) || 0;
    if (!amt || !due) {
      setErr(true);
      (!amt ? amtRef : dueRef).current?.focus();
      return;
    }
    const next: DocInfo = { ...d, type, amount: amt, due, epay: epay.trim(), vacct: vacct.trim() };
    // 샘플 값을 고쳤으면 원문 표기는 더 이상 맞지 않는다
    if (d.sample && (amt !== d.amount || due !== d.due)) { next.amountQ = null; next.dueQ = null; }
    setDoc(next);
    go({ k: 'docResult' });
  };

  const amtErr = err && !amount.replace(/[^0-9]/g, '');
  const dueErr = err && !due;
  return (
    <>
      <Title>{manual ? t('manualTitle') : t('confirmTitle')}</Title>
      <Stepper step={2} />
      {manual ? (
        <p className="lead">{t('manualLead')}</p>
      ) : d.sample ? (
        <div className="sample-row">
          <Ic n="shield" cls="sm" /><span style={{ flex: 1 }}>{t('readFromSample')}</span>
          <button type="button" className="btn ghost sm" onClick={() => openOverlay({ k: 'notice' })}>{t('viewNotice')}</button>
        </div>
      ) : thumb && (
        <div style={{ marginBottom: 12 }}>
          <img className="thumb" src={thumb} alt={t('noticeT')} />
          {d.confidence === 'low' && (
            <Callout kind="warn" icon="alert" sm style={{ marginTop: 8 }}>
              {lang === 'ko' ? 'AI 가 확실하지 않대요. 고지서와 꼭 비교해 주세요.' : 'The AI is not sure. Please compare carefully with your notice.'}
            </Callout>
          )}
        </div>
      )}
      <form className="form" id="docform" noValidate onSubmit={onSubmit}>
        <div className="fld">
          <label htmlFor="f-type">{t('fTax')}</label>
          <select id="f-type" name="type" value={type} onChange={(e) => setType(e.target.value as TaxType)}>
            {(Object.keys(TAX_TYPES) as TaxType[]).map((k) => <option key={k} value={k}>{tx(TAX_TYPES[k])}</option>)}
          </select>
        </div>
        <div className="grid2">
          <div className={`fld ${amtErr ? 'err' : ''}`.trim()}>
            <label htmlFor="f-amt">{t('fAmount')}</label>
            <input id="f-amt" name="amount" ref={amtRef} inputMode="numeric" autoComplete="off" value={amount} placeholder="143,000" aria-invalid={amtErr} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className={`fld ${dueErr ? 'err' : ''}`.trim()}>
            <label htmlFor="f-due">{t('fDue')}</label>
            <input id="f-due" name="due" ref={dueRef} type="date" value={due} aria-invalid={dueErr} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>
        <div className="fld">
          <label htmlFor="f-epay">{t('fEpay')} <span className="opt">({t('optional')})</span></label>
          <input id="f-epay" name="epay" inputMode="numeric" autoComplete="off" value={epay} placeholder="0000-0000-0000-0000-00" onChange={(e) => setEpay(e.target.value)} />
        </div>
        <div className="fld">
          <label htmlFor="f-vacct">{t('fVacct')} <span className="opt">({t('optional')})</span></label>
          <input id="f-vacct" name="vacct" autoComplete="off" value={vacct} onChange={(e) => setVacct(e.target.value)} />
        </div>
        {err && <p className="err-msg" role="alert"><Ic n="alert" cls="sm" /> {t('needFields')}</p>}
      </form>
      <BottomBar>
        <button type="submit" form="docform" className="btn primary">{manual ? t('btnManualGo') : t('btnConfirm')}</button>
      </BottomBar>
    </>
  );
}
