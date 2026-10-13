// 납부 기록. [납부 완료] 를 누르면 저장할지 묻고, 이 휴대폰 localStorage 에만 둔다. 사진·이름·계좌번호는 넣지 않는다.
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
