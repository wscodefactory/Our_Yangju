// 앱 전체에서 쓰는 공용 타입 모음.
// 원본 index.html에는 타입이 없었고, 데이터 객체의 키 이름(name/lv/st/what/who...)을
// 그대로 살려서 타입만 얹었다. 키 이름이 짧은 건 원본 데이터 표를 그대로 옮기기 위한 것.
// data/*.ts 가 이 타입대로 상수를 채우고, screens/* 가 읽는다.

/** [한국어, 영어] 쌍. 모든 화면 문구의 기본 단위 */
export type Bi = readonly [string, string];
/** Bi 또는 문자열 하나. 문자열이면 두 언어 공통(숫자, 고유명사 등) */
export type Text = Bi | string;

/** UI 언어. 헤더·버튼·안내문 등 화면 전체에 적용 */
export type UiLang = 'ko' | 'en';
/**
 * 카드 언어. 고지서 할 일 카드와 생활 안내처럼 "읽는 사람 모국어"가 필요한 곳에 쓴다.
 * ko/en 외 zh/vi/ne 는 양주 외국인 주민 상위 국적 기준(2025 집계). UI 언어와는 별개로 저장된다.
 */
export type CardLang = 'ko' | 'en' | 'zh' | 'vi' | 'ne';

/** 혜택 가능성 표시. high = 초록 실선, check = 주황 점선(조건 확인 필요) */
export type Likelihood = 'high' | 'check';

/** 신청 경로. online 이면 사이트 이름, visit 이면 창구 이름이 where 에 들어감 */
export interface Channel {
  t: 'online' | 'visit';
  where: Text;
}

/** 혜택 한 건. 시민 화면(item/quiz/docs/apply)의 데이터 단위 */
export interface Benefit {
  name: Bi;
  /** 시행 주체: 중앙 / 경기 / 양주 (data/benefits.ts 의 LV) */
  lv: Bi;
  st: Likelihood;
  what: Text;
  who: Text;
  when: Text;
  docs: Text[];
  ch: Channel;
  /** 예/아니오로 답하는 사전 확인 질문. 전부 "예"면 가능성 높음으로 판정 */
  quiz: Text[];
  /** 담당자 화면에서 새로 게시한 혜택이면 true. 목록에서 NEW 표시용 */
  isNew?: boolean;
}

/** 생애 단계(구직·취업·독립·결혼·...)와 그 단계의 혜택 묶음 */
export interface Stage {
  id: string;
  label: Bi;
  items: Benefit[];
}

/**
 * 청년 외 그룹의 단계 표현.
 * - { id, ref: true } : 청년 단계를 그대로 참조 (신혼→marry/birth, 육아→care)
 * - { label }         : 본선에서 채울 예정. 이름만 있고 눌러도 '곧 채워요' 화면으로 감
 */
export type StageRef = { id: string; ref: true } | { label: Bi };

/** 대상 그룹(청년/신혼·출산/육아/중장년/어르신/장애·돌봄) */
export interface Group {
  id: string;
  label: Bi;
  stages: Stage[] | StageRef[];
}

/** 양주 소개 화면의 섹션 하나. rows 가 없으면 link 로 바로 나가는 타일 */
export interface AboutSection {
  id: string;
  label: Bi;
  /** [항목명, 값] 쌍 목록 */
  rows?: [Bi, Bi][];
  /** 출처 표기 */
  src?: Bi;
  /** 섹션 하단 바로가기. 지금은 축제 섹션 → 행사 화면 하나뿐 */
  go?: 'events';
  link?: string;
}

/** 행사 상태: 진행 중 / 곧 열림 / 종료 */
export type EventStatus = 'on' | 'soon' | 'done';
export interface CityEvent {
  id: string;
  name: Bi;
  st: EventStatus;
  date: Bi;
  place: Bi;
  what: Bi;
  /** 네이버 지도 검색어 (naverMap() 에 넣음) */
  map: string;
}

/** 명소 */
export interface Place {
  name: Bi;
  what: Bi;
  map: string;
}

/** 음식점 인증 종류 (백년가게·안심식당·모범음식점) */
export interface Cert {
  name: Bi;
  by: Bi;
  what: Bi;
  /** 네이버 지도 검색어 */
  q: string;
}

/* ---------- 고지서(세금) ---------- */

/** 세금 이름. 언어별로 있을 수도 없을 수도 있어서 ko 만 필수 */
export interface TaxName {
  ko: string;
  en?: string;
  zh?: string;
  vi?: string;
  ne?: string;
}

/**
 * 고지서 읽기 결과. AI(또는 수동 입력)에서 채워진다.
 * 전부 optional 인 이유: 사진이 흐리거나 모델이 못 읽은 필드는 그냥 비워두고
 * 확인 화면에서 사용자가 고치게 하기 때문. null 은 "읽었는데 없음", undefined 는 "모름".
 */
export interface DocData {
  doc_type?: 'tax_notice' | 'welfare_notice' | 'other';
  tax_name?: TaxName;
  amount_won?: number | null;
  /** 'YYYY-MM-DD' */
  due_date?: string | null;
  phone_on_doc?: string | null;
  /** 금액을 읽어낸 원문 조각. 확인 화면에서 근거로 보여줌 */
  amount_quote?: string;
  due_quote?: string;
  confidence?: 'high' | 'low';
}

/**
 * 할 일 카드의 언어별 고정 문구. data/tax.ts 의 CARD_TEXT 가 5개 언어로 채운다.
 * left/won 에는 {n}, {a} 자리표시자가 들어 있고 utils/format.ts 에서 치환한다.
 */
export interface CardText {
  docIs: string; amount: string; due: string; todo: string; pay: string; ask: string; counsel: string;
  left: string; today: string; over: string; src: string; ver: string; s1: string; s2: string; s3: string;
  speak: string; won: string;
}

/** 세금 질문 시나리오 한 건 (키워드 매칭 → 정해진 답) */
export interface TaxScenario {
  id: string;
  /** 추천 질문 칩으로 먼저 보여줄 것 */
  top?: 1;
  /** 답하지 않는 질문. 감면·이의신청처럼 담당자 확인이 필요해서 바로 상담 연결로 보냄 */
  out?: 1;
  /** 일부만 답하고 끝에 상담 연결 버튼을 붙임 (가산세처럼 금액이 케이스별인 것) */
  partial?: 1;
  /** 질문 매칭용 정규식. 한·영·베·네 키워드를 한 패턴에 몰아넣었다 */
  k: RegExp;
  q: Bi;
  /** 답변. {due} {left} {amount} {tax} {phone} 자리표시자 포함 가능 */
  a?: Bi;
}

/* ---------- 담당자 화면(공고 → 규칙) ---------- */

/** 추출된 값 + 그 근거가 된 공고 원문 조각 */
export interface Quoted { text: string; quote: string }
/** 자격 조건 하나. question 은 시민 화면 퀴즈 문항으로 그대로 쓰인다 */
export interface Condition { label: string; question: string; quote: string }

/** 공고문에서 AI가 뽑아낸 규칙. 담당자가 체크하고 고친 뒤 게시한다 */
export interface ExtractedRule {
  name: string;
  /** 어느 생애 단계에 넣을지 (Stage.id) */
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

/**
 * 담당자가 게시한 혜택. localStorage(benefitsStore)에 이 형태로 쌓인다.
 * ExtractedRule 과 거의 같지만 quote 가 빠지고 source/createdAt 이 붙는다.
 * 시민 화면에 보일 땐 utils/rule.ts 의 publishedToBenefit 으로 Benefit 으로 바꾼다.
 */
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

/** 담당자 확인 목록의 한 줄. found = 원문에서 quote 를 실제로 찾았는지 */
export interface CheckItem { kind: string; text: string; quote?: string; found: boolean }

/* ---------- 시청 민원 / 생활 ---------- */

export type TaskIcon = 'home' | 'id' | 'health' | 'kid' | 'car' | 'other';

/** 시청·주민센터 민원 한 건 (이사 신고, 외국인등록 등) */
export interface CivicTask {
  id: string;
  name: Bi;
  icon: TaskIcon;
  where: Bi;
  when: Bi;
  docs: Bi[];
  /** 창구 직원에게 그대로 보여줄 한국어 문장. 번역하지 않고 늘 한국어로 둔다 */
  say: string;
  /** 근거 법령·안내. 비어 있을 수 있음 */
  src: string;
}

/** 생활 안내 주제 (긴급전화, 쓰레기, 아플 때, ...) */
export interface LifeTopic {
  id: string;
  name: Bi;
  /** 전화번호 표: [번호, 한국어 설명, 영어 설명] */
  rows?: [string, string, string][];
  /** 팁 목록 */
  tips?: Bi[];
  /** rows/tips 없이 다른 섹션으로 보내는 타일 */
  go?: 'welfare';
}

/* ---------- 화면(내비게이션 스택) ---------- */

/**
 * 내비게이션 스택의 한 칸. k 가 화면 종류이고 나머지는 그 화면이 필요로 하는 파라미터.
 * 원본에선 go('item', {s, i}) 식으로 객체를 push 했는데 그걸 유니온으로 옮긴 것.
 * ScreenRouter 가 k 를 보고 컴포넌트를 고른다.
 *
 * 파라미터 약자: g=그룹 id, s=단계 id, i=단계 안 인덱스, l=단계 라벨(예정 화면),
 *               e=행사 id, q=상담 질문, v=민원/생활 주제 id
 */
export type Screen =
  | { k: 'lang' }
  | { k: 'home' }
  | { k: 'welfare' }
  | { k: 'group'; g: string }
  | { k: 'stage'; s: string }
  | { k: 'item'; s: string; i: number }
  | { k: 'quiz'; s: string; i: number }
  | { k: 'docs'; s: string; i: number }
  | { k: 'apply'; s: string; i: number }
  | { k: 'mine' }
  | { k: 'soon'; l: string }
  | { k: 'about' }
  | { k: 'aboutItem'; i: number }
  | { k: 'events' }
  | { k: 'event'; e: string }
  | { k: 'local' }
  | { k: 'places' }
  | { k: 'eats' }
  | { k: 'cert' }
  | { k: 'certItem'; i: number }
  // 고지서 흐름: doc(시작) → mask(가리기) → reading(AI 읽는 중) → confirm(확인) → card(할 일 카드)
  // manual 은 사진 없이 직접 입력, taxq 는 추가 질문, counsel 은 상담 메모
  | { k: 'doc' }
  | { k: 'mask' }
  | { k: 'reading' }
  | { k: 'confirm' }
  | { k: 'manual' }
  | { k: 'card' }
  | { k: 'taxq' }
  | { k: 'counsel'; q: string }
  // 담당자 화면. reg=공고 등록, sig=사각지대 신호
  | { k: 'admin'; tab: 'reg' | 'sig' }
  // 창구·민원·생활
  | { k: 'counter' }
  | { k: 'visit' }
  | { k: 'task'; v: string }
  | { k: 'life' }
  | { k: 'lifeitem'; v: string };

export type ScreenKey = Screen['k'];
