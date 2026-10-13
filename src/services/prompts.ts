// 모델에 보내는 프롬프트 모음.
// 전부 영어로 쓴 건 모델이 지시를 더 안정적으로 따라서이고, 출력 언어는 프롬프트 안에서 따로 지정한다.
// 사용자 입력은 slice 로 길이를 자른다 — 붙여넣기 실수로 수만 자가 들어가는 것 방지.
// 프롬프트를 고치면 응답 JSON 모양도 같이 바뀌므로 types 의 DocData/ExtractedRule 과 맞춰야 한다.

/** 고지서 사진 → 구조화 (응답 타입 DocData).
 *  사진은 이미 사용자가 가린 뒤의 것이지만, 못 가린 부분이 있을 수 있어 프롬프트에서도 개인정보 출력을 한 번 더 막는다.
 *  amount_quote/due_quote 는 "원문 그대로" 를 받아서 확인 화면에서 사용자가 대조할 수 있게 한다. */
export const READ_NOTICE_PROMPT =
  'This image is a photo of a document sent by a Korean local government (likely a local tax notice or a city letter). Some personal details are covered with black boxes; never guess them. Never output personal data: names, addresses, resident/alien registration numbers, taxpayer numbers (납세번호), vehicle plates. Read only what is printed.\n' +
  'DO read these two payment identifiers if printed — they belong to the notice, not to the person: 전자납부번호 (e-payment number, 17–19 digits, may be grouped with hyphens) and 가상계좌 (virtual account: bank name + account number).\n' +
  'Reply with only JSON:\n' +
  '{"doc_type":"tax_notice|welfare_notice|other","tax_type":"auto (자동차세)|resident (주민세)|property (재산세)|income (지방소득세)|other","tax_name":{"ko":"tax name as printed, Korean"},"amount_won":number or null,"due_date":"YYYY-MM-DD" or null,"phone_on_doc":"office phone number printed on the notice, or null","epay_no":"전자납부번호 exactly as printed, or null","vacct":"bank name and virtual account number exactly as printed, or null","amount_quote":"the amount exactly as printed","due_quote":"the due date exactly as printed","confidence":"high|low"}';

/** 가릴 곳 찾기: 저해상도 사진에서 개인정보 칸의 위치만 받는다 (내용은 절대 출력하지 않게).
 *  좌표는 0~1000 정규화 [ymin, xmin, ymax, xmax]. MaskScreen 이 캔버스 픽셀로 바꿔 검은 상자를 제안한다. */
export const DETECT_PII_PROMPT =
  'This is a photo of a Korean local-government document. Find the regions that contain PERSONAL data: the taxpayer name, home address, resident/alien registration number, taxpayer number (납세번호), vehicle plate number. Do NOT include the amount, due date, e-payment number (전자납부번호), virtual account (가상계좌), office phone or any general text.\n' +
  'Never output the text itself. Reply with only JSON: {"boxes":[{"label":"name|address|id_number|tax_number|plate","box_2d":[ymin,xmin,ymax,xmax]}]} with coordinates normalized to 0-1000 of the image. Each box should cover the printed VALUE (not the label) with a little margin. If nothing is found, reply {"boxes":[]}.';

/** 공고문 → 규칙 초안 (담당자 화면, 응답 타입 ExtractedRule).
 *  핵심은 quote 필드. 모든 항목에 공고문 원문 구절을 글자 그대로 붙이게 해서,
 *  담당자 화면에서 공고문에 실제로 있는 문장인지 대조(CheckItem.found)할 수 있다.
 *  12000자 제한은 공고문 한 건이 보통 그 안에 들어와서. */
export const extractRulePrompt = (notice: string) =>
  'You turn a Korean city welfare notice into a structured rule for a citizen-facing eligibility pre-check. Use ONLY what the notice says. For every item, "quote" must be copied EXACTLY, character for character, from the notice (a short phrase, not paraphrased). Write labels and questions in Korean. Each question is a yes/no question to the citizen. Pick stage from: job(구직), work(취업), indep(독립·주거), marry(결혼), birth(임신·출산), care(육아).\n' +
  'Reply with only JSON:\n' +
  '{"name":"","stage":"indep","summary":"short Korean","who":"short Korean","when":"short Korean","conditions":[{"label":"","question":"","quote":""}],"amount":{"text":"","quote":""},"period":{"text":"","quote":""},"channel":{"type":"online|visit","where":"","quote":""},"documents":[{"name":"","quote":""}]}\n\n' +
  `Notice:\n"""${notice.slice(0, 12000)}"""`;

/** 근거 문서 기반 답변. 규칙에 안 걸린 질문에 data/knowledge.ts 문서 전체를 주고 "이 문서들 안에서만" 답하게 한다.
 *  어느 문서를 썼는지 sourceId 로 돌려받아 화면에 "근거: …" 로 표시.
 *  문서 밖 질문이면 answer 를 비우고 sourceId 를 null 로 — 그러면 "조금 더 알려 주세요 + 1345" 로 떨어진다. */
export const groundedPrompt = (question: string, docs: { id: string; title: string; text: string }[], langName: string) =>
  `You answer questions from foreign residents of Yangju, Korea, using ONLY the official documents below. Rules: if the documents cover the question, answer in ${langName} in 1-3 short sentences and cite the single most relevant document id. If they do not cover it, set "answer" to "" and "sourceId" to null. Never invent amounts, dates, phone numbers or eligibility; never give legal or tax judgments beyond the text. Reply with only JSON: {"answer":"...","sourceId":"id or null"}.\n\nDocuments:\n` +
  docs.map((d) => `[${d.id}] ${d.title}\n${d.text}`).join('\n\n') +
  `\n\nQuestion: """${question.slice(0, 600)}"""`;

/** 창구 대화 통역: 한 발화를 상대 언어로. target 은 LANGS[].en 같은 영어 언어명 ('Vietnamese', 'Korean' …).
 *  숫자·이름은 그대로 두게 해서 금액·서류명이 바뀌지 않도록 한다. */
export const translateToPrompt = (text: string, target: string) =>
  `Translate the following spoken sentence into ${target}, as a natural, polite sentence a city office counter interpreter would say. Keep numbers, dates, amounts and proper names exactly as they are. Output only the translation, nothing else.\n\n${text.slice(0, 1000)}`;
