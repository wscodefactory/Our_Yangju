// 담당자가 게시한 혜택을 이 브라우저에 저장한다. 기기 간 공유는 지원하지 않는다.
import type { PublishedBenefit } from '@/types';
import { STORAGE_KEYS, storage } from '@/utils/browser';

export const benefitsStore = {
  load(): PublishedBenefit[] {
    return storage.getJSON<PublishedBenefit[]>(STORAGE_KEYS.newBenefits, []);
  },
  // 최근 게시한 순서로 최대 20건을 보관하고 갱신된 목록을 반환한다.
  add(b: PublishedBenefit): PublishedBenefit[] {
    const next = [b, ...this.load()].slice(0, 20);
    storage.setJSON(STORAGE_KEYS.newBenefits, next);
    return next;
  },
  /** 공유 저장소 여부. 지금은 항상 false → RegisterPanel 이 "이 기기에만 저장" 을 안내한다 */
  shared: false,
};
