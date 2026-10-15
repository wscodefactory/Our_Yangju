// 기능별 요청 지시문. 응답 필드를 바꿀 때는 DocData·ExtractedRule 타입과 호출부도 함께 확인한다.

/** 가린 고지서의 항목과 금액·기한 원문 표기를 추출한다. */
export const READ_NOTICE_PROMPT =
  'This image is a photo of a document sent by a Korean local government (likely a local tax notice or a city letter). Some personal details are covered with black boxes; never guess them. Never output personal data: names, addresses, resident/alien registration numbers, taxpayer numbers (납세번호), vehicle plates. Read only what is printed.\n' +
  'DO read these two payment identifiers if printed — they belong to the notice, not to the person: 전자납부번호 (e-payment number, 17–19 digits, may be grouped with hyphens) and 가상계좌 (virtual account: bank name + account number).\n' +
  'Reply with only JSON:\n' +
  '{"doc_type":"tax_notice|welfare_notice|other","tax_type":"auto (자동차세)|resident (주민세)|property (재산세)|income (지방소득세)|other","tax_name":{"ko":"tax name as printed, Korean"},"amount_won":number or null,"due_date":"YYYY-MM-DD" or null,"phone_on_doc":"office phone number printed on the notice, or null","epay_no":"전자납부번호 exactly as printed, or null","vacct":"bank name and virtual account number exactly as printed, or null","amount_quote":"the amount exactly as printed","due_quote":"the due date exactly as printed","confidence":"high|low"}';

/** 개인정보 내용 대신 위치만 요청한다. 좌표 순서는 [ymin, xmin, ymax, xmax], 범위는 0~1000이다. */
export const DETECT_PII_PROMPT =
  'This is a photo of a Korean local-government document. Find the regions that contain PERSONAL data: the taxpayer name, home address, resident/alien registration number, taxpayer number (납세번호), vehicle plate number. Do NOT include the amount, due date, e-payment number (전자납부번호), virtual account (가상계좌), office phone or any general text.\n' +
  'Never output the text itself. Reply with only JSON: {"boxes":[{"label":"name|address|id_number|tax_number|plate","box_2d":[ymin,xmin,ymax,xmax]}]} with coordinates normalized to 0-1000 of the image. Each box should cover the printed VALUE (not the label) with a little margin. If nothing is found, reply {"boxes":[]}.';

/** 공고 규칙과 원문 그대로의 근거를 요청한다. 입력은 최대 12,000자다. */
export const extractRulePrompt = (notice: string) =>
  'You turn a Korean city welfare notice into a structured rule for a citizen-facing eligibility pre-check. Use ONLY what the notice says. For every item, "quote" must be copied EXACTLY, character for character, from the notice (a short phrase, not paraphrased). Write labels and questions in Korean. Each question is a yes/no question to the citizen. Pick stage from: job(구직), work(취업), indep(독립·주거), marry(결혼), birth(임신·출산), care(육아).\n' +
  'Reply with only JSON:\n' +
  '{"name":"","stage":"indep","summary":"short Korean","who":"short Korean","when":"short Korean","conditions":[{"label":"","question":"","quote":""}],"amount":{"text":"","quote":""},"period":{"text":"","quote":""},"channel":{"type":"online|visit","where":"","quote":""},"documents":[{"name":"","quote":""}]}\n\n' +
  `Notice:\n"""${notice.slice(0, 12000)}"""`;

/** 내장 자료를 근거로 답변과 sourceId를 받는다. 자료에 없는 질문은 빈 답변을 요청한다. */
export const groundedPrompt = (question: string, docs: { id: string; title: string; text: string }[], langName: string) =>
  `You answer questions from foreign residents of Yangju, Korea, using ONLY the official documents below. Rules: if the documents cover the question, answer in ${langName} in 1-3 short sentences and cite the single most relevant document id. If they do not cover it, set "answer" to "" and "sourceId" to null. Never invent amounts, dates, phone numbers or eligibility; never give legal or tax judgments beyond the text. Reply with only JSON: {"answer":"...","sourceId":"id or null"}.\n\nDocuments:\n` +
  docs.map((d) => `[${d.id}] ${d.title}\n${d.text}`).join('\n\n') +
  `\n\nQuestion: """${question.slice(0, 600)}"""`;

/** 창구 발화를 상대 언어로 옮긴다. 숫자·날짜·고유명사는 유지하도록 요청한다. */
export const translateToPrompt = (text: string, target: string) =>
  `Translate the following spoken sentence into ${target}, as a natural, polite sentence a city office counter interpreter would say. Keep numbers, dates, amounts and proper names exactly as they are. Output only the translation, nothing else.\n\n${text.slice(0, 1000)}`;
