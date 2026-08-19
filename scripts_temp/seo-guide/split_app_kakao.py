#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""앱 CTA 안에 들어있던 '카톡 무료 상담' 버튼을 **별도 블록**으로 분리한다 (2026-08-19 고니님 지시).

이전(add_kakao_in_app_cta.py): 파란 앱 카드 안에 버튼 2개가 나란히 → 서로 경쟁.
이후: 파란 앱 카드는 앱 버튼만, 그 아래 **카카오 노란색 바** 하나가 독립적으로 붙는다.

- 추적 id(`app-kakao`)와 utm_content(`cta_app_kakao`)는 그대로 → 기존 GA4 집계 연속성 유지.
- 이미 분리돼 있으면 건너뛴다(중복 실행 안전).
"""
import glob
import os
import re

SITE = "/Users/villagebaby/villagebaby-ai-site"
MARK = "vb-kakao-bar"

# 앱 카드(파랑) 안에 있던 테두리 버튼 — 통째로 걷어낸다
OLD_BTN = re.compile(
    r'<a href="(https://babybilly\.co/[^"]*utm_content=cta_app_kakao)"\s+id="app-kakao"[^>]*>.*?</a>', re.S)
APP_BLOCK_END = re.compile(r'(<div class="cta app">.*?</div>)', re.S)


def bar(url):
    return (
        f'\n<a href="{url}" id="app-kakao" class="{MARK}" target="_blank" rel="noopener" '
        f'style="display:flex;align-items:center;justify-content:space-between;gap:14px;'
        f'background:#FEE500;color:#3C1E1E;border-radius:12px;padding:16px 20px;margin:16px 0 32px;'
        f'text-decoration:none;box-shadow:0 2px 10px rgba(0,0,0,.07)">'
        f'<span style="line-height:1.5">'
        f'<span style="display:block;font-size:.97rem;font-weight:800">💬 궁금한 건 카톡으로 물어보세요</span>'
        f'<span style="display:block;font-size:.83rem;font-weight:500;opacity:.72;margin-top:3px">'
        f'전문 상담사 무료 상담 · 가입 안 하셔도 됩니다</span></span>'
        f'<span style="flex:none;font-size:.9rem;font-weight:800;white-space:nowrap">무료 상담 →</span></a>')


def split(h):
    """반환: (바뀐 html, 사유). 이미 분리됐거나 대상이 없으면 (None, 사유)."""
    if MARK in h:
        return None, "이미분리"
    m = OLD_BTN.search(h)
    if not m:
        return None, "카톡버튼없음"
    url = m.group(1)
    h = h[:m.start()] + h[m.end():]          # 앱 카드 안에서 제거
    a = APP_BLOCK_END.search(h)
    if not a:
        return None, "앱카드없음"
    return h[:a.end()] + bar(url) + h[a.end():], "분리"


if __name__ == "__main__":
    done, skip = [], {}
    for f in sorted(glob.glob(os.path.join(SITE, "*", "*", "index.html"))):
        slug = f.split("/")[-2]
        h = open(f, encoding="utf-8", newline="").read()
        new, why = split(h)
        if new is None:
            skip[why] = skip.get(why, 0) + 1
            continue
        open(f, "w", encoding="utf-8", newline="").write(new)
        done.append(slug)
    print("분리:", len(done), "건")
    for d in done:
        print("  ✓", d)
    print("건너뜀:", skip)
