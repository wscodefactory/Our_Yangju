// Claude 중계 Worker. 브라우저는 여기로만 부르고, 진짜 API 키는 Worker 비밀값(ANTHROPIC_API_KEY)에만 있다.
// 앱의 Anthropic SDK 가 baseURL 만 이쪽으로 바꿔 쓰므로 경로는 SDK 그대로 POST /v1/messages 하나다.
// 막는 것: 허용되지 않은 출처, 허용되지 않은 모델, 너무 큰 요청(사진), 하루 호출 상한(기기별·전체).

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** 쉼표로 구분한 허용 출처. 예: https://wscodefactory.github.io,http://localhost:5173 */
  ALLOWED_ORIGINS: string;
  ALLOWED_MODELS: string;
  /** 요청 본문 상한(바이트). 가린 고지서 사진이 base64 로 1MB 안팎이라 넉넉히 */
  MAX_BODY_BYTES: string;
  /** Anthropic 호출 주소. Workers 가 홍콩 센터에서 나가면 Anthropic 이 지역 차단(403)을 하므로 AI Gateway 를 거친다 */
  UPSTREAM_URL: string;
  /** 하루 상한: 기기(IP)별, 전체 */
  DAILY_PER_IP: string;
  DAILY_TOTAL: string;
  LIMITS: KVNamespace;
}


const cors = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access, x-stainless-arch, x-stainless-lang, x-stainless-os, x-stainless-package-version, x-stainless-retry-count, x-stainless-runtime, x-stainless-runtime-version, x-stainless-timeout',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

/** 하루 단위 카운터. 자정(UTC)까지 남은 시간만큼만 살려 둔다 */
async function bump(kv: KVNamespace, key: string, limit: number): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const k = `${day}:${key}`;
  const n = Number((await kv.get(k)) ?? 0) + 1;
  if (n > limit) return false;
  const ttl = Math.max(60, Math.floor((Date.UTC(...dayParts(day)) + 86400000 - Date.now()) / 1000));
  await kv.put(k, String(n), { expirationTtl: ttl });
  return true;
}
const dayParts = (d: string): [number, number, number] => { const [y, m, dd] = d.split('-').map(Number); return [y, m - 1, dd]; };

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
    if (!allowed.includes(origin)) return json(403, { error: { message: 'origin not allowed' } });
    const h = cors(origin);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    const url = new URL(req.url);
    if (req.method !== 'POST' || url.pathname !== '/v1/messages') return json(404, { error: { message: 'not found' } }, h);

    const len = Number(req.headers.get('content-length') ?? 0);
    if (len > Number(env.MAX_BODY_BYTES)) return json(413, { error: { message: 'request too large' } }, h);
    const text = await req.text();
    if (text.length > Number(env.MAX_BODY_BYTES)) return json(413, { error: { message: 'request too large' } }, h);

    let body: { model?: string; max_tokens?: number; stream?: boolean };
    try { body = JSON.parse(text); } catch { return json(400, { error: { message: 'invalid json' } }, h); }
    const models = env.ALLOWED_MODELS.split(',').map((s) => s.trim());
    if (!body.model || !models.includes(body.model)) return json(400, { error: { message: 'model not allowed' } }, h);
    if (body.stream) return json(400, { error: { message: 'streaming not supported' } }, h);
    if (!body.max_tokens || body.max_tokens > 4096) body.max_tokens = 4096;

    // 하루 상한: 전체가 먼저, 그다음 기기별
    const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (!(await bump(env.LIMITS, 'total', Number(env.DAILY_TOTAL)))) return json(429, { error: { message: 'daily limit reached' } }, h);
    if (!(await bump(env.LIMITS, `ip:${ip}`, Number(env.DAILY_PER_IP)))) return json(429, { error: { message: 'daily limit reached for this device' } }, h);

    const up = await fetch(env.UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': req.headers.get('anthropic-version') ?? '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    // 상태 코드와 본문은 그대로 넘겨 SDK 의 에러 처리(429 재시도 등)가 그대로 돌게 한다
    return new Response(up.body, { status: up.status, headers: { 'content-type': up.headers.get('content-type') ?? 'application/json', ...h } });
  },
} satisfies ExportedHandler<Env>;
