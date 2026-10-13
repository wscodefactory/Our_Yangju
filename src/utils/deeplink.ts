// 바로가기 주소 규칙 (3차 개선제안 2장). 고지서·안내문·포스터의 QR 이 서비스 주소 뒤에 붙이는 값:
//   ?go=doc&from=qr          받은 고지서 읽기 (QR 로 들어왔다는 표시)
//   ?go=visit&id=reg         시청·주민센터 업무 하나 (move, reg, nhis, kid, drive) — id 가 없거나 틀리면 목록
//   ?go=welfare              지원 혜택 찾기
//   ?go=life&id=trash        생활 정보 하나 (sos, trash, med, bus, work)
//   ?go=explore&tab=events   양주 둘러보기 (events, places, food, about)
// 알 수 없는 값이면 홈. 읽은 뒤에는 주소창의 ?go= 를 지워 새로 고침·공유 때 같은 화면이 반복해서 열리지 않게 한다.
import { LIFE, VISIT } from '@/data/content';
import type { Screen } from '@/types';

export interface DeepLink { screen: Screen; qr: boolean }

const TABS = ['events', 'places', 'food', 'about'] as const;
type Tab = (typeof TABS)[number];

export function readDeepLink(): DeepLink | null {
  let q: URLSearchParams;
  try { q = new URLSearchParams(location.search); } catch { return null; }
  const go = q.get('go');
  if (!go) return null;
  const id = q.get('id') ?? '';
  const tab = q.get('tab') ?? '';
  let screen: Screen | null = null;
  if (go === 'doc') screen = { k: 'doc' };
  else if (go === 'visit') screen = VISIT.some((v) => v.id === id) ? { k: 'visitItem', id } : { k: 'visit' };
  else if (go === 'life') screen = LIFE.some((v) => v.id === id) ? { k: 'lifeItem', id } : { k: 'life' };
  else if (go === 'welfare') screen = { k: 'welfare' };
  else if (go === 'explore') screen = { k: 'explore', tab: (TABS as readonly string[]).includes(tab) ? (tab as Tab) : 'events' };
  try { history.replaceState(null, '', location.pathname + location.hash); } catch { /* 무시 */ }
  return screen ? { screen, qr: q.get('from') === 'qr' } : null;
}

/** QR 에 넣는 서비스 주소 (배포본: https://wscodefactory.github.io/Our_Yangju/) */
export const appBase = () => location.origin + location.pathname;
