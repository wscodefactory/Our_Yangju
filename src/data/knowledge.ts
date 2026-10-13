// AI 상담의 근거 문서 (기능 5: 공식 문서 기반 답변).
// 규칙(INTENTS)에 안 걸린 질문은 이 목록을 통째로 프롬프트에 넣고, 모델이 "어느 문서를 근거로 답했는지" id 를 같이 돌려준다.
// 출처는 「1007_유진_공개근거표」와 공개 누리집·법령만. 세정과 유선 확인 내용은 넣지 않는다.
// 문서가 20건 안팎이라 벡터 검색 없이 프롬프트에 전부 넣는다 (약 2,000 토큰).
import type { T5 } from './content';
import { CENTER_MAP, CITY_URL, EVENTS_URL, HIKOREA_URL } from './links';

export interface KnowledgeDoc {
  id: string;
  /** 화면에 "근거: …" 로 보이는 제목 */
  title: T5;
  /** 모델에게 주는 본문 (한국어) */
  text: string;
  url?: string;
  /** 답변 뒤에 붙일 이동 버튼 */
  go?: { k: 'visitItem'; id: string } | { k: 'lifeItem'; id: string } | { k: 'doc' } | { k: 'welfare'; g: string; s: string } | { k: 'explore'; tab: 'events' | 'places' | 'food' | 'about' };
}

export const KNOWLEDGE: KnowledgeDoc[] = [
  { id: 'late-penalty', title: ['지방세기본법 제55조 (납부지연가산세)', 'Framework Act on Local Taxes, Art. 55 (late-payment penalty)', '《地方税基本法》第55条（滞纳金）', 'Luật khung thuế địa phương, Điều 55 (phạt nộp chậm)', 'स्थानीय कर आधारभूत ऐन धारा 55 (ढिलो भुक्तानी जरिवाना)'],
    text: '지방세 고지서의 납부기한이 지나면 3%가 가산된다. 납세고지서별·세목별 세액이 45만 원 이상이면 이후 1개월마다 0.66%가 추가되며 최대 60개월이다. 45만 원 미만이면 매월 가산은 없다. 정확한 금액은 위택스 또는 고지서의 담당 부서에서 확인한다.', go: { k: 'doc' } },
  { id: 'wetax-lookup', title: ['위택스 납부대상조회', 'Wetax: look up what to pay', 'WeTax 缴纳对象查询', 'Tra cứu khoản nộp trên WeTax', 'WeTax भुक्तानी खोजी'],
    text: '위택스(www.wetax.go.kr)에서 납부 → 납부대상조회 → 전자납부번호(17~19자리) 입력 + 보안문자로 로그인 없이 고지 내용을 조회할 수 있다. 결제 단계에서는 본인 인증이 필요할 수 있다. 이용 시간은 00:30~23:30.', url: 'https://www.wetax.go.kr', go: { k: 'doc' } },
  { id: 'pay-methods', title: ['지방세 납부 방법', 'Ways to pay local tax', '地方税缴纳方法', 'Cách nộp thuế địa phương', 'स्थानीय कर तिर्ने तरिका'],
    text: '지방세는 (1) 은행 앱에서 고지서의 가상계좌로 이체, (2) 위택스에서 전자납부번호로 조회 후 계좌·카드·간편결제, (3) 은행 ATM·무인공과금기, (4) 전화 ARS 142211(계좌·카드, 한국어 안내)로 낼 수 있다. 고지서에 적힌 계좌로만 송금해야 하며 다른 계좌로 보내라는 문자·전화는 사기일 수 있다.', go: { k: 'doc' } },
  { id: 'interp-1345', title: ['외국인종합안내센터 1345', 'Immigration Contact Center 1345', '外国人综合咨询中心 1345', 'Trung tâm thông tin người nước ngoài 1345', 'विदेशी सूचना केन्द्र 1345'],
    text: '외국인종합안내센터 1345는 평일 09시~22시 다국어로 상담하며 통역을 도와준다. 세금·체류·생활 문의 모두 가능하다. 고지서에는 양주출입국·외국인사무소 031-828-9330도 함께 적혀 있다.', go: { k: 'lifeItem', id: 'sos' } },
  { id: 'move-report', title: ['체류지 변경 신고 (출입국관리법 제36조)', 'Report of change of residence (Immigration Act, Art. 36)', '居留地变更申报（出入境管理法第36条）', 'Báo đổi nơi cư trú (Luật Xuất nhập cảnh, Điều 36)', 'ठेगाना परिवर्तन सूचना (अध्यागमन ऐन धारा 36)'],
    text: '이사하면 새 주소지의 행정복지센터 또는 관할 출입국·외국인관서에 15일 이내에 체류지 변경 신고를 해야 한다. 늦으면 과태료가 있을 수 있다. 외국인등록증과 임대차계약서 등 거주 증명을 가져간다. 하이코리아에서 안내를 볼 수 있다.', url: HIKOREA_URL, go: { k: 'visitItem', id: 'move' } },
  { id: 'alien-reg', title: ['외국인등록 (출입국관리법 제31조)', 'Alien registration (Immigration Act, Art. 31)', '外国人登录（出入境管理法第31条）', 'Đăng ký người nước ngoài (Luật Xuất nhập cảnh, Điều 31)', 'विदेशी दर्ता (अध्यागमन ऐन धारा 31)'],
    text: '입국한 날부터 90일 이내에 양주출입국·외국인사무소에서 외국인등록을 해야 한다. 방문 예약은 하이코리아(hikorea.go.kr)에서 한다. 여권, 사진 1장(3.5×4.5cm), 체류자격별 서류, 수수료가 필요하다.', url: 'https://www.hikorea.go.kr/resv/ResvIntroR.pt', go: { k: 'visitItem', id: 'reg' } },
  { id: 'nhis', title: ['국민건강보험 외국어 상담', 'National Health Insurance foreign-language line', '国民健康保险外语咨询', 'Tổng đài ngoại ngữ Bảo hiểm y tế', 'स्वास्थ्य बीमा विदेशी भाषा लाइन'],
    text: '국민건강보험 외국어 상담 전화는 033-811-2000이다. 가입·보험료·자격 문의를 외국어로 할 수 있다.', go: { k: 'visitItem', id: 'nhis' } },
  { id: 'drive', title: ['도로교통공단 고객센터', 'Korea Road Traffic Authority', '道路交通公团客服', 'Tổng đài Cơ quan Giao thông đường bộ', 'सडक यातायात प्राधिकरण'],
    text: '운전면허 교환·발급 문의는 도로교통공단 고객센터 1577-1120. 외국 면허를 한국 면허로 바꾸려면 면허시험장에 신청한다.', go: { k: 'visitItem', id: 'drive' } },
  { id: 'trash', title: ['양주시 생활쓰레기 배출 안내', 'Yangju City household waste guide', '杨州市生活垃圾投放指南', 'Hướng dẫn đổ rác sinh hoạt TP Yangju', 'याङ्जु सहर घरायसी फोहोर गाइड'],
    text: '생활쓰레기는 종량제 봉투에 담아 정해진 요일·시간(해가 진 뒤부터 밤까지, 지역별 상이)에 집 앞에 내놓는다. 재활용품은 종류별로 나눠 배출한다. 배출 요일·시간은 양주시 누리집 생활쓰레기배출 안내 페이지에 있다.', url: `${CITY_URL}/www/contents.do?key=688`, go: { k: 'lifeItem', id: 'trash' } },
  { id: 'med', title: ['아플 때: 병원·약국·응급', 'When sick: hospitals, pharmacies, emergencies', '生病时：医院、药店、急诊', 'Khi ốm: bệnh viện, hiệu thuốc, cấp cứu', 'बिरामी हुँदा: अस्पताल, फार्मेसी, आपतकालीन'],
    text: '응급 상황은 119(구급차). 가벼운 증상은 가까운 의원·약국, 밤이나 휴일에는 응급실. 외국인등록증과 건강보험증이 있으면 보험 적용을 받는다. 통역이 필요하면 1345.', go: { k: 'lifeItem', id: 'med' } },
  { id: 'bus', title: ['양주 교통: 전철 1호선·똑버스', 'Yangju transport: Line 1 and Ttokbus', '杨州交通：地铁1号线、Ttok巴士', 'Giao thông Yangju: tuyến 1 và Ttokbus', 'याङ्जु यातायात: लाइन 1 र टकबस'],
    text: '수도권 전철 1호선 양주역·덕계역·덕정역이 있다. 똑버스는 부르면 오는 수요응답형 버스로 "똑타" 앱으로 호출한다.', go: { k: 'lifeItem', id: 'bus' } },
  { id: 'work', title: ['일터: 임금·산재 문의', 'Work: wages and workplace injury', '工作：工资、工伤咨询', 'Việc làm: lương và tai nạn lao động', 'काम: तलब र कार्यस्थल चोट'],
    text: '임금 체불은 고용노동부 1350, 산업재해는 근로복지공단 1588-0075에 문의한다. 외국인 근로자도 산재보험 적용 대상이다.', go: { k: 'lifeItem', id: 'work' } },
  { id: 'welfare-job', title: ['청년 구직·취업 지원', 'Youth job-seeking and employment support', '青年求职、就业支援', 'Hỗ trợ tìm việc, việc làm cho thanh niên', 'युवा रोजगार सहयोग'],
    text: '구직 중인 청년은 고용24(work24.go.kr)에서 구직활동 지원을 신청할 수 있다. 양주시 청년 지원 창구도 있다. 자격은 사업마다 다르므로 신청 전 조건을 확인한다.', url: 'https://www.work24.go.kr', go: { k: 'welfare', g: 'youth', s: 'job' } },
  { id: 'welfare-housing', title: ['청년 주거 지원', 'Youth housing support', '青年住房支援', 'Hỗ trợ nhà ở cho thanh niên', 'युवा आवास सहयोग'],
    text: '월세 지원·전세 대출 등 주거 지원은 복지로(bokjiro.go.kr)와 주택도시기금(nhuf.molit.go.kr)에서 신청한다. 양주시 전입 1년 이내 청년 이사비 지원 같은 시 사업은 행정복지센터에서 방문 신청한다. 외국인은 체류자격에 따라 대상이 다를 수 있다.', url: 'https://www.bokjiro.go.kr', go: { k: 'welfare', g: 'youth', s: 'indep' } },
  { id: 'welfare-birth', title: ['임신·출산·육아 지원', 'Pregnancy, birth and childcare support', '怀孕、生育、育儿支援', 'Hỗ trợ mang thai, sinh con, nuôi con', 'गर्भ, जन्म र बाल हेरचाह सहयोग'],
    text: '임신·출산 바우처, 첫만남이용권, 부모급여, 아동수당 등은 복지로 또는 주소지 행정복지센터에서 신청한다. 출생신고는 행정복지센터. 외국인 가정은 체류자격·등록 여부에 따라 대상이 다르다.', url: 'https://www.bokjiro.go.kr', go: { k: 'welfare', g: 'newly', s: 'birth' } },
  { id: 'center', title: ['행정복지센터 (주민센터)', 'Community service center', '行政福利中心', 'Trung tâm hành chính phúc lợi', 'सामुदायिक सेवा केन्द्र'],
    text: '행정복지센터(주민센터)는 평일 09:00~18:00에 열며, 전입 신고·증명서 발급·복지 신청을 받는다. 가까운 센터는 지도에서 찾는다. 통역이 필요하면 1345에 전화해 직원에게 보여 준다.', url: CENTER_MAP, go: { k: 'visitItem', id: 'other' } },
  { id: 'events', title: ['양주시 행사·축제', 'Yangju City events and festivals', '杨州市活动与庆典', 'Sự kiện và lễ hội TP Yangju', 'याङ्जु सहर कार्यक्रम र महोत्सव'],
    text: '양주시 행사 일정은 시청 누리집 행사소식 게시판에 올라온다. 가을 천일홍 페스타(나리농원), 회암사지 왕실축제(봄) 등이 있다.', url: EVENTS_URL, go: { k: 'explore', tab: 'events' } },
  { id: 'city', title: ['양주시 개요', 'About Yangju City', '杨州市概况', 'Giới thiệu TP Yangju', 'याङ्जु सहर परिचय'],
    text: '양주시 인구는 약 29.8만 명, 등록외국인은 약 1.3만 명(2025)이며 베트남·네팔·방글라데시 출신이 많다. 옥정·회천 신도시와 백석·은현·남·광적·장흥 등 읍면이 있고 전철 1호선 양주역·덕계역·덕정역이 지난다. 시청 누리집 www.yangju.go.kr.', url: CITY_URL, go: { k: 'explore', tab: 'about' } },
];
