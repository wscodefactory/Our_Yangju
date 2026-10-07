// 단계 하나의 혜택 목록. 청년 그룹에서 들어오든 다른 그룹의 ref 타일에서 들어오든 결국 여기.
// 담당자가 게시한 혜택(NEW)도 youthStages에 합쳐져 있어서 같이 보인다.
import { Crumb } from '@/components/layout/Crumb';
import { BenefitTile } from '@/components/ui/BenefitTile';
import { ForeignNote, Legend } from '@/components/ui/Bits';
import { Grid, Tile } from '@/components/ui/Tile';
import { useApp } from '@/context/AppContext';
import { NOW_STAGE } from '@/data/benefits';
import { UI } from '@/data/ui';

/**
 * s: 단계 id. stageById로 못 찾으면 null (지운 단계가 저장된 내 혜택 등).
 * 경로 표시는 항상 "청년 › 단계명" — ref로 들어온 경우도 데이터가 청년 것이라 그대로 뒀다.
 * "지금" 단계(indep)에는 맨 끝에 다음 단계(결혼) 미리보기 타일을 하나 더 붙인다.
 */
export function StageScreen({ s }: { s: string }) {
  const { L, go, stageById } = useApp();
  const st = stageById(s);
  if (!st) return null;
  return (
    <>
      <Crumb path={`${L(UI.youth)} › ${L(st.label)}`} />
      <h1>{L(st.label)}{L(UI.stageB)}</h1>
      <Grid>
        {st.items.map((b, i) => <BenefitTile key={i} stageId={st.id} index={i} b={b} />)}
        {st.id === NOW_STAGE && (
          <Tile className="off" onClick={() => go({ k: 'stage', s: 'marry' })}>
            <span className="tag">{L(UI.next)}</span>
            <span className="lab">{L(UI.preview)}</span>
          </Tile>
        )}
      </Grid>
      <Legend />
      <ForeignNote />
    </>
  );
}
