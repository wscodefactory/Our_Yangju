// 받은 문서 흐름의 종점: 사람에게 연결.
// 전화번호 몇 개와, 담당자에게 그대로 보여줄 한국어 메모(koNote)를 띄운다.
// CardScreen(q 없음)과 TaxQScreen(질문 있음) 양쪽에서 들어온다. 원본 html의 #counsel.
import { useRef, useState } from 'react';
import { Copy, Phone } from 'lucide-react';
import { Crumb } from '@/components/layout/Crumb';
import { Hint, Note } from '@/components/ui/Notes';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { NOTICE_TEXT } from '@/data/tax';
import { copyText } from '@/utils/browser';
import { koNote } from '@/utils/format';

/**
 * 상담 연결 — 사람에게 연결 + 담당자에게 보여줄 한국어 메모.
 * q: 내비 항목에 실려 온 질문. 비어 있으면 DocContext.lastQ(추가 질문 화면의 마지막 질문)로 대체.
 */
export function CounselScreen({ q }: { q: string }) {
  const { T, L } = useApp();
  const { data, lastQ } = useDoc();
  const boxRef = useRef<HTMLDivElement>(null);
  // 복사 결과 피드백을 버튼 라벨 자체에 띄운다. null이면 기본 라벨
  const [copyLabel, setCopyLabel] = useState<string | null>(null);
  const note = koNote(data, q || lastQ);

  const onCopy = async () => {
    // clipboard API가 막힌 환경(iOS 일부, http)에서는 텍스트 선택까지만 해준다
    const result = await copyText(boxRef.current);
    setCopyLabel(result === 'copied' ? T('복사했어요', 'Copied') : T('선택했어요. 길게 눌러 복사하세요', 'Selected. Press and hold to copy'));
  };

  return (
    <>
      <Crumb path={T('상담 연결', 'Talk to someone')} />
      <h1>{T('사람에게 연결해요', 'Connect to a person')}</h1>
      <div className="list">
        <div className="item lk">
          <span><b>1345</b> · {T('외국인종합안내센터 (다국어 통역)', 'Immigration Contact Center (interpreting)')}</span>
          <span className="tag"><Phone aria-hidden="true" /> {T('전화', 'Call')}</span>
        </div>
        {/* AI가 고지서에서 읽어낸 번호가 있을 때만 */}
        {data?.phone_on_doc && (
          <div className="item lk">
            <span><b>{data.phone_on_doc}</b> · {T('고지서에 적힌 담당 부서', 'Office on your notice')}</span>
            <span className="tag"><Phone aria-hidden="true" /> {T('전화', 'Call')}</span>
          </div>
        )}
        <div className="item">{T('가까운 행정복지센터 방문 (고지서를 가져가세요)', 'Visit your community service center (bring the notice)')}</div>
      </div>
      <Hint style={{ marginTop: 12 }}>{T('담당자에게 보여줄 한국어 메모', 'Korean note to show the officer')}</Hint>
      <div className="copybox" lang="ko" ref={boxRef}>{note}</div>
      <Stack mt={10}>
        <WideButton arrow={null} label={<><Copy aria-hidden="true" /> {copyLabel ?? T('메모 복사', 'Copy note')}</>} onClick={onCopy} />
      </Stack>
      <Note>{L(NOTICE_TEXT.interp)}</Note>
    </>
  );
}
