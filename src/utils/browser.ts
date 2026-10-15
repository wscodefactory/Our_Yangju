// 저장소·음성·클립보드·파일 변환. 브라우저가 기능을 지원하지 않거나 차단한 경우도 처리한다.
import { LANGS } from '@/data/content';
import type { Lang } from '@/i18n';

/** localStorage 안전 래퍼. 사파리 사생활 모드나 저장소 차단 설정에서는 getItem 조차 예외를 던진다 */
export const storage = {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch { /* 저장 못 해도 무시 */ }
  },
  /** 깨진 값이 들어 있어도 fallback */
  getJSON<T>(key: string, fallback: T): T {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
  },
  setJSON(key: string, value: unknown) {
    this.set(key, JSON.stringify(value));
  },
  remove(key: string) {
    try { localStorage.removeItem(key); } catch { /* 무시 */ }
  },
};

/** 앱 저장 키. 기존 데이터를 읽을 수 있도록 hy- 접두어와 키 값은 유지한다. */
export const STORAGE_KEYS = {
  /** 고른 언어 (Lang) */
  cardLang: 'hy-cl',
  /** 담당자가 게시한 혜택 목록 (JSON, services/benefitsStore.ts) */
  newBenefits: 'hy-newb',
  /** 시연용 직접 호출 키. 이 브라우저에 저장하며 Claude 요청의 인증에 사용한다. */
  aiKey: 'hy-claude-key',
  /** 큰 글씨 '1' | '0' */
  big: 'hy-big',
  /** 쉬운 한국어 '1' | '0' */
  easy: 'hy-easy',
  /** 저장한 혜택 id 목록 (JSON) */
  saved: 'hy-saved',
  /** 납부 기록 (JSON, utils/paid.ts) */
  paid: 'hy-paid',
  /** 번역 검수 상태 (JSON, utils/review.ts) */
  review: 'hy-review',
  /** 내 정보 (JSON, utils/profile.ts) */
  profile: 'hy-profile',
} as const;

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

/** 해당 언어의 음성이 있으면 읽고, 지원하지 않으면 false를 반환한다. */
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

/** 화면을 나가거나 시트를 닫을 때 AppContext 가 부른다 */
export function stopSpeaking() {
  if (!canSpeak) return;
  try { speechSynthesis.cancel(); } catch { /* 무시 */ }
}

/** 클립보드 API를 사용할 수 없으면 textarea 복사를 시도한다. */
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

/** Blob → base64. "data:image/jpeg;base64," 접두어는 떼고 돌려준다 (Claude base64 이미지 블록 형식) */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result).split(',')[1];
      if (data) resolve(data); else reject(new Error('empty blob'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}
