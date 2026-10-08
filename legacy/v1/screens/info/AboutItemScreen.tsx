// 양주 소개 항목 상세(aboutItem). 데이터는 data/info.ts의 ABOUT, 인덱스 i로 찾는다.
// AboutScreen의 타일에서 들어온다.
import { Crumb } from '@/components/layout/Crumb';
import { InfoCard } from '@/components/ui/Cards';
import { Note } from '@/components/ui/Notes';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { ABOUT } from '@/data/info';
import { UI } from '@/data/ui';

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
