// 첫 실행과 언어 시트에서 함께 사용하는 언어 선택 목록.
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
