import type { Benefit, Bi, Channel, Group, Likelihood, Stage, StageRef, Text } from '@/types';

// 복지 혜택 데이터. 그룹(청년/신혼/...) → 생애 단계 → 혜택 순으로 내려간다.
// 시안이라 혜택 이름·조건·금액은 전부 예시이고, 실제 공고와 다를 수 있다.
// 담당자 화면에서 게시한 혜택은 여기 없고 benefitsStore(localStorage)에서 따로 합쳐진다.

/** 시행 주체 태그. 혜택 카드 왼쪽 위에 붙는다 */
export const LV = {
  C: ['중앙', 'National'] as Bi,
  G: ['경기', 'Gyeonggi'] as Bi,
  Y: ['양주', 'Yangju'] as Bi,
};
const { C, G, Y } = LV;

// 아래 표를 한 줄에 한 혜택씩 적기 위한 생성 함수. 인자 순서는 Benefit 필드 순서와 같다.
// 객체 리터럴로 풀어 쓰면 줄 수가 네 배쯤 되고 표로 읽기 어려워져서 이 방식을 유지했다.
const B = (
  name: Bi, lv: Bi, st: Likelihood, what: Text, who: Text, when: Text,
  docs: Text[], ch: Channel, quiz: Text[],
): Benefit => ({ name, lv, st, what, who, when, docs, ch, quiz });

// 여러 혜택에 반복되는 준비물
const ID: Bi = ['신분증', 'ID card'];
const RES: Bi = ['주민등록등본', 'Resident registration copy'];

/**
 * 청년 생애 단계별 혜택. 공모전 시안에서 실제로 채운 유일한 그룹.
 * 단계 순서(구직 → 취업 → 독립 → 결혼 → 임신·출산 → 육아)가 곧 화면의 타일 순서다.
 * 각 단계 3개씩, 중앙·경기·양주가 하나씩 섞이도록 골랐다.
 * quiz 는 전부 "예"가 나와야 가능성 높음 판정이 나므로, 질문은 자격 요건을 긍정문으로 쓸 것.
 */
export const YOUTH_STAGES: Stage[] = [
  { id: 'job', label: ['구직', 'Job seeking'], items: [
    B(['구직활동 지원', 'Job search support'], C, 'high', ['구직 기간 생활비·취업 서비스', 'Living costs and job services while job seeking'], ['미취업 청년', 'Young people without a job'], ['상시 접수', 'Open all year'], [ID, ['구직 신청서', 'Job seeker form']], { t: 'online', where: ['고용24', 'Work24 (gov job site)'] }, [['취업하지 않은 상태인가요?', 'Are you currently not employed?'], ['만 15~34세인가요?', 'Are you 15 to 34 years old?']]),
    B(['자격증 응시료', 'Exam fee support'], G, 'check', ['자격시험 응시료 일부', 'Part of certificate exam fees'], ['경기도 미취업 청년', 'Unemployed youth in Gyeonggi'], ['연중 회차별', 'Each exam round'], [['응시 영수증', 'Exam receipt'], ['주민등록초본', 'Resident registration abstract']], { t: 'online', where: ['경기도 청년 포털', 'Gyeonggi youth portal'] }, [['경기도에 살고 있나요?', 'Do you live in Gyeonggi-do?'], ['올해 자격시험을 봤나요?', 'Did you take a certificate exam this year?']]),
    B(['양주 청년 취업 상담', 'Yangju youth job counseling'], Y, 'high', ['1:1 취업 상담·교육', '1:1 job counseling and training'], ['양주 거주 청년', 'Youth living in Yangju'], ['상시', 'Open all year'], [ID], { t: 'visit', where: ['양주시 청년 지원 창구', 'Yangju youth support desk'] }, [['양주시에 살고 있나요?', 'Do you live in Yangju?']]),
  ] },
  { id: 'work', label: ['취업', 'Employed'], items: [
    B(['청년 자산형성 통장', 'Youth savings account'], C, 'check', ['매달 저축하면 정부가 더해줌', 'Government adds to your monthly savings'], ['소득 기준 맞는 청년', 'Youth within the income limit'], ['월별 신청 기간', 'Monthly sign-up window'], [['소득 확인 서류', 'Proof of income']], { t: 'online', where: ['은행 앱', 'Bank app'] }, [['일하고 소득이 있나요?', 'Do you work and earn income?'], ['개인 소득이 기준 이하인가요?', 'Is your income under the limit?']]),
    B(['중소기업 장기근속', 'SME long-term work support'], C, 'check', ['오래 일하면 지원금', 'Bonus for staying at a small company'], ['중소기업 재직 청년', 'Youth working at an SME'], ['사업 공고 시', 'When announced'], [['재직증명서', 'Certificate of employment']], { t: 'online', where: ['고용24', 'Work24 (gov job site)'] }, [['중소기업에 다니나요?', 'Do you work at a small or medium company?']]),
    B(['출퇴근 교통비', 'Commute fare refund'], C, 'high', ['대중교통비 일부 환급', 'Part of bus and subway fares back'], ['대중교통 이용자', 'Public transport users'], ['상시', 'Open all year'], [['교통카드', 'Transit card']], { t: 'online', where: ['카드사 앱', 'Card company app'] }, [['버스·지하철로 출퇴근하나요?', 'Do you commute by bus or subway?']]),
  ] },
  // 시연의 "지금" 단계. 월세 지원이 퀴즈 4문항으로 가장 길어서 시연 시나리오의 중심이 된다.
  { id: 'indep', label: ['독립', 'Living alone'], items: [
    B(['청년 월세 지원', 'Youth rent support'], C, 'high', ['매달 월세 일부 지원', 'Part of your monthly rent'], ['부모와 따로 사는 무주택 청년', 'Youth living apart from parents, no home owned'], ['공고 기간 내', 'During the application period'], [['임대차계약서', 'Lease contract'], ['월세 이체 내역', 'Rent payment records'], ['통장 사본', 'Bankbook copy']], { t: 'online', where: ['복지로', 'Bokjiro (welfare portal)'] }, [['양주시에 주민등록이 되어 있나요?', 'Are you registered as a Yangju resident?'], ['만 19~34세인가요?', 'Are you 19 to 34 years old?'], ['월세로 혼자 살고 있나요?', 'Do you rent and live on your own?'], ['가구 소득이 기준 이하인가요?', 'Is your household income under the limit?']]),
    B(['전세대출 이자 지원', 'Jeonse loan interest support'], G, 'check', ['전세대출 이자 일부', 'Part of jeonse loan interest'], ['무주택 청년 가구', 'Youth households with no home owned'], ['공고 기간 내', 'During the application period'], [['전세계약서', 'Jeonse contract'], ['대출 약정서', 'Loan agreement']], { t: 'online', where: ['경기도 주거 포털', 'Gyeonggi housing portal'] }, [['전세로 살고 있나요?', 'Do you live on a jeonse lease?'], ['전세대출을 받았나요?', 'Do you have a jeonse loan?']]),
    B(['양주 청년 주거 지원', 'Yangju youth housing support'], Y, 'check', ['양주시 청년 주거비 지원', 'Yangju City housing cost support for youth'], ['양주 거주 청년', 'Youth living in Yangju'], ['시 공고 시', 'When the city announces'], [RES, ['계약서', 'Lease contract']], { t: 'visit', where: ['행정복지센터', 'Community service center'] }, [['양주시에 1년 이상 살았나요?', 'Have you lived in Yangju for over a year?']]),
  ] },
  { id: 'marry', label: ['결혼', 'Marriage'], items: [
    B(['신혼부부 전세자금', 'Newlywed jeonse loan'], C, 'check', ['전세자금 저금리 대출', 'Low-interest jeonse loan'], ['결혼 7년 이내 부부', 'Couples married within 7 years'], ['상시', 'Open all year'], [['혼인관계증명서', 'Marriage certificate'], ['전세계약서', 'Jeonse contract']], { t: 'online', where: ['은행·주택도시기금', 'Bank / Housing fund site'] }, [['결혼했거나 결혼 예정인가요?', 'Are you married or getting married?']]),
    B(['임대주택 우선공급', 'Public rental priority'], C, 'check', ['공공임대 우선 신청', 'Priority for public rental housing'], ['신혼부부·예비부부', 'Newlyweds and engaged couples'], ['단지별 공고', 'Per housing complex notice'], [['혼인관계증명서', 'Marriage certificate']], { t: 'online', where: ['공공임대 청약 사이트', 'Public rental application site'] }, [['무주택인가요?', 'Do you own no home?']]),
    // 혜택이라기보다 "전입일 기준으로 기간을 센다"는 안내. 양주무관도 이사 얘기가 나오면 같은 내용을 말해준다(GuideContext movingNote).
    B(['전입 전 확인하기', 'Check before moving in'], Y, 'high', ['양주 혜택은 전입일부터 기간을 계산', 'Yangju benefits count from your move-in date'], ['양주로 이사 올 예정인 가구', 'Households moving to Yangju'], ['이사 전', 'Before moving'], [['없음', 'None']], { t: 'visit', where: ['행정복지센터', 'Community service center'] }, [['곧 양주로 이사하나요?', 'Are you moving to Yangju soon?']]),
  ] },
  { id: 'birth', label: ['임신·출산', 'Pregnancy & birth'], items: [
    B(['임신 진료비 바우처', 'Pregnancy medical voucher'], C, 'high', ['임신·출산 진료비 지원', 'Pregnancy and birth medical costs'], ['임신한 사람', 'Pregnant people'], ['임신 확인 후', 'After pregnancy is confirmed'], [['임신확인서', 'Pregnancy confirmation']], { t: 'online', where: ['카드사·복지로', 'Card company / Bokjiro'] }, [['임신 중인가요?', 'Are you pregnant?']]),
    B(['첫만남이용권', 'First Meeting voucher'], C, 'high', ['출생 아동 바우처', 'Voucher for a newborn'], ['출생신고한 아기', 'Babies with a birth registration'], ['출생 후 기한 내', 'Within the deadline after birth'], [['출생신고', 'Birth registration']], { t: 'visit', where: ['행정복지센터', 'Community service center'] }, [['아기가 태어났거나 곧 태어나나요?', 'Was your baby born, or is the baby due soon?']]),
    B(['양주 출산 지원', 'Yangju birth support'], Y, 'check', ['양주시 출산 지원', 'Yangju City birth support'], ['양주 거주 출산 가구', 'Yangju families with a newborn'], ['출생 후 기한 내', 'Within the deadline after birth'], [RES, ['출생증명서', 'Birth certificate']], { t: 'visit', where: ['행정복지센터', 'Community service center'] }, [['양주시에 주민등록이 되어 있나요?', 'Are you registered as a Yangju resident?']]),
  ] },
  { id: 'care', label: ['육아', 'Childcare'], items: [
    B(['부모급여', 'Parent allowance'], C, 'high', ['영아 양육 현금 지원', 'Cash support for raising an infant'], ['0~1세 아동 부모', 'Parents of children aged 0–1'], ['출생 후 신청', 'Apply after birth'], [['출생신고', 'Birth registration']], { t: 'online', where: ['복지로', 'Bokjiro (welfare portal)'] }, [['만 2세 미만 아이가 있나요?', 'Do you have a child under 2?']]),
    B(['아동수당', 'Child allowance'], C, 'high', ['매달 아동 수당', 'Monthly child allowance'], ['아동이 있는 가구', 'Households with children'], ['상시', 'Open all year'], [['통장 사본', 'Bankbook copy']], { t: 'online', where: ['복지로', 'Bokjiro (welfare portal)'] }, [['아이가 있나요?', 'Do you have a child?']]),
    B(['보육료 지원', 'Daycare fee support'], C, 'high', ['어린이집 보육료', 'Daycare center fees'], ['어린이집 다니는 아동', 'Children at a daycare center'], ['입소 시', 'When enrolling'], [['아이행복카드', 'i-Happy card']], { t: 'online', where: ['복지로', 'Bokjiro (welfare portal)'] }, [['어린이집에 다니나요?', 'Does your child go to daycare?']]),
  ] },
];

/**
 * 대상 그룹 목록. 홈 → 복지 화면의 타일 순서.
 * 청년만 실데이터이고, 신혼·출산/육아는 청년 단계를 참조(ref)해서 같은 혜택을 다른 입구로 보여준다.
 * 중장년/어르신/장애·돌봄은 단계 이름만 있고 누르면 '본선에서 채워요' 화면으로 간다.
 */
export const GROUPS: Group[] = [
  { id: 'youth', label: ['청년', 'Youth'], stages: YOUTH_STAGES },
  { id: 'newly', label: ['신혼·출산', 'Newlyweds & birth'], stages: [{ id: 'marry', ref: true }, { id: 'birth', ref: true }] },
  { id: 'child', label: ['육아', 'Childcare'], stages: [{ id: 'care', ref: true }] },
  { id: 'mid', label: ['중장년', 'Middle age'], stages: [{ label: ['재취업', 'Re-employment'] }, { label: ['부모 돌봄', 'Caring for parents'] }, { label: ['건강', 'Health'] }, { label: ['노후 준비', 'Retirement prep'] }] },
  { id: 'senior', label: ['어르신', 'Seniors'], stages: [{ label: ['연금', 'Pension'] }, { label: ['돌봄', 'Care'] }, { label: ['의료', 'Medical'] }, { label: ['이동', 'Transport'] }, { label: ['일자리', 'Jobs'] }] },
  { id: 'care', label: ['장애·돌봄', 'Disability & care'], stages: [{ label: ['활동 지원', 'Personal assistance'] }, { label: ['보조기기', 'Assistive devices'] }, { label: ['가족 돌봄', 'Family care'] }, { label: ['이동', 'Transport'] }] },
];

/**
 * 시연 기준 "지금" 단계. 그룹/단계 화면에서 이 단계 타일에 '지금' 표시가 붙는다.
 * 실제 서비스라면 사용자 프로필에서 와야 할 값. 지금은 상수.
 */
export const NOW_STAGE = 'indep';

/** Stage 와 StageRef 를 가르는 타입 가드. 실데이터(items)가 있으면 Stage */
export const isStageRef = (s: Stage | StageRef): s is StageRef => !('items' in s);
/** StageRef 중 청년 단계를 참조하는 쪽인지 (아니면 label 만 있는 예정 항목) */
export const isLinkedRef = (s: StageRef): s is { id: string; ref: true } => 'ref' in s;
