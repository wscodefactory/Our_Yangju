// 내 정보: 체류지 신고에 쓰는 것(비자·사는 곳·이사한 날·거주 형태·가족)과 고지서 납부에 쓰는 것(건강보험 납부 방식·차·은행 앱).
// 휴대폰 localStorage 에만 두고 서버로 보내지 않는다. 이름·번호·계좌처럼 식별되는 값은 받지 않는다.
import { BANK_EN } from '@/data/links';
import { VISIT_DETAIL } from '@/data/visit-detail';
import { daysUntil, parseDate } from '@/i18n';
import { STORAGE_KEYS, storage } from '@/utils/browser';

export interface Profile {
  visa?: string;
  /** 읍·면·동 id (AREAS) */
  area?: string;
  /** 이사한 날 YYYY-MM-DD. 체류지 변경 신고 기한(15일, F-4 는 14일) 계산 */
  movedOn?: string;
  /** 거주 형태: 이사 신고의 상황 id (own-lease | owner | company | shared) */
  housing?: string;
  /** 체류지 변경 신고를 마쳤다. 켜면 D-day 띠와 바뀐 안내 목록에서 빠진다 */
  moveDone?: boolean;
  /** 배우자·자녀와 함께 산다 */
  family?: boolean;
  /** 건강보험료를 내가 직접 낸다 (지역가입자). false 면 회사가 낸다 */
  nhisSelf?: boolean;
  car?: boolean;
  /** 쓰는 은행 앱 (BANKS 의 한국어 이름) */
  bank?: string;
}

export const VISAS = [
  { id: 'e9', label: ['E-9', 'E-9', 'E-9', 'E-9', 'E-9'] },
  { id: 'e7', label: ['E-7', 'E-7', 'E-7', 'E-7', 'E-7'] },
  { id: 'e8', label: ['E-8', 'E-8', 'E-8', 'E-8', 'E-8'] },
  { id: 'f4', label: ['F-4', 'F-4', 'F-4', 'F-4', 'F-4'] },
  { id: 'f5', label: ['F-5', 'F-5', 'F-5', 'F-5', 'F-5'] },
  { id: 'f6', label: ['F-6', 'F-6', 'F-6', 'F-6', 'F-6'] },
  { id: 'd2', label: ['D-2', 'D-2', 'D-2', 'D-2', 'D-2'] },
  { id: 'h2', label: ['H-2', 'H-2', 'H-2', 'H-2', 'H-2'] },
  { id: 'other', label: ['그 밖', 'Other', '其他', 'Khác', 'अन्य'] },
];

// 양주시 읍·면·동. 읍·면은 건강보험 농어촌 경감(22%) 대상
export const AREAS = [
  { id: 'yangju1', rural: false, label: ['양주1동', 'Yangju 1-dong', '杨州1洞', 'Yangju 1-dong', 'याङ्जु 1-दोङ'] },
  { id: 'yangju2', rural: false, label: ['양주2동', 'Yangju 2-dong', '杨州2洞', 'Yangju 2-dong', 'याङ्जु 2-दोङ'] },
  { id: 'okjeong1', rural: false, label: ['옥정1동', 'Okjeong 1-dong', '玉井1洞', 'Okjeong 1-dong', 'ओक्जङ 1-दोङ'] },
  { id: 'okjeong2', rural: false, label: ['옥정2동', 'Okjeong 2-dong', '玉井2洞', 'Okjeong 2-dong', 'ओक्जङ 2-दोङ'] },
  { id: 'hoecheon1', rural: false, label: ['회천1동', 'Hoecheon 1-dong', '桧泉1洞', 'Hoecheon 1-dong', 'होएचन 1-दोङ'] },
  { id: 'hoecheon2', rural: false, label: ['회천2동', 'Hoecheon 2-dong', '桧泉2洞', 'Hoecheon 2-dong', 'होएचन 2-दोङ'] },
  { id: 'hoecheon3', rural: false, label: ['회천3동', 'Hoecheon 3-dong', '桧泉3洞', 'Hoecheon 3-dong', 'होएचन 3-दोङ'] },
  { id: 'hoecheon4', rural: false, label: ['회천4동', 'Hoecheon 4-dong', '桧泉4洞', 'Hoecheon 4-dong', 'होएचन 4-दोङ'] },
  { id: 'baekseok', rural: true, label: ['백석읍', 'Baekseok-eup', '白石邑', 'Baekseok-eup', 'बेकसोक-उप'] },
  { id: 'eunhyeon', rural: true, label: ['은현면', 'Eunhyeon-myeon', '银现面', 'Eunhyeon-myeon', 'युनह्योन-म्योन'] },
  { id: 'nam', rural: true, label: ['남면', 'Nam-myeon', '南面', 'Nam-myeon', 'नाम-म्योन'] },
  { id: 'gwangjeok', rural: true, label: ['광적면', 'Gwangjeok-myeon', '广积面', 'Gwangjeok-myeon', 'ग्वाङजोक-म्योन'] },
  { id: 'jangheung', rural: true, label: ['장흥면', 'Jangheung-myeon', '长兴面', 'Jangheung-myeon', 'जाङह्युङ-म्योन'] },
];

/** 은행 앱 선택지. 외국어 화면은 영문을 같이 보여 준다 */
export const BANKS = ['KB국민', '신한', '우리', '하나', '농협', '기업', '카카오뱅크', '토스뱅크', '케이뱅크', '새마을금고', '우체국', '수협', '신협'];
export const bankLabel = (ko: string, foreign: boolean) => {
  const en = Object.keys(BANK_EN).find((k) => ko.includes(k));
  return foreign && en ? `${ko} (${BANK_EN[en]})` : ko;
};

export const loadProfile = (): Profile => storage.getJSON<Profile>(STORAGE_KEYS.profile, {});
export const saveProfile = (p: Profile) => storage.setJSON(STORAGE_KEYS.profile, p);
export const clearProfile = () => storage.remove(STORAGE_KEYS.profile);
export const hasProfile = (p: Profile) => Object.values(p).some((v) => v !== undefined && v !== '');
export const areaOf = (p: Profile) => AREAS.find((a) => a.id === p.area);
export const isRural = (area?: string) => !!AREAS.find((a) => a.id === area)?.rural;

/** 업무별 "내 상황" 기본값. 외국인등록은 비자, 이사는 거주 형태, 건강보험은 가족 동거 */
export function defaultType(visitId: string, p: Profile): string {
  if (visitId === 'reg' && p.visa) return VISIT_DETAIL.reg.types.some((ty) => ty.id === p.visa) ? p.visa : 'other';
  if (visitId === 'move' && p.housing) return p.housing;
  if (visitId === 'nhis' && p.family) return 'dependent';
  return '';
}

/** 체류지 변경 신고 기한: 이사한 날부터 15일, F-4 거소신고자는 14일. 신고를 마쳤으면 null (안내할 게 없다) */
export const moveDeadline = (p: Profile) => (p.moveDone ? null : moveDue(p));

/** 신고 완료 여부와 상관없는 기한 계산. 내 정보 화면의 상태 띠가 쓴다 */
export function moveDue(p: Profile): { due: string; days: number; limit: number } | null {
  if (!p.movedOn) return null;
  const limit = p.visa === 'f4' ? 14 : 15;
  const d = parseDate(p.movedOn);
  d.setDate(d.getDate() + limit);
  const due = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { due, days: daysUntil(due), limit };
}

/** 앱이 휴대폰에 저장한 모든 것(내 정보·저장 혜택·납부 기록·설정)을 지운다. 언어는 남긴다 */
export function clearAllData() {
  const keep = STORAGE_KEYS.cardLang;
  try { Object.keys(localStorage).filter((k) => k.startsWith('hy-') && k !== keep).forEach((k) => localStorage.removeItem(k)); } catch { /* 무시 */ }
}
