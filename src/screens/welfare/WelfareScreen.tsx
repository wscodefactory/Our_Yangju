// 복지 혜택 흐름의 첫 화면: "누구의 혜택인가요?" — 청년 / 신혼·출산 / 육아 / 중장년 / 어르신 / 장애·돌봄.
// 흐름: welfare → group → stage → item → (quiz | docs | apply)
import { Crumb } from '@/components/layout/Crumb';
import { ForeignNote } from '@/components/ui/Bits';
import { Grid, Tile } from '@/components/ui/Tile';
import { useApp } from '@/context/AppContext';
import { GROUPS } from '@/data/benefits';
import { GroupIcon } from '@/data/icons';
import { UI } from '@/data/ui';

/** 그룹 타일 격자. 아이콘은 GroupIcon[id]에서 찾고, 없는 그룹은 글자만 */
export function WelfareScreen() {
  const { L, go } = useApp();
  return (
    <>
      <Crumb path={L(UI.welfare)} />
      <h1>{L(UI.who)}</h1>
      <Grid>
        {GROUPS.map((g) => {
          const Icon = GroupIcon[g.id];
          return (
            <Tile key={g.id} onClick={() => go({ k: 'group', g: g.id })}>
              {Icon && <Icon />}
              <span className="lab">{L(g.label)}</span>
            </Tile>
          );
        })}
      </Grid>
      <ForeignNote />
    </>
  );
}
