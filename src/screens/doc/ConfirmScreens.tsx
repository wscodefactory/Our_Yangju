// 받은 문서 흐름 4단계: 읽은 결과 확인(ConfirmScreen)과, 사진 없이 바로 넣는 직접 입력(ManualScreen).
// 두 화면 모두 마지막엔 같은 일을 한다 — 세금 종류/금액/기한을 DocData에 합쳐 할 일 카드로 이동.
// 그 공통 부분을 useConfirm 훅으로 빼뒀다. 원본 html의 #confirm, #manual 섹션.
import { useState } from 'react';
import { Crumb } from '@/components/layout/Crumb';
import { AiModeBadge, Note } from '@/components/ui/Bits';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { TAX_KINDS, TAX_NAME_EN, TAX_NAME_MULTI } from '@/data/tax';
import { getAi } from '@/services/ai';
import type { DocData, TaxName } from '@/types';

/**
 * 입력값을 DocData로 합쳐 할 일 카드로 이동하는 콜백을 돌려준다.
 * 세금 이름 처리가 핵심: AI가 읽어온 다국어 이름이 있고 사용자가 손대지 않았으면 그대로 두고,
 * 바꿨거나 직접 입력이면 우리 사전(TAX_NAME_EN / TAX_NAME_MULTI)에서 번역을 채운다.
 */
function useConfirm() {
  const { T, go, toast } = useApp();
  const { data, setData } = useDoc();
  return (tax: string, amtRaw: string, due: string) => {
    // "87,500원" 같이 들어와도 숫자만 남긴다
    const amt = Number(String(amtRaw).replace(/[^0-9]/g, ''));
    if (!amt || !due) { toast(T('금액과 기한을 넣어 주세요', 'Enter the amount and date')); return; }

    const prev: DocData = data || {};
    // 한국어 이름이 그대로면 AI가 준 zh/vi/ne 번역을 살린다 (사전보다 문맥에 맞을 가능성이 큼)
    const same = !!prev.tax_name && prev.tax_name.ko === tax;
    let tax_name: TaxName = same ? prev.tax_name! : { ko: tax, en: TAX_NAME_EN[tax] || tax };
    if (!same) {
      // TAX_NAME_MULTI는 [vi, ne, zh] 순서. 사전에 없는 세금이면 한국어/영어만 남는다
      const multi = TAX_NAME_MULTI[tax];
      if (multi) tax_name = { ...tax_name, vi: multi[0], ne: multi[1], zh: multi[2] };
    }
    // phone_on_doc, confidence 같은 나머지 필드는 prev에서 그대로 따라온다
    setData({ ...prev, amount_won: amt, due_date: due, tax_name });
    go({ k: 'card' });
  };
}

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
      </div>
      {d.confidence === 'low' && (
        <Note>{T('글씨가 흐려 확신이 낮아요. 꼭 고지서와 비교해 주세요.', 'The photo is unclear. Please compare carefully with your notice.')}</Note>
      )}
      <Stack mt={12}>
        <WideButton primary label={T('맞아요 → 할 일 보기', 'Correct → Show what to do')} onClick={() => confirm(tax.trim(), amt, due)} />
      </Stack>
    </>
  );
}

/** 직접 입력 — 사진 없이 세금 종류(select)·금액·기한만 받는다 */
export function ManualScreen() {
  const { T } = useApp();
  const confirm = useConfirm();
  const [tax, setTax] = useState<string>(TAX_KINDS[0]);
  const [amt, setAmt] = useState('');
  const [due, setDue] = useState('');
  return (
    <>
      <Crumb path={T('직접 입력', 'Enter manually')} />
      <h1>{T('고지서에 적힌 대로 넣어 주세요', 'Enter what your notice says')}</h1>
      <div className="form">
        <div className="field">
          <label htmlFor="fTax">{T('세금 종류', 'Tax')}</label>
          <select id="fTax" value={tax} onChange={(e) => setTax(e.target.value)}>
            {TAX_KINDS.map((kind) => <option key={kind}>{kind}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fAmt">{T('납부 금액(원)', 'Amount (KRW)')}</label>
          <input id="fAmt" inputMode="numeric" placeholder="87500" value={amt} onChange={(e) => setAmt(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="fDue">{T('납부 기한', 'Due date')}</label>
          <input id="fDue" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
      </div>
      <Stack mt={12}>
        <WideButton primary label={T('할 일 보기', 'Show what to do')} onClick={() => confirm(tax, amt, due)} />
      </Stack>
    </>
  );
}
