// 행사 상세(event). 데이터는 data/info.ts의 EVENTS에서 id로 찾는다.
// EventsScreen의 타일에서 들어온다.
import { Crumb } from '@/components/layout/Crumb';
import { InfoCard } from '@/components/ui/Cards';
import { SourceLine } from '@/components/ui/Notes';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { CITY_URL, EVENTS, naverMap } from '@/data/info';
import { UI } from '@/data/ui';
import { StatusTag } from './EventStatusTag';

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
