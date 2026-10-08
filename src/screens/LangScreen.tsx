// 첫 실행 언어 선택. 참고용 html 의 SCREENS.lang. 앱 바 제목 없음.
import { Ic } from '@/components/ui/Ic';
import { LangOptions } from '@/components/ui/LangOptions';
import { HELLO, LANGS } from '@/data/content';

export function LangScreen() {
  return (
    <>
      <section className="welcome">
        <p className="hello">
          {HELLO.map((h, i) => (
            <span key={LANGS[i].code}>{i > 0 && ' / '}<span lang={LANGS[i].code}>{h}</span></span>
          ))}
        </p>
        <h1 tabIndex={-1}><span lang="ko">사용할 언어를 선택하세요</span></h1>
        <p className="sub" lang="en">Choose your language</p>
      </section>
      <LangOptions />
      <p className="muted" style={{ textAlign: 'center', marginTop: 14 }}>
        <Ic n="globe" cls="sm" /> <span lang="ko">나중에 오른쪽 위 지구본 아이콘으로 바꿀 수 있어요.</span><br />
        <span lang="en">You can change it later with the globe icon.</span>
      </p>
    </>
  );
}
