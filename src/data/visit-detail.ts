// 시청·주민센터 업무 상세: 상황(유형)별 구비서류, 주의사항, 배지.
// 출처: 양희정 현장 검수 "등록외국인 5대 핵심 생활·행정 업무별 유형 및 구비서류 편람" (2026-10-13, 은현면·남면 행정복지센터,
// 양주출입국·외국인사무소, 국민건강보험공단, 의정부운전면허시험장 확인). 기본 정보(어디서·언제·공통 준비물)는 content.ts 의 VISIT 에 있다.
// 영·중·베·네 번역은 팀 작성 초안으로 원어민 검수 전.
import type { T5 } from '@/data/content';

export interface VisitType { id: string; name: T5; docs: T5[]; note?: T5 }
export interface VisitDetail {
  /** 카드 머리에 붙는 짧은 배지 (기한·주의) */
  badges: { t: T5; tone: 'amber' | 'red' | 'blue' | 'green' | 'gray' }[];
  fee?: T5;
  /** 내 상황 고르기 → 공통 준비물에 더해지는 서류 */
  types: VisitType[];
  tips: T5[];
  /** 목록 검색용 (한국어·영어 키워드) */
  keywords: string;
}

const PASSPORT_COPY: T5 = ['여권 사본 1부', 'Copy of passport (1)', '护照复印件1份', 'Bản sao hộ chiếu (1)', 'राहदानीको प्रतिलिपि (1)'];
const RESIDENCE_PROOF: T5 = ['체류지 입증서류 (임대차계약서 또는 거주·숙소제공 확인서 세트)', 'Proof of residence (lease, or the accommodation confirmation set)', '居留地证明（租赁合同或住所提供确认书一套）', 'Giấy tờ chứng minh nơi ở (hợp đồng thuê hoặc bộ giấy xác nhận chỗ ở)', 'बसोबास प्रमाण (भाडा सम्झौता वा आवास पुष्टि सेट)'];
const TB_CERT: T5 = ['결핵진단서 (법무부 지정 35개국 국민, 보건소·지정병원 발급)', 'Tuberculosis certificate (nationals of 35 designated countries; from a public health center or designated hospital)', '结核诊断书（法务部指定35国国民，保健所或指定医院出具）', 'Giấy khám lao (công dân 35 nước chỉ định; do trung tâm y tế hoặc bệnh viện chỉ định cấp)', 'क्षयरोग प्रमाणपत्र (तोकिएका 35 देशका नागरिक; स्वास्थ्य केन्द्र वा तोकिएको अस्पतालबाट)'];
const BIZ_REG: T5 = ['회사 사업자등록증 사본', "Copy of the employer's business registration", '公司营业执照复印件', 'Bản sao đăng ký kinh doanh của công ty', 'कम्पनीको व्यवसाय दर्ताको प्रतिलिपि'];
const NEW_REG = [PASSPORT_COPY, RESIDENCE_PROOF, TB_CERT];

export const VISIT_DETAIL: Record<string, VisitDetail> = {
  move: {
    badges: [
      { t: ['15일 이내', 'Within 15 days', '15天内', 'Trong 15 ngày', '15 दिनभित्र'], tone: 'amber' },
      { t: ['기한 지나면 출입국사무소만', 'After the deadline: immigration office only', '逾期只能去出入境', 'Quá hạn: chỉ văn phòng xuất nhập cảnh', 'म्याद नाघे अध्यागमन कार्यालय मात्र'], tone: 'red' },
    ],
    types: [
      { id: 'own-lease', name: ['본인 이름으로 집을 빌렸어요 (원룸·주택)', 'I rent in my own name (studio, house)', '以本人名义租房（单间、住宅）', 'Tôi thuê nhà đứng tên mình (phòng trọ, nhà)', 'मेरो नाममा घर भाडामा (कोठा, घर)'],
        docs: [['본인 명의 임대차계약서 원본', 'Original lease contract in your name', '本人名义的租赁合同原件', 'Bản gốc hợp đồng thuê nhà đứng tên bạn', 'आफ्नो नामको भाडा सम्झौताको सक्कल']],
        note: ['확정일자는 없어도 돼요. 계약자 이름이 본인이어야 해요.', 'A fixed-date stamp is not required. The contract must be in your name.', '无需确定日期，但合同人必须是本人。', 'Không cần dấu ngày xác định. Người ký hợp đồng phải là bạn.', 'निश्चित मिति छाप चाहिँदैन। सम्झौता आफ्नै नाममा हुनुपर्छ।'] },
      { id: 'owner', name: ['내 집이에요', 'I own my home', '自有住房', 'Nhà thuộc sở hữu của tôi', 'मेरो आफ्नै घर'],
        docs: [['부동산 등기사항전부증명서 (등기부등본)', 'Certified copy of the property register', '不动产登记簿誊本', 'Bản sao đăng ký bất động sản (sổ đỏ)', 'घर जग्गा दर्ता प्रमाणपत्र']] },
      { id: 'company', name: ['회사 기숙사·사장님이 준 숙소', 'Company dormitory or employer-provided housing', '公司宿舍、雇主提供的住所', 'Ký túc xá công ty hoặc chỗ ở do chủ cấp', 'कम्पनी छात्रावास वा मालिकले दिएको बास'],
        docs: [
          ['거주·숙소제공 확인서 (하이코리아 서식)', 'Residence/accommodation provision confirmation (HiKorea form)', '居住、住所提供确认书（HiKorea表格）', 'Giấy xác nhận cung cấp chỗ ở (mẫu HiKorea)', 'बसोबास/आवास प्रदान पुष्टि पत्र (HiKorea फारम)'],
          ['숙소제공자(사장님) 신분증 사본', "Copy of the provider's (employer's) ID", '住所提供者（雇主）身份证复印件', 'Bản sao CMND của chủ (người cấp chỗ ở)', 'आवास दिने (मालिक) को परिचयपत्रको प्रतिलिपि'],
          ['회사 명의 임대차계약서 사본 또는 등기부등본', "Copy of the company's lease or property register", '公司名义租赁合同复印件或登记簿誊本', 'Bản sao hợp đồng thuê nhà của công ty hoặc sổ đỏ', 'कम्पनीको भाडा सम्झौता वा जग्गा दर्ताको प्रतिलिपि'],
          BIZ_REG,
        ],
        note: ['확인서 1장만 가져오고 사장님 신분증이나 회사 계약서를 빠뜨려 반려되는 경우가 가장 많아요.', "Most rejections: bringing only the confirmation form without the employer's ID or the company lease.", '最常见的退回原因：只带确认书，漏带雇主身份证或公司合同。', 'Bị từ chối nhiều nhất: chỉ mang giấy xác nhận, thiếu CMND của chủ hoặc hợp đồng công ty.', 'सबैभन्दा धेरै अस्वीकार: पुष्टि पत्र मात्र ल्याउने, मालिकको परिचयपत्र वा कम्पनी सम्झौता छुटाउने।'] },
      { id: 'shared', name: ['친구·동료 집에 같이 살아요', 'I live with a friend or coworker', '与朋友、同事同住', 'Ở chung với bạn bè, đồng nghiệp', 'साथी/सहकर्मीसँग सँगै बस्छु'],
        docs: [
          ['거주·숙소제공 확인서', 'Residence/accommodation provision confirmation', '居住、住所提供确认书', 'Giấy xác nhận cung cấp chỗ ở', 'बसोबास/आवास प्रदान पुष्टि पत्र'],
          ['계약 명의자(동료)의 외국인등록증 사본', "Copy of the contract holder's (coworker's) residence card", '合同人（同事）的外国人登录证复印件', 'Bản sao thẻ cư trú của người đứng tên hợp đồng', 'सम्झौता धारक (सहकर्मी) को दर्ता कार्डको प्रतिलिपि'],
          ['계약 명의자의 임대차계약서 사본 (필요하면 집주인 전대 동의서)', "Copy of the holder's lease (landlord's sublease consent if required)", '合同人的租赁合同复印件（必要时房东转租同意书）', 'Bản sao hợp đồng thuê của người đứng tên (nếu cần: giấy đồng ý cho thuê lại của chủ nhà)', 'सम्झौता धारकको भाडा सम्झौताको प्रतिलिपि (आवश्यक भए घरधनीको सहमति)'],
        ] },
    ],
    tips: [
      ['기한이 지났으면 행정복지센터에서는 받지 않아요. 양주출입국·외국인사무소(고읍동)로 바로 가세요.', 'If the deadline has passed, community centers cannot accept it. Go directly to the Yangju Immigration Office (Goeup-dong).', '逾期后行政福利中心不受理，请直接前往杨州出入境、外国人事务所（高邑洞）。', 'Quá hạn thì trung tâm hành chính không nhận. Hãy đến thẳng Văn phòng Xuất nhập cảnh Yangju (Goeup-dong).', 'म्याद नाघेपछि सामुदायिक केन्द्रले लिँदैन। सिधै याङ्जु अध्यागमन कार्यालय (गोउप-दोङ) जानुहोस्।'],
      ["신고서 이름: 행정복지센터는 '체류지변경 신고서', 출입국사무소는 '통합신청서'. 창구에 있어요.", "Form names: 'Report of change of residence' at community centers, 'Integrated application form' at immigration. Available at the counter.", '表格名称：行政福利中心为“居留地变更申报书”，出入境为“综合申请书”，窗口提供。', "Tên mẫu: 'Tờ khai đổi nơi cư trú' ở trung tâm hành chính, 'Đơn tổng hợp' ở xuất nhập cảnh. Có sẵn tại quầy.", "फारम: सामुदायिक केन्द्रमा 'ठेगाना परिवर्तन सूचना फारम', अध्यागमनमा 'एकीकृत आवेदन'। काउन्टरमा पाइन्छ।"],
    ],
    keywords: '이사 체류지 변경 주소 전입 거소 기숙사 moving move address residence',
  },

  reg: {
    badges: [
      { t: ['입국 90일 이내', 'Within 90 days of entry', '入境90天内', 'Trong 90 ngày sau nhập cảnh', 'प्रवेशको 90 दिनभित्र'], tone: 'blue' },
      { t: ['하이코리아 예약 필수', 'HiKorea reservation required', '须HiKorea预约', 'Bắt buộc đặt lịch HiKorea', 'HiKorea बुकिङ अनिवार्य'], tone: 'red' },
    ],
    fee: ['30,000원 (우편 수령 시 등기료 4,000원 추가)', '30,000 KRW (+4,000 KRW for registered-mail delivery)', '30,000韩元（邮寄领取加挂号费4,000韩元）', '30.000 won (+4.000 won nếu nhận qua bưu điện)', '30,000 वन (हुलाकबाट लिँदा +4,000 वन)'],
    types: [
      { id: 'e9', name: ['처음 등록 · 취업 비자 E-9', 'New registration · E-9 work visa', '初次登录 · E-9就业签证', 'Đăng ký lần đầu · Visa lao động E-9', 'पहिलो दर्ता · E-9 काम भिसा'],
        docs: [...NEW_REG,
          ['표준근로계약서 사본', 'Copy of the standard labor contract', '标准劳动合同复印件', 'Bản sao hợp đồng lao động tiêu chuẩn', 'मानक श्रम सम्झौताको प्रतिलिपि'],
          BIZ_REG,
          ['취업교육 이수증', 'Employment training certificate', '就业教育结业证', 'Giấy chứng nhận đào tạo việc làm', 'रोजगार तालिम प्रमाणपत्र']] },
      { id: 'e7', name: ['처음 등록 · 특정활동 E-7', 'New registration · E-7 specific activities', '初次登录 · E-7特定活动', 'Đăng ký lần đầu · E-7 hoạt động đặc thù', 'पहिलो दर्ता · E-7 विशेष गतिविधि'],
        docs: [...NEW_REG,
          ['고용계약서', 'Employment contract', '雇佣合同', 'Hợp đồng lao động', 'रोजगार सम्झौता'],
          BIZ_REG,
          ['소관 부처 고용추천서 (해당 직종만)', 'Employment recommendation from the relevant ministry (certain jobs only)', '主管部门雇佣推荐书（仅限相关职种）', 'Thư giới thiệu tuyển dụng của bộ chủ quản (chỉ một số ngành)', 'सम्बन्धित मन्त्रालयको रोजगार सिफारिस (केही पेशामा मात्र)']] },
      { id: 'd2', name: ['처음 등록 · 유학·어학연수 D-2/D-4', 'New registration · D-2/D-4 study', '初次登录 · D-2/D-4留学、语言研修', 'Đăng ký lần đầu · D-2/D-4 du học', 'पहिलो दर्ता · D-2/D-4 अध्ययन'],
        docs: [...NEW_REG,
          ['표준입학허가서', 'Standard admission letter', '标准入学许可书', 'Giấy nhập học tiêu chuẩn', 'मानक भर्ना पत्र'],
          ['재학증명서', 'Certificate of enrollment', '在学证明', 'Giấy xác nhận đang học', 'अध्ययनरत प्रमाणपत्र'],
          ['등록금 납입 영수증', 'Tuition payment receipt', '学费缴纳收据', 'Biên lai đóng học phí', 'शुल्क तिरेको रसिद']] },
      { id: 'f6', name: ['처음 등록 · 결혼이민 F-6', 'New registration · F-6 marriage migrant', '初次登录 · F-6结婚移民', 'Đăng ký lần đầu · F-6 kết hôn', 'पहिलो दर्ता · F-6 विवाह'],
        docs: [...NEW_REG,
          ['한국인 배우자의 혼인관계증명서 (상세)', "Korean spouse's marriage certificate (detailed)", '韩国配偶的婚姻关系证明（详细）', 'Giấy chứng nhận quan hệ hôn nhân của vợ/chồng người Hàn (chi tiết)', 'कोरियाली पति/पत्नीको विवाह प्रमाणपत्र (विस्तृत)'],
          ['배우자 기본증명서', "Spouse's basic certificate", '配偶基本证明', 'Giấy chứng nhận cơ bản của vợ/chồng', 'पति/पत्नीको आधारभूत प्रमाणपत्र'],
          ['배우자 주민등록등본', "Spouse's resident registration copy", '配偶居民登记誊本', 'Bản sao đăng ký cư trú của vợ/chồng', 'पति/पत्नीको निवासी दर्ता प्रतिलिपि']] },
      { id: 'other', name: ['처음 등록 · 그 밖의 비자', 'New registration · other visas', '初次登录 · 其他签证', 'Đăng ký lần đầu · visa khác', 'पहिलो दर्ता · अन्य भिसा'],
        docs: [...NEW_REG,
          ['체류자격별 추가 서류 (출입국사무소에 확인)', 'Additional documents for your visa type (check with immigration)', '按滞留资格的补充材料（向出入境确认）', 'Giấy tờ bổ sung theo loại visa (hỏi xuất nhập cảnh)', 'भिसा प्रकार अनुसार थप कागजात (अध्यागमनमा सोध्नुहोस्)']] },
      { id: 'reissue', name: ['등록증 재발급 (분실·훼손·주소란 부족·이름 변경)', 'Card reissue (lost, damaged, no space for address, name change)', '登录证补发（遗失、损坏、地址栏不足、姓名变更）', 'Cấp lại thẻ (mất, hỏng, hết chỗ ghi địa chỉ, đổi tên)', 'कार्ड पुनः जारी (हराएको, बिग्रिएको, ठेगाना ठाउँ नभएको, नाम परिवर्तन)'],
        docs: [
          ['분실: 분실사유서 (신청서에 적어요)', 'Lost: statement of loss (written on the form)', '遗失：遗失事由书（在申请书上填写）', 'Mất: bản tường trình (ghi trong đơn)', 'हराएको: हराएको कारण (फारममै लेख्ने)'],
          ['훼손·주소란 부족·이름 변경: 기존 등록증 반납', 'Damaged, no space or name change: return the old card', '损坏、地址栏不足、姓名变更：交回原登录证', 'Hỏng, hết chỗ, đổi tên: nộp lại thẻ cũ', 'बिग्रिएको/ठाउँ नभएको/नाम परिवर्तन: पुरानो कार्ड फिर्ता'],
        ],
        note: ['사유가 생긴 날부터 14일 이내. 수수료 30,000원 (분실은 부과, 훼손 등은 일부 면제)', 'Within 14 days of the event. Fee 30,000 KRW (charged for loss; partly waived for damage etc.)', '事由发生之日起14天内。手续费30,000韩元（遗失收费，损坏等部分免除）', 'Trong 14 ngày kể từ khi xảy ra. Phí 30.000 won (mất thì thu; hỏng v.v. được miễn một phần)', 'कारण भएको 14 दिनभित्र। शुल्क 30,000 वन (हराएको भए लाग्छ; बिग्रिएको आदि आंशिक छुट)'] },
    ],
    tips: [
      ['예약 없이 가면 그날 접수가 안 돼요. 하이코리아에서 방문 예약을 먼저 하세요.', 'Without a reservation you will not be accepted that day. Reserve on HiKorea first.', '未预约当天不受理，请先在HiKorea预约。', 'Không đặt lịch sẽ không được tiếp nhận trong ngày. Hãy đặt lịch trên HiKorea trước.', 'बुकिङ बिना त्यस दिन लिइँदैन। पहिले HiKorea मा बुकिङ गर्नुहोस्।'],
    ],
    keywords: '외국인등록 등록증 비자 처음 입국 재발급 분실 registration ARC card visa new lost',
  },

  nhis: {
    badges: [
      { t: ['보험료는 매월 25일까지 선납', 'Premium due by the 25th, in advance', '保费每月25日前预缴', 'Đóng phí trước ngày 25 hằng tháng', 'बीमा शुल्क हरेक महिना 25 भित्र अग्रिम'], tone: 'amber' },
      { t: ['체납 시 비자 연장 제한', 'Arrears can block visa extension', '欠费会限制签证延期', 'Nợ phí có thể bị hạn chế gia hạn visa', 'बक्यौता भए भिसा नवीकरणमा रोक'], tone: 'red' },
    ],
    types: [
      { id: 'work', name: ['회사에 다녀요 (직장가입자)', 'I am employed (employee insured)', '在职（职场参保）', 'Đi làm (bảo hiểm theo công ty)', 'जागिरमा छु (कार्यस्थल बीमा)'],
        docs: [['본인 신청은 필요 없어요. 회사에 외국인등록증 사본과 표준근로계약서 사본을 내요', 'No application needed. Give your company a copy of your residence card and labor contract', '本人无需申请。向公司提交外国人登录证和标准劳动合同复印件', 'Bạn không cần tự đăng ký. Nộp cho công ty bản sao thẻ cư trú và hợp đồng lao động', 'आफैं आवेदन गर्नु पर्दैन। कम्पनीलाई दर्ता कार्ड र श्रम सम्झौताको प्रतिलिपि दिनुहोस्']] },
      { id: 'dependent', name: ['가족을 피부양자로 올려요 (배우자·자녀·부모)', 'Register family as dependents (spouse, children, parents)', '登记家属为被抚养人（配偶、子女、父母）', 'Đăng ký người phụ thuộc (vợ/chồng, con, cha mẹ)', 'परिवारलाई आश्रित दर्ता (पति/पत्नी, बच्चा, आमाबुबा)'],
        docs: [
          ['피부양자 자격취득 신고서', 'Dependent qualification report form', '被抚养人资格取得申报书', 'Đơn khai lấy tư cách người phụ thuộc', 'आश्रित योग्यता सूचना फारम'],
          ['신청인과 피부양자의 외국인등록증 원본', "Residence cards of the applicant and dependents (original)", '申请人及被抚养人的外国人登录证原件', 'Thẻ cư trú (bản gốc) của người nộp và người phụ thuộc', 'आवेदक र आश्रितको दर्ता कार्ड (सक्कल)'],
          ['본국 가족관계 서류 원본 (출생·혼인증명서 등)', 'Home-country family documents (birth, marriage certificates)', '本国家庭关系证件原件（出生、婚姻证明等）', 'Giấy tờ quan hệ gia đình từ nước nhà (khai sinh, kết hôn)', 'स्वदेशको पारिवारिक कागजात (जन्म, विवाह प्रमाणपत्र)'],
          ['아포스티유 또는 주한 공관 영사확인서', 'Apostille or consular confirmation', '海牙认证或驻韩使领馆领事确认', 'Apostille hoặc xác nhận lãnh sự', 'एपोस्टिल वा वाणिज्य दूत पुष्टि'],
          ['한국어 번역본 (번역자 확인서 첨부)', "Korean translation (with translator's statement)", '韩文译本（附译者确认书）', 'Bản dịch tiếng Hàn (kèm xác nhận người dịch)', 'कोरियाली अनुवाद (अनुवादकको पुष्टि सहित)'],
        ],
        note: ['배우자·미성년 자녀는 바로, 부모·형제는 국내 6개월 이상 체류해야 등록돼요', 'Spouse and minor children: immediately. Parents and siblings: after 6 months in Korea', '配偶、未成年子女可立即登记；父母、兄弟姐妹须在韩居留6个月以上', 'Vợ/chồng, con chưa thành niên: ngay. Cha mẹ, anh chị em: sau 6 tháng ở Hàn', 'पति/पत्नी र नाबालक बच्चा: तुरुन्तै। आमाबुबा र दाजुभाइ: कोरियामा 6 महिना बसेपछि'] },
      { id: 'merge', name: ['가족 보험료를 하나로 합쳐요 (세대합가)', 'Merge family premiums into one household', '家庭保费合并（世带合并）', 'Gộp phí bảo hiểm gia đình thành một hộ', 'परिवारको बीमा शुल्क एउटै घरमा गाभ्ने'],
        docs: [
          ['건강보험 세대합가 신청서', 'Household merge application', '健康保险世带合并申请书', 'Đơn gộp hộ bảo hiểm y tế', 'स्वास्थ्य बीमा घर गाभ्ने आवेदन'],
          ['가족 전원의 외국인등록증', 'Residence cards of all family members', '全体家属的外国人登录证', 'Thẻ cư trú của tất cả thành viên', 'सबै परिवार सदस्यको दर्ता कार्ड'],
          ['가족관계 공증 서류 (아포스티유·영사확인 + 한국어 번역본)', 'Notarized family documents (apostille or consular confirmation + Korean translation)', '家庭关系公证文件（海牙认证、领事确认＋韩文译本）', 'Giấy tờ gia đình công chứng (apostille/lãnh sự + bản dịch tiếng Hàn)', 'प्रमाणित पारिवारिक कागजात (एपोस्टिल/वाणिज्य दूत + कोरियाली अनुवाद)'],
        ],
        note: ['안 하면 가족 한 명당 월 약 14만 원씩 따로 나와요', 'Without it, each family member is billed about 140,000 KRW a month separately', '不合并则每位家属每月各缴约14万韩元', 'Nếu không, mỗi người trong gia đình bị tính riêng khoảng 140.000 won/tháng', 'नगरे प्रत्येक सदस्यलाई महिनाको करिब 1,40,000 वन अलग-अलग लाग्छ'] },
      { id: 'billing', name: ['고지서 주소 변경·자동이체', 'Change billing address or set up auto-pay', '变更账单地址、自动扣款', 'Đổi địa chỉ nhận hóa đơn, tự động trừ tiền', 'बिल ठेगाना परिवर्तन / स्वतः भुक्तानी'],
        docs: [['본인 명의 통장 사본 (또는 신용카드)', 'Copy of a bank book in your name (or credit card)', '本人名义存折复印件（或信用卡）', 'Bản sao sổ ngân hàng đứng tên bạn (hoặc thẻ tín dụng)', 'आफ्नो नामको बैंक खाताको प्रतिलिपि (वा क्रेडिट कार्ड)']],
        note: ['전화 1577-1000이나 공단 앱으로도 돼요. 이사 후 고지서를 못 받아 체납되는 걸 막아요', 'Also by phone (1577-1000) or the NHIS app. Prevents arrears from missed bills after moving', '也可致电1577-1000或用公团APP办理。避免搬家后收不到账单而欠费', 'Có thể gọi 1577-1000 hoặc dùng app NHIS. Tránh nợ phí vì không nhận được hóa đơn sau khi chuyển nhà', 'फोन 1577-1000 वा NHIS एपबाट पनि हुन्छ। सरेपछि बिल नपाएर बक्यौता हुनबाट बचाउँछ'] },
    ],
    tips: [
      ['소득·재산이 없어도 월 약 14~15만 원의 평균보험료가 나와요', 'Even with no income or assets, an average premium of about 140,000–150,000 KRW a month applies', '即使无收入、无财产，也按平均保费每月约14～15万韩元征收', 'Dù không có thu nhập, tài sản vẫn phải đóng phí trung bình khoảng 140.000–150.000 won/tháng', 'आम्दानी/सम्पत्ति नभए पनि महिनाको करिब 1,40,000–1,50,000 वन औसत शुल्क लाग्छ'],
      ['체납되면 병원비를 전액 내야 하고 비자 연장이 제한될 수 있어요', 'If in arrears, you pay 100% of hospital bills and visa extension may be restricted', '欠费后医疗费需全额自付，且签证延期可能受限', 'Nợ phí thì phải trả 100% viện phí và có thể bị hạn chế gia hạn visa', 'बक्यौता भए अस्पताल खर्च पूरै आफैं तिर्नुपर्छ, भिसा नवीकरणमा रोक लाग्न सक्छ'],
      ['은현면·남면·광적면·백석읍에 사는 지역가입자는 농어촌 22% 경감 대상이에요. 고지서에 적용됐는지 확인하세요', 'Regional subscribers living in Eunhyeon, Nam-myeon, Gwangjeok or Baekseok get a 22% rural reduction. Check that your bill applies it', '居住在银现面、南面、广积面、白石邑的地区参保者可享农渔村22%减免，请确认账单是否已适用', 'Người tham gia khu vực ở Eunhyeon, Nam-myeon, Gwangjeok, Baekseok được giảm 22% (nông thôn). Hãy kiểm tra hóa đơn', 'युनह्योन, नाम-म्योन, ग्वाङजोक, बेकसोकमा बस्ने क्षेत्रीय सदस्यलाई ग्रामीण 22% छुट छ। बिलमा लागू भएको जाँच्नुहोस्'],
    ],
    keywords: '건강보험 보험료 공단 피부양자 합가 자동이체 health insurance nhis premium dependent',
  },

  kid: {
    badges: [
      { t: ['체류자격 상관없이 의무교육', 'Compulsory education regardless of status', '无论滞留资格均可义务教育', 'Giáo dục bắt buộc bất kể tư cách cư trú', 'आवासीय हैसियत जे भए पनि अनिवार्य शिक्षा'], tone: 'green' },
      { t: ['학교는 직접 방문 신청', 'Schools: apply in person', '学校需亲自申请', 'Trường học: nộp trực tiếp', 'विद्यालय: आफैं गएर आवेदन'], tone: 'blue' },
    ],
    types: [
      { id: 'daycare', name: ['어린이집 (0~5세)', 'Daycare (ages 0–5)', '托儿所（0～5岁）', 'Nhà trẻ (0–5 tuổi)', 'डेकेयर (0–5 वर्ष)'],
        docs: [['재직증명서 또는 표준근로계약서 (맞벌이 증빙이 필요할 때)', 'Employment certificate or labor contract (if proof of dual income is needed)', '在职证明或标准劳动合同（需双职工证明时）', 'Giấy xác nhận việc làm hoặc hợp đồng lao động (khi cần chứng minh cả hai đi làm)', 'रोजगार प्रमाणपत्र वा श्रम सम्झौता (दुवै काम गर्ने प्रमाण चाहिए)']],
        note: ['외국인 아이는 정부 보육료 지원(아이행복카드)에서 빠지는 경우가 많아 월 30~50만 원을 직접 낼 수 있어요', 'Foreign children are often excluded from government childcare subsidies, so you may pay 300,000–500,000 KRW a month', '外国儿童多数不在政府保育费补贴范围内，可能每月自付30～50万韩元', 'Trẻ em nước ngoài thường không được trợ cấp giữ trẻ của chính phủ, có thể phải trả 300.000–500.000 won/tháng', 'विदेशी बच्चा सरकारी बालहेरचाह अनुदानबाट बाहिर पर्न सक्छ, महिनाको 3–5 लाख वन आफैं तिर्नुपर्न सक्छ'] },
      { id: 'elem', name: ['초등학교 입학·전학 (6~12세)', 'Elementary school entry or transfer (ages 6–12)', '小学入学、转学（6～12岁）', 'Nhập học, chuyển trường tiểu học (6–12 tuổi)', 'प्राथमिक विद्यालय भर्ना/स्थानान्तरण (6–12 वर्ष)'],
        docs: [
          ['취학원서 또는 편입학원서 (교무실에 있어요)', 'Enrollment or transfer application (at the school office)', '入学申请书或编入学申请书（教务室提供）', 'Đơn nhập học hoặc chuyển trường (có tại văn phòng trường)', 'भर्ना वा स्थानान्तरण आवेदन (विद्यालय कार्यालयमा)'],
          ['거주 증명: 외국인등록사실증명서 또는 임대차계약서', 'Proof of residence: certificate of alien registration or lease', '居住证明：外国人登录事实证明或租赁合同', 'Chứng minh nơi ở: giấy xác nhận đăng ký hoặc hợp đồng thuê nhà', 'बसोबास प्रमाण: दर्ता प्रमाणपत्र वा भाडा सम्झौता'],
          ['외국 학교에서 옮겨 오면: 직전 학년 재학·성적증명서 (아포스티유 + 한국어 번역공증)', "Transferring from a school abroad: previous year's enrollment and transcript (apostille + notarized Korean translation)", '从海外学校转来：上一学年在学、成绩证明（海牙认证＋韩文翻译公证）', 'Chuyển từ trường nước ngoài: giấy xác nhận học và bảng điểm năm trước (apostille + bản dịch công chứng)', 'विदेशी विद्यालयबाट आएको भए: अघिल्लो कक्षाको अध्ययन र अंक प्रमाणपत्र (एपोस्टिल + प्रमाणित कोरियाली अनुवाद)'],
        ],
        note: ['체류증이 없어도 돼요. 거주사실 인우보증서와 임대차계약서로 대신할 수 있어요', 'No residence card is required. A residence guarantor statement and lease can be used instead', '没有滞留证也可以，可用居住事实保证书和租赁合同代替', 'Không cần thẻ cư trú. Có thể thay bằng giấy bảo lãnh cư trú và hợp đồng thuê nhà', 'दर्ता कार्ड नभए पनि हुन्छ। बसोबास जमानत पत्र र भाडा सम्झौताले काम गर्छ'] },
      { id: 'mid', name: ['중학교·고등학교 (13세 이상)', 'Middle or high school (age 13+)', '初中、高中（13岁以上）', 'THCS, THPT (từ 13 tuổi)', 'माध्यमिक/उच्च माध्यमिक (13+ वर्ष)'],
        docs: [
          ['배정원서 또는 편입학 신청서', 'Placement or transfer application', '分配申请书或编入学申请书', 'Đơn phân bổ hoặc chuyển trường', 'नियुक्ति वा स्थानान्तरण आवेदन'],
          ['학생·학부모 외국인등록증과 여권 사본', "Student's and parent's residence cards and passport copies", '学生、家长外国人登录证及护照复印件', 'Bản sao thẻ cư trú và hộ chiếu của học sinh và phụ huynh', 'विद्यार्थी र अभिभावकको दर्ता कार्ड र राहदानीको प्रतिलिपि'],
          ['본국 재학·졸업·성적증명서 원본 + 아포스티유(또는 영사확인) + 한국어 번역공증 — 가장 중요', 'Home-country enrollment, graduation and transcript originals + apostille (or consular confirmation) + notarized Korean translation — most important', '本国在学、毕业、成绩证明原件＋海牙认证（或领事确认）＋韩文翻译公证——最重要', 'Bản gốc giấy xác nhận học, tốt nghiệp, bảng điểm ở nước nhà + apostille (hoặc xác nhận lãnh sự) + bản dịch công chứng — quan trọng nhất', 'स्वदेशको अध्ययन, स्नातक र अंक प्रमाणपत्र सक्कल + एपोस्टिल (वा वाणिज्य दूत पुष्टि) + प्रमाणित कोरियाली अनुवाद — सबैभन्दा महत्त्वपूर्ण'],
        ] },
    ],
    tips: [
      ['부모의 체류자격과 관계없이 초·중학교 의무교육은 보장돼요. 학교는 출입국에 알리지 않아요', "Elementary and middle school education is guaranteed regardless of the parents' status. Schools do not report to immigration", '无论父母滞留资格如何，小学、初中义务教育均有保障。学校不会通报出入境', 'Giáo dục tiểu học và THCS được bảo đảm bất kể tư cách cư trú của cha mẹ. Trường không báo cho xuất nhập cảnh', 'अभिभावकको हैसियत जे भए पनि प्राथमिक र माध्यमिक शिक्षा सुनिश्चित छ। विद्यालयले अध्यागमनलाई जानकारी दिँदैन'],
    ],
    keywords: '자녀 아이 학교 어린이집 입학 전학 편입 유치원 school daycare child kid enroll',
  },

  drive: {
    badges: [
      { t: ['의정부운전면허시험장', "Uijeongbu Driver's License Center", '议政府驾驶执照考场', 'Trung tâm cấp bằng lái Uijeongbu', 'उइजङबु लाइसेन्स केन्द्र'], tone: 'blue' },
      { t: ['시청·주민센터에서는 안 돼요', 'Not at City Hall or community centers', '市政府、居民中心不能办', 'Không làm ở tòa thị chính, trung tâm', 'सहर कार्यालय/सामुदायिक केन्द्रमा हुँदैन'], tone: 'red' },
    ],
    types: [
      { id: 'exchange', name: ['외국 면허를 한국 면허로 바꿔요', 'Exchange a foreign license for a Korean one', '外国驾照换韩国驾照', 'Đổi bằng lái nước ngoài sang bằng Hàn Quốc', 'विदेशी लाइसेन्स कोरियालीमा साट्ने'],
        docs: [
          ['외국 운전면허증 원본 (임시·가면허 불가)', 'Original foreign license (no temporary or provisional licenses)', '外国驾照原件（临时、准驾照不可）', 'Bản gốc bằng lái nước ngoài (không nhận bằng tạm)', 'विदेशी लाइसेन्सको सक्कल (अस्थायी लाइसेन्स मान्य छैन)'],
          ['주한 대사관 확인서 또는 아포스티유 원본', 'Embassy confirmation or apostille (original)', '驻韩大使馆确认书或海牙认证原件', 'Giấy xác nhận của đại sứ quán hoặc apostille (bản gốc)', 'दूतावासको पुष्टि वा एपोस्टिल (सक्कल)'],
          ['구여권 포함 여권 전부 (출입국 도장 확인)', 'All passports including old ones (to check entry/exit stamps)', '全部护照含旧护照（核对出入境印章）', 'Tất cả hộ chiếu kể cả cũ (kiểm tra dấu xuất nhập cảnh)', 'पुराना सहित सबै राहदानी (प्रवेश/निकास छाप जाँच)'],
          ['출입국사실증명서 (출생년도부터, 행정복지센터에서 발급)', 'Certificate of entry and exit (from birth year; issued at community centers)', '出入境事实证明（自出生年起，行政福利中心出具）', 'Giấy xác nhận xuất nhập cảnh (từ năm sinh; cấp tại trung tâm hành chính)', 'प्रवेश/निकास प्रमाणपत्र (जन्म वर्षदेखि; सामुदायिक केन्द्रबाट)'],
          ['수수료: 신체검사 약 6,000원 + 발급 10,000~15,000원', 'Fees: medical check about 6,000 KRW + issuance 10,000–15,000 KRW', '费用：体检约6,000韩元＋发证10,000～15,000韩元', 'Phí: khám sức khỏe khoảng 6.000 won + cấp bằng 10.000–15.000 won', 'शुल्क: शारीरिक जाँच करिब 6,000 वन + जारी 10,000–15,000 वन'],
        ],
        note: ['미국 일부 주·영국·독일·우즈베키스탄 등 상호인정국은 신체검사만 받으면 바로 교환. 베트남·중국 등은 학과시험(PC 필기)에 합격해야 해요', 'Mutual-recognition countries (some US states, UK, Germany, Uzbekistan etc.): medical check only. Vietnam, China etc.: must pass the written (PC) test', '互认国家（美国部分州、英国、德国、乌兹别克斯坦等）仅体检即可换证；越南、中国等需通过学科（电脑笔试）', 'Nước công nhận lẫn nhau (một số bang Mỹ, Anh, Đức, Uzbekistan…): chỉ khám sức khỏe. Việt Nam, Trung Quốc…: phải đậu thi lý thuyết trên máy', 'पारस्परिक मान्यता देश (अमेरिकाका केही राज्य, बेलायत, जर्मनी, उज्बेकिस्तान आदि): शारीरिक जाँच मात्र। भियतनाम, चीन आदि: लिखित (कम्प्युटर) परीक्षा पास गर्नुपर्छ'] },
      { id: 'new', name: ['한국 면허를 처음 따요', 'Get a Korean license for the first time', '首次考取韩国驾照', 'Thi lấy bằng lái Hàn Quốc lần đầu', 'पहिलो पटक कोरियाली लाइसेन्स लिने'],
        docs: [['단계별 수수료 (총 약 7~8만 원)', 'Fees per stage (about 70,000–80,000 KRW in total)', '各阶段费用（共约7～8万韩元）', 'Phí từng giai đoạn (tổng khoảng 70.000–80.000 won)', 'चरण अनुसार शुल्क (जम्मा करिब 70,000–80,000 वन)']],
        note: ['순서: 교통안전교육(1시간) → 신체검사 → 학과시험 → 장내기능 → 도로주행. 학과시험은 영어·중국어·베트남어로도 볼 수 있어요', 'Steps: traffic safety class (1 h) → medical check → written test → course test → road test. The written test is available in English, Chinese and Vietnamese', '流程：交通安全教育（1小时）→体检→学科考试→场内技能→道路驾驶。学科考试可选英语、中文、越南语', 'Các bước: học an toàn giao thông (1 giờ) → khám sức khỏe → thi lý thuyết → thi sa hình → thi đường trường. Thi lý thuyết có tiếng Anh, Trung, Việt', 'चरण: यातायात सुरक्षा कक्षा (1 घण्टा) → शारीरिक जाँच → लिखित → ट्र्याक → सडक परीक्षा। लिखित परीक्षा अंग्रेजी, चिनियाँ, भियतनामीमा पनि दिन सकिन्छ'] },
      { id: 'reissue', name: ['한국 면허증 재발급 (분실·훼손)', 'Reissue a Korean license (lost or damaged)', '韩国驾照补发（遗失、损坏）', 'Cấp lại bằng Hàn Quốc (mất, hỏng)', 'कोरियाली लाइसेन्स पुनः जारी (हराएको/बिग्रिएको)'],
        docs: [
          ['훼손: 기존 면허증 반납 / 분실: 창구에서 신청서 작성', 'Damaged: return the old license / Lost: fill in the form at the counter', '损坏：交回原驾照／遗失：在窗口填写申请书', 'Hỏng: nộp lại bằng cũ / Mất: điền đơn tại quầy', 'बिग्रिएको: पुरानो फिर्ता / हराएको: काउन्टरमा फारम भर्ने'],
          ['수수료 10,000원 (국문·영문)', 'Fee 10,000 KRW (Korean or English version)', '手续费10,000韩元（韩文、英文）', 'Phí 10.000 won (bản tiếng Hàn hoặc Anh)', 'शुल्क 10,000 वन (कोरियाली/अंग्रेजी)'],
        ],
        note: ['시험장은 그날 바로, 경찰서 민원실은 1~2주 걸려요. 사진은 바꾸고 싶을 때만 1매', 'Test centers issue the same day; police stations take 1–2 weeks. Bring 1 photo only if you want to change it', '考场当天领取，警察署民愿室需1～2周。仅在想更换照片时带1张', 'Trung tâm cấp ngay trong ngày; đồn cảnh sát mất 1–2 tuần. Chỉ cần 1 ảnh nếu muốn đổi ảnh', 'परीक्षा केन्द्रमा सोही दिन; प्रहरी कार्यालयमा 1–2 हप्ता। फोटो फेर्न चाहे मात्र 1 प्रति'] },
    ],
    tips: [
      ['교환할 때 본국 면허증은 시험장이 보관해요. 나중에 출국할 때 비행기 탑승권을 보여주면 돌려받아요', 'When exchanging, the test center keeps your home license. You get it back by showing your boarding pass when leaving Korea', '换证时本国驾照由考场保管，日后出境时出示登机牌即可取回', 'Khi đổi, trung tâm giữ bằng lái nước bạn. Khi xuất cảnh, đưa thẻ lên máy bay để nhận lại', 'साट्दा स्वदेशी लाइसेन्स केन्द्रले राख्छ। पछि देश छोड्दा बोर्डिङ पास देखाएर फिर्ता लिन सकिन्छ'],
    ],
    keywords: '운전면허 면허 교환 시험장 운전 재발급 license driver driving exchange',
  },
};
