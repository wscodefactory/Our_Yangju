// 혜택 상세: 요약(kv) + 자격/준비물/신청 탭 + 하단 바(저장·문의 메모). 참고용 html 의 SCREENS.benefit.
import { useState } from 'react';
import { BottomBar, Title } from '@/components/layout/Chrome';
import { Checklist, LvBadge, Seg, StBadge } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { BEN } from '@/data/content';
import { APPLY_SITES, CENTER_MAP } from '@/data/links';

type Tab = 'elig' | 'docs' | 'apply';
/** 단계 → 대상 그룹 (GROUPS.stages 와 같다) */
const groupOf = (stage: string) => (stage === 'care' ? 'child' : stage === 'marry' || stage === 'birth' ? 'newly' : 'youth');
type Ans = 'yes' | 'no' | 'unsure';
const ANSWERS: Ans[] = ['yes', 'no', 'unsure'];

export function BenefitScreen({ id }: { id: string }) {
  const { t, tx, fmtRange, isSaved, toggleSaved, toast, openOverlay, go } = useApp();
  const [tab, setTab] = useState<Tab>('elig');
  const [ans, setAns] = useState<Record<number, Ans>>({});
  const b = BEN.find((x) => x.id === id);
  if (!b) return null;
  const when = b.range ? fmtRange(b.range[0], b.range[1]) : tx(b.when);
  const on = isSaved(b.id);
  const vals = Object.values(ans);
  const done = vals.length === b.quiz.length;

  let panel;
  if (tab === 'elig') {
    panel = (
      <section className="panel">
        {b.quiz.map((q, i) => (
          <div key={i} className="quiz-q">
            <p id={`q-${b.id}-${i}`}>{tx(q)}</p>
            <div className="seg" role="group" aria-labelledby={`q-${b.id}-${i}`}>
              {ANSWERS.map((v) => (
                <button key={v} type="button" aria-pressed={ans[i] === v} onClick={() => setAns((p) => ({ ...p, [i]: v }))}>{t(v)}</button>
              ))}
            </div>
          </div>
        ))}
        {done && (vals.includes('no')
          ? <div className="callout warn sm result"><Ic n="alert" cls="sm" /><span>{t('rNo')}<br />
              {/* 해당 안 됨 → 같은 단계의 다른 지원으로 (2차 개선점검 3.1) */}
              <button type="button" className="btn ghost sm" style={{ marginTop: 6, padding: 0 }} onClick={() => go({ k: 'welfare', g: groupOf(b.stage), s: b.stage })}>{t('otherBenefits')}<Ic n="chev" cls="sm" /></button></span></div>
          : vals.includes('unsure')
            ? <div className="callout info sm result"><Ic n="help" cls="sm" /><span>{t('rUn')}</span></div>
            : <div className="callout green sm result"><Ic n="check" cls="sm" /><span>{t('rYes')}</span></div>)}
      </section>
    );
  } else if (tab === 'docs') {
    panel = <section className="panel">{b.docs.length ? <Checklist docs={b.docs.map(tx)} /> : <p style={{ margin: 0 }}>{t('noDocs')}</p>}</section>;
  } else {
    const online = b.ch.t === 'online';
    panel = (
      <section className="panel">
        <div className="badges" style={{ marginBottom: 6 }}>
          <span className={`bdg ${online ? 'blue' : 'green'}`}><Ic n={online ? 'web' : 'building'} cls="sm" />{t(online ? 'online' : 'visit')}</span>
        </div>
        <p style={{ margin: '0 0 8px', fontWeight: 700 }}>{tx(b.ch.where)}</p>
        {/* 신청 바로가기: 온라인은 신청 사이트, 방문은 행정복지센터 지도·운영 시간 (2차 개선점검 3.1·3.6) */}
        <div className="stack" style={{ gap: 8, margin: '0 0 10px' }}>
          {APPLY_SITES.filter((x) => b.ch.where[0].includes(x.match)).map((x) => (
            <a key={x.href} className="btn secondary sm" href={x.href} target="_blank" rel="noopener">{tx(x.label)}<Ic n="ext" cls="sm" /></a>
          ))}
          {!online && (
            <>
              <a className="btn secondary sm" href={CENTER_MAP} target="_blank" rel="noopener"><Ic n="pin" cls="sm" />{t('centerMap')}</a>
              <p className="muted" style={{ margin: 0 }}>{t('centerHours')}</p>
            </>
          )}
        </div>
        <p className="muted" style={{ margin: 0 }}>{t('checkDocsFirst')} {t('noteD')}</p>
      </section>
    );
  }

  return (
    <>
      <Title>{tx(b.name)}</Title>
      <div className="badges" style={{ margin: '0 0 8px' }}>
        <LvBadge lv={b.lv as 'C' | 'G' | 'Y'} /><StBadge st={b.st as 'high' | 'check'} />
        {b.example && <span className="bdg gray">{t('example')}</span>}
      </div>
      <section className="panel">
        <dl className="kv">
          <dt>{t('bWhat')}</dt><dd>{tx(b.what)}</dd>
          <dt>{t('bWho')}</dt><dd>{tx(b.who)}</dd>
          <dt>{t('bWhen')}</dt><dd>{when}</dd>
        </dl>
      </section>
      <div style={{ marginTop: 10 }}>
        <Seg<Tab> items={[['elig', t('tabElig')], ['docs', t('tabDocs')], ['apply', t('tabApply')]]} value={tab} onChange={setTab} />
      </div>
      <div className="tabpanel">{panel}</div>
      <BottomBar>
        <button type="button" className="btn secondary side" aria-pressed={on} onClick={() => { toggleSaved(b.id); toast(on ? t('unsavedToast') : t('savedToast')); }}>
          {/* 헤더 북마크(목록 열기)와 구분: 담기 전 '북마크 추가', 담은 뒤 '체크 북마크' (2차 개선점검 3.2) */}
          <Ic n={on ? 'bookmarkCheck' : 'bookmarkPlus'} />{on ? t('savedState') : t('save')}
        </button>
        <button type="button" className="btn primary" onClick={() => openOverlay({ k: 'note', id: b.id })}><Ic n="pencil" cls="sm" />{t('noteBtn')}</button>
      </BottomBar>
    </>
  );
}
