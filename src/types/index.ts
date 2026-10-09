// 앱 전체에서 쓰는 공용 타입.
// 시민 화면의 콘텐츠·문구는 data/content.ts 의 다섯 칸 배열(T5)이 기본 단위이고,
// 아래 Bi/Text 와 담당자 화면용 타입은 #admin 경로(공고 → 규칙 등록)에서만 쓴다.

/** [한국어, 영어] 쌍. 담당자 화면 전용 */
export type Bi = readonly [string, string];
export type Text = Bi | string;

/* ---------- 고지서 ---------- */

/** 세목 키. data/content.ts 의 TAX_TYPES 키와 같다 */
export type TaxType = 'auto' | 'resident' | 'property' | 'income' | 'other';

/**
 * 고지서 한 장의 정보. 샘플(SAMPLE)·직접 입력·AI 읽기 결과가 모두 이 모양으로 모여
 * docConfirm → docResult 화면이 본다. amountQ/dueQ 는 고지서 원문 표기(외국어 화면에서 병기).
 */
export interface DocInfo {
  type: TaxType;
  amount: number;
  /** 'YYYY-MM-DD' */
  due: string;
  /** 전자납부번호 (없으면 빈 문자열) */
  epay: string;
  /** 가상계좌 (은행명 + 번호) */
  vacct: string;
  /** 고지서에 적힌 담당 부서 전화 */
  phone?: string;
  amountQ?: string | null;
  dueQ?: string | null;
  /** 샘플 고지서로 시작했으면 true (제목에 "(샘플)" 표시, 원본 보기 시트) */
  sample?: boolean;
  /** 직접 입력으로 시작했으면 true. 사진·가리기 단계가 없으니 단계 표시를 숨긴다 */
  manual?: boolean;
  /** AI 가 읽은 결과의 확신도. low 면 확인 화면에서 주의 문구 */
  confidence?: 'high' | 'low';
}

/**
 * Gemini 가 고지서 사진에서 돌려주는 JSON (services/prompts.ts READ_NOTICE_PROMPT).
 * 모델이 필드를 빼먹을 수 있어 전부 optional. ReadingScreen 이 DocInfo 로 바꾼다.
 */
export interface DocData {
  doc_type?: 'tax_notice' | 'welfare_notice' | 'other';
  tax_type?: TaxType;
  tax_name?: { ko: string; en?: string; zh?: string; vi?: string; ne?: string };
  amount_won?: number | null;
  due_date?: string | null;
  phone_on_doc?: string | null;
  epay_no?: string | null;
  vacct?: string | null;
  amount_quote?: string;
  due_quote?: string;
  confidence?: 'high' | 'low';
}

/* ---------- 담당자 화면(공고 → 규칙) ---------- */

export interface Quoted { text: string; quote: string }
export interface Condition { label: string; question: string; quote: string }

export interface ExtractedRule {
  name: string;
  stage: string;
  summary: string;
  who: string;
  when: string;
  conditions: Condition[];
  amount?: Quoted;
  period?: Quoted;
  channel?: { type: 'online' | 'visit'; where: string; quote?: string };
  documents: { name: string; quote?: string }[];
}

/** 담당자가 게시한 혜택. localStorage(benefitsStore)에 이 형태로 쌓이고, 복지 화면 목록 끝에 한국어로 붙는다 */
export interface PublishedBenefit {
  id?: string;
  name: string;
  stage: string;
  summary: string;
  who: string;
  when: string;
  conditions: Condition[];
  documents: { name: string; quote?: string }[];
  channel: { type?: 'online' | 'visit'; where?: string };
  source: 'officer';
  createdAt: number;
}

export interface CheckItem { kind: string; text: string; quote?: string; found: boolean }

/* ---------- 화면(내비게이션 스택) ---------- */

/**
 * 내비게이션 스택의 한 칸. k 가 화면 종류. 참고용 html 의 SCREENS 키와 같고,
 * 사진 읽기 경로(mask → reading)만 React 쪽에 추가로 있다.
 */
export type Screen =
  | { k: 'lang' }
  | { k: 'home' }
  | { k: 'visit' }
  | { k: 'visitItem'; id: string }
  // 고지서: doc(시작) → [사진: mask → reading] → docConfirm → docResult
  | { k: 'doc' }
  | { k: 'mask' }
  | { k: 'reading' }
  | { k: 'docConfirm'; manual?: boolean }
  | { k: 'docResult' }
  | { k: 'life' }
  | { k: 'lifeItem'; id: string }
  /** g/s 가 있으면 그 그룹·단계를 펼친 채로 연다 (양주무관 추천) */
  | { k: 'welfare'; g?: string; s?: string }
  | { k: 'benefit'; id: string }
  | { k: 'saved' }
  | { k: 'explore'; tab?: 'events' | 'places' | 'food' | 'about' }
  // 담당자 화면. 시민 홈에서는 안 보이고 #admin 으로만 들어온다
  | { k: 'admin'; tab: 'reg' | 'sig' }
  | { k: 'counter' };

export type ScreenKey = Screen['k'];
