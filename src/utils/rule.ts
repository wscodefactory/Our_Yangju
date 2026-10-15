// 추출한 공고 규칙을 확인 목록, 원문 강조 구간, 게시 항목으로 변환한다.
import type { CheckItem, ExtractedRule, PublishedBenefit } from '@/types';

/** 조건·지원·기간·신청·서류를 확인 목록으로 만들고, 근거 문장이 원문에 있는지 표시한다. */
export function toCheckItems(rule: ExtractedRule, original: string): CheckItem[] {
  const items: Omit<CheckItem, 'found'>[] = [];
  (rule.conditions || []).forEach((condition) => items.push({ kind: '조건', text: condition.label, quote: condition.quote }));
  if (rule.amount) items.push({ kind: '지원', text: rule.amount.text, quote: rule.amount.quote });
  if (rule.period) items.push({ kind: '기간', text: rule.period.text, quote: rule.period.quote });
  if (rule.channel) items.push({ kind: '신청', text: rule.channel.where, quote: rule.channel.quote });
  (rule.documents || []).forEach((document) => items.push({ kind: '서류', text: document.name, quote: document.quote }));
  return items.map((item) => ({ ...item, found: !!(item.quote && original.includes(item.quote)) }));
}

/** 원문 조각. mark 가 있으면 <mark> 로 감싸고 번호(1부터)를 위첨자로 붙인다 */
export type HighlightPart = { text: string; mark?: number };

/** 근거 문장의 첫 위치를 순서대로 표시한다. 겹친 구간은 건너뛰고 확인 목록의 번호를 유지한다. */
export function highlightParts(text: string, items: CheckItem[]): HighlightPart[] {
  const ranges: { start: number; end: number; mark: number }[] = [];
  items.forEach((item, i) => {
    if (!item.found || !item.quote) return;
    const start = text.indexOf(item.quote);
    if (start >= 0) ranges.push({ start, end: start + item.quote.length, mark: i + 1 });
  });
  ranges.sort((a, b) => a.start - b.start);

  const parts: HighlightPart[] = [];
  let cursor = 0;
  for (const { start, end, mark } of ranges) {
    if (start < cursor) continue;
    if (start > cursor) parts.push({ text: text.slice(cursor, start) });
    parts.push({ text: text.slice(start, end), mark });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}

/** 게시 항목으로 변환한다. 누락된 요약·기간은 추출 결과의 다른 필드로 보완한다. */
export function ruleToPublished(rule: ExtractedRule): PublishedBenefit {
  return {
    name: rule.name,
    stage: rule.stage || 'indep',
    summary: rule.summary || rule.amount?.text || '',
    who: rule.who || '',
    when: rule.when || rule.period?.text || '',
    conditions: rule.conditions || [],
    documents: rule.documents || [],
    channel: rule.channel || {},
    source: 'officer',
    createdAt: Date.now(),
  };
}
