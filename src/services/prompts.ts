// 모델에 보내는 프롬프트 모음. 원본 html 곳곳에 흩어져 있던 문자열을 한 파일로.
// 전부 영어로 쓴 건 모델이 지시를 더 안정적으로 따라서이고, 출력 언어는 프롬프트 안에서 따로 지정한다.
// 사용자 입력은 slice로 길이를 자른다 — 붙여넣기 실수로 수만 자가 들어가는 것 방지.
// 프롬프트를 고치면 응답 JSON 모양도 같이 바뀌므로 아래 GuideResult, types의 DocData/ExtractedRule과 맞춰야 한다.
import { TAX_SCENARIOS, TRANSLATE_TARGET } from '@/data/tax';
import type { CardLang } from '@/types';

/** 고지서 사진 → 구조화 (개인정보는 절대 출력하지 않도록 지시)
 *  사진은 이미 사용자가 가린 뒤의 것이지만, 못 가린 부분이 있을 수 있어 프롬프트에서도 한 번 더 막는다.
 *  amount_quote/due_quote는 "원문 그대로"를 받아서 확인 화면에서 사용자가 대조할 수 있게 한다. 응답 타입은 DocData. */
export const READ_NOTICE_PROMPT =
  'This image is a photo of a document sent by a Korean local government (likely a local tax notice or a city letter). Some personal details are covered with black boxes; never guess them. Never output personal data: names, addresses, resident/alien registration numbers, taxpayer numbers (납세번호), vehicle plates. Read only what is printed.\n' +
  'DO read these two payment identifiers if printed — they belong to the notice, not to the person: 전자납부번호 (e-payment number, usually 19 digits, may be grouped with hyphens) and 가상계좌 (virtual account: bank name + account number).\n' +
  'Reply with only JSON:\n' +
  '{"doc_type":"tax_notice|welfare_notice|other","tax_name":{"ko":"","en":"","zh":"","vi":"","ne":""},"amount_won":number or null,"due_date":"YYYY-MM-DD" or null,"phone_on_doc":"office phone number printed on the notice, or null","epay_no":"전자납부번호 exactly as printed, or null","vacct":"bank name and virtual account number exactly as printed, or null","amount_quote":"the amount exactly as printed","due_quote":"the due date exactly as printed","confidence":"high|low"}';

/** 세금 질문 → 시나리오 분류
 *  TAX_SCENARIOS의 영어 질문(q[1])을 목록으로 넘기고 id 하나만 받는다. 답변 문구는 데이터에 있는 걸 쓰므로
 *  모델은 "어느 시나리오냐"만 고르면 된다 — 세금 안내를 모델이 지어내지 않게 하려는 구조. */
export const classifyPrompt = (text: string) =>
  `A resident of Yangju, Korea asks a question about the local tax notice they received. Pick the ONE scenario id that matches the question, or "none" if nothing matches. Scenarios:\n${TAX_SCENARIOS.map((q) => `${q.id}: ${q.q[1]}`).join('\n')}\nQuestions about installments, reductions or exemptions, a wrong amount, already paid, moving or selling a car, or leaving Korea must use those ids. Reply with only JSON like {"id":"card"}.\n\nQuestion: """${text.slice(0, 600)}"""`;

/** 짧은 안내문 번역 (숫자·URL·전화번호 유지) — useTranslate의 'plain' 모드 */
export const translatePrompt = (text: string, c: CardLang) =>
  `Translate the following text into ${TRANSLATE_TARGET[c] || 'English'}. Keep numbers, dates, URLs and the phone number 1345 unchanged. Do not add anything. Output only the translation.\n\n${text}`;

/** 화면 문구 번역 (외국인 주민용, 고유명사 괄호 유지) — useTranslate의 'ui' 모드
 *  나열된 번호는 119/112(긴급), 1345(외국인종합안내), 1330(관광), 1350(고용), 1577-1366(다누리). */
export const translateUiPrompt = (text: string, c: CardLang) =>
  `Translate into ${TRANSLATE_TARGET[c]} for a foreign resident of Yangju, Korea. Plain, friendly, short. Keep numbers, dates, times, URLs, phone numbers (119, 112, 1345, 1330, 1350, 1577-1366) and Korean proper nouns in parentheses unchanged. Output only the translation.\n\n${text}`;

// 세금 질문 화면: 외국인 주민이 모국어로 적은 질문을 담당자가 읽을 한국어 메모로
export const toKoreanPrompt = (text: string) =>
  `Translate into natural, polite Korean for a city tax officer. Output only the translation.\n\n${text}`;

/** 공고문 → 규칙 초안 (담당자 화면)
 *  핵심은 quote 필드. 모든 항목에 공고문 원문 구절을 글자 그대로 붙이게 해서,
 *  담당자 화면에서 공고문에 실제로 있는 문장인지 대조(CheckItem.found)할 수 있다. 응답 타입은 ExtractedRule.
 *  12000자 제한은 공고문 한 건이 보통 그 안에 들어와서. */
export const extractRulePrompt = (notice: string) =>
  'You turn a Korean city welfare notice into a structured rule for a citizen-facing eligibility pre-check. Use ONLY what the notice says. For every item, "quote" must be copied EXACTLY, character for character, from the notice (a short phrase, not paraphrased). Write labels and questions in Korean. Each question is a yes/no question to the citizen. Pick stage from: job(구직), work(취업), indep(독립·주거), marry(결혼), birth(임신·출산), care(육아).\n' +
  'Reply with only JSON:\n' +
  '{"name":"","stage":"indep","summary":"short Korean","who":"short Korean","when":"short Korean","conditions":[{"label":"","question":"","quote":""}],"amount":{"text":"","quote":""},"period":{"text":"","quote":""},"channel":{"type":"online|visit","where":"","quote":""},"documents":[{"name":"","quote":""}]}\n\n' +
  `Notice:\n"""${notice.slice(0, 12000)}"""`;

/** 양주무관: 한 문장에서 생애 단계 추출
 *  "실제로 말한 것만" 뽑으라고 못 박은 건, 모델이 나이·소득 같은 걸 추측해서 칩으로 만들던 걸 막기 위해.
 *  단계 id 목록은 YOUTH_STAGES의 id와 같아야 한다. GuideContext에서 없는 id는 걸러내긴 함. */
export const guidePrompt = (sentence: string) =>
  'You help residents of Yangju, Korea. From the resident\'s sentence, extract only what they actually said. Youth life stages: job=구직(looking for work), work=취업(employed), indep=독립(renting/living alone/housing), marry=결혼(marriage), birth=임신·출산(pregnancy/birth), care=육아(childcare). Reply with only JSON: {"stages":["most relevant stage id first, at most 2"],"facts":[{"ko":"short Korean chip","en":"short English chip"}],"moving":true|false,"tax_notice":true|false}. tax_notice is true if they talk about a tax bill or notice they received.\n\n' +
  `Sentence: """${sentence.slice(0, 600)}"""`;

/** guidePrompt 응답. 모델이 필드를 빼먹을 수 있어 전부 optional */
export interface GuideResult {
  stages?: string[];
  facts?: { ko: string; en: string }[];
  moving?: boolean;
  tax_notice?: boolean;
}
