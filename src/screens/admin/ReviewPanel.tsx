// 번역 검수 탭. AI 초안 문구(UI_DRAFT_KEYS)를 키마다 한국어 + zh/vi/ne 로 펼치고 언어별 "검수 완료" 체크.
// 검수 결과는 JSON 으로 내려받아 보내고, 받은 쪽은 붙여넣어 적용한다 (서버 없음).
import { useState } from 'react';
import { Callout } from '@/components/ui/Bits';
import { useApp } from '@/context/AppContext';
import { UI, UI_DRAFT_KEYS, type T5 } from '@/data/content';
import { REVIEW_LANGS, useReview, type ReviewLang } from '@/utils/review';

const COL: Record<ReviewLang, number> = { zh: 2, vi: 3, ne: 4 };
const DICT = UI as Record<string, T5>;

export function ReviewPanel() {
  const { T, toast } = useApp();
  const { state, toggle, reset, importJson, exportJson } = useReview();
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const total = UI_DRAFT_KEYS.length;
  const count = (l: ReviewLang) => UI_DRAFT_KEYS.filter((k) => state[k]?.[l]).length;

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `translation-review-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
  };
  const apply = () => {
    try { importJson(pasted); setPasted(''); setPasteOpen(false); toast(T('검수 결과를 적용했어요', 'Review applied')); }
    catch { toast(T('형식이 맞지 않아요', 'Invalid format')); }
  };
  const onReset = () => { if (confirm(T('검수 표시를 모두 지울까요?', 'Clear all review marks?'))) reset(); };

  return (
    <section className="panel">
      <h2>{T('번역 검수', 'Translation review')}</h2>
      <p className="muted">{T('AI 초안 문구를 원어민이 확인하고 언어별로 체크해요. 한 언어가 모두 끝나면 시민 화면의 "AI 초안" 안내가 사라져요.', 'Native speakers check the AI-drafted strings per language. Once a language is fully reviewed, the "AI draft" note disappears from citizen screens.')}</p>
      <div className="badges" style={{ marginTop: 8 }}>
        {REVIEW_LANGS.map((l) => <span key={l} className={`bdg ${count(l) === total ? 'green' : 'gray'}`}>{l.toUpperCase()} {count(l)} / {total} {T('검수 완료', 'reviewed')}</span>)}
      </div>
      <div className="btn-row" style={{ marginTop: 12 }}>
        <button type="button" className="btn secondary sm" onClick={download}>{T('검수 결과 내려받기 (JSON)', 'Download review (JSON)')}</button>
        <button type="button" className="btn secondary sm" onClick={() => setPasteOpen((v) => !v)}>{T('검수 결과 붙여넣기', 'Paste review')}</button>
        <button type="button" className="btn ghost sm" onClick={onReset}>{T('초기화', 'Reset')}</button>
      </div>
      {pasteOpen && (
        <div className="stack" style={{ marginTop: 8 }}>
          <textarea rows={6} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder='{"version":1, ...}'
            style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', background: 'var(--surface)', resize: 'vertical' }} />
          <button type="button" className="btn secondary sm" onClick={apply} disabled={!pasted.trim()}>{T('적용', 'Apply')}</button>
        </div>
      )}
      <Callout kind="info" sm style={{ marginTop: 12 }}>{T('이 기기에만 저장돼요. 검수자에게 JSON 을 보내고, 돌아온 JSON 을 붙여넣어 적용하세요.', 'Stored on this device only. Send the JSON to a reviewer and paste the returned JSON to apply.')}</Callout>
      <div className="list" style={{ marginTop: 12 }}>
        {UI_DRAFT_KEYS.map((k) => (
          <div key={k} className="row" style={{ display: 'block', paddingTop: 12 }}>
            <div className="muted" style={{ fontSize: '.75rem' }}>{k}</div>
            <div lang="ko"><b>{DICT[k]?.[0]}</b></div>
            {REVIEW_LANGS.map((l) => (
              <label key={l} className="check" style={{ alignItems: 'flex-start' }}>
                <input type="checkbox" checked={!!state[k]?.[l]} onChange={(e) => toggle(k, l, e.target.checked)} aria-label={`${k} ${l} ${T('검수 완료', 'reviewed')}`} />
                <span><span className="bdg gray" style={{ marginRight: 6 }}>{l.toUpperCase()}</span><span lang={l}>{DICT[k]?.[COL[l]]}</span></span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
