import { LANGS } from '@/data/content';
import type { Lang } from '@/i18n';

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
  /** 큰 글씨 '1' | '0' */
  big: 'hy-big',
  /** 저장한 혜택 id 목록 (JSON) */
  saved: 'hy-saved',
  /** 납부 기록 (JSON, utils/paid.ts) */
  paid: 'hy-paid',
} as const;

/** 음성 합성 지원 여부. SSR 은 안 하지만 혹시 몰라 window 체크를 넣어둠 */
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * 텍스트 읽어주기. 기기에 그 언어 음성이 없으면 재생하지 않고 false 를 돌려준다 → 호출부가 안내 토스트(noVoice).
 * rate 0.95 는 외국어 학습자 기준으로 약간 느리게.
 */
export function speak(text: string, lang: Lang): boolean {
  if (!canSpeak || !text) return false;
  const lg = LANGS.find((l) => l.code === lang) || LANGS[0];
  try {
    const voices = speechSynthesis.getVoices();
    const v = voices.find((x) => x.lang && x.lang.toLowerCase().startsWith(lg.tts));
    if (!v && voices.length) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lg.locale.split('-u-')[0];
    if (v) u.voice = v;
    u.rate = 0.95;
    speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}

/** 재생 중인 음성을 멈춘다. 화면을 나가거나 시트를 닫을 때 AppContext 가 부른다 */
export function stopSpeaking() {
  if (!canSpeak) return;
  try { speechSynthesis.cancel(); } catch { /* 무시 */ }
}

/**
 * 클립보드 복사. clipboard API 가 막힌 환경(http, 구형 웹뷰)에서는 숨은 textarea + execCommand 로 한 번 더 시도.
 * 성공 여부와 무관하게 호출부는 "복사했어요" 토스트를 띄운다 (참고용 html 과 같은 동작).
 */
export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* 무시 */ }
    ta.remove();
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
