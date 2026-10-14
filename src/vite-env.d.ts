/// <reference types="vite/client" />

// .env 에서 읽는 변수 타입. VITE_ 접두어가 붙은 것만 브라우저 번들에 들어간다.
// 둘 다 optional — 키가 없으면 services/ai.ts 가 데모 모드(샘플 데이터)로 동작한다.
interface ImportMetaEnv {
  /** Claude API 키. 브라우저에서 직접 호출하는 구조라 시연용으로만 쓸 것 */
  readonly VITE_CLAUDE_API_KEY?: string;
  /** 중계 서버 주소 (worker/). 있으면 키 없이 이쪽으로 부른다 */
  readonly VITE_AI_PROXY?: string;
  /** 모델 이름 덮어쓰기. 비우면 ai.ts 의 기본값 (claude-haiku-5-5) */
  readonly VITE_CLAUDE_MODEL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
