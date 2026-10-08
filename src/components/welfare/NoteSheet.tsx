// 담당자에게 보낼 한국어 문의 메모 시트. 참고용 html 의 makeNote + note 시트. 메모는 일부러 한국어 고정.
import { Sheet } from '@/components/layout/Chrome';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { BEN } from '@/data/content';
import { copyText } from '@/utils/browser';
import type { Benefit } from './BenefitCard';

function makeNote(b: Benefit, ko: boolean) {
  const qs = b.quiz.map((q) => q[0]).join(' / ');
  return `제목: ${b.name[0]} 신청 자격 문의\n\n안녕하세요. 양주시에 살고 있는 ${ko ? '시민' : '외국인 주민'}입니다.\n'${b.who[0]}' 조건과 관련해 제 상황에서 신청할 수 있는지 확인 부탁드립니다.\n\n확인하고 싶은 내용: ${qs}\n\n${ko ? '' : '한국어가 서툴러 필요하면 통역(1345)과 함께 연락드리겠습니다. '}감사합니다.`;
}

export function NoteSheet({ id }: { id: string }) {
  const { lang, t, toast, closeOverlay } = useApp();
  const b = BEN.find((x) => x.id === id);
  if (!b) return null;
  const note = makeNote(b, lang === 'ko');
  return (
    <Sheet id="note-h" title={t('noteT')} icon="pencil" onClose={closeOverlay}>
      <p className="muted" style={{ margin: '0 0 12px' }}>{t('noteD')}</p>
      <div className="codebox" style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
        <code lang="ko" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontWeight: 500, fontSize: '.875rem' }}>{note}</code>
      </div>
      <button type="button" className="btn primary" style={{ marginTop: 14 }} onClick={() => { void copyText(note); toast(t('copied')); }}>
        <Ic n="copy" cls="sm" />{t('copyNote')}
      </button>
    </Sheet>
  );
}
