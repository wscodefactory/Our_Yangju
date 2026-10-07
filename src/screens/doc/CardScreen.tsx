// 받은 문서 흐름의 결과물: "할 일 카드".
// 세금 이름·금액·기한·남은 날짜·할 일 3단계를 카드 언어(cl)로 보여준다.
// 문구는 전부 CARD_TEXT[cl]에서 꺼내 쓰므로 이 파일엔 하드코딩된 다국어 문장이 없다.
// 원본 html의 #card 섹션 + renderCard().
import { Crumb } from '@/components/layout/Crumb';
import { LangRow } from '@/components/ui/LangRow';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { WETAX_URL } from '@/data/info';
import { CARD_TEXT, SPEECH_LANG } from '@/data/tax';
import { canSpeak, speak } from '@/utils/browser';
import { daysLeft, dotDate, fmtWon, leftText, taxNameFor } from '@/utils/format';

/**
 * 할 일 카드 — 내 언어로 "지금 할 일".
 * 여기서 갈라지는 길이 셋: 위택스 납부(외부 링크) / 추가 질문(taxq) / 상담 연결(counsel).
 */
export function CardScreen() {
  const { T, cl, setCardLang, go } = useApp();
  const { data } = useDoc();
  const d = data || {};
  const t = CARD_TEXT[cl];
  // null이면 기한 정보가 없는 것. leftText가 알아서 빈 문자열 처리
  const n = daysLeft(d.due_date);
  // tax_name에 해당 언어 번역이 없으면 영어 → 한국어 순으로 내려간다
  const name = taxNameFor(data, cl);
  const amt = t.won.replace('{a}', fmtWon(d.amount_won));
  // TTS용 전문. 화면 순서 그대로 문장으로 이어 붙인다
  const spoken = `${t.docIs} ${name}. ${t.amount} ${amt}. ${t.due} ${dotDate(d.due_date)}. ${leftText(cl, n)}. ${t.todo}: 1. ${t.s1}. 2. ${t.s2}. 3. ${t.s3}.`;
  // 중국어·베트남어·네팔어 문구는 아직 원어민 검토 전이라 안내 문구를 붙인다
  const draftLang = cl === 'vi' || cl === 'ne' || cl === 'zh';

  return (
    <>
      <Crumb path={T('문서 찍기 › 할 일 카드', 'Scan › Action card')} />
      <LangRow value={cl} onChange={setCardLang} />
      <div className="acard" lang={cl}>
        <p className="k">{t.docIs}</p>
        <h1>{name}</h1>
        <dl className="card">
          <dt>{t.amount}</dt><dd className="big">{amt}</dd>
          <dt>{t.due}</dt>
          <dd>
            <span className="big">{dotDate(d.due_date)}</span><br />
            {/* 일주일 이하 남으면 경고색. 기한 지남(음수)도 여기 포함 */}
            <span className={`pill ${n != null && n <= 7 ? 'warn' : ''}`}>{leftText(cl, n)}</span>
          </dd>
        </dl>
        <div className="todo">
          <b>{t.todo}</b>
          <ol><li>{t.s1}</li><li>{t.s2}</li><li>{t.s3}</li></ol>
        </div>
        {canSpeak && <button type="button" className="speak" onClick={() => speak(spoken, SPEECH_LANG[cl])}>{t.speak}</button>}
        <Stack>
          <WideButton primary href={WETAX_URL} label={t.pay} />
          <WideButton label={t.ask} onClick={() => go({ k: 'taxq' })} />
          {/* 카드에서 바로 상담으로 가면 질문이 없으니 q는 빈 문자열. CounselScreen이 lastQ로 대체한다 */}
          <WideButton label={t.counsel} onClick={() => go({ k: 'counsel', q: '' })} />
        </Stack>
        <p className="note" style={{ margin: 0 }}>
          {t.ver}<br />{t.src}
          {draftLang && <><br />{T('중국어·베트남어·네팔어 문구는 AI 번역 초안이며 원어민 검토 전입니다.', 'Chinese, Vietnamese and Nepali text is an AI draft, not yet reviewed by native speakers.')}</>}
        </p>
      </div>
    </>
  );
}
