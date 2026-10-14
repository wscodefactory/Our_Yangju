// 내 정보. "체류지 신고에 쓰여요" / "고지서 납부에 쓰여요" 로 나눠 왜 묻는지 보이게 하고, 고르는 즉시 저장한다.
// 아래 "이 정보로 바뀐 안내" 는 넣은 보람이 보이게 지금 정보로 달라진 안내를 모아 보여 준다.
import { useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Callout } from '@/components/ui/Bits';
import { DateFields } from '@/components/ui/DateFields';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { VISIT_DETAIL } from '@/data/visit-detail';
import type { Screen } from '@/types';
import { AREAS, BANKS, VISAS, areaOf, bankLabel, clearAllData, clearProfile, hasProfile, isRural, loadProfile, moveDeadline, moveDue, saveProfile, type Profile } from '@/utils/profile';

export function ProfileScreen() {
  const { t, tx, lang, fmtDate, toast, go } = useApp();
  const [p, setP] = useState<Profile>(loadProfile);
  const foreign = lang !== 'ko';
  const housing = VISIT_DETAIL.move.types;
  const update = (patch: Partial<Profile>) => {
    const next = { ...p, ...patch };
    setP(next);
    saveProfile(next);
    toast(t('pfSaved'));
  };
  const clearMine = () => { clearProfile(); setP({}); toast(t('pfCleared')); };
  const clearAll = () => {
    if (!window.confirm(t('pfResetConfirm'))) return;
    clearAllData();
    location.reload();
  };

  // 지금 정보로 달라진 안내 목록. 기한이 가까운 것부터
  const dl = moveDeadline(p);
  const due = moveDue(p);
  const area = areaOf(p);
  const center = area ? `${tx(area.label)} ${t('centerWord')}` : '';
  const items: { icon: string; title: string; desc: string; badge?: string; to: Screen }[] = [];
  if (dl) items.push({ icon: 'calendar', title: t('pfItemMove'), desc: `${t('pfBy', { date: fmtDate(dl.due, { month: 'long', day: 'numeric' }) })}${center ? `, ${center}` : ''}`, badge: dl.days < 0 ? t('ddayOverBadge') : `D-${dl.days}`, to: { k: 'visitItem', id: 'move' } });
  if (p.housing || p.family) {
    const h = housing.find((x) => x.id === p.housing);
    const n = VISIT_DETAIL.move.types.length && 3 + (h?.docs.length ?? 0) + (p.family ? 1 : 0);
    items.push({ icon: 'file', title: t('pfItemMoveDocs', { n }), desc: [h ? tx(h.name) : '', p.family ? t('pfWithFamily') : ''].filter(Boolean).join(' · '), to: { k: 'visitItem', id: 'move' } });
  }
  if (p.visa) items.push({ icon: 'idcard', title: t('pfItemReg'), desc: t('pfBasedOn', { v: tx(VISAS.find((v) => v.id === p.visa)!.label) }), to: { k: 'visitItem', id: 'reg' } });
  if (p.nhisSelf) items.push({ icon: 'medical', title: t('pfItemNhis'), desc: t('pfItemNhisD'), to: { k: 'visitItem', id: 'nhis' } });
  if (p.car) items.push({ icon: 'car', title: t('pfItemCar'), desc: p.bank ? t('pfItemCarD', { bank: bankLabel(p.bank, foreign) }) : t('pfItemCarD0'), to: { k: 'doc' } });

  return (
    <>
      <Title>{t('profileT')}</Title>
      <Callout kind="green" icon="shield" sm style={{ margin: '4px 0 14px' }}>{t('pfPrivacy')}</Callout>
      <div className="stack pf">
        <section className="panel form">
          <h2><Ic n="house" cls="sm" />{t('pfSecMove')}</h2>
          <div className="fld">
            <span className="field-label" id="pf-visa-l">{t('pfVisa')}</span>
            <div className="chips wrap" role="group" aria-labelledby="pf-visa-l">
              {VISAS.map((v) => (
                <button key={v.id} type="button" className="chip" aria-pressed={p.visa === v.id} onClick={() => update({ visa: p.visa === v.id ? undefined : v.id })}>{tx(v.label)}</button>
              ))}
            </div>
          </div>
          <div className="fld">
            <label htmlFor="pf-area">{t('pfArea')}</label>
            <select id="pf-area" value={p.area ?? ''} onChange={(e) => update({ area: e.target.value || undefined })}>
              <option value="">{t('pfNone')}</option>
              {AREAS.map((a) => <option key={a.id} value={a.id}>{tx(a.label)}</option>)}
            </select>
            {isRural(p.area) && <p className="help">{t('pfRural')}</p>}
          </div>
          <div className="fld">
            {/* 브라우저 달력은 기기 언어로 고정돼 앱 언어를 안 따른다. 라벨을 우리 문구로 붙이는 세 칸 입력으로 */}
            <span className="field-label" id="pf-moved-l">{t('pfMovedOn')}</span>
            <DateFields idPrefix="pf-moved" value={p.movedOn ?? ''} onChange={(ymd) => { if (ymd !== (p.movedOn ?? '')) update({ movedOn: ymd || undefined, moveDone: undefined }); }} />
            <p className="help">{t('pfMovedHelp')}</p>
            {/* 신고 상태 한 줄: 기한 안 / 기한 지남 / 신고 완료. 버튼 하나로 상태를 바꾼다 */}
            {due && (
              <div className={`pf-status ${p.moveDone ? 'done' : due.days < 0 ? 'over' : ''}`.trim()}>
                <Ic n={p.moveDone ? 'check' : due.days < 0 ? 'alert' : 'calendar'} cls="sm" />
                <span className="tx">
                  {p.moveDone ? t('pfStatusDone') : due.days < 0 ? t('pfStatusOver') : t('pfStatusDue', { n: due.days, date: fmtDate(due.due, { month: 'long', day: 'numeric' }) })}
                </span>
                <button type="button" onClick={() => update({ moveDone: p.moveDone ? undefined : true })}>{p.moveDone ? t('pfUndoDone') : t('ddayDone')}</button>
              </div>
            )}
          </div>
          <div className="fld">
            <label htmlFor="pf-housing">{t('pfHousing')}</label>
            <select id="pf-housing" value={p.housing ?? ''} onChange={(e) => update({ housing: e.target.value || undefined })}>
              <option value="">{t('pfNone')}</option>
              {housing.map((h) => <option key={h.id} value={h.id}>{tx(h.name)}</option>)}
            </select>
          </div>
          <label className="check plain">
            <input type="checkbox" checked={!!p.family} onChange={(e) => update({ family: e.target.checked || undefined })} />
            <span>{t('pfFamily')}</span>
          </label>
        </section>

        <section className="panel form">
          <h2><Ic n="file" cls="sm" />{t('pfSecPay')}</h2>
          <div className="fld">
            <span className="field-label" id="pf-nhis-l">{t('pfNhis')}</span>
            <div className="seg" role="group" aria-labelledby="pf-nhis-l">
              <button type="button" aria-selected={p.nhisSelf === false} onClick={() => update({ nhisSelf: false })}>{t('pfNhisCo')}</button>
              <button type="button" aria-selected={p.nhisSelf === true} onClick={() => update({ nhisSelf: true })}>{t('pfNhisSelf')}</button>
            </div>
          </div>
          <div className="grid2">
            <div className="fld">
              <span className="field-label" id="pf-car-l">{t('pfCar')}</span>
              <div className="seg" role="group" aria-labelledby="pf-car-l">
                <button type="button" aria-selected={p.car === true} onClick={() => update({ car: true })}>{t('pfYes')}</button>
                <button type="button" aria-selected={p.car === false} onClick={() => update({ car: false })}>{t('pfNo')}</button>
              </div>
            </div>
            <div className="fld">
              <label htmlFor="pf-bank">{t('pfBank')}</label>
              <select id="pf-bank" value={p.bank ?? ''} onChange={(e) => update({ bank: e.target.value || undefined })}>
                <option value="">{t('pfNone')}</option>
                {BANKS.map((b) => <option key={b} value={b}>{bankLabel(b, foreign)}</option>)}
              </select>
            </div>
          </div>
        </section>

        {items.length > 0 && (
          <section className="panel">
            <h2><Ic n="check" cls="sm" />{t('pfChangedT')}</h2>
            <div className="list" style={{ boxShadow: 'none' }}>
              {items.map((it, i) => (
                <button key={i} type="button" className="row" onClick={() => go(it.to)}>
                  <span className={`ibox ${it.badge ? 'tone-amber' : 'tone-green'}`}>{it.badge ? <b style={{ fontSize: '.8125rem' }}>{it.badge}</b> : <Ic n={it.icon} />}</span>
                  <span className="tx"><span className="t">{it.title}</span><span className="d">{it.desc}</span></span>
                  <Ic n="chev" cls="sm" />
                </button>
              ))}
            </div>
            {dl && <button type="button" className="btn primary" style={{ marginTop: 12 }} onClick={() => go({ k: 'visitItem', id: 'move' })}>{t('pfSeeMove')}</button>}
          </section>
        )}

        {hasProfile(p) && (
          <p className="pf-links">
            <a href="#" onClick={(e) => { e.preventDefault(); clearMine(); }}>{t('pfClear')}</a>
            <a href="#" className="danger" onClick={(e) => { e.preventDefault(); clearAll(); }}>{t('pfResetAll')}</a>
          </p>
        )}
        {!hasProfile(p) && <p className="pf-links"><a href="#" className="danger" onClick={(e) => { e.preventDefault(); clearAll(); }}>{t('pfResetAll')}</a></p>}
      </div>
    </>
  );
}
