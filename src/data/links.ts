// 공식 사이트·전화·지도 안내 (2차 개선점검 3.6 안내 보강). 화면별로 한 줄씩 붙는 바로가기.
// 번호·주소는 점검 보고서와 공개 누리집에 적힌 것만 쓴다. 모르는 번호는 넣지 않는다.
import type { T5 } from './content';
import { mapUrl } from '@/utils/events';

export const CITY_URL = 'https://www.yangju.go.kr';
export const HIKOREA_URL = 'https://www.hikorea.go.kr';
/** 가까운 행정복지센터 (네이버 지도 검색) */
export const CENTER_MAP = mapUrl('양주시 행정복지센터');

export interface LinkRow {
  label: T5;
  href?: string;
  /** 전화번호. 있으면 tel: 링크 */
  tel?: string;
}

/** 시청·주민센터 업무별 공식 안내 */
export const VISIT_LINKS: Record<string, LinkRow[]> = {
  move: [{ label: ['하이코리아 (체류지 변경 신고 안내)', 'HiKorea (address change guide)', 'HiKorea（居留地变更申报指南）', 'HiKorea (hướng dẫn báo đổi nơi cư trú)', 'HiKorea (ठेगाना परिवर्तन सूचना गाइड)'], href: HIKOREA_URL }],
  reg: [{ label: ['하이코리아 (출입국 방문 예약)', 'HiKorea (immigration office reservation)', 'HiKorea（出入境办事处预约）', 'HiKorea (đặt lịch văn phòng xuất nhập cảnh)', 'HiKorea (अध्यागमन कार्यालय बुकिङ)'], href: HIKOREA_URL }],
  nhis: [{ label: ['국민건강보험 외국어 상담 033-811-2000', 'National Health Insurance foreign-language line 033-811-2000', '国民健康保险外语咨询 033-811-2000', 'Tổng đài ngoại ngữ Bảo hiểm y tế 033-811-2000', 'राष्ट्रिय स्वास्थ्य बीमा विदेशी भाषा लाइन 033-811-2000'], tel: '033-811-2000' }],
  drive: [{ label: ['도로교통공단 고객센터 1577-1120', 'Korea Road Traffic Authority 1577-1120', '道路交通公团客服 1577-1120', 'Tổng đài Cơ quan Giao thông đường bộ 1577-1120', 'सडक यातायात प्राधिकरण 1577-1120'], tel: '1577-1120' }],
  kid: [{ label: ['동두천양주교육지원청 위치', 'Dongducheon-Yangju Office of Education (map)', '东豆川杨州教育支援厅位置', 'Phòng Giáo dục Dongducheon-Yangju (bản đồ)', 'दोङदुचन-याङ्जु शिक्षा कार्यालय (नक्सा)'], href: mapUrl('동두천양주교육지원청') }],
  other: [{ label: ['양주시 누리집', 'Yangju City website', '杨州市官网', 'Trang web thành phố Yangju', 'याङ्जु सहरको वेबसाइट'], href: CITY_URL }],
};

/** 생활 정보별 안내 */
export const LIFE_LINKS: Record<string, LinkRow[]> = {
  med: [
    { label: ['가까운 약국 지도', 'Nearby pharmacies (map)', '附近药店地图', 'Hiệu thuốc gần đây (bản đồ)', 'नजिकको फार्मेसी (नक्सा)'], href: mapUrl('양주 약국') },
    { label: ['응급실 지도', 'Emergency rooms (map)', '急诊室地图', 'Phòng cấp cứu (bản đồ)', 'आकस्मिक कक्ष (नक्सा)'], href: mapUrl('양주 응급실') },
  ],
  bus: [{ label: ['똑버스는 \'똑타\' 앱으로 부릅니다', 'Call a Ttokbus with the Ttokta app', '通过“똑타”APP 呼叫 Ttok 巴士', 'Gọi Ttokbus bằng ứng dụng Ttokta', 'टकबस बोलाउन Ttokta एप प्रयोग गर्नुहोस्'] }],
  work: [{ label: ['산재 문의: 근로복지공단 1588-0075', 'Work injury: Workers\' Compensation Service 1588-0075', '工伤咨询：劳动福利公团 1588-0075', 'Tai nạn lao động: Cơ quan Phúc lợi Lao động 1588-0075', 'कार्यस्थल चोट: श्रमिक कल्याण सेवा 1588-0075'], tel: '1588-0075' }],
  trash: [{ label: ['배출 요일 문의: 양주시 누리집', 'Collection days: Yangju City website', '投放日期咨询：杨州市官网', 'Ngày thu gom: trang web thành phố Yangju', 'सङ्कलन दिन: याङ्जु सहरको वेबसाइट'], href: CITY_URL }],
};

/** 혜택 신청 사이트. 신청처 이름(ch.where 한국어)에 이 글자가 들어 있으면 링크를 붙인다 */
export const APPLY_SITES: { match: string; label: T5; href: string }[] = [
  { match: '고용24', label: ['고용24 바로가기', 'Open Work24', '打开雇佣24', 'Mở Work24', 'Work24 खोल्नुहोस्'], href: 'https://www.work24.go.kr' },
  { match: '복지로', label: ['복지로 바로가기', 'Open Bokjiro', '打开福祉路', 'Mở Bokjiro', 'Bokjiro खोल्नुहोस्'], href: 'https://www.bokjiro.go.kr' },
  { match: '주택도시기금', label: ['주택도시기금 바로가기', 'Open Housing & Urban Fund', '打开住宅城市基金', 'Mở Quỹ Nhà ở và Đô thị', 'आवास तथा सहरी कोष खोल्नुहोस्'], href: 'https://nhuf.molit.go.kr' },
];

/** 동네별 맛집 (네이버 지도 검색). 이름은 고유명사라 로마자 표기 */
export const FOOD_AREAS: { q: string; name: T5 }[] = [
  { q: '옥정 맛집', name: ['옥정', 'Okjeong', '玉井', 'Okjeong', 'ओक्जङ'] },
  { q: '회천 맛집', name: ['회천', 'Hoecheon', '桧泉', 'Hoecheon', 'होइचन'] },
  { q: '양주역 맛집', name: ['양주역', 'Yangju Station', '杨州站', 'Ga Yangju', 'याङ्जु स्टेसन'] },
  { q: '백석 맛집', name: ['백석', 'Baekseok', '白石', 'Baekseok', 'बेक्सक'] },
  { q: '광적 맛집', name: ['광적', 'Gwangjeok', '广积', 'Gwangjeok', 'ग्वाङ्जक'] },
];
