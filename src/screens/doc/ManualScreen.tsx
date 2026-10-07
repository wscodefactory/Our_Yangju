// 받은 문서 흐름의 우회로: 사진 없이 세금 종류/금액/기한을 직접 넣는 화면.
// 합치기는 ConfirmScreen과 같은 useConfirm 훅을 쓴다. 원본 html의 #manual 섹션.
import { useState } from 'react';
import { Crumb } from '@/components/layout/Crumb';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { TAX_KINDS } from '@/data/tax';
import { useConfirm } from './useConfirm';

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
