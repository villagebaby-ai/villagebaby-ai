#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""앱 CTA 블록에 '카톡 무료 상담' 버튼을 하나 더 붙인다 (2026-08-14 고니님 지시).

목적지는 페이지 우측 상단 `.vb-nav-cta` 와 같은 곳(babybilly.co 상담) 이지만
utm_content 를 `cta_app_kakao` 로 따로 줘서 **어느 자리에서 눌렸는지 구분**한다.

- 앱 버튼(흰 배경)은 그대로 1순위. 새 버튼은 테두리만 있는 2순위 스타일이라 서로 안 싸운다.
- 추적: 기존 스크립트의 `.cta.app a` 셀렉터는 첫 번째 a 만 잡으므로 앱 클릭 집계는 그대로.
  새 버튼은 `id="app-kakao"` 로 따로 이벤트를 붙인다.
- 이미 붙어 있으면 건너뛴다(중복 실행 안전).
"""
import glob
import os
import re
from urllib.parse import quote

SITE = "/Users/villagebaby/villagebaby-ai-site"
TALK = "https://babybilly.co/insurance/baby/talk/v1"

BTN_STYLE = ("display:inline-block;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.85);"
             "font-weight:700;padding:9.5px 24px;border-radius:16px;font-size:.94rem;margin:8px 5px 0")

TRACK_SNIPPET = (" var akao=document.getElementById('app-kakao');"
                 " if(akao){ akao.addEventListener('click',function(){ track('kakao','cta_app'); }); }")

APP_BLOCK = re.compile(
    r'(<div class="cta app">.*?<a href="https://app\.babybilly\.app/[^"]+"[^>]*>.*?</a>)(</div>)', re.S)

done, skipped = [], []
for f in sorted(glob.glob(os.path.join(SITE, "guide", "*", "index.html"))):
    slug = f.split("/")[-2]
    h = open(f, encoding="utf-8", newline="").read()
    if 'id="app-kakao"' in h:
        skipped.append(f"{slug}(이미있음)"); continue
    m = APP_BLOCK.search(h)
    if not m:
        skipped.append(f"{slug}(앱 CTA 없음)"); continue

    url = (f"{TALK}?utm_source=villagebaby&utm_medium=content"
           f"&utm_campaign={quote(slug)}&utm_content=cta_app_kakao")
    btn = (f'<a href="{url}" id="app-kakao" target="_blank" rel="noopener" '
           f'style="{BTN_STYLE}">💬 카톡 무료 상담</a>')
    h = h[:m.end(1)] + btn + h[m.end(1):]

    # 추적 한 줄 추가 (앱 클릭 리스너 바로 뒤)
    anchor = "if(ap){ ap.addEventListener('click',function(){ track('app'); }); }"
    if anchor in h and "app-kakao'" not in h.split("</footer>")[-1]:
        h = h.replace(anchor, anchor + TRACK_SNIPPET, 1)

    open(f, "w", encoding="utf-8", newline="").write(h)
    done.append(slug)

print("추가:", len(done))
for d in done:
    print("  ✓", d)
print("건너뜀:", len(skipped), skipped[:6] if skipped else "없음")
