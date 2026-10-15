// 가림 영역을 이미지에 적용한 뒤 읽고, 실패하면 직접 입력으로 전환한다.
import { useEffect, useRef } from 'react';
import { Title } from '@/components/layout/Chrome';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { TAX_TYPES } from '@/data/content';
import { getAi } from '@/services/ai';
import { READ_NOTICE_PROMPT } from '@/services/prompts';
import type { DocData, DocInfo, Screen, TaxType } from '@/types';
import { Stepper } from './Stepper';

const EMPTY_NOTICE: DocInfo = { type: 'auto', amount: 0, due: '', epay: '', vacct: '' };
/** 모델이 tax_type 을 빼먹었을 때 한국어 세목명으로 보정 */
const TAX_TYPE_BY_NAME: Record<string, TaxType> = { 자동차세: 'auto', 주민세: 'resident', 재산세: 'property', 지방소득세: 'income' };

function toDocInfo(result: DocData): DocInfo {
  const taxName = result.tax_name?.ko ?? '';
  const matchedName = Object.keys(TAX_TYPE_BY_NAME).find((n) => taxName.includes(n));
  const type: TaxType = result.tax_type && result.tax_type in TAX_TYPES ? result.tax_type : matchedName ? TAX_TYPE_BY_NAME[matchedName] : 'other';
  return {
    type,
    amount: result.amount_won || 0,
    due: result.due_date || '',
    epay: result.epay_no || '',
    vacct: result.vacct || '',
    phone: result.phone_on_doc || undefined,
    amountQ: result.amount_quote || null,
    dueQ: result.due_quote || null,
    confidence: result.confidence,
  };
}

/** 결과 화면은 replace로 전환해 뒤로 가기 시 읽기 요청이 반복되지 않게 한다. */
export function ReadingScreen() {
  const { t, back, replace, toast } = useApp();
  const { finalizeMask, setDoc } = useDoc();
  // StrictMode(dev) 는 effect 가 두 번 돌아 AI 호출이 겹치므로 한 번만 시작하고,
  // 읽는 동안 사용자가 뒤로 갔으면(isActive=false) 결과로 화면을 옮기지 않는다
  const hasStarted = useRef(false);
  const isActive = useRef(true);

  useEffect(() => {
    isActive.current = true;
    if (!hasStarted.current) {
      hasStarted.current = true;
      void run();
    }
    return () => { isActive.current = false; };
    // 마운트 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    const finish = (s: Screen, msg?: string) => {
      if (!isActive.current) return;
      if (msg) toast(msg);
      replace(s);
    };
    let blob: Blob;
    try {
      blob = await finalizeMask(); // 여기서 rects 가 픽셀에 구워지고 canvas 가 가린 버전으로 바뀐다
    } catch {
      if (isActive.current) back(); // canvas 없음 = doc 화면을 안 거침
      return;
    }
    const ai = getAi();
    if (!ai?.supportsImages) {
      setDoc(EMPTY_NOTICE);
      finish({ k: 'docConfirm', manual: true }, t('readOff'));
      return;
    }
    try {
      const r = await ai.json<DocData>(READ_NOTICE_PROMPT, { image: blob });
      setDoc(toDocInfo(r));
      if (r.doc_type === 'welfare_notice') finish({ k: 'welfare' }, t('welfareLetter'));
      else finish({ k: 'docConfirm' });
    } catch {
      // 네트워크든 JSON 파싱이든 사용자 입장에선 같다 — 직접 입력으로 우회
      setDoc(EMPTY_NOTICE);
      finish({ k: 'docConfirm', manual: true }, t('readFail'));
    }
  }

  return (
    <>
      <Title>{t('st3')}</Title>
      <Stepper step={2} />
      <div className="thinking" role="status" aria-live="polite">
        <i aria-hidden="true" /><span>{t('readingMsg')}</span>
      </div>
    </>
  );
}
