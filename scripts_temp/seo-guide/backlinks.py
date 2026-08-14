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
    "임신-초기-증상-1-6주":        ("/guide/임신-5주-증상-해야할-일/", "임신 5주, 가장 먼저 해야 할 일"),
    "임신-주수-계산법":            ("/guide/임신-5주-증상-해야할-일/", "5주면 뭘 해야 하나"),
    "아기집-심장소리-언제":         ("/guide/임신-6주-증상-해야할-일/", "임신 6주, 심장 소리 듣는 주"),
    "우체국-대한민국-엄마보험-완전정리": ("/guide/임신-6주-증상-해야할-일/", "산모수첩 나오면 바로 신청 (6주)"),
    "우체국-엄마보험-가입조건-22주":  ("/guide/임신-7주-증상-해야할-일/", "7주에 아직 안 했다면"),
    "맘편한-임신-원스톱-신청":       ("/guide/임신-6주-증상-해야할-일/", "6주에 한 번에 신청하기"),
    "1차-기형아-검사-목-투명대":     ("/guide/임신-7주-증상-해야할-일/", "7주에 미리 날짜 잡아두기"),
    "임신-8주-증상-태아발달":       ("/guide/임신-7주-증상-해야할-일/", "한 주 전 — 임신 7주"),
    "먹덧-원인-관리법":            ("/guide/임신-7주-증상-해야할-일/", "입덧이 본격화되는 7주"),
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
