// 내 정보: 비자·사는 곳·거주 형태·가족 동거. 휴대폰 localStorage 에만 두고 서버로 보내지 않는다.
// 이름·번호처럼 식별되는 값은 받지 않는다. 업무 상세의 "내 상황" 기본값과 거주지별 안내에만 쓴다.
import { STORAGE_KEYS, storage } from '@/utils/browser';

export interface Profile {
  /** 체류자격: e9 | e7 | d2 | f6 | f4 | h2 | other */
  visa?: string;
  /** 읍·면·동 id (AREAS) */
  area?: string;
  /** 거주 형태: visit-detail 의 move 유형 id (own-lease | owner | company | shared) */
  housing?: string;
  /** 배우자·자녀와 함께 산다 */
  family?: boolean;
}

export const VISAS = [
  { id: 'e9', label: ['E-9 비전문취업', 'E-9 Non-professional employment', 'E-9 非专业就业', 'E-9 Lao động phổ thông', 'E-9 गैर-व्यावसायिक रोजगार'] },
  { id: 'e7', label: ['E-7 특정활동', 'E-7 Specific activities', 'E-7 特定活动', 'E-7 Hoạt động đặc thù', 'E-7 विशेष गतिविधि'] },
  { id: 'd2', label: ['D-2 · D-4 유학·어학연수', 'D-2 · D-4 Study', 'D-2 · D-4 留学、语言研修', 'D-2 · D-4 Du học', 'D-2 · D-4 अध्ययन'] },
  { id: 'f6', label: ['F-6 결혼이민', 'F-6 Marriage migrant', 'F-6 结婚移民', 'F-6 Kết hôn', 'F-6 विवाह'] },
  { id: 'f4', label: ['F-4 재외동포', 'F-4 Overseas Korean', 'F-4 海外同胞', 'F-4 Kiều bào', 'F-4 प्रवासी कोरियाली'] },
  { id: 'h2', label: ['H-2 방문취업', 'H-2 Working visit', 'H-2 访问就业', 'H-2 Thăm thân lao động', 'H-2 भ्रमण रोजगार'] },
  { id: 'other', label: ['그 밖의 비자', 'Other visa', '其他签证', 'Visa khác', 'अन्य भिसा'] },
];

// 양주시 읍·면·동. 읍·면은 건강보험 농어촌 경감(22%) 대상
export const AREAS = [
  { id: 'yangju1', rural: false, label: ['양주1동', 'Yangju 1-dong', '杨州1洞', 'Yangju 1-dong', 'याङ्जु 1-दोङ'] },
  { id: 'yangju2', rural: false, label: ['양주2동', 'Yangju 2-dong', '杨州2洞', 'Yangju 2-dong', 'याङ्जु 2-दोङ'] },
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

export const loadProfile = (): Profile => storage.getJSON<Profile>(STORAGE_KEYS.profile, {});
export const saveProfile = (p: Profile) => storage.setJSON(STORAGE_KEYS.profile, p);
export const clearProfile = () => storage.remove(STORAGE_KEYS.profile);
export const isRural = (area?: string) => !!AREAS.find((a) => a.id === area)?.rural;

/** 업무별 "내 상황" 기본값. 외국인등록은 비자, 이사는 거주 형태, 건강보험은 가족 동거 */
export function defaultType(visitId: string, p: Profile): string {
  if (visitId === 'reg' && p.visa) return ['e9', 'e7', 'd2', 'f6'].includes(p.visa) ? p.visa : 'other';
  if (visitId === 'move' && p.housing) return p.housing;
  if (visitId === 'nhis' && p.family) return 'dependent';
  return '';
}

/** 앱이 휴대폰에 저장한 모든 것(내 정보·저장 혜택·납부 기록·설정)을 지운다. 언어는 남긴다 */
export function clearAllData() {
  const keep = STORAGE_KEYS.cardLang;
  for (const key of Object.values(STORAGE_KEYS)) if (key !== keep) storage.remove(key);
  // 설치 배너 상태처럼 STORAGE_KEYS 밖에서 쓰는 hy- 키까지
  try { Object.keys(localStorage).filter((k) => k.startsWith('hy-') && k !== keep).forEach((k) => localStorage.removeItem(k)); } catch { /* 무시 */ }
}
