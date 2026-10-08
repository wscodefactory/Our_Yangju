// 저장한 혜택 목록. 참고용 html 의 SCREENS.saved.
import { Title } from '@/components/layout/Chrome';
import { Ic } from '@/components/ui/Ic';
import { BenefitCard } from '@/components/welfare/BenefitCard';
import { useApp } from '@/context/AppContext';
import { BEN } from '@/data/content';

export function SavedScreen() {
  const { t, go, isSaved } = useApp();
  const list = BEN.filter((b) => isSaved(b.id));
  return (
    <>
      <Title>{t('aSaved')}</Title>
      {list.length ? (
        <div className="stack">{list.map((b) => <BenefitCard key={b.id} b={b} />)}</div>
      ) : (
        <div className="empty">
          <span className="ibox tone-orange"><Ic n="bookmark" cls="lg" /></span>
          <h2>{t('savedEmpty')}</h2><p>{t('savedEmptyD')}</p>
          <button type="button" className="btn primary" style={{ maxWidth: 320 }} onClick={() => go({ k: 'welfare' })}>{t('goWelfare')}</button>
        </div>
      )}
    </>
  );
}
