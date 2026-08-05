# /guide/ 0~12주 SEO 페이지 생산 도구

2026-08-05 8편 일괄 발행 때 만든 스크립트. 다음 회차에 그대로 재사용.

## 파일
| 파일 | 역할 |
|---|---|
| `ogcard.py` | OG 카드 생성기 (1200×630 · blue/mint/cream/lavender/peach 5색). 기존 카드 레이아웃 실측 재현 |
| `build_pages.py` | `pages_data.py` 를 읽어 `guide/{슬러그}/index.html` 생성. 템플릿 정본 = `guide/임신-초기-배뭉침/` |
| `pages_data.example.py` | 8편 실제 콘텐츠 데이터 (구조 참고용) |

## 실행
```bash
cd /Users/villagebaby/villagebaby-ai-site/scripts_temp/seo-guide
cp pages_data.example.py pages_data.py   # 내용 교체
python3 - <<'PY'
from ogcard import make_all
from pages_data import PAGES
for p in PAGES:
    make_all(p['slug'], p['og_badge'], p['og_lines'], p['og_sub'], p['illust'],
             '/Users/villagebaby/villagebaby-ai-site/assets/og', p.get('flip', False))
PY
python3 build_pages.py
```

## 주제 선정 (매번 같은 방식)
소스 = `~/babybilly-marketing/analysis/content_posts_index.csv` (어드민 콘텐츠 1,693건 · id·title·slug·**views**).
0~12주 코어 정규식으로 거른 뒤 **이미 발행된 슬러그(`guide/` `child/` `magazine/*/` 252개)와 diff** → 조회수 상위부터.

## 발행 시 함께 갱신 (5종 — 빠뜨리면 색인 안 됨)
1. `sitemap.xml` — percent-encoded `<loc>` + `<image:image>`
2. `rss.xml` — 최신 `<item>` 을 목록 맨 앞에, XML escape + encoded URL
3. `lab/mypages.json` — 발행 레지스트리
4. `assets/og/guide_{슬러그}-{5색}.png`
5. **기존 글 → 신규 글 역방향 내부링크** (신규 글의 아웃바운드만으로는 부족)

관련글 섹션 마크업이 두 종류다: `<h2>함께 보면 좋은 가이드</h2><ul>` (신형) / `<div class="related"><h3>함께 보면 좋은 글</h3><ul>` (구형).

## 콘텐츠 원칙
`docs/CONTENT_PLAYBOOK.md` + `~/babybilly-marketing/content/seo-articles/SEO_GEO_playbook.md` 두 개가 정본.
핵심: **0~12주는 앱 구독이 1차 CTA, 보험은 씨앗(세컨더리)** · 질문형 H2 · 상단 3줄 직답 ·
MedicalWebPage+FAQPage+BreadcrumbList (FAQ 본문과 JSON-LD 1:1) · 친근체(~해요) ·
**커뮤니티 통계 창작 금지** · 공포 마케팅 금지 · 특정 보험사 추천 금지.
