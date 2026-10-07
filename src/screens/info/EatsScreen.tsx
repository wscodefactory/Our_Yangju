// 동네 맛집(eats). 동네 타일을 누르면 "양주 {동네} 맛집" 네이버 지도 검색으로 내보낸다.
// 데이터는 data/info.ts의 AREAS, 링크 생성은 naverMap(). LocalScreen과 CertScreen에서 들어온다.
import { Crumb } from '@/components/layout/Crumb';
import { SourceLine } from '@/components/ui/Notes';
import { Grid, Tile } from '@/components/ui/Tile';
import { useApp } from '@/context/AppContext';
import { AREAS, NAVER_SRC, naverMap } from '@/data/info';
import { UI } from '@/data/ui';

/** 동네 맛집. AREAS는 동네 이름 Bi 쌍 목록이고, 검색어는 한국어 쪽으로 "양주 {동네} 맛집" */
export function EatsScreen() {
  const { L } = useApp();
  return (
    <>
      <Crumb path={`${L(UI.secLoc)} › ${L(UI.eats)}`} />
      <h1>{L(UI.eatsT)}</h1>
      <Grid>
        {AREAS.map((a) => (
          <Tile key={a[0]} href={naverMap(`양주 ${a[0]} 맛집`)}>
            <span className="tag">N ↗</span>
            <span className="lab">{L(a)}</span>
          </Tile>
        ))}
      </Grid>
      <SourceLine items={[NAVER_SRC]} />
    </>
  );
}
