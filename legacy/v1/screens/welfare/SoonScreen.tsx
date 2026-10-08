// "본선에서" 안내 화면(soon): 아직 데이터가 없는 단계를 눌렀을 때 보여준다. 복지 흐름의 곁가지.
// GroupScreen에서 단계 라벨 문자열 l을 들고 들어온다.
import { Crumb } from '@/components/layout/Crumb';
import { ResultBox } from '@/components/ui/Cards';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { UI } from '@/data/ui';

/**
 * 아직 데이터가 없는 단계(중장년·어르신·장애 돌봄 등)를 눌렀을 때.
 * l: GroupScreen이 L()로 뽑아 넘긴 단계 라벨 문자열. 언어에 묶인 값이라 UI 언어를 바꾸면
 * AppContext.toggleUiLang이 이 화면을 스택에서 홈으로 치환한다.
 * 유일한 행동은 데이터가 있는 청년 그룹으로 보내는 것.
 */
export function SoonScreen({ l }: { l: string }) {
  const { L, go } = useApp();
  return (
    <>
      <Crumb path={l} />
      <ResultBox kind="check" title={`${l}${L(UI.soon)}`} sub={L(UI.soonS)} />
      <Stack>
        <WideButton primary label={L(UI.seeYouth)} onClick={() => go({ k: 'group', g: 'youth' })} />
      </Stack>
    </>
  );
}
