// AI 호출 창구. 독립 실행 버전이라 Claude API 를 브라우저에서 직접 친다.
// 화면 코드는 AiProvider 인터페이스만 보고, getAi() 가 null 이면 "데모 모드" 로 규칙/샘플 데이터만 쓴다
// (GuideContext, ReadingScreen, MaskScreen, CounterScreen 등).
import Anthropic from '@anthropic-ai/sdk';
import { blobToBase64, STORAGE_KEYS, storage } from '@/utils/browser';

/** 다른 모델로 바꾸려면 이 인터페이스만 구현하면 된다 */
export interface AiProvider {
  /** 사진 입력을 지원하는지 — 고지서 읽기 화면이 이걸 보고 수동 입력으로 돌릴지 정한다 */
  readonly supportsImages: boolean;
  /** 자유 텍스트 응답 */
  text(prompt: string): Promise<string>;
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
// json() 일 때 system 지시. scripts/*.mjs 도 같은 문장을 쓴다
const JSON_SYSTEM = 'Respond with a single JSON value only. No prose, no markdown fences.';
type ImageType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

export class ClaudeProvider implements AiProvider {
  readonly supportsImages = true;
  private client: Anthropic;
  // text() 전용 캐시. 번역 문구가 대부분이라 같은 프롬프트가 꽤 반복된다.
  // json() 은 이미지가 섞이고 매번 다른 입력이라 캐시하지 않는다.
  private cache = new Map<string, string>();

  // dangerouslyAllowBrowser: 키가 브라우저에 노출되는 구조라 시연용. 운영에선 서버를 거쳐야 한다.
  // 429/5xx 는 SDK 가 기본 2회 재시도한다.
  constructor(apiKey: string, private model = DEFAULT_MODEL) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }

  // temperature 0.2 는 분류·추출 작업이라 낮게. thinking 은 켜지 않는다 — 금액·기한 추출, 분류, 번역은 추론이 필요 없고 속도가 우선.
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
      // 안전 거부(refusal)나 빈 응답은 빈 문자열로 온다
      if (!out) throw new AiError('Claude returned an empty response');
      return out;
    } catch (e) {
      if (e instanceof Anthropic.APIError) throw new AiError(e.message, e.status);
      throw e;
    }
  }

  async text(prompt: string): Promise<string> {
    const hit = this.cache.get(prompt);
    if (hit) return hit;
    const out = (await this.call([{ type: 'text', text: prompt }], false)).trim();
    this.cache.set(prompt, out);
    return out;
  }

  async json<T>(prompt: string, opts?: { image?: Blob }): Promise<T> {
    const content: Anthropic.ContentBlockParam[] = [];
    if (opts?.image) {
      // 캔버스에서 나온 Blob 은 type 이 비어 있을 수 있어 jpeg 로 가정
      const media_type = (opts.image.type || 'image/jpeg') as ImageType;
      content.push({ type: 'image', source: { type: 'base64', media_type, data: await blobToBase64(opts.image) } });
    }
    content.push({ type: 'text', text: prompt });
    const raw = await this.call(content, true);
    // system 지시에도 ```json 펜스나 "Here is the JSON:" 같은 사족이 붙을 때가 있다.
    // 펜스를 벗겨 보고, 그래도 안 되면 첫 { 부터 마지막 } 까지만 잘라 다시 시도
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    const braces = cleaned.match(/\{[\s\S]*\}/);
    for (const candidate of braces ? [cleaned, braces[0]] : [cleaned]) {
      try { return JSON.parse(candidate) as T; } catch { /* 다음 후보 */ }
    }
    throw new AiError('Claude returned non-JSON output');
  }
}

/* ---------- 팩토리 ---------- */

// undefined = 아직 안 만들어 봄, null = 키 없음(데모 모드). 둘을 구분해야 매번 env 를 다시 읽지 않는다
let instance: AiProvider | null | undefined;

/** 빌드 env(VITE_CLAUDE_API_KEY) → 없으면 기기에 저장한 키(담당자 화면에서 입력) → 둘 다 없으면 null(데모 모드) */
export function getAi(): AiProvider | null {
  if (instance !== undefined) return instance;
  const key = import.meta.env.VITE_CLAUDE_API_KEY || storage.get(STORAGE_KEYS.aiKey) || '';
  const model = import.meta.env.VITE_CLAUDE_MODEL || DEFAULT_MODEL;
  instance = key ? new ClaudeProvider(key, model) : null;
  return instance;
}

/** 테스트나 런타임 교체용 */
export function setAi(p: AiProvider | null) {
  instance = p;
}
