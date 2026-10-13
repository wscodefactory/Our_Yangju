// 고지서 흐름 3단계: "읽는 중". 마운트 직후 가린 캔버스를 확정해 JPEG 로 만들고,
// AI 로 읽어 DocInfo 로 바꾼 뒤 확인 화면으로 넘긴다. AI 에는 가린 뒤의 이미지만 간다 (finalizeMask 가 보장).
import { useEffect, useRef } from 'react';
import { Title } from '@/components/layout/Chrome';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { TAX_TYPES } from '@/data/content';
import { getAi } from '@/services/ai';
import { READ_NOTICE_PROMPT } from '@/services/prompts';
import type { DocData, DocInfo, Screen, TaxType } from '@/types';
import { Stepper } from './Stepper';

const EMPTY: DocInfo = { type: 'auto', amount: 0, due: '', epay: '', vacct: '' };
/** 모델이 tax_type 을 빼먹었을 때 한국어 세목명으로 보정 */
const KO_NAME: Record<string, TaxType> = { 자동차세: 'auto', 주민세: 'resident', 재산세: 'property', 지방소득세: 'income' };

function toDocInfo(r: DocData): DocInfo {
  const ko = r.tax_name?.ko ?? '';
  const byName = Object.keys(KO_NAME).find((n) => ko.includes(n));
  const type: TaxType = r.tax_type && r.tax_type in TAX_TYPES ? r.tax_type : byName ? KO_NAME[byName] : 'other';
  return {
    type,
    amount: r.amount_won || 0,
    due: r.due_date || '',
    epay: r.epay_no || '',
    vacct: r.vacct || '',
    phone: r.phone_on_doc || undefined,
    amountQ: r.amount_quote || null,
    dueQ: r.due_quote || null,
    confidence: r.confidence,
  };
}

/**
 * 다음 화면으로는 replace() 로 바꿔치기한다. 이 화면이 스택에 남으면 결과에서 뒤로가기 때 AI 를 또 부르기 때문.
 * (back() 뒤 go() 는 history.back() 이 비동기라 새 화면이 도로 빠진다)
 */
export function ReadingScreen() {
  const { t, back, replace, toast } = useApp();
  const { finalizeMask, setDoc } = useDoc();
  // StrictMode(dev) 는 effect 가 두 번 돌아 AI 호출이 겹치므로 한 번만 시작하고,
  // 읽는 동안 사용자가 뒤로 갔으면(alive=false) 결과로 화면을 옮기지 않는다
  const ran = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    if (!ran.current) {
      ran.current = true;
      void run();
    }
    return () => { alive.current = false; };
    // 마운트 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    const finish = (s: Screen, msg?: string) => {
      if (!alive.current) return;
      if (msg) toast(msg);
      replace(s);
    };
    let blob: Blob;
    try {
      blob = await finalizeMask(); // 여기서 rects 가 픽셀에 구워지고 canvas 가 가린 버전으로 바뀐다
    } catch {
      if (alive.current) back(); // canvas 없음 = doc 화면을 안 거침
      return;
    }
    const ai = getAi();
    if (!ai?.supportsImages) {
      setDoc(EMPTY);
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
      setDoc(EMPTY);
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
