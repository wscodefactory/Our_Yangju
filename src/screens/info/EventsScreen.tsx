// 행사·축제 목록(events). 데이터는 data/info.ts의 EVENTS (시연용 고정 목록).
// 홈, 소개 상세, 맛집·명소 화면에서 들어오고, 타일을 누르면 EventScreen으로 간다.
import { Crumb } from '@/components/layout/Crumb';
import { SourceLine } from '@/components/ui/Notes';
import { Grid, Tile } from '@/components/ui/Tile';
import { useApp } from '@/context/AppContext';
import { CITY_URL, EVENTS } from '@/data/info';
import { UI } from '@/data/ui';
import { StatusTag } from './EventStatusTag';

/**
 * 행사 격자. 타일 색도 상태를 따라간다 — 끝난 건 흐리게(off), 진행 중은 강조(high), 예정은 기본.
 * 마지막 타일은 시청 행사 페이지로 나가는 외부 링크.
 */
export function EventsScreen() {
  const { L, go } = useApp();
  return (
    <>
      <Crumb path={L(UI.secEv)} />
      <h1>{L(UI.evTitle)}</h1>
      <Grid>
        {EVENTS.map((e) => (
          <Tile key={e.id} className={e.st === 'done' ? 'off' : e.st === 'on' ? 'high' : ''} onClick={() => go({ k: 'event', e: e.id })}>
            <StatusTag st={e.st} />
            <span className="lab">{L(e.name)}</span>
          </Tile>
        ))}
        <Tile href={CITY_URL}>
          <span className="tag">www ↗</span>
          <span className="lab">{L(UI.evAll)}</span>
        </Tile>
      </Grid>
      <SourceLine items={[['양주시청', 'City Hall'], ['한국관광공사 TourAPI', 'KTO TourAPI']]} />
    </>
  );
}
