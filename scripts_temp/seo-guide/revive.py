#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""7/28 대량발행 미색인분을 하루 N편씩 되살린다.

배경(2026-08-19 실측):
  2026-07-28 하루에 257편을 몰아 올렸고 그 중 33%만 색인됐다.
  같은 사이트에서 8/05에 51편 올린 건 92%, 하루 3~4편씩 올린 8월분은 75~87%.
  → 원인은 내부링크도 글 길이도 중복도 아니고 **한 번에 쏟아부은 것**.
  그래서 되살릴 때도 한 번에 밀면 안 된다. 하루 N편씩 나눠서 재제출한다.

각 편에 하는 일
  1) 카톡 상담 바 삽입 (없으면)
  2) <title> 에 브랜드 보정
  3) article:modified_time · JSON-LD dateModified → 오늘
  4) sitemap.xml lastmod → 오늘   ← 구글 재크롤의 실질 레버
  * 내용 보강은 손으로 한다. 이 스크립트는 기계적인 부분만.

사용:
  python3 revive.py --list 10          # 다음 차례 10편 보기
  python3 revive.py --run 5            # 상위 5편 처리 + 진행상태 기록
  python3 revive.py --run 5 --dry      # 미리보기
상태: scripts_temp/seo-guide/revive_state.json (처리 끝난 경로)
"""
import argparse, io, json, os, re, sys, datetime

SITE = "/Users/villagebaby/villagebaby-ai-site"
HERE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.join(HERE, "revive_state.json")
QUEUE = os.path.join(HERE, "revive_queue.json")
TODAY = datetime.date.today().isoformat()

KAKAO_BAR_STYLE = ("display:flex;align-items:center;justify-content:space-between;gap:14px;"
                   "background:#FEE500;color:#3C1E1E;border-radius:12px;padding:16px 20px;"
                   "margin:16px 0 32px;text-decoration:none;box-shadow:0 2px 10px rgba(0,0,0,.07)")
KAKAO_CT = "\U0001F4AC 궁금한 건 카톡으로 물어보세요"
KAKAO_CD = "전문 상담사 무료 상담 · 가입 안 하셔도 됩니다"
KAKAO_BTN = "무료 상담 →"
TALK = "https://babybilly.co/insurance/baby/talk/v1"


def load(p, default):
    try:
        return json.load(io.open(p, encoding="utf-8"))
    except Exception:
        return default


def close_div(h, i):
    """h[i] 위치의 <div ...> 에 짝 맞는 </div> 끝 인덱스."""
    depth = 0
    for m in re.finditer(r"<div\b|</div>", h[i:]):
        depth += 1 if m.group(0) != "</div>" else -1
        if depth == 0:
            return i + m.end()
    return -1


def kakao_bar(slug):
    from urllib.parse import quote
    url = (TALK + "?utm_source=villagebaby&utm_medium=content&utm_campaign=" + quote(slug)
           + "&utm_content=cta_app_kakao")
    return ('\n<a href="' + url + '" id="app-kakao" class="vb-kakao-bar" target="_blank" rel="noopener" '
            'style="' + KAKAO_BAR_STYLE + '">'
            '<span style="line-height:1.5">'
            '<span style="display:block;font-size:.97rem;font-weight:800">' + KAKAO_CT + '</span>'
            '<span style="display:block;font-size:.83rem;font-weight:500;opacity:.72;margin-top:3px">'
            + KAKAO_CD + '</span></span>'
            '<span style="flex:none;font-size:.9rem;font-weight:800;white-space:nowrap">'
            + KAKAO_BTN + '</span></a>\n')


def insert_bar(h, slug):
    """앱 CTA → 보험 CTA → FAQ 앞 → 관련글 앞 순으로 자리를 찾는다."""
    if "vb-kakao-bar" in h:
        return h, "이미있음"
    for cls, why in [('<div class="vb-app-cta"', "앱CTA뒤"), ('<div class="cta app">', "앱CTA뒤"),
                     ('<div class="cta-box"', "보험CTA뒤")]:
        i = h.find(cls)
        if i >= 0:
            j = close_div(h, i)
            if j > 0:
                return h[:j] + kakao_bar(slug) + h[j:], why
    for pat, why in [(r'<section class="faq-section"', "FAQ앞"),
                     (r'<h2[^>]*>\s*자주 묻는 질문', "FAQ앞"),
                     (r'<div class="related"', "관련글앞"),
                     (r'<footer', "푸터앞")]:
        m = re.search(pat, h)
        if m:
            return h[:m.start()] + kakao_bar(slug) + h[m.start():], why
    return h, "자리못찾음"


def touch_dates(h):
    n = 0
    h2, k = re.subn(r'(article:modified_time" content=")[^"]+(")',
                    r"\g<1>" + TODAY + "T00:00:00+09:00" + r"\2", h); n += k
    h2, k = re.subn(r'("dateModified"\s*:\s*")[^"]+(")', r"\g<1>" + TODAY + r"\2", h2); n += k
    h2, k = re.subn(r"(최종 업데이트[^0-9]{0,12})20\d\d[.\-]\s?\d\d[.\-]\s?\d\d",
                    r"\g<1>" + TODAY.replace("-", "."), h2); n += k
    return h2, n


def fix_title(h):
    m = re.search(r"<title>(.*?)</title>", h, re.S)
    if not m or "베이비빌리" in m.group(1):
        return h, 0
    return h.replace(m.group(0), "<title>" + m.group(1).strip() + " | 베이비빌리</title>", 1), 1


def bump_sitemap(paths):
    p = os.path.join(SITE, "sitemap.xml")
    s = io.open(p, encoding="utf-8", newline="").read()
    from urllib.parse import quote
    n = 0
    for path in paths:
        enc = "https://villagebaby.kr" + quote(path)
        plain = "https://villagebaby.kr" + path
        for loc in (enc, plain):
            pat = re.compile(r"(<loc>" + re.escape(loc) + r"</loc>\s*<lastmod>)[^<]+(</lastmod>)")
            s, k = pat.subn(r"\g<1>" + TODAY + r"\2", s)
            n += k
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", type=int)
    ap.add_argument("--run", type=int)
    ap.add_argument("--dry", action="store_true")
    a = ap.parse_args()

    q = load(QUEUE, None)
    if q is None:
        print("큐 파일이 없습니다:", QUEUE); sys.exit(1)
    done = set(load(STATE, []))
    todo = [e for e in q if e["path"] not in done]
    print("전체 %d편 · 처리완료 %d편 · 남음 %d편\n" % (len(q), len(done), len(todo)))

    if a.list:
        for i, e in enumerate(todo[:a.list], 1):
            print("%2d. %8.0f  %-44s %5d자" % (i, e["score"], e["title"][:44], e["len"]))
        return

    if not a.run:
        return
    batch = todo[:a.run]
    changed = []
    for e in batch:
        f = os.path.join(SITE, e["path"].strip("/"), "index.html")
        h0 = io.open(f, encoding="utf-8", newline="").read()
        slug = e["path"].strip("/").split("/")[-1]
        h, why = insert_bar(h0, slug)
        h, nd = touch_dates(h)
        h, nt = fix_title(h)
        mark = "DRY" if a.dry else "OK "
        print("%s %-44s 카톡바:%-8s 날짜:%d 제목:%d" % (mark, e["title"][:44], why, nd, nt))
        if not a.dry and h != h0:
            io.open(f, "w", encoding="utf-8", newline="").write(h)
            changed.append(e["path"])
    if a.dry:
        return
    n = bump_sitemap([e["path"] for e in batch])
    print("\nsitemap lastmod 갱신: %d건" % n)
    done |= set(e["path"] for e in batch)
    json.dump(sorted(done), io.open(STATE, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print("진행 기록: %d / %d편 완료" % (len(done), len(q)))


if __name__ == "__main__":
    main()
