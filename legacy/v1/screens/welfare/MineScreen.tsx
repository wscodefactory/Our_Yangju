// 내 혜택(mine): 별을 눌러 담아둔 혜택 목록. 복지 흐름의 곁가지.
// Header의 '☆ 내 혜택' 칩에서 들어온다. 저장소는 AppContext의 mine(localStorage).
import { Crumb } from '@/components/layout/Crumb';
import { BenefitTile } from '@/components/ui/BenefitTile';
import { ResultBox } from '@/components/ui/Cards';
import { Grid } from '@/components/ui/Tile';
import { useApp } from '@/context/AppContext';
import { UI } from '@/data/ui';

/**
 * 내가 담은 혜택. Header의 '☆ 내 혜택' 칩에서 들어온다.
 * mine은 { "stageId:index": 1 } 형태(localStorage에 그대로 저장)라서 키를 쪼개 Stage/Benefit을 다시 찾는다.
 * 단계가 사라졌거나 인덱스가 범위를 벗어난 항목(예전 저장분)은 filter에서 걸러 조용히 안 보여준다.
 * 여러 단계가 섞이니까 BenefitTile에 stageLabel을 줘서 주체 태그 대신 단계명을 보이게 한다.
 */
export function MineScreen() {
  const { L, mine, stageById } = useApp();
  const entries = Object.keys(mine)
    .map((key) => { const [sid, idx] = key.split(':'); return { sid, i: Number(idx), st: stageById(sid) }; })
    .filter((e) => e.st && e.st.items[e.i]);
  return (
    <>
      <Crumb path={L(['내 혜택', 'My benefits'])} />
      <h1>{L(UI.mineT)}</h1>
      {entries.length ? (
        <Grid>
          {/* filter에서 st 존재를 확인했지만 타입은 못 좁혀서 ! 사용 */}
          {entries.map((e) => (
            <BenefitTile key={`${e.sid}:${e.i}`} stageId={e.sid} index={e.i} b={e.st!.items[e.i]} stageLabel={L(e.st!.label)} />
          ))}
        </Grid>
      ) : (
        <ResultBox kind="check" title={L(UI.mineE)} sub={L(UI.mineES)} />
      )}
    </>
  );
}
