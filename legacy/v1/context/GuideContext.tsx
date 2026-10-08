// 양주무관(채팅 안내) 상태. 원본 html의 guideSay/guideAsk/guideRules 묶음을 옮긴 것.
// 메시지 목록·열림 여부를 들고 있고, 사용자의 한 문장을 받아 생애 단계를 추천한 뒤
// replaceNav로 해당 단계 화면에 꽂아 넣는다. AI가 없거나 실패하면 정규식 규칙(GUIDE_RULES)으로 처리.
// AppContext 위에 올라가야 하므로 Provider 순서는 App > Guide.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { GUIDE_RULES, MOVING_RE } from '@/data/civic';
import { UI } from '@/data/ui';
import { getAi } from '@/services/ai';
import { guidePrompt, type GuideResult } from '@/services/prompts';
import type { Benefit, CivicTask } from '@/types';
import { useApp } from './AppContext';

export interface GuideMessage {
  id: number;
  /** 사용자가 보낸 말풍선이면 true. 없으면 양주무관 쪽 */
  me?: boolean;
  /** 문자열뿐 아니라 <b>·칩 같은 JSX도 그대로 넣는다 */
  content: ReactNode;
  /** 메시지 아래 붙는 행동 버튼 */
  action?: { label: string; onClick: () => void };
  /** 복사 가능한 한국어 초안 */
  draft?: string;
}

export interface GuideState {
  open: boolean;
  messages: GuideMessage[];
  /** 첫 질문 전까지만 예시 문장 칩을 보여준다 */
  showSuggestions: boolean;
  openGuide: () => void;
  closeGuide: () => void;
  /** 메시지 추가. 돌려주는 id는 나중에 removeMessage로 지울 때 쓴다 ("생각하고 있어요…" 같은 임시 메시지) */
  say: (content: ReactNode, me?: boolean, extra?: Pick<GuideMessage, 'action' | 'draft'>) => number;
  removeMessage: (id: number) => void;
  /** 사용자의 한 문장 → 단계 추천 */
  ask: (q: string) => Promise<void>;
  /** 혜택 담당자에게 보낼 한국어 문의문 초안 */
  draftInquiry: (b: Benefit) => void;
  /** 민원 업무에 대해 더 물어보기 */
  askAboutTask: (t: CivicTask) => void;
}

const Ctx = createContext<GuideState | null>(null);

export function GuideProvider({ children }: { children: ReactNode }) {
  const app = useApp();
  const { L, T, lang, stageById, replaceNav } = app;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  // 메시지 id 발급용. state로 두면 say가 연달아 불릴 때 같은 id가 나올 수 있어 ref로
  const seq = useRef(0);

  // UI 언어가 바뀌면 대화를 비움 (원본 동작)
  // 이미 쌓인 메시지는 한 언어로 굳어 있어서 번역하느니 처음부터가 깔끔하다
  useEffect(() => { setMessages([]); setShowSuggestions(true); }, [lang]);

  const say = useCallback<GuideState['say']>((content, me, extra) => {
    const id = ++seq.current;
    setMessages((prev) => [...prev, { id, me, content, ...extra }]);
    return id;
  }, []);
  const removeMessage = useCallback((id: number) => setMessages((prev) => prev.filter((m) => m.id !== id)), []);

  // 열 때 대화가 비어 있으면 인사말 한 줄. 이미 대화 중이면 그대로 둠
  const openGuide = useCallback(() => {
    setOpen(true);
    setMessages((prev) => (prev.length ? prev : [{
      id: ++seq.current,
      content: T('안녕하세요, 양주무관이에요. 지금 상황을 한 문장으로 말해 주세요.', 'Hi, I am the Yangju Guide. Tell me your situation in one sentence.'),
    }]));
  }, [T]);
  const closeGuide = useCallback(() => setOpen(false), []);

  // 패널 닫고 홈 > 복지 > 청년 > 단계 순으로 스택을 깔아 준다. 뒤로가기가 자연스럽게 동작하라고 go가 아니라 replaceNav
  const goStage = useCallback((stageId: string) => {
    setOpen(false);
    replaceNav([{ k: 'home' }, { k: 'welfare' }, { k: 'group', g: 'youth' }, { k: 'stage', s: stageId }]);
  }, [replaceNav]);

  // 이사(특히 옥정 신도시 전입) 얘기가 나오면 거주 기간 계산 주의 한 줄 덧붙임
  const movingNote = useCallback(() => say(
    lang === 'en'
      ? <>Some Yangju City benefits count your residence <b>from your move-in date</b>. Check before you move.</>
      : <>양주로 이사 오시면 일부 양주시 혜택은 <b>전입일부터</b> 거주 기간을 계산해요. 이사 전에 확인해 두세요.</>,
  ), [lang, say]);

  /**
   * "이렇게 이해했어요 [칩들] → 가장 먼저 볼 단계는 X" 메시지 + 이동 버튼.
   * AI 경로와 규칙 경로 둘 다 마지막엔 여기로 모인다.
   * stageId는 호출 전에 유효성 확인된 값이어야 함(아래 ! 단언).
   */
  const understood = useCallback((chips: string[], stageId: string) => {
    const stageLabel = L(stageById(stageId)!.label);
    const chipNodes = chips.map((c, i) => <span key={i} className="tag" style={{ marginRight: 4 }}>{c}</span>);
    say(
      lang === 'en'
        ? <>Here is what I understood: {chipNodes}<br />Start with the <b>{stageLabel}</b> stage.</>
        : <>이렇게 이해했어요 {chipNodes}<br />가장 먼저 볼 단계는 <b>{stageLabel}</b>이에요.</>,
      false,
      { action: { label: lang === 'en' ? `See ${stageLabel} benefits` : `${stageLabel} 혜택 보기`, onClick: () => goStage(stageId) } },
    );
  }, [L, lang, say, stageById, goStage]);

  /**
   * 키워드 규칙 (AI 미연결 시)
   * GUIDE_RULES는 [정규식, stageId, [ko,en] 칩] 배열. 매칭된 규칙의 칩을 전부 보여주되
   * 이동할 단계는 첫 번째 매칭 것 하나. 규칙 순서가 곧 우선순위다.
   */
  const askByRules = useCallback((q: string) => {
    const hits = GUIDE_RULES.filter((rule) => rule[0].test(q));
    if (!hits.length) {
      say(T('조금만 더 알려 주세요. 나이대나 지금 상황(취업, 이사, 결혼, 출산 등)을 말해 주시면 찾아드려요.', 'Tell me a little more, like your age or situation (job, moving, marriage, baby).'));
      return;
    }
    understood(hits.map((rule) => L(rule[2])), hits[0][1]);
    if (MOVING_RE.test(q)) movingNote();
    // 영어 UI = 외국인 주민일 가능성이 높아 자격 요건이 다를 수 있다는 안내를 덧붙임
    if (lang === 'en') say(UI.fr[1]);
  }, [L, T, lang, say, understood, movingNote]);

  /**
   * 사용자 입력 처리의 본체.
   *  1. AI 없음(데모 모드) → 바로 규칙 경로
   *  2. AI 있음 → "생각하고 있어요…" 띄우고 guidePrompt로 JSON 요청
   *     - tax_notice면 단계 추천 대신 고지서 찍기 화면으로 안내
   *     - stages 중 실제 존재하는 id만 남기고, 없으면 되묻기
   *  3. 호출 실패/파싱 실패 → 임시 메시지 지우고 규칙 경로로 떨어짐 (사용자는 차이를 못 느끼게)
   */
  const ask = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    setShowSuggestions(false);
    say(q, true);
    const ai = getAi();
    if (!ai) return askByRules(q);
    const thinking = say(T('생각하고 있어요…', 'Thinking…'));
    try {
      const result = await ai.json<GuideResult>(guidePrompt(q));
      removeMessage(thinking);
      if (result.tax_notice) {
        say(T('받은 고지서는 사진으로 찍으면 내 언어로 할 일을 알려드려요.', 'Take a photo of the notice and I will explain what to do in your language.'), false, {
          action: { label: T('받은 문서 찍기', 'Scan a document'), onClick: () => { setOpen(false); replaceNav([{ k: 'home' }, { k: 'doc' }]); } },
        });
        return;
      }
      // 모델이 프롬프트에 없는 id를 지어내는 경우가 있어서 실제 단계만 남긴다
      const ids = (result.stages || []).filter((id) => stageById(id));
      if (!ids.length) {
        say(T('조금만 더 알려 주세요. 지금 상황(취업, 이사, 결혼, 출산, 세금 고지서 등)을 말해 주세요.', 'Tell me a little more, like your situation (job, moving, marriage, baby, a tax notice).'));
        return;
      }
      // 칩은 최대 4개. 그 이상이면 말풍선이 지저분해진다
      understood((result.facts || []).slice(0, 4).map((f) => T(f.ko, f.en)), ids[0]);
      if (result.moving) movingNote();
    } catch {
      removeMessage(thinking);
      askByRules(q);
    }
  }, [T, say, removeMessage, askByRules, understood, movingNote, stageById, replaceNav]);

  /**
   * 혜택 상세의 "담당자에게 물어보기". 사용자 UI 언어와 무관하게 초안은 항상 한국어 —
   * 받는 쪽이 시청 담당자라서. 영어 UI면 자기소개를 '외국인 주민'으로 바꿔 준다.
   * who/quiz는 Text(문자열 또는 [ko,en])라 한국어 쪽을 직접 꺼낸다.
   */
  const draftInquiry = useCallback((b: Benefit) => {
    const who = typeof b.who === 'string' ? b.who : b.who[0];
    const checked = b.quiz.map((q) => (typeof q === 'string' ? q : q[0])).join(' / ');
    const ko = `제목: ${b.name[0]} 신청 자격 문의\n\n안녕하세요. 양주시에 살고 있는 ${lang === 'en' ? '외국인 주민' : '청년'}입니다.\n${who} 조건과 관련해 제 상황에서 신청할 수 있는지 확인 부탁드립니다.\n\n확인한 내용: ${checked}`;
    say(
      lang === 'en'
        ? <>I wrote your question about <b>{b.name[1]}</b> <b>in Korean</b> for the office. Edit it if you need to.</>
        : <><b>{b.name[0]}</b> 담당자에게 보낼 문의를 정리했어요. 고쳐서 쓰세요.</>,
      false,
      { draft: ko },
    );
  }, [lang, say]);

  // 민원 업무 화면(TaskScreen)에서 진입. 패널을 열고 인사말(비어 있을 때만) + 업무 이름을 넣은 안내 한 줄
  const askAboutTask = useCallback((t: CivicTask) => {
    setOpen(true);
    setMessages((prev) => (prev.length ? prev : [{ id: ++seq.current, content: T('안녕하세요, 양주무관이에요.', 'Hi, I am the Yangju Guide.') }]));
    say(
      lang === 'en'
        ? <>Ask anything about <b>{t.name[1]}</b>. I will turn it into a Korean note for the officer.</>
        : <><b>{t.name[0]}</b>에 대해 더 궁금한 것을 적어 주세요. 담당자에게 보여줄 한국어 메모로 바꿔 드릴게요.</>,
    );
  }, [T, lang, say]);

  const value: GuideState = { open, messages, showSuggestions, openGuide, closeGuide, say, removeMessage, ask, draftInquiry, askAboutTask };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGuide(): GuideState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGuide must be used inside <GuideProvider>');
  return v;
}
