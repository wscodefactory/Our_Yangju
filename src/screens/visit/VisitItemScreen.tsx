// 업무 하나: 배지·어디서·언제·수수료, 내 상황 고르기(드롭다운) → 공통 준비물 + 상황별 서류 체크리스트, 주의사항, 직원에게 보여주기.
// 상황별 서류는 data/visit-detail.ts (양희정 현장 검수 편람 2026-10-13).
import { useState } from 'react';
import { BottomBar, Title } from '@/components/layout/Chrome';
import { Callout, Checklist, LinkList } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { VISIT } from '@/data/content';
import { VISIT_LINKS } from '@/data/links';
import { VISIT_DETAIL } from '@/data/visit-detail';
import { mapUrl } from '@/utils/events';
import { areaOf, defaultType, isRural, loadProfile, moveDeadline, saveProfile } from '@/utils/profile';

// 비자를 안 넣었을 때 D-day 설명에 쓰는 말
const VISAS_OTHER = ['일반', 'general'];

export function VisitItemScreen({ id }: { id: string }) {
  const { t, tx, lang, fmtDate, go, openOverlay, toast } = useApp();
  // 내 정보가 있으면 상황을 미리 고른다. 사용자가 바꾸면 그대로 둔다
  const [profile, setProfile] = useState(loadProfile);
  // 신고를 마쳤다고 표시하면 띠가 사라지고 내 정보에도 남는다
  const markMoveDone = () => { const next = { ...profile, moveDone: true }; saveProfile(next); setProfile(next); toast(t('ddayDoneToast')); };
  const [typeId, setTypeId] = useState(() => defaultType(id, profile));
  const fromProfile = !!typeId && typeId === defaultType(id, profile);
  const v = VISIT.find((x) => x.id === id);
  if (!v) return null;
  const d = VISIT_DETAIL[id];
  const type = d?.types.find((x) => x.id === typeId);
  // 공통 준비물 + 고른 상황의 서류 (+ 가족과 살면 가족 서류)
  const withFamily = id === 'move' && !!profile.family;
  const docs = [...v.docs, ...(type?.docs ?? []), ...(withFamily ? [t('famDoc')] : [])].map((x) => (typeof x === 'string' ? x : tx(x)));
  // 이사 신고: 이사한 날이 있으면 기한을 D-day 로, 사는 곳이 있으면 관할 행정복지센터를 앞에
  const dl = id === 'move' ? moveDeadline(profile) : null;
  const area = id === 'move' ? areaOf(profile) : undefined;
  const centerKo = area ? `${area.label[0]} 행정복지센터` : '';
  const visaName = profile.visa === 'f4' ? 'F-4' : (profile.visa ?? '').toUpperCase().replace(/^([A-Z])(\d)/, '$1-$2');
  return (
    <>
      <Title>{tx(v.name)}</Title>
      <div className="stack">
        {dl && (
          <div className={`dday ${dl.days < 0 ? 'over' : ''}`.trim()}>
            <b className="n">{dl.days < 0 ? t('ddayOverBadge') : dl.days === 0 ? 'D-day' : `D-${dl.days}`}</b>
            <span className="tx">
              <span className="t">{dl.days < 0 ? t('ddayOver') : t('ddayT', { date: fmtDate(dl.due, { month: 'long', day: 'numeric' }) })}</span>
              <span className="d">{t('ddayD', { moved: fmtDate(profile.movedOn!, { month: 'long', day: 'numeric' }), n: dl.limit, visa: visaName || VISAS_OTHER[lang === 'ko' ? 0 : 1] })}</span>
              <span className="acts">
                <button type="button" onClick={markMoveDone}><Ic n="check" cls="sm" />{t('ddayDone')}</button>
                <button type="button" onClick={() => go({ k: 'profile' })}><Ic n="pencil" cls="sm" />{t('ddayEdit')}</button>
              </span>
            </span>
          </div>
        )}
        <section className="panel">
          {d && <div className="badges" style={{ marginBottom: 12 }}>{d.badges.map((b, i) => <span key={i} className={`bdg ${b.tone}`}>{tx(b.t)}</span>)}</div>}
          <dl className="kv">
            <dt><Ic n="pin" cls="sm" />{t('lblWhere')}</dt>
            <dd>{area ? <><b>{tx(area.label)} {t('centerWord')}</b><br /><a href={mapUrl(centerKo)} target="_blank" rel="noopener"><Ic n="pin" cls="sm" /> {t('openMap')}</a><br /><span className="muted">{tx(v.where)}</span></> : tx(v.where)}</dd>
            <dt><Ic n="calendar" cls="sm" />{t('lblWhen')}</dt><dd>{tx(v.when)}</dd>
            {d?.fee && <><dt><Ic n="landmark" cls="sm" />{t('feeT')}</dt><dd>{tx(d.fee)}</dd></>}
          </dl>
        </section>
        {d && d.types.length > 0 && (
          <section className="panel">
            <h2><Ic n="user" cls="sm" />{t('mySituation')}</h2>
            <div className="fld">
              <select value={typeId} onChange={(e) => setTypeId(e.target.value)} aria-label={t('mySituation')}>
                <option value="">{t('situationPick')}</option>
                {d.types.map((ty) => <option key={ty.id} value={ty.id}>{tx(ty.name)}</option>)}
              </select>
              <p className="help">{fromProfile ? <>{t('pfApplied')} <a href="#" onClick={(e) => { e.preventDefault(); go({ k: 'profile' }); }}>{t('pfEdit')}</a></> : t('situationHelp')}</p>
            </div>
            {type?.note && <Callout kind="info" icon="info" sm style={{ marginTop: 10 }}>{tx(type.note)}</Callout>}
          </section>
        )}
        <section className="panel">
          <h2><span className="grow"><Ic n="file" cls="sm" />{t('lblDocs')}</span>{(fromProfile || withFamily) && <span className="bdg green">{t('pfDocsBadge')}</span>}</h2>
          {/* 언어나 상황이 바뀌면 체크 상태를 새로 시작 */}
          <Checklist key={`${tx(v.name)}|${typeId}`} docs={docs} />
        </section>
        {id === 'nhis' && isRural(profile.area) && <Callout kind="green" icon="check" sm>{t('pfRural')}</Callout>}
        {d?.tips.map((tip, i) => <Callout key={i} kind="warn" icon="alert" sm>{tx(tip)}</Callout>)}
        <p className="hint-line"><Ic n="users" cls="sm" /><span>{t('tapToShow')}</span></p>
        {v.src && <p className="src"><Ic n="info" cls="sm" /><span>{t('basis')}: {tx(v.src)}</span></p>}
        <LinkList rows={VISIT_LINKS[v.id] || []} title={t('officialT')} />
      </div>
      <BottomBar>
        <a className="btn secondary side" href="tel:1345" aria-label={t('interpCall')}><Ic n="phone" cls="sm" />1345</a>
        <button type="button" className="btn primary" onClick={() => openOverlay({ k: 'full', id: v.id })}><Ic n="expand" cls="sm" />{t('showStaff')}</button>
      </BottomBar>
    </>
  );
}
