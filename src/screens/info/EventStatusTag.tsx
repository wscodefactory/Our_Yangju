// 행사 상태 태그. 목록(EventsScreen)과 상세(EventScreen)가 같이 써서 따로 뺐다.
import { useApp } from '@/context/AppContext';
import { UI } from '@/data/ui';
import type { EventStatus } from '@/types';

// 상태 → 태그 문구. on 진행 중 / soon 예정 / done 끝남
const statusLabel = { on: UI.on, soon: UI.soonTag, done: UI.done } as const;

/** 상태 태그. className에 상태값을 그대로 줘서 css가 색을 입힌다 */
export function StatusTag({ st }: { st: EventStatus }) {
  const { L } = useApp();
  return <span className={`tag ${st}`}>{L(statusLabel[st])}</span>;
}
