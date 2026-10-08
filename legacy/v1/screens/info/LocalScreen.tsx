// 맛집·명소 섹션의 입구(local): 명소(places) / 동네 맛집(eats) / 인증 음식점(cert) / 축제(events)로 갈라진다.
// 홈의 '맛집·명소' 타일에서 들어온다.
import { Crumb } from '@/components/layout/Crumb';
import { Grid, Tile } from '@/components/ui/Tile';
import { useApp } from '@/context/AppContext';
import { SectionIcon } from '@/data/icons';
import { UI } from '@/data/ui';

/** 입구: 명소 / 맛집 / 인증 음식점 / 축제(행사 섹션으로 넘어감). 인증 타일만 아이콘 대신 ✓ 태그 */
export function LocalScreen() {
  const { L, go } = useApp();
  return (
    <>
      <Crumb path={L(UI.secLoc)} />
      <h1>{L(UI.locTitle)}</h1>
      <Grid>
        <Tile className="home" onClick={() => go({ k: 'places' })}><SectionIcon.about /><span className="lab">{L(UI.places)}</span></Tile>
        <Tile className="home" onClick={() => go({ k: 'eats' })}><SectionIcon.local /><span className="lab">{L(UI.eats)}</span></Tile>
        <Tile className="home" onClick={() => go({ k: 'cert' })}><span className="tag yj">✓</span><span className="lab">{L(UI.cert)}</span></Tile>
        <Tile className="home" onClick={() => go({ k: 'events' })}><SectionIcon.events /><span className="lab">{L(UI.toFest)}</span></Tile>
      </Grid>
    </>
  );
}
