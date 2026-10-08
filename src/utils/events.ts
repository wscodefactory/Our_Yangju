// 행사 상태·지도 링크. 참고용 html 의 eventStatus / anyEventOn / mapUrl.
import { EVENTS } from '@/data/content';
import { daysUntil } from '@/i18n';

export type EventStatus = 'on' | 'soon' | 'done';

/** 일정 미정(tba)은 예정. 끝났으면 done, 시작했으면 on */
export function eventStatus(e: { tba?: string[]; range?: string[] }): EventStatus {
  if (e.tba || !e.range) return 'soon';
  const a = daysUntil(e.range[0]), b = daysUntil(e.range[1]);
  return b < 0 ? 'done' : a <= 0 ? 'on' : 'soon';
}

export const anyEventOn = () => EVENTS.some((e) => eventStatus(e) === 'on');

export const mapUrl = (q: string) => `https://map.naver.com/p/search/${encodeURIComponent(q)}`;
