// 내비게이션 스택의 맨 위 Screen 객체를 실제 화면 컴포넌트로 바꿔주는 곳.
// 라우터 라이브러리 없이 AppContext의 nav 배열(Screen[])만으로 화면을 오간다 — 원본도 history API 없이
// 자체 스택이었고, 시연용이라 URL이 바뀔 필요가 없어서 그대로 뒀다.
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import type { Screen } from '@/types';
import { HomeScreen } from './HomeScreen';
import { LangScreen } from './LangScreen';
import { AdminScreen } from './admin/AdminScreen';
import { CounterScreen } from './admin/CounterScreen';
import { CardScreen } from './doc/CardScreen';
import { ConfirmScreen } from './doc/ConfirmScreen';
import { CounselScreen } from './doc/CounselScreen';
import { DocScreen } from './doc/DocScreen';
import { ManualScreen } from './doc/ManualScreen';
import { MaskScreen } from './doc/MaskScreen';
import { ReadingScreen } from './doc/ReadingScreen';
import { TaxQScreen } from './doc/TaxQScreen';
import { AboutItemScreen } from './info/AboutItemScreen';
import { AboutScreen } from './info/AboutScreen';
import { CertItemScreen } from './info/CertItemScreen';
import { CertScreen } from './info/CertScreen';
import { EatsScreen } from './info/EatsScreen';
import { EventScreen } from './info/EventScreen';
import { EventsScreen } from './info/EventsScreen';
import { LocalScreen } from './info/LocalScreen';
import { PlacesScreen } from './info/PlacesScreen';
import { LifeItemScreen } from './visit/LifeItemScreen';
import { LifeScreen } from './visit/LifeScreen';
import { TaskScreen } from './visit/TaskScreen';
import { VisitScreen } from './visit/VisitScreen';
import { ApplyScreen } from './welfare/ApplyScreen';
import { DocsScreen } from './welfare/DocsScreen';
import { GroupScreen } from './welfare/GroupScreen';
import { ItemScreen } from './welfare/ItemScreen';
import { MineScreen } from './welfare/MineScreen';
import { QuizScreen } from './welfare/QuizScreen';
import { SoonScreen } from './welfare/SoonScreen';
import { StageScreen } from './welfare/StageScreen';
import { WelfareScreen } from './welfare/WelfareScreen';

/**
 * Screen → JSX. s.k로 분기하는 구분 유니온(discriminated union) switch.
 *
 * TS가 봐주는 것:
 * - case 문자열이 Screen['k']에 없는 값이면(오타, 지운 화면) 비교 불가 에러
 * - 각 case 안에서 s가 해당 멤버로 좁혀져서 s.g / s.s / s.i 같은 필드를 안전하게 꺼낼 수 있다.
 *   예컨대 'stage' 블록에서 s.i를 쓰면 바로 빨간 줄
 * 안 봐주는 것:
 * - case를 빠뜨려도 에러는 아니다. 반환 타입이 `JSX.Element | undefined`로 넓어질 뿐이고
 *   <main>은 undefined도 받아서 조용히 빈 화면이 된다 (noImplicitReturns가 꺼져 있음).
 *   types/index.ts에 Screen을 추가하면 여기도 같이 고쳐야 한다. 반환 타입을 명시하면 에러로 바꿀 수 있는데
 *   아직은 손대지 않았음.
 *
 * 각 case는 Screen 객체에 실린 값을 그대로 props로 넘긴다.
 * 데이터를 찾고 없으면 null을 돌려주는 건 각 화면 컴포넌트 몫.
 */
function render(s: Screen) {
  switch (s.k) {
    case 'lang': return <LangScreen />;
    case 'home': return <HomeScreen />;
    /* 복지 */
    case 'welfare': return <WelfareScreen />;
    case 'group': return <GroupScreen g={s.g} />;
    case 'stage': return <StageScreen s={s.s} />;
    case 'item': return <ItemScreen s={s.s} i={s.i} />;
    // 퀴즈만 key를 준다. step/answers가 QuizScreen 로컬 state라서, 같은 quiz 화면에 머문 채
    // 다른 혜택으로 바뀌면(양주무관 action으로 스택을 갈아끼우는 경우) 이전 진행 상태가 남는다.
    // key가 바뀌면 React가 컴포넌트를 새로 마운트해서 처음 질문부터 다시 시작한다.
    case 'quiz': return <QuizScreen key={`${s.s}:${s.i}`} s={s.s} i={s.i} />;
    case 'docs': return <DocsScreen s={s.s} i={s.i} />;
    case 'apply': return <ApplyScreen s={s.s} i={s.i} />;
    case 'mine': return <MineScreen />;
    case 'soon': return <SoonScreen l={s.l} />;
    /* 소개·행사·맛집 */
    case 'about': return <AboutScreen />;
    case 'aboutItem': return <AboutItemScreen i={s.i} />;
    case 'events': return <EventsScreen />;
    case 'event': return <EventScreen e={s.e} />;
    case 'local': return <LocalScreen />;
    case 'places': return <PlacesScreen />;
    case 'eats': return <EatsScreen />;
    case 'cert': return <CertScreen />;
    case 'certItem': return <CertItemScreen i={s.i} />;
    /* 받은 문서 (고지서 흐름 — 상태는 DocContext) */
    case 'doc': return <DocScreen />;
    case 'mask': return <MaskScreen />;
    case 'reading': return <ReadingScreen />;
    case 'confirm': return <ConfirmScreen />;
    case 'manual': return <ManualScreen />;
    case 'card': return <CardScreen />;
    case 'taxq': return <TaxQScreen />;
    case 'counsel': return <CounselScreen q={s.q} />;
    /* 담당자 */
    case 'admin': return <AdminScreen tab={s.tab} />;
    case 'counter': return <CounterScreen />;
    /* 시청 민원 · 생활 */
    case 'visit': return <VisitScreen />;
    case 'task': return <TaskScreen v={s.v} />;
    case 'life': return <LifeScreen />;
    case 'lifeitem': return <LifeItemScreen v={s.v} />;
  }
}

/**
 * 스택 맨 위 화면을 <main>에 렌더링.
 * 화면이 바뀔 때마다 스크롤을 맨 위로 — 의존성에 nav.length를 같이 넣은 건
 * 같은 k의 화면끼리 push 될 때(stage → stage 등)도 올려 주려고.
 * aria-live=polite: 화면 교체를 스크린리더가 알아채게 (원본 main과 동일).
 */
export function ScreenRouter() {
  const { screen, nav } = useApp();
  useEffect(() => { window.scrollTo(0, 0); }, [nav.length, screen.k]);
  return <main aria-live="polite">{render(screen)}</main>;
}
