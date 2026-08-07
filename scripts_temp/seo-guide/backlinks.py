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
    "임신선-튼살-체크":            ("/guide/임산부-화장품-미용시술/", "임산부 화장품 뭘 빼고 뭘 쓸까"),
    "임신-식단-금기-음식":         ("/guide/임산부-화장품-미용시술/", "바르는 것도 가려야 할까 — 성분 기준"),
    "임산부-커피-카페인":          ("/guide/임산부-화장품-미용시술/", "네일·염색·제모는 해도 될까"),
    "국민행복카드-임신바우처-완전정리-2026": ("/guide/임산부-교통비-지원/", "임산부 교통비 70만원 신청 시기"),
    "보건소-임산부-등록-혜택":     ("/guide/임산부-교통비-지원/", "교통비 지원은 12주 이후부터"),
    "임산부-KTX-SRT-할인-2026":   ("/guide/임산부-교통비-지원/", "서울 임산부 교통비도 같이 챙기기"),
    "임신-초기-헛배부름-가스":     ("/guide/임신-초기-변비-설사/", "변비와 설사가 반복될 때"),
    "임신-초기-배뭉침":            ("/guide/임신-초기-변비-설사/", "임신 초기 변비·설사 대처법"),
    "임산부-엽산-철분제-무료-지원": ("/guide/임신-초기-변비-설사/", "철분제 먹고 변비가 심해졌다면"),
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
