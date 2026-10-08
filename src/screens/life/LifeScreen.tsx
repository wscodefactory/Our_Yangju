// 생활 정보 목록. 참고용 html 의 SCREENS.life
import { Title } from '@/components/layout/Chrome';
import { RowBtn } from '@/components/ui/Bits';
import { useApp } from '@/context/AppContext';
import { LIFE } from '@/data/content';

export function LifeScreen() {
  const { t, tx, go } = useApp();
  return (
    <>
      <Title>{t('lifeT')}</Title>
      <p className="lead">{t('lifeLead')}</p>
      <div className="list">
        {LIFE.map((x) => (
          <RowBtn key={x.id} icon={x.icon} tone={x.tone} title={tx(x.name)} desc={tx(x.desc)} onClick={() => go({ k: 'lifeItem', id: x.id })} />
        ))}
      </div>
    </>
  );
}
