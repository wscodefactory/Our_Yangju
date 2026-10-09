// 업무 하나: 어디서·언제, 준비물 체크리스트, 직원에게 보여주기. 참고용 html 의 SCREENS.visitItem
import { BottomBar, Title } from '@/components/layout/Chrome';
import { Checklist, LinkList } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { VISIT } from '@/data/content';
import { VISIT_LINKS } from '@/data/links';

export function VisitItemScreen({ id }: { id: string }) {
  const { t, tx, openOverlay } = useApp();
  const v = VISIT.find((x) => x.id === id);
  if (!v) return null;
  return (
    <>
      <Title>{tx(v.name)}</Title>
      <div className="stack">
        <section className="panel">
          <dl className="kv">
            <dt><Ic n="pin" cls="sm" />{t('lblWhere')}</dt><dd>{tx(v.where)}</dd>
            <dt><Ic n="calendar" cls="sm" />{t('lblWhen')}</dt><dd>{tx(v.when)}</dd>
          </dl>
        </section>
        <section className="panel">
          <h2><Ic n="file" cls="sm" />{t('lblDocs')}</h2>
          {/* 언어가 바뀌면 체크 상태를 새로 시작 (문구 배열이 바뀌므로) */}
          <Checklist key={tx(v.name)} docs={v.docs.map(tx)} />
        </section>
        <p className="hint-line"><Ic n="users" cls="sm" /><span>{t('tapToShow')}</span></p>
        {v.src && <p className="src"><Ic n="info" cls="sm" /><span>{t('basis')}: {tx(v.src)}</span></p>}
        {/* 업무별 공식 안내 (2차 개선점검 3.6) */}
        <LinkList rows={VISIT_LINKS[v.id] || []} title={t('officialT')} />
      </div>
      <BottomBar>
        <a className="btn secondary side" href="tel:1345" aria-label={t('interpCall')}><Ic n="phone" cls="sm" />1345</a>
        <button type="button" className="btn primary" onClick={() => openOverlay({ k: 'full', id: v.id })}><Ic n="expand" cls="sm" />{t('showStaff')}</button>
      </BottomBar>
    </>
  );
}
