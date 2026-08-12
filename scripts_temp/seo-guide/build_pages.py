#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""villagebaby.kr /guide/ 0~12주·태아보험 신규 SEO 페이지 빌더.
기준 템플릿: guide/임신-초기-배뭉침/index.html (2026-08-04 발행분)
"""
import json
import os
import re
import sys

SITE = "/Users/villagebaby/villagebaby-ai-site"
TODAY = "2026-08-12"

CSS = """:root{--blue:#2563eb;--blue-dark:#1d4ed8;--bg:#f8fafc;--text:#1e293b;--muted:#64748b;--border:#e2e8f0;--radius:12px;--mint:#3a8a7a;--mint-bg:#e8f4ef}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Pretendard Variable','Pretendard',-apple-system,system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.7;word-break:keep-all}
a{color:var(--blue);text-decoration:none}a:hover{text-decoration:underline}
.vb-nav{border-bottom:1px solid #E5E7EB;background:#fff;position:sticky;top:0;z-index:50}
.vb-nav-inner{max-width:880px;margin:0 auto;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.vb-nav-logo{display:inline-flex;align-items:center}.vb-nav-logo img{height:36px;width:auto;display:block}
.vb-nav-cta{display:inline-flex;align-items:center;gap:6px;background:#1666C5;color:#fff !important;font-size:13px;font-weight:700;padding:9px 16px;border-radius:16px;text-decoration:none;box-shadow:0 3px 12px rgba(22,102,197,.25);white-space:nowrap}
.vb-nav-cta::before{content:'';width:6px;height:6px;background:#FFEB55;border-radius:50%;animation:vb-pulse 1.5s infinite}
@keyframes vb-pulse{0%,100%{opacity:1}50%{opacity:.4}}
.hero{position:relative;background:linear-gradient(180deg,#E8F4EF 0%,#FFFFFF 100%);padding:60px 24px 44px;overflow:hidden}
.hero-deco{position:absolute;right:max(-20px,calc(50% - 380px));top:30px;width:160px;opacity:.85;pointer-events:none;z-index:0;height:auto}
.hero-inner{max-width:780px;margin:0 auto;position:relative;z-index:1}
.hero-badge{display:inline-block;background:var(--mint-bg);color:var(--mint);padding:4px 14px;border-radius:12px;font-size:.82rem;font-weight:700;margin-bottom:14px}
.hero h1{font-size:clamp(1.6rem,4vw,2.3rem);font-weight:800;line-height:1.3;margin-bottom:14px;color:#1F2937}
.hero h1 em{font-style:normal;color:var(--mint)}
.hero-lead{font-size:1.03rem;color:#4B5563;line-height:1.75;margin-bottom:18px;max-width:580px}
.hero-meta{display:flex;gap:16px;font-size:.83rem;color:#6B7280;flex-wrap:wrap}
.container{max-width:780px;margin:0 auto;padding:32px 20px 60px}
h2{font-size:1.35rem;font-weight:800;margin:36px 0 14px;padding-bottom:8px;border-bottom:2px solid var(--border);color:#1F2937}
h3{font-size:1.07rem;font-weight:700;margin:24px 0 10px;color:#374151}
p{margin-bottom:13px}ul,ol{margin:0 0 14px 22px}li{margin-bottom:6px}
.answer-box{background:linear-gradient(135deg,#FFFAEB 0%,#FFF1C2 100%);border:1.5px solid #F5B500;border-radius:12px;padding:20px 22px;margin:22px 0;color:#5C3A00}
.answer-box .lab{font-size:11.5px;font-weight:700;color:#8C5A00;margin-bottom:7px}.answer-box .lab::before{content:'\\26A1 '}
.answer-box .text{font-size:14.5px;line-height:1.8;font-weight:600;color:#3D2700}
.answer-box .text strong{background:rgba(255,255,255,.7);padding:1px 4px;border-radius:4px;color:#78350F}
.callout{background:#EFF6FF;border:none;padding:14px 18px;border-radius:0 8px 8px 0;margin:16px 0;font-size:14px;line-height:1.7;color:#1F2937}
.callout.warn{background:#FFF1F1;border-left:4px solid #F94646;color:#5C1010}.callout.tip{background:#FFFAEB;border-left:4px solid #F5B500;color:#5C3A00}
.tbl-wrap{overflow-x:auto;margin-bottom:18px}table{width:100%;border-collapse:collapse;font-size:.91rem}
th{background:#1e3a5f;color:#fff;padding:10px 13px;text-align:left}td{padding:10px 13px;border-bottom:1px solid var(--border)}tr:last-child td{border-bottom:none}tr:nth-child(even) td{background:#f8fafc}
.guide-img{width:100%;max-width:640px;height:auto;border-radius:14px;display:block;margin:14px auto 6px;box-shadow:0 2px 12px rgba(0,0,0,.07)}
.cta{background:linear-gradient(135deg,var(--mint),#5fa898);color:#fff;border-radius:var(--radius);padding:28px 24px;text-align:center;margin:32px 0;box-shadow:0 4px 18px rgba(58,138,122,.2)}
.cta .ct{font-size:1.02rem;font-weight:800;margin-bottom:8px;color:#fff}.cta .cd{font-size:.92rem;opacity:.95;line-height:1.6;margin-bottom:16px;color:#fff}
.cta a{display:inline-block;background:#fff;color:var(--mint);font-weight:700;padding:11px 26px;border-radius:16px;font-size:.94rem}
.cta.app{background:linear-gradient(135deg,#2D7CD2,#4a97e6);box-shadow:0 4px 18px rgba(45,124,210,.22)}.cta.app a{color:#2D7CD2}
.faq-item{border:1px solid var(--border);border-radius:var(--radius);margin-bottom:12px;overflow:hidden}
.faq-q{background:#f1f5f9;padding:14px 18px;font-weight:700;font-size:.96rem}
.faq-a{padding:14px 18px;font-size:.92rem}.faq-a p{margin-bottom:8px}.faq-a ul{margin-left:18px}
.disclaimer-note{font-size:12px;color:#9CA3AF;line-height:1.7;margin:22px 0 8px;padding:10px 14px;background:#F9FAFB;border-radius:8px;border:none}
.disclaimer-note strong{color:#6B7280}
.vb-footer{border-top:1px solid #E5E7EB;background:#fff;padding:30px 24px 40px;text-align:center;color:#6B7280;font-size:13px;margin-top:36px}
.vb-footer .vb-ftop{font-weight:700;color:#374151;font-size:13.5px;margin-bottom:6px}
.vb-footer .vb-fdesc{font-size:11.5px;color:#9CA3AF;line-height:1.65;max-width:540px;margin:0 auto}
.vb-footer .vb-fmenu{margin-top:12px;font-size:11.5px;color:#9CA3AF}
.vb-footer .vb-fmenu a{color:inherit;text-decoration:none}.vb-footer .vb-fmenu a:hover{text-decoration:underline}
@media(max-width:760px){.vb-nav-inner{padding:10px 16px;gap:8px}.vb-nav-logo img{height:32px}.vb-nav-cta{font-size:12px;padding:8px 13px}.hero{padding:42px 16px 32px}.hero-deco{width:100px;opacity:.5}}"""

REFS_DEFAULT = [
    ("대한산부인과학회", "임신 중 건강관리 안내", "https://www.ksog.org/"),
    ("American College of Obstetricians and Gynecologists", "Pregnancy FAQs", "https://www.acog.org/"),
    ("보건복지부 국가건강정보포털", "임신·출산 정보", "https://health.kdca.go.kr/"),
]

APP_LINK = "https://app.babybilly.app/qm6eya8"
INS_BASE = "https://babybilly.co/insurance/baby/talk/v1"
INS_GENERAL = "https://babybilly.co/insurance/general/v2"

# 섹션별 빵부스러기 이름 — /guide/ 외 영역에도 같은 템플릿을 쓴다
CRUMB = {
    "guide": ("태아보험 가이드", "https://villagebaby.kr/guide/"),
    "driver": ("운전자보험", "https://villagebaby.kr/driver/"),
    "care": ("간병보험", "https://villagebaby.kr/care/"),
    "child": ("어린이보험", "https://villagebaby.kr/child/"),
}


def utm(slug, content, base=INS_BASE):
    return f"{base}?utm_source=villagebaby&utm_medium=content&utm_campaign={slug}&utm_content={content}"


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s)


def render(p):
    slug = p["slug"]
    sec = p.get("section", "guide")
    base = p.get("ins_base", INS_BASE)
    faqs = p["faqs"]
    refs = p.get("refs", REFS_DEFAULT)

    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "MedicalWebPage",
                "headline": p["title"],
                "description": p["ld_desc"],
                "url": f"https://villagebaby.kr/{sec}/{slug}/",
                "datePublished": f"{TODAY}T00:00:00+09:00",
                "dateModified": TODAY,
                "author": {"@type": "Organization", "name": "베이비빌리 콘텐츠팀"},
                "publisher": {
                    "@type": "Organization", "name": "베이비빌리", "url": "https://villagebaby.kr",
                    "logo": {"@type": "ImageObject", "url": "https://villagebaby.kr/logo.png"},
                },
                "image": [f"https://villagebaby.kr/assets/og/{sec}_{slug}-blue.png"],
                "citation": [{"@type": "CreativeWork", "name": n, "url": u} for n, _, u in refs],
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "홈", "item": "https://villagebaby.kr/"},
                    {"@type": "ListItem", "position": 2, "name": CRUMB.get(sec, CRUMB["guide"])[0], "item": CRUMB.get(sec, CRUMB["guide"])[1]},
                    {"@type": "ListItem", "position": 3, "name": p["crumb"], "item": f"https://villagebaby.kr/{sec}/{slug}/"},
                ],
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}}
                    for q, a in faqs
                ],
            },
        ],
    }
    ld_json = json.dumps(ld, ensure_ascii=False, separators=(",", ":"))

    summary = "\n".join(f"<li>{b}</li>" for b in p["summary"])
    body = "\n\n".join(p["sections"])
    faq_html = "\n".join(
        f'<div class="faq-item"><div class="faq-q">{q}</div><div class="faq-a"><p>{a}</p></div></div>'
        for q, a in faqs
    )
    related = "\n".join(f'<li><a href="{u}">{t}</a></li>' for t, u in p["related"])
    refs_html = "\n".join(
        f'<li id="ref-{i+1}">{n}, <em>{t}</em>. <a href="{u}" rel="external nofollow noopener" target="_blank">{n}</a></li>'
        for i, (n, t, u) in enumerate(refs)
    )

    app_block = ("" if not p.get("app_ct") else
                 f'<div class="cta app"><p class="ct">{p["app_ct"]}</p><p class="cd">{p["app_cd"]}</p>'
                 f'<a href="{APP_LINK}" target="_blank" rel="noopener">{p["app_btn"]}</a></div>')

    seed_html = p['seed'].replace(
        "{LINK}",
        f'<a href="{utm(slug, "seed_prep", base)}" id="ins-seed" target="_blank" rel="noopener">{p["seed_anchor"]}</a>')

    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{p['title']}</title>
<meta name="description" content="{p['desc']}">
<meta name="keywords" content="{p['keywords']}, 베이비빌리">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/favicon.png">
<link rel="canonical" href="https://villagebaby.kr/{sec}/{slug}/">
<meta property="og:type" content="article">
<meta property="og:site_name" content="베이비빌리">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="{p['og_title']}">
<meta property="og:description" content="{p['og_desc']}">
<meta property="og:url" content="https://villagebaby.kr/{sec}/{slug}/">
<meta property="article:modified_time" content="{TODAY}T00:00:00+09:00">
<meta property="og:image" content="https://villagebaby.kr/assets/og/{sec}_{slug}-blue.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">
<meta property="og:image:alt" content="{p['og_alt']} | 베이비빌리">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://villagebaby.kr/assets/og/{sec}_{slug}-blue.png">
<meta name="twitter:image:alt" content="{p['og_alt']} | 베이비빌리">
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<script type="application/ld+json">{ld_json}</script>
<style>
{CSS}
</style>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-VNXYBTFWXB"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-VNXYBTFWXB');
    gtag('config', 'G-SRWXXLKTKD');
  </script>
</head>
<body>
<nav class="vb-nav"><div class="vb-nav-inner"><a href="/" class="vb-nav-logo" aria-label="베이비빌리 홈"><img src="/logo.png" alt="베이비빌리" width="99" height="74"></a><a href="{utm(slug,'pos1',base)}" class="vb-nav-cta">카톡 무료 상담</a></div></nav>
<header class="hero">
<picture><source srcset="/assets/img/pregnant-mom.webp" type="image/webp"><img class="hero-deco" src="/assets/img/pregnant-mom.png" alt="" aria-hidden="true" width="308" height="324"></picture>
<div class="hero-inner">
<span class="hero-badge">{p['hero_badge']}</span>
<h1>{p['h1']}<br><em>{p['h1_em']}</em></h1>
<p class="hero-lead">{p['lead']}</p>
<div class="hero-meta"><span>⏱ 읽는 시간 {p['read']}분</span><time datetime="{TODAY}">최종 업데이트 {TODAY}</time><span>{p['meta_tag']}</span></div>
</div>
</header>
<main>
  <img id="og-hero" src="/assets/og/{sec}_{slug}-blue.png" alt="{p['og_alt']} - 베이비빌리 가이드" title="{p['crumb']}" width="1200" height="630" decoding="async" style="width:100%;max-width:560px;height:auto;border-radius:16px;display:block;margin:24px auto;box-shadow:0 4px 16px rgba(0,0,0,0.08)">
  <script>(function(){{var c=["blue","mint","cream","lavender","peach"];var p=c[Math.floor(Math.random()*c.length)];if(p!=="blue"){{var el=document.getElementById("og-hero");if(el)el.src="/assets/og/{sec}_{slug}-"+p+".png";}}}})();</script>
<div class="container">
<div class="answer-box"><div class="lab">세 줄 요약</div><ul class="text" style="margin:0;padding-left:20px;line-height:1.72">
{summary}
</ul></div>

{body}

{app_block}

<div class="callout">{seed_html}</div>

<section><h2>자주 묻는 질문</h2>
{faq_html}
</section>

<div class="cta"><p class="ct">{p['ins_ct']}</p><p class="cd">{p['ins_cd']}</p><a href="{utm(slug,'cta_insurance',base)}" id="ins-cta" target="_blank" rel="noopener">{p['ins_btn']}</a></div>

<section><h2>함께 보면 좋은 가이드</h2>
<ul>
{related}
</ul></section>

<section><h2>참고 자료</h2>
<ol style="font-size:.88rem;color:var(--muted);line-height:1.85">
{refs_html}
</ol>
<p class="disclaimer-note">{p['disclaimer_head']} {p['disclaimer']} 특정 상품을 권유하지 않습니다.</p></section>
</div></main>
<footer class="vb-footer">
<p class="vb-ftop">엄빠를 위한 베이비빌리 꿀팁 연구소</p>
<p class="vb-fdesc">본 콘텐츠는 정보 제공 목적이며, 실제 가입 시 보험사 약관과 전문가 상담을 통해 확인하세요.</p>
<p class="vb-fmenu"><a href="/">홈</a> · <a href="/guide/">가이드</a> · <a href="/child/">어린이보험</a> · <a href="/tools/">도구</a> · <a href="/privacy/">개인정보처리방침</a> · <a href="/terms/">이용약관</a></p>
</footer>
<script>
/* CTA 클릭 이벤트 — 카톡 상담·앱·보험 씨앗 (우리 GA4 측정) */
(function(){{
  var SLUG="{slug}";
  function track(type,variant){{ if(typeof gtag==="function"){{ gtag('event','cta_click',{{cta_type:type,cta_variant:variant||'none',page_slug:SLUG,send_to:'G-SRWXXLKTKD'}}); }} }}
  var k=document.querySelector('.vb-nav-cta'); if(k){{ k.addEventListener('click',function(){{ track('kakao'); }}); }}
  var ap=document.querySelector('.cta.app a'); if(ap){{ ap.addEventListener('click',function(){{ track('app'); }}); }}
  var seed=document.getElementById('ins-seed'); if(seed){{ seed.addEventListener('click',function(){{ track('insurance','seed_prep'); }}); }}
  var ic=document.getElementById('ins-cta'); if(ic){{ ic.addEventListener('click',function(){{ track('insurance','cta_main'); }}); }}
}})();
</script>
</body></html>
"""


if __name__ == "__main__":
    from pages_data import PAGES
    for p in PAGES:
        d = os.path.join(SITE, p.get("section", "guide"), p["slug"])
        os.makedirs(d, exist_ok=True)
        html = render(p)
        with open(os.path.join(d, "index.html"), "w", encoding="utf-8") as f:
            f.write(html)
        txt = re.sub(r"\s+", "", strip_tags(re.sub(r"<(script|style).*?</\1>", "", html, flags=re.S)))
        print(f"{p['slug']}: {len(html):,}B html / 본문 {len(txt):,}자")
