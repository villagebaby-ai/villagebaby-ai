# villagebaby.kr 보험 콘텐츠 제작·배포 플레이북

> 팀원이 LLM (Claude / ChatGPT / Gemini) 에 그대로 붙여넣어 사용. 보험 가이드 1편 작성부터 GitHub Pages 배포까지 한 번에.
>
> 본 문서를 LLM 시스템 프롬프트 또는 첫 메시지에 통째로 붙이고, 그 뒤에 작업 지시를 추가하세요.

---

## 1. 사이트 개요

| 항목 | 값 |
|---|---|
| 도메인 | `villagebaby.kr` (apex), www 변종도 servable |
| 호스팅 | GitHub Pages |
| Repository | `villagebaby-ai/villagebaby-ai` (public) |
| 브랜치 | `main` (push → 30~90초 후 자동 빌드) |
| CNAME 파일 | repo 루트 — `villagebaby.kr` |
| 빌더 | 없음 (정적 HTML 직접 작성) |
| 폰트 | Pretendard (jsdelivr CDN) |
| 콘텐츠 디렉토리 구조 | `/guide/{한글-슬러그}/index.html`, `/child/`, `/cancer/`, `/female/`, `/care/`, `/driver/`, `/education/` |
| 관리자 페이지 | 난독화 path + JS PIN gate (정적 사이트 한계 — 진짜 보안은 외부 인증 필요) |
| 자매 사이트 | `babybilly.co` (자사 앱 랜딩), `ruuve.kr` (자사 화장품 브랜드), `gender-test.babybilly.co` |

**핵심 운영 원칙**: 새 가이드 페이지 추가 시 반드시 함께 갱신해야 하는 6가지:
1. `sitemap.xml` 에 새 URL `<loc>` 추가 (percent-encoded)
2. `rss.xml` 에 새 entry 추가 (XML escape + percent-encoded URL + 라이브 이미지)
3. admin 대시보드 `data-url` 항목 추가
4. 기존 pillar 페이지에서 신규 spoke 글로 내부 링크 1~2개
5. 신규 글에서 pillar 페이지로 역방향 링크
6. og:image 라이브 (200 OK) 검증

---

## 2. 콘텐츠 작성 원칙

### 톤 & 스타일
- **타깃**: 30~40대 부모. 처음 보험 가입·재설계 결정을 앞두고 정보 비교 중.
- **톤**: 부드러운 전문가. 권위적이지 않음. 공감 + 정확.
- **금지 표현**: "가입하세요" (영업적), "절대 안전" (과장), "치료된다" (의료법 위반 가능). 어떤 보험사도 명시적으로 추천하지 말 것 — "한 보험사" / "A사" 로 익명화.
- **이모지 사용**: 헤더·뱃지에 절제하여 1~2개 (`💰 📋 ⚡ ✅`). 본문 단락 안엔 쓰지 말 것.
- **숫자**: 모든 보험료·보장액·통계는 출처·시점 명시. 예: "2026년 5월 손해보험사 평균 추정치".

### 길이 & 구조
- **본문 길이**: 30,000자 이상 권장. 짧으면 (~20K) SEO·GEO 약함. 너무 길어도 (60K+) 체류시간 분산.
- **H2**: 6~10개. 각 H2 는 사용자의 검색 의도 하나에 대응.
- **H3**: H2 당 1~3개. 표/스탯/팁 그룹화에 사용.
- **TOC**: 항상 hero 직후 표시. 클릭 시 해당 section 으로 스크롤.

### 필수 컴포넌트 (모든 가이드 글)
1. **TL;DR (한 줄 요약)** — `.answer` 노란 박스. 가장 위. 50~100자.
2. **목차 (TOC)** — `.toc` 회색 박스. TL;DR 직후.
3. **본문 sections** — `.sec` 블록 6~10개.
4. **자주 묻는 질문 (FAQ)** — 6~10개. JSON-LD `FAQPage` 와 1:1 대응.
5. **함께 읽으면 좋아요 (Related)** — `.related-grid` 4개 카드. 같은 pillar 클러스터 우선.
6. **CTA 블록** — 카톡 무료 상담 또는 자사 앱 링크.
7. **Author card** — `<aside class="author-card">`. 본문 최상단 (TL;DR 직전).

### 사실 밀도 (GEO 핵심)
- 모든 핵심 수치 (보험료, 자기부담률, 한도) 는 **본문 텍스트에도 명시**. 표·인포그래픽 안에만 두지 말 것. AI 검색 봇은 이미지를 못 읽음 → 텍스트에 동기화돼야 인용됨.
- 예: 인포그래픽 alt 에 "5세대 자기부담률 50%" 가 있어도, 본문에 "5세대 비중증 자기부담률은 50%" 가 별도 텍스트로 있어야 GEO 활용도 ↑.

---

## 3. Modern Template (표준 HTML)

신규 글은 반드시 이 템플릿으로. 64 페이지 중 31 페이지가 이 구조 — variant 페이지는 점진 통일 중.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/favicon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{글 제목} 2026 — {부제} | 베이비빌리</title>
  <meta name="description" content="{160자 이내 요약 — 핵심 키워드 + 페이지 정체성}">
  <meta name="keywords" content="{주요 키워드 쉼표 구분}, 베이비빌리">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{글 제목}">
  <meta property="og:description" content="{설명}">
  <meta property="og:url" content="https://villagebaby.kr/guide/{슬러그}/">
  <meta property="og:image" content="https://villagebaby.kr/heroimage.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://villagebaby.kr/heroimage.jpg">
  <link rel="canonical" href="https://villagebaby.kr/guide/{슬러그}/">
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">

  <script type="application/ld+json">
  { /* JSON-LD 전체 — Section 4 참조 */ }
  </script>

  <style>
    /* 디자인 토큰 — Section 5 참조 */
    /* author-card CSS — Section 9 참조 */
  </style>
</head>
<body>

<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-logo" aria-label="베이비빌리 홈">
      <img src="/logo.png" alt="베이비빌리">
    </a>
    <a href="https://babybilly.co/insurance/baby/talk/v1" class="nav-cta">카톡 무료 상담</a>
  </div>
</nav>

<header class="hero">
  <img class="hero-deco" src="/assets/img/baby-bear-study.png" alt="" aria-hidden="true">
  <div class="hero-inner">
    <p class="breadcrumb"><a href="/">홈</a> · <a href="/guide/">가이드</a> · {현재 글}</p>
    <span class="badge">💰 {카테고리 badge}</span>
    <h1 class="h1">{글 제목}<br><em>{부제}</em></h1>
    <p class="lead">{1~2문장 lead text — 누가, 무엇을, 왜}</p>
    <div class="meta">
      <span>📅 {YYYY-MM-DD}</span>
      <span>👥 작성: <strong><a href="https://babybilly.co" target="_blank" rel="author noopener" style="color:inherit;text-decoration:none;border-bottom:1px dotted currentColor">베이비빌리</a></strong></span>
      <span>🔗 <a href="/guide/{pillar-슬러그}/" style="color:var(--blue-700);font-weight:700">{pillar 글 제목} →</a></span>
    </div>
  </div>
</header>

<main>
  <div class="container">

    <!-- Author Card (E-E-A-T) -->
    <aside class="author-card">
      <a href="https://babybilly.co" target="_blank" rel="author noopener" class="ac-photo">
        <img src="/assets/img/billy-author-96.png" srcset="/assets/img/billy-author-96.png 1x, /assets/img/billy-author-256.png 2x" alt="베이비빌리" width="48" height="48">
      </a>
      <div class="ac-meta">
        <p class="ac-name"><a href="https://babybilly.co" target="_blank" rel="author noopener">베이비빌리</a> · 200만 엄빠가 사용하는 육아 콘텐츠 앱</p>
        <p class="ac-rev">10년 이상 태아·어린이보험을 소개해온 전문가의 감수를 거쳤습니다.</p>
      </div>
    </aside>

    <!-- TL;DR -->
    <div class="answer">
      <div class="lab">한 줄 요약</div>
      <p class="text">{핵심 결론 — 굵게 강조할 부분은 <strong></strong>}</p>
    </div>

    <!-- 목차 -->
    <nav class="toc">
      <p class="toc-label">📋 목차</p>
      <ol>
        <li><a href="#sec1">{section 1 제목}</a></li>
        <li><a href="#sec2">{section 2 제목}</a></li>
        <!-- ... -->
        <li><a href="#faq">자주 묻는 질문</a></li>
      </ol>
    </nav>

    <!-- 본문 sections -->
    <section class="sec" id="sec1">
      <h2 class="h2">{section 제목}</h2>
      <p>{본문 단락}</p>
      <!-- table·stat-grid·tip-list·callout — Section 5 참조 -->
    </section>

    <!-- FAQ -->
    <section class="sec" id="faq">
      <h2 class="h2">자주 묻는 질문</h2>
      <div class="faq-item">
        <button class="faq-q" type="button">{질문}<span class="arrow">▾</span></button>
        <p class="faq-a">{답변 — 100~200자}</p>
      </div>
      <!-- 6~10개 반복. JSON-LD FAQPage 와 1:1 매칭 -->
    </section>

    <!-- 함께 읽으면 좋아요 -->
    <section class="sec">
      <h2 class="h2">함께 읽으면 좋아요</h2>
      <div class="related-grid">
        <a href="/guide/{관련글}/" class="related-card">
          <div class="related-thumb yellow"><img src="/assets/img/baby-medical.png" alt="{관련글 핵심 키워드}"></div>
          <div><p class="ttl">{관련글 제목}</p><p class="desc">{1줄 설명}</p></div>
        </a>
        <!-- 총 4개 -->
      </div>
    </section>

    <!-- CTA -->
    <div class="cta-block">
      <img class="cta-deco" src="/assets/img/baby-wave.png" alt="" aria-hidden="true">
      <div class="cta-content">
        <h3 class="h3">{CTA 헤드라인}</h3>
        <p>{CTA 설명}</p>
        <a href="https://babybilly.co/insurance/baby/talk/v1" class="cta-btn">💬 카톡으로 무료 상담</a>
      </div>
    </div>
  </div>
</main>

<footer>
  <p class="ftop">부모를 위한 모든 보험 연구소</p>
  <p style="font-size:11px;color:var(--gray-500)">본 콘텐츠는 정보 제공 목적이며, 실제 가입 시 보험사 약관과 전문가 상담을 통해 확인하세요. · <a href="/guide/">{카테고리} 가이드</a></p>
</footer>

<script>
document.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => q.parentElement.classList.toggle('open')));
</script>

</body>
</html>
```

---

## 4. JSON-LD 구조화 데이터 (필수)

`<head>` 안에 `<script type="application/ld+json">` 으로 삽입. `@graph` 배열로 Article + BreadcrumbList + FAQPage 3개 함께.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://villagebaby.kr/guide/{슬러그}/#article",
      "headline": "{글 제목 부제 포함}",
      "datePublished": "{YYYY-MM-DD}",
      "dateModified": "{YYYY-MM-DD}",
      "author": {
        "@type": "Person",
        "image": "https://villagebaby.kr/assets/img/billy-author-256.png",
        "name": "베이비빌리 보험 전문팀",
        "jobTitle": "부모·가족 보험 컨설턴트",
        "worksFor": {
          "@type": "Organization",
          "name": "베이비빌리",
          "url": "https://babybilly.co"
        },
        "description": "태아·어린이·실손보험 등 부모를 위한 모든 보험을 10년 이상 전문 상담한 팀. 손해보험 6개사·생명보험 5개사 통합 비교 컨설팅 제공.",
        "knowsAbout": ["태아보험", "어린이보험", "실손보험", "5세대 실손", "보험 비교", "보험 청구"]
      },
      "reviewedBy": {
        "@type": "Person",
        "name": "베이비빌리 보험 전문 감수단",
        "description": "10년 이상 태아·어린이보험 분야에 종사한 전문가들이 감수한 콘텐츠입니다."
      },
      "publisher": {
        "@type": "Organization",
        "name": "베이비빌리",
        "url": "https://villagebaby.kr/",
        "logo": { "@type": "ImageObject", "url": "https://villagebaby.kr/logo.png" },
        "sameAs": ["https://pf.kakao.com/_bxjJfn", "https://villagebaby.kr/"],
        "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "areaServed": "KR", "availableLanguage": "ko" }
      },
      "image": { "@type": "ImageObject", "url": "https://villagebaby.kr/heroimage.jpg", "width": 727, "height": 320 },
      "mainEntityOfPage": { "@type": "WebPage", "@id": "https://villagebaby.kr/guide/{슬러그}/" },
      "speakable": { "@type": "SpeakableSpecification", "cssSelector": [".answer .text", ".answer .lead", ".hero h1", ".hero .lead", ".sec-head h2"] }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://villagebaby.kr/" },
        { "@type": "ListItem", "position": 2, "name": "가이드", "item": "https://villagebaby.kr/guide/" },
        { "@type": "ListItem", "position": 3, "name": "{현재 글 제목}", "item": "https://villagebaby.kr/guide/{슬러그}/" }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "{질문 1}", "acceptedAnswer": { "@type": "Answer", "text": "{답변 1}" } }
        /* 본문 FAQ 와 1:1 매칭 */
      ]
    }
  ]
}
```

**중요**: FAQ 답변 텍스트는 본문 `.faq-a` 와 정확히 같아야 함 (검색엔진 중복 검사). HTML escape (`"` → `&quot;`) 주의.

---

## 5. 디자인 시스템

### 색상 토큰 (반드시 `:root` 에 정의)

```css
:root{
  --blue-900:#0D3B6F; --blue-800:#15518F; --blue-700:#2563B6; --blue-600:#2D7CD2;
  --blue-200:#C9DCEF; --blue-100:#E4ECF6; --blue-50:#EFF4FA;
  --pink-50:#FFF1E6; --light-yellow:#FFE4B5; --skyblue:#C9E2EE; --light-violet:#ECE0FF; --mint:#BFEBE0;
  --gray-900:#1F2937; --gray-800:#374151; --gray-700:#4B5563; --gray-600:#6B7280; --gray-500:#9CA3AF;
  --gray-400:#D1D5DB; --gray-300:#E5E7EB; --gray-200:#F3F4F6; --gray-100:#F9FAFB; --white:#FFFFFF;
  --red:#F94646; --green:#2ED371;
  --shadow-blue:0 3px 17px 1px rgba(45,124,210,.30);
  --shadow-l:0 3px 17px 6px rgba(0,0,0,.15);
  --shadow-s:0 1px 6px 0 rgba(0,0,0,.15);
  --shadow-xs:0 0 3px 0 rgba(0,0,0,.10);
}
```

### 타이포

| 클래스 | 사이즈 | 용도 |
|---|---|---|
| `.h1` | 32px (모바일 25px), font-weight 700 | hero 제목 |
| `.h2` | 24px (모바일 21px), font-weight 700 | section 제목 |
| `.h3` | 20px (모바일 18px), font-weight 700 | sub-section |
| 본문 `p` | 15px, line-height 1.8 | 일반 단락 |
| 본문 `li` | 14.5px, line-height 1.8 | list 항목 |
| caption/meta | 11.5~13px | 부속 정보 |

`body{ font-family:'Pretendard Variable','Pretendard',-apple-system,sans-serif; word-break:keep-all; line-height:1.6; }`
`word-break:keep-all` 필수 — 한국어 단어 중간 줄바꿈 방지.

### 핵심 컴포넌트 CSS (필수 포함)

```css
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
body{color:var(--gray-900);background:var(--white);-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}img{max-width:100%;display:block}

.nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--gray-200)}
.nav-inner{max-width:880px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
.nav-logo img{height:32px;width:auto}
.nav-cta{display:inline-flex;align-items:center;gap:6px;background:var(--blue-600);color:#fff;font-size:13px;font-weight:700;padding:9px 16px;border-radius:24px;box-shadow:var(--shadow-blue)}

.hero{position:relative;padding:56px 24px 32px;background:linear-gradient(180deg,var(--blue-50) 0%,var(--white) 100%);overflow:hidden}
.hero-deco{position:absolute;pointer-events:none;z-index:0;opacity:.78;right:max(-30px,calc(50% - 380px));top:30px;width:140px}
.hero-inner{max-width:780px;margin:0 auto;position:relative;z-index:1}
.hero .breadcrumb{font-size:12px;color:var(--gray-500);margin-bottom:14px}
.hero .badge{display:inline-flex;align-items:center;gap:6px;background:var(--blue-700);color:#fff;font-size:11.5px;font-weight:700;padding:5px 12px;border-radius:14px;margin-bottom:14px}
.hero h1{margin-bottom:12px}.hero h1 em{font-style:normal;color:var(--blue-700)}
.hero .lead{color:var(--gray-700);font-size:15.5px;line-height:1.75;margin-bottom:18px;max-width:680px}
.hero .meta{display:flex;gap:14px;font-size:12.5px;color:var(--gray-600);flex-wrap:wrap}
.hero .meta strong{color:var(--gray-800)}

.container{max-width:780px;margin:0 auto;padding:0 24px}

/* TL;DR */
.answer{background:linear-gradient(135deg,#FFFAEB 0%,#FFF1C2 100%);border:1.5px solid #F5B500;border-radius:16px;padding:22px 24px;margin:32px 0;color:#5C3A00}
.answer .lab{font-size:11.5px;font-weight:700;color:#8C5A00;margin-bottom:8px}
.answer .lab::before{content:'⚡ '}
.answer .text{font-size:15px;line-height:1.7;font-weight:600;color:#3D2700}
.answer .text strong{color:var(--blue-800);background:rgba(255,255,255,.7);padding:1px 4px;border-radius:4px;font-weight:800}

/* TOC */
.toc{background:var(--gray-100);border-radius:14px;padding:20px 24px;margin:24px 0 32px}
.toc-label{font-size:12px;font-weight:700;color:var(--gray-700);margin-bottom:10px}
.toc ol{list-style:none;counter-reset:toc;padding:0;margin:0}
.toc li{counter-increment:toc;padding:5px 0;font-size:14px}
.toc li::before{content:counter(toc,decimal-leading-zero);color:var(--blue-600);font-weight:700;margin-right:10px;font-size:12px}

/* Section */
.sec{padding:36px 0 8px;scroll-margin-top:80px}
.sec h2{margin-bottom:14px}
.sec p{margin-bottom:14px;font-size:15px;line-height:1.8;color:var(--gray-800)}
.sec h3{margin:24px 0 10px}
.sec ul,.sec ol{margin:8px 0 18px;padding-left:24px}
.sec li{font-size:14.5px;line-height:1.8;color:var(--gray-800);margin-bottom:6px}

/* 비교 표 */
.ctable{width:100%;border-collapse:collapse;margin:18px 0;font-size:13.5px;border-radius:12px;overflow:hidden;box-shadow:var(--shadow-xs)}
.ctable th,.ctable td{padding:11px 13px;text-align:left;border-bottom:1px solid var(--gray-200)}
.ctable th{background:var(--blue-50);color:var(--blue-800);font-weight:700;font-size:12.5px}
.ctable td{color:var(--gray-800);vertical-align:top;line-height:1.55}
.ctable .row-label{font-weight:700;color:var(--gray-900);background:var(--gray-100);width:24%}
.ctable .save{color:var(--green);font-weight:700}

/* Stat Grid */
.stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:18px 0}
.stat-card{background:var(--white);border:1.5px solid var(--gray-200);border-radius:14px;padding:20px;text-align:center}
.stat-card.featured{background:linear-gradient(135deg,#FFFAEB 0%,#FFF5DA 100%);border-color:#F5B500}
.stat-card .num{font-size:26px;font-weight:900;color:var(--gray-900);margin-bottom:4px}
.stat-card .lbl{font-size:12px;color:var(--gray-600);font-weight:600}

/* Tip Card */
.tip-card{background:var(--white);border:1px solid var(--gray-200);border-radius:12px;padding:16px 20px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px}
.tip-num{width:32px;height:32px;border-radius:50%;background:var(--blue-100);color:var(--blue-700);font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}

/* Callout */
.callout{background:var(--blue-50);border-left:4px solid var(--blue-600);border-radius:12px;padding:16px 20px;margin:18px 0;color:var(--gray-800);font-size:14px;line-height:1.7}
.callout.warn{background:#FFF1F1;border-color:var(--red);color:#5C1010}
.callout.success{background:#E6FAF1;border-color:var(--green);color:#0D5C32}

/* FAQ */
.faq-item{background:var(--white);border:1px solid var(--gray-200);border-radius:12px;margin-bottom:8px;overflow:hidden}
.faq-q{width:100%;padding:16px 20px;text-align:left;font-size:14.5px;font-weight:700;color:var(--gray-900);display:flex;justify-content:space-between;align-items:center;cursor:pointer;border:none;background:none}
.faq-q::before{content:'Q.';color:var(--blue-600);font-weight:900;margin-right:6px}
.faq-q .arrow{color:var(--gray-400);transition:.2s}
.faq-item.open .faq-q .arrow{transform:rotate(180deg)}
.faq-a{padding:0 20px 16px 46px;font-size:13.5px;color:var(--gray-700);line-height:1.7;display:none}
.faq-item.open .faq-a{display:block}

/* Related */
.related-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:18px 0}
.related-card{display:flex;align-items:center;gap:12px;background:var(--white);border:1px solid var(--gray-200);border-radius:14px;padding:14px 16px}
.related-thumb{width:54px;height:54px;border-radius:10px;background:var(--blue-50);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.related-thumb img{width:100%;height:100%;object-fit:contain;padding:4px}
.related-thumb.pink{background:var(--pink-50)}.related-thumb.violet{background:var(--light-violet)}.related-thumb.mint{background:var(--mint)}.related-thumb.yellow{background:var(--light-yellow)}

/* CTA */
.cta-block{background:linear-gradient(135deg,var(--blue-700) 0%,var(--blue-800) 100%);border-radius:16px;padding:32px 28px;text-align:center;color:#fff;margin:36px 0;box-shadow:var(--shadow-l);position:relative;overflow:hidden}
.cta-btn{display:inline-flex;align-items:center;gap:8px;background:#fff;color:var(--blue-700);font-size:14.5px;font-weight:700;padding:13px 26px;border-radius:24px}

/* Footer */
footer{padding:32px 24px 60px;text-align:center;background:var(--gray-100);border-top:1px solid var(--gray-200);color:var(--gray-600)}

/* Mobile */
@media(max-width:760px){
  .h1{font-size:25px}.h2{font-size:21px}.h3{font-size:18px}
  .hero{padding:42px 18px 24px}
  .container{padding:0 18px}
  .related-grid,.stat-grid{grid-template-columns:1fr}
  .ctable{font-size:12.5px}.ctable th,.ctable td{padding:9px 10px}
}
```

---

## 6. 이미지 규정

### 파일 위치
- **공유 일러스트**: `/assets/img/{이름}.png` (예: `baby-medical.png`, `baby-magnifier.png`, `baby-wave.png`)
- **글 전용 이미지**: `/guide/{슬러그}/img-{용도}.{jpg|png|webp}` 또는 `/{카테고리}/{슬러그}/img-{용도}`
- **반드시 절대경로 사용** (`/assets/...` 또는 `/guide/...`). **`./img-*.jpg` 같은 상대경로 금지** — 과거 broken image 16개 발생 원인.
- **헤더 이미지**: `/heroimage.jpg` (사이트 공통 og:image)
- **author 사진**: `/assets/img/billy-author-96.png`, `/assets/img/billy-author-256.png` (이미 업로드됨)

### 권장 패턴 (1글 당 3장)
1. **헤더 이미지** — alt="글 제목 + 핵심 키워드"
2. **본문 중간 인포그래픽** 1장 (비교표·플로우차트 등 고유 자산)
   - alt 에 인포그래픽 정보 요약
   - **본문 텍스트에도 같은 내용 풀어 적기** (GEO 인용 위해)
3. **결론 직전 체크리스트/차트** 1장

### 이미지 sitemap
sitemap.xml 의 각 `<url>` 안에 `<image:image><image:loc>` 포함:
```xml
<url>
  <loc>https://villagebaby.kr/guide/태아보험-거절-사례/</loc>
  <lastmod>2026-05-08</lastmod>
  <image:image>
    <image:loc>https://villagebaby.kr/guide/%ED%83%9C%EC%95%84%EB%B3%B4%ED%97%98-%EA%B1%B0%EC%A0%88-%EC%82%AC%EB%A1%80/img-summary.jpg</image:loc>
  </image:image>
</url>
```

### alt 작성 규칙
- **장식용** (hero-deco, cta-deco): `alt=""` + `aria-hidden="true"` 둘 다 (W3C 표준)
- **의미 있는 이미지**: 키워드 + 설명. 예: `alt="5세대 vs 4세대 실손 보험료 비교표"`
- **alt 누락 금지** — alt 속성 자체를 빼면 screen reader 가 파일명을 읽음 (UX 손상). 빈 alt 라도 명시.

### 파일 크기
- 인포그래픽 JPG: 100~300KB
- 일러스트 PNG: 30~80KB
- 모든 이미지 100KB 이상이면 WebP 변환 검토
- favicon: <50KB 권장 (현재 6MB 짜리 favicon 발견 — 리사이즈 권장)

### 깨진 이미지 발견 시
- `<img>` 태그 통째 주석 처리: `<!-- TODO: 이미지 새로 제작 예정 (YYYY-MM-DD broken-image 제거 — was {원본 src}) -->`
- 비워두는 게 깨진 채로 두는 것보다 훨씬 나음 (SEO·E-E-A-T 신뢰도)

---

## 7. URL·슬러그 규칙

### 슬러그 형식
- **한글 사용 OK**. 예: `/guide/태아보험-거절-사례/`
- 단어 구분은 `-` (hyphen). underscore (`_`), space, dot 금지.
- 길이: 30자 이내 권장.
- **최종 슬래시 필수** — `/guide/태아보험/` (O), `/guide/태아보험` (X — 301 redirect 됨)

### URL 인코딩 (중요)
sitemap·RSS·canonical·og:url 에 한글 URL 박을 때:
- **canonical/og:url 의 `<link>`/`<meta>`**: raw 한글 OK (`https://villagebaby.kr/guide/태아보험/`)
- **sitemap `<loc>`**: **percent-encoded 필수** (`https://villagebaby.kr/guide/%ED%83%9C%EC%95%84%EB%B3%B4%ED%97%98/`)
- **RSS `<link>`, `<guid>`**: **percent-encoded 필수**
- **RSS `<image><url>`**: percent-encoded + 실제 200 응답 검증

이유: 네이버 Yeti 봇이 sitemap raw 한글 URL 처리 시 UTF-8 인코딩 실패하면 EUC-KR 로 변환 → 404. percent-encoded 면 모든 봇이 일관 처리.

### 카테고리 디렉토리
| 카테고리 | path | 설명 |
|---|---|---|
| 가이드 (태아·실손·일반) | `/guide/` | 메인 |
| 어린이보험 | `/child/` | 어린이 전용 |
| 암보험 | `/cancer/` | |
| 여성보험 | `/female/` | |
| 간병보험 | `/care/` | |
| 운전자보험 | `/driver/` | |
| 교육보험 | `/education/` | |
| 광고주 페이지 | `/ads/` | 광고 sales |
| (테스트 영역) | `/medical/liver/` | 추후 통합 — sitemap·admin·rss 등록 금지 |

---

## 8. SEO 체크리스트 (발행 전 9가지)

발행 직전 모든 항목 확인:

1. **title** 60자 이내, 핵심 키워드 1~2개 + " | 베이비빌리"
2. **meta description** 160자 이내, 핵심 키워드 + 페이지 정체성
3. **canonical** 절대 URL, 자기 자신 가리킴 (A/B v2 도 자기 자신)
4. **og:image** 라이브 검증 — `curl -I` 로 200 확인
5. **h1** 정확히 1개, 메인 키워드 포함
6. **JSON-LD** Article + BreadcrumbList + FAQPage 3종 + 본문 FAQ 와 1:1 매칭
7. **내부 링크**: pillar 글에서 spoke 글로 + spoke 에서 pillar 로 (역방향). 본문 안에 자연스럽게 2~5개
8. **이미지 alt** 모든 의미 있는 이미지에 작성. 장식용은 `alt=""` + `aria-hidden`
9. **모바일 검증**: 760px 이하에서 layout 안 깨지는지 — DevTools 시뮬

### GEO (AI 검색) 추가 체크
- **사실 밀도**: 핵심 수치 본문 텍스트에 명시 (이미지 안에만 두지 말 것)
- **출처 명시**: "2026년 기준", "손해보험사 평균" 같은 컨텍스트 단어
- **speakable**: JSON-LD 에 `.answer .text`, `.hero h1` 포함 (음성 검색)
- **author.image**: Person 타입 author 의 image 필드에 Billy 사진 URL

---

## 9. E-E-A-T 신호 (필수)

Google·AI 검색이 신뢰도 판단하는 핵심 단서. 모든 글에 다음 4종 필수:

### A. JSON-LD `author` (Person 타입 + worksFor)
```json
"author": {
  "@type": "Person",
  "image": "https://villagebaby.kr/assets/img/billy-author-256.png",
  "name": "베이비빌리 보험 전문팀",
  "jobTitle": "부모·가족 보험 컨설턴트",
  "worksFor": { "@type": "Organization", "name": "베이비빌리", "url": "https://babybilly.co" },
  "description": "...10년 이상 전문 상담...",
  "knowsAbout": [...]
}
```

### B. JSON-LD `reviewedBy`
```json
"reviewedBy": {
  "@type": "Person",
  "name": "베이비빌리 보험 전문 감수단",
  "description": "10년 이상 태아·어린이보험 분야에 종사한 전문가들이 감수한 콘텐츠입니다."
}
```

### C. JSON-LD `publisher` (Organization + logo)
```json
"publisher": {
  "@type": "Organization",
  "name": "베이비빌리",
  "url": "https://villagebaby.kr/",
  "logo": { "@type": "ImageObject", "url": "https://villagebaby.kr/logo.png" },
  "sameAs": ["https://pf.kakao.com/_bxjJfn"]
}
```

### D. 시각 Author Card (본문 최상단)
이미 Section 3 템플릿에 포함. CSS:
```css
.author-card{display:flex;align-items:center;gap:14px;padding:14px 18px;background:#F9FAFB;border:1px solid #F3F4F6;border-radius:12px;margin:20px 0 24px}
.author-card .ac-photo{flex-shrink:0;width:48px;height:48px;border-radius:50%;overflow:hidden;display:block}
.author-card .ac-photo img{width:100%;height:100%;object-fit:cover;display:block}
.author-card .ac-meta{flex:1;min-width:0}
.author-card .ac-name{font-size:13.5px;color:#374151;margin:0 0 3px;font-weight:600;line-height:1.4}
.author-card .ac-name a{color:#2563B6;font-weight:800;text-decoration:none;border-bottom:1px dotted currentColor}
.author-card .ac-rev{font-size:11.5px;color:#6B7280;margin:0;line-height:1.5}
@media(max-width:760px){.author-card{padding:12px 14px;gap:11px}.author-card .ac-photo{width:42px;height:42px}.author-card .ac-name{font-size:13px}}
```

### E. 본문 byline 의 베이비빌리 → babybilly.co 링크
hero `.meta` 안 `<strong>베이비빌리</strong>` 는 반드시 다음 형태로:
```html
<strong>
  <a href="https://babybilly.co" target="_blank" rel="author noopener"
     style="color:inherit;text-decoration:none;border-bottom:1px dotted currentColor">베이비빌리</a>
</strong>
```

---

## 10. RSS·Sitemap 발행 규칙 (네이버 호환 — 3대 규칙)

네이버 서치어드바이저 거부 사례에서 학습한 규칙. 위반 시 등록 거절.

### 규칙 1: XML escape
`<title>`, `<description>` 안의 `&` 는 반드시 `&amp;` 로 escape. 안 하면 `xmlParseEntityRef: no name` 에러.

```js
// Node.js 안전 변환
function xmlEscape(s) {
  return s.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
}
```

### 규칙 2: 한글 URL percent-encoding
RSS `<link>`, `<guid>`, sitemap `<loc>` 에 한글 path 가 들어가면 반드시 percent-encoded.

```js
// Node.js
const encoded = encodeURI(decodeURI(url)); // 이중 인코딩 방지
```

### 규칙 3: 이미지 URL 라이브 검증
RSS `<image><url>`, sitemap `<image:loc>` 의 이미지가 실제 HTTP 200 응답해야 함.

```bash
curl -sI "{이미지 URL}" -o /dev/null -w "%{http_code}\n"
# 200 아니면 발행 금지
```

### 발행 전 검증 1줄 스크립트
```bash
node -e "
const url = require('url');
const u = 'https://villagebaby.kr/guide/{슬러그}/';
const encoded = encodeURI(decodeURI(u));
console.log('encoded:', encoded);
"
```

---

## 11. 배포 워크플로우

### 텍스트 파일 (HTML, JSON, MD, XML)
- `mcp__github__create_or_update_file` 또는 `mcp__github__push_files` 사용 가능
- 단일 파일: `create_or_update_file`
- 여러 파일 일괄: tree+commit API (한 커밋에 묶이게)

### Binary (이미지)
- mcp 의 file tools 는 text 만 지원 → **Git Data API 직접 호출 필요**
- 절차: blob 생성 → tree 생성 → commit 생성 → ref 업데이트
- PAT 는 `~/.claude/mcp.json` 의 `GITHUB_PERSONAL_ACCESS_TOKEN`

### 신규 글 1편 발행 표준 절차

1. `/guide/{슬러그}/index.html` 작성 (Section 3 템플릿)
2. 글 전용 이미지가 있으면 `/guide/{슬러그}/img-*.jpg` 업로드
3. `sitemap.xml` 갱신 — 새 `<url>` 블록 (percent-encoded loc)
4. `rss.xml` 갱신 — 새 `<item>` (escape + encoded + 라이브 이미지)
5. admin 대시보드 `index.html` 갱신 — admin row 추가 (`data-url` 필수). 정확한 admin 경로는 별도 공유 채널 (Slack DM)로 확인.
6. Pillar 글에 신규 spoke 링크 추가 (관련 카드 또는 본문 안)
7. push → 30~90초 대기 → 라이브 검증 (`curl -I`)

### A/B 테스트 시 (선택)
같은 주제 두 버전 동시 배포로 SEO 효과 비교. 4~8주 후 우수 버전 채택.

원칙:
- v1, v2 둘 다 canonical 자기 자신
- 둘 다 sitemap 등록 (v1 priority 0.9, v2 0.7)
- **두 페이지 간 내부 링크 금지** — 다른 가이드에서 둘 중 하나만 링크
- v1 파일·sitemap 항목은 절대 변경 금지 (lastmod 포함)
- v1 이미지를 v2 경로로 복사 (같은 binary)
- 종료 시: 열등 버전 → 301 redirect 또는 noindex

---

## 12. 브랜드 규칙

### 베이비빌리
- 한글 표기: **베이비빌리** (한글 그대로)
- 영문 표기: **babybilly** (소문자)
- 도메인: `villagebaby.kr` (콘텐츠), `babybilly.co` (앱 랜딩)
- 클릭 가능한 "베이비빌리" 텍스트 → **`https://babybilly.co`** 링크 (author 컨텍스트)
- nav logo 클릭 → `/` (apex 홈, 사이트 navigation 용)

### 자매 브랜드
- **ruuve** — 자사 화장품. 영문 표기 항상 **소문자** (`ruuve`, `RUUVE`/`Ruuve` 금지). 도메인 `ruuve.kr`, 매거진 `guide.ruuve.kr`.
- 보험 가이드 안에서 ruuve 언급은 일반적으로 하지 않음.

### 호칭
- 독자 호칭: **"부모님"** (formal) 또는 **"엄빠"** (캐주얼). 1글 내 일관성 유지.
- 컨설턴트: **"베이비빌리 보험 전문팀"** (Person · worksFor 베이비빌리)
- 감수자: **"베이비빌리 보험 전문 감수단"** (reviewedBy)

---

## 13. 금지 사항 (빨간 깃발)

발견 즉시 제거·수정해야 하는 패턴:

### 콘텐츠
- ❌ 특정 보험사 명시 추천 ("ABC 보험사를 추천합니다") → "한 보험사", "A사" 익명화
- ❌ "치료된다", "완치", "100% 보장" 같은 단정적 의료/금융 표현
- ❌ "가입하세요" 영업 어조 → "검토해보세요", "확인하세요"
- ❌ 출처 없는 통계 수치 → 시점·출처 명시
- ❌ 표나 이미지 안의 핵심 정보가 본문 텍스트에 없는 경우 (GEO 누락)

### 기술
- ❌ 상대경로 이미지 `<img src="./img-*.jpg">` → **절대경로 `/guide/{슬러그}/img-*.jpg`**
- ❌ raw 한글 URL in sitemap·RSS `<loc>` → percent-encoded
- ❌ XML escape 누락 (`&` 그대로) in RSS title/description
- ❌ 빈 alt + aria-hidden 없는 의미 이미지 → alt 채우거나 둘 다 추가
- ❌ JSON-LD FAQ 와 본문 FAQ 답변 불일치 → 1:1 매칭
- ❌ 파비콘 6MB 같은 거대 이미지 → 50KB 이하로 압축
- ❌ author 사진을 본문 이미지로 매번 6MB favicon 사용 → 96px·256px 리사이즈본 사용

### 보안
- ❌ 코드·문서·터미널에 GitHub PAT 또는 API key 평문 노출 (`echo "ghp_..."`, `export TOKEN=ghp_...`)
- ❌ admin path / PIN 을 본 문서나 repo public 영역에 명시
- ❌ Dropbox·OneDrive·Google Drive sync 폴더에 `.env`, credentials 파일 저장

---

## 14. LLM 프롬프트 템플릿 (시작용)

팀원이 LLM 에 작업 지시할 때 사용. 본 플레이북 통째로 + 아래 한 가지 추가.

### 신규 가이드 1편 작성
```
[본 플레이북 전체 붙여넣기]

---
작업: 다음 주제로 새 가이드 글 1편 작성.

- 주제: {예: "암보험 갱신형 vs 비갱신형 — 어느 쪽이 유리한가"}
- 슬러그: {예: "갱신형-vs-비갱신형"}
- 카테고리: {예: cancer}
- 분량: 30,000자 이상
- 필수 포함: TL;DR / TOC / H2 6~10개 / FAQ 6개 / Related 4개 / CTA / Author card
- pillar 글: {pillar 슬러그 — 내부 링크 양방향}
- 핵심 키워드: {예: "갱신형 암보험, 비갱신형 암보험, 보험료 비교"}
- 추가 컨텍스트: {필요시}

산출물 형식: 위 Modern Template 그대로 HTML 1개 + JSON-LD 풀버전 + sitemap.xml 에 추가할 <url> 블록 + rss.xml 에 추가할 <item> 블록.
```

### 기존 글 SEO 보강
```
[본 플레이북 전체 붙여넣기]

---
작업: 기존 글 https://villagebaby.kr/guide/{슬러그}/ 을 SEO 체크리스트 (Section 8) 9개 항목 기준으로 audit + 개선.

내가 줄 것:
- 현재 HTML 전문 (paste below)

산출물:
- 각 9개 항목 PASS/FAIL 표
- FAIL 항목별 수정 patch (변경 전 → 변경 후)
- JSON-LD 갱신본 (있다면)
```

### 어린이보험 spoke 글 일괄 작성
```
[본 플레이북 전체 붙여넣기]

---
작업: 어린이보험 pillar (/child/어린이보험-완전정리/) 의 spoke 글 N편 작성.

- 카테고리: child
- 분량: 각 글 25,000자 이상
- 주제 N개: {예: "어린이보험 5세대 전환 시기", "...", ...}
- 모든 spoke 끼리 상호 링크 + pillar 양방향 링크

산출물 형식: 글마다 HTML 1개 + sitemap·rss 추가 블록.
```

---

## 15. 참고 자료 (라이브 URL)

새 LLM 세션이 본 플레이북을 보완하기 위해 참조할 수 있는 라이브 페이지:

| 용도 | URL |
|---|---|
| Modern template 표준 견본 | https://villagebaby.kr/guide/30대-40대-5세대-실손-보험료/ |
| FAQ + 표 견본 | https://villagebaby.kr/guide/태아보험-가입시기-필수특약/ |
| 인포그래픽 활용 견본 | https://villagebaby.kr/guide/태아보험-거절-사례/ |
| 컴플렉스 비교표 | https://villagebaby.kr/guide/4세대-5세대-실손-보험료-비교/ |
| 어린이 spoke 견본 | https://villagebaby.kr/child/어린이보험-완전정리/ |
| sitemap | https://villagebaby.kr/sitemap.xml |
| rss | https://villagebaby.kr/rss.xml |
| robots | https://villagebaby.kr/robots.txt |

---

## 16. 알려진 이슈 (2026-05 기준)

| 이슈 | 상태 | 우선순위 |
|---|---|---|
| sitemap.xml 의 64 URL 모두 raw 한글 — Naver Yeti 인덱싱 일부 실패 | 다음 PR 에 percent-encoded 일괄 갱신 예정 | 높음 |
| www.villagebaby.kr SSL cert SAN 에 www 누락 | 24h 자동 발급 대기 또는 GitHub Pages 설정 reset | 중 |
| Variant template 32 페이지에 시각 author card 미적용 | JSON-LD 만 적용됨. 차후 template 통일 시 시각 card | 낮음 |
| `/medical/liver/` 5 페이지 sitemap·admin 미등록 (의도된 제외) | 사용자가 추후 일괄 처리 예정. 건드리지 말 것 | — |

---

## 17. 변경 이력 (2026-05-10 작성)

본 플레이북은 villagebaby.kr 운영 약 1년의 학습을 정리. 이후 새 패턴·교훈은 같은 .md 에 추가.

- 2026-05-10: v1.0 — Modern template, JSON-LD 3종, E-E-A-T 4종, RSS·sitemap 3대 규칙, 디자인 토큰, 브랜드 규칙 통합
- (이후 갱신은 여기 추가)

---

*Generated by Claude Code session 2026-05-10. 본 플레이북에 추가·수정 시 LLM 으로 일관성 유지 권장.*
