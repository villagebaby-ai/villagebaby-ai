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
    "1차-기형아-검사-목-투명대":   ("/guide/임신-초기-술-약-복용/", "모르고 마신 술·약, 시기별로 보기"),
    "임산부-커피-카페인":         ("/guide/임신-초기-술-약-복용/", "술과 약은 어떻게 봐야 할까"),
    "임신-초기-증상-총정리":       ("/guide/임신-초기-술-약-복용/", "임신인 줄 모르고 먹은 것들"),
    "임산부-KTX-SRT-할인-2026":  ("/guide/임신-초기-여행-비행기/", "임신 중 여행, 비행기는 몇 주까지"),
    "임신-초기-배뭉침":            ("/guide/임신-초기-여행-비행기/", "장거리 이동할 때 조심할 것"),
    "임신-수면-자세":             ("/guide/임산부-코피-비염/", "코막혀서 잠 못 잘 때"),
    "임산부-발열-체온":            ("/guide/임산부-코피-비염/", "감기가 아닌데 코가 막힌다면"),
    "임신-초기-두통":             ("/guide/임산부-코피-비염/", "임신성 비염과 코피 대처법"),
    "임신-초기-출혈-착상혈":        ("/guide/임신-초기-여행-비행기/", "여행 중 출혈이 있다면"),
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
