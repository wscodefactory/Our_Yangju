// AI 호출 창구. 원본 시안은 window.claude.use('sample')로 호스트가 주는 모델을 썼는데,
// 독립 실행 버전이라 Gemini REST를 직접 친다. 화면 코드는 AiProvider 인터페이스만 보고,
// getAi()가 null이면 "데모 모드"로 규칙/샘플 데이터만 쓴다 (GuideContext, useTranslate, ReadingScreen 등).
import { blobToBase64, STORAGE_KEYS, storage } from '@/utils/browser';

/**
 * AI 공급자 인터페이스.
 * 원본 시안의 window.claude.use('sample') 역할을 대신한다.
 * 다른 모델로 바꾸려면 이 인터페이스만 구현하면 된다.
 */
export interface AiProvider {
  /** 사진(이미지) 입력을 지원하는지 — 고지서 읽기 화면이 이걸 보고 수동 입력으로 돌릴지 정한다 */
  readonly supportsImages: boolean;
  /** 자유 텍스트 응답 */
  text(prompt: string, opts?: { cacheKey?: string }): Promise<string>;
  /** JSON 응답 (파싱까지) */
  json<T = unknown>(prompt: string, opts?: { image?: Blob }): Promise<T>;
}

/** HTTP 상태를 같이 들고 다니는 에러. 호출부에서 429/403 같은 걸 구분해 안내할 수 있게 */
export class AiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'AiError';
  }
}

/* ---------- Gemini ---------- */

// 응답에서 실제로 쓰는 필드만 적어 둔 최소 타입
interface GeminiPart { text?: string; inlineData?: { mimeType: string; data: string } }
interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
}

export class GeminiProvider implements AiProvider {
  readonly supportsImages = true;
  // text() 전용 캐시. 번역 문구가 대부분이라 같은 프롬프트가 꽤 반복된다.
  // json()은 이미지가 섞이고 매번 다른 입력이라 캐시하지 않음.
  private cache = new Map<string, string>();

  constructor(private apiKey: string, private model = 'gemini-2.5-flash') {}

  /**
   * generateContent 한 번 호출. temperature 0.2는 분류/추출 작업이라 낮게 잡은 것.
   * json=true면 responseMimeType을 걸어 모델이 JSON만 내게 유도한다 (완전히 보장되진 않음, 아래 json() 참고).
   * API 키가 쿼리스트링에 노출되는 건 Gemini REST 방식이 그렇다 — 시안이라 그대로 두지만 운영에선 서버를 거쳐야 함.
   */
  private async call(parts: GeminiPart[], json: boolean): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
    const body = {
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.2,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    // 에러 응답도 JSON 바디에 메시지가 있어서 일단 파싱 시도. 바디가 비어도 죽지 않게 catch
    const data = (await res.json().catch(() => ({}))) as GeminiResponse;
    if (!res.ok) throw new AiError(data.error?.message || `Gemini HTTP ${res.status}`, res.status);
    // 후보 여러 개 중 첫 번째, parts를 이어 붙임 (텍스트가 여러 part로 쪼개져 오는 경우가 있다)
    const out = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') ?? '';
    // 안전 필터에 걸리면 candidates가 비어서 온다 → 빈 응답 에러로 처리
    if (!out) throw new AiError('Gemini returned an empty response');
    return out;
  }

  async text(prompt: string, opts?: { cacheKey?: string }): Promise<string> {
    const key = opts?.cacheKey ?? prompt;
    const hit = this.cache.get(key);
    if (hit) return hit;
    const out = (await this.call([{ text: prompt }], false)).trim();
    this.cache.set(key, out);
    return out;
  }

  async json<T>(prompt: string, opts?: { image?: Blob }): Promise<T> {
    const parts: GeminiPart[] = [{ text: prompt }];
    if (opts?.image) {
      // 캔버스에서 나온 Blob은 type이 비어 있을 수 있어 jpeg로 가정
      parts.push({ inlineData: { mimeType: opts.image.type || 'image/jpeg', data: await blobToBase64(opts.image) } });
    }
    const raw = await this.call(parts, true);
    // 모델이 ```json 펜스를 붙이는 경우 대비
    // responseMimeType을 줘도 모델/버전에 따라 마크다운 코드블록으로 감싸서 돌려주는 일이 있었다.
    // 그대로 JSON.parse 하면 첫 글자 '`'에서 터지므로 앞뒤 펜스를 벗긴다.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      // 그래도 안 되면 본문 어딘가의 첫 { ~ 마지막 } 만 잘라서 재시도 ("Here is the JSON: {...}" 같은 사족 대비)
      const braces = cleaned.match(/\{[\s\S]*\}/);
      if (braces) return JSON.parse(braces[0]) as T;
      throw new AiError('Gemini returned non-JSON output');
    }
  }
}

/* ---------- 팩토리 ---------- */

// undefined = 아직 안 만들어 봄, null = 키 없음(데모 모드). 둘을 구분해야 매번 env를 다시 읽지 않는다
let instance: AiProvider | null | undefined;

/** 환경변수(VITE_GEMINI_API_KEY)가 있으면 Gemini, 없으면 null(데모 모드) */
export function getAi(): AiProvider | null {
  if (instance !== undefined) return instance;
  // 빌드 env → 없으면 기기에 저장한 키(DocScreen에서 입력). 공유 링크 배포본에 키가 안 들어가도 시연 기기에서 사진 읽기를 켤 수 있게
  const key = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || storage.get(STORAGE_KEYS.geminiKey) || '';
  const model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-2.5-flash';
  instance = key ? new GeminiProvider(key, model) : null;
  return instance;
}

/** 테스트나 런타임 교체용 */
export function setAi(p: AiProvider | null) {
  instance = p;
}
