import type { AboutSection, Bi, Cert, CityEvent, Place } from '@/types';

// 양주 소개 · 행사 · 명소 · 맛집 데이터. 복지와 달리 "읽기만 하는" 정보라 구조가 단순하다.
// 수치와 날짜는 시안 작성 시점(2026년 가을) 기준. 출처 표기(src)는 화면 하단에 그대로 노출된다.

export const CITY_URL = 'https://www.yangju.go.kr';
export const WETAX_URL = 'https://www.wetax.go.kr';

/** 네이버 지도 검색 링크. 좌표 대신 검색어로 여는 게 데이터 유지가 쉬워서 이렇게 함 */
export const naverMap = (q: string) => 'https://map.naver.com/p/search/' + encodeURIComponent(q);

/**
 * "한눈에 보는 양주" 섹션들. rows 가 있으면 표로, link 만 있으면 외부 링크 타일로 그려진다.
 * 인구 수치는 2차 자료라 src 에 "원자료 확인 예정"이라고 적어 두었다. 본선 전에 통계연보로 맞출 것.
 */
export const ABOUT: AboutSection[] = [
  { id: 'num', label: ['숫자로 보는 양주', 'In numbers'], rows: [
    [['인구', 'Population'], ['약 29.8만 명 (2026.9)', 'About 298,000 (Sep 2026)']],
    [['외국인 주민', 'Foreign residents'], ['12,770명 · 4.29%', '12,770 · 4.29%']],
    [['인구 증가율', 'Population growth'], ['전국 1위 (2023)', 'No. 1 in Korea (2023)']],
  ], src: ['행안부 주민등록 기반 2차 자료 · 원자료 확인 예정', 'Secondary data based on MOIS records · to be verified'] },
  { id: 'hist', label: ['역사·문화', 'History'], rows: [
    [['회암사지', 'Hoeamsa Temple Site'], ['조선 왕실 사찰 터 · 세계유산 등재 추진', 'Joseon royal temple site · World Heritage bid']],
    [['양주별산대놀이', 'Yangju Byeolsandae'], ['국가무형유산 탈놀이', 'National intangible heritage mask dance']],
    [['양주관아지', 'Yangju Gwana Site'], ['조선시대 양주목 관아 터', 'Joseon-era county office site']],
  ] },
  { id: 'town', label: ['우리 동네', 'Neighborhoods'], rows: [
    [['신도시', 'New towns'], ['옥정 · 회천', 'Okjeong · Hoecheon']],
    [['읍·면', 'Rural towns'], ['백석읍 · 은현면 · 남면 · 광적면 · 장흥면', 'Baekseok · Eunhyeon · Nam · Gwangjeok · Jangheung']],
  ] },
  { id: 'move', label: ['교통', 'Getting around'], rows: [
    [['전철', 'Subway'], ['수도권 전철 1호선', 'Seoul Metro Line 1']],
    [['똑버스', 'Ttokbus'], ['부르면 오는 수요응답형 버스', 'On-demand bus you call by app']],
  ] },
  // go: 'events' 로 아래 EVENTS 화면과 이어진다
  { id: 'fest', label: ['대표 축제', 'Signature festivals'], rows: [
    [['봄', 'Spring'], ['회암사지 왕실축제', 'Hoeamsa Royal Festival']],
    [['가을', 'Autumn'], ['천일홍 가을 페스타', 'Celosia Autumn Festa']],
  ], go: 'events' },
  { id: 'city', label: ['양주시청', 'City Hall'], link: CITY_URL },
];

/**
 * 행사 목록. st 는 시연일 기준으로 손으로 박아 둔 값이라 날짜가 지나도 안 바뀐다.
 * 홈 배너의 "10.18까지"(UI.until)도 flower 의 종료일과 맞춰 둔 것. 날짜 바꾸면 둘 다 손볼 것.
 */
export const EVENTS: CityEvent[] = [
  { id: 'flower', name: ['천일홍 가을 페스타', 'Celosia Autumn Festa'], st: 'on', date: ['2026.9.26 – 10.18', 'Sep 26 – Oct 18, 2026'], place: ['나리농원 일대 (광사동)', 'Nari Farm area (Gwangsa-dong)'], what: ['꽃밭이 곧 축제장 · 공연 · 체험 · 마켓', 'The flower field is the venue · shows, activities, market'], map: '양주 나리농원' },
  { id: 'run', name: ['천일홍 페스타 마라톤', 'Celosia Festa Marathon'], st: 'soon', date: ['2026.10.5', 'Oct 5, 2026'], place: ['나리농원 일대', 'Nari Farm area'], what: ['천일홍 가을 페스타 연계 마라톤', 'Marathon during the Celosia Festa'], map: '양주 나리농원' },
  { id: 'royal', name: ['회암사지 왕실축제', 'Hoeamsa Royal Festival'], st: 'done', date: ['2026.4.17 – 4.19', 'Apr 17 – 19, 2026'], place: ['회암사지 일원', 'Hoeamsa Temple Site'], what: ['양주 대표 전통문화 축제 · 어가행렬', 'Signature heritage festival · royal procession'], map: '양주 회암사지' },
];

/** 명소. map 은 네이버 지도 검색어라 "양주 " 접두어를 붙여 동명 장소와 안 겹치게 했다 */
export const PLACES: Place[] = [
  { name: ['회암사지·박물관', 'Hoeamsa Site & Museum'], what: ['조선 왕실 사찰 터와 박물관', 'Royal temple ruins and museum'], map: '양주 회암사지박물관' },
  { name: ['감악산 출렁다리', 'Gamaksan Suspension Bridge'], what: ['산속 흔들다리와 등산로', 'Mountain suspension bridge and trails'], map: '감악산 출렁다리' },
  { name: ['나리농원', 'Nari Farm'], what: ['계절 꽃밭 · 가을 천일홍', 'Seasonal flower fields · autumn celosia'], map: '양주 나리농원' },
  { name: ['장흥', 'Jangheung'], what: ['계곡과 미술관이 있는 관광지', 'Valleys, galleries and resorts'], map: '양주 장흥관광지' },
  { name: ['양주관아지', 'Yangju Gwana Site'], what: ['조선시대 관아 터 산책', 'Walk the Joseon-era county office site'], map: '양주관아지' },
  { name: ['별산대놀이 공연', 'Byeolsandae performance'], what: ['국가무형유산 탈놀이 관람', 'Watch the heritage mask dance'], map: '양주별산대놀이' },
];

/** 동네 맛집 화면의 지역 타일. 누르면 "양주 {동네} 맛집" 검색으로 나간다 */
export const AREAS: Bi[] = [['옥정', 'Okjeong'], ['회천', 'Hoecheon'], ['양주역', 'Yangju Stn.'], ['장흥', 'Jangheung'], ['백석', 'Baekseok'], ['광적', 'Gwangjeok']];

/** 음식점 인증 제도. 가게 목록을 직접 들고 있지 않고 q 로 지도 검색에 넘긴다 */
export const CERTS: Cert[] = [
  { name: ['백년가게', 'Centennial Shop'], by: ['중소벤처기업부', 'Ministry of SMEs and Startups'], what: ['오랜 업력과 품질을 인정받은 가게', 'Long-running shops recognized for quality'], q: '양주 백년가게' },
  { name: ['안심식당', 'Safe Restaurant'], by: ['지자체 지정', 'Local government'], what: ['덜어 먹기 · 위생 수칙을 지키는 식당', 'Serving utensils and hygiene rules kept'], q: '양주 안심식당' },
  { name: ['모범음식점', 'Model Restaurant'], by: ['지자체 지정', 'Local government'], what: ['위생 · 서비스 우수 업소', 'Excellent hygiene and service'], q: '양주 모범음식점' },
];
