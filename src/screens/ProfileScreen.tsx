// 내 정보: 비자·사는 곳·거주 형태·가족 동거. 고르는 즉시 휴대폰에 저장되고 서버로는 안 간다.
// 아래 "데이터 초기화" 는 내 정보만 지우기와 앱이 저장한 것 전부 지우기 두 단계.
import { useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Callout } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { VISIT_DETAIL } from '@/data/visit-detail';
import { AREAS, VISAS, clearAllData, clearProfile, isRural, loadProfile, saveProfile, type Profile } from '@/utils/profile';

export function ProfileScreen() {
  const { t, tx, toast } = useApp();
  const [p, setP] = useState<Profile>(loadProfile);
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
  return (
    <>
      <Title>{t('profileT')}</Title>
      <p className="lead">{t('profileLead')}</p>
      <Callout kind="green" icon="shield" sm style={{ marginBottom: 14 }}>{t('pfPrivacy')}</Callout>
      <div className="stack">
        <section className="panel form">
          <div className="fld">
            <label htmlFor="pf-visa">{t('pfVisa')}</label>
            <select id="pf-visa" value={p.visa ?? ''} onChange={(e) => update({ visa: e.target.value || undefined })}>
              <option value="">{t('pfNone')}</option>
              {VISAS.map((v) => <option key={v.id} value={v.id}>{tx(v.label)}</option>)}
            </select>
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
            <label htmlFor="pf-housing">{t('pfHousing')}</label>
            <select id="pf-housing" value={p.housing ?? ''} onChange={(e) => update({ housing: e.target.value || undefined })}>
              <option value="">{t('pfNone')}</option>
              {housing.map((h) => <option key={h.id} value={h.id}>{tx(h.name)}</option>)}
            </select>
          </div>
          <label className="check">
            <input type="checkbox" checked={!!p.family} onChange={(e) => update({ family: e.target.checked || undefined })} />
            <span>{t('pfFamily')}</span>
          </label>
        </section>
        <p className="hint-line"><Ic n="info" cls="sm" /><span>{t('pfUse')}</span></p>
        <section className="panel">
          <h2><Ic n="trash" cls="sm" />{t('pfResetT')}</h2>
          <p className="muted" style={{ margin: '0 0 12px' }}>{t('pfResetD')}</p>
          <div className="btn-row">
            <button type="button" className="btn secondary sm" onClick={clearMine}>{t('pfClear')}</button>
            <button type="button" className="btn secondary sm" onClick={clearAll} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>{t('pfResetAll')}</button>
          </div>
        </section>
      </div>
    </>
  );
}
