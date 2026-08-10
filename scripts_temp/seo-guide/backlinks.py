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
    "융모막-출혈-진단":            ("/guide/임신-초기-출혈-착상혈/", "착상혈인지 유산 출혈인지 구분하기"),
    "계류유산-소파수술-비용-실손":   ("/guide/임신-초기-출혈-착상혈/", "임신 초기 출혈, 색과 양으로 보기"),
    "아기집-심장소리-언제":         ("/guide/임신-초기-출혈-착상혈/", "초기에 피가 비쳤다면"),
    "임신-초기-증상-총정리":        ("/guide/임신-질염-분비물/", "분비물이 늘었을 때 정상 범위"),
    "자궁경부-무력증-길이":         ("/guide/임신-질염-분비물/", "질염을 미루면 안 되는 이유"),
    "임산부-화장품-미용시술":       ("/guide/임신-질염-분비물/", "임신 중 분비물과 질염 구분법"),
    "임신-초기-두통":              ("/guide/임산부-발열-체온/", "열이 날 때 먹어도 되는 해열제"),
    "임신-초기-변비-설사":          ("/guide/임산부-발열-체온/", "열까지 함께 난다면"),
    "임신-식단-금기-음식":          ("/guide/임산부-발열-체온/", "임산부 발열, 몇 도부터 조치할까"),
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
