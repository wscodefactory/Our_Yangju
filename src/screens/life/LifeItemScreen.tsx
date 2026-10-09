// 생활 정보 하나: 긴급 전화(rows)는 전화 행 목록, 나머지(tips)는 번호 매긴 안내. 참고용 html 의 SCREENS.lifeItem
import { Title } from '@/components/layout/Chrome';
import { Callout, LinkList } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { LIFE } from '@/data/content';
import { LIFE_LINKS } from '@/data/links';

export function LifeItemScreen({ id }: { id: string }) {
  const { t, tx } = useApp();
  const x = LIFE.find((i) => i.id === id);
  if (!x) return null;
  return (
    <>
      <Title>{tx(x.name)}</Title>
      {/* content.ts 가 타입 없이 적혀 rows 가 (string|string[])[][] 로 추론됨 → 자리별로 좁힌다 */}
      {x.rows ? (
        <>
          <div className="list">
            {(x.rows as [string, string[]][]).map(([num, lab]) => (
              <a key={num} className="row" href={`tel:${num.replace(/-/g, '')}`} aria-label={`${t('call')} ${num}, ${tx(lab)}`}>
                <span className="num">{num}</span>
                <span className="tx"><span className="t" style={{ fontWeight: 500 }}>{tx(lab)}</span></span>
                <span className="act"><Ic n="phone" cls="sm" />{t('call')}</span>
              </a>
            ))}
          </div>
          <Callout kind="info" icon="info" sm style={{ marginTop: 12 }}>{t('sosNote')}</Callout>
        </>
      ) : (
        <>
          <section className="panel"><ol className="steps">{x.tips?.map((tip, i) => <li key={i}>{tx(tip)}</li>)}</ol></section>
          {/* 주제별 안내: 약국·응급실 지도, 똑타 앱, 산재 문의, 배출 요일 (2차 개선점검 3.6) */}
          <div style={{ marginTop: 12 }}><LinkList rows={LIFE_LINKS[x.id] || []} title={t('officialT')} /></div>
          <p className="src"><Ic n="info" cls="sm" /><span>{t('lifeNote')}</span></p>
        </>
      )}
    </>
  );
}
