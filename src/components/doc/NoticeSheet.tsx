// "원본 보기" 시트: 샘플 고지서를 가린 모양으로 보여 준다. 참고용 html 의 noticePreview().
import { Sheet } from '@/components/layout/Chrome';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { SAMPLE } from '@/data/content';

export function NoticeSheet() {
  const { lang, t, closeOverlay } = useApp();
  const Mask = ({ w }: { w?: string }) => <span className="mask" role="img" aria-label={t('st2')} style={w ? { width: w } : undefined} />;
  return (
    <Sheet id="notice-h" title={t('noticeT')} icon="file" onClose={closeOverlay}>
      <figure className="notice" lang="ko" style={{ margin: 0 }} aria-label={t('previewCap')}>
        <div className="nh"><span style={{ fontSize: '.75rem', color: '#51A121', fontWeight: 700 }}>양주시장</span><b>2026년 12월 정기분 자동차세 납부고지서</b></div>
        <div className="nr"><span>납세자</span><Mask /></div>
        <div className="nr"><span>주소</span><Mask w="90%" /></div>
        <div className="nr"><span>납세번호</span><Mask w="60%" /></div>
        <div className="nr hl"><span>납부금액</span><b>{SAMPLE.amountQ}</b></div>
        <div className="nr hl"><span>납부기한</span><b>{SAMPLE.dueQ}</b></div>
        <div className="nr hl"><span>전자납부번호</span><span>{SAMPLE.epay}</span></div>
        <div className="nr hl"><span>가상계좌</span><span>{SAMPLE.vacct} (가상)</span></div>
        <figcaption className="cap"><Ic n="shield" cls="sm" /><span lang={lang}>{t('previewCap')}</span></figcaption>
      </figure>
    </Sheet>
  );
}
