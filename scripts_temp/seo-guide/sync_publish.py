#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""발행 동기화 — sitemap.xml · rss.xml · lab/mypages.json 3종 갱신.
(OG 5색은 ogcard.py, 역방향 내부링크는 backlinks.py 가 맡는다)
pages_data.PAGES 를 읽어 이미 들어 있는 슬러그는 건너뛴다(중복 실행 안전).
"""
import json
import os
import re
from urllib.parse import quote

SITE = "/Users/villagebaby/villagebaby-ai-site"
TODAY = "2026-08-06"
RSS_DATE = "Thu, 06 Aug 2026 %02d:00:00 +0900"   # 편당 1시간씩


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def enc(slug):
    return quote(slug, safe="")


def sync_sitemap(pages):
    path = os.path.join(SITE, "sitemap.xml")
    s = open(path, encoding="utf-8").read()
    added = []
    blocks = ""
    for p in pages:
        loc = f"https://villagebaby.kr/guide/{enc(p['slug'])}/"
        if loc in s:
            continue
        og = f"https://villagebaby.kr/assets/og/guide_{enc(p['slug'])}-blue.png"
        blocks += (
            "  <url>\n"
            f"    <loc>{loc}</loc>\n"
            f"    <lastmod>{TODAY}</lastmod>\n"
            "    <changefreq>monthly</changefreq>\n"
            "    <priority>0.8</priority>\n"
            "    <image:image>\n"
            f"      <image:loc>{og}</image:loc>\n"
            f"      <image:title>{esc(p['crumb'])}</image:title>\n"
            f"      <image:caption>{esc(p['og_desc'])}</image:caption>\n"
            "    </image:image>\n"
            "  </url>\n")
        added.append(p["slug"])
    if blocks:
        s = s.replace("</urlset>", blocks + "</urlset>")
        open(path, "w", encoding="utf-8").write(s)
    return added


def sync_rss(pages):
    path = os.path.join(SITE, "rss.xml")
    s = open(path, encoding="utf-8").read()
    items = ""
    added = []
    for i, p in enumerate(pages):
        url = f"https://villagebaby.kr/guide/{enc(p['slug'])}/"
        if url in s:
            continue
        items += (
            "<item>\n"
            f"      <title>{esc(p['og_title'])}</title>\n"
            f"      <link>{url}</link>\n"
            f'      <guid isPermaLink="true">{url}</guid>\n'
            f"      <pubDate>{RSS_DATE % (9 + i)}</pubDate>\n"
            "      <dc:creator>베이비빌리 콘텐츠팀</dc:creator>\n"
            f"      <category>{esc(p['meta_tag'])}</category>\n"
            "      <category>임신 가이드</category>\n"
            f"      <description>{esc(p['desc'])}</description>\n"
            "    </item>\n    ")
        added.append(p["slug"])
    if items:
        # 최신 글이 맨 앞 — 첫 <item> 앞에 끼워 넣는다
        s = s.replace("<item>", items + "<item>", 1)
        s = re.sub(r"<lastBuildDate>.*?</lastBuildDate>",
                   f"<lastBuildDate>{RSS_DATE % 9}</lastBuildDate>", s, count=1)
        open(path, "w", encoding="utf-8").write(s)
    return added


def sync_registry(pages):
    path = os.path.join(SITE, "lab/mypages.json")
    reg = json.load(open(path, encoding="utf-8"))
    have = {r["url"] for r in reg}
    added = []
    for p in pages:
        url = f"https://villagebaby.kr/guide/{p['slug']}/"
        if url in have:
            continue
        reg.append({"date": TODAY, "section": "guide", "title": p["title"].split(" | ")[0],
                    "url": url, "campaign": ""})
        added.append(p["slug"])
    if added:
        json.dump(reg, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        open(path, "a", encoding="utf-8").write("\n")
    return added


if __name__ == "__main__":
    from pages_data import PAGES
    print("sitemap :", sync_sitemap(PAGES) or "변경 없음")
    print("rss     :", sync_rss(PAGES) or "변경 없음")
    print("registry:", sync_registry(PAGES) or "변경 없음")
