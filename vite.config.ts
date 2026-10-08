import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정. 특별한 건 없고 '@' 별칭과 포트 고정 정도.
// tsconfig.app.json 의 paths 에도 같은 '@/*' 매핑이 있어야 타입 검사가 맞는다. 한쪽만 바꾸지 말 것.
export default defineConfig(({ mode }) => ({
  // GitHub Pages 는 https://wscodefactory.github.io/Our_Yangju/ 아래에 올라가므로 에셋 경로 앞에 저장소 이름이 붙어야 한다.
  // 로컬 dev/preview 는 '/' 그대로. (.github/workflows/pages.yml 이 `vite build --mode pages` 로 빌드)
  base: mode === 'pages' ? '/Our_Yangju/' : '/',
  plugins: [react()],
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
}));
