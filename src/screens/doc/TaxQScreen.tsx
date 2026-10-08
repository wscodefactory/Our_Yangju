// 할 일 카드 › 추가 질문. 세금 고지서에 대한 짧은 채팅 화면.
// AI가 자유롭게 답하지 않는다 — 질문을 TAX_SCENARIOS 중 하나로 "분류"만 하고,
// 답은 팀이 미리 써둔 시나리오 문장에 고지서 값({due} {amount} 등)을 끼워 넣어 보여준다.
// 시나리오 밖(out) 질문은 담당자에게 넘기는 한국어 메모를 만들어 준다.
// 원본 html의 #taxq 섹션 + askTax().
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Crumb } from '@/components/layout/Crumb';
import { Hint } from '@/components/ui/Notes';
import { AiModeBadge } from '@/components/ui/Status';
import { UI } from '@/data/ui';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { translate } from '@/hooks/useTranslate';
import { CARD_TEXT, NOTICE_TEXT, TAX_SCENARIOS, TAX_SOURCE } from '@/data/tax';
import { getAi } from '@/services/ai';
import { classifyPrompt, toKoreanPrompt } from '@/services/prompts';
import type { CardLang, DocData, TaxScenario } from '@/types';
import { daysLeft, dotDate, fmtWon, koNote, leftText } from '@/utils/format';

/** 대화 로그 한 줄. 원본에서는 innerHTML로 div를 붙였는데 여기선 kind별로 렌더한다 */
type Entry =
  | { id: number; kind: 'me'; text: string }
  | { id: number; kind: 'thinking' }
  | { id: number; kind: 'answer'; text: string; src: string; counselQ?: string }
  | { id: number; kind: 'escalate'; text: string; note: string; counselQ: string };
/** 유니온 각 멤버에서 id를 뺀 입력 타입 (push()가 id를 붙여준다) */
type EntryInput = Entry extends infer E ? (E extends Entry ? Omit<E, 'id'> : never) : never;

/**
 * 시나리오 답변의 {due} {left} {amount} {tax} {phone} 치환.
 * 시나리오 문장은 ko/en 두 벌뿐이라, 다른 카드 언어는 일단 영어로 채운 뒤 호출부에서 translate()로 넘긴다.
 * 그래서 c가 'ko'인지 아닌지만 본다.
 */
function fillAnswer(q: TaxScenario, c: CardLang, d: DocData | null, fallbackTax: string) {
  const data = d || {};
  const n = daysLeft(data.due_date);
  const ko = c === 'ko';
  const tax = (data.tax_name && (ko ? data.tax_name.ko : data.tax_name.en || data.tax_name.ko)) || fallbackTax;
  return (q.a?.[ko ? 0 : 1] || '')
    .replace('{due}', dotDate(data.due_date))
    .replace('{left}', leftText(ko ? 'ko' : 'en', n))
    .replace('{amount}', (ko ? CARD_TEXT.ko : CARD_TEXT.en).won.replace('{a}', fmtWon(data.amount_won)))
    .replace('{tax}', tax)
    // 고지서에 전화번호가 없으면 자리 자체를 지운다 (앞 공백 포함)
    .replace('{phone}', data.phone_on_doc ? ` (${data.phone_on_doc})` : '');
}

const PLACEHOLDER: Record<CardLang, string> = {
  ko: '예: 카드로 낼 수 있나요?', en: 'e.g. Can I pay by card?', zh: '例如：可以用卡支付吗？',
  vi: 'Ví dụ: Tôi có thể trả bằng thẻ không?', ne: 'जस्तै: कार्डबाट तिर्न मिल्छ?',
};

/** 할 일 카드 › 추가 질문 */
export function TaxQScreen() {
  const { T, L, cl, go } = useApp();
  const { data, setLastQ } = useDoc();
  const [log, setLog] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const seq = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const t = CARD_TEXT[cl];
  const ai = getAi();

  // 새 항목이 붙을 때마다 맨 아래로
  useEffect(() => { logRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest' }); }, [log]);

  // id를 돌려주는 이유: '생각하고 있어요…' 줄을 나중에 remove()로 빼야 해서
  const push = (entry: EntryInput) => {
    const id = ++seq.current;
    setLog((prev) => [...prev, { ...entry, id } as Entry]);
    return id;
  };
  const remove = (id: number) => setLog((prev) => prev.filter((x) => x.id !== id));

  /**
   * 질문 → 시나리오 id. 'none'이면 매칭 실패.
   * AI가 없으면 정규식(k)만, 있으면 AI 분류를 우선하되 실패하거나 모르는 id를 돌려주면 정규식 결과로 떨어진다.
   * AI가 지어낸 id를 그대로 쓰지 않도록 TAX_SCENARIOS에 있는지 꼭 확인.
   */
  const classify = async (text: string): Promise<string> => {
    const byKeyword = TAX_SCENARIOS.find((q) => q.k.test(text));
    if (!ai) return byKeyword?.id || 'none';
    try {
      const r = await ai.json<{ id?: string }>(classifyPrompt(text));
      return TAX_SCENARIOS.some((q) => q.id === r.id) ? r.id! : (byKeyword?.id || 'none');
    } catch {
      return byKeyword?.id || 'none';
    }
  };

  // 담당자 메모용. 이미 한글이 섞여 있으면 그대로, AI 없으면 원문 그대로
  const toKorean = async (text: string) => {
    if (/[가-힣]/.test(text) || !ai) return text;
    try { return (await ai.text(toKoreanPrompt(text))).trim(); } catch { return text; }
  };

  /** id가 넘어오면(칩 클릭) 분류를 건너뛴다 */
  const answer = async (text: string, id?: string) => {
    push({ kind: 'me', text });
    const thinkingId = push({ kind: 'thinking' });
    const qid = id || await classify(text);
    const scenario = TAX_SCENARIOS.find((x) => x.id === qid);
    remove(thinkingId);

    if (scenario && !scenario.out) {
      // 일반 답변. partial이면 "일부만 답한 것"이라 상담 연결 버튼을 같이 붙인다
      const filled = await translate(fillAnswer(scenario, cl, data, T('이 세금', 'This tax')), cl, 'plain');
      // 답변마다 실제 근거를 붙인다 (프로토타입문구 §7). UI 언어로 표시
      push({ kind: 'answer', text: filled, src: L(TAX_SOURCE[scenario.id] || TAX_SOURCE.default), counselQ: scenario.partial ? text : undefined });
      return;
    }

    // 매칭 안 됨 or out 시나리오 → 답하지 않고 범위 밖 확정 문구(1345 최우선) + 담당자 메모로 넘긴다
    const koQuestion = await toKorean(text);
    setLastQ(koQuestion); // CardScreen에서 q:'' 로 상담에 들어와도 마지막 질문이 메모에 남게
    const msg = await translate(cl === 'ko' ? NOTICE_TEXT.outOfScope[0] : NOTICE_TEXT.outOfScope[1], cl, 'plain');
    push({ kind: 'escalate', text: msg, note: koNote(data, koQuestion), counselQ: koQuestion });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    setInput('');
    void answer(v);
  };

  return (
    <>
      <Crumb path={T('할 일 카드 › 추가 질문', 'Card › Ask')} />
      <h1>{t.ask}{!ai && <AiModeBadge />}</h1>
      {/* 자주 묻는 질문 칩. top 플래그가 있는 시나리오만 */}
      <div className="chips">
        {TAX_SCENARIOS.filter((q) => q.top).map((q) => (
          <button key={q.id} type="button" onClick={() => void answer(cl === 'ko' ? q.q[0] : q.q[1], q.id)}>
            {cl === 'ko' ? q.q[0] : q.q[1]}
          </button>
        ))}
      </div>
      <div className="qlog" ref={logRef}>
        {log.map((e) => {
          if (e.kind === 'me') return <div key={e.id} className="qa me">{e.text}</div>;
          if (e.kind === 'thinking') return <div key={e.id} className="qa"><span className="pill">{T('생각하고 있어요…', 'Thinking…')}</span></div>;
          if (e.kind === 'answer') {
            return (
              <div key={e.id} className="qa" lang={cl}>
                {e.text}
                <span className="src2">{e.src}</span>
                {e.counselQ !== undefined && (
                  <button type="button" className="go" onClick={() => go({ k: 'counsel', q: e.counselQ! })}>{t.counsel} →</button>
                )}
              </div>
            );
          }
          // escalate: 메모는 담당자가 읽을 거라 lang="ko" 고정
          return (
            <div key={e.id} className="qa" lang={cl}>
              {e.text}
              <div className="copybox" style={{ marginTop: 8 }} lang="ko">{e.note}</div>
              <button type="button" className="go" onClick={() => go({ k: 'counsel', q: e.counselQ })}>{t.counsel} →</button>
            </div>
          );
        })}
      </div>
      <Hint>{L(UI.privacy)}</Hint>
      <form className="ask" onSubmit={submit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={PLACEHOLDER[cl]} aria-label={t.ask} autoComplete="off" />
        <button type="submit">{T('보내기', 'Send')}</button>
      </form>
    </>
  );
}
