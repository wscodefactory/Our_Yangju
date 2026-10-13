// 양주 둘러보기: 행사 / 명소 / 맛집 / 소개 탭.
import { useEffect, useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Seg } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { AREAS, CERTS, HERITAGE, PLACES, type T5 } from '@/data/content';
import { EVENTS } from '@/data/events';
import { EVENTS_URL, FOOD_AREAS } from '@/data/links';
import { useApp } from '@/context/AppContext';
import { loc, parseDate } from '@/i18n';
import { eventStatus, mapUrl } from '@/utils/events';

type Tab = 'events' | 'places' | 'food' | 'about';
const ORDER = { on: 0, soon: 1, done: 2 };

export function ExploreScreen({ tab: initial = 'events' }: { tab?: Tab }) {
  const { t } = useApp();
  const [tab, setTab] = useState<Tab>(initial);
  // 둘러보기 화면 위에 다른 탭의 둘러보기를 또 쌓으면 같은 컴포넌트가 재사용되므로 prop 을 따라간다
  useEffect(() => { setTab(initial); }, [initial]);
  return (
    <>
      <Title>{t('secExplore')}</Title>
      <Seg<Tab>
        items={[['events', t('tabEvents')], ['places', t('tabPlaces')], ['food', t('tabFood')], ['about', t('tabAbout')]]}
        value={tab} onChange={setTab}
      />
      <div className="tabpanel">
        {tab === 'events' ? <Events /> : tab === 'places' ? <Places /> : tab === 'food' ? <Food /> : <About />}
      </div>
    </>
  );
}

function Events() {
  const { lang, t, tx, fmtRange } = useApp();
  const mon = new Intl.DateTimeFormat(loc(lang), { month: 'short' });
  const list = [...EVENTS].sort((a, b) => ORDER[eventStatus(a)] - ORDER[eventStatus(b)]);
  return (
    <div className="stack">
      {list.map((e) => {
        const st = eventStatus(e);
        const range = e.tba ? null : e.range;
        const dt = range ? parseDate(range[0]) : null;
        const inner = (
          <>
            {dt ? <div className="date"><small>{mon.format(dt)}</small><b>{dt.getDate()}</b></div> : <div className="date"><Ic n="calendar" /></div>}
            <div className="tx">
              {st === 'on' ? <span className="bdg orange live"><span className="dot" />{t('stOn')}</span>
                : st === 'soon' ? <span className="bdg blue">{t('stSoon')}</span>
                : <span className="bdg gray">{t('stDone')}</span>}
              <div className="t">{tx(e.name)}</div>
              <div className="meta">
                <span><Ic n="calendar" cls="sm" />{range ? fmtRange(range[0], range[1]) : tx(e.tba)}</span>
                <span><Ic n="pin" cls="sm" />{tx(e.place)}</span>
              </div>
            </div>
            {st !== 'done' && <span className="ev-go" aria-hidden="true"><Ic n="ext" cls="sm" /></span>}
          </>
        );
        if (st === 'done') return <article key={e.id} className="ev done">{inner}</article>;
        // 수집한 행사(url 있음)는 카드가 누리집 원문으로, 지도는 작은 보조 링크로. 고정 행사는 카드가 지도로.
        return (
          <div key={e.id} className="stack" style={{ gap: 6 }}>
            <a className="ev" href={e.url ?? mapUrl(e.map)} target="_blank" rel="noopener" aria-label={`${tx(e.name)}, ${e.url ? t('eventsSrc') : t('openMap')}`}>{inner}</a>
            {e.url && <a className="btn secondary sm" href={mapUrl(e.map)} target="_blank" rel="noopener" style={{ alignSelf: 'flex-end' }}><Ic n="pin" cls="sm" />{t('openMap')}</a>}
          </div>
        );
      })}
      {/* 수집 행사 중 번역이 안 된 것이 있으면 AI 초안 안내 (한국어 화면에선 불필요) */}
      {lang !== 'ko' && list.some((e) => e.draft) && <p className="src" style={{ margin: 0 }}><Ic n="info" cls="sm" /><span>{t('draftNote')}</span></p>}
      <a className="btn secondary sm" href={EVENTS_URL} target="_blank" rel="noopener">{t('eventsSrc')}<Ic n="ext" cls="sm" /></a>
    </div>
  );
}

/** 지도 링크 행. 명소·맛집 탭 공용 */
function MapRow({ q, icon, tone, name, desc }: { q: string; icon: string; tone: string; name: string; desc: string }) {
  return (
    <a className="row" href={mapUrl(q)} target="_blank" rel="noopener">
      <span className={`ibox ${tone}`}><Ic n={icon} /></span>
      <span className="tx"><span className="t">{name}</span><span className="d">{desc}</span></span>
      <Ic n="ext" cls="sm" />
    </a>
  );
}

function Places() {
  const { tx } = useApp();
  return <div className="list">{PLACES.map((p) => <MapRow key={p.q} q={p.q} icon={p.icon} tone="tone-green" name={tx(p.name)} desc={tx(p.d)} />)}</div>;
}

function Food() {
  const { t, tx } = useApp();
  return (
    <>
      <h2 className="sec-title" style={{ marginTop: 4 }}>{t('foodAreas')}</h2>
      <div className="chips" role="list">
        {FOOD_AREAS.map((a) => <a key={a.q} className="chip" role="listitem" href={mapUrl(a.q)} target="_blank" rel="noopener"><Ic n="pin" cls="sm" />{tx(a.name)}</a>)}
      </div>
      <p className="lead" style={{ margin: '10px 0' }}>{t('secFood')}</p>
      <div className="list">{CERTS.map((c) => <MapRow key={c.q} q={c.q} icon="utensils" tone="tone-orange" name={tx(c.name)} desc={`${tx(c.d)} (${tx(c.by)})`} />)}</div>
    </>
  );
}

function About() {
  const { lang, t, tx, fmtNum } = useApp();
  const locale = loc(lang);
  // 한국어·중국어는 '29.8만' 식 단위 표기가 자연스럽고, 나머지는 전체 숫자
  const pop = lang === 'ko' || lang === 'zh' ? new Intl.NumberFormat(locale, { notation: 'compact', maximumSignificantDigits: 3 }).format(298000) : fmtNum(298000);
  const asOf = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' }).format(new Date(2026, 8, 1));
  const pct = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 }).format(0.0429);
  const mini = (icon: string, tone: string, a: T5, b: T5) => (
    <div key={a[0]} className="row"><span className={`ibox ${tone}`}><Ic n={icon} /></span><span className="tx"><span className="t">{tx(a)}</span><span className="d">{tx(b)}</span></span></div>
  );
  return (
    <>
      <div className="stats">
        <div className="stat"><div className="lab">{t('popL')}</div><div className="val">{pop}</div></div>
        <div className="stat"><div className="lab">{t('foreignL')}</div><div className="val">{fmtNum(12770)}</div><div className="muted">{pct}</div></div>
        <div className="stat"><div className="lab">{t('growthL')}</div><div className="val" style={{ fontSize: '.9375rem' }}>{t('growthV')}</div></div>
      </div>
      <p className="src" style={{ margin: '6px 0 0' }}><Ic n="info" cls="sm" /><span>{t('asOf', { d: asOf })}. {t('statSrc')}</span></p>
      <h2 className="sec-title">{t('heritageT')}</h2>
      <div className="list">{HERITAGE.slice(0, 2).map((h) => mini('landmark', 'tone-amber', h.name, h.d))}</div>
      <h2 className="sec-title">{t('areaT')}</h2>
      <div className="minis">
        {AREAS.map((h) => (
          <div key={h.name[0]} className="mini"><span className="ibox tone-green"><Ic n={h.icon} cls="sm" /></span><b>{tx(h.name)}</b><span>{tx(h.d)}</span></div>
        ))}
      </div>
    </>
  );
}
