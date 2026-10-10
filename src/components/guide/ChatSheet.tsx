// AI 상담(양주무관) 시트. 참고용 html 의 chatSheet. 대화 상태는 GuideContext 가 들고 있다.
import { useEffect, useRef, type FormEvent } from 'react';
import { Sheet } from '@/components/layout/Chrome';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { useGuide } from '@/context/GuideContext';

const SUGS = ['sug1', 'sug2', 'sug3', 'sug4'];

export function ChatSheet() {
  const { t, go, closeOverlay } = useApp();
  const { messages, showSuggestions, busy, ask, routeTitle } = useGuide();
  const input = useRef<HTMLInputElement>(null);

  // 열리면 입력창에 포커스 (Sheet 가 닫기 버튼에 먼저 주므로 한 틱 뒤)
  useEffect(() => { const id = window.setTimeout(() => input.current?.focus(), 30); return () => window.clearTimeout(id); }, []);
  // 새 말풍선이 생기면 맨 아래로
  useEffect(() => { const el = document.getElementById('chat-body'); if (el) el.scrollTop = el.scrollHeight; }, [messages, busy]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const el = input.current;
    if (!el) return;
    void ask(el.value);
    el.value = '';
  };

  return (
    <Sheet
      id="chat-h" bodyId="chat-body" onClose={closeOverlay}
      title={<><span className="ibox tone-green" style={{ width: 32, height: 32, borderRadius: 10 }}><Ic n="chat" cls="sm" /></span>{t('chatTitle')}</>}
      footer={
        <>
          <form className="ask" onSubmit={submit}>
            <label className="sr-only" htmlFor="ask-in">{t('chatTitle')}</label>
            <input id="ask-in" ref={input} autoComplete="off" placeholder={t('chatPh')} />
            <button type="submit" className="icon-btn" aria-label={t('chatSend')}><Ic n="send" /></button>
          </form>
          <p className="hint"><Ic n="shield" cls="sm" />{t('chatPrivacy')}</p>
        </>
      }
    >
      <p className="demo-flag" style={{ margin: '0 0 12px' }}><Ic n="info" cls="sm" />{t('chatDemo')}</p>
      <div className="msgs" aria-live="polite">
        <div className="msg bot">{t('chatHello')}</div>
        {messages.map((m) => {
          if (m.me) return <div key={m.id} className="msg me">{m.text}</div>;
          const dest = m.go;
          return (
            <div key={m.id} className="msg bot">
              {t(m.key ?? '')}
              {/* go() 가 시트를 닫고 history 칸을 바꿔 쓴다. closeOverlay()(=history.back) 를 먼저 부르면 그 popstate 가 새 화면을 도로 빼 버린다 */}
              {dest && (
                <button type="button" className="btn secondary sm" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => go(dest)}>
                  <span>{routeTitle(dest)}</span><Ic n="chev" cls="sm" />
                </button>
              )}
            </div>
          );
        })}
        {busy && <div className="msg bot">…</div>}
      </div>
      {showSuggestions && (
        <div className="sugs">{SUGS.map((k) => <button key={k} type="button" className="chip" onClick={() => { void ask(t(k)); }}>{t(k)}</button>)}</div>
      )}
    </Sheet>
  );
}
