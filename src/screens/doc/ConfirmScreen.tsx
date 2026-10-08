// 받은 문서 흐름 4단계: AI가 읽은 결과를 사용자가 고지서와 대조하는 확인 화면.
// 마지막 합치기(DocData → 할 일 카드)는 ManualScreen과 공유하는 useConfirm 훅이 맡는다. 원본 html의 #confirm 섹션.
import { useState } from 'react';
import { Crumb } from '@/components/layout/Crumb';
import { Note } from '@/components/ui/Notes';
import { AiModeBadge } from '@/components/ui/Status';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { getAi } from '@/services/ai';
import { useConfirm } from './useConfirm';

/**
 * 읽은 결과 확인 (고지서와 같나요?)
 * AI가 뽑은 값을 입력칸에 미리 채우고, 원문 표기(amount_quote/due_quote)를 옆에 보여줘서
 * 사용자가 고지서와 대조할 수 있게 한다. 사진은 가린 뒤 버전이라 썸네일로 다시 보여줘도 안전.
 */
export function ConfirmScreen() {
  const { T } = useApp();
  const { data, canvas } = useDoc();
  const confirm = useConfirm();
  const d = data || {};
  const [tax, setTax] = useState(d.tax_name?.ko || '');
  const [amt, setAmt] = useState(d.amount_won != null ? String(d.amount_won) : '');
  const [due, setDue] = useState(d.due_date || '');
  const [epay, setEpay] = useState(d.epay_no || '');
  const [vacct, setVacct] = useState(d.vacct || '');
  // 화질 0.6이면 썸네일로 충분하고 dataURL 길이도 적당히 짧다
  const img = canvas ? canvas.toDataURL('image/jpeg', 0.6) : '';

  return (
    <>
      <Crumb path={T('문서 찍기 › 확인', 'Scan › Check')} />
      <h1>{T('고지서와 같나요?', 'Does this match your notice?')}{!getAi() && <AiModeBadge />}</h1>
      {img && <img className="thumb" src={img} alt={T('가린 문서 사진', 'Covered document photo')} />}
      <div className="form" style={{ marginTop: 12 }}>
        <div className="field">
          <label htmlFor="fTax">{T('세금 종류', 'Tax')}</label>
          {/* 직접 입력과 달리 자유 입력 — AI가 읽은 이름이 TAX_KINDS에 없을 수 있어서 */}
          <input id="fTax" value={tax} onChange={(e) => setTax(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="fAmt">{T('납부 금액(원)', 'Amount (KRW)')}</label>
          <input id="fAmt" inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value)} />
          {d.amount_quote && <span className="hint">{T('문서 표기', 'On the document')}: {d.amount_quote}</span>}
        </div>
        <div className="field">
          <label htmlFor="fDue">{T('납부 기한', 'Due date')}</label>
          <input id="fDue" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          {d.due_quote && <span className="hint">{T('문서 표기', 'On the document')}: {d.due_quote}</span>}
        </div>
        {/* 전자납부번호·가상계좌는 고지서 전용 번호. 못 읽었으면 비워 두고 카드에서 해당 블록이 빠진다 */}
        <div className="field">
          <label htmlFor="fEpay">{T('전자납부번호', 'e-Payment number')}</label>
          <input id="fEpay" inputMode="numeric" value={epay} onChange={(e) => setEpay(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="fVacct">{T('가상계좌 (은행·번호)', 'Virtual account (bank, number)')}</label>
          <input id="fVacct" value={vacct} onChange={(e) => setVacct(e.target.value)} />
        </div>
      </div>
      {d.confidence === 'low' && (
        <Note>{T('글씨가 흐려 확신이 낮아요. 꼭 고지서와 비교해 주세요.', 'The photo is unclear. Please compare carefully with your notice.')}</Note>
      )}
      <Stack mt={12}>
        <WideButton primary label={T('맞아요 → 할 일 보기', 'Correct → Show what to do')} onClick={() => confirm(tax.trim(), amt, due, { epay_no: epay.trim() || null, vacct: vacct.trim() || null })} />
      </Stack>
    </>
  );
}
