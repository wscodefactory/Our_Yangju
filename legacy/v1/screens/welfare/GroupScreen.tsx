// 그룹을 고른 다음 화면: "지금 어느 단계인가요?"
// 청년 그룹은 실제 혜택 데이터(독립/취업/결혼/임신·출산/육아 …)가 있고,
// 나머지 그룹은 데이터가 아직 없어서 청년 단계를 빌려 쓰거나 "본선에서" 안내로 빠진다.
import { Crumb } from '@/components/layout/Crumb';
import { Grid, Tile } from '@/components/ui/Tile';
import { useApp } from '@/context/AppContext';
import { GROUPS, NOW_STAGE, isLinkedRef, isStageRef } from '@/data/benefits';
import { UI } from '@/data/ui';
import type { Stage } from '@/types';

/**
 * g: 그룹 id ('youth' | 'newly' | 'child' | 'mid' | 'senior' | 'care')
 *
 * 데이터 구조(types의 Group.stages)가 두 가지라 분기가 생겼다:
 * - 청년: Stage[] 자체. 단, GROUPS의 원본이 아니라 AppContext.youthStages를 쓴다.
 *   담당자가 게시한 혜택이 합쳐진 버전이라서 — GROUPS를 직접 읽으면 NEW 혜택 개수가 안 맞는다.
 * - 그 외: StageRef[]. 두 종류가 섞여 있음
 *     { id, ref: true } → 청년 단계를 그대로 가리킴 (신혼·출산 → marry/birth, 육아 → care).
 *                          stageById로 실제 Stage를 찾아 그 라벨·개수를 보여주고 stage 화면으로 간다
 *     { label }         → 아직 내용이 없는 단계. "본선에서" 태그를 달고 soon 화면으로.
 *                          soon 화면은 라벨 문자열만 받기 때문에 여기서 L()로 미리 뽑아 넘긴다
 *
 * 청년 쪽 태그 규칙: NOW_STAGE('indep')면 "지금", 'marry'면 "다음", 나머지는 "N개".
 * 시연 시나리오가 "독립을 막 시작한 청년"이라서 지금/다음을 고정으로 박아둔 것.
 */
export function GroupScreen({ g }: { g: string }) {
  const { L, lang, go, youthStages, stageById } = useApp();
  const group = GROUPS.find((grp) => grp.id === g);
  if (!group) return null;

  // "3개" / "3 items" — UI.cnt가 '개'/'' 라서 영어일 때만 뒤에 items를 붙인다
  const countTag = (st: Stage) => `${st.items.length}${L(UI.cnt)}${lang === 'en' ? ' items' : ''}`;

  return (
    <>
      <Crumb path={L(group.label)} />
      <h1>{L(UI.stageQ)}</h1>
      <Grid>
        {group.id === 'youth'
          ? youthStages.map((st) => {
            const now = st.id === NOW_STAGE;
            const tag = now ? L(UI.now) : st.id === 'marry' ? L(UI.next) : countTag(st);
            return (
              <Tile key={st.id} className={now ? 'now' : ''} onClick={() => go({ k: 'stage', s: st.id })}>
                <span className="tag">{tag}</span>
                <span className="lab">{L(st.label)}</span>
              </Tile>
            );
          })
          : group.stages.map((st, i) => {
            if (isStageRef(st) && isLinkedRef(st)) {
              const linked = stageById(st.id);
              if (!linked) return null;  // 데이터 쪽 id 오타 방어
              return (
                <Tile key={st.id} onClick={() => go({ k: 'stage', s: st.id })}>
                  <span className="tag">{countTag(linked)}</span>
                  <span className="lab">{L(linked.label)}</span>
                </Tile>
              );
            }
            // 여기 오면 { label }뿐. isStageRef를 통과 못 한 Stage는 청년 그룹 외엔 없다
            const label = L(st.label);
            return (
              <Tile key={i} className="off" onClick={() => go({ k: 'soon', l: label })}>
                <span className="tag">{L(UI.later)}</span>
                <span className="lab">{label}</span>
              </Tile>
            );
          })}
      </Grid>
    </>
  );
}
