// 창구 직원에게 보여주는 전체 화면: 한국어 문장 크게 + 내 언어 뜻 + 읽어주기. 참고용 html 의 S.full 블록
import { useEffect, useRef } from 'react';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { VISIT } from '@/data/content';
import { speak } from '@/utils/browser';

export function FullShow({ id }: { id: string }) {
  const { lang, t, tx, closeOverlay, toast } = useApp();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  const v = VISIT.find((x) => x.id === id);
  if (!v) return null;
  return (
    <div className="show" role="dialog" aria-modal="true" aria-label={t('showStaff')}>
      <div className="show-top">
        <small>{t('fullHint')}</small>
        <button type="button" className="icon-btn x" ref={closeRef} onClick={closeOverlay} aria-label={t('aClose')}><Ic n="close" cls="lg" /></button>
      </div>
      <p className="show-ko" lang="ko">{v.say}</p>
      {lang !== 'ko' && <p className="show-mean"><b>{t('meaning')}:</b> {tx(v.sayT)}</p>}
      <button type="button" className="btn secondary" onClick={() => { if (!speak(v.say, 'ko')) toast(t('noVoice')); }}><Ic n="volume" cls="sm" />{t('aSpeakKo')}</button>
    </div>
  );
}
