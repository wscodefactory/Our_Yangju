// 받은 문서 흐름의 첫 화면. 여기서 사진을 고르거나 샘플을 띄우면 DocContext에 캔버스가 올라가고,
// 이후 mask → reading → confirm → card → taxq → counsel 순서로 이어진다.
// 원본 html의 #doc 섹션(파일 input + 버튼 3개)을 그대로 옮긴 것.
import { useRef } from 'react';
import { Crumb } from '@/components/layout/Crumb';
import { Hint, Note } from '@/components/ui/Bits';
import { LangRow } from '@/components/ui/LangRow';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { getAi } from '@/services/ai';

/**
 * 받은 문서 찍기 — 진입 화면.
 * 사진 읽기는 이미지 입력을 지원하는 AI가 있을 때만 보여주고,
 * 없으면 샘플 버튼을 primary로 올려서 시연이 막히지 않게 한다.
 */
export function DocScreen() {
  const { T, cl, setCardLang, go, toast } = useApp();
  const { startSample, loadFile } = useDoc();
  const fileRef = useRef<HTMLInputElement>(null);
  // 키 없음 / 텍스트 전용 모델이면 false
  const imgOk = !!getAi()?.supportsImages;

  const onFile = async (picked: File | undefined) => {
    if (!picked) return;
    try {
      // HEIC 같은 브라우저가 못 여는 포맷이면 fileToCanvas에서 throw
      await loadFile(picked);
      go({ k: 'mask' });
    } catch {
      toast(T('이 사진을 열 수 없어요', 'Cannot open this photo'));
    }
  };

  return (
    <>
      <Crumb path={T('받은 문서 찍기', 'Scan a document')} />
      <h1>{T('받은 문서를 찍어 주세요', 'Take a photo of your document')}</h1>
      <Hint>
        {T('세금 고지서나 시청 안내문을 찍으면 양주무관이 읽고, 내 언어로 지금 할 일을 알려줘요. 사진은 저장하지 않아요.',
          'Take a photo of a tax notice or a city letter. The Yangju Guide reads it and tells you what to do, in your language. Photos are not stored.')}
      </Hint>
      {/* 여기서 고른 언어가 할 일 카드 언어(cl)가 된다 */}
      <LangRow value={cl} onChange={setCardLang} ariaLabel={T('안내 언어', 'Card language')} />
      <Stack>
        {imgOk && (
          <WideButton primary label={T('사진 찍기 / 올리기', 'Take or upload a photo')} onClick={() => fileRef.current?.click()} />
        )}
        <WideButton
          primary={!imgOk}
          label={T('샘플 고지서로 해보기', 'Try a sample notice')}
          onClick={async () => { await startSample(); go({ k: 'mask' }); }}
        />
        <WideButton label={T('직접 입력하기', 'Enter it myself')} onClick={() => go({ k: 'manual' })} />
      </Stack>
      {!imgOk && (
        <Note>{T('AI 키가 없어 사진 읽기를 쓸 수 없어 샘플과 직접 입력만 보여요.', 'Photo reading needs an AI key, so only the sample and manual entry are shown.')}</Note>
      )}
      {/* capture="environment" → 모바일에서 후면 카메라 바로 열림. 데스크톱은 그냥 파일 선택창 */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const picked = e.target.files?.[0];
          // 같은 파일을 다시 골라도 change가 뜨도록 value를 비워둔다
          e.target.value = '';
          void onFile(picked);
        }}
      />
    </>
  );
}
