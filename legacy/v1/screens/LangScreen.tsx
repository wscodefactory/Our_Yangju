// 첫 방문 언어 선택. localStorage에 카드 언어가 없으면 내비 스택이 이 화면 하나로 시작한다.
// Header의 '언어' 칩, 홈의 "언어명 ✎" 버튼으로도 다시 들어올 수 있다.
import { Note } from '@/components/ui/Notes';
import { useApp } from '@/context/AppContext';
import { CARD_LANGS, LANG_NAME, NATIVE } from '@/data/tax';

/**
 * 언어 버튼 하나를 고르면 AppContext.chooseLanguage가
 * 카드 언어 저장 → UI 언어 결정(ko면 ko, 나머지는 en) → 스택을 홈으로 리셋까지 한 번에 처리한다.
 * 그래서 이 화면엔 Crumb(뒤로가기)이 없다.
 *
 * NATIVE[c]는 [그 언어로 쓴 인사말, 그 언어로 쓴 안내 한 줄] 쌍.
 * 맨 위 환영 줄은 다섯 언어 인사말을 ' · '로 이어 붙인 것.
 */
export function LangScreen() {
  const { T, chooseLanguage } = useApp();
  return (
    <>
      <p className="welcome">{CARD_LANGS.map((c) => NATIVE[c][0]).join(' · ')}</p>
      <h1>{T('언어를 골라 주세요', 'Choose your language')}</h1>
      <div className="langpick">
        {CARD_LANGS.map((c) => (
          <button key={c} type="button" lang={c} onClick={() => chooseLanguage(c)}>
            <span className="nm">{LANG_NAME[c]}</span>
            <span className="sub">{NATIVE[c][1]}</span>
          </button>
        ))}
      </div>
      <Note>
        {T('양주시 외국인 주민이 많은 순서(중국·베트남·네팔)와 영어를 먼저 넣었어요. 벵골어 등은 다음에 추가합니다.',
          'Korean, English and the three largest foreign communities in Yangju (Chinese, Vietnamese, Nepali) come first. More languages later.')}
      </Note>
    </>
  );
}
