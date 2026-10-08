import type { ReactElement } from 'react';
import {
  Baby, Briefcase, CalendarDays, Car, CircleHelp, FileText, HandHeart, Heart, HeartHandshake, HeartPulse,
  House, IdCard, MapPin, MountainSnow, PersonStanding, User, type LucideIcon,
} from 'lucide-react';
import type { TaskIcon } from '@/types';

// 타일·문(door)에 들어가는 선 아이콘. lucide-react 를 쓴다.
// 색·굵기는 CSS(.tile svg, .door svg, .capbtn svg)가 정한다 — Lucide 가 svg 에 붙이는 stroke/stroke-width 속성보다
// CSS 가 우선이라 기존 스타일 규칙이 그대로 먹는다. 화면 쪽은 아래 맵만 보므로 아이콘을 바꿀 땐 여기만 고치면 된다.

type Svg = (props?: { className?: string }) => ReactElement;

/** Lucide 컴포넌트를 기존 호출 형태(props?.className)로 감싼다 */
const wrap = (Icon: LucideIcon): Svg =>
  (props) => <Icon className={props?.className} aria-hidden="true" />;

/** 복지 그룹 아이콘. 키는 GROUPS[].id 와 맞춘다 */
export const GroupIcon: Record<string, Svg> = {
  youth: wrap(User),
  newly: wrap(HeartHandshake),
  child: wrap(Baby),
  mid: wrap(Briefcase),
  senior: wrap(PersonStanding),
  care: wrap(HandHeart),
};

/** 홈 화면 섹션(문) 아이콘 */
export const SectionIcon = {
  about: wrap(MountainSnow),
  welfare: wrap(Heart),
  events: wrap(CalendarDays),
  local: wrap(MapPin),
  /** 받은 종이(고지서) 흐름 입구 */
  letter: wrap(FileText),
};

/** 시청 민원 아이콘. CivicTask.icon 값으로 바로 인덱싱한다 */
export const TaskIconSvg: Record<TaskIcon, Svg> = {
  home: wrap(House),
  id: wrap(IdCard),
  health: wrap(HeartPulse),
  kid: wrap(Baby),
  car: wrap(Car),
  other: wrap(CircleHelp),
};
