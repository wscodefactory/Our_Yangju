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
        {/* 무슨 서비스인지 먼저 (2차 개선점검 3.2). 언어를 고르기 전이라 한국어·영어 병기 */}
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
