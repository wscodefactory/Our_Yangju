import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// 개발·배포 경로와 PWA 설정. @ 별칭은 tsconfig.app.json의 paths와 함께 관리한다.
export default defineConfig(({ mode }) => {
  // GitHub Pages 는 https://wscodefactory.github.io/Our_Yangju/ 아래에 올라가므로 에셋 경로 앞에 저장소 이름이 붙어야 한다.
  // 로컬 dev/preview 는 '/' 그대로. (.github/workflows/pages.yml 이 `vite build --mode pages` 로 빌드)
  const base = mode === 'pages' ? '/Our_Yangju/' : '/';
  return {
    base,
    plugins: [
      react(),
      // 화면 자산과 글꼴을 캐시하고 새 버전을 자동 갱신한다. 외부 연결 기능에는 네트워크가 필요하다.
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['yangju-ci.png', 'yangju-symbol.png', 'apple-touch-icon.png'],
        manifest: {
          name: '한눈에 양주 | Our Yangju',
          short_name: '한눈에 양주',
          description: '양주시 외국인 주민을 위한 민원·고지서·혜택·생활 안내',
          lang: 'ko',
          start_url: base,
          scope: base,
          display: 'standalone',
          background_color: '#F4F6F1',
          theme_color: '#FFFFFF',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // 외부 글꼴(Pretendard, Noto Devanagari)은 처음 받은 뒤 1년 캐시
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === 'https://cdn.jsdelivr.net' || url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: { cacheName: 'fonts', expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
            },
          ],
          // /api/ 경로를 앱 화면으로 대체하지 않는다. AI POST 요청용 캐시 규칙은 두지 않는다.
          navigateFallbackDenylist: [/^\/api\//],
        },
      }),
    ],
    resolve: {
      // '@/…' → 프로젝트 루트의 src/
      alias: { '@': '/src' },
    },
    server: {
      port: 3000,        // 개발 서버 포트
      strictPort: true,  // 3000이 사용 중이면 다른 포트로 넘어가지 않고 에러로 알림 (QR·문서에 적힌 주소가 어긋나지 않게)
      host: true,        // 같은 네트워크의 휴대폰에서도 접속 가능 (Network 주소 표시)
    },
    preview: {
      port: 4173,        // npm run preview 포트
    },
  };
});
