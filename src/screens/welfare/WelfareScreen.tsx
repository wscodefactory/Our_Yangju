// 지원 혜택 찾기: 대상 칩 → 단계 탭 → 혜택 카드 목록. 참고용 html 의 SCREENS.welfare.
// 끝에 담당자가 게시한 혜택(한국어만)을 같은 단계 기준으로 붙인다.
import { useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Callout, LvBadge, Seg, StBadge } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { BenefitCard } from '@/components/welfare/BenefitCard';
import { useApp } from '@/context/AppContext';
import { BEN, GROUPS, STAGES } from '@/data/content';

const stageName = (s: string) => (STAGES as Record<string, string[]>)[s];

export function WelfareScreen({ g, s }: { g?: string; s?: string }) {
  const { lang, t, tx, published } = useApp();
  const [grp, setGrp] = useState(g && GROUPS.some((x) => x.id === g) ? g : 'youth');
  const [stage, setStage] = useState(s || 'job');
  const group = GROUPS.find((x) => x.id === grp)!;
  const stages = group.stages ?? [];
  // 그룹에 없는 단계면 첫 단계로
  const cur = stages.includes(stage) ? stage : stages[0] ?? '';
  const list = group.soon ? [] : BEN.filter((b) => b.stage === cur);
  const pubs = group.soon ? [] : published.filter((p) => p.stage === cur);
  return (
    <>
      <Title>{t('welT')}</Title>
      {lang !== 'ko' && <Callout kind="info" icon="info" sm style={{ margin: '4px 0 4px' }}>{t('frNote')}</Callout>}
      <span className="field-label" id="grp-l">{t('grpLabel')}</span>
      <div className="chips" role="group" aria-labelledby="grp-l">
        {GROUPS.map((x) => (
          <button key={x.id} type="button" className="chip" aria-pressed={x.id === grp} onClick={() => setGrp(x.id)}>
            {tx(x.label)}{x.soon && <span className="soon">({t('soon')})</span>}
          </button>
        ))}
      </div>
      {group.soon ? (
        <div className="empty"><span className="ibox tone-amber"><Ic n="calendar" cls="lg" /></span><p>{t('soonMsg')}</p></div>
      ) : (
        <>
          <span className="field-label" id="stg-l">{t('stageLabel')}</span>
          {stages.length > 1
            ? <Seg items={stages.map((x) => [x, tx(stageName(x))] as [string, string])} value={cur} onChange={setStage} ariaLabelledBy="stg-l" />
            : <div className="seg"><button type="button" aria-selected="true" tabIndex={-1}>{tx(stageName(cur))}</button></div>}
          <div className="stack" style={{ marginTop: 12 }}>
            {list.map((b) => <BenefitCard key={b.id} b={b} />)}
            {/* 담당자 게시 혜택: BEN id 가 없어 상세·북마크 없이 카드만 */}
            {pubs.map((p, i) => (
              <article key={p.id ?? i} className="bcard">
                <div className="bcard-main">
                  <span className="badges"><LvBadge lv="Y" /><StBadge st="check" /></span>
                  <div className="t" lang="ko">{p.name}</div><div className="d" lang="ko">{p.summary}</div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
