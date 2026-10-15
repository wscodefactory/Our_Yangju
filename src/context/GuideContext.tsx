// 키워드로 화면을 추천하고, 나머지 질문은 내장 근거 자료로 답한다. 대화는 메모리에만 둔다.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { INTENTS, LANGS, LIFE, STAGES, VISIT } from '@/data/content';
import { KNOWLEDGE, type KnowledgeDoc } from '@/data/knowledge';
import { getAi } from '@/services/ai';
import { groundedPrompt } from '@/services/prompts';
import type { Screen } from '@/types';
import { useApp } from './AppContext';

export interface GuideMessage {
  id: number;
  /** 사용자가 보낸 말풍선 */
  me?: boolean;
  /** UI 사전 키 (봇 메시지). me 거나 근거 답변이면 text 를 쓴다 */
  key?: string;
  text?: string;
  /** 추천 화면. 있으면 말풍선 아래 이동 버튼 */
  go?: Screen;
  /** 근거 문서. 있으면 "근거: 제목" 줄 */
  source?: KnowledgeDoc;
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

  const ask = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    push({ me: true, text: q });
    // 규칙이 가장 정확하고 즉시 답한다 ("이사했어요" → 체류지 변경 신고)
    const hit = INTENTS.find((i) => i.re.test(q));
    if (hit) { push({ key: 'chatFound', go: hit.go as Screen }); return; }
    const ai = getAi();
    if (!ai) { push({ key: 'chatMiss' }); return; }
    setBusy(true);
    try {
      const docs = KNOWLEDGE.map((d) => ({ id: d.id, title: d.title[0], text: d.text }));
      const langName = LANGS.find((l) => l.code === lang)?.en ?? 'English';
      const r = await ai.json<{ answer?: string; sourceId?: string | null }>(groundedPrompt(q, docs, langName));
      const src = KNOWLEDGE.find((d) => d.id === r.sourceId);
      const answer = (r.answer || '').trim();
      if (src && answer) push({ text: answer, source: src, go: src.go });
      else push({ key: 'chatMiss' });
    } catch {
      push({ key: 'chatMiss' });
    } finally {
      setBusy(false);
    }
  }, [push, lang]);

  const routeTitle = useCallback((r: Screen): string => {
    if (r.k === 'visitItem') return tx(VISIT.find((v) => v.id === r.id)?.name);
    if (r.k === 'lifeItem') return tx(LIFE.find((v) => v.id === r.id)?.name);
    if (r.k === 'doc') return t('docT');
    if (r.k === 'welfare') return `${t('welT')}${r.s ? `: ${tx((STAGES as Record<string, string[]>)[r.s])}` : ''}`;
    if (r.k === 'explore') return t(r.tab === 'places' ? 'tabPlaces' : r.tab === 'food' ? 'tabFood' : r.tab === 'about' ? 'tabAbout' : 'exEvents');
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
