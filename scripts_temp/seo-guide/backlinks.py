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
    "임신-7주-증상-해야할-일":      ("/guide/임신-9주-증상-해야할-일/", "두 주 뒤 — 임신 9주 입덧 정점"),
    "먹덧-원인-관리법":            ("/guide/임신-9주-증상-해야할-일/", "입덧이 가장 심한 주는 언제"),
    "임신기-근로시간-단축-12주":     ("/guide/임신-9주-증상-해야할-일/", "9주에 신청하면 딱 좋은 이유"),
    "1차-기형아-검사-목-투명대":     ("/guide/임신-10주-증상-해야할-일/", "10주에 예약해두면 편해요"),
    "임신-12주-안정기-시작":        ("/guide/임신-10주-증상-해야할-일/", "한 주 전 — 임신 10주"),
    "NIPT-검사-완전정리":          ("/guide/임신-10주-증상-해야할-일/", "언제부터 받을 수 있나 — 임신 10주"),
    "임신-초기-증상-1-6주":         ("/guide/임신-9주-증상-해야할-일/", "그다음 — 임신 9주"),
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
