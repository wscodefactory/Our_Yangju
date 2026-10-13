// 홈: 핵심 작업 4개 + 둘러보기 타일 3개.
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import type { Screen } from '@/types';
import { anyEventOn } from '@/utils/events';
import { hasProfile, loadProfile } from '@/utils/profile';

/** [화면, 아이콘, 색, 제목 키, 설명 키] */
const TASKS: [Screen, string, string, string, string][] = [
  [{ k: 'visit' }, 'landmark', 'tone-green', 'visitT', 'visitD'],
  [{ k: 'doc' }, 'file', 'tone-orange', 'docT', 'docD'],
  [{ k: 'welfare' }, 'heart', 'tone-amber', 'welT', 'welD'],
  [{ k: 'life' }, 'house', 'tone-blue', 'lifeT', 'lifeD'],
];

export function HomeScreen() {
  const { t, go } = useApp();
  const on = anyEventOn();
  const noProfile = !hasProfile(loadProfile());
  return (
    <>
      <section className="hero">
        <h1 tabIndex={-1}>{t('heroTitle')}</h1>
        <p className="desc">{t('heroDesc')}</p>
      </section>
      {/* 내 정보가 없을 때만. 넣고 나면 앱 바의 사람 아이콘으로 */}
      {noProfile && (
        <button type="button" className="promo" onClick={() => go({ k: 'profile' })}>
          <span className="ibox tone-green"><Ic n="user" /></span>
          <span className="tx"><span className="t">{t('pfPromoT')}</span><span className="d">{t('pfPromoD')}</span></span>
          <span className="bdg green">{t('pfPromoTime')}</span>
        </button>
      )}
      <h2 className="sec-title">{t('secTasks')}</h2>
      <div className="tasks">
        {TASKS.map(([s, icon, tone, title, desc]) => (
          <button key={s.k} type="button" className="task" onClick={() => go(s)}>
            <span className={`ibox ${tone}`}><Ic n={icon} /></span>
            <span className="t">{t(title)}</span><span className="d">{t(desc)}</span>
          </button>
        ))}
      </div>
      <h2 className="sec-title">{t('secExplore')}</h2>
      <div className="tiles">
        <button type="button" className="tile" onClick={() => go({ k: 'explore', tab: 'events' })}>
          {on && <span className="bdg orange live"><span className="dot" />{t('stOn')}</span>}
          <span className="ibox tone-amber"><Ic n="calendar" /></span>{t('exEvents')}
        </button>
        <button type="button" className="tile" onClick={() => go({ k: 'explore', tab: 'places' })}>
          <span className="ibox tone-green"><Ic n="pin" /></span>{t('exPlaces')}
        </button>
        <button type="button" className="tile" onClick={() => go({ k: 'explore', tab: 'about' })}>
          <span className="ibox tone-blue"><Ic n="info" /></span>{t('exAbout')}
        </button>
      </div>
    </>
  );
}
