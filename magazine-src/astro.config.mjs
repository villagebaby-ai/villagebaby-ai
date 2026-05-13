import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// villagebaby.kr/magazine/ 서브디렉토리에 빌드 산출
// 빌드 결과는 레포 루트의 /magazine/ 디렉토리로 출력되며 main 브랜치에 함께 커밋됨
// GitHub Pages가 main을 직접 서빙하므로 별도 배포 단계 불필요
export default defineConfig({
  site: 'https://villagebaby.kr',
  base: '/magazine',
  trailingSlash: 'always',
  outDir: '../magazine',
  build: {
    format: 'directory',
    assets: '_astro',
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
