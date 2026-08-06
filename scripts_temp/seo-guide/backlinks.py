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
    "아기집-심장소리-언제":        ("/guide/초음파-사진-보는법/", "초음파 사진 속 GS·CRL·FHR 읽는 법"),
    "임신-초기-초음파-횟수-비용":  ("/guide/초음파-사진-보는법/", "초음파 사진 보는 법 — 약어와 숫자"),
    "임신-주수-계산법":            ("/guide/초음파-사진-보는법/", "초음파로 주수를 어떻게 재나요"),
    "임신-식단-금기-음식":         ("/guide/임산부-커피-카페인/", "임산부 커피, 하루 몇 잔까지?"),
    "임신-초기-증상-총정리":       ("/guide/임산부-커피-카페인/", "임신 중 카페인 200mg 기준"),
    "임신-초기-두통":              ("/guide/임산부-커피-카페인/", "커피를 갑자기 끊으면 생기는 두통"),
    "임신-20주-정밀초음파":        ("/guide/태아-크기-작다-크다/", "아기가 작대요 — 추정체중과 백분위"),
    "임신-체중-증가-관리":         ("/guide/태아-크기-작다-크다/", "태아 크기가 작거나 클 때 보는 것"),
    "태아보험-인큐베이터-입원비-특약": ("/guide/태아-크기-작다-크다/", "태아 크기 걱정될 때 확인할 것"),
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
