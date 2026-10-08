// 브라우저 API 를 감싸는 얇은 래퍼들. localStorage · 음성 읽기 · 클립보드 · Blob 변환.
// 공통점은 "환경에 따라 없거나 예외를 던질 수 있는 것"이라 전부 try/catch 로 감싸고
// 실패해도 앱이 멈추지 않게 조용히 넘어간다. 시연 환경(사생활 모드, 구형 웹뷰)을 염두에 둔 것.

/**
 * localStorage 안전 래퍼. 사파리 사생활 모드나 저장소 차단 설정에서는 getItem 조차 예외를 던지므로
 * 실패하면 null/fallback 을 돌려주고 끝낸다. 저장이 안 돼도 앱은 돌아가야 한다.
 */
export const storage = {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch { /* 저장 못 해도 무시 */ }
  },
  /** JSON 파싱까지 포함. 깨진 값이 들어 있어도 fallback */
  getJSON<T>(key: string, fallback: T): T {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
  },
  setJSON(key: string, value: unknown) {
    this.set(key, JSON.stringify(value));
  },
};

/**
 * localStorage 키 모음. 같은 도메인에 다른 시안이 올라가도 안 섞이게 'hy-' 접두어를 붙여 둔다.
 * 키를 바꾸면 기존 사용자의 저장값(내 혜택, 게시 혜택)이 사라지니 바꾸지 말 것.
 *  lang        UI 언어 ('ko' | 'en')
 *  cardLang    카드 언어 (CardLang)
 *  mine        내 혜택 (혜택 키 → 1)
 *  newBenefits 담당자가 게시한 혜택 목록 (benefitsStore)
 */
export const STORAGE_KEYS = {
  lang: 'hy-lang',
  cardLang: 'hy-cl',
  mine: 'hy-mine',
  newBenefits: 'hy-newb',
  /** 시연 기기에서 직접 넣은 Gemini 키 (빌드 env가 비었을 때만 쓰임). 기기 밖으로 안 나감 */
  geminiKey: 'hy-gemini-key',
} as const;

/** 음성 합성 지원 여부. SSR 은 안 하지만 혹시 몰라 window 체크를 넣어둠 */
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * 텍스트 읽어주기. 이전 발화가 있으면 끊고 새로 시작한다(카드 언어를 바꾸고 다시 누르는 경우).
 * rate 0.95 는 외국어 학습자 기준으로 약간 느리게. 네팔어는 기기에 음성이 없으면 그냥 조용히 끝난다.
 */
export function speak(text: string, bcp47: string) {
  if (!canSpeak || !text) return;
  try {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = bcp47;
    utter.rate = 0.95;
    speechSynthesis.speak(utter);
  } catch { /* 음성 엔진 없음 등. 무시 */ }
}

/**
 * 클립보드 복사. text 를 안 주면 el 의 textContent 를 복사한다.
 * clipboard API 는 https 가 아니거나 사용자 제스처 밖이면 거부되는데, 그럴 땐 el 안의 글자를 전부 선택해 두고
 * 'selected' 를 돌려준다. 호출부는 "길게 눌러 복사하세요" 토스트를 띄우면 된다.
 */
export async function copyText(el: HTMLElement | null, text?: string): Promise<'copied' | 'selected'> {
  const txt = text ?? el?.textContent ?? '';
  try {
    await navigator.clipboard.writeText(txt);
    return 'copied';
  } catch {
    if (el) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    return 'selected';
  }
}

/** Blob → base64 문자열. "data:image/jpeg;base64," 접두어는 떼고 돌려준다 (Gemini inlineData 형식) */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
