import type { Bi, CardLang, CardText, ExtractedRule, TaxScenario } from '@/types';

// 고지서(지방세) 흐름과 담당자 화면에서 쓰는 데이터.
//  - 카드 언어 목록·이름·인사말
//  - 할 일 카드 고정 문구 5개 언어
//  - 세금 질문 시나리오 (키워드 → 답)
//  - 담당자 화면용 예시 공고와 추출 결과
// 번역은 전부 팀 작성 초안이고 원어민·세정과 검수 전이다. 화면에도 그렇게 표시된다.

/* ---------- 카드 언어 ---------- */

/** 카드 언어 순서 = 언어 선택 화면 버튼 순서. ko·en 다음은 양주 외국인 주민 상위 국적(중국·베트남·네팔, 2025 집계) */
export const CARD_LANGS: CardLang[] = ['ko', 'en', 'zh', 'vi', 'ne'];
/** 각 언어의 자기 표기. 언어 선택 버튼에 그대로 씀 */
export const LANG_NAME: Record<CardLang, string> = { ko: '한국어', en: 'English', zh: '中文', vi: 'Tiếng Việt', ne: 'नेपाली' };
/** speechSynthesis 용 BCP-47 태그 */
export const SPEECH_LANG: Record<CardLang, string> = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', vi: 'vi-VN', ne: 'ne-NP' };
/** 언어 선택 화면 인사말 [인사, 안내 문장] */
export const NATIVE: Record<CardLang, [string, string]> = {
  ko: ['안녕하세요', '한국어로 안내해 드릴게요'],
  en: ['Welcome', 'We will guide you in English'],
  zh: ['您好', '我们将用中文为您服务'],
  vi: ['Xin chào', 'Chúng tôi sẽ hướng dẫn bằng tiếng Việt'],
  ne: ['नमस्ते', 'हामी नेपालीमा मार्गदर्शन गर्छौं'],
};
/** 번역 프롬프트에 넣을 언어 이름. ko/en 은 고정 문구가 다 있어서 번역이 필요 없으니 빠져 있다 */
export const TRANSLATE_TARGET: Partial<Record<CardLang, string>> = { zh: 'Chinese (Simplified)', vi: 'Vietnamese', ne: 'Nepali' };

/* ---------- 할 일 카드 문구 ---------- */

/**
 * 할 일 카드의 고정 문구. 금액·기한처럼 바뀌는 값만 AI가 읽고 나머지는 전부 여기서 나온다.
 * {n}, {a} 는 utils/format.ts 에서 치환. 네팔어·베트남어는 어순 때문에 자리표시자 위치가 다르니
 * 문구를 고칠 때 자리표시자를 빼먹지 않도록 주의.
 * src 문구에 "세정과 검수 전"이 들어 있는데 검수가 끝나면 5개 언어 모두 바꿔야 한다.
 */
export const CARD_TEXT: Record<CardLang, CardText> = {
  ko: { docIs: '당신이 받은 문서는', amount: '납부 금액', due: '납부 기한', todo: '지금 할 일', pay: '위택스에서 납부하기', ask: '추가 질문', counsel: '상담 연결', left: '{n}일 남았어요', today: '오늘이 기한이에요', over: '기한이 지났어요', src: '근거: 양주시 공식 지방세 안내 · 팀 작성 시나리오(세정과 검수 전)', ver: '금액·기한은 고지서 원본이 기준이에요', s1: '금액과 기한이 고지서와 같은지 확인해요', s2: '위택스, 또는 고지서의 QR·가상계좌로 내요', s3: '모르는 것은 내 언어로 물어봐요', speak: '읽어주기', won: '{a}원' },
  en: { docIs: 'The document you received is', amount: 'Amount to pay', due: 'Due date', todo: 'What to do now', pay: 'Pay on Wetax', ask: 'Ask a question', counsel: 'Talk to someone', left: '{n} days left', today: 'Due today', over: 'The due date has passed', src: 'Based on: Yangju City local tax guidance · team-written scenarios (not yet reviewed by the tax office)', ver: 'The original notice is the final reference for amount and date', s1: 'Check that the amount and date match your notice', s2: 'Pay on Wetax, or with the QR / virtual account on the notice', s3: 'Ask in your language if anything is unclear', speak: 'Read aloud', won: '₩{a}' },
  zh: { docIs: '您收到的文件是', amount: '应缴金额', due: '缴纳期限', todo: '现在要做的事', pay: '在Wetax缴纳', ask: '再问一个问题', counsel: '联系咨询', left: '还剩{n}天', today: '今天是最后期限', over: '已过期限', src: '依据：杨州市地方税官方指南 · 团队编写的情景（税务科审核前）', ver: '金额和期限以税单原件为准', s1: '核对金额和期限是否与税单一致', s2: '在Wetax缴纳，或用税单上的二维码/虚拟账户缴纳', s3: '不清楚的地方用您的语言提问', speak: '朗读', won: '₩{a}' },
  vi: { docIs: 'Giấy tờ bạn nhận được là', amount: 'Số tiền phải nộp', due: 'Hạn nộp', todo: 'Việc cần làm ngay', pay: 'Nộp tiền trên Wetax', ask: 'Hỏi thêm', counsel: 'Kết nối tư vấn', left: 'Còn {n} ngày', today: 'Hôm nay là hạn cuối', over: 'Đã quá hạn nộp', src: 'Căn cứ: hướng dẫn thuế địa phương của TP Yangju · kịch bản do nhóm soạn (chưa được phòng thuế duyệt)', ver: 'Bản gốc giấy báo là căn cứ cuối cùng về số tiền và ngày', s1: 'Kiểm tra số tiền và hạn nộp có khớp với giấy báo', s2: 'Nộp trên Wetax, hoặc bằng mã QR / tài khoản ảo trên giấy báo', s3: 'Nếu chưa rõ, hãy hỏi bằng ngôn ngữ của bạn', speak: 'Đọc to', won: '₩{a}' },
  ne: { docIs: 'तपाईंले पाएको कागज', amount: 'तिर्नुपर्ने रकम', due: 'तिर्ने अन्तिम मिति', todo: 'अहिले गर्नुपर्ने काम', pay: 'Wetax मा भुक्तानी', ask: 'थप प्रश्न', counsel: 'परामर्शसँग जोड्नुहोस्', left: '{n} दिन बाँकी', today: 'आज अन्तिम दिन हो', over: 'म्याद नाघिसक्यो', src: 'आधार: याङजु सहरको स्थानीय कर जानकारी · टोलीले लेखेको परिदृश्य (कर कार्यालयले जाँच गर्न बाँकी)', ver: 'रकम र मितिको अन्तिम आधार मूल बिल नै हो', s1: 'रकम र मिति बिलसँग मिल्छ कि जाँच गर्नुहोस्', s2: 'Wetax, वा बिलको QR / भर्चुअल खाताबाट तिर्नुहोस्', s3: 'नबुझेको कुरा आफ्नै भाषामा सोध्नुहोस्', speak: 'पढेर सुनाउनुहोस्', won: '₩{a}' },
};

/* ---------- 고지서 안내 문구 (프로토타입문구 확정본 2026-10-07) ---------- */

/**
 * 세정과 확정 문구. [ko, en] 쌍이고 zh/vi/ne 는 Tr/translate 로 런타임 번역.
 * 가산세는 AI 가 세액을 판정하지 않고 penalty 문구를 그대로 낸다 (TAX_SCENARIOS 'late').
 * 납부 방법 pay 는 우선순위 순서 그대로 화면에 번호 매겨 나간다 — 순서 바꾸지 말 것.
 */
export const NOTICE_TEXT = {
  penalty: ['납부기한이 지나면 3%가 더해집니다. 세목별 세액이 45만 원 이상이면 이후 매월 0.66%씩 추가됩니다(최대 60개월). 정확한 금액은 위택스에서 확인하세요.',
    'After the due date, 3% is added. If the tax for one item is 450,000 won or more, a further 0.66% is added every month (up to 60 months). Check the exact amount on Wetax.'],
  payTitle: ['납부 방법 (우선순위)', 'How to pay (in order)'],
  pay: [
    ['위택스에서 전자납부번호로 조회 후 납부 (계좌·카드·간편결제, 00:30~23:30)', 'Look up your e-payment number on Wetax and pay (bank account, card or easy pay; 00:30–23:30)'],
    ['은행 앱에서 고지서의 가상계좌번호로 이체', 'Transfer to the virtual account number on the notice from your bank app'],
    ['은행 ATM·무인공과금기에서 카드/통장 납부', 'Pay by card or bankbook at a bank ATM or self-service bill machine'],
    ['전화 ARS 142211 (계좌·카드)', 'Phone ARS 142211 (bank account or card)'],
  ],
  epayTitle: ['전자납부번호로 내는 방법', 'Paying with the e-payment number'],
  epay1: ['아래 번호를 복사하세요', 'Copy the number below'],
  epay2: ['위택스(www.wetax.go.kr) → 납부 → 납부대상조회 → 전자납부번호 탭에 붙여 넣기', 'Wetax (www.wetax.go.kr) → 납부 (Pay) → 납부대상조회 (Search) → paste into the 전자납부번호 (e-payment number) tab'],
  epay3: ["보안문자 입력 → 검색 → '보기'를 눌러 납부", "Enter the security code → Search → tap '보기' (View) to pay"],
  vacct: ['가상계좌', 'Virtual account'],
  copy: ['복사', 'Copy'],
  copied: ['복사했어요', 'Copied'],
  outOfScope: ['이 질문은 정확히 답하기 어렵습니다. ☎1345 또는 고지서의 담당 부서로 문의하세요.', 'This question is hard to answer accurately. Please contact ☎1345 or the office printed on your notice.'],
} as const satisfies Record<string, Bi | readonly Bi[]>;

/* ---------- 세금 종류 ---------- */

/** 직접 입력 화면의 세금 종류 선택지. 양주시가 다국어 안내 중인 세목 위주 */
export const TAX_KINDS = ['자동차세', '주민세', '재산세', '지방소득세', '기타 지방세'] as const;
export const TAX_NAME_EN: Record<string, string> = { 자동차세: 'Automobile tax', 주민세: 'Resident tax', 재산세: 'Property tax', 지방소득세: 'Local income tax' };
/** [vi, ne, zh] 순서. CARD_LANGS 순서와 다르니 인덱스로 꺼낼 때 주의 (ConfirmScreens 참고) */
export const TAX_NAME_MULTI: Record<string, [string, string, string]> = {
  자동차세: ['Thuế ô tô', 'सवारी कर', '汽车税'],
  주민세: ['Thuế cư trú', 'बासिन्दा कर', '居民税'],
  재산세: ['Thuế tài sản', 'सम्पत्ति कर', '财产税'],
  지방소득세: ['Thuế thu nhập địa phương', 'स्थानीय आय कर', '地方所得税'],
};

/* ---------- 질문 시나리오 ---------- */

/**
 * 세금 질문 시나리오. 팀 작성 초안, 세정과 검수 전.
 * 키워드 매칭은 위에서부터 k 로 테스트해서 처음 걸리는 것 하나(Array.find).
 * 그래서 넓은 패턴(what: /왜|why/)은 아래쪽에, 좁은 패턴(wetaxf)은 위쪽에 둔다.
 * AI가 붙어 있으면 분류를 AI에 먼저 맡기고 실패하면 이 키워드 결과로 떨어진다 (TaxQScreen.classify).
 * out 항목은 답이 없고 바로 상담 메모로 넘어간다. 감면·이의·환급처럼 금액이 바뀌는 건 전부 out.
 * 답변의 {due} {left} {amount} {tax} {phone} 은 TaxQScreen 에서 고지서 값으로 치환.
 */
export const TAX_SCENARIOS: TaxScenario[] = [
  // top: 추천 칩으로 먼저 노출
  { id: 'card', top: 1, k: /카드|card|thẻ|कार्ड/i, q: ['카드로 낼 수 있나요?', 'Can I pay by card?'], a: ['네. 위택스(wetax.go.kr), 은행·카드사 앱, 은행 ATM에서 신용·체크카드로 낼 수 있어요. 고지서에 적힌 납부 방법도 함께 확인하세요.', 'Yes. You can pay by credit or debit card on Wetax (wetax.go.kr), bank or card apps, or bank ATMs. Also check the payment methods printed on your notice.'] },
  // 납부 방법은 NOTICE_TEXT.pay 우선순위와 같은 순서로
  { id: 'where', top: 1, k: /어디|어떻게 내|where|how.*pay|ở đâu|कहाँ/i, q: ['어디서 내나요?', 'Where can I pay?'], a: ['1순위 위택스에서 전자납부번호로 조회 후 납부(계좌·카드·간편결제, 00:30~23:30), 2순위 은행 앱에서 가상계좌 이체, 3순위 은행 ATM·무인공과금기, 4순위 전화 ARS 142211이에요.', 'First, look up your e-payment number on Wetax and pay (account, card or easy pay; 00:30–23:30). Then: transfer to the virtual account from your bank app, a bank ATM or self-service bill machine, or phone ARS 142211.'] },
  { id: 'due', top: 1, k: /언제|기한|마감|when|deadline|due|hạn|मिति/i, q: ['언제까지 내야 하나요?', 'When is it due?'], a: ['이 고지서의 납부 기한은 {due}이에요. {left}', 'The due date on this notice is {due}. {left}'] },
  // 가산세: 세액 판정은 하지 않고 확정 문구(NOTICE_TEXT.penalty)를 일괄 제공
  { id: 'late', top: 1, k: /지나|늦|연체|가산|late|overdue|penalty|quá hạn|ढिला/i, q: ['기한이 지나면 어떻게 되나요?', 'What if I pay late?'], a: NOTICE_TEXT.penalty },
  { id: 'vacct', top: 1, k: /가상계좌|계좌|virtual|account|tài khoản|खाता/i, q: ['가상계좌가 뭐예요?', 'What is a virtual account?'], a: ['고지서마다 붙는 전용 계좌번호예요. 이 계좌로 {amount}을 보내면 이 세금만 납부돼요. 은행 앱의 이체에서 보낼 수 있어요.', 'It is an account number made only for this notice. Sending {amount} to it pays this tax. You can send it from your bank app.'] },
  { id: 'split', top: 1, out: 1, k: /나눠|분할|installment|split|trả góp|किस्ता/i, q: ['나눠서 낼 수 있나요?', 'Can I pay in installments?'] },

  { id: 'amount', k: /얼마|금액|how much|amount|bao nhiêu|कति/i, q: ['얼마를 내야 하나요?', 'How much do I pay?'], a: ['이 고지서의 금액은 {amount}이에요. 고지서 원본의 금액이 기준이에요.', 'The amount on this notice is {amount}. The original notice is the final reference.'] },
  // "외국인"+"위택스"가 같이 나와야 걸리게 양방향 순서를 다 적음
  { id: 'wetaxf', k: /외국인.*위택스|위택스.*외국인|foreigner.*wetax|wetax.*foreign/i, q: ['외국인도 위택스를 쓸 수 있나요?', 'Can foreigners use Wetax?'], a: ['외국인등록번호와 본인 인증 수단이 있으면 위택스를 이용할 수 있어요. 어려우면 고지서의 가상계좌나 은행 창구가 가장 쉬워요.', 'With an alien registration number and a way to verify yourself, you can use Wetax. If that is hard, the virtual account or a bank counter is easiest.'] },
  { id: 'what', k: /왜|무슨 세금|what is this|why|tại sao|किन/i, q: ['이 세금은 왜 내나요?', 'What is this tax for?'], a: ['{tax}는 양주시에 내는 지방세예요. 고지서에 적힌 과세 대상(주소지·자동차 등)에 따라 매겨져요.', '{tax} is a local tax paid to Yangju City. It is based on what is listed on your notice (your address, car, etc.).'] },
  { id: 'receipt', k: /영수증|냈는지|확인.*납부|receipt|paid\?|biên lai|रसिद/i, q: ['냈는지 확인하고 싶어요', 'How do I check it is paid?'], a: ['위택스의 납부 결과에서 확인하거나, 낸 은행에서 영수증을 받을 수 있어요.', 'Check the payment result on Wetax, or ask the bank where you paid for a receipt.'] },
  { id: 'lost', k: /잃어|분실|lost|mất|हराए/i, q: ['고지서를 잃어버렸어요', 'I lost my notice'], a: ['위택스에서 조회해서 낼 수 있어요. 어려우면 담당 부서나 가까운 행정복지센터에 문의하세요.', 'You can look it up and pay on Wetax. If that is hard, contact the office or your community service center.'] },
  // 1345 지원 언어는 확인 중이라 답변에도 그렇게 적어둠
  { id: 'interp', k: /통역|interpret|phiên dịch|दोभाषे/i, q: ['통역이 필요해요', 'I need an interpreter'], a: ['외국인종합안내센터 1345에 전화하면 여러 언어로 통역을 도와줘요. 지원 언어는 확인 중이에요.', 'Call the Immigration Contact Center at 1345 for help in many languages. Supported languages are being confirmed.'] },
  { id: 'edeliv', k: /전자|이메일|문자로|electronic|email|điện tử|इमेल/i, q: ['전자고지로 받고 싶어요', 'I want notices by phone/email'], a: ['위택스에서 전자송달을 신청하면 다음부터 휴대폰·이메일로 받을 수 있어요. 공제 혜택은 고지서 안내를 참고하세요.', 'Apply for electronic delivery on Wetax to get future notices by phone or email. See your notice for any discount.'] },
  { id: 'auto', k: /자동이체|auto|tự động/i, q: ['자동이체 할 수 있나요?', 'Can I set up auto-pay?'], a: ['위택스나 은행에서 자동이체를 신청할 수 있어요.', 'You can set up automatic payment on Wetax or at your bank.'] },
  // 1345 최우선: 고지서에 명시된 통역 전문 창구라 외국인 주민에겐 담당 부서보다 먼저 안내한다.
  // {phone} 은 고지서에서 전화번호를 읽었을 때만 " (031-...)" 식으로 채워지고 아니면 빈 문자열
  { id: 'who', k: /누구|문의|전화번호|who.*ask|contact|hỏi ai|सम्पर्क/i, q: ['누구에게 물어봐야 하나요?', 'Who do I ask?'], a: ['먼저 ☎1345(외국인종합안내센터)에 전화하세요. 고지서에 적힌 통역 전문 창구예요. 고지서 내용을 더 확인하려면 고지서의 담당 부서{phone}로 문의하세요.', 'Call ☎1345 (Immigration Contact Center) first — it is the interpreting line printed on your notice. For details of this notice, contact the office printed on it{phone}.'] },

  // 여기부터는 전부 out: 담당자 판단이 필요한 질문
  { id: 'reduce', out: 1, k: /감면|깎|면제|reduc|exempt|giảm|छुट/i, q: ['감면받을 수 있나요?', 'Can it be reduced?'] },
  { id: 'wrong', out: 1, k: /잘못|틀|이의|wrong|mistake|sai|गलत/i, q: ['금액이 잘못된 것 같아요', 'The amount looks wrong'] },
  { id: 'already', out: 1, k: /이미 냈|또 왔|already paid|đã trả|पहिल्यै/i, q: ['이미 냈는데 또 왔어요', 'I already paid but got another'] },
  { id: 'moved', out: 1, k: /이사|팔았|폐차|moved|sold|chuyển nhà|बेचे/i, q: ['이사했거나 차를 팔았어요', 'I moved or sold my car'] },
  { id: 'leave', out: 1, k: /출국|떠나|귀국|leave korea|leaving|về nước|फर्क/i, q: ['한국을 떠나요', 'I am leaving Korea'] },
];

/* ---------- 담당자 화면 예시 ---------- */

/**
 * 담당자 화면에 미리 채워지는 예시 공고. 공모전 시연용 가상 공고라 사업명·금액·부서 모두 가짜다.
 * 아래 SAMPLE_RULE 의 quote 들이 이 본문에 글자 그대로 들어 있어야 원문 대조 하이라이트가 켜진다.
 * 공고문을 고치면 quote 도 같이 고칠 것.
 */
export const SAMPLE_NOTICE = `2026년 양주시 청년 이사비 지원사업 공고 (공모전 시연용 가상 공고)

1. 지원 대상
 - 공고일 현재 양주시에 주민등록을 두고 있는 만 19세 이상 39세 이하 청년
 - 양주시로 전입한 지 1년 이내인 사람
 - 무주택자로서 가구 소득이 기준중위소득 150% 이하인 사람
2. 지원 내용: 이사 비용 실비, 1인 최대 40만원 (1회)
3. 신청 기간: 2026. 10. 5.(월) ~ 2026. 11. 30.(월) 18:00까지
4. 신청 방법: 주소지 행정복지센터 방문 신청
5. 제출 서류
 - 신청서 1부(행정복지센터 비치)
 - 주민등록등본 1부(담당자 행정정보 공동이용 동의 시 생략)
 - 임대차계약서 사본 1부
 - 이사 비용 영수증 또는 계좌이체 내역
6. 문의: 양주시청 청년 담당 부서 (가상)`;

/** AI 없이(데모 모드) 돌릴 때 SAMPLE_NOTICE 에서 뽑힌 것으로 치는 추출 결과 */
export const SAMPLE_RULE: ExtractedRule = {
  name: '청년 이사비 지원 (가상)', stage: 'indep', summary: '이사 비용 실비, 최대 40만원',
  who: '만 19~39세 · 전입 1년 이내 · 무주택 · 중위소득 150% 이하', when: '2026.10.5 ~ 11.30',
  conditions: [
    { label: '양주시 주민등록', question: '양주시에 주민등록이 되어 있나요?', quote: '공고일 현재 양주시에 주민등록을 두고 있는' },
    { label: '만 19~39세', question: '만 19~39세인가요?', quote: '만 19세 이상 39세 이하 청년' },
    { label: '전입 1년 이내', question: '양주로 전입한 지 1년이 안 됐나요?', quote: '양주시로 전입한 지 1년 이내인 사람' },
    { label: '무주택 · 중위소득 150% 이하', question: '집이 없고 가구 소득이 기준 이하인가요?', quote: '무주택자로서 가구 소득이 기준중위소득 150% 이하인 사람' },
  ],
  amount: { text: '최대 40만원', quote: '1인 최대 40만원' },
  period: { text: '2026.10.5 ~ 11.30 18:00', quote: '2026. 10. 5.(월) ~ 2026. 11. 30.(월) 18:00까지' },
  channel: { type: 'visit', where: '주소지 행정복지센터', quote: '주소지 행정복지센터 방문 신청' },
  documents: [
    { name: '신청서', quote: '신청서 1부' },
    { name: '주민등록등본(동의 시 생략)', quote: '주민등록등본 1부(담당자 행정정보 공동이용 동의 시 생략)' },
    { name: '임대차계약서 사본', quote: '임대차계약서 사본 1부' },
    { name: '이사 비용 영수증', quote: '이사 비용 영수증 또는 계좌이체 내역' },
  ],
};

/**
 * 담당자 화면 '사각지대 신호' 탭의 막대 그래프 데이터 [ko, en, %].
 * 퀴즈에서 "잘 모르겠어요"가 가장 많이 나온 조건을 보여준다는 설정의 예시 수치.
 * 실제 집계가 아니다. 서버가 붙으면 퀴즈 응답 로그에서 뽑아야 한다.
 */
export const GAP_SIGNALS: [string, string, number][] = [
  ['거주기간 1년 조건', 'Residence 1-year rule', 38],
  ['기준중위소득 150% 이하', 'Income ≤150% of median', 31],
  ['무주택 여부', 'No home owned', 17],
  ['만 19~34세', 'Age 19–34', 9],
];
