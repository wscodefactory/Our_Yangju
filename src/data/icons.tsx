import type { ReactElement } from 'react';
import type { TaskIcon } from '@/types';

// 타일·문(door)에 들어가는 선 아이콘. 원본 html 의 인라인 SVG 를 함수 컴포넌트로 옮긴 것.
// 색·굵기는 CSS(.tile svg, .door svg, .capbtn svg)가 정하므로
// 여기선 path 만 그리고 stroke/fill 속성을 주지 않는다. 아이콘 라이브러리를 안 쓴 건
// 전부 합쳐도 20개가 안 되고, 시안 느낌에 맞는 얇은 선 스타일을 직접 맞추는 게 빨라서다.

type Svg = (props?: { className?: string }) => ReactElement;

/** path 조각들을 24x24 viewBox 의 <svg> 로 감싸는 작은 헬퍼 */
const wrap = (children: ReactElement | ReactElement[]): Svg =>
  (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props?.className}>
      {children}
    </svg>
  );

/** 복지 그룹 아이콘. 키는 GROUPS[].id 와 맞춘다 */
export const GroupIcon: Record<string, Svg> = {
  youth: wrap([<circle key="a" cx="12" cy="7" r="3.5" />, <path key="b" d="M5 21v-2a7 7 0 0 1 14 0v2" />]),
  newly: wrap([<circle key="a" cx="9" cy="13" r="5" />, <circle key="b" cx="15" cy="13" r="5" />, <path key="c" d="M10 4l2 3 2-3" />]),
  child: wrap([
    <path key="a" d="M3 9h12a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" />,
    <path key="b" d="M15 9l3-5h2" />,
    <circle key="c" cx="7" cy="19" r="2" />,
    <circle key="d" cx="14" cy="19" r="2" />,
  ]),
  mid: wrap([<rect key="a" x="3" y="7" width="18" height="13" rx="2" />, <path key="b" d="M9 7V4h6v3M3 13h18" />]),
  senior: wrap([<circle key="a" cx="11" cy="4.5" r="2.5" />, <path key="b" d="M11 8l-2 6 3 3v4M9 14l-3 7M13 10l3 2v9" />]),
  care: wrap(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />),
};

/** 홈 화면 섹션(문) 아이콘 */
export const SectionIcon = {
  about: wrap([<path key="a" d="M3 20l6-12 4 7 3-4 5 9z" />, <circle key="b" cx="17" cy="5" r="2" />]),
  // 하트. GroupIcon.care, TaskIconSvg.health 와 같은 path 인데 의미가 달라 따로 둠
  welfare: wrap(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />),
  events: wrap([
    <rect key="a" x="3" y="5" width="18" height="16" rx="2" />,
    <path key="b" d="M3 10h18M8 3v4M16 3v4" />,
    <circle key="c" cx="12" cy="15" r="2" />,
  ]),
  local: wrap([<path key="a" d="M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11z" />, <circle key="b" cx="12" cy="10" r="2.2" />]),
  /** 받은 종이(고지서) 흐름 입구 */
  letter: wrap([<path key="a" d="M6 3h9l4 4v14H6z" />, <path key="b" d="M15 3v4h4M9 12h6M9 16h6" />]),
};

/** 시청 민원 아이콘. CivicTask.icon 값으로 바로 인덱싱한다 */
export const TaskIconSvg: Record<TaskIcon, Svg> = {
  home: wrap([<path key="a" d="M3 11l9-7 9 7v9H3z" />, <path key="b" d="M9 20v-6h6v6" />]),
  id: wrap([<rect key="a" x="3" y="5" width="18" height="14" rx="2" />, <circle key="b" cx="9" cy="12" r="2.5" />, <path key="c" d="M14 10h5M14 14h5" />]),
  health: wrap(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />),
  kid: wrap([<circle key="a" cx="12" cy="7" r="3.5" />, <path key="b" d="M5 21v-2a7 7 0 0 1 14 0v2" />]),
  car: wrap([<path key="a" d="M4 15l2-6h12l2 6v4H4z" />, <circle key="b" cx="8" cy="17" r="1.5" />, <circle key="c" cx="16" cy="17" r="1.5" />]),
  other: wrap([<circle key="a" cx="12" cy="12" r="9" />, <path key="b" d="M12 8v5M12 16h.01" />]),
};
