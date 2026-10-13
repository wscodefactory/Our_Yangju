// 고지서 흐름 4단계: 할 일. 요약 카드 아래에 납부 / 질문 / 상담 탭.
// 납부 탭은 은행 앱 가상계좌 이체를 1순위로 두고(입금 정보 상자 + 7단계 + 복사), 다른 방법은 접어 둔다.
import { useState, type FormEvent } from 'react';
import { BottomBar, Title } from '@/components/layout/Chrome';
import { Callout, Seg } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { FAQ, TAX_TYPES } from '@/data/content';
import { bankWithEn } from '@/data/links';
import { daysUntil } from '@/i18n';
import { copyText, speak } from '@/utils/browser';
import { buildIcs, downloadIcs } from '@/utils/calendar';
import { paidStore } from '@/utils/paid';
import { hasPii } from '@/utils/pii';
import { allReviewed, useReview } from '@/utils/review';
import { Stepper } from './Stepper';

type Tab = 'pay' | 'faq' | 'help';

/** "농협 790-9999-1234-567 (가상)" → { bank: '농협', acct: '790-9999-1234-567' }. 은행명이 없으면 bank 는 '-' */
function splitVacct(v: string) {
  const m = v.match(/^([^\d]*?)\s*([\d-]+)/);
  return { bank: (m?.[1] || '').trim() || '-', acct: (m?.[2] || v).trim() };
}

export function DocResultScreen() {
  const { lang, t, tx, fmtDate, fmtWon, toast, goHome } = useApp();
  const { doc: d } = useDoc();
  const { state: review } = useReview();
  const [tab, setTab] = useState<Tab>('pay');
  // [납부 완료] 뒤 "기록을 저장할까요?"
  const [askSave, setAskSave] = useState(false);
  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState<string | null>(null);
  if (!d) return null;

  const n = daysUntil(d.due);
  const overdue = n < 0;
  const dd = overdue ? <span className="bdg red">{t('over')}</span>
    : n === 0 ? <span className="bdg red">{t('today')}</span>
    : <span className={`bdg ${n <= 7 ? 'red' : 'orange'}`}>{t('left', { n })}</span>;
  const taxName = tx(TAX_TYPES[d.type]);
  const dueShort = fmtDate(d.due, { year: 'numeric', month: 'long', day: 'numeric' });
  const amount = fmtWon(d.amount);
  const readText = [`${t('docIs')}: ${taxName}`, `${t('amountL')}: ${amount}`, `${t('dueL')}: ${fmtDate(d.due)}`, t('lateShort')].join('. ');
  const copy = (text: string) => { void copyText(text); toast(t('copied')); };
  const foreign = lang !== 'ko';
  const { bank, acct } = splitVacct(d.vacct || '');
  // 외국어 화면에서는 은행 앱에서 찾기 쉽게 은행명에 영문 병기
  const bankShown = foreign ? bankWithEn(bank) : bank;
  const taxKo = TAX_TYPES[d.type][0];
  const koNote = `제목: ${taxKo} 고지서 관련 문의\n\n안녕하세요. 양주시에 사는 외국인 주민입니다.\n${taxKo} 고지서(납부기한 ${d.due.replace(/-/g, '.')}, 금액 ${d.amount.toLocaleString('ko-KR')}원)와 관련해 문의드립니다.\n\n문의 내용: (고지서 내용 확인 요청)\n\n한국어가 서툴러 통역(1345)과 함께 연락드릴 수 있습니다. 감사합니다.`;

  const savePaid = (yes: boolean) => {
    if (yes) { paidStore.add({ type: d.type, amount: d.amount, due: d.due, paidAt: Date.now() }); toast(t('paidSaved')); }
    goHome();
  };

  // 위택스 첫 화면으로 보내면서 전자납부번호를 미리 복사해 둔다. 조회 화면 직접 링크는 로그인 없이 열리는지 미확인이라 보류
  const wetaxLookup = (
    <a className="btn secondary sm" href="https://www.wetax.go.kr" target="_blank" rel="noopener" onClick={() => { if (d.epay) copy(d.epay); }}>
      {t('wetaxLookup')}<Ic n="ext" cls="sm" />
    </a>
  );

  // 7단계. 1·5단계에는 복사 버튼
  const steps: { text: string; copyLabel?: string; copyValue?: string }[] = [
    { text: t('bs1'), copyLabel: t('copyAcct'), copyValue: acct },
    { text: t('bs2') },
    { text: t('bs3', { bank: bankShown }) },
    { text: t('bs4') },
    { text: t('bs5', { amount }), copyLabel: t('copyAmt'), copyValue: String(d.amount) },
    { text: t('bs6') },
    { text: t('bs7') },
  ];

  const payPanel = (
    <div className="stack">
      {d.vacct ? (
        <section className="panel">
          <h2><span className="grow">{t('todoNow')}</span><span className="bdg green">{t('easiest')}</span></h2>
          {/* 기한이 지났으면 가산금 때문에 낼 금액이 고지서와 다르다. 위택스에서 지금 금액 확인이 먼저 */}
          {overdue && (
            <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700 }}>{t('overdueCheckT')}</p>
              <p className="muted" style={{ margin: '0 0 8px' }}>{t('overdueCheckD')}</p>
              {wetaxLookup}
            </div>
          )}
          <p style={{ margin: '0 0 4px', fontWeight: 700 }}>{t('bankT')}</p>
          <p className="muted" style={{ margin: '0 0 10px', ...(overdue ? { color: 'var(--danger)', fontWeight: 600 } : {}) }}>{overdue ? t('overdueSend') : t('bankBy', { d: dueShort })}</p>
          <dl className="kv bankbox" style={{ marginBottom: 12 }}>
            <dt>{t('bankName')}</dt><dd lang="ko">{bankShown}</dd>
            <dt>{t('bankAcct')}</dt>
            <dd><span className="codebox" style={{ margin: 0 }}><code>{acct}</code>
              <button type="button" className="icon-btn copy-btn" onClick={() => copy(acct)} aria-label={t('copyAcct')}><Ic n="copy" cls="sm" /></button></span></dd>
            <dt>{overdue ? t('amountBefore') : t('bankAmt')}</dt>
            <dd><span className="codebox" style={{ margin: 0 }}><code>{amount}</code>
              <button type="button" className="icon-btn copy-btn" onClick={() => copy(String(d.amount))} aria-label={t('copyAmt')}><Ic n="copy" cls="sm" /></button></span></dd>
          </dl>
          <ol className="steps">
            {steps.map(({ text, copyLabel, copyValue }, i) => (
              <li key={i}>
                {/* 복사 버튼은 글 아래 줄에. 옆에 두면 베트남어·네팔어처럼 긴 문장이 한 글자씩 꺾인다 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span>{text}</span>
                  {copyValue && (
                    <div style={{ marginTop: 6 }}>
                      <button type="button" className="btn secondary sm" onClick={() => copy(copyValue)}>
                        <Ic n="copy" cls="sm" />{copyLabel}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <Callout kind="warn" icon="alert" sm style={{ marginTop: 12 }}>{t('scamNote')}</Callout>
        </section>
      ) : (
        <Callout kind="info" icon="info">{t('pay2D')}</Callout>
      )}

      {/* 다른 납부 방법은 접어 두되, 가상계좌가 없으면 이게 전부라 펼친다 */}
      <section className="panel">
        <details className="faq" open={!d.vacct}>
          <summary><Ic n="chev" cls="sm" /><span className="q">{t('otherPayT')}</span></summary>
          <div className="stack" style={{ gap: 10, marginBottom: 12 }}>
            <p style={{ margin: 0 }}>{t('otherCard')}</p>
            {d.epay && (
              <div className="codebox"><span className="sr-only">{t('fEpay')}</span><code>{d.epay}</code>
                <button type="button" className="icon-btn copy-btn" onClick={() => copy(d.epay)} aria-label={`${t('copy')}: ${t('fEpay')}`}><Ic n="copy" cls="sm" /></button>
              </div>
            )}
            {wetaxLookup}
            <p style={{ margin: 0 }}>{t('otherAtm')}</p>
            <p style={{ margin: 0 }}>{t('otherArs')} <a href="tel:142211" aria-label={`${t('call')} 142211`}>142211</a></p>
          </div>
        </details>
      </section>

      <Callout kind="warn" icon="alert">
        <b>{t('lateT')}</b><br />{t('lateE1')} {t('lateE2')} {t('lateE3')}<br />
        <span style={{ opacity: .85, fontSize: '.75rem' }}>{t('basis')}: {t('lateSrc')}</span>
      </Callout>
      {foreign && !allReviewed(lang, review) && <p className="src" style={{ margin: 0 }}><Ic n="info" cls="sm" /><span>{t('draftNote')}</span></p>}
    </div>
  );

  // 자유 질문은 AI 없이 키워드로 FAQ 를 찾아 그 항목만 펼친다. 못 찾으면 범위 밖 안내
  const submitQ = (e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    if (hasPii(q)) { toast(t('piiBlocked')); return; }
    const hit = FAQ.find((f) => f.k.test(q));
    setAsked(hit ? hit.id : 'none');
    setQuestion('');
  };
  const faqPanel = (
    <div className="stack">
      <form className="ask" onSubmit={submitQ}>
        <label className="sr-only" htmlFor="tax-q">{t('askPh')}</label>
        <input id="tax-q" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('askPh')} autoComplete="off" />
        <button type="submit" className="icon-btn" aria-label={t('askSend')}><Ic n="send" /></button>
      </form>
      <p className="hint-line" style={{ margin: 0 }}><Ic n="shield" cls="sm" /><span>{t('chatPrivacy')}</span></p>
      {asked === 'none' && <Callout kind="info" icon="info" sm>{t('faqMiss')}</Callout>}
      <section className="panel">
        {FAQ.map((f) => (
          <details key={f.id} className="faq" open={asked === f.id}>
            <summary><Ic n="chev" cls="sm" /><span className="q">{tx(f.q)}</span></summary>
            <p>{tx(f.a).replace('{due}', dueShort)}</p>
          </details>
        ))}
      </section>
    </div>
  );

  const helpPanel = (
    <div className="stack">
      <section className="list">
        <a className="row" href="tel:1345"><span className="ibox tone-blue"><Ic n="phone" /></span><span className="tx"><span className="t">1345</span><span className="d">{t('interpD')}</span></span><span className="act">{t('call')}</span></a>
        {d.phone && (
          <a className="row" href={`tel:${d.phone.replace(/[^0-9]/g, '')}`}><span className="ibox tone-green"><Ic n="building" /></span><span className="tx"><span className="t">{d.phone}</span><span className="d">{t('officeL')}</span></span><span className="act">{t('call')}</span></a>
        )}
      </section>
      {/* 담당자에게 보여 줄 메모. 받는 쪽이 담당자라 화면 언어와 무관하게 한국어 */}
      <section className="panel">
        <h2>{t('noteKoT')}</h2>
        <div className="codebox" style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
          <code lang="ko" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontWeight: 500, fontSize: '.875rem' }}>{koNote}</code>
        </div>
        <button type="button" className="btn secondary sm" style={{ marginTop: 10 }} onClick={() => copy(koNote)}><Ic n="copy" cls="sm" />{t('copyNote')}</button>
      </section>
      <p className="src" style={{ margin: 0 }}><Ic n="info" cls="sm" /><span>{t('verNote')}</span></p>
    </div>
  );

  return (
    <>
      <Title>{taxName + (d.sample ? ` (${t('sample')})` : '')}</Title>
      {!d.manual && <Stepper step={3} />}
      {/* 질문·상담 탭에서는 요약 카드를 한 줄로 줄여 탭 내용이 한 화면에 들어오게 */}
      <section className={`sum ${tab === 'pay' ? '' : 'compact'}`.trim()} aria-label={`${t('docIs')}: ${taxName}`}>
        <button type="button" className="icon-btn sum-speak" onClick={() => { if (!speak(readText, lang)) toast(t('noVoice')); }} aria-label={t('aRead')}><Ic n="volume" /></button>
        <div className="sum-grid">
          <div>
            <div className="lab">{t('amountL')}</div><div className="val">{amount}</div>
            {d.amountQ && foreign && tab === 'pay' && <div className="orig">{t('asPrinted')} <span lang="ko">{d.amountQ}</span></div>}
          </div>
          <div>
            <div className="lab">{t('dueL')}</div><div className="val sm">{dueShort}</div>{tab === 'pay' && dd}
            {d.dueQ && foreign && tab === 'pay' && <div className="orig" style={{ marginTop: 4 }}>{t('asPrinted')} <span lang="ko">{d.dueQ}</span></div>}
          </div>
        </div>
        {tab === 'pay' && <div className="sum-foot"><Ic n="alert" cls="sm" /><span>{overdue ? t('overdueWarn') : t('lateShort')}</span></div>}
      </section>
      {/* 기한을 휴대폰 달력에 (종일 일정 + 3일 전 알림). 지난 기한은 넣을 이유가 없다 */}
      {tab === 'pay' && !overdue && (
        <button type="button" className="btn secondary sm" style={{ marginTop: 10 }}
          onClick={() => { downloadIcs(`yangju-tax-${d.due}.ics`, buildIcs(t('calEvent', { tax: taxName }), d.due, `${amount} · ${t('calDesc')}`)); toast(t('calAdded')); }}>
          <Ic n="calendar" cls="sm" />{t('addCal')}
        </button>
      )}

      {askSave && (
        <section className="panel" style={{ marginTop: 10 }} aria-labelledby="paid-q">
          <h2 id="paid-q">{t('paidQ')}</h2>
          <p className="muted" style={{ margin: '0 0 10px' }}>{t('paidNote')}</p>
          <div className="btn-row">
            <button type="button" className="btn primary sm" onClick={() => savePaid(true)}>{t('paidSave')}</button>
            <button type="button" className="btn secondary sm" onClick={() => savePaid(false)}>{t('paidNo')}</button>
          </div>
        </section>
      )}

      <div style={{ marginTop: 10 }}>
        <Seg<Tab> items={[['pay', t('payT')], ['faq', t('faqShort')], ['help', t('tabHelp')]]} value={tab} onChange={setTab} />
      </div>
      <div className="tabpanel">{tab === 'pay' ? payPanel : tab === 'faq' ? faqPanel : helpPanel}</div>
      <BottomBar>
        <a className="btn secondary side" href="https://www.wetax.go.kr" target="_blank" rel="noopener" aria-label={t('payWetax')}>
          <Ic n="ext" cls="sm" />Wetax
        </a>
        <button type="button" className="btn primary" onClick={() => setAskSave(true)}><Ic n="check" cls="sm" />{t('paidBtn')}</button>
      </BottomBar>
    </>
  );
}
