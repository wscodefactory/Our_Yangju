// 행사·축제 목록(events)과 상세(event). 데이터는 data/info.ts의 EVENTS (시연용 고정 목록).
// 홈, 소개 상세, 맛집·명소 화면에서 들어온다.
import { Crumb } from '@/components/layout/Crumb';
import { InfoCard, SourceLine } from '@/components/ui/Bits';
import { Grid, Stack, Tile } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { CITY_URL, EVENTS, naverMap } from '@/data/info';
import { UI } from '@/data/ui';
import type { EventStatus } from '@/types';

// 상태 → 태그 문구. on 진행 중 / soon 예정 / done 끝남
const statusLabel = { on: UI.on, soon: UI.soonTag, done: UI.done } as const;

/** 상태 태그. className에 상태값을 그대로 줘서 css가 색을 입힌다 */
function StatusTag({ st }: { st: EventStatus }) {
  const { L } = useApp();
  return <span className={`tag ${st}`}>{L(statusLabel[st])}</span>;
}

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

/**
 * 행사 상세. 날짜/장소/내용 카드 + 네이버 지도·시청 원문 링크.
 * 끝난 행사엔 "내년 알림 받기" 버튼이 붙는데 시안이라 아무 동작도 없다 (onClick이 빈 함수).
 * props 이름 e는 Screen 타입({ k: 'event'; e: string })을 따른 것이고 안에서는 id로 바꿔 받는다.
 */
export function EventScreen({ e: id }: { e: string }) {
  const { L } = useApp();
  const e = EVENTS.find((x) => x.id === id);
  if (!e) return null;
  return (
    <>
      <Crumb path={`${L(UI.secEv)} › ${L(e.name)}`} />
      <div className="tags" style={{ marginBottom: 8 }}><StatusTag st={e.st} /></div>
      <h1>{L(e.name)}</h1>
      <InfoCard rows={[[L(UI.date), L(e.date)], [L(UI.place), L(e.place)], [L(UI.about), L(e.what)]]} />
      <Stack mt={12}>
        <WideButton primary href={naverMap(e.map)} label={L(UI.naver)} />
        <WideButton href={CITY_URL} label={L(UI.cityOrig)} />
        {e.st === 'done' && <WideButton arrow={null} label={L(UI.nextYear)} onClick={() => undefined} />}
      </Stack>
      <SourceLine items={[['양주시청', 'City Hall'], ['네이버 지도', 'Naver Map']]} />
    </>
  );
}
