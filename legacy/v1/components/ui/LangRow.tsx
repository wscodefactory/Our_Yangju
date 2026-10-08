// 카드 언어 고르는 칩 한 줄 (한국어 / English / 中文 / Tiếng Việt / नेपाली).
// 고지서 흐름(DocScreen, CardScreen)과 담당자 창구 모드(CounterScreen)에서 쓴다.
// 첫 방문 언어 선택(LangScreen)은 모양이 달라서 이걸 안 쓰고 따로 그린다.
import { CARD_LANGS, LANG_NAME } from '@/data/tax';
import type { CardLang } from '@/types';

interface Props {
  value: CardLang;
  onChange: (c: CardLang) => void;
  /** 빼고 싶은 언어. 창구 모드는 손님용이라 ko를 뺀다 */
  exclude?: CardLang[];
  ariaLabel?: string;
}

/** 제어 컴포넌트. 선택 상태는 aria-pressed로만 표현하고 색은 css가 처리. 각 버튼에 lang 속성을 줘서 글꼴·낭독이 언어별로 맞게 */
export function LangRow({ value, onChange, exclude = [], ariaLabel = 'language' }: Props) {
  return (
    <div className="langrow" role="group" aria-label={ariaLabel}>
      {CARD_LANGS.filter((c) => !exclude.includes(c)).map((c) => (
        <button key={c} type="button" aria-pressed={value === c} onClick={() => onChange(c)} lang={c}>
          {LANG_NAME[c]}
        </button>
      ))}
    </div>
  );
}
