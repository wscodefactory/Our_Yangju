// 언어 목록(라디오 모양). 첫 실행 화면과 헤더 지구본 시트가 같이 쓴다.
// 각 언어는 자기 문자로 쓰고 영어 이름을 보조로 둔다 (디자인시스템 §8).
import { useApp } from '@/context/AppContext';
import { LANGS } from '@/data/content';
import type { Lang } from '@/i18n';

export function LangOptions() {
  const { lang, langChosen, setLang } = useApp();
  return (
    <div className="opt-list" role="radiogroup" aria-label="Language">
      {LANGS.map((l) => {
        const on = langChosen && lang === l.code;
        return (
          <button key={l.code} type="button" className="opt" role="radio" aria-checked={on} lang={l.code} onClick={() => setLang(l.code as Lang)}>
            <span className="tx"><span className="t">{l.native}</span>{l.en !== l.native && <span className="d" lang="en">{l.en}</span>}</span>
            <span className="radio" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
