// 담당자가 게시한 혜택 저장소. AppContext 가 처음 로드할 때 load(), 게시할 때 add() 를 부른다.
// localStorage 라 "이 기기에서만" 보인다. 서버가 생기면 이 두 함수만 교체하면 된다.
import type { PublishedBenefit } from '@/types';
import { STORAGE_KEYS, storage } from '@/utils/browser';

export const benefitsStore = {
  load(): PublishedBenefit[] {
    return storage.getJSON<PublishedBenefit[]>(STORAGE_KEYS.newBenefits, []);
  },
  // 최신이 맨 앞. 20개 넘으면 오래된 것부터 버린다 — 용량보다는 화면이 길어지는 걸 막으려는 숫자.
  // 추가 후 전체 목록을 돌려줘서 호출부가 다시 load() 할 필요 없게.
  add(b: PublishedBenefit): PublishedBenefit[] {
    const next = [b, ...this.load()].slice(0, 20);
    storage.setJSON(STORAGE_KEYS.newBenefits, next);
    return next;
  },
  /** 공유 저장소 여부. 지금은 항상 false → RegisterPanel 이 "이 기기에만 저장" 을 안내한다 */
  shared: false,
};
