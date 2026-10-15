// Claude 중계 서버. API 키는 Worker 비밀값으로 관리하고 출처·모델·IP별 호출 수를 확인한다.

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** 쉼표로 구분한 허용 출처. 예: https://wscodefactory.github.io,http://localhost:3000 */
  ALLOWED_ORIGINS: string;
  ALLOWED_MODELS: string;
  /** 요청 본문 상한(바이트). 가린 고지서 사진이 base64 로 1MB 안팎이라 넉넉히 */
  MAX_BODY_BYTES: string;
  /** Anthropic 호출 주소. Workers 가 홍콩 센터에서 나가면 Anthropic 이 지역 차단(403)을 하므로 AI Gateway 를 거친다 */
  UPSTREAM_URL: string;
  /** UTC 날짜 기준 IP별·전체 호출 상한 */
  DAILY_PER_IP: string;
  DAILY_TOTAL: string;
  LIMITS: KVNamespace;
}


const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access, x-stainless-arch, x-stainless-lang, x-stainless-os, x-stainless-package-version, x-stainless-retry-count, x-stainless-runtime, x-stainless-runtime-version, x-stainless-timeout',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

const jsonResponse = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

/** 하루 단위 카운터. 자정(UTC)까지 남은 시간만큼만 살려 둔다 */
async function bump(kv: KVNamespace, key: string, limit: number): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const counterKey = `${day}:${key}`;
  const count = Number((await kv.get(counterKey)) ?? 0) + 1;
  if (count > limit) return false;
  const ttlSeconds = Math.max(60, Math.floor((Date.UTC(...dayParts(day)) + 86400000 - Date.now()) / 1000));
  await kv.put(counterKey, String(count), { expirationTtl: ttlSeconds });
  return true;
}
const dayParts = (d: string): [number, number, number] => { const [y, m, dd] = d.split('-').map(Number); return [y, m - 1, dd]; };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
    if (!allowed.includes(origin)) return jsonResponse(403, { error: { message: 'origin not allowed' } });
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/v1/messages') return jsonResponse(404, { error: { message: 'not found' } }, headers);

    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > Number(env.MAX_BODY_BYTES)) return jsonResponse(413, { error: { message: 'request too large' } }, headers);
    const requestText = await request.text();
    if (requestText.length > Number(env.MAX_BODY_BYTES)) return jsonResponse(413, { error: { message: 'request too large' } }, headers);

    let body: { model?: string; max_tokens?: number; stream?: boolean };
    try { body = JSON.parse(requestText); } catch { return jsonResponse(400, { error: { message: 'invalid json' } }, headers); }
    const models = env.ALLOWED_MODELS.split(',').map((s) => s.trim());
    if (!body.model || !models.includes(body.model)) return jsonResponse(400, { error: { message: 'model not allowed' } }, headers);
    if (body.stream) return jsonResponse(400, { error: { message: 'streaming not supported' } }, headers);
    if (!body.max_tokens || body.max_tokens > 4096) body.max_tokens = 4096;

    // 같은 공용 IP의 요청은 한도를 공유한다. 전체 카운터를 먼저 갱신한다.
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (!(await bump(env.LIMITS, 'total', Number(env.DAILY_TOTAL)))) return jsonResponse(429, { error: { message: 'daily limit reached' } }, headers);
    if (!(await bump(env.LIMITS, `ip:${ip}`, Number(env.DAILY_PER_IP)))) return jsonResponse(429, { error: { message: 'daily limit reached for this device' } }, headers);

    const upstreamResponse = await fetch(env.UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': request.headers.get('anthropic-version') ?? '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    // 상태 코드와 본문은 그대로 넘겨 SDK 의 에러 처리(429 재시도 등)가 그대로 돌게 한다
    return new Response(upstreamResponse.body, { status: upstreamResponse.status, headers: { 'content-type': upstreamResponse.headers.get('content-type') ?? 'application/json', ...headers } });
  },
} satisfies ExportedHandler<Env>;
