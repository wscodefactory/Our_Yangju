// 카드 언어가 zh/vi/ne일 때 영어 문구를 그 언어로 바꿔 주는 번역 레이어.
// 데이터가 [ko, en]밖에 없어서 나머지 세 언어는 런타임에 AI로 채운다.
// Tr 컴포넌트(화면 문구)와 TaxQScreen(세금 답변)이 쓴다.
import { useEffect, useState } from 'react';
import { getAi } from '@/services/ai';
import { translatePrompt, translateUiPrompt } from '@/services/prompts';
import type { CardLang } from '@/types';

// 캐시를 모듈 레벨에 둔 이유: 같은 문구가 여러 화면·여러 Tr 인스턴스에서 반복해서 나온다
// ("납부 기한", "할 일" 같은 것). 컴포넌트 안에 두면 마운트마다 다시 호출하고,
// Context로 올리면 번역 하나 끝날 때마다 앱 전체가 리렌더된다.
// 새로고침하면 날아가는 세션 캐시이고, 그 정도면 시안에선 충분하다.
// 키에 mode를 넣는 건 같은 영어 문장이라도 ui/plain 프롬프트가 달라 결과가 다르기 때문.
const cache = new Map<string, string>();

/**
 * 영어 문장을 카드 언어(zh/vi/ne)로 번역. ko/en 이거나 AI가 없으면 원문 그대로.
 * 결과는 세션 캐시에 저장.
 * mode 'ui'는 화면 문구용(짧게, 고유명사 괄호 유지), 'plain'은 세금 답변 같은 긴 안내문용.
 * 실패해도 던지지 않고 영어 원문을 돌려준다 — 번역 실패로 화면이 깨지는 것보단 영어가 낫다.
 */
export async function translate(text: string, c: CardLang, mode: 'ui' | 'plain' = 'ui'): Promise<string> {
  if (!text || c === 'ko' || c === 'en') return text;
  const key = `${mode}|${c}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const ai = getAi();
  if (!ai) return text;
  try {
    const prompt = mode === 'ui' ? translateUiPrompt(text, c) : translatePrompt(text, c);
    // cacheKey를 넘겨서 공급자 쪽 캐시도 같은 키로 맞춤 (프롬프트 전문보다 짧고 안정적)
    const out = await ai.text(prompt, { cacheKey: key });
    cache.set(key, out);
    return out;
  } catch {
    return text;
  }
}

/**
 * 렌더 중 번역 상태를 돌려주는 훅: { text, pending }
 * 캐시에 있으면 첫 렌더부터 번역문이 나오고, 없으면 영어를 먼저 보여주다가 도착하면 바꾼다.
 * pending은 Tr이 흐리게 표시하는 데 쓴다.
 */
export function useTranslate(text: string, c: CardLang, mode: 'ui' | 'plain' = 'ui') {
  const needs = !!text && c !== 'ko' && c !== 'en';
  const key = `${mode}|${c}|${text}`;
  const cached = needs ? cache.get(key) : undefined;
  // state에 key를 같이 저장하는 이유: props(text/언어)가 바뀐 직후 한 프레임 동안
  // 이전 문구의 번역문이 새 문구 자리에 보이는 걸 막기 위해. 아래 current에서 key가 다르면 무시한다.
  const [state, setState] = useState<{ key: string; text: string }>({ key, text: cached ?? text });

  useEffect(() => {
    if (!needs) return;
    const hit = cache.get(key);
    if (hit) { setState({ key, text: hit }); return; }
    // 언마운트되거나 key가 바뀐 뒤 늦게 도착한 응답은 버림
    let alive = true;
    translate(text, c, mode).then((t) => { if (alive) setState({ key, text: t }); });
    return () => { alive = false; };
  }, [key, needs, text, c, mode]);

  const current = state.key === key ? state.text : (cached ?? text);
  // 번역 실패 시 translate()가 원문을 돌려주지만 캐시엔 안 넣으므로 pending이 계속 true로 남는다.
  // 그래서 Tr에서 영어가 흐리게 보이는 상태가 유지됨 — "번역 안 됐다"는 표시로 쓰고 있다.
  const pending = needs && !cache.has(key);
  return { text: current, pending };
}
