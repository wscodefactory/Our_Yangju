// 혜택 상세. 무엇/누가/언제 카드 + 네 개의 행동 버튼.
// 여기서 quiz / docs / apply 세 갈래로 갈라지고, 별 버튼으로 내 혜택에 담는다.
import { Bookmark, ChevronRight } from 'lucide-react';
import { Crumb } from '@/components/layout/Crumb';
import { InfoCard } from '@/components/ui/Cards';
import { ForeignNote } from '@/components/ui/Notes';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { UI } from '@/data/ui';

/**
 * s: 단계 id, i: 그 단계 items 안의 인덱스. 이 (s, i) 쌍이 혜택의 식별자 노릇을 한다.
 * 혜택에 별도 id가 없어서인데, 담당자 게시분이 뒤에 붙는 구조라 기존 인덱스는 안 밀린다.
 */
export function ItemScreen({ s, i }: { s: string; i: number }) {
  const { L, go, stageById, isMine, toggleMine } = useApp();
  const st = stageById(s);
  const b = st?.items[i];
  if (!st || !b) return null;
  const on = isMine(s, i);
  return (
    <>
      <Crumb path={`${L(st.label)} › ${L(b.name)}`} />
      <h1>{L(b.name)}</h1>
      <InfoCard rows={[[L(UI.what), L(b.what)], [L(UI.whom), L(b.who)], [L(UI.when), L(b.when)]]} />
      <Stack mt={12}>
        <WideButton primary label={L(UI.canI)} onClick={() => go({ k: 'quiz', s, i })} />
        {/* 화살표 자리에 준비물 개수를 같이 보여준다 */}
        <WideButton label={L(UI.docs)} arrow={<>{b.docs.length} <ChevronRight aria-hidden="true" /></>} onClick={() => go({ k: 'docs', s, i })} />
        <WideButton label={L(UI.apply)} onClick={() => go({ k: 'apply', s, i })} />
        {/* 담기 토글. 화면 이동이 아니라 화살표를 뺐고, 담긴 상태면 on 색 + "담았어요" 라벨 */}
        <WideButton on={on} arrow={null} label={<><Bookmark fill={on ? 'currentColor' : 'none'} aria-hidden="true" /> {on ? L(UI.starred) : L(UI.star)}</>} onClick={() => toggleMine(s, i)} />
      </Stack>
      <ForeignNote />
    </>
  );
}
