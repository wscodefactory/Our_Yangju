// 대상·단계별 혜택 목록과 검색. 담당자가 게시한 항목도 같은 기준으로 표시한다.
import { useState } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Callout, LvBadge, Seg, StBadge } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { BenefitCard } from '@/components/welfare/BenefitCard';
import { useApp } from '@/context/AppContext';
import { BEN, GROUPS, STAGES } from '@/data/content';
import type { PublishedBenefit } from '@/types';

const stageName = (s: string) => (STAGES as Record<string, string[]>)[s];

export function WelfareScreen({ g, s }: { g?: string; s?: string }) {
  const { lang, t, tx, published } = useApp();
  const [groupId, setGroupId] = useState(g && GROUPS.some((x) => x.id === g) ? g : 'youth');
  const [stage, setStage] = useState(s || 'job');
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const matchesSearch = (parts: string[]) => parts.join(' ').toLowerCase().includes(term);
  const matchingBenefits = term ? BEN.filter((b) => matchesSearch([...b.name, ...b.what, ...b.who])) : [];
  const matchingPublished = term ? published.filter((p) => matchesSearch([p.name, p.summary, p.who])) : [];
  const group = GROUPS.find((x) => x.id === groupId)!;
  const stages = group.stages ?? [];
  // 그룹을 바꿨는데 고른 단계가 그 그룹에 없으면 첫 단계로
  const currentStage = stages.includes(stage) ? stage : stages[0] ?? '';
  const list = group.soon ? [] : BEN.filter((b) => b.stage === currentStage);
  const publishedItems = group.soon ? [] : published.filter((p) => p.stage === currentStage);
  return (
    <>
      <Title>{t('welT')}</Title>
      {lang !== 'ko' && <Callout kind="info" icon="info" sm style={{ margin: '4px 0' }}>{t('frNote')}</Callout>}
      <div className="search">
        <Ic n="search" cls="sm" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchBen')} aria-label={t('searchBen')} />
        {query && <button type="button" className="icon-btn x" onClick={() => setQuery('')} aria-label={t('aClose')}><Ic n="close" cls="sm" /></button>}
      </div>
      {term ? (
        <div className="stack">
          {matchingBenefits.map((b) => <BenefitCard key={b.id} b={b} />)}
          {matchingPublished.map((p, i) => <PubCard key={p.id ?? i} p={p} />)}
          {!matchingBenefits.length && !matchingPublished.length && <p className="muted">{t('noMatch')}</p>}
        </div>
      ) : (
        <>
          <span className="field-label" id="grp-l">{t('grpLabel')}</span>
          <div className="chips" role="group" aria-labelledby="grp-l">
            {GROUPS.map((x) => (
              <button key={x.id} type="button" className="chip" aria-pressed={x.id === groupId} onClick={() => setGroupId(x.id)}>
                {tx(x.label)}{x.soon && <span className="soon">({t('soon')})</span>}
              </button>
            ))}
          </div>
          {group.soon ? (
            <div className="empty"><span className="ibox tone-amber"><Ic n="calendar" cls="lg" /></span><p>{t('soonMsg')}</p></div>
          ) : (
            <>
              <span className="field-label" id="stg-l">{t('stageLabel')}</span>
              {/* 단계가 하나뿐이면 고를 게 없으니 탭 모양만 두고 탭 순서에서 뺀다 */}
              {stages.length > 1
                ? <Seg items={stages.map((x) => [x, tx(stageName(x))] as [string, string])} value={currentStage} onChange={setStage} ariaLabelledBy="stg-l" />
                : <div className="seg" role="tablist" aria-labelledby="stg-l"><button type="button" role="tab" aria-selected="true" tabIndex={-1}>{tx(stageName(currentStage))}</button></div>}
              <div className="stack" style={{ marginTop: 12 }}>
                {list.map((b) => <BenefitCard key={b.id} b={b} />)}
                {publishedItems.map((p, i) => <PubCard key={p.id ?? i} p={p} />)}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

/** 담당자 게시 혜택. BEN id 가 없어 상세·북마크 없이 카드만, 문구는 한국어뿐 */
function PubCard({ p }: { p: PublishedBenefit }) {
  return (
    <article className="bcard">
      <div className="bcard-main">
        <span className="badges"><LvBadge lv="Y" /><StBadge st="check" /></span>
        <div className="t" lang="ko">{p.name}</div><div className="d" lang="ko">{p.summary}</div>
      </div>
    </article>
  );
}
