// 담당자 화면 › 혜택 등록 패널.
// 공고문 텍스트를 붙여 넣으면 AI가 ExtractedRule(조건·지원·기간·신청처·서류)을 뽑고,
// 각 항목의 근거 문장(quote)을 원문에 형광펜으로 표시한다. 담당자가 항목을 전부 체크해야만 게시 버튼이 열린다.
// 상태는 AdminScreen이 들고 있고 여기선 state/setState로 받기만 한다(탭 전환 시 보존 때문).
import { useMemo } from 'react';
import { Callout } from '@/components/ui/Bits';
import { useApp } from '@/context/AppContext';
import { SAMPLE_NOTICE, SAMPLE_RULE } from '@/data/admin';
import { STAGES } from '@/data/content';
import { getAi } from '@/services/ai';
import { benefitsStore } from '@/services/benefitsStore';
import { extractRulePrompt } from '@/services/prompts';
import type { ExtractedRule } from '@/types';
import { highlightParts, ruleToPublished, toCheckItems } from '@/utils/rule';

export interface RegisterState {
  /** 붙여 넣은 공고문 원문 */
  text: string;
  /** AI(또는 샘플)가 뽑은 규칙. null이면 아직 입력 단계 */
  rule: ExtractedRule | null;
  /** 확인 항목별 체크 여부. items와 같은 인덱스 */
  checks: boolean[];
  busy: boolean;
}
export const initialRegisterState: RegisterState = { text: '', rule: null, checks: [], busy: false };

interface Props {
  state: RegisterState;
  /** 부분 갱신. AdminScreen에서 {...s, ...patch}로 합친다 */
  setState: (patch: Partial<RegisterState>) => void;
}

/** 단계 → 시민 복지 화면의 그룹. 모르는 stage는 청년으로 */
const groupOf = (stage: string) => (stage === 'marry' || stage === 'birth' ? 'newly' : stage === 'care' ? 'child' : 'youth');

/**
 * 공고문 붙여넣기 → 규칙 초안 → 근거 확인 → 게시.
 * 화면은 busy / rule 없음 / rule 있음 세 상태로 나뉘고 위에서부터 early return.
 */
export function RegisterPanel({ state, setState }: Props) {
  const { T, tx, toast, publishBenefit, replaceNav } = useApp();
  const ai = getAi();
  const { text, rule, checks, busy } = state;

  // 규칙을 체크 항목 리스트로 펴고(found = 원문에 quote가 실제로 있는지), 그걸로 원문을 조각낸다.
  // 원문이 길 수 있어서 체크박스 토글마다 다시 계산하지 않도록 memo.
  const items = useMemo(() => (rule ? toCheckItems(rule, text) : []), [rule, text]);
  const parts = useMemo(() => (rule ? highlightParts(text, items) : []), [rule, text, items]);
  const doneCount = items.filter((_, i) => checks[i]).length;
  // 항목이 0개인 규칙은 게시 못 하게 — AI가 빈 결과를 돌려준 경우
  const allDone = items.length > 0 && doneCount === items.length;

  const extract = async () => {
    if (!text.trim()) { toast(T('공고문을 넣어 주세요', 'Paste a notice first')); return; }
    if (!ai) {
      // AI 없을 땐 예시 공고 한 건만 미리 뽑아둔 SAMPLE_RULE로 대신한다. 깊은 복사: 데이터 상수가 state로 새지 않게
      if (text.trim() === SAMPLE_NOTICE.trim()) setState({ rule: JSON.parse(JSON.stringify(SAMPLE_RULE)) as ExtractedRule, checks: [] });
      else toast(T('AI 연결이 없어 예시 공고만 처리할 수 있어요', 'Without AI only the sample notice works'));
      return;
    }
    setState({ busy: true });
    try {
      const extracted = await ai.json<ExtractedRule>(extractRulePrompt(text));
      setState({ rule: extracted, checks: [], busy: false });
    } catch {
      setState({ busy: false });
      toast(T('읽지 못했어요. 다시 시도하거나 예시 공고로 해 보세요.', 'Could not read it. Try again or use the sample.'));
    }
  };

  const publish = () => {
    if (!rule) return;
    const pub = ruleToPublished(rule);
    publishBenefit(pub);
    const stageLabel = tx(STAGES[pub.stage as keyof typeof STAGES]) || pub.stage;
    toast(T(`게시했어요 · ${stageLabel} 단계에 나타나요`, `Published · now under ${stageLabel}`));
    // 게시 직후 시민 화면의 해당 단계로 점프. 스택을 갈아끼워서 뒤로가기가 홈으로 가게 한다
    replaceNav([{ k: 'home' }, { k: 'welfare', g: groupOf(pub.stage), s: pub.stage }]);
  };

  if (busy) {
    return <Callout kind="info" icon="info">{T('AI가 공고문에서 조건·서류·기간을 뽑고 있어요… (20~60초)', 'AI is extracting conditions, documents and dates… (20–60 s)')}</Callout>;
  }

  /* ----- 1단계: 공고문 입력 ----- */
  if (!rule) {
    return (
      <section className="panel">
        <h2><span className="grow">{T('공고문을 올려 주세요', 'Paste the notice')}</span>{!ai && <span className="demo-flag">{T('데모 모드', 'Demo mode')}</span>}</h2>
        <p className="muted">
          {T('기존 공고문 텍스트를 그대로 붙여 넣으면 AI가 규칙 초안을 만들고, 근거 문장을 형광펜으로 보여줘요. 확인 없이는 게시되지 않아요.',
            'Paste the notice as is. AI drafts the rule and highlights the source sentence for each item. Nothing is published without your check.')}
        </p>
        <div className="fld" style={{ marginTop: 12 }}>
          <label htmlFor="notice">{T('공고문', 'Notice')}</label>
          <textarea id="notice" rows={10} value={text} onChange={(e) => setState({ text: e.target.value })}
            style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', background: 'var(--surface)', resize: 'vertical' }} />
        </div>
        <div className="stack" style={{ marginTop: 12 }}>
          <button type="button" className="btn secondary" onClick={() => setState({ text: SAMPLE_NOTICE })}>{T('예시 공고 불러오기 (가상)', 'Load a sample notice (fictional)')}</button>
          <button type="button" className="btn primary" onClick={() => void extract()}>{T('규칙 초안 만들기', 'Draft the rule')}</button>
        </div>
      </section>
    );
  }

  /* ----- 2단계: 근거 확인 → 게시 ----- */
  // AI가 stage id를 엉뚱하게 줄 수도 있어서 못 찾으면 id 문자열이라도 그대로 보여준다
  const stageLabel = tx(STAGES[rule.stage as keyof typeof STAGES]) || rule.stage || '';
  return (
    <div className="stack">
      <section className="panel">
        <h2>{rule.name || ''}</h2>
        <div className="badges"><span className="bdg green">{stageLabel}</span>{rule.summary && <span className="bdg gray">{rule.summary}</span>}</div>
        {/* 원문. 근거 문장은 <mark>로 감싸고 항목 번호를 위첨자로 단다. 아래 체크 목록의 번호와 대응 */}
        <div className="codebox" aria-label={T('원문', 'Original')} style={{ whiteSpace: 'pre-wrap', fontSize: '.875rem', lineHeight: 1.6, marginTop: 12 }}>
          <div>{parts.map((p, i) => p.mark ? <mark key={i}>{p.text}<sup>{p.mark}</sup></mark> : <span key={i}>{p.text}</span>)}</div>
        </div>
      </section>
      <section className="panel">
        <h2>{T('항목마다 원문과 맞는지 확인하세요', 'Check each item against the original')}</h2>
        <div className="prog">
          <span className="prog-txt">{doneCount}/{items.length}</span>
          <span className="progress" aria-hidden="true"><i style={{ width: `${items.length ? Math.round((doneCount / items.length) * 100) : 0}%` }} /></span>
        </div>
        {items.map((it, i) => (
          <label key={i} className="check" style={{ alignItems: 'flex-start' }}>
            <input type="checkbox" checked={!!checks[i]} onChange={(e) => { const next = checks.slice(); next[i] = e.target.checked; setState({ checks: next }); }} />
            <span>
              <sup>{i + 1}</sup> {it.kind} · {it.text}
              {/* quote가 원문에 없으면(AI가 지어냈거나 표현을 바꿨거나) 경고. 그래도 체크는 할 수 있다 — 판단은 담당자 몫 */}
              <span className="muted" style={{ display: 'block', color: it.found ? undefined : 'var(--danger)' }}>
                {it.found ? `“${it.quote}”` : T('원문에서 근거를 찾지 못했어요 — 꼭 확인', 'Source not found in the original — check carefully')}
              </span>
            </span>
          </label>
        ))}
        <div className="stack" style={{ marginTop: 12 }}>
          <button type="button" className="btn primary" disabled={!allDone} onClick={publish}>{T('확인 완료, 게시', 'Checked, publish')}</button>
          {/* 원문 텍스트는 남겨두고 규칙만 버린다 — 바로 다시 뽑을 수 있게 */}
          <button type="button" className="btn secondary" onClick={() => setState({ rule: null, checks: [] })}>{T('다시 하기', 'Start over')}</button>
        </div>
        <p className="src">
          {benefitsStore.shared
            ? T('게시하면 공유 저장소에 저장되어 시민 화면에 바로 나타나요.', 'Published items are saved to the shared store and appear on the citizen view.')
            : T('이 화면에서는 이 기기에만 저장돼요.', 'In this view it is saved on this device only.')}
        </p>
      </section>
    </div>
  );
}
