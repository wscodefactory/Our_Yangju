// 맛집·명소 섹션의 다섯 화면: 입구(local) → 명소(places) / 동네 맛집(eats) / 인증 음식점(cert → certItem).
// 명소·맛집은 자체 상세 없이 네이버 지도 검색 링크로 바로 내보낸다 — 데이터를 들고 있지 않으려고.
// 데이터는 data/info.ts의 PLACES / AREAS / CERTS, 링크 생성은 naverMap().
import { Crumb } from '@/components/layout/Crumb';
import { InfoCard, SourceLine } from '@/components/ui/Bits';
import { Grid, Stack, Tile } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { SectionIcon } from '@/data/icons';
import { AREAS, CERTS, PLACES, naverMap } from '@/data/info';
import { UI } from '@/data/ui';

// 출처 줄에 반복해서 쓰는 Bi 쌍
const NAVER_SRC = ['네이버 지도', 'Naver Map'] as const;
const CERT_SRC = ['인증 기관 공개 목록', 'Certifier lists'] as const;

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
            <span className="tag">N ↗</span>
            <span><span className="lab">{L(p.name)}</span><span className="sub">{L(p.what)}</span></span>
          </Tile>
        ))}
      </Grid>
      <SourceLine items={[NAVER_SRC, ['한국관광공사 TourAPI', 'KTO TourAPI']]} />
    </>
  );
}

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

/** 인증 음식점 종류 목록 (모범음식점, 안심식당 등). 태그에 인증 기관. 맨 끝은 동네 맛집으로 가는 흐린 타일 */
export function CertScreen() {
  const { L, go } = useApp();
  return (
    <>
      <Crumb path={`${L(UI.secLoc)} › ${L(UI.cert)}`} />
      <h1>{L(UI.certT)}</h1>
      <Grid>
        {CERTS.map((c, i) => (
          <Tile key={c.q} onClick={() => go({ k: 'certItem', i })}>
            <span className="tag yj">✓ {L(c.by)}</span>
            <span className="lab">{L(c.name)}</span>
          </Tile>
        ))}
        <Tile className="off" onClick={() => go({ k: 'eats' })}>
          <span className="tag">N</span>
          <span className="lab">{L(UI.eats)}</span>
        </Tile>
      </Grid>
      <SourceLine items={[CERT_SRC, NAVER_SRC]} />
    </>
  );
}

/** 인증 상세: 누가 주는 인증인지, 무엇을 보는지 + 네이버 지도에서 찾기(c.q가 검색어) */
export function CertItemScreen({ i }: { i: number }) {
  const { L } = useApp();
  const c = CERTS[i];
  if (!c) return null;
  return (
    <>
      <Crumb path={`${L(UI.cert)} › ${L(c.name)}`} />
      <h1>{L(c.name)}</h1>
      <InfoCard rows={[[L(UI.certBy), L(c.by)], [L(UI.certWhat), L(c.what)]]} />
      <Stack mt={12}>
        <WideButton primary href={naverMap(c.q)} label={L(UI.certFind)} />
      </Stack>
      <SourceLine items={[CERT_SRC, NAVER_SRC]} />
    </>
  );
}
