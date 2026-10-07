import type { Bi } from '@/types';

// 화면 공통 문구 사전. 원본 html 의 UI 객체를 그대로 옮긴 것이라 키 이름도 원본 그대로다.
// 쓰는 쪽에서는 pick(UI.xxx, lang) 또는 AppContext 의 t('xxx') 로 꺼낸다.
// 특정 화면 전용 문구(세금 카드, 민원 안내)는 여기 두지 않고 data/tax.ts, data/civic.ts 에 있다.

/**
 * [ko, en] 쌍 문구 사전.
 * 키가 많아 보기 좋게 화면별로 줄을 나눴다. 새 문구는 관련 줄 근처에 넣을 것.
 * `as const satisfies Record<string, Bi>` 로 묶어서 UiKey 자동완성이 되게 했다.
 */
export const UI = {
  // 홈 4개 문(door) 라벨
  secAbout: ['양주 소개', 'About Yangju'], secWel: ['복지 혜택', 'Welfare'], secEv: ['행사·축제', 'Events'], secLoc: ['맛집·명소', 'Food & places'],
  // 홈 상단 "지금 열리는 중" 배너. until 은 시연 기준 날짜가 박혀 있음(천일홍 페스타 종료일)
  nowOn: ['지금 열리는 중', 'Happening now'], until: ['10.18까지', 'until Oct 18'],

  // 행사·축제
  linked: ['연동', 'Linked'], evAll: ['양주시청 행사 전체', 'All city events'], evTitle: ['행사·축제', 'Events & festivals'],
  on: ['진행 중', 'Now on'], soonTag: ['곧 열려요', 'Coming up'], done: ['종료', 'Ended'],
  date: ['날짜', 'Date'], place: ['장소', 'Place'], about: ['내용', 'About'],
  naver: ['네이버 지도에서 보기', 'Open in Naver Map'], cityOrig: ['양주시청 원문 보기', 'Official notice (City Hall)'], nextYear: ['내년 일정 알림 받기 (예정)', "Get next year's date (planned)"],

  // 맛집·명소
  locTitle: ['무엇을 찾나요?', 'What are you looking for?'], places: ['명소', 'Places'], eats: ['동네 맛집', 'Local food'], cert: ['인증 음식점', 'Certified restaurants'], toFest: ['축제 보러 가기', 'Go to festivals'],
  placesT: ['양주 명소', 'Places to visit'], eatsT: ['어느 동네에서?', 'Which area?'], certT: ['어떤 인증?', 'Which certification?'],
  certBy: ['지정 기관', 'Designated by'], certWhat: ['기준', 'What it means'], certFind: ['양주에서 찾기 (네이버 지도)', 'Find in Yangju (Naver Map)'],

  // 양주 소개
  aboutT: ['한눈에 보는 양주', 'Yangju at a glance'], visitCity: ['양주시청 홈페이지', 'Yangju City website'],
  welfare: ['복지 혜택', 'Welfare'],

  // 헤더·공통 버튼
  home: ['처음으로', 'Home'], big: ['큰 글씨', 'Large text'], lang: ['언어', 'Language'], mine: ['☆ 내 혜택', '☆ Saved'],

  // 양주무관(가이드) 시트
  guide: ['양주무관에게 물어보기', 'Ask Yangju Guide'], gname: ['양주무관', 'Yangju Guide'], send: ['보내기', 'Send'],
  ph: ['예: 월세 살고 취업 준비 중이에요', 'e.g. I rent a room and I am looking for a job'],
  askLabel: ['양주무관에게 질문', 'Ask Yangju Guide'],

  // 하단 시안 고지. 이 문구는 모든 화면에 붙으니 바꿀 때 톤 주의
  demo: ['공모전 시안 · 혜택 이름과 조건은 예시이며 실제 공고로 확인이 필요합니다 · 최종 자격은 담당 기관이 판단합니다',
    'Contest prototype · Benefit names and conditions are examples · Final eligibility is decided by the responsible office'],

  // 복지: 그룹 → 단계 → 혜택
  who: ['누구의 혜택인가요?', 'Who is this for?'], stageQ: ['지금 어느 단계인가요?', 'Which stage are you in?'],
  // cnt 영어가 빈 문자열인 건 "3개" vs "3" 처럼 영어엔 단위가 안 붙어서
  now: ['지금', 'Now'], next: ['다음 단계', 'Next'], cnt: ['개', ''], later: ['본선에서', 'Coming soon'],
  // stageB 는 단계 이름 뒤에 붙는 접미사라 앞에 공백이 있음 ("독립 단계 혜택" / "Living alone benefits")
  stageB: [' 단계 혜택', ' benefits'], preview: ['결혼 미리보기', 'Preview: Marriage'],
  lgHigh: ['가능성 높음', 'Likely eligible'], lgCheck: ['확인 필요', 'Needs checking'], lgYj: ['양주시 혜택', 'Yangju City'],
  what: ['무엇을', 'What'], whom: ['누가', 'Who'], when: ['언제', 'When'],
  canI: ['받을 수 있나요?', 'Am I eligible?'], docs: ['준비물', 'Documents'], apply: ['신청하러 가기', 'How to apply'],
  star: ['☆ 내 혜택에 담기', '☆ Save to my benefits'], starred: ['★ 담았어요', '★ Saved'],

  // 사전 확인 퀴즈와 결과 (rNo/rUn/rYes = 아니오 있음 / 모름 있음 / 전부 예)
  yes: ['예', 'Yes'], no: ['아니오', 'No'], unsure: ['잘 모르겠어요', 'Not sure'], check: ['확인', 'Check'], result: ['결과', 'Result'],
  rNo: ['이 혜택은 조건이 달라요', 'This one may not fit you'], rNoS: ['대신 볼 만한 혜택이에요', 'Here are similar benefits'],
  rUn: ['한 가지만 확인하면 돼요', 'Just one thing to check'], rUnS: ['모르는 항목은 담당자에게 물어볼 수 있어요', 'You can ask the office about what you are unsure of'],
  rAsk: ['양주무관에게 정리 맡기기', 'Let Yangju Guide write the question'], docsFirst: ['준비물 먼저 보기', 'See documents first'],
  rYes: ['신청 가능성이 높아요', 'You are likely eligible'], rYesS: ['입력한 내용 기준의 사전 확인이에요. 최종 결정은 담당 기관이 해요', 'This is a pre-check based on your answers. The office makes the final decision.'],

  // 준비물 → 신청
  getDocs: ['준비물 챙기기', 'Get documents ready'], allSet: ['다 챙겼어요 → 신청', 'All set → Apply'],
  onl: ['온라인으로 신청해요', 'Apply online'], vis: ['방문해서 신청해요', 'Apply in person'], goto: ['바로가기', 'Open'], near: ['가까운 곳', 'Nearest'],
  prep: ['준비물을 옆에 두고 시작하세요', 'Keep your documents ready before you start'], hours: ['평일 09:00–18:00 (예시)', 'Weekdays 09:00–18:00 (example)'],
  bring: ['준비물 챙기기', 'Bring documents: '], askOff: ['담당자에게 물어보기', 'Ask the office'], noLink: ['시안에서는 실제 사이트로 연결하지 않아요.', 'This prototype does not link to real sites.'],

  // 내 혜택
  mineT: ['내가 담은 혜택', 'My saved benefits'], mineE: ['아직 담은 혜택이 없어요', 'Nothing saved yet'], mineES: ['혜택 화면에서 ☆를 누르면 여기에 모여요', 'Tap ☆ on a benefit to save it here'],

  // 본선 예정 화면. soon 도 앞에 공백이 있는 접미사
  soon: [' 지도는 본선에서 채워요', ' map is coming in the final round'], soonS: ['청년 지도와 같은 틀에 혜택만 더하면 됩니다', 'It uses the same frame as the Youth map'], seeYouth: ['청년 지도 보기', 'See the Youth map'],

  // 외국인 주민 안내. 한국어판은 일부러 비워둠(한국어 사용자에겐 안 보여줌)
  fr: ['', 'Foreign residents: eligibility differs by program. Many require alien registration or a set period of residence. Use "Ask the office" to confirm.'],

  back: ['뒤로', 'Back'], youth: ['청년', 'Youth'], saved: ['담음', 'Saved'],
} as const satisfies Record<string, Bi>;

/** UI 사전의 키. t('...') 자동완성용 */
export type UiKey = keyof typeof UI;
