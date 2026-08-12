#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""다음 회차 주제 후보 = 어드민 콘텐츠 조회수 상위 x villagebaby.kr 미발행 diff.

소스 = ~/babybilly-marketing/analysis/content_posts_index.csv (어드민 1,693건)
발행 = villagebaby.kr 의 guide/ child/ magazine/*/ 디렉터리명

⚠️ 슬러그 토큰 매칭은 참고용이다. 태동·기형아처럼 **이미 발행됐는데 미발행으로 잡히는** 경우가
있으니 후보 확정 전에 `ls guide child magazine/*/ | grep 키워드` 로 눈으로 한 번 더 본다.
"""
import csv
import glob
import math
import os
import re
import unicodedata
from collections import defaultdict

CSV = os.path.expanduser("~/babybilly-marketing/analysis/content_posts_index.csv")
SITE = os.path.expanduser("~/villagebaby-ai-site")

nfc = lambda s: unicodedata.normalize("NFC", s)
clean = lambda s: re.sub(r"[^0-9A-Za-z가-힣]", "", nfc(s)).lower()

GENERIC = {"임신", "임산부", "임신부", "초기", "중기", "후기", "방법", "가이드", "정리", "총정리",
           "완전정리", "원인", "관리", "관리법", "증상", "시기", "주의", "체크", "기준", "비교",
           "팁", "전", "후", "중", "산모", "태아", "아기", "엄마", "아빠", "시작", "해요", "되나",
           "할까", "괜찮", "무엇", "언제", "얼마"}

CORE = ["임신 초기", "임신초기", "극초기", "착상", "입덧", "먹덧", "임신 확인", "임신확인", "아기집",
        "심박", "주수", "유산", "자궁경부", "보건소", "임테기", "엽산", "4주", "5주", "6주", "7주",
        "8주", "9주", "10주", "11주", "12주", "hcg", "니프티", "기형아", "초음파", "임신 증상",
        "질염", "배뭉침", "출혈", "갈색", "산모수첩", "국민행복카드", "맘편한", "계류유산", "화학적",
        "임산부", "임신부", "태동", "임신 후", "임신중"]

CLUSTERS = [("태동", "태동"), ("기형아·니프티", "기형아|니프티|다운"), ("초음파", "초음파"),
            ("배뭉침", "배뭉침|배땡김"), ("입덧·먹덧", "입덧|먹덧"), ("두통", "두통"), ("변비", "변비"),
            ("설사", "설사"), ("차·음료", "차!|탄산|커피|음료|카페인"), ("피부·미용", "제모|네일|여드름|튼살|피부|화장품|시술"),
            ("운동", "운동|요가"), ("지원금·바우처", "교통비|행복카드|바우처|꾸러미|지원"), ("체중", "체중"),
            ("수면", "잘 자|수면|잠|코골"), ("영양제", "비타민|철분|엽산|영양제|오메가"),
            ("예방접종", "예방접종|풍진|백일해|독감"), ("태아 크기", "주수보다|크기|저체중"),
            ("코 불편", "코피|비염"), ("허리·골반", "허리|골반|파스"), ("여행", "비행기|여행"),
            ("체온·열", "체온|열이"), ("음식·외식", "외식|음식|식단"), ("마사지", "마사지"),
            ("질염·분비물", "질염|분비물|냉"), ("출혈", "출혈|착상혈|피고임|갈색"), ("유산", "유산"),
            ("치과", "치과|치아"), ("감기·약", "감기|약 먹|약물"), ("목욕·샤워", "목욕|샤워|사우나"),
            ("눈·시력", "눈 |시력"), ("배 크기", "배 언제|배가 나오"), ("남편·아빠", "남편|아빠"),
            ("속옷·옷", "팬티|속옷|옷"), ("직장·근무", "직장|근무|휴직|출산휴가")]

pub = []
for slug in ([os.path.basename(p) for d in ("guide", "child")
              for p in glob.glob(os.path.join(SITE, d, "*")) if os.path.isdir(p)] +
             [os.path.basename(p) for p in glob.glob(os.path.join(SITE, "magazine", "*", "*"))
              if os.path.isdir(p)]):
    toks = [clean(t) for t in nfc(slug).split("-") if len(clean(t)) >= 2]
    spec = [t for t in toks if t not in GENERIC]
    if spec:
        pub.append((slug, toks, spec))

rows = []
with open(CSV, newline="", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        try:
            r["views"] = int(r["views"])
        except Exception:
            r["views"] = 0
        r["title"] = nfc(r["title"])
        rows.append(r)

cand = sorted([r for r in rows if any(k.lower() in r["title"].lower() for k in CORE)],
              key=lambda r: -r["views"])


def covered(title):
    ct = clean(title)
    for slug, toks, spec in pub:
        sh = sum(1 for t in spec if t in ct)
        th = sum(1 for t in toks if t in ct)
        if sh >= max(1, math.ceil(len(spec) / 2)) and th / len(toks) >= 0.5:
            return slug
    return None


unpub = [r for r in cand if not covered(r["title"])]
seen, other = defaultdict(list), []
for r in unpub:
    for name, pat in CLUSTERS:
        if re.search(pat, r["title"]):
            seen[name].append(r)
            break
    else:
        other.append(r)

print(f"코어 후보 {len(cand)} · 미발행 {len(unpub)}\n")
print("[미발행 주제 클러스터 — 최고 조회수순]")
for name, items in sorted(seen.items(), key=lambda kv: -max(x["views"] for x in kv[1])):
    top = max(items, key=lambda x: x["views"])
    print(f"  {top['views']:>8,}  (글{len(items):>2}·합{sum(x['views'] for x in items):>9,})  "
          f"{name:<12} ← {top['title'][:34]}")
print("\n[클러스터 미분류 상위 12]")
for r in other[:12]:
    print(f"  {r['views']:>8,}  {r['title'][:52]}")
