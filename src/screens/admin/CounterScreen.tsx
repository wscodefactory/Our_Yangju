// 담당자 창구 모드. 창구에서 공무원이 자기 기기로 띄워놓고 쓰는 화면이라
// 위는 주민 모국어, 아래는 한국어가 같은 내용으로 나란히 선다.
// 데이터는 시청·주민센터 화면과 같은 VISIT(다섯 언어 배열)을 쓴다. 고정 안내는 AI 번역 없음.
// 아래 Interpreter 는 자유 대화용: 브라우저 음성 인식(Web Speech API) → Gemini 번역 → 음성 합성.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Title } from '@/components/layout/Chrome';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { LANGS, VISIT } from '@/data/content';
import { CS } from '@/data/strings-counter';
import { tx, type Lang } from '@/i18n';
import { getAi } from '@/services/ai';
import { translateToPrompt } from '@/services/prompts';
import { speak } from '@/utils/browser';

// 한국어 주민이면 창구 모드가 필요 없으니 선택지에서 뺀다
const RES_LANGS = LANGS.filter((l) => l.code !== 'ko');

/**
 * 담당자 창구 모드: 주민 언어 패널과 담당자용 한국어 패널을 위아래로.
 * 여기서 고르는 언어(cl)는 로컬 state다. 앱 전체 언어를 건드리면 담당자 기기의 다른 화면까지 바뀌므로 분리.
 * 기본값 'vi'는 양주 외국인 주민 상위 국적 중 하나라서.
 */
export function CounterScreen() {
  const { T } = useApp();
  const [cl, setCl] = useState<Lang>('vi');
  const [taskId, setTaskId] = useState(VISIT[0].id);
  const task = VISIT.find((x) => x.id === taskId) ?? VISIT[0];
  // 주민 쪽 패널은 앱 언어와 무관하게 여기서 고른 언어로
  const my = (arr: string[]) => tx(arr, cl);

  return (
    <div className="stack">
      <Title>{T('창구 모드', 'Counter mode')}</Title>
      <p className="lead" style={{ margin: 0 }}>
        {T('주민의 언어와 업무를 고르면, 주민에게 보여줄 문장(모국어)과 담당자용 문장(한국어)이 함께 나와요.',
          "Pick the resident's language and the task. The resident sees their language, you see Korean.")}
      </p>
      <span className="field-label" style={{ margin: 0 }}>{T('주민 언어', "Resident's language")}</span>
      <div className="chips">
        {RES_LANGS.map((l) => (
          <button key={l.code} type="button" className="chip" aria-pressed={cl === l.code} onClick={() => setCl(l.code as Lang)} lang={l.code}>{l.native}</button>
        ))}
      </div>
      <span className="field-label" style={{ margin: 0 }}>{T('업무', 'Task')}</span>
      <div className="chips">
        {VISIT.map((x) => (
          <button key={x.id} type="button" className="chip" aria-pressed={task.id === x.id} onClick={() => setTaskId(x.id)}>{T(x.name[0], x.name[1])}</button>
        ))}
      </div>

      {/* 주민 쪽 — 라벨까지 전부 그 언어 */}
      <section className="panel say" lang={cl}>
        <h2>{my(task.name)}</h2>
        <p className="ko">{my(task.sayT)}</p>
        <dl className="kv">
          <dt>{my(['어디서', 'Where', '在哪里', 'Ở đâu', 'कहाँ'])}</dt><dd>{my(task.where)}</dd>
          <dt>{my(['언제까지', 'When', '什么时候', 'Khi nào', 'कहिले'])}</dt><dd>{my(task.when)}</dd>
          <dt>{my(['가져갈 것', 'Bring', '携带物品', 'Mang theo', 'ल्याउनुपर्ने'])}</dt>
          <dd><ul style={{ margin: 0, paddingLeft: 18 }}>{task.docs.map((d, i) => <li key={i}>{my(d)}</li>)}</ul></dd>
        </dl>
      </section>

      {/* 담당자 쪽 — UI 언어가 영어여도 한국어 고정. 출처 메모(src)는 이쪽에만 */}
      <section className="panel" lang="ko">
        <h2>{task.name[0]} <span className="bdg gray">한국어 · 담당자</span></h2>
        <p className="ko" style={{ fontWeight: 700, lineHeight: 1.55 }}>{task.say}</p>
        <dl className="kv">
          <dt>어디서</dt><dd>{task.where[0]}</dd>
          <dt>언제까지</dt><dd>{task.when[0]}</dd>
          <dt>가져갈 것</dt><dd><ul style={{ margin: 0, paddingLeft: 18 }}>{task.docs.map((d, i) => <li key={i}>{d[0]}</li>)}</ul></dd>
        </dl>
        {task.src && <p className="src">{task.src[0]}</p>}
      </section>

      <Interpreter cl={cl} />
    </div>
  );
}

/* ---------- 대화 통역 ---------- */

type Who = 'officer' | 'resident';
interface Line { id: number; who: Who; src: string; dst?: string; err?: boolean }

// Web Speech API 는 lib.dom 에 타입이 없어서 쓰는 만큼만 적는다. 크롬은 webkit 접두어 쪽만 있다.
interface SR {
  lang: string; interimResults: boolean; maxAlternatives: number;
  start(): void; abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
const w = (typeof window !== 'undefined' ? window : {}) as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
const SRCtor = w.SpeechRecognition ?? w.webkitSpeechRecognition;

const langOf = (code: Lang) => LANGS.find((l) => l.code === code) ?? LANGS[0];

/**
 * 직원 ↔ 주민 음성 통역. 직원 발화는 주민 언어로, 주민 발화는 한국어로 번역해 로그에 쌓고 바로 읽어준다.
 * 음성 인식이 없는 브라우저(파이어폭스, 일부 웹뷰)에선 안내만 띄우고 글 입력으로 돌린다.
 */
function Interpreter({ cl }: { cl: Lang }) {
  const { T, toast } = useApp();
  const [log, setLog] = useState<Line[]>([]);
  const [listening, setListening] = useState<Who | null>(null);
  const [typer, setTyper] = useState<Who>('officer');
  const [text, setText] = useState('');
  const rec = useRef<SR | null>(null);
  const seq = useRef(0);
  const ai = getAi();
  const res = langOf(cl);

  useEffect(() => () => rec.current?.abort(), []);

  const handle = (who: Who, src: string) => {
    const id = ++seq.current;
    const target: Lang = who === 'officer' ? cl : 'ko';
    setLog((l) => [...l, { id, who, src }]);
    if (!ai) return;
    const patch = (p: Partial<Line>) => setLog((l) => l.map((x) => (x.id === id ? { ...x, ...p } : x)));
    ai.text(translateToPrompt(src, langOf(target).en))
      .then((dst) => { patch({ dst }); if (!speak(dst, target)) toast(T(...CS.noVoice)); })
      .catch(() => { patch({ err: true }); toast(T(...CS.trErr)); });
  };

  const listen = (who: Who) => {
    if (!SRCtor) return;
    rec.current?.abort();
    const r = new SRCtor();
    r.lang = who === 'officer' ? 'ko-KR' : res.locale.split('-u-')[0];
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => { const t = e.results[0]?.[0]?.transcript?.trim(); if (t) handle(who, t); };
    r.onerror = (e) => { if (e.error !== 'aborted') toast(T(...CS.srErr)); };
    r.onend = () => { if (rec.current === r) { rec.current = null; setListening(null); } };
    rec.current = r;
    setListening(who);
    r.start();
  };

  const cancel = () => { rec.current?.abort(); rec.current = null; setListening(null); };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText('');
    handle(typer, t);
  };

  return (
    <section className="panel">
      <h2>{T(...CS.title)}</h2>
      <p className="lead" style={{ margin: '0 0 12px' }}>{T(...CS.lead)}</p>
      {!ai && <p style={{ margin: '0 0 12px' }}><span className="demo-flag">{T(...CS.noAi)}</span></p>}
      {!SRCtor && <div className="callout info" style={{ marginBottom: 12 }}><Ic n="info" cls="sm" />{T(...CS.noSr)}</div>}

      {SRCtor && (listening ? (
        <div className="grid2" style={{ marginBottom: 12 }}>
          <div className="btn secondary" aria-live="polite" lang={listening === 'officer' ? 'ko' : cl}>
            <Ic n="chat" cls="sm" />{listening === 'officer' ? T(...CS.listening) : `${CS.listening[0]} · ${res.native}`}
          </div>
          <button type="button" className="btn primary" onClick={cancel}><Ic n="close" cls="sm" />{T(...CS.cancel)}</button>
        </div>
      ) : (
        <div className="grid2" style={{ marginBottom: 12 }}>
          <button type="button" className="btn primary" onClick={() => listen('officer')}><Ic n="chat" cls="sm" />{T(...CS.officer)}</button>
          <button type="button" className="btn primary" onClick={() => listen('resident')}><Ic n="chat" cls="sm" />{T(...CS.resident)} (<span lang={cl}>{res.native}</span>)</button>
        </div>
      ))}

      {log.length > 0 && (
        <div className="msgs" style={{ marginBottom: 12 }}>
          {log.map((x) => {
            const target: Lang = x.who === 'officer' ? cl : 'ko';
            return (
              <div key={x.id} className={`msg ${x.who === 'officer' ? 'me' : 'bot'}`}>
                <div style={{ fontSize: '.75rem', opacity: .8 }}>{x.who === 'officer' ? T(...CS.whoOfficer) : T(...CS.whoResident)}</div>
                <div lang={x.who === 'officer' ? 'ko' : cl}>{x.src}</div>
                {ai && (
                  <div lang={target} style={{ fontWeight: 700, marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>{x.dst ?? (x.err ? T(...CS.trErr) : T(...CS.translating))}</span>
                    {x.dst && (
                      <button type="button" className="icon-btn" aria-label={T(...CS.replay)} onClick={() => { if (!speak(x.dst!, target)) toast(T(...CS.noVoice)); }}>
                        <Ic n="volume" cls="sm" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 글 입력 (음성 인식이 없거나 소음이 심할 때) */}
      <div className="chips" style={{ marginBottom: 8 }}>
        <button type="button" className="chip" aria-pressed={typer === 'officer'} onClick={() => setTyper('officer')}>{T(...CS.whoOfficer)} · 한국어</button>
        <button type="button" className="chip" aria-pressed={typer === 'resident'} onClick={() => setTyper('resident')}>{T(...CS.whoResident)} · <span lang={cl}>{res.native}</span></button>
      </div>
      <form className="ask" onSubmit={submit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={T(...CS.ph)} lang={typer === 'officer' ? 'ko' : cl} aria-label={T(...CS.ph)} />
        <button type="submit" className="icon-btn" aria-label={T(...CS.send)} disabled={!text.trim()}><Ic n="send" /></button>
      </form>
      {log.length > 0 && (
        <button type="button" className="btn secondary sm" style={{ marginTop: 10 }} onClick={() => setLog([])}>{T(...CS.clear)}</button>
      )}
    </section>
  );
}
