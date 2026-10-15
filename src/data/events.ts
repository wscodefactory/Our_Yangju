// 수집한 행사 목록을 우선 사용하고, 목록이 비어 있으면 기본 콘텐츠로 대체한다.
import { EVENTS as STATIC_EVENTS, type T5 } from '@/data/content';
import cityEvents from '@/data/events.json';

export type CityEvent = {
  id: string;
  range?: string[];
  tba?: T5;
  map: string;
  url?: string;      // 양주시 누리집 원문 (수집한 행사만)
  name: T5;
  place: T5;
  what: T5;
  draft?: boolean;   // 번역이 안 된 수집 행사 (다섯 칸 모두 한국어)
  fetchedAt?: string;
};

export const EVENTS: CityEvent[] = cityEvents.length ? cityEvents : STATIC_EVENTS;
