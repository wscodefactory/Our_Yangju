// "양주무관" 채팅 시트. 화면 아래에서 올라오는 모달이고, App.tsx에서 항상 마운트해 두되
// GuideContext.open이 false면 아무것도 그리지 않는다.
// 대화 내용·AI 호출·규칙 매칭은 전부 GuideContext가 갖고 있고, 여기는 보여주고 입력 받는 일만 한다.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ChevronRight, Copy, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useGuide, type GuideMessage } from '@/context/GuideContext';
import { GUIDE_SUGGESTIONS } from '@/data/civic';
import { UI } from '@/data/ui';
import { copyText } from '@/utils/browser';

/**
 * 말풍선 하나. m.me면 오른쪽(내 말).
 * - m.draft: 담당자에게 보여줄 한국어 문의 초안. 복사 버튼이 붙는다
 * - m.action: "이 단계 보기" 같은 행동 버튼 (라벨·핸들러는 메시지를 만든 쪽이 정함)
 */
function Bubble({ m }: { m: GuideMessage }) {
  const { L } = useApp();
  const draftRef = useRef<HTMLDivElement>(null);
  // 복사 결과를 버튼 라벨로 알려준다. null이면 아직 안 누른 것
  const [copyLabel, setCopyLabel] = useState<string | null>(null);

  const onCopy = async () => {
    // 클립보드 API가 막힌 환경(iOS 일부, http)에선 텍스트를 선택만 해주고 길게 눌러 복사하라고 안내
    const r = await copyText(draftRef.current, m.draft);
    setCopyLabel(r === 'copied' ? L(['복사했어요', 'Copied']) : L(['선택했어요. 길게 눌러 복사하세요', 'Selected. Press and hold to copy']));
  };

  return (
    <div className={`bubble${m.me ? ' me' : ''}`}>
      {m.content}
      {m.draft && (
        <>
          {/* 초안은 UI 언어와 상관없이 늘 한국어라 lang="ko" 고정 */}
          <div className="draft" lang="ko" ref={draftRef}>{m.draft}</div>
          <button type="button" className="go" onClick={onCopy}><Copy aria-hidden="true" /> {copyLabel ?? L(['문의 내용 복사', 'Copy the question'])}</button>
        </>
      )}
      {m.action && (
        <button type="button" className="go" onClick={m.action.onClick}>{m.action.label} <ChevronRight aria-hidden="true" /></button>
      )}
    </div>
  );
}

/**
 * 양주무관 대화 시트 본체.
 * 열릴 때 입력창 포커스 + Esc로 닫기, 메시지가 늘면 맨 아래로 스크롤.
 * 배경(.sheet)을 누르면 닫히지만 패널 안쪽 클릭은 버블링돼도 target이 달라서 안 닫힌다.
 */
export function GuideSheet() {
  const { L } = useApp();
  const { open, messages, showSuggestions, closeGuide, ask } = useGuide();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // 시트가 올라오는 트랜지션 중에 focus를 주면 스크롤이 튀어서 살짝 늦춤
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeGuide(); };
    document.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(t); document.removeEventListener('keydown', onKey); };
  }, [open, closeGuide]);

  useEffect(() => {
    // 실제로 스크롤되는 건 .panel이라 chatRef의 부모를 잡는다
    const el = chatRef.current?.parentElement;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // 훅은 전부 위에서 호출했으니 여기서 빠져나가도 안전
  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput('');
    void ask(q);
  };

  return (
    <div className="sheet" onClick={(e) => { if (e.target === e.currentTarget) closeGuide(); }}>
      <div className="panel" role="dialog" aria-modal="true" aria-labelledby="gTitle">
        <h2 id="gTitle">
          {/* 하단 GuideButton의 .av와 같은 모양인데 h2 안이라 크기를 인라인으로 다시 잡았다 */}
          <span className="av" aria-hidden="true" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', color: 'var(--surface)', display: 'grid', placeItems: 'center' }}><MessageCircle /></span>
          <span>{L(UI.gname)}</span>
        </h2>
        <div ref={chatRef}>
          {messages.map((m) => <Bubble key={m.id} m={m} />)}
        </div>
        {/* 추천 질문 칩. 첫 질문을 보내면 GuideContext가 showSuggestions를 끈다 */}
        {showSuggestions && (
          <div className="sugs">
            {GUIDE_SUGGESTIONS.map((s, i) => (
              <button key={i} type="button" onClick={() => void ask(L(s))}>{L(s)}</button>
            ))}
          </div>
        )}
        <p className="hint">{L(UI.privacy)}</p>
        <form className="ask" onSubmit={submit}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            placeholder={L(UI.ph)}
            aria-label={L(UI.askLabel)}
          />
          <button type="submit">{L(UI.send)}</button>
        </form>
      </div>
    </div>
  );
}
