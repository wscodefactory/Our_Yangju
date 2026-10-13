// 지원 혜택 찾기: 대상 칩 → 단계 탭 → 혜택 카드 목록.
// 끝에 담당자가 게시한 혜택(한국어만)을 같은 단계 기준으로 붙인다.
// 검색어가 있으면 칩·탭을 건너뛰고 전체(내장 + 게시)에서 이름·내용·대상으로 찾는다.
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
  const [grp, setGrp] = useState(g && GROUPS.some((x) => x.id === g) ? g : 'youth');
  const [stage, setStage] = useState(s || 'job');
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const hit = (parts: string[]) => parts.join(' ').toLowerCase().includes(term);
  const found = term ? BEN.filter((b) => hit([...b.name, ...b.what, ...b.who])) : [];
  const foundPubs = term ? published.filter((p) => hit([p.name, p.summary, p.who])) : [];
  const group = GROUPS.find((x) => x.id === grp)!;
  const stages = group.stages ?? [];
  // 그룹을 바꿨는데 고른 단계가 그 그룹에 없으면 첫 단계로
  const cur = stages.includes(stage) ? stage : stages[0] ?? '';
  const list = group.soon ? [] : BEN.filter((b) => b.stage === cur);
  const pubs = group.soon ? [] : published.filter((p) => p.stage === cur);
  return (
    <>
      <Title>{t('welT')}</Title>
      {lang !== 'ko' && <Callout kind="info" icon="info" sm style={{ margin: '4px 0' }}>{t('frNote')}</Callout>}
      <div className="search">
        <Ic n="search" cls="sm" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchBen')} aria-label={t('searchBen')} />
        {q && <button type="button" className="icon-btn x" onClick={() => setQ('')} aria-label={t('aClose')}><Ic n="close" cls="sm" /></button>}
      </div>
      {term ? (
        <div className="stack">
          {found.map((b) => <BenefitCard key={b.id} b={b} />)}
          {foundPubs.map((p, i) => <PubCard key={p.id ?? i} p={p} />)}
          {!found.length && !foundPubs.length && <p className="muted">{t('noMatch')}</p>}
        </div>
      ) : (
        <>
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
              {/* 단계가 하나뿐이면 고를 게 없으니 탭 모양만 두고 탭 순서에서 뺀다 */}
              {stages.length > 1
                ? <Seg items={stages.map((x) => [x, tx(stageName(x))] as [string, string])} value={cur} onChange={setStage} ariaLabelledBy="stg-l" />
                : <div className="seg" role="tablist" aria-labelledby="stg-l"><button type="button" role="tab" aria-selected="true" tabIndex={-1}>{tx(stageName(cur))}</button></div>}
              <div className="stack" style={{ marginTop: 12 }}>
                {list.map((b) => <BenefitCard key={b.id} b={b} />)}
                {pubs.map((p, i) => <PubCard key={p.id ?? i} p={p} />)}
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
