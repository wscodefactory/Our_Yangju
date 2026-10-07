import type { Bi, CivicTask, LifeTopic } from '@/types';

// 시청 민원 안내 · 양주 생활 안내 · 양주무관(가이드) 규칙.
// 복지 혜택과 달리 외국인 주민을 주 대상으로 쓴 데이터라 외국인등록증·1345 같은 말이 자주 나온다.
// 각 항목 src 에 "확인 필요"가 붙은 건 법령은 맞지만 양주시 실제 창구·수수료를 아직 안 맞춰본 것.

/**
 * 시청·주민센터 민원 6종. 일반 안내 수준이고 접수 창구와 준비물은 양주시 확인 후 확정.
 * say 는 창구 직원에게 화면을 보여주며 쓰는 문장이라 늘 한국어 그대로 둔다(번역 안 함).
 * 'other' 는 "다른 일로 왔어요" 범용 항목이라 src 가 비어 있다.
 */
export const TASKS: CivicTask[] = [
  { id: 'move', name: ['이사했어요 (체류지 변경신고)', 'I moved (address change report)'], icon: 'home',
    where: ['새 주소지 행정복지센터(주민센터) 또는 관할 출입국·외국인관서', 'Community service center of your new address, or the immigration office'],
    when: ['이사한 날부터 15일 이내 (등록외국인). 늦으면 과태료가 있을 수 있어요', 'Within 15 days of moving (registered foreigners). A fine may apply if late'],
    docs: [['외국인등록증', 'Alien registration card'], ['새 집 계약서(임대차계약서) 또는 거주 증명', 'New housing contract or proof of residence'], ['신고서 (창구에 있어요)', 'Report form (available at the counter)']],
    say: '저는 이사해서 체류지 변경신고를 하러 왔습니다. 외국인등록증과 임대차계약서를 가져왔습니다.',
    src: '출입국관리법 제36조 · 각 지자체 안내 기준(확인 필요: 양주시 접수 창구)' },
  { id: 'reg', name: ['외국인등록 (처음 왔어요)', 'Alien registration (I just arrived)'], icon: 'id',
    where: ['양주출입국·외국인사무소 (방문 예약 필요)', 'Yangju Immigration Office (reservation needed)'],
    when: ['입국한 날부터 90일 이내', 'Within 90 days of entering Korea'],
    docs: [['여권', 'Passport'], ['사진 1장 (3.5×4.5cm)', 'One photo (3.5×4.5cm)'], ['체류자격별 서류 (회사·학교 서류 등)', 'Documents for your visa type (employer, school, etc.)'], ['수수료', 'Fee']],
    say: '저는 외국인등록을 하러 왔습니다. 여권과 사진을 가져왔습니다.',
    src: '출입국관리법 제31조 (확인 필요: 수수료·예약 방법)' },
  { id: 'nhis', name: ['건강보험', 'Health insurance'], icon: 'health',
    where: ['국민건강보험공단 지사 (양주 관할, 확인 필요)', 'National Health Insurance Service branch (check which covers Yangju)'],
    when: ['6개월 이상 체류하면 지역가입자로 자동 가입돼요. 직장이 있으면 회사가 가입해요', 'After 6 months in Korea you are enrolled automatically. If employed, your company enrolls you'],
    docs: [['외국인등록증', 'Alien registration card'], ['고지서나 안내문이 왔다면 함께', 'Any notice you received']],
    say: '저는 건강보험에 대해 문의하러 왔습니다.',
    src: '국민건강보험법 (확인 필요: 체류자격별 예외)' },
  { id: 'kid', name: ['자녀 학교·어린이집', 'My child: school or daycare'], icon: 'kid',
    where: ['학교: 거주지 근처 학교 또는 교육지원청 / 어린이집: 행정복지센터', 'School: nearby school or the district education office / Daycare: community service center'],
    when: ['학교는 학기 시작 전, 어린이집은 상시 (대기 있을 수 있어요)', 'School before the term starts; daycare any time (there may be a waiting list)'],
    docs: [['자녀 외국인등록증 또는 여권', "Child's registration card or passport"], ['거주 증명 (계약서 등)', 'Proof of residence'], ['예방접종 기록 (있으면)', 'Vaccination records (if any)']],
    say: '저는 아이의 학교(어린이집) 입학에 대해 문의하러 왔습니다.',
    src: '확인 필요: 양주교육지원청 안내' },
  { id: 'drive', name: ['운전면허 바꾸기', "Driver's license exchange"], icon: 'car',
    where: ['도로교통공단 운전면허시험장 (의정부 등, 확인 필요)', "Driver's license examination office (e.g. Uijeongbu, check)"],
    when: ['본국 면허가 유효할 때', 'While your home-country license is valid'],
    docs: [['본국 운전면허증 + 대사관 확인 또는 아포스티유', 'Home license + embassy confirmation or apostille'], ['외국인등록증, 여권', 'Registration card, passport'], ['사진', 'Photos']],
    say: '저는 외국 운전면허를 한국 면허로 바꾸러 왔습니다.',
    src: '도로교통법 제96조 (확인 필요: 국가별 인정 여부)' },
  { id: 'other', name: ['다른 일로 왔어요', 'Something else'], icon: 'other',
    where: ['시청·행정복지센터 종합민원 창구', 'General civil service counter'],
    when: ['평일 09:00–18:00 (점심시간 확인)', 'Weekdays 09:00–18:00 (check lunch hours)'],
    docs: [['외국인등록증', 'Alien registration card']],
    say: '저는 문의할 것이 있어서 왔습니다. 통역이 필요하면 1345에 전화해 주세요.',
    src: '' },
];

/**
 * 양주에서 살기. 주제별로 rows(전화번호 표) 또는 tips(짧은 팁) 중 하나를 가진다.
 * 전화번호는 zh/vi/ne 번역을 거쳐도 그대로 남아야 해서 번역 프롬프트에 숫자 보존을 명시해 두었다(prompts.ts).
 */
export const LIFE: LifeTopic[] = [
  { id: 'sos', name: ['긴급 전화', 'Emergency numbers'], rows: [
    ['119', '불·구급차 (통역 가능)', 'Fire · ambulance (interpreting available)'],
    ['112', '경찰', 'Police'],
    ['1345', '외국인종합안내센터 (다국어)', 'Immigration Contact Center (multilingual)'],
    ['1330', '관광·생활 통역 24시간', '24-hour tourist & life interpreting'],
    ['1350', '임금·노동 상담', 'Wages & labor counseling'],
    ['1577-1366', '다누리콜 (다문화가족, 13개 언어)', 'Danuri Call (multicultural families, 13 languages)'],
  ] },
  { id: 'trash', name: ['쓰레기 버리기', 'Taking out trash'], tips: [
    ['일반 쓰레기는 양주시 종량제 봉투에만 (편의점·마트에서 구매)', 'General waste only in official Yangju bags (sold at convenience stores and marts)'],
    ['음식물 쓰레기는 따로, 전용 봉투 또는 수거함', 'Food waste separately, in a food-waste bag or bin'],
    ['재활용은 플라스틱·종이·캔·유리로 나눠서', 'Recycling sorted: plastic, paper, cans, glass'],
    ['큰 가구·가전은 스티커를 사서 붙여요 (행정복지센터·온라인)', 'Large furniture/appliances need a paid sticker (center or online)'],
    ['버리는 요일은 동네마다 달라요 (확인 필요)', 'Collection days differ by neighborhood (check)'],
  ] },
  { id: 'med', name: ['아플 때', 'When you are sick'], tips: [
    ['가벼운 증상: 동네 의원 → 약국', 'Mild symptoms: local clinic → pharmacy'],
    ['밤·주말: 119에 전화하면 가까운 응급실을 알려줘요', 'Night/weekend: call 119 for the nearest emergency room'],
    ['외국인등록증과 건강보험증(또는 번호)을 가져가세요', 'Bring your registration card and health insurance card (or number)'],
    ['통역: 1345 또는 1330', 'Interpreting: 1345 or 1330'],
  ] },
  { id: 'bus', name: ['버스·똑버스', 'Bus & Ttokbus'], tips: [
    ['교통카드(편의점) 또는 신용카드로 탑승', 'Pay with a transit card (convenience store) or credit card'],
    ['읍·면 지역은 똑버스: 앱으로 부르는 버스', 'In rural towns use Ttokbus, an on-demand bus you call by app'],
    ['전철 1호선: 양주역·덕계역·덕정역', 'Subway Line 1: Yangju, Deokgye, Deokjeong stations'],
  ] },
  { id: 'work', name: ['일할 때', 'At work'], tips: [
    ['임금을 못 받았으면 1350 (고용노동부)', 'Unpaid wages: call 1350 (Ministry of Labor)'],
    ['다쳤으면 산재 신청이 가능해요. 회사가 아니라 근로복지공단에', "If injured at work you can claim industrial accident insurance, through the Workers' Compensation service"],
    ['외국인노동자지원센터·외국인복지센터에서 상담 (확인 필요: 양주 센터)', 'Counseling at foreign worker support centers (check: Yangju center)'],
  ] },
  // 마지막 타일은 복지 섹션으로 보내는 링크
  { id: 'benefit', name: ['받을 수 있는 지원', 'Support I may get'], go: 'welfare' },
];

/* ---------- 양주무관 ---------- */

/** 입력창 위에 뜨는 추천 문장. 각각 GUIDE_RULES 의 indep / marry(+이사) / birth 에 걸리도록 골랐다 */
export const GUIDE_SUGGESTIONS: Bi[] = [
  ['월세 살고 취업 준비 중이에요', 'I rent a room and I am looking for a job'],
  ['내년에 결혼하고 옥정으로 이사가요', 'I am getting married and moving to Okjeong'],
  ['아기가 곧 태어나요', 'My baby is due soon'],
];

/**
 * AI 미연결(데모 모드)일 때 쓰는 키워드 규칙: [정규식, 단계 id, "이해한 내용" 칩 문구].
 * 걸리는 규칙을 전부 모아서 칩으로 보여주고, 이동할 단계는 첫 번째 매칭 하나라 배열 순서가 곧 우선순위다.
 * 한국어와 영어 키워드를 한 패턴에 섞어 두었다. 'due' 는 출산 예정일 뜻으로 birth 에 넣었는데
 * 세금 기한(due date) 얘기와 겹칠 수 있다. AI가 붙은 경우엔 tax_notice 로 따로 분류돼서 고지서 흐름으로 보내지만
 * 규칙 경로에선 그냥 birth 로 간다. 알고는 있는 한계.
 */
export const GUIDE_RULES: [RegExp, string, Bi][] = [
  [/월세|원룸|자취|독립|rent|room|alone|live by myself/i, 'indep', ['월세 · 혼자 거주', 'Renting · living alone']],
  [/취업 ?준비|구직|일자리|백수|취준|looking for (a )?job|job ?seek|unemploy|no job/i, 'job', ['미취업', 'Job seeking']],
  [/회사|직장|취업했|재직|i work|employed|my company|office job/i, 'work', ['재직 중', 'Employed']],
  [/결혼|신혼|예비부부|marr|wedding|newlywed|engaged/i, 'marry', ['결혼 예정', 'Getting married']],
  [/임신|출산|태어|아기|출생|pregnan|baby|birth|due/i, 'birth', ['임신·출산', 'Pregnancy & birth']],
  [/육아|어린이집|아이|자녀|daycare|child|kid/i, 'care', ['자녀 양육', 'Raising a child']],
];

/** 이사·전입 언급 감지. 걸리면 "양주 혜택은 전입일부터 계산" 안내를 한 줄 덧붙인다 */
export const MOVING_RE = /옥정|이사|전입|mov(e|ing)|okjeong/i;
