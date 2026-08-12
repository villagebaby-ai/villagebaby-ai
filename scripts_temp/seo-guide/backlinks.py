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
    "임산부-커피-카페인":         ("/guide/임산부-차-음료/", "커피 말고 차는 뭘 마셔도 될까"),
    "임신-식단-금기-음식":         ("/guide/임산부-차-음료/", "허브차·녹차·탄산 기준 정리"),
    "먹덧-원인-관리법":           ("/guide/임산부-차-음료/", "속 울렁일 때 마시기 좋은 것"),
    "보건소-임산부-등록-혜택":      ("/guide/임산부-예방접종/", "독감·백일해는 언제 맞나"),
    "임산부-발열-체온":           ("/guide/임산부-예방접종/", "독감은 임신 중에도 맞을 수 있어요"),
    "임신-초기-술-약-복용":        ("/guide/임산부-예방접종/", "모르고 맞은 백신이 걱정된다면"),
    "임신-요통-허리통증-대처":      ("/guide/임신-목욕-사우나/", "따뜻한 물, 어디까지 괜찮을까"),
    "임신-수면-자세":             ("/guide/임신-목욕-사우나/", "자기 전 반신욕 해도 될까"),
    "임산부-화장품-미용시술":       ("/guide/임신-목욕-사우나/", "사우나·찜질방을 피하는 이유"),
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
