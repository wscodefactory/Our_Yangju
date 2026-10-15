// 번역 문구의 언어별 검수 여부를 기기에 저장하고 JSON으로 내보내거나 가져온다.
import { useEffect, useState } from 'react';
import { UI_DRAFT_KEYS } from '@/data/content';
import type { Lang } from '@/i18n';
import { STORAGE_KEYS, storage } from './browser';

export type ReviewLang = 'zh' | 'vi' | 'ne';
export const REVIEW_LANGS: ReviewLang[] = ['zh', 'vi', 'ne'];
export type ReviewState = Record<string, Partial<Record<ReviewLang, true>>>;

// 여러 컴포넌트가 같은 상태를 보도록 저장할 때마다 이벤트를 쏜다 (useReview 가 듣는다)
const EVENT = 'review-changed';

export function loadReview(): ReviewState {
  return storage.getJSON<ReviewState>(STORAGE_KEYS.review, {});
}

function save(state: ReviewState) {
  storage.setJSON(STORAGE_KEYS.review, state);
  window.dispatchEvent(new Event(EVENT));
}

export function setReviewed(key: string, lang: ReviewLang, on: boolean) {
  const state = loadReview();
  const row = { ...(state[key] || {}) };
  if (on) row[lang] = true; else delete row[lang];
  if (Object.keys(row).length) state[key] = row; else delete state[key];
  save(state);
}

/** 그 언어의 초안 문구가 전부 검수됐나. ko/en 은 초안이 아니라 항상 true */
export function allReviewed(lang: Lang, state: ReviewState = loadReview()): boolean {
  if (lang === 'ko' || lang === 'en') return true;
  return UI_DRAFT_KEYS.every((k) => state[k]?.[lang]);
}

export function exportReview(): string {
  return JSON.stringify({ version: 1, reviewedAt: new Date().toISOString(), state: loadReview() }, null, 2);
}

/** 붙여넣은 JSON 적용. 모양이 다르면 throw (호출부가 토스트). 아는 언어의 true 값만 받아들인다 */
export function importReview(json: string) {
  const data: unknown = JSON.parse(json);
  if (!data || typeof data !== 'object' || (data as { version?: unknown }).version !== 1) throw new Error('bad version');
  const raw = (data as { state?: unknown }).state;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('bad state');
  const state: ReviewState = {};
  for (const [key, row] of Object.entries(raw as Record<string, unknown>)) {
    if (!row || typeof row !== 'object') throw new Error(`bad row: ${key}`);
    const clean: Partial<Record<ReviewLang, true>> = {};
    for (const l of REVIEW_LANGS) if ((row as Record<string, unknown>)[l] === true) clean[l] = true;
    if (Object.keys(clean).length) state[key] = clean;
  }
  save(state);
}

const resetReview = () => save({});

export function useReview() {
  const [state, setState] = useState<ReviewState>(loadReview);
  useEffect(() => {
    const on = () => setState(loadReview());
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return { state, toggle: setReviewed, reset: resetReview, importJson: importReview, exportJson: exportReview };
}
