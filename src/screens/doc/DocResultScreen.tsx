// 고지서 흐름 4단계: 할 일. 참고용 html 의 SCREENS.docResult 골격(요약 카드 + 납부/FAQ/상담 탭)에
// 「고지서화면_구현요청_26.10.08」요청 ②(은행 앱 가상계좌 이체를 1순위로)를 얹은 화면.
//   요약 → 지금 할 일: 은행 앱 송금(입금 은행·계좌·금액 상자, 7단계, 복사 버튼, 사기 주의)
//   → 다른 납부 방법(접힘: 위택스 카드·ATM·ARS) → 기한이 지나면 → 하단 [위택스] [납부 완료]
import { useState } from 'react';
import { BottomBar, Title } from '@/components/layout/Chrome';
import { Callout, Seg } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { FAQ, TAX_TYPES } from '@/data/content';
import { daysUntil } from '@/i18n';
import { copyText, speak } from '@/utils/browser';
import { paidStore } from '@/utils/paid';
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
  const [tab, setTab] = useState<Tab>('pay');
  // [납부 완료] 뒤 "기록을 저장할까요?" 질문 표시
  const [askSave, setAskSave] = useState(false);
  if (!d) return null;

  const n = daysUntil(d.due);
  const dd = n < 0 ? <span className="bdg red">{t('over')}</span>
    : n === 0 ? <span className="bdg red">{t('today')}</span>
    : <span className={`bdg ${n <= 7 ? 'red' : 'orange'}`}>D-{n} ({t('left', { n })})</span>;
  const taxName = tx(TAX_TYPES[d.type]);
  const dueShort = fmtDate(d.due, { year: 'numeric', month: 'long', day: 'numeric' });
  const amount = fmtWon(d.amount);
  const readText = [`${t('docIs')}: ${taxName}`, `${t('amountL')}: ${amount}`, `${t('dueL')}: ${fmtDate(d.due)}`, t('lateShort')].join('. ');
  const copy = (text: string) => { void copyText(text); toast(t('copied')); };
  const foreign = lang !== 'ko';
  const { bank, acct } = splitVacct(d.vacct || '');

  const onPaid = () => setAskSave(true);
  const savePaid = (yes: boolean) => {
    if (yes) { paidStore.add({ type: d.type, amount: d.amount, due: d.due, paidAt: Date.now() }); toast(t('paidSaved')); }
    setAskSave(false);
    goHome();
  };

  // 7단계. {bank} {amount} 치환. 1·5단계 옆에 복사 버튼
  const steps: { text: string; copyLabel?: string; copyValue?: string }[] = [
    { text: t('bs1'), copyLabel: t('copyAcct'), copyValue: acct },
    { text: t('bs2') },
    { text: t('bs3', { bank }) },
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
          <p style={{ margin: '0 0 4px', fontWeight: 700 }}>{t('bankT')}</p>
          <p className="muted" style={{ margin: '0 0 10px' }}>{t('bankBy', { d: dueShort })}</p>
          {/* 입금 은행 / 계좌번호 / 금액 한 상자 */}
          <dl className="kv" style={{ marginBottom: 12 }}>
            <dt>{t('bankName')}</dt><dd lang="ko">{bank}</dd>
            <dt>{t('bankAcct')}</dt>
            <dd><span className="codebox" style={{ margin: 0 }}><code>{acct}</code>
              <button type="button" className="icon-btn copy-btn" onClick={() => copy(acct)} aria-label={t('copyAcct')}><Ic n="copy" cls="sm" /></button></span></dd>
            <dt>{t('bankAmt')}</dt>
            <dd><span className="codebox" style={{ margin: 0 }}><code>{amount}</code>
              <button type="button" className="icon-btn copy-btn" onClick={() => copy(String(d.amount))} aria-label={t('copyAmt')}><Ic n="copy" cls="sm" /></button></span></dd>
          </dl>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={i}>
                {/* 복사 버튼은 글 아래 줄에. 옆에 두면 베트남어·네팔어처럼 긴 문장이 한 글자씩 꺾인다 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span>{s.text}</span>
                  {s.copyValue && (
                    <div style={{ marginTop: 6 }}>
                      <button type="button" className="btn secondary sm" onClick={() => copy(s.copyValue!)}>
                        <Ic n="copy" cls="sm" />{s.copyLabel}
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

      {/* 다른 납부 방법: 접어 두기 (가상계좌가 없으면 펼침) */}
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
            {/* 위택스 첫 화면으로. 조회 화면 직접 연결 주소는 로그인 없이 열리는지 미확인이라 보류 (구현요청 [위택스 연결 제안]) */}
            <a className="btn secondary sm" href="https://www.wetax.go.kr" target="_blank" rel="noopener" onClick={() => { if (d.epay) copy(d.epay); }}>
              {t('wetaxLookup')}<Ic n="ext" cls="sm" />
            </a>
            <p style={{ margin: 0 }}>{t('otherAtm')}</p>
            <p style={{ margin: 0 }}>{t('otherArs')} <a href="tel:142211" aria-label={`${t('call')} 142211`}>142211</a></p>
          </div>
        </details>
      </section>

      <Callout kind="warn" icon="alert">
        <b>{t('lateT')}</b><br />{t('lateE1')} {t('lateE2')} {t('lateE3')}<br />
        <span style={{ opacity: .85, fontSize: '.75rem' }}>{t('basis')}: {t('lateSrc')}</span>
      </Callout>
      {foreign && <p className="src" style={{ margin: 0 }}><Ic n="info" cls="sm" /><span>{t('draftNote')}</span></p>}
    </div>
  );

  const faqPanel = (
    <div className="stack">
      <section className="panel">
        {FAQ.map((f) => (
          <details key={f.id} className="faq">
            <summary><Ic n="chev" cls="sm" /><span className="q">{tx(f.q)}</span></summary>
            <p>{tx(f.a).replace('{due}', dueShort)}</p>
          </details>
        ))}
      </section>
      <Callout kind="info" icon="info" sm>{t('faqMiss')}</Callout>
      <p className="hint-line"><Ic n="shield" cls="sm" /><span>{t('chatPrivacy')}</span></p>
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
      <p className="src" style={{ margin: 0 }}><Ic n="info" cls="sm" /><span>{t('verNote')}</span></p>
    </div>
  );

  return (
    <>
      <Title>{taxName + (d.sample ? ` (${t('sample')})` : '')}</Title>
      <Stepper step={3} />
      <section className="sum" aria-label={`${t('docIs')}: ${taxName}`}>
        <button type="button" className="icon-btn sum-speak" onClick={() => { if (!speak(readText, lang)) toast(t('noVoice')); }} aria-label={t('aRead')}><Ic n="volume" /></button>
        <div className="sum-grid">
          <div>
            <div className="lab">{t('amountL')}</div><div className="val">{amount}</div>
            {d.amountQ && foreign && <div className="orig">{t('asPrinted')} <span lang="ko">{d.amountQ}</span></div>}
          </div>
          <div>
            <div className="lab">{t('dueL')}</div><div className="val sm">{dueShort}</div>{dd}
            {d.dueQ && foreign && <div className="orig" style={{ marginTop: 4 }}>{t('asPrinted')} <span lang="ko">{d.dueQ}</span></div>}
          </div>
        </div>
        <div className="sum-foot"><Ic n="alert" cls="sm" /><span>{t('lateShort')}</span></div>
      </section>

      {askSave && (
        <section className="panel" style={{ marginTop: 10 }} role="dialog" aria-label={t('paidQ')}>
          <h2>{t('paidQ')}</h2>
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
        <button type="button" className="btn primary" onClick={onPaid}><Ic n="check" cls="sm" />{t('paidBtn')}</button>
      </BottomBar>
    </>
  );
}
