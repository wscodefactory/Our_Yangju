// "받을 수 있나요?" — 혜택별 예/아니오 사전 확인.
// 질문은 b.quiz 배열(혜택당 1~3개)이고 답은 예 / 아니오 / 잘 모르겠어요 세 가지.
// 자격을 판정하는 게 아니라 "담당자에게 가기 전에 큰 조건만 걸러 주는" 용도라 결과 문구도 전부 완곡하다.
import { useState } from 'react';
import { Crumb } from '@/components/layout/Crumb';
import { BenefitTile } from '@/components/ui/BenefitTile';
import { ResultBox } from '@/components/ui/Cards';
import { ForeignNote } from '@/components/ui/Notes';
import { Grid, Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { useGuide } from '@/context/GuideContext';
import { UI } from '@/data/ui';
import { canSpeak, speak } from '@/utils/browser';

// y 예 / n 아니오 / u 잘 모르겠어요
type Answer = 'y' | 'n' | 'u';

/**
 * s, i: ItemScreen과 같은 (단계 id, 인덱스) 쌍.
 *
 * 진행 상태(step, ans)는 이 컴포넌트 로컬. 뒤로 갔다 오면 처음부터인데 질문이 몇 개 안 돼서 괜찮다고 봤다.
 * ScreenRouter가 `${s}:${i}`를 key로 주기 때문에 다른 혜택의 퀴즈로 바뀌면 state가 자동으로 리셋된다.
 *
 * 흐름 규칙:
 * - '아니오'를 누르면 남은 질문을 건너뛰고 바로 결과로 간다 (step을 q.length로 점프).
 *   질문이 전부 필수 조건이라 하나라도 아니면 더 물을 이유가 없고, 원본도 그랬다.
 * - '잘 모르겠어요'는 다음 질문으로 넘어간다. 끝까지 가서 결과를 낼 때 u가 섞여 있으면 "확인 필요"로.
 *
 * 결과는 세 갈래. 우선순위는 n > u > y:
 *   1) n이 하나라도 → "조건이 달라요" + 같은 단계의 다른 혜택 타일(자기 자신은 뺌)
 *   2) u가 하나라도 → "한 가지만 확인하면 돼요" + 양주무관에게 문의 초안 맡기기 / 준비물 먼저 보기
 *   3) 전부 y     → "신청 가능성이 높아요" + 준비물 챙기기 / 신청하러 가기
 * n은 바로 점프하니까 ans에 n이 있으면 항상 마지막 원소지만, 규칙을 includes로 적어 두는 게 읽기 편해서 그대로.
 */
export function QuizScreen({ s, i }: { s: string; i: number }) {
  const { L, lang, go, stageById } = useApp();
  const { openGuide, draftInquiry } = useGuide();
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Answer[]>([]);

  const st = stageById(s);
  const b = st?.items[i];
  if (!st || !b) return null;
  const q = b.quiz;

  const answer = (v: Answer) => {
    setAns((a) => [...a, v]);
    // '아니오'면 바로 결과로
    setStep(v === 'n' ? q.length : step + 1);
  };

  /* ----- 질문 중 ----- */
  if (step < q.length) {
    const text = L(q[step]);
    return (
      <>
        <Crumb path={`${L(b.name)} › ${L(UI.check)}`} />
        {/* 진행 점: 지금 것까지 채움(.d) */}
        <div className="prog">{q.map((_, j) => <i key={j} className={j <= step ? 'd' : ''} />)}</div>
        <p className="q">{text}</p>
        {canSpeak && (
          // 질문은 UI 언어(ko/en)로만 나오니까 낭독 언어도 둘 중 하나
          <button type="button" className="speak" style={{ margin: '-12px 0 16px' }} onClick={() => speak(text, lang === 'en' ? 'en-US' : 'ko-KR')}>
            {L(['읽어주기', 'Read aloud'])}
          </button>
        )}
        <div className="yn">
          <WideButton primary center label={L(UI.yes)} onClick={() => answer('y')} />
          <WideButton center label={L(UI.no)} onClick={() => answer('n')} />
        </div>
        <WideButton center style={{ marginTop: 12 }} label={L(UI.unsure)} onClick={() => answer('u')} />
      </>
    );
  }

  /* ----- 결과 ----- */
  const crumb = <Crumb path={`${L(b.name)} › ${L(UI.result)}`} />;
  if (ans.includes('n')) {
    return (
      <>
        {crumb}
        <ResultBox kind="check" title={L(UI.rNo)} sub={L(UI.rNoS)} />
        <Grid>
          {st.items.map((other, j) => (j === i ? null : <BenefitTile key={j} stageId={s} index={j} b={other} />))}
        </Grid>
      </>
    );
  }
  if (ans.includes('u')) {
    return (
      <>
        {crumb}
        <ResultBox kind="check" title={L(UI.rUn)} sub={L(UI.rUnS)} />
        <Stack>
          {/* openGuide가 먼저. 메시지가 비어 있을 때만 인사말을 넣기 때문에, 초안을 먼저 넣으면 인사말 없이 시작한다 */}
          <WideButton primary label={L(UI.rAsk)} onClick={() => { openGuide(); draftInquiry(b); }} />
          <WideButton label={L(UI.docsFirst)} onClick={() => go({ k: 'docs', s, i })} />
        </Stack>
      </>
    );
  }
  return (
    <>
      {crumb}
      <ResultBox kind="high" title={L(UI.rYes)} sub={L(UI.rYesS)} />
      <Stack>
        <WideButton primary label={L(UI.getDocs)} onClick={() => go({ k: 'docs', s, i })} />
        <WideButton label={L(UI.apply)} onClick={() => go({ k: 'apply', s, i })} />
      </Stack>
      <ForeignNote />
    </>
  );
}
