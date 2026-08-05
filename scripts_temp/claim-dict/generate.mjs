// 질병코드 보장 사전 — 정적 페이지 생성기
// 실행: node scripts_temp/claim-dict/generate.mjs  (레포 루트 기준)
// 출력: tools/claim-dict/{slug}/index.html, tools/claim-dict/index.html, tools/claim-dict/codes.json
import { PART1 } from './codes-part1.mjs';
import { PART2 } from './codes-part2.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'tools', 'claim-dict');
const CODES = [...PART1, ...PART2];
const UPDATED = '2026-08-05';
const UPDATED_DOT = '2026.08.05';

const CATS = {
  resp:    { label: '호흡기',       icon: '🫁' },
  allergy: { label: '알레르기·피부', icon: '🌸' },
  infect:  { label: '감염병',       icon: '🦠' },
  ent:     { label: '이비인후·눈',   icon: '👂' },
  digest:  { label: '소화·비뇨',    icon: '🍼' },
  symptom: { label: '발열·증상',    icon: '🌡️' },
  injury:  { label: '외상·사고',    icon: '🩹' },
  newborn: { label: '신생아·선천',  icon: '👶' },
  noclaim: { label: '청구 주의·불가', icon: '⚠️' },
};
const BADGES = {
  yes:  { label: '실손 청구 가능', cls: 'b-yes' },
  cond: { label: '조건부·주의',   cls: 'b-cond' },
  no:   { label: '실손 보상 제외', cls: 'b-no' },
};

const CTA_BASE = 'https://babybilly.co/insurance/general/v2';
const utm = (slug, pos) => `${CTA_BASE}?utm_source=villagebaby&utm_medium=content&utm_campaign=claim-dict-${slug}&utm_content=pos${pos}`;
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const disp = (c) => c.code.replace('-', '.'); // 화면 표기용 코드 (T78-4 → T78.4)
const bySlug = Object.fromEntries(CODES.map(c => [c.slug, c]));

// ── 공통 CSS ──
const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}a{color:inherit;text-decoration:none}img{max-width:100%;display:block}
:root{--blue-900:#0D3B6F;--blue-800:#15518F;--blue-700:#2563B6;--blue-600:#2D7CD2;--blue-200:#C9DCEF;--blue-100:#E4ECF6;--blue-50:#EFF4FA;--pink-50:#FFF1E6;--light-yellow:#FFE4B5;--skyblue:#C9E2EE;--light-violet:#ECE0FF;--mint:#BFEBE0;--gray-900:#1F2937;--gray-800:#374151;--gray-700:#4B5563;--gray-600:#6B7280;--gray-500:#9CA3AF;--gray-400:#D1D5DB;--gray-300:#E5E7EB;--gray-200:#F3F4F6;--gray-100:#F9FAFB;--white:#FFFFFF;--red:#F94646;--green:#2ED371;--shadow-blue:0 3px 17px 1px rgba(45,124,210,.30);--shadow-s:0 1px 6px 0 rgba(0,0,0,.15);--shadow-xs:0 0 3px 0 rgba(0,0,0,.10)}
body{font-family:'Pretendard Variable','Pretendard',-apple-system,sans-serif;color:var(--gray-900);background:var(--white);-webkit-font-smoothing:antialiased;word-break:keep-all;line-height:1.6}
.vb-nav{border-bottom:1px solid #E5E7EB;background:#fff;position:sticky;top:0;z-index:50}
.vb-nav-inner{max-width:880px;margin:0 auto;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.vb-nav-logo{display:inline-flex;align-items:center}.vb-nav-logo img{height:36px;width:auto;display:block}
.vb-nav-cta{display:inline-flex;align-items:center;gap:6px;background:#1666C5;color:#fff !important;font-size:13px;font-weight:700;padding:9px 16px;border-radius:16px;text-decoration:none;box-shadow:0 3px 12px rgba(22,102,197,.25);white-space:nowrap}
.vb-nav-cta::before{content:'';width:6px;height:6px;background:#FFEB55;border-radius:50%;animation:vb-pulse 1.5s infinite}
@keyframes vb-pulse{0%,100%{opacity:1}50%{opacity:.4}}
.hero{position:relative;padding:48px 24px 36px;background:linear-gradient(180deg,var(--blue-50) 0%,var(--white) 100%);border-bottom:1px solid var(--blue-100)}
.hero-inner{max-width:780px;margin:0 auto}
.hero .breadcrumb{font-size:12px;color:var(--gray-500);margin-bottom:14px}.hero .breadcrumb a{color:var(--gray-500)}.hero .breadcrumb a:hover{color:var(--blue-600)}
.hero .badge{display:inline-flex;align-items:center;gap:6px;background:var(--blue-700);color:#fff;font-size:11.5px;font-weight:700;padding:5px 12px;border-radius:12px;margin-bottom:14px}
.hero h1{font-size:30px;font-weight:700;margin-bottom:12px;line-height:1.35}.hero h1 em{font-style:normal;color:var(--blue-700)}
.hero h1 .h1-sub{font-size:20px;font-weight:700;color:var(--gray-700)}
.hero .lead{color:var(--gray-700);font-size:15.5px;line-height:1.75;margin-bottom:16px;max-width:640px}
.hero .meta{display:flex;gap:14px;font-size:12.5px;color:var(--gray-600);flex-wrap:wrap}
.container{max-width:780px;margin:0 auto;padding:0 24px}
.author-card{display:flex;align-items:center;gap:14px;padding:14px 18px;background:#F9FAFB;border:1px solid #F3F4F6;border-radius:12px;margin:28px 0 20px}
.author-card .ac-photo{flex-shrink:0;width:48px;height:48px;border-radius:50%;overflow:hidden;display:block}
.author-card .ac-photo img{width:100%;height:100%;object-fit:cover}
.author-card .ac-name{font-size:13.5px;color:#374151;margin:0 0 3px;font-weight:600;line-height:1.4}
.author-card .ac-name a{color:var(--blue-700);font-weight:800;border-bottom:1px dotted currentColor}
.author-card .ac-rev{font-size:11.5px;color:#6B7280;margin:0;line-height:1.5}
.answer{background:linear-gradient(135deg,#FFFAEB 0%,#FFF1C2 100%);border:1.5px solid #F5B500;border-radius:16px;padding:22px 24px;margin:0 0 28px;color:#5C3A00}
.answer .lab{font-size:11.5px;font-weight:700;color:#8C5A00;margin-bottom:8px}.answer .lab::before{content:'⚡ '}
.answer .text{font-size:15px;line-height:1.7;font-weight:600;color:#3D2700}
.status-badge{display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:800;padding:10px 20px;border-radius:14px;margin:0 0 24px}
.b-yes{background:#E6FAF1;color:#0D5C32;border:1.5px solid #2ED371}
.b-cond{background:#FEF5E4;color:#92540A;border:1.5px solid #F5B500}
.b-no{background:#FFF1F1;color:#7C1D1D;border:1.5px solid #F94646}
h2.sec{font-size:21px;font-weight:700;margin:36px 0 14px;color:var(--gray-900);padding-left:12px;border-left:4px solid var(--blue-600)}
p.body{font-size:15px;color:var(--gray-800);line-height:1.8;margin-bottom:12px}
.point-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0}
.point-card{border:1.5px solid var(--gray-200);border-radius:14px;padding:18px}
.point-card .pc-tag{display:inline-block;font-size:11.5px;font-weight:800;padding:3px 10px;border-radius:8px;margin-bottom:10px}
.point-card.gy .pc-tag{background:var(--blue-100);color:var(--blue-800)}
.point-card.bg .pc-tag{background:var(--light-violet);color:#5B21B6}
.point-card p{font-size:13.5px;color:var(--gray-700);line-height:1.7}
.callout{border-radius:12px;padding:16px 18px;font-size:14px;line-height:1.75;margin:14px 0}
.callout.info{background:var(--blue-50);color:var(--gray-800)}.callout.info strong{color:var(--blue-800)}
.callout.warn{background:#FFF8F0;border:1px solid #FFD9A8;color:#7A4A08}
.tip-list{list-style:none;margin:12px 0}
.tip-list li{position:relative;padding:10px 14px 10px 38px;background:var(--gray-100);border-radius:10px;margin-bottom:8px;font-size:14px;color:var(--gray-800);line-height:1.7}
.tip-list li::before{content:'✓';position:absolute;left:14px;top:10px;color:var(--green);font-weight:900}
.docs-box{border:1.5px solid var(--blue-200);border-radius:14px;overflow:hidden;margin:14px 0}
.docs-box .db-head{background:var(--blue-50);padding:12px 18px;font-size:14px;font-weight:800;color:var(--blue-800)}
.docs-box .db-body{padding:14px 18px}
.docs-box .db-row{display:flex;gap:10px;padding:8px 0;border-bottom:1px dashed var(--gray-200);font-size:13.5px;color:var(--gray-800);line-height:1.6}
.docs-box .db-row:last-child{border-bottom:none}
.docs-box .db-row .db-k{flex-shrink:0;font-weight:700;color:var(--blue-700);min-width:110px}
.calc-banner{display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,var(--blue-700) 0%,var(--blue-600) 100%);border-radius:16px;padding:20px 24px;margin:28px 0;color:#fff;box-shadow:var(--shadow-blue)}
.calc-banner .cb-icon{font-size:34px}
.calc-banner .cb-txt{flex:1}.calc-banner .cb-txt strong{display:block;font-size:16px;font-weight:800;margin-bottom:3px}
.calc-banner .cb-txt span{font-size:12.5px;opacity:.92}
.calc-banner .cb-btn{background:#fff;color:var(--blue-700);font-size:13px;font-weight:800;padding:10px 18px;border-radius:12px;white-space:nowrap}
.faq-item{background:var(--white);border:1px solid var(--gray-200);border-radius:12px;margin-bottom:8px;overflow:hidden}
.faq-q{width:100%;padding:16px 20px;text-align:left;font-size:14.5px;font-weight:700;color:var(--gray-900);display:flex;justify-content:space-between;align-items:center;cursor:pointer;border:none;background:none;font-family:inherit}
.faq-q::before{content:'Q.';color:var(--blue-600);font-weight:900;margin-right:6px}
.faq-q .arrow{color:var(--gray-400);transition:.2s;font-style:normal}
.faq-item.open .faq-q .arrow{transform:rotate(180deg)}
.faq-a{padding:0 20px 16px 46px;font-size:13.5px;color:var(--gray-700);line-height:1.7;display:none}
.faq-item.open .faq-a{display:block}
.related-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:18px 0}
.related-card{display:flex;align-items:center;gap:12px;background:var(--white);border:1px solid var(--gray-200);border-radius:12px;padding:14px 16px;transition:box-shadow .2s}
.related-card:hover{box-shadow:var(--shadow-s)}
.related-thumb{width:48px;height:48px;border-radius:10px;background:var(--blue-50);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:17px;font-weight:800;color:var(--blue-700);overflow:hidden;line-height:1;letter-spacing:0}
.related-thumb.code-long{font-size:12px}
.related-card .ttl{font-size:13px;font-weight:700;color:var(--gray-900);margin-bottom:2px;line-height:1.4}
.related-card .desc{font-size:11.5px;color:var(--gray-500)}
.cta-block{background:linear-gradient(135deg,#FFFAEB 0%,#FFEDB8 100%);border:1.5px solid #F5B500;border-radius:18px;padding:30px 28px;text-align:center;color:#3D2700;margin:36px 0}
.cta-block h3{font-size:20px;font-weight:800;margin-bottom:10px;color:#3D2700}
.cta-block p{font-size:14px;color:#6B4A00;line-height:1.7;margin-bottom:18px}
.cta-block .cta-btn{display:inline-block;background:#FEE500;color:#191919;padding:13px 34px;border-radius:16px;font-weight:800;font-size:15px;box-shadow:0 3px 12px rgba(245,181,0,.35)}
.vb-footer{border-top:1px solid #E5E7EB;background:#fff;padding:32px 24px 44px;text-align:center;color:#6B7280;font-size:13px;margin-top:40px}
.vb-footer .vb-ftop{font-weight:700;color:#374151;font-size:13.5px;margin-bottom:6px}
.vb-footer .vb-fdesc{font-size:11.5px;color:#9CA3AF;line-height:1.65;max-width:540px;margin:0 auto}
.vb-footer .vb-fmenu{margin-top:12px;font-size:11.5px;color:#9CA3AF}
.vb-footer .vb-fmenu a{color:inherit}.vb-footer .vb-fmenu a:hover{text-decoration:underline}
.expert-float{position:fixed;bottom:28px;right:24px;z-index:9999;background:var(--blue-600);color:#fff;display:flex;align-items:center;gap:9px;padding:11px 20px 11px 14px;border-radius:999px;font-size:14px;font-weight:700;box-shadow:0 4px 20px rgba(45,124,210,.38);transition:transform .2s;white-space:nowrap}
.expert-float:hover{background:var(--blue-700);transform:translateY(-3px)}
@media(max-width:760px){.hero h1{font-size:24px}.hero h1 .h1-sub{font-size:16px}.hero{padding:38px 18px 26px}.container{padding:0 18px}.point-grid{grid-template-columns:1fr}.related-grid{grid-template-columns:1fr}.calc-banner{flex-direction:column;text-align:center}.vb-nav-inner{padding:10px 16px;gap:8px}.vb-nav-logo img{height:32px}.vb-nav-cta{font-size:12px;padding:8px 13px}}
@media(max-width:480px){.expert-float{padding:0;width:52px;height:52px;border-radius:50%;justify-content:center;bottom:20px;right:16px}.expert-float span:last-child{display:none}}
`;

const navHtml = (slug) => `<nav class="vb-nav"><div class="vb-nav-inner"><a href="/" class="vb-nav-logo" aria-label="베이비빌리 홈"><img src="/logo.png" alt="베이비빌리" width="99" height="74"></a><a href="${utm(slug,1)}" class="vb-nav-cta">카톡 무료 상담</a></div></nav>`;

const footerHtml = `<footer class="vb-footer">
  <p class="vb-ftop">부모를 위한 모든 보험 연구소</p>
  <p class="vb-fdesc">본 콘텐츠는 정보 제공 목적이며, 실제 보상 여부와 금액은 가입 상품의 약관·가입 시점·보험사 심사에 따라 달라질 수 있어요. 청구 전 보험사 확인을 권장해요.</p>
  <p class="vb-fmenu"><a href="/">홈</a> · <a href="/guide/">가이드</a> · <a href="/child/">어린이보험</a> · <a href="/tools/">도구</a> · <a href="/tools/claim-dict/">질병코드 사전</a> · <a href="/privacy/">개인정보처리방침</a> · <a href="/terms/">이용약관</a></p>
</footer>`;

const authorCard = (slug) => `<aside class="author-card">
  <a href="${utm(slug,2)}" target="_blank" rel="author noopener" class="ac-photo"><img src="/assets/img/billy-author-96.png" srcset="/assets/img/billy-author-96.png 1x, /assets/img/billy-author-256.png 2x" alt="베이비빌리" width="48" height="48"></a>
  <div class="ac-meta">
    <p class="ac-name"><a href="${utm(slug,3)}" target="_blank" rel="author noopener">베이비빌리</a> · 200만 엄빠가 사용하는 육아 콘텐츠 앱</p>
    <p class="ac-rev">10년 이상 태아·어린이보험을 전문 상담한 팀이 검수한 콘텐츠입니다.</p>
  </div>
</aside>`;

// ── 코드 상세 페이지 ──
function codePage(c) {
  const cat = CATS[c.cat], badge = BADGES[c.badge], cd = disp(c);
  const url = `https://villagebaby.kr/tools/claim-dict/${c.slug}/`;
  const title = `${cd} ${c.name} 실손 청구 가능할까? 보상 기준·특약·서류 총정리 | 베이비빌리`;
  const desc = `질병코드 ${cd}(${c.name}) 실손의료비 청구 가능 여부, 급여·비급여 보상 포인트, 함께 확인할 특약, 필요 서류와 고지의무 영향까지 한 페이지로 정리했어요.`;

  const relCodes = (c.rel || []).map(s => bySlug[s]).filter(Boolean).slice(0, 3);
  const relCards = [
    ...relCodes.map(r => `<a href="/tools/claim-dict/${r.slug}/" class="related-card"><div class="related-thumb${disp(r).length>3?' code-long':''}">${esc(disp(r))}</div><div><p class="ttl">${esc(disp(r))} ${esc(r.name)}</p><p class="desc">${esc(BADGES[r.badge].label)} · ${esc(CATS[r.cat].label)}</p></div></a>`),
    ...(c.guides || []).slice(0, 1).map(g => `<a href="${esc(g.href)}" class="related-card"><div class="related-thumb">📘</div><div><p class="ttl">${esc(g.title)}</p><p class="desc">베이비빌리 가이드</p></div></a>`),
  ].join('\n        ');

  const faqHtml = c.faq.map(f => `<div class="faq-item">
        <button class="faq-q" type="button">${esc(f.q)} <span class="arrow">▾</span></button>
        <div class="faq-a"><p>${esc(f.a)}</p></div>
      </div>`).join('\n      ');

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: `${cd} ${c.name} — 실손 청구 가능 여부와 보상 기준`,
        description: desc,
        url, inLanguage: 'ko', dateModified: UPDATED,
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.answer .text'] },
        author: {
          '@type': 'Person', name: '베이비빌리 보험 전문팀', jobTitle: '부모·가족 보험 컨설턴트',
          image: { '@type': 'ImageObject', url: 'https://villagebaby.kr/assets/img/billy-author-256.png', width: 1200, height: 630 },
          worksFor: { '@type': 'Organization', name: '베이비빌리', url: 'https://babybilly.co' },
          description: '태아·어린이·실손보험 등 부모를 위한 모든 보험을 10년 이상 전문 상담한 팀.',
          knowsAbout: ['실손보험 청구', '어린이보험', '태아보험', '질병코드', '보험 특약'],
        },
        reviewedBy: { '@type': 'Person', name: '베이비빌리 보험 전문 감수단', description: '10년 이상 태아·어린이보험 분야에 종사한 전문가들이 감수한 콘텐츠입니다.' },
        publisher: { '@type': 'Organization', name: '베이비빌리', url: 'https://villagebaby.kr/', logo: { '@type': 'ImageObject', url: 'https://villagebaby.kr/logo.png' } },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: 'https://villagebaby.kr/' },
          { '@type': 'ListItem', position: 2, name: '도구 모음', item: 'https://villagebaby.kr/tools/' },
          { '@type': 'ListItem', position: 3, name: '질병코드 보장 사전', item: 'https://villagebaby.kr/tools/claim-dict/' },
          { '@type': 'ListItem', position: 4, name: `${cd} ${c.name}`, item: url },
        ],
      },
      { '@type': 'FAQPage', mainEntity: c.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/favicon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="keywords" content="${esc(cd)} 질병코드, ${esc(c.name)} 실손, ${esc(c.name)} 보험 청구, 질병코드 ${esc(cd)} 보험, 아이 실손 청구, 베이비빌리">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(cd)} ${esc(c.name)} — 실손 청구 가능할까?">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://villagebaby.kr/assets/og/tools.png">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="og:site_name" content="베이비빌리"><meta property="og:locale" content="ko_KR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://villagebaby.kr/assets/og/tools.png">
  <link rel="canonical" href="${url}">
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <style>${BASE_CSS}</style>
</head>
<body>
${navHtml(c.slug)}

<header class="hero">
  <div class="hero-inner">
    <p class="breadcrumb"><a href="/">홈</a> · <a href="/tools/">도구</a> · <a href="/tools/claim-dict/">질병코드 사전</a> · ${esc(cd)}</p>
    <span class="badge">${cat.icon} ${esc(cat.label)} · 질병코드 사전</span>
    <h1>질병코드 <em>${esc(cd)}</em> ${esc(c.name)}<br>실손 청구, 되는 걸까요?</h1>
    <p class="lead">진단서·영수증에 ${esc(cd)} 코드가 찍혔을 때 실손 보상 기준, 함께 확인할 특약, 필요한 서류를 정리했어요.</p>
    <div class="meta">
      <span>최종 업데이트 일자: ${UPDATED_DOT}</span>
      <span>👥 작성: <strong><a href="${utm(c.slug,4)}" target="_blank" rel="author noopener" style="color:inherit;border-bottom:1px dotted currentColor">베이비빌리</a></strong></span>
      <span>🔗 <a href="/tools/claim-calculator/" style="color:var(--blue-700);font-weight:700">실손 환급액 계산기 →</a></span>
    </div>
  </div>
</header>

<main>
  <div class="container">
    ${authorCard(c.slug)}

    <div class="answer">
      <div class="lab">한 줄 요약</div>
      <p class="text">${esc(c.oneline)}</p>
    </div>

    <div class="status-badge ${badge.cls}">${badge.cls === 'b-yes' ? '✅' : badge.cls === 'b-cond' ? '⚠️' : '⛔'} ${esc(cd)} ${esc(c.name)} — ${esc(badge.label)}</div>

    <h2 class="sec">어떤 병인가요?</h2>
    <p class="body">${esc(c.what)}</p>

    <h2 class="sec">실손 보상 포인트 — 급여 vs 비급여</h2>
    <div class="point-grid">
      <div class="point-card gy"><span class="pc-tag">급여 영역</span><p>${esc(c.point_gy)}</p></div>
      <div class="point-card bg"><span class="pc-tag">비급여 영역</span><p>${esc(c.point_bg)}</p></div>
    </div>
    <div class="callout info">💡 환급액은 <strong>실손 세대(가입 시기)별 공제금액·자기부담률</strong>에 따라 달라져요. 영수증 금액을 <a href="/tools/claim-calculator/" style="color:var(--blue-700);font-weight:700;text-decoration:underline">실손 환급액 계산기</a>에 넣으면 바로 확인할 수 있어요.</div>

    <h2 class="sec">함께 확인할 특약</h2>
    <p class="body">${esc(c.rider)}</p>

    <h2 class="sec">청구에 필요한 서류</h2>
    <div class="docs-box">
      <div class="db-head">📄 상황별 청구 서류 체크리스트</div>
      <div class="db-body">
        <div class="db-row"><span class="db-k">통원 10만원 이하</span><span>진료비 계산서·영수증 (+ 처방약이 있으면 약제비 영수증)</span></div>
        <div class="db-row"><span class="db-k">통원 10만원 초과</span><span>영수증 + 진료비 세부산정내역서 (+ 보험사에 따라 진단명 확인 서류)</span></div>
        <div class="db-row"><span class="db-k">입원·수술</span><span>영수증 + 세부산정내역서 + 진단서 또는 입퇴원확인서 (수술 시 수술확인서)</span></div>
        <div class="db-row"><span class="db-k">특약 정액 청구</span><span>진단서(진단명·코드 기재) — 실손과 별도 접수</span></div>
      </div>
    </div>
    <div class="callout warn">⚠️ 청구권 소멸시효는 3년이에요. 밀린 영수증도 3년 안이라면 모아서 한 번에 청구할 수 있어요.</div>

    <h2 class="sec">보험 가입·고지에 미치는 영향</h2>
    <p class="body">${esc(c.goji)}</p>

    <h2 class="sec">청구 꿀팁</h2>
    <ul class="tip-list">
      ${c.tips.map(t => `<li>${esc(t)}</li>`).join('\n      ')}
    </ul>

    <div class="calc-banner">
      <div class="cb-icon">🧮</div>
      <div class="cb-txt"><strong>이번 진료비, 얼마나 돌려받을까요?</strong><span>영수증의 급여·비급여 금액만 넣으면 세대별 예상 환급액을 바로 계산해드려요.</span></div>
      <a href="/tools/claim-calculator/" class="cb-btn">환급액 계산하기 ></a>
    </div>

    <section style="padding:8px 0">
      <h2 class="sec">자주 묻는 질문</h2>
      ${faqHtml}
    </section>

    <section style="padding:8px 0">
      <h2 class="sec">함께 보면 좋아요</h2>
      <div class="related-grid">
        ${relCards}
      </div>
    </section>

    <div class="cta-block">
      <h3>청구 놓친 병원비, 없는지 궁금하다면?</h3>
      <p>아이 보험 증권 기준으로 놓친 청구·부족한 보장이 없는지 전문가가 무료로 점검해드려요.</p>
      <a href="${utm(c.slug,5)}" class="cta-btn">💬 카톡으로 무료 점검 받기 ></a>
    </div>
  </div>
</main>

<a href="${utm(c.slug,6)}" target="_blank" rel="noopener" class="expert-float" aria-label="카톡 무료 상담"><span style="font-size:18px">💬</span><span>카톡 무료 상담</span></a>

<script>document.querySelectorAll('.faq-q').forEach(q=>q.addEventListener('click',()=>q.parentElement.classList.toggle('open')));</script>
${footerHtml}
</body>
</html>
`;
}

// ── 사전 인덱스 페이지 ──
function indexPage() {
  const url = 'https://villagebaby.kr/tools/claim-dict/';
  const title = `아이 질병코드 보장 사전 — 진단서 코드로 실손 청구 가능 여부 확인 (${CODES.length}개 코드) | 베이비빌리`;
  const desc = `소아과 진단서·영수증의 질병코드(J20, A08, H66 등)를 검색하면 실손 청구 가능 여부, 보상 포인트, 필요 서류를 바로 확인할 수 있어요. 소아 다빈도 ${CODES.length}개 코드 수록.`;

  const catOrder = ['resp','allergy','infect','ent','digest','symptom','injury','newborn','noclaim'];
  const sections = catOrder.map(key => {
    const items = CODES.filter(c => c.cat === key);
    if (!items.length) return '';
    const cards = items.map(c => `<a class="code-card" href="/tools/claim-dict/${c.slug}/" data-code="${esc(c.code.toLowerCase())}" data-name="${esc(c.name)}" data-cat="${key}">
        <div class="cc-top"><span class="cc-code">${esc(disp(c))}</span><span class="cc-badge ${BADGES[c.badge].cls}">${esc(BADGES[c.badge].label)}</span></div>
        <p class="cc-name">${esc(c.name)}</p>
        <p class="cc-desc">${esc(c.oneline)}</p>
      </a>`).join('\n      ');
    return `<section class="cat-section" data-cat="${key}">
      <h2 class="sec">${CATS[key].icon} ${esc(CATS[key].label)} <span class="cat-count">(${items.length})</span></h2>
      <div class="code-grid">
      ${cards}
      </div>
    </section>`;
  }).join('\n    ');

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', name: '아이 질병코드 보장 사전', description: desc, url, inLanguage: 'ko', dateModified: UPDATED },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://villagebaby.kr/' },
        { '@type': 'ListItem', position: 2, name: '도구 모음', item: 'https://villagebaby.kr/tools/' },
        { '@type': 'ListItem', position: 3, name: '질병코드 보장 사전', item: url },
      ] },
    ],
  };

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/favicon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="keywords" content="질병코드 조회, 질병코드 실손, 진단서 코드, 아이 실손 청구, 소아 질병코드, KCD 코드 보험, 베이비빌리">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:title" content="아이 질병코드 보장 사전 — 코드로 실손 청구 가능 여부 확인">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://villagebaby.kr/assets/og/tools.png">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="og:site_name" content="베이비빌리"><meta property="og:locale" content="ko_KR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://villagebaby.kr/assets/og/tools.png">
  <link rel="canonical" href="${url}">
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <style>${BASE_CSS}
.search-wrap{position:relative;margin:0 0 18px}
.search-input{width:100%;padding:16px 20px 16px 52px;border:2px solid var(--blue-200);border-radius:16px;font-size:16px;font-family:inherit;outline:none;transition:border-color .2s;background:var(--white)}
.search-input:focus{border-color:var(--blue-600)}
.search-wrap::before{content:'🔍';position:absolute;left:18px;top:50%;transform:translateY(-50%);font-size:18px}
.filter-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
.filter-chip{padding:8px 14px;border-radius:16px;border:none;background:var(--gray-100);color:var(--gray-700);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s}
.filter-chip:hover{background:var(--blue-100);color:var(--blue-700)}
.filter-chip.active{background:var(--blue-600);color:#fff}
.code-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:14px 0 6px}
.code-card{border:1.5px solid var(--gray-200);border-radius:14px;padding:16px 18px;background:var(--white);transition:all .2s;display:block}
.code-card:hover{border-color:var(--blue-600);box-shadow:var(--shadow-s);transform:translateY(-2px)}
.cc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:8px}
.cc-code{font-size:17px;font-weight:900;color:var(--blue-700);letter-spacing:.5px}
.cc-badge{font-size:10.5px;font-weight:800;padding:3px 9px;border-radius:8px;white-space:nowrap}
.cc-badge.b-yes{background:#E6FAF1;color:#0D5C32;border:none}
.cc-badge.b-cond{background:#FEF5E4;color:#92540A;border:none}
.cc-badge.b-no{background:#FFF1F1;color:#7C1D1D;border:none}
.cc-name{font-size:14.5px;font-weight:700;color:var(--gray-900);margin-bottom:5px}
.cc-desc{font-size:12px;color:var(--gray-600);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cat-count{font-size:14px;color:var(--gray-500);font-weight:600}
.no-result{display:none;text-align:center;padding:40px 20px;color:var(--gray-500);background:var(--gray-100);border-radius:12px;margin:14px 0}
@media(max-width:760px){.code-grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
${navHtml('index')}

<header class="hero">
  <div class="hero-inner">
    <p class="breadcrumb"><a href="/">홈</a> · <a href="/tools/">도구</a> · 질병코드 사전</p>
    <span class="badge">📖 소아 다빈도 ${CODES.length}개 코드 수록</span>
    <h1><em>아이 질병코드 보장 사전</em><br><span class="h1-sub">코드만 치면 청구 가능 여부가 나와요</span></h1>
    <p class="lead">진단서·영수증에 적힌 질병코드(J20, A08, H66…)를 검색하면 실손 청구 가능 여부, 급여·비급여 보상 포인트, 필요 서류를 바로 확인할 수 있어요.</p>
    <div class="meta">
      <span>최종 업데이트 일자: ${UPDATED_DOT}</span>
      <span>🔗 <a href="/tools/claim-calculator/" style="color:var(--blue-700);font-weight:700">실손 환급액 계산기 →</a></span>
    </div>
  </div>
</header>

<main>
  <div class="container">
    ${authorCard('index')}

    <div class="answer">
      <div class="lab">사용법</div>
      <p class="text">진료확인서·진단서·보험사 앱 청구 화면에 나오는 <strong>질병분류기호(예: J20)</strong>를 아래에 검색하세요. 코드를 모르면 병명으로 검색해도 돼요.</p>
    </div>

    <div class="search-wrap">
      <input type="text" class="search-input" id="q" placeholder="질병코드 또는 병명 검색 (예: J20, 중이염, 장염)" autocomplete="off" aria-label="질병코드 검색">
    </div>
    <div class="filter-row" id="chips">
      <button class="filter-chip active" data-f="all">전체 (${CODES.length})</button>
      ${catOrder.map(k => `<button class="filter-chip" data-f="${k}">${CATS[k].icon} ${esc(CATS[k].label)} (${CODES.filter(c=>c.cat===k).length})</button>`).join('\n      ')}
    </div>

    <div class="no-result" id="noResult">검색 결과가 없어요. 코드 앞 3자리(예: J20)나 병명 일부로 다시 검색해보세요.<br>찾는 코드가 없다면 아래 카톡 상담으로 물어보셔도 돼요.</div>

    ${sections}

    <div class="calc-banner">
      <div class="cb-icon">🧮</div>
      <div class="cb-txt"><strong>영수증 금액으로 예상 환급액까지 계산해보세요</strong><span>급여·비급여 금액만 넣으면 실손 세대별 예상 환급액을 알려드려요.</span></div>
      <a href="/tools/claim-calculator/" class="cb-btn">환급액 계산하기 ></a>
    </div>

    <div class="cta-block">
      <h3>우리 아이 코드가 사전에 없나요?</h3>
      <p>진단서 속 코드가 궁금하거나, 청구를 놓친 병원비가 없는지 확인하고 싶다면 전문가에게 무료로 물어보세요.</p>
      <a href="${utm('index',5)}" class="cta-btn">💬 카톡으로 무료 상담 ></a>
    </div>
  </div>
</main>

<a href="${utm('index',6)}" target="_blank" rel="noopener" class="expert-float" aria-label="카톡 무료 상담"><span style="font-size:18px">💬</span><span>카톡 무료 상담</span></a>

<script>
(function(){
  var q=document.getElementById('q'), chips=document.getElementById('chips'), cards=[].slice.call(document.querySelectorAll('.code-card')), secs=[].slice.call(document.querySelectorAll('.cat-section')), noRes=document.getElementById('noResult');
  var cat='all';
  function apply(){
    var kw=q.value.trim().toLowerCase().replace(/\\./g,'-');
    var shown=0;
    cards.forEach(function(c){
      var hit=(cat==='all'||c.dataset.cat===cat)&&(!kw||c.dataset.code.indexOf(kw)>-1||c.dataset.code.replace(/-/g,'.').indexOf(kw)>-1||c.dataset.name.toLowerCase().indexOf(kw)>-1);
      c.style.display=hit?'block':'none'; if(hit)shown++;
    });
    secs.forEach(function(s){
      var any=[].slice.call(s.querySelectorAll('.code-card')).some(function(c){return c.style.display!=='none'});
      s.style.display=any?'block':'none';
    });
    noRes.style.display=shown?'none':'block';
  }
  q.addEventListener('input',apply);
  chips.addEventListener('click',function(e){
    var b=e.target.closest('.filter-chip'); if(!b)return;
    cat=b.dataset.f;
    [].slice.call(chips.children).forEach(function(x){x.classList.toggle('active',x===b)});
    apply();
  });
})();
</script>
${footerHtml}
</body>
</html>
`;
}

// ── 실행 ──
let count = 0;
for (const c of CODES) {
  const dir = join(OUT, c.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), codePage(c), 'utf8');
  count++;
}
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'index.html'), indexPage(), 'utf8');
writeFileSync(join(OUT, 'codes.json'), JSON.stringify(CODES.map(c => ({ code: disp(c), slug: c.slug, name: c.name, cat: c.cat, badge: c.badge })), null, 0), 'utf8');
console.log(`generated ${count} code pages + index + codes.json → tools/claim-dict/`);
