// 양주 명소 목록(places). 자체 상세 없이 네이버 지도 검색 링크로 바로 내보낸다 — 데이터를 들고 있지 않으려고.
// 데이터는 data/info.ts의 PLACES, 링크 생성은 naverMap().
import { ExternalLink } from 'lucide-react';
import { Crumb } from '@/components/layout/Crumb';
import { SourceLine } from '@/components/ui/Notes';
import { Grid, Tile } from '@/components/ui/Tile';
import { useApp } from '@/context/AppContext';
import { NAVER_SRC, PLACES, naverMap } from '@/data/info';
import { UI } from '@/data/ui';

/** 양주 명소. 타일마다 이름 + 한 줄 설명, 누르면 네이버 지도 검색. key는 검색어(p.map)가 유일하다고 보고 씀 */
export function PlacesScreen() {
  const { L } = useApp();
  return (
    <>
      <Crumb path={`${L(UI.secLoc)} › ${L(UI.places)}`} />
      <h1>{L(UI.placesT)}</h1>
      <Grid>
        {PLACES.map((p) => (
          <Tile key={p.map} href={naverMap(p.map)}>
            <span className="tag">N <ExternalLink aria-hidden="true" /></span>
            <span><span className="lab">{L(p.name)}</span><span className="sub">{L(p.what)}</span></span>
          </Tile>
        ))}
      </Grid>
      <SourceLine items={[NAVER_SRC, ['한국관광공사 TourAPI', 'KTO TourAPI']]} />
    </>
  );
}
