// AI 호출 창구. 원본 시안은 window.claude.use('sample')로 호스트가 주는 모델을 썼는데,
// 독립 실행 버전이라 Claude API 를 브라우저에서 직접 친다. 화면 코드는 AiProvider 인터페이스만 보고,
// getAi()가 null이면 "데모 모드"로 규칙/샘플 데이터만 쓴다 (GuideContext, useTranslate, ReadingScreen 등).
import Anthropic from '@anthropic-ai/sdk';
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

/* ---------- Claude ---------- */

export const DEFAULT_MODEL = 'claude-haiku-5-5';
/** json=true 일 때 system 지시. 스크립트(scripts/*.mjs)도 같은 문장을 쓴다 */
export const JSON_SYSTEM = 'Respond with a single JSON value only. No prose, no markdown fences.';
type ImageType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

export class ClaudeProvider implements AiProvider {
  readonly supportsImages = true;
  private client: Anthropic;
  // text() 전용 캐시. 번역 문구가 대부분이라 같은 프롬프트가 꽤 반복된다.
  // json()은 이미지가 섞이고 매번 다른 입력이라 캐시하지 않음.
  private cache = new Map<string, string>();

  /**
   * dangerouslyAllowBrowser: 키가 브라우저에 노출되는 구조라 시연용. 운영에선 서버를 거쳐야 한다.
   * 429/5xx 는 SDK 가 기본 2회 재시도한다.
   */
  constructor(apiKey: string, private model = DEFAULT_MODEL) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }

  /**
   * messages.create 한 번. temperature 0.2는 분류/추출 작업이라 낮게 잡은 것.
   * 생각(thinking)은 켜지 않는다 — 금액·기한 추출, 분류, 번역은 추론이 필요 없고 응답 속도가 우선.
   * json=true 면 system 으로 "JSON 만" 지시한다 (완전히 보장되진 않음, json() 의 파서가 펜스를 벗긴다).
   */
  private async call(content: Anthropic.ContentBlockParam[], json: boolean): Promise<string> {
    const t0 = performance.now();
    try {
      const res = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        temperature: 0.2,
        ...(json ? { system: JSON_SYSTEM } : {}),
        messages: [{ role: 'user', content }],
      });
      if (import.meta.env.DEV) console.info(`[claude ${this.model}] ${Math.round(performance.now() - t0)}ms, in ${res.usage.input_tokens} / out ${res.usage.output_tokens} tokens`);
      const out = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
      // 안전 거부(refusal)나 빈 응답은 빈 문자열로 온다 → 에러로 처리
      if (!out) throw new AiError('Claude returned an empty response');
      return out;
    } catch (e) {
      if (e instanceof Anthropic.APIError) throw new AiError(e.message, e.status);
      throw e;
    }
  }

  async text(prompt: string, opts?: { cacheKey?: string }): Promise<string> {
    const key = opts?.cacheKey ?? prompt;
    const hit = this.cache.get(key);
    if (hit) return hit;
    const out = (await this.call([{ type: 'text', text: prompt }], false)).trim();
    this.cache.set(key, out);
    return out;
  }

  async json<T>(prompt: string, opts?: { image?: Blob }): Promise<T> {
    const content: Anthropic.ContentBlockParam[] = [];
    if (opts?.image) {
      // 캔버스에서 나온 Blob은 type이 비어 있을 수 있어 jpeg로 가정
      const media_type = (opts.image.type || 'image/jpeg') as ImageType;
      content.push({ type: 'image', source: { type: 'base64', media_type, data: await blobToBase64(opts.image) } });
    }
    content.push({ type: 'text', text: prompt });
    const raw = await this.call(content, true);
    // 모델이 ```json 펜스를 붙이는 경우 대비. 그대로 JSON.parse 하면 첫 글자 '`'에서 터지므로 앞뒤 펜스를 벗긴다.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      // 그래도 안 되면 본문 어딘가의 첫 { ~ 마지막 } 만 잘라서 재시도 ("Here is the JSON: {...}" 같은 사족 대비)
      const braces = cleaned.match(/\{[\s\S]*\}/);
      if (braces) return JSON.parse(braces[0]) as T;
      throw new AiError('Claude returned non-JSON output');
    }
  }
}

/* ---------- 팩토리 ---------- */

// undefined = 아직 안 만들어 봄, null = 키 없음(데모 모드). 둘을 구분해야 매번 env를 다시 읽지 않는다
let instance: AiProvider | null | undefined;

/** 환경변수(VITE_CLAUDE_API_KEY)가 있으면 Claude, 없으면 null(데모 모드) */
export function getAi(): AiProvider | null {
  if (instance !== undefined) return instance;
  // 빌드 env → 없으면 기기에 저장한 키(DocScreen에서 입력). 공유 링크 배포본에 키가 안 들어가도 시연 기기에서 사진 읽기를 켤 수 있게
  const key = (import.meta.env.VITE_CLAUDE_API_KEY as string | undefined) || storage.get(STORAGE_KEYS.aiKey) || '';
  const model = (import.meta.env.VITE_CLAUDE_MODEL as string | undefined) || DEFAULT_MODEL;
  instance = key ? new ClaudeProvider(key, model) : null;
  return instance;
}

/** 테스트나 런타임 교체용 */
export function setAi(p: AiProvider | null) {
  instance = p;
}
