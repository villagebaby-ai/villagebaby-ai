# villagebaby.kr 보험 매거진 (magazine)

Astro 5 + MDX 기반 보험 매거진. 빌드 산출물이 레포 루트의 `/magazine/` 디렉토리로 출력되어 `villagebaby.kr/magazine/` 경로로 서빙됩니다.

## 빠른 시작

```bash
# 의존성 설치 (최초 1회)
cd magazine-src
npm install

# 로컬 개발
npm run dev   # http://localhost:4321/magazine/

# 빌드 (산출물 → ../magazine/)
npm run build
```

빌드 결과를 main 브랜치에 함께 커밋하면 GitHub Pages가 자동 서빙합니다. GitHub Actions `magazine-build.yml`이 magazine-src 변경 시 자동 빌드·커밋해요.

## 디렉토리

```
magazine-src/
  src/
    content/
      config.ts                     스키마 (pillar, type, intent, faq, leadTool)
      articles/{pillar}/{slug}.mdx  글
    layouts/BaseLayout.astro        NAV/푸터/PLAYBOOK 디자인 토큰
    pages/
      index.astro                   매거진 홈 (/magazine/)
      pregnancy/index.astro         pillar 인덱스
      tools/fit-check.astro         핏체크 12문항 (D+3 추가 예정)
      [...slug].astro               글 동적 라우트 (D+4 추가 예정)
  astro.config.mjs                  base=/magazine, outDir=../magazine
```

## 핵심 룰

- 친근 존댓말 톤 (ruuve-guide WRITING_GUIDE 1·15·16 준수)
- 보험사 실명 금지 → "A사", "B사"
- "가입하세요" 금지 → "검토해보세요", "확인해보세요"
- 모든 글 FAQ 6~10개 + JSON-LD FAQPage 1:1 매칭
- 케이스 글은 가명·각색 명시
- 출판 후 sitemap → rss → 본체 /guide/ 양방향 링크 → 3종 색인 셋트(Google+Naver+Bing) 필수
