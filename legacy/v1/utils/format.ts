import { CARD_TEXT } from '@/data/tax';
import type { CardLang, DocData } from '@/types';

// 고지서 할 일 카드에서 쓰는 숫자·날짜 포맷과 문구 조립.
// AI가 읽어온 DocData(금액·기한)를 사람이 읽을 문장으로 바꾸는 쪽은 전부 여기 모았다.

/** 87500 → "87,500". 통화 기호·"원"은 CARD_TEXT[lang].won 이 붙이므로 여기선 숫자만 */
export const fmtWon = (n: number | null | undefined) => Number(n || 0).toLocaleString('en-US');

/** 오늘 0시. 시각을 떼야 "며칠 남았는지"가 하루 단위로 딱 떨어진다 */
const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * 'YYYY-MM-DD' 까지 남은 일수. 음수면 이미 지남, 0이면 오늘, 입력이 없으면 null.
 * new Date(y, m-1, d) 로 로컬 자정을 만들어서 비교한다. 문자열을 바로 Date 에 넣으면 UTC 로 해석돼
 * 한국 시간대에선 하루가 밀릴 수 있어서 일부러 쪼갰다. 864e5 = 하루(ms).
 */
export const daysLeft = (ymd: string | null | undefined): number | null => {
  if (!ymd) return null;
  const [y, m, d] = ymd.split('-').map(Number);
  return Math.round((new Date(y, m - 1, d).getTime() - today().getTime()) / 864e5);
};

/** 남은 일수 → 카드 언어 문구. "85일 남았어요" / "오늘이 기한이에요" / "기한이 지났어요" 셋 중 하나 */
export const leftText = (lang: CardLang, n: number | null) =>
  n == null ? '' : n < 0 ? CARD_TEXT[lang].over : n === 0 ? CARD_TEXT[lang].today : CARD_TEXT[lang].left.replace('{n}', String(n));

/** 2026-12-31 → 2026.12.31. 고지서 표기 방식에 맞춤. 없으면 '-' */
export const dotDate = (ymd: string | null | undefined) => (ymd ? ymd.replace(/-/g, '.') : '-');

/** 카드 언어에 맞는 세금 이름. 그 언어가 없으면 영어 → 한국어 순으로 대체, 그래도 없으면 '-' */
export const taxNameFor = (doc: DocData | null, lang: CardLang) =>
  (doc?.tax_name && (doc.tax_name[lang] || doc.tax_name.en || doc.tax_name.ko)) || '-';

/**
 * 상담 연결용 한국어 메모. 사용자가 복사해서 담당 부서에 보내거나 창구에서 보여주는 용도라
 * 사용자의 카드 언어와 상관없이 항상 한국어로 만든다.
 * 질문이 비어 있으면 "(고지서 내용 확인 요청)" 으로 채워서 메모 모양은 유지.
 */
export const koNote = (doc: DocData | null, question: string) => {
  const tax = doc?.tax_name?.ko || '지방세';
  return `제목: ${tax} 고지서 관련 문의\n\n안녕하세요. 양주시에 사는 외국인 주민입니다.\n${tax} 고지서(납부기한 ${dotDate(doc?.due_date)}, 금액 ${fmtWon(doc?.amount_won)}원)와 관련해 문의드립니다.\n\n문의 내용: ${question || '(고지서 내용 확인 요청)'}\n\n한국어가 서툴러 통역(1345)과 함께 연락드릴 수 있습니다. 감사합니다.`;
};
