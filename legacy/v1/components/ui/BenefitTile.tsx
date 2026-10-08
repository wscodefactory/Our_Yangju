// 혜택 하나를 나타내는 격자 타일. 단계별 목록(StageScreen), 퀴즈 "아니오" 결과의 다른 혜택 목록,
// 내 혜택(MineScreen)에서 같은 타일을 쓴다. 누르면 혜택 상세(item)로 간다.
import { Bookmark } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LV } from '@/data/benefits';
import { UI } from '@/data/ui';
import type { Benefit } from '@/types';
import { Tile } from './Tile';

/**
 * 시행 주체 태그(중앙/경기/양주) + 담당자가 새로 게시한 혜택이면 NEW.
 * 양주시 자체 사업만 .yj 색을 입힌다 — 범례(Legend)의 세 번째 색과 맞춤.
 */
export function LevelTags({ b }: { b: Benefit }) {
  const { L } = useApp();
  return (
    <div className="tags">
      <span className={`tag ${b.lv === LV.Y ? 'yj' : ''}`}>{L(b.lv)}</span>
      {b.isNew && <span className="tag on">NEW</span>}
    </div>
  );
}

interface Props {
  /** 혜택이 속한 단계 id. index와 합쳐 "stageId:index"가 내 혜택 키가 된다 */
  stageId: string;
  index: number;
  b: Benefit;
  /** 내 혜택 화면에서만 넘어옴. 있으면 주체 태그 대신 단계 라벨을 보여준다 (여러 단계가 섞이니까) */
  stageLabel?: string;
}

/**
 * 혜택 타일. 왼쪽 위 표시가 상태에 따라 갈린다:
 * 담았으면 북마크 아이콘, 아니면 가능성 색 점(b.st: high/check).
 * className에도 b.st를 줘서 타일 테두리 색이 점과 같이 간다.
 */
export function BenefitTile({ stageId, index, b, stageLabel }: Props) {
  const { L, go, isMine } = useApp();
  const on = isMine(stageId, index);
  return (
    <Tile className={b.st} onClick={() => go({ k: 'item', s: stageId, i: index })}>
      {on ? <span className="star" role="img" aria-label={L(UI.saved)}><Bookmark size={18} fill="currentColor" aria-hidden="true" /></span> : <span className={`dot ${b.st}`} />}
      {stageLabel ? <span className="tag">{stageLabel}</span> : <LevelTags b={b} />}
      <span className="lab">{L(b.name)}</span>
    </Tile>
  );
}
