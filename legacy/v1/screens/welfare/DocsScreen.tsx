// 혜택 흐름의 준비물 체크리스트(docs). ItemScreen·QuizScreen 결과에서 (s, i)로 들어온다.
// "다 챙겼어요"를 누르면 같은 (s, i)로 ApplyScreen으로 넘어간다.
import { Crumb } from '@/components/layout/Crumb';
import { CheckItemRow } from '@/components/ui/Status';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { UI } from '@/data/ui';

/**
 * 준비물 체크리스트. 체크 상태는 저장 안 함(CheckItemRow 참고).
 * 체크박스 id는 `d{j}` — 화면에 한 목록뿐이라 인덱스만으로 충분.
 */
export function DocsScreen({ s, i }: { s: string; i: number }) {
  const { L, go, stageById } = useApp();
  const b = stageById(s)?.items[i];
  if (!b) return null;
  return (
    <>
      <Crumb path={`${L(b.name)} › ${L(UI.docs)}`} />
      <h1>{L(UI.docs)}</h1>
      <div className="list">
        {b.docs.map((d, j) => <CheckItemRow key={j} id={`d${j}`}>{L(d)}</CheckItemRow>)}
      </div>
      <Stack mt={16}>
        <WideButton primary arrow={null} label={L(UI.allSet)} onClick={() => go({ k: 'apply', s, i })} />
      </Stack>
    </>
  );
}
