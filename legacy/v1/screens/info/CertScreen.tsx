// 인증 음식점 종류 목록(cert). 데이터는 data/info.ts의 CERTS, 항목을 누르면 CertItemScreen으로.
// LocalScreen에서 들어온다.
import { Crumb } from '@/components/layout/Crumb';
import { SourceLine } from '@/components/ui/Notes';
import { Grid, Tile } from '@/components/ui/Tile';
import { useApp } from '@/context/AppContext';
import { CERTS, CERT_SRC, NAVER_SRC } from '@/data/info';
import { UI } from '@/data/ui';

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
