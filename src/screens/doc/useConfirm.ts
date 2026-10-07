// 받은 문서 흐름의 마지막 공통 단계: 세금 종류/금액/기한을 DocData에 합쳐 할 일 카드로 이동.
// ConfirmScreen(읽은 결과 확인)과 ManualScreen(직접 입력)이 같은 일을 하길래 훅으로 빼뒀다.
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { TAX_NAME_EN, TAX_NAME_MULTI } from '@/data/tax';
import type { DocData, TaxName } from '@/types';

/**
 * 입력값을 DocData로 합쳐 할 일 카드로 이동하는 콜백을 돌려준다.
 * 세금 이름 처리가 핵심: AI가 읽어온 다국어 이름이 있고 사용자가 손대지 않았으면 그대로 두고,
 * 바꿨거나 직접 입력이면 우리 사전(TAX_NAME_EN / TAX_NAME_MULTI)에서 번역을 채운다.
 */
export function useConfirm() {
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
