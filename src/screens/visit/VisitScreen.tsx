// 시청·주민센터 민원 안내 입구: 업무 타일 목록(visit). 누르면 TaskScreen으로 간다.
// 데이터는 TASKS(data/civic) 하나고, 같은 데이터를 담당자 창구 모드도 쓴다.
// 문구는 전부 <Tr>로 감싸서 카드 언어가 zh/vi/ne면 자동으로 번역이 끼워진다. 원본 html의 #visit.
import { Crumb } from '@/components/layout/Crumb';
import { Note } from '@/components/ui/Notes';
import { Grid, Tile } from '@/components/ui/Tile';
import { Tr } from '@/components/ui/Tr';
import { useApp } from '@/context/AppContext';
import { TASKS } from '@/data/civic';
import { TaskIconSvg } from '@/data/icons';

/** 시청·주민센터: 어떤 일인가요? — 업무 타일 그리드 */
export function VisitScreen() {
  const { go } = useApp();
  return (
    <>
      {/* 빵부스러기 첫 칸. TaskScreen의 빵부스러기와 같은 문구 */}
      <Crumb path={<Tr ko="시청·주민센터" en="City office" />} />
      <h1><Tr ko="어떤 일인가요?" en="Which task?" /></h1>
      <Grid>
        {TASKS.map((task) => {
          const Icon = TaskIconSvg[task.icon];
          return (
            <Tile key={task.id} onClick={() => go({ k: 'task', v: task.id })}>
              <Icon />
              <span className="lab" style={{ fontSize: '1.25em' }}><Tr ko={task.name[0]} en={task.name[1]} /></span>
            </Tile>
          );
        })}
      </Grid>
      <Note><Tr ko="내용은 일반 안내이며 접수 창구·준비물은 양주시 확인 후 확정합니다." en="General guidance. Counters and documents to be confirmed with Yangju City." /></Note>
    </>
  );
}
