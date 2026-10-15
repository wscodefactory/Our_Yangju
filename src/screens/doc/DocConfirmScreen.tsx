// 고지서 인식 결과와 직접 입력한 값을 확인·수정하는 화면.
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { BottomBar, Title } from '@/components/layout/Chrome';
import { Callout } from '@/components/ui/Bits';
import { DateFields } from '@/components/ui/DateFields';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { TAX_TYPES } from '@/data/content';
import type { DocInfo, TaxType } from '@/types';
import { Stepper } from './Stepper';

const EMPTY_NOTICE: DocInfo = { type: 'auto', amount: 0, due: '', epay: '', vacct: '' };
const digits = (s: string) => s.replace(/[^0-9]/g, '');

export function DocConfirmScreen({ manual }: { manual: boolean }) {
  const { t, tx, fmtNum, go, openOverlay } = useApp();
  const { canvas, doc, setDoc } = useDoc();
  const notice = doc ?? EMPTY_NOTICE;
  const [type, setType] = useState<TaxType>(notice.type);
  const [amount, setAmount] = useState(notice.amount ? fmtNum(notice.amount) : '');
  const [due, setDue] = useState(notice.due);
  const [epay, setEpay] = useState(notice.epay);
  const [vacct, setVacct] = useState(notice.vacct);
  const [showErrors, setShowErrors] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const dueRef = useRef<HTMLInputElement>(null);
  // ReadingScreen 을 거쳤으면 canvas 는 이미 가린 버전
  const thumb = useMemo(() => (canvas && !notice.sample ? canvas.toDataURL('image/jpeg', 0.6) : null), [canvas, notice.sample]);

  const amountValue = Number(digits(amount)) || 0;
  const amountInvalid = showErrors && !amountValue;
  const dueInvalid = showErrors && !due;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amountValue || !due) {
      setShowErrors(true);
      (!amountValue ? amountRef : dueRef).current?.focus();
      return;
    }
    const next: DocInfo = { ...notice, type, amount: amountValue, due, epay: epay.trim(), vacct: vacct.trim() };
    // 값을 고쳤으면 "원문 표기" 병기는 더 이상 맞지 않으니 뗀다
    if (amountValue !== notice.amount) next.amountQ = null;
    if (due !== notice.due) next.dueQ = null;
    setDoc(next);
    go({ k: 'docResult' });
  };

  return (
    <>
      <Title>{manual ? t('manualTitle') : t('confirmTitle')}</Title>
      {!manual && <Stepper step={2} />}
      {manual ? (
        <p className="lead">{t('manualLead')}</p>
      ) : notice.sample ? (
        <div className="sample-row">
          <Ic n="shield" cls="sm" /><span style={{ flex: 1 }}>{t('readFromSample')}</span>
          <button type="button" className="btn ghost sm" onClick={() => openOverlay({ k: 'notice' })}>{t('viewNotice')}</button>
        </div>
      ) : thumb && (
        <div style={{ marginBottom: 12 }}>
          <img className="thumb" src={thumb} alt={t('noticeT')} />
          {notice.confidence === 'low' && (
            <Callout kind="warn" icon="alert" sm style={{ marginTop: 8 }}>
              {t('lowConf')}
            </Callout>
          )}
        </div>
      )}
      {!manual && <p className="lead" style={{ margin: '0 0 12px' }}>{t('confirmLead')}</p>}
      <form className="form" id="docform" noValidate onSubmit={onSubmit}>
        <div className="fld">
          <label htmlFor="f-type">{t('fTax')}</label>
          <select id="f-type" name="type" value={type} onChange={(e) => setType(e.target.value as TaxType)}>
            {(Object.keys(TAX_TYPES) as TaxType[]).map((k) => <option key={k} value={k}>{tx(TAX_TYPES[k])}</option>)}
          </select>
        </div>
        <div className={`fld ${amountInvalid ? 'err' : ''}`.trim()}>
          <label htmlFor="f-amt">{t('fAmount')}</label>
          <input id="f-amt" name="amount" ref={amountRef} inputMode="numeric" autoComplete="off" value={amount} placeholder="143,000" aria-invalid={amountInvalid} onChange={(e) => setAmount(e.target.value)} />
        </div>
        {/* 기한은 연·월·일 세 칸. 브라우저 달력(type=date)은 기기 언어로 고정돼 앱 언어를 못 따라와서 */}
        <div className={`fld ${dueInvalid ? 'err' : ''}`.trim()}>
          <label htmlFor="f-due-year">{t('fDue')}</label>
          <DateFields idPrefix="f-due" ref={dueRef} value={due} invalid={dueInvalid} onChange={setDue} />
        </div>
        <div className="fld">
          <label htmlFor="f-epay">{t('fEpay')} <span className="optl">({t('optional')})</span></label>
          <input id="f-epay" name="epay" inputMode="numeric" autoComplete="off" value={epay} placeholder="0000-0000-0000-0000-00" onChange={(e) => setEpay(e.target.value)} />
        </div>
        <div className="fld">
          <label htmlFor="f-vacct">{t('fVacct')} <span className="optl">({t('optional')})</span></label>
          <input id="f-vacct" name="vacct" autoComplete="off" value={vacct} onChange={(e) => setVacct(e.target.value)} />
        </div>
        {showErrors && <p className="err-msg" role="alert"><Ic n="alert" cls="sm" /> {t('needFields')}</p>}
      </form>
      <BottomBar>
        <button type="submit" form="docform" className="btn primary">{manual ? t('btnManualGo') : t('btnConfirm')}</button>
      </BottomBar>
    </>
  );
}
