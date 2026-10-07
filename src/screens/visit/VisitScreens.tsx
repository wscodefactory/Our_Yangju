// 시청·주민센터 민원 안내: 업무 타일 목록(VisitScreen) → 업무 상세(TaskScreen).
// 데이터는 TASKS(data/civic) 하나고, 같은 데이터를 담당자 창구 모드도 쓴다.
// 문구는 전부 <Tr>로 감싸서 카드 언어가 zh/vi/ne면 자동으로 번역이 끼워진다. 원본 html의 #visit, #task.
import { Crumb } from '@/components/layout/Crumb';
import { CheckItemRow, Note } from '@/components/ui/Bits';
import { Grid, Stack, Tile } from '@/components/ui/Tile';
import { Tr } from '@/components/ui/Tr';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { useGuide } from '@/context/GuideContext';
import { TASKS } from '@/data/civic';
import { TaskIconSvg } from '@/data/icons';
import { SPEECH_LANG } from '@/data/tax';
import { canSpeak, speak } from '@/utils/browser';

// 빵부스러기 첫 칸. 두 화면이 같이 써서 빼둠
const CityOffice = () => <Tr ko="시청·주민센터" en="City office" />;

/** 시청·주민센터: 어떤 일인가요? — 업무 타일 그리드 */
export function VisitScreen() {
  const { go } = useApp();
  return (
    <>
      <Crumb path={<CityOffice />} />
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

/**
 * 민원 업무 상세: 어디서 / 언제까지 / 가져갈 것 + 창구에 보여줄 한국어.
 * v: 내비 항목에 실린 업무 id. 없는 id면 아무것도 안 그린다 (ScreenRouter가 잘못된 스택을 넘긴 경우).
 */
export function TaskScreen({ v }: { v: string }) {
  const { cl } = useApp();
  const { askAboutTask } = useGuide();
  const task = TASKS.find((x) => x.id === v);
  if (!task) return null;
  // 읽어주기 원문은 영어([1])로 고정. zh/vi/ne 번역문은 Tr 안에서 비동기로 들어와 여기선 잡을 수 없다.
  // 음성만 SPEECH_LANG[cl]을 따라가는 셈이라 어색할 수 있음 — 원본 html 동작 그대로 둠
  const spoken = [task.name[1], task.where[1], task.when[1], ...task.docs.map((d) => d[1])].join('. ');
  return (
    <>
      <Crumb path={<><CityOffice /> › <Tr ko={task.name[0]} en={task.name[1]} /></>} />
      <h1><Tr ko={task.name[0]} en={task.name[1]} /></h1>
      <div className="step"><span className="no">1</span><b><Tr ko="어디서" en="Where" /></b><p><Tr ko={task.where[0]} en={task.where[1]} /></p></div>
      <div className="step"><span className="no">2</span><b><Tr ko="언제까지" en="When" /></b><p><Tr ko={task.when[0]} en={task.when[1]} /></p></div>
      <div className="step">
        {/* .step은 2열 그리드(번호 | 내용). 빈 <p/>로 1행을 채우고 체크 목록을 두 열에 걸쳐 아래로 내린다 */}
        <span className="no">3</span><b><Tr ko="가져갈 것" en="Bring" /></b><p />
        <div className="list" style={{ gridColumn: '1/3', marginTop: 4 }}>
          {task.docs.map((d, i) => <CheckItemRow key={i} id={`td${i}`}><Tr ko={d[0]} en={d[1]} /></CheckItemRow>)}
        </div>
      </div>
      {/* 창구 직원에게 그대로 보여주는 카드. say는 번역하지 않는 한국어 고정 문장 */}
      <div className="showcard" lang="ko">
        <p className="k"><Tr ko="창구에서 이 화면을 보여주세요" en="Show this screen at the counter" /></p>
        <div className="ko">{task.say}</div>
        <div className="my"><Tr ko="직원이 한국어로 읽습니다. 통역이 필요하면 1345." en="The officer reads this in Korean. For interpreting, 1345." /></div>
      </div>
      <Stack mt={12}>
        {canSpeak && <WideButton arrow={null} label={<Tr ko="읽어주기" en="Read aloud" />} onClick={() => speak(spoken, SPEECH_LANG[cl])} />}
        {/* 양주무관 채팅을 이 업무 맥락으로 연다 */}
        <WideButton label={<Tr ko="더 물어보기" en="Ask more" />} onClick={() => askAboutTask(task)} />
      </Stack>
      {task.src && <Note>{task.src}</Note>}
    </>
  );
}
