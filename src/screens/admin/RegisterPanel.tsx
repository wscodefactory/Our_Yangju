// 담당자 화면 › 혜택 등록 패널.
// 공고문 텍스트를 붙여 넣으면 AI가 ExtractedRule(조건·지원·기간·신청처·서류)을 뽑고,
// 각 항목의 근거 문장(quote)을 원문에 형광펜으로 표시한다. 담당자가 항목을 전부 체크해야만 게시 버튼이 열린다.
// 상태는 AdminScreen이 들고 있고 여기선 state/setState로 받기만 한다(탭 전환 시 보존 때문).
// 원본 html의 #admin 등록 탭 + extractRule()/publishRule().
import { useMemo } from 'react';
import { AiModeBadge, Hint, Note, Thinking } from '@/components/ui/Bits';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { SAMPLE_NOTICE, SAMPLE_RULE } from '@/data/tax';
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

/**
 * 공고문 붙여넣기 → 규칙 초안 → 근거 확인 → 게시.
 * 화면은 busy / rule 없음 / rule 있음 세 상태로 나뉘고 위에서부터 early return.
 */
export function RegisterPanel({ state, setState }: Props) {
  const { T, L, toast, publishBenefit, replaceNav, stageById } = useApp();
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
      // AI 없을 땐 예시 공고 한 건만 미리 뽑아둔 SAMPLE_RULE로 대신한다.
      // 깊은 복사하는 이유: 데이터 모듈의 상수를 state로 넘기면 나중에 누군가 수정했을 때 원본이 오염됨
      if (text.trim() === SAMPLE_NOTICE.trim()) setState({ rule: JSON.parse(JSON.stringify(SAMPLE_RULE)) as ExtractedRule, checks: [] });
      else toast(T('AI 연결이 없어 예시 공고만 처리할 수 있어요', 'Without AI only the sample notice works'));
      return;
    }
    setState({ busy: true });
    try {
      const extracted = await ai.json<ExtractedRule>(extractRulePrompt(text));
      // 새 규칙이면 체크도 처음부터
      setState({ rule: extracted, checks: [], busy: false });
    } catch {
      setState({ busy: false });
      toast(T('읽지 못했어요. 다시 시도하거나 예시 공고로 해 보세요.', 'Could not read it. Try again or use the sample.'));
    }
  };

  const publish = () => {
    if (!rule) return;
    // publishBenefit이 저장소에 넣고, 실제로 들어간 단계(stage)를 돌려준다 — 모르는 stage면 '독립(indep)'으로 떨어짐
    const stage = publishBenefit(ruleToPublished(rule));
    toast(T(`게시했어요 · 청년 › ${L(stage.label)} 단계에 나타나요`, `Published · now under Youth › ${L(stage.label)}`));
    // 게시 직후 시민 화면의 해당 단계로 점프. 스택을 통째로 갈아끼워서 뒤로가기가 홈→복지→청년 순으로 자연스럽게 가게 한다
    replaceNav([{ k: 'home' }, { k: 'welfare' }, { k: 'group', g: 'youth' }, { k: 'stage', s: stage.id }]);
  };

  if (busy) {
    return <Thinking>{T('AI가 공고문에서 조건·서류·기간을 뽑고 있어요… (20~60초)', 'AI is extracting conditions, documents and dates… (20–60 s)')}</Thinking>;
  }

  /* ----- 1단계: 공고문 입력 ----- */
  if (!rule) {
    return (
      <>
        <h1>{T('공고문을 올려 주세요', 'Paste the notice')}{!ai && <AiModeBadge />}</h1>
        <Hint>
          {T('기존 공고문 텍스트를 그대로 붙여 넣으면 AI가 규칙 초안을 만들고, 근거 문장을 형광펜으로 보여줘요. 확인 없이는 게시되지 않아요.',
            'Paste the notice as is. AI drafts the rule and highlights the source sentence for each item. Nothing is published without your check.')}
        </Hint>
        <textarea className="box" aria-label={T('공고문', 'Notice')} value={text} onChange={(e) => setState({ text: e.target.value })} />
        <Stack mt={12}>
          <WideButton arrow={null} label={T('예시 공고 불러오기 (가상)', 'Load a sample notice (fictional)')} onClick={() => setState({ text: SAMPLE_NOTICE })} />
          <WideButton primary label={T('규칙 초안 만들기', 'Draft the rule')} onClick={() => void extract()} />
        </Stack>
      </>
    );
  }

  /* ----- 2단계: 근거 확인 → 게시 ----- */
  // AI가 stage id를 엉뚱하게 줄 수도 있어서 못 찾으면 id 문자열이라도 그대로 보여준다
  const stage = stageById(rule.stage);
  const stageLabel = stage ? L(stage.label) : rule.stage || '';
  return (
    <>
      <h1>{rule.name || ''}</h1>
      <Hint>{T('단계', 'Stage')}: {stageLabel} · {rule.summary || ''}</Hint>
      {/* 원문. 근거 문장은 <mark>로 감싸고 항목 번호를 위첨자로 단다. 아래 체크 목록의 번호와 대응 */}
      <div className="orig" aria-label={T('원문', 'Original')}>
        {parts.map((p, i) => p.mark ? <mark key={i}>{p.text}<sup>{p.mark}</sup></mark> : <span key={i}>{p.text}</span>)}
      </div>
      <Hint style={{ marginTop: 12 }}>
        {T('항목마다 원문과 맞는지 확인하세요', 'Check each item against the original')} ({doneCount}/{items.length})
      </Hint>
      <div className="xlist">
        {items.map((it, i) => (
          <label key={i} className="xitem" htmlFor={`x${i}`}>
            <input
              type="checkbox"
              id={`x${i}`}
              checked={!!checks[i]}
              onChange={(e) => {
                const next = checks.slice();
                next[i] = e.target.checked;
                setState({ checks: next });
              }}
            />
            <span className="n"><sup>{i + 1}</sup> {it.kind} · {it.text}</span>
            {/* quote가 원문에 없으면(AI가 지어냈거나 표현을 바꿨거나) 빨간 경고. 그래도 체크는 할 수 있다 — 판단은 담당자 몫 */}
            <span className={`qt ${it.found ? '' : 'miss'}`}>
              {it.found ? `“${it.quote}”` : T('원문에서 근거를 찾지 못했어요 — 꼭 확인', 'Source not found in the original — check carefully')}
            </span>
          </label>
        ))}
      </div>
      <Stack mt={12}>
        <WideButton primary arrow={null} disabled={!allDone} label={T('확인 완료 → 게시', 'Checked → Publish')} onClick={publish} />
        {/* 원문 텍스트는 남겨두고 규칙만 버린다 — 바로 다시 뽑을 수 있게 */}
        <WideButton arrow={null} label={T('다시 하기', 'Start over')} onClick={() => setState({ rule: null, checks: [] })} />
      </Stack>
      <Note>
        {benefitsStore.shared
          ? T('게시하면 공유 저장소에 저장되어 시민 화면에 바로 나타나요.', 'Published items are saved to the shared store and appear on the citizen view.')
          : T('이 화면에서는 이 기기에만 저장돼요.', 'In this view it is saved on this device only.')}
      </Note>
    </>
  );
}
