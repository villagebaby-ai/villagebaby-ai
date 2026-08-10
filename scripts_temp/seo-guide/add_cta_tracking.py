#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""상담 링크가 있는데 클릭 추적이 없는 페이지에 GA4 cta_click 이벤트를 붙인다.

배경(2026-08-10): /driver/ 는 글 5편으로 노출 5,145·클릭 104 를 만드는 최고 효율 영역인데
**버튼 클릭을 세는 코드가 없어 그 트래픽이 상담으로 이어지는지 알 수 없었다.**
(/guide/ 신규분에는 들어 있고 /driver/ /care/ /education/ 에는 빠져 있었다)

링크 종류를 자동으로 구분해 기록한다 — 상담(insurance) · 카톡채널(kakao) · 앱(app).
utm_content 가 있으면 variant 로 같이 남겨서 페이지 안 위치별 성과도 갈린다.
이미 cta_click 이 있는 페이지는 건드리지 않는다.
"""
import glob
import os
import re
import sys

SITE = "/Users/villagebaby/villagebaby-ai-site"
SECTIONS = sys.argv[1:] or ["driver", "care", "education", "cancer", "female", "medical"]

SNIPPET = """
<script>
/* CTA 클릭 이벤트 — 상담·카톡·앱 링크를 자동 인식해 GA4 로 보냄 */
(function(){
  var SLUG=decodeURIComponent(location.pathname.replace(/\\/$/,'').split('/').pop()||'index');
  function kind(h){
    if(h.indexOf('babybilly.co/insurance')>-1) return 'insurance';
    if(h.indexOf('pf.kakao.com')>-1) return 'kakao';
    if(h.indexOf('app.babybilly.app')>-1) return 'app';
    return null;
  }
  function variant(h){ var m=h.match(/utm_content=([^&#]+)/); return m?decodeURIComponent(m[1]):'none'; }
  document.querySelectorAll('a[href]').forEach(function(a){
    var k=kind(a.getAttribute('href')||''); if(!k) return;
    a.addEventListener('click',function(){
      if(typeof gtag==='function'){
        gtag('event','cta_click',{cta_type:k,cta_variant:variant(a.href),
          page_slug:SLUG,page_section:location.pathname.split('/')[1]||'',send_to:'G-SRWXXLKTKD'});
      }
    });
  });
})();
</script>
"""

done, skipped = [], []
for sec in SECTIONS:
    for f in sorted(glob.glob(os.path.join(SITE, sec, "**", "index.html"), recursive=True)):
        rel = f.replace(SITE + "/", "")
        h = open(f, encoding="utf-8", newline="").read()
        if "cta_click" in h:
            skipped.append(f"{rel}(이미있음)"); continue
        if not re.search(r'babybilly\.co/insurance|pf\.kakao\.com|app\.babybilly\.app', h):
            skipped.append(f"{rel}(상담링크 없음)"); continue
        if "G-SRWXXLKTKD" not in h:
            skipped.append(f"{rel}(GA4 태그 없음 — 먼저 붙일 것)"); continue
        if "</body>" not in h:
            skipped.append(f"{rel}(body 종료 태그 없음)"); continue
        nl = "\r\n" if "\r\n" in h else "\n"
        h = h.replace("</body>", SNIPPET.replace("\n", nl) + "</body>", 1)
        open(f, "w", encoding="utf-8", newline="").write(h)
        done.append(rel)

print(f"추적 추가 {len(done)}개")
for d in done:
    print("  ✓", d)
if skipped:
    print(f"\n건너뜀 {len(skipped)}개")
    for s in skipped:
        print("  ·", s)
