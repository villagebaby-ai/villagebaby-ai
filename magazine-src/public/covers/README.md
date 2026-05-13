# 매거진 cover 사진

매거진 hero / pillar / 글 카드에 사용하는 사진들을 여기에 둡니다.

## 톤 가이드

첨부 reference (Pinterest/소홍서 스타일):
- 자연광, 부드러운 화이트 밸런스
- cream / ivory / 베이지 / 소프트 핑크 / 밝은 파스텔 톤
- 임산부·아기·family·니트 양말·초음파 사진 등 라이프스타일 소재
- 텍스트 / 워터마크 없음
- 인물의 정확한 얼굴이 화면 가득 차지 않는 구도 권장 (편집 자유도)

## 권장 사양

- 가로 1600px 이상 (모바일 retina 고려)
- 비율 16:9 또는 4:5 (Hero), 16:9 (article cover), 4:3 (pillar card)
- JPG 또는 WebP, 200KB 이하 권장 (Squoosh로 압축)
- 파일명은 영문 kebab-case (`pregnancy-hero.jpg`, `nt-test-result.jpg`)

## 권장 파일

매거진이 사용하는 placeholder 매핑:

| 자리 | 파일명 | 비율 | 분위기 |
|---|---|---|---|
| Hero 홈 | `home-hero.jpg` | 4:5 | 임산부 또는 부부 + 초음파, cream 톤 |
| Hero 임신 pillar | `pregnancy-hero.jpg` | 4:5 | 임산부 또는 임신 테스트기 |
| 신생아 pillar | `newborn-hero.jpg` | 4:3 | 신생아 양말·니트 |
| 영유아 pillar | `toddler-hero.jpg` | 4:3 | 6~12개월 아기 |
| 학동기 pillar | `school-hero.jpg` | 4:3 | 어린이 학교용품 |
| 케이스 pillar | `case-hero.jpg` | 4:3 | family hands |
| 글 cover (예시) | `golden-time.jpg` | 16:9 | 캘린더 + 임산부 손 |

이 파일들이 없으면 `CoverImage` 컴포넌트가 자동으로 일러스트 mock으로 fallback해요.

## 어떻게 가져올지

세 가지 옵션:

**A. AI 생성 (가장 빠름)**
- Midjourney / DALL-E / Stable Diffusion
- prompt 예시는 `magazine-src/PHOTO_PROMPTS.md` 참고

**B. 무료 stock 사이트 (저작권 안전)**
- [Unsplash](https://unsplash.com/s/photos/pregnancy) — 무료 상업 사용
- [Pexels](https://www.pexels.com/search/pregnancy/) — 무료 상업 사용
- 다운로드 → 이 폴더에 위 파일명으로 저장

**C. 직접 촬영 또는 구매**
- 베이비빌리 자체 콘텐츠
- iStock / Shutterstock 등 유료 (라이선스 확인 필수)

> Pinterest의 사진은 대부분 저작권자가 있어 직접 사용 위험. AI 또는 Unsplash/Pexels 권장.

## 사용 방법

파일을 올리시면:
- Hero / pillar는 자동으로 인식되지 않으므로 `magazine-src/src/pages/index.astro`·`pregnancy/index.astro`에서 `<img src=...>` 수동 교체 (또는 알려주시면 제가 작업)
- 글 cover는 MDX frontmatter에 `cover: /covers/golden-time.jpg` 추가
