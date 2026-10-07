// 양주 소개 섹션: 목록(about)과 항목 상세(aboutItem). 데이터는 data/info.ts의 ABOUT.
// 홈의 '양주 소개' 링크에서 들어온다.
import { Crumb } from '@/components/layout/Crumb';
import { InfoCard, Note, SourceLine } from '@/components/ui/Bits';
import { Grid, Stack, Tile } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { ABOUT } from '@/data/info';
import { UI } from '@/data/ui';

/**
 * 소개 항목 격자. 항목에 link가 있으면 외부 링크 타일(시청 홈페이지 등, 태그 "www ↗"),
 * 없으면 상세로 들어가는 버튼 타일(태그에 행 개수).
 * aboutItem은 id가 아니라 ABOUT 배열 인덱스로 찾는다 — 정적 데이터라 순서가 안 바뀜.
 */
export function AboutScreen() {
  const { L, go } = useApp();
  return (
    <>
      <Crumb path={L(UI.secAbout)} />
      <h1>{L(UI.aboutT)}</h1>
      <Grid>
        {ABOUT.map((a, i) => a.link ? (
          <Tile key={a.id} href={a.link}>
            <span className="tag">www ↗</span>
            <span className="lab">{L(a.label)}</span>
          </Tile>
        ) : (
          <Tile key={a.id} onClick={() => go({ k: 'aboutItem', i })}>
            <span className="tag">{a.rows?.length}</span>
            <span className="lab">{L(a.label)}</span>
          </Tile>
        ))}
      </Grid>
      <SourceLine items={[['양주시', 'Yangju City'], ['행정안전부', 'MOIS']]} />
    </>
  );
}

/**
 * 소개 상세. rows를 그대로 InfoCard에, src가 있으면 출처 메모,
 * go === 'events'인 항목(축제 소개)은 하단에 행사 화면 바로가기.
 */
export function AboutItemScreen({ i }: { i: number }) {
  const { L, go } = useApp();
  const a = ABOUT[i];
  if (!a) return null;
  return (
    <>
      <Crumb path={`${L(UI.secAbout)} › ${L(a.label)}`} />
      <h1>{L(a.label)}</h1>
      <InfoCard rows={(a.rows || []).map((r) => [L(r[0]), L(r[1])])} />
      {a.src && <Note>{L(a.src)}</Note>}
      {a.go && (
        <Stack mt={12}>
          <WideButton primary label={L(UI.secEv)} onClick={() => go({ k: 'events' })} />
        </Stack>
      )}
    </>
  );
}
