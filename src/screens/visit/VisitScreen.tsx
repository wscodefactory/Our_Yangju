// 업무 목록에서 장소·기한을 펼쳐 보고, 상세 화면에서 준비물을 확인한다.
import { useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { VISIT } from '@/data/content';
import { VISIT_DETAIL } from '@/data/visit-detail';

export function VisitScreen() {
  const { t, tx, lang, go } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <Title>{t('visitT')}</Title>
      <p className="lead" style={{ marginBottom: 10 }}>{t('visitLead')}</p>
      <div className="stack tcards">
        {VISIT.map((v) => {
          const d = VISIT_DETAIL[v.id];
          const isOpen = open === v.id;
          return (
            <article key={v.id} className={`tcard ${isOpen ? 'open' : ''}`.trim()}>
              <button type="button" className="tcard-h" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : v.id)}>
                <span className="ibox tone-green"><Ic n={v.icon} /></span>
                <span className="tx">
                  {/* 접힌 카드에는 첫 배지(기한)만. 둘 다 넣으면 베트남어·네팔어에서 목록이 한 화면을 넘긴다. 나머지는 상세에서 */}
                  {d && <span className="badges"><span className={`bdg ${d.badges[0].tone}`}>{tx(d.badges[0].t)}</span></span>}
                  <span className="t">{tx(v.name)}</span>
                </span>
                <Ic n="chev" cls="sm chev" />
              </button>
              {isOpen && (
                <div className="tcard-b">
                  {/* 창구에서 직원과 같이 볼 때 쓰라고 한국어 이름을 펼친 카드에만 */}
                  {lang !== 'ko' && <p className="muted" lang="ko" style={{ margin: 0 }}>{v.name[0]}</p>}
                  <dl className="kv">
                    <dt><Ic n="pin" cls="sm" />{t('lblWhere')}</dt><dd>{tx(v.where)}</dd>
                    <dt><Ic n="calendar" cls="sm" />{t('lblWhen')}</dt><dd>{tx(v.when)}</dd>
                  </dl>
                  <button type="button" className="btn primary" onClick={() => go({ k: 'visitItem', id: v.id })}><Ic n="file" cls="sm" />{t('openChecklist')}</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
