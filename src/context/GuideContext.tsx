// AI 상담(양주무관) 대화 상태. 사용자의 한 문장을 받아 볼 화면을 추천한다.
//  1. AI(Gemini)가 있으면 guidePrompt 로 생애 단계/고지서 여부를 뽑아 welfare/doc 화면으로
//  2. 없거나 실패하면 INTENTS 정규식(5개 언어 키워드)으로 같은 일을 한다 — 키 없이도 동작해야 하므로
// 메시지 문구는 전부 UI 사전 키(chatHello/chatFound/chatMiss)라 언어가 바뀌면 그대로 따라온다.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { INTENTS, LIFE, STAGES, VISIT } from '@/data/content';
import { getAi } from '@/services/ai';
import { guidePrompt, type GuideResult } from '@/services/prompts';
import type { Screen } from '@/types';
import { useApp } from './AppContext';

export interface GuideMessage {
  id: number;
  /** 사용자가 보낸 말풍선 */
  me?: boolean;
  /** UI 사전 키 (봇 메시지). me 면 text 를 쓴다 */
  key?: string;
  text?: string;
  /** 추천 화면. 있으면 말풍선 아래 이동 버튼 */
  go?: Screen;
}

export interface GuideState {
  messages: GuideMessage[];
  /** 첫 질문 전까지만 예시 칩 */
  showSuggestions: boolean;
  /** 생각 중 표시 */
  busy: boolean;
  ask: (q: string) => Promise<void>;
  /** 추천 화면 제목 (이동 버튼 라벨) */
  routeTitle: (r: Screen) => string;
}

const Ctx = createContext<GuideState | null>(null);

export function GuideProvider({ children }: { children: ReactNode }) {
  const { lang, t, tx } = useApp();
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const seq = useRef(0);
  const push = useCallback((m: Omit<GuideMessage, 'id'>) => setMessages((prev) => [...prev, { ...m, id: ++seq.current }]), []);

  // 언어가 바뀌면 대화를 비움. 이미 쌓인 사용자 말풍선은 한 언어로 굳어 있어서
  useEffect(() => { setMessages([]); }, [lang]);

  const byRules = useCallback((q: string) => {
    const hit = INTENTS.find((i) => i.re.test(q));
    push(hit ? { key: 'chatFound', go: hit.go as Screen } : { key: 'chatMiss' });
  }, [push]);

  const ask = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    push({ me: true, text: q });
    const ai = getAi();
    if (!ai) return byRules(q);
    setBusy(true);
    try {
      const r = await ai.json<GuideResult>(guidePrompt(q));
      if (r.tax_notice) push({ key: 'chatFound', go: { k: 'doc' } });
      else {
        const s = (r.stages || []).find((id) => id in STAGES);
        if (s) {
          const g = s === 'care' ? 'child' : s === 'marry' || s === 'birth' ? 'newly' : 'youth';
          push({ key: 'chatFound', go: { k: 'welfare', g, s } });
        } else byRules(q);
      }
    } catch {
      byRules(q);
    } finally {
      setBusy(false);
    }
  }, [push, byRules]);

  const routeTitle = useCallback((r: Screen): string => {
    if (r.k === 'visitItem') return tx(VISIT.find((v) => v.id === r.id)?.name);
    if (r.k === 'lifeItem') return tx(LIFE.find((v) => v.id === r.id)?.name);
    if (r.k === 'doc') return t('docT');
    if (r.k === 'welfare') return `${t('welT')}${r.s ? `: ${tx((STAGES as Record<string, string[]>)[r.s])}` : ''}`;
    if (r.k === 'explore') return t('exEvents');
    return '';
  }, [t, tx]);

  const value: GuideState = { messages, showSuggestions: messages.length === 0, busy, ask, routeTitle };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGuide(): GuideState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGuide must be used inside <GuideProvider>');
  return v;
}
