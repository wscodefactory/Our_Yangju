// 시청과 주민센터 업무 목록. 참고용 html 의 SCREENS.visit
import { Title } from '@/components/layout/Chrome';
import { RowBtn } from '@/components/ui/Bits';
import { useApp } from '@/context/AppContext';
import { VISIT } from '@/data/content';

export function VisitScreen() {
  const { t, tx, go } = useApp();
  return (
    <>
      <Title>{t('visitT')}</Title>
      <p className="lead">{t('visitLead')}</p>
      <div className="list">
        {VISIT.map((v) => (
          <RowBtn key={v.id} icon={v.icon} title={tx(v.name)} desc={tx(v.when)} onClick={() => go({ k: 'visitItem', id: v.id })} />
        ))}
      </div>
    </>
  );
}
