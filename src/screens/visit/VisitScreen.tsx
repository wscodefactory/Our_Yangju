// 시청과 주민센터 업무 목록 — 드롭다운(아코디언) 카드. 카드를 누르면 배지·어디서·언제가 펼쳐지고, 체크리스트는 상세 화면에서.
// 디자인 참고: 요청사항/code_artifact 드롭다운식.html. 색·모양은 Yangju DS 토큰 그대로. 업무가 6개뿐이라 검색창은 두지 않는다.
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
                  {d && <span className="badges">{d.badges.map((b, i) => <span key={i} className={`bdg ${b.tone}`}>{tx(b.t)}</span>)}</span>}
                  <span className="t">{tx(v.name)}</span>
                  {/* 창구에서 직원과 같이 볼 때 쓰라고 한국어 이름을 작게 같이 보여준다 */}
                  {lang !== 'ko' && <span className="d" lang="ko">{v.name[0]}</span>}
                </span>
                <Ic n="chev" cls="sm chev" />
              </button>
              {isOpen && (
                <div className="tcard-b">
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
