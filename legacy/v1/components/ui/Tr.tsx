// 카드 언어(zh/vi/ne)로 AI 번역되는 문구 한 조각.
// 홈 화면 인사말, 민원·생활 화면의 안내 문장, 담당자 창구 모드의 손님용 문구가 이걸로 그려진다.
// 원본의 E() 헬퍼 + data-tr 속성 치환 로직을 컴포넌트 하나로 옮긴 것.
import { useApp } from '@/context/AppContext';
import { useTranslate } from '@/hooks/useTranslate';
import type { CardLang } from '@/types';

interface Props {
  ko: string;
  /** 번역의 원문도 이 영어 문장이다. 한국어가 아니라 영어에서 번역하는 게 Gemini 결과가 안정적이었음 */
  en: string;
  /** 카드 언어와 무관하게 이 언어로 강제. 담당자 창구 모드에서 직원 화면은 ko, 손님 쪽 문구만 외국어로 보여줄 때 */
  force?: CardLang;
}

/**
 * 동작 순서:
 * 1. target이 ko/en이면 번역이 필요 없으니 그 문장을 바로 보여준다.
 * 2. zh/vi/ne면 useTranslate가 캐시를 먼저 보고, 없으면 AI를 부른다.
 *    번역이 올 때까지는(pending) 자리표시자로 ko 또는 en을 흐리게(투명도 0.55) 보여주다가
 *    끝나면 같은 자리에 번역문을 바꿔 끼운다. 레이아웃이 튀지 않게 빈 칸 대신 원문을 두는 쪽을 택했다.
 * 3. AI가 없거나 실패하면 useTranslate가 원문(en)을 그대로 돌려주므로 영어로라도 보인다.
 *
 * 자리표시자 언어: force가 있으면 영어(창구 모드는 UI가 한국어여도 손님에겐 영어가 낫다),
 * 아니면 현재 UI 언어를 따른다.
 */
export function Tr({ ko, en, force }: Props) {
  const { lang, cl } = useApp();
  const target = force ?? cl;
  const { text, pending } = useTranslate(en, target);
  const shown = target === 'ko' ? ko : target === 'en' ? en : text;
  const placeholder = force ? en : lang === 'en' ? en : ko;
  return <span style={pending ? { opacity: 0.55 } : undefined}>{pending ? placeholder : shown}</span>;
}
