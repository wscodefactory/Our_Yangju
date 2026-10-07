import { LV } from '@/data/benefits';
import type { Benefit, CheckItem, ExtractedRule, PublishedBenefit } from '@/types';

// 담당자 화면(공고 → 규칙 → 게시) 데이터 변환.
// 공고문에서 뽑은 ExtractedRule 을 (1) 담당자가 체크할 목록으로 펼치고, (2) 원문 하이라이트 조각으로 자르고,
// (3) 게시용 PublishedBenefit 으로, (4) 다시 시민 화면의 Benefit 으로 바꾼다.
// 전부 순수 함수. (1)(2)(3)은 RegisterPanel 이, (4)는 AppContext 가 게시 혜택을 단계에 합칠 때 부른다.

/**
 * 추출 결과를 "조건 / 지원 / 기간 / 신청 / 서류" 순서의 확인 항목 목록으로 펼친다.
 * found 는 quote 가 공고 원문에 글자 그대로 있는지. 모델이 원문에 없는 문장을 지어냈으면 false 가 되고
 * 화면에서 "원문에서 못 찾음" 으로 표시돼 담당자가 한 번 더 보게 된다.
 * conditions/documents 에 `|| []` 가 붙어 있는 건 모델 응답에 배열이 통째로 빠질 때가 있어서.
 */
export function toCheckItems(rule: ExtractedRule, original: string): CheckItem[] {
  const out: Omit<CheckItem, 'found'>[] = [];
  (rule.conditions || []).forEach((c) => out.push({ kind: '조건', text: c.label, quote: c.quote }));
  if (rule.amount) out.push({ kind: '지원', text: rule.amount.text, quote: rule.amount.quote });
  if (rule.period) out.push({ kind: '기간', text: rule.period.text, quote: rule.period.quote });
  if (rule.channel) out.push({ kind: '신청', text: rule.channel.where, quote: rule.channel.quote });
  (rule.documents || []).forEach((d) => out.push({ kind: '서류', text: d.name, quote: d.quote }));
  return out.map((item) => ({ ...item, found: !!(item.quote && original.includes(item.quote)) }));
}

/** 원문 조각. mark 가 있으면 <mark> 로 감싸고 번호(1부터)를 위첨자로 붙인다 */
export type HighlightPart = { text: string; mark?: number };

/**
 * 공고 원문을 [일반 텍스트, 하이라이트, 일반 텍스트, ...] 조각으로 나눈다.
 * found 인 항목만 대상으로, 각 quote 가 원문에서 처음 나오는 위치를 찾아 시작 위치순으로 정렬한 뒤
 * 앞에서부터 잘라 나간다. 겹치는 구간(s < cursor)은 뒤에 온 쪽을 버린다 — 중첩 mark 는 그리기 복잡하고
 * 어차피 같은 문장을 두 항목이 근거로 쓰는 경우라 하나만 표시해도 충분.
 * mark 번호는 items 의 인덱스 + 1 이라 체크 목록의 번호와 일치한다.
 */
export function highlightParts(text: string, items: CheckItem[]): HighlightPart[] {
  // [시작, 끝, 항목 인덱스]
  const ranges: [number, number, number][] = [];
  items.forEach((item, i) => {
    if (!item.found || !item.quote) return;
    const start = text.indexOf(item.quote);
    ranges.push([start, start + item.quote.length, i]);
  });
  ranges.sort((a, b) => a[0] - b[0]);

  const parts: HighlightPart[] = [];
  let cursor = 0;
  ranges.forEach(([start, end, i]) => {
    if (start < cursor) return; // 앞 구간과 겹침 → 건너뜀
    if (start > cursor) parts.push({ text: text.slice(cursor, start) });
    parts.push({ text: text.slice(start, end), mark: i + 1 });
    cursor = end;
  });
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}

/**
 * 추출 규칙 → 게시 레코드. 빈 필드는 가능한 대체값으로 채운다
 * (summary 없으면 금액 문구, when 없으면 기간 문구, stage 없으면 '독립').
 * id 는 지금 아무 데서도 안 채운다(optional). 서버가 생기면 서버가 발급하는 걸 상정.
 */
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

/**
 * 담당자가 게시한 혜택 → 시민 화면의 Benefit.
 * 게시 데이터는 한국어뿐이라 name 을 [ko, en] 양쪽에 같은 값으로 넣는다 (영어 UI 에서도 한국어로 보임. 번역은 TODO).
 * 시행 주체는 무조건 양주시, 가능성은 'check' 고정 — 담당자가 올린 건 아직 검증 안 된 규칙이라는 뜻.
 * quiz 는 조건의 question 을 쓰되 없으면 label 로 대체하고, 화면이 길어지지 않게 6개까지만.
 * documents 의 typeof 분기는 예전 저장 형식(문자열 배열)이 localStorage 에 남아 있을 수 있어서 둔 것.
 */
export function publishedToBenefit(pub: PublishedBenefit): Benefit {
  return {
    name: [pub.name, pub.name],
    lv: LV.Y,
    st: 'check',
    what: pub.summary || '',
    who: pub.who || '',
    when: pub.when || '',
    docs: (pub.documents || []).map((doc) => (typeof doc === 'string' ? doc : doc.name)),
    ch: { t: pub.channel?.type === 'online' ? 'online' : 'visit', where: pub.channel?.where || '행정복지센터' },
    quiz: (pub.conditions || []).map((c) => c.question || c.label).filter(Boolean).slice(0, 6),
    isNew: true,
  };
}
