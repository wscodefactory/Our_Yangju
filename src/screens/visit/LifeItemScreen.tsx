// "양주에서 살기" 주제 상세(lifeitem). LIFE 데이터의 항목은 둘 중 하나 — 전화번호 표(rows) 아니면 순서 팁(tips).
// 데이터는 LIFE(data/civic)에서 id로 찾는다. LifeScreen의 타일에서 들어온다. 원본 html의 #lifeitem.
import { Crumb } from '@/components/layout/Crumb';
import { Note } from '@/components/ui/Notes';
import { Stack } from '@/components/ui/Tile';
import { Tr } from '@/components/ui/Tr';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { LIFE } from '@/data/civic';
import { SPEECH_LANG } from '@/data/tax';
import { canSpeak, speak } from '@/utils/browser';

/**
 * 생활 주제 상세: 전화번호 목록 또는 순서 팁.
 * rows가 있으면 전화번호 화면, 없으면 tips 화면 — 둘 다 없는 항목은 데이터상 없다고 가정.
 */
export function LifeItemScreen({ v }: { v: string }) {
  const { cl } = useApp();
  const topic = LIFE.find((x) => x.id === v);
  if (!topic) return null;
  // rows는 [번호, 한국어, 영어]. 읽어줄 땐 "영어 설명 번호" 순서로, 팁은 영어 문장만
  const spoken = (topic.rows
    ? topic.rows.map((r) => `${r[2]} ${r[0]}`)
    : (topic.tips || []).map((tip) => tip[1])
  ).join('. ');
  return (
    <>
      {/* 빵부스러기 첫 칸은 LifeScreen과 같은 문구 */}
      <Crumb path={<><Tr ko="양주에서 살기" en="Living in Yangju" /> › <Tr ko={topic.name[0]} en={topic.name[1]} /></>} />
      <h1><Tr ko={topic.name[0]} en={topic.name[1]} /></h1>
      {topic.rows ? (
        <>
          <div className="list">
            {topic.rows.map((r) => (
              <div key={r[0]} className="phone"><span><Tr ko={r[1]} en={r[2]} /></span><b>{r[0]}</b></div>
            ))}
          </div>
          <Note><Tr ko="번호를 길게 눌러 복사하세요. 통역이 되는 번호는 1345·1330·119." en="Press and hold a number to copy. Interpreting: 1345, 1330, 119." /></Note>
        </>
      ) : (
        <>
          {(topic.tips || []).map((tip, i) => (
            // .step 그리드를 재사용하되 제목(b)은 비우고 본문만 2열 1행에 올린다
            <div key={i} className="step">
              <span className="no">{i + 1}</span><b />
              <p style={{ gridColumn: 2, gridRow: 1, color: 'var(--ink)', fontSize: '1em' }}><Tr ko={tip[0]} en={tip[1]} /></p>
            </div>
          ))}
          <Note><Tr ko="일반 안내입니다. 동네별 세부 규칙은 행정복지센터에 확인하세요." en="General guidance. Check local details with your community service center." /></Note>
        </>
      )}
      {canSpeak && (
        <Stack mt={12}>
          <WideButton arrow={null} label={<Tr ko="읽어주기" en="Read aloud" />} onClick={() => speak(spoken, SPEECH_LANG[cl])} />
        </Stack>
      )}
    </>
  );
}
