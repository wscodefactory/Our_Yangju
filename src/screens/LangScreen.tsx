// 첫 실행 언어 선택. 아직 언어가 없으니 문구는 한국어·영어 병기로 직접 적는다. 앱 바 제목 없음.
import { Callout } from '@/components/ui/Bits';
import { Ic } from '@/components/ui/Ic';
import { LangOptions } from '@/components/ui/LangOptions';
import { useApp } from '@/context/AppContext';
import { HELLO, LANGS, UI } from '@/data/content';

export function LangScreen() {
  const { pendingQr } = useApp();
  return (
    <>
      {/* 고지서 QR 로 들어온 사람에게 왜 언어부터 고르는지 */}
      {pendingQr && (
        <Callout kind="green" icon="file" sm style={{ margin: '8px 0 0' }}>
          <b lang="ko">{UI.qrHere[0]}</b> <span lang="ko">{UI.qrLang[0]}</span><br />
          <span lang="en">{UI.qrHere[1]}. {UI.qrLang[1]}</span>
        </Callout>
      )}
      <section className="welcome">
        <p className="hello">
          {HELLO.map((h, i) => (
            <span key={LANGS[i].code}>{i > 0 && ' / '}<span lang={LANGS[i].code}>{h}</span></span>
          ))}
        </p>
        <h1 tabIndex={-1}><span lang="ko">사용할 언어를 선택하세요</span></h1>
        <p className="sub" lang="en">Choose your language</p>
        <p className="muted" style={{ margin: '0 0 16px' }}>
          <span lang="ko">양주시 외국인 주민을 위한 민원·고지서·혜택·생활 안내</span><br />
          <span lang="en">Yangju City guide to office tasks, tax notices, benefits and daily life</span>
        </p>
      </section>
      <LangOptions />
      <p className="muted" style={{ textAlign: 'center', marginTop: 14 }}>
        <Ic n="globe" cls="sm" /> <span lang="ko">나중에 오른쪽 위 지구본 아이콘으로 바꿀 수 있어요.</span><br />
        <span lang="en">You can change it later with the globe icon.</span>
      </p>
    </>
  );
}
