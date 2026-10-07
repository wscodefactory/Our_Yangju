// 받은 문서 흐름 3단계: "읽는 중" 로딩 화면.
// UI는 스피너 한 줄뿐이고, 진짜 일은 마운트 직후 effect에서 한다 —
// 가린 캔버스를 확정해 JPEG로 만들고, AI(없으면 샘플 데이터)로 읽은 뒤 다음 화면으로 넘긴다.
// 원본 html에서는 show('reading') 직후 async 함수 하나가 이 일을 전부 했다.
import { useEffect, useRef } from 'react';
import { Crumb } from '@/components/layout/Crumb';
import { Thinking } from '@/components/ui/Bits';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { getAi } from '@/services/ai';
import { READ_NOTICE_PROMPT } from '@/services/prompts';
import type { DocData } from '@/types';

/**
 * 읽는 중 — 마운트 시 한 번 AI(또는 샘플 데이터)로 문서를 읽고 다음 화면으로.
 *
 * 화면 전환은 전부 back() 다음 go() 패턴이다. 이 화면은 스택에 남아 있으면 안 되기 때문 —
 * 결과 화면에서 뒤로가기를 눌렀을 때 다시 "읽는 중"으로 돌아와 AI를 또 부르면 곤란하다.
 * back()으로 자기 자신을 빼고 go()로 결과 화면을 올리면 사실상 reading을 confirm으로 바꿔치기한 셈이 된다.
 */
export function ReadingScreen() {
  const { T, back, go, toast } = useApp();
  const { finalizeMask, isSample, sampleData, setData } = useDoc();
  // StrictMode(dev)에서는 effect가 mount→unmount→mount로 두 번 돈다.
  // AI 호출이 두 번 나가고 back()이 두 번 찍히면 스택이 꼬이므로 ref로 한 번만 실행되게 막는다.
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      let blob: Blob;
      try {
        // 여기서 rects가 실제 픽셀에 구워지고 DocContext.canvas가 가린 버전으로 교체된다
        blob = await finalizeMask();
      } catch {
        // canvas가 없다 = doc 화면을 거치지 않고 들어온 경우. 그냥 되돌린다
        back();
        return;
      }

      const ai = getAi();
      if (!ai || !ai.supportsImages) {
        // AI 없이도 시연은 돌아가야 해서 샘플이면 하드코딩된 결과를 쓴다
        if (isSample) {
          setData(sampleData());
          back();
          go({ k: 'confirm' });
        } else {
          toast(T('사진 읽기를 쓸 수 없어요. 직접 입력해 주세요.', 'Photo reading is unavailable. Please enter it.'));
          back();
          go({ k: 'manual' });
        }
        return;
      }

      try {
        const result = await ai.json<DocData>(READ_NOTICE_PROMPT, { image: blob });
        setData(result);
        back();
        if (result.doc_type !== 'tax_notice') {
          // 복지 안내문은 복지 섹션으로, 그 외(영수증·광고 등)는 직접 입력으로 돌린다
          toast(result.doc_type === 'welfare_notice'
            ? T('복지 안내문이에요. 복지 혜택으로 이동해요.', 'This is a welfare letter. Opening Welfare.')
            : T('아직 세금 고지서만 읽을 수 있어요.', 'Only tax notices can be read for now.'));
          go(result.doc_type === 'welfare_notice' ? { k: 'welfare' } : { k: 'manual' });
          return;
        }
        go({ k: 'confirm' });
      } catch {
        // 네트워크 실패든 JSON 파싱 실패든 사용자 입장에선 같다 — 직접 입력으로 우회
        back();
        toast(T('읽지 못했어요. 직접 입력해 주세요.', 'Could not read it. Please enter it.'));
        go({ k: 'manual' });
      }
    })();
    // 마운트 시 1회만. 의존성에 finalizeMask 등을 넣으면 rects 변경마다 다시 돌아버린다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Crumb path={T('문서 찍기 › 읽는 중', 'Scan › Reading')} />
      <Thinking>{T('양주무관이 문서를 읽고 있어요… (10~40초)', 'The Yangju Guide is reading your document… (10–40 s)')}</Thinking>
    </>
  );
}
