// 사용자가 저장을 선택한 납부 기록. 실제 납부 여부를 은행에 조회하지는 않는다.
import type { TaxType } from '@/types';
import { STORAGE_KEYS, storage } from './browser';

export interface PaidRecord {
  type: TaxType;
  amount: number;
  /** 납부 기한 'YYYY-MM-DD' */
  due: string;
  /** 저장한 시각 (ms) */
  paidAt: number;
}

export const paidStore = {
  load(): PaidRecord[] { return storage.getJSON<PaidRecord[]>(STORAGE_KEYS.paid, []); },
  add(r: PaidRecord): PaidRecord[] {
    const next = [r, ...this.load()].slice(0, 50);
    storage.setJSON(STORAGE_KEYS.paid, next);
    return next;
  },
  clear() { storage.set(STORAGE_KEYS.paid, '[]'); },
};
