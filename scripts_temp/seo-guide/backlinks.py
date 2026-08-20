#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""역방향 내부링크 — 기존 글의 '함께 보면 좋은 …' 목록에 신규 글 <li> 추가.
신규 글의 아웃바운드만으로는 색인·전달력이 부족해서 매 회차 반드시 돌린다.
마크업이 두 종류(신형 <h2>함께 보면 좋은 가이드 / 구형 <div class="related">)라 둘 다 잡는다.
이미 링크가 있으면 건너뛴다(중복 실행 안전).
"""
import os
import re

SITE = "/Users/villagebaby/villagebaby-ai-site"

# 기존 글 슬러그 -> (신규 글 경로, 앵커 텍스트)  · 앵커는 페이지마다 다르게 쓴다
LINKS = {
    # 2026-08-20 추가 1편 — 임신 초기 부부관계 (담백한 진료 톤, 고니님 확정)
    "임신-초기-출혈-착상혈":               ("/guide/임신-초기-부부관계/", "관계 뒤 출혈이면 어떻게 하나"),
    "임신-초기-배뭉침":                   ("/guide/임신-초기-부부관계/", "관계 후 배 뭉침, 정상과 신호 구분"),
    "자궁경부-무력증-길이":                ("/guide/임신-초기-부부관계/", "이 진단이면 제한되는 활동"),
    "전치태반-태아보험":                   ("/guide/임신-초기-부부관계/", "전치태반일 때 피해야 하는 것"),
    "임신-초기-증상-총정리":               ("/guide/임신-초기-부부관계/", "임신 초기 부부관계, 괜찮을까"),
    "임신-확인-후-2주-체크리스트":          ("/guide/임신-초기-부부관계/", "진료에서 물어볼 것 하나"),
}

PAT = re.compile(r"(함께 보면 좋은 (?:가이드|글)</h[23]>\s*(?:<div[^>]*>\s*)?<ul>)", re.S)

done, skipped = [], []
for slug, (url, anchor) in LINKS.items():
    path = os.path.join(SITE, "guide", slug, "index.html")
    if not os.path.exists(path):
        skipped.append(f"{slug}(파일없음)"); continue
    h = open(path, encoding="utf-8", newline="").read()   # 원본 줄바꿈(CRLF) 보존
    if f'href="{url}"' in h:
        skipped.append(f"{slug}(이미있음)"); continue
    m = PAT.search(h)
    if not m:
        skipped.append(f"{slug}(관련글 섹션 못찾음)"); continue
    nl = "\r\n" if "\r\n" in h else "\n"
    li = f'{nl}<li><a href="{url}">{anchor}</a></li>'
    h = h[:m.end()] + li + h[m.end():]
    open(path, "w", encoding="utf-8", newline="").write(h)
    done.append(slug)

print("추가:", len(done), done)
print("건너뜀:", skipped or "없음")
