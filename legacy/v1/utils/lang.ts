import type { Text, UiLang } from '@/types';

// [ko, en] 쌍에서 현재 언어 문자열을 고르는 아주 작은 헬퍼 둘.
// 컴포넌트 안에서는 보통 AppContext 의 L()/T() 를 쓰고, 훅을 못 쓰는 곳(유틸·데이터 가공)에서 이걸 직접 부른다.

/**
 * Text(= Bi | string)에서 현재 UI 언어의 문자열을 고른다.
 * 문자열 하나면 언어 무관 공통 값이라 그대로 돌려준다.
 * en 이 아니면 전부 ko 로 떨어지는 건 UI 언어가 둘뿐이라서. 카드 언어(zh/vi/ne)는 여기 안 거친다.
 */
export const pick = (text: Text, lang: UiLang): string =>
  Array.isArray(text) ? (lang === 'en' ? text[1] : text[0]) : (text as string);

/** 한국어/영어 문자열을 직접 넘겨서 고르는 버전. 데이터에 없는 즉석 문구용 */
export const choose = (lang: UiLang, ko: string, en: string) => (lang === 'en' ? en : ko);
