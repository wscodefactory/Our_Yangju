// 혜택 카드 하나. 참고용 html 의 bcard + bmBtn. 본문 버튼은 상세로, 오른쪽 위 북마크는 저장 토글.
import { LvBadge, StBadge } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { BEN } from '@/data/content';

export type Benefit = (typeof BEN)[number];

export function BenefitCard({ b }: { b: Benefit }) {
  const { t, tx, go, toast, isSaved, toggleSaved } = useApp();
  const on = isSaved(b.id);
  return (
    <article className="bcard">
      <button type="button" className="bcard-main" onClick={() => go({ k: 'benefit', id: b.id })}>
        <span className="badges">
          <LvBadge lv={b.lv as 'C' | 'G' | 'Y'} /><StBadge st={b.st as 'high' | 'check'} />
          {b.example && <span className="bdg gray">{t('example')}</span>}
        </span>
        <div className="t">{tx(b.name)}</div><div className="d">{tx(b.what)}</div>
      </button>
      <button
        type="button" className="icon-btn bm" aria-pressed={on} aria-label={`${on ? t('unsave') : t('save')}: ${tx(b.name)}`}
        onClick={() => { toggleSaved(b.id); toast(on ? t('unsavedToast') : t('savedToast')); }}
      >
        <Ic n="bookmark" cls={on ? 'filled' : ''} />
      </button>
    </article>
  );
}
