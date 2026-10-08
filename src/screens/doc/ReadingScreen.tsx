// 고지서 흐름 3단계: "읽는 중". 마운트 직후 effect 에서 가린 캔버스를 확정해 JPEG 로 만들고,
// AI 로 읽어 DocInfo 로 바꾼 뒤 확인 화면으로 넘긴다. 가린 뒤의 이미지만 AI 에 보낸다 (finalizeMask 가 보장).
import { useEffect, useRef } from 'react';
import { Title } from '@/components/layout/Chrome';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { TAX_TYPES } from '@/data/content';
import { getAi } from '@/services/ai';
import { READ_NOTICE_PROMPT } from '@/services/prompts';
import type { DocData, DocInfo, TaxType } from '@/types';
import { Stepper } from './Stepper';

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
 * 화면 전환은 전부 back() 다음 go(). 이 화면이 스택에 남으면 결과에서 뒤로가기 때 AI 를 또 부르기 때문.
 */
export function ReadingScreen() {
  const { lang, t, back, go, toast } = useApp();
  const { finalizeMask, setDoc } = useDoc();
  // StrictMode(dev) 는 effect 가 두 번 돌아 AI 호출·back() 이 겹치므로 한 번만
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const ko = lang === 'ko';
    const toManual = (msg: string) => { toast(msg); back(); go({ k: 'docConfirm', manual: true }); };

    (async () => {
      let blob: Blob;
      try {
        blob = await finalizeMask(); // 여기서 rects 가 픽셀에 구워지고 canvas 가 가린 버전으로 바뀐다
      } catch {
        back(); // canvas 없음 = doc 화면을 안 거침
        return;
      }
      const ai = getAi();
      if (!ai?.supportsImages) {
        setDoc({ type: 'auto', amount: 0, due: '', epay: '', vacct: '' });
        toManual(ko ? '사진 읽기를 쓸 수 없어요. 직접 입력해 주세요.' : 'Photo reading is unavailable. Please enter it.');
        return;
      }
      try {
        const r = await ai.json<DocData>(READ_NOTICE_PROMPT, { image: blob });
        setDoc(toDocInfo(r));
        back();
        if (r.doc_type === 'welfare_notice') {
          toast(ko ? '복지 안내문이에요. 복지 혜택으로 이동해요.' : 'This is a welfare letter. Opening Welfare.');
          go({ k: 'welfare' });
          return;
        }
        go({ k: 'docConfirm' });
      } catch {
        // 네트워크든 JSON 파싱이든 사용자 입장에선 같다 — 직접 입력으로 우회
        setDoc({ type: 'auto', amount: 0, due: '', epay: '', vacct: '' });
        toManual(ko ? '읽지 못했어요. 직접 입력해 주세요.' : 'Could not read it. Please enter it.');
      }
    })();
    // 마운트 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Title>{t('st3')}</Title>
      <Stepper step={2} />
      <div className="thinking" role="status" aria-live="polite">
        <i aria-hidden="true" /><span>{lang === 'ko' ? '양주무관이 고지서를 읽고 있어요… (10~40초)' : 'The Yangju Guide is reading your notice… (10–40 s)'}</span>
      </div>
    </>
  );
}
