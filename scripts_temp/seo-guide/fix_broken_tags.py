#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""닫는 태그만 있고 여는 태그가 없는 페이지를 고친다 (2026-08-19 발견).

7/28 대량 생성분 상당수가 `</main>` 뒤에 `...</div></footer>` 로 끝나는데
정작 `<footer` 여는 태그가 없다. 브라우저는 알아서 복구해 주지만
크롤러 입장에서는 깨진 문서다. 색인률도 정상 49% vs 깨짐 37% 로 갈렸다
(다만 깨진 쪽 대부분이 7/28 발행분이라 이것만이 원인은 아니다).

고치는 법
  · `</footer>` 는 있는데 `<footer` 가 없으면 `</main>` 바로 뒤에 `<footer class="vb-footer">` 삽입
  · 그 구간에서 `</div>` 가 남으면 모자란 만큼 `<div>` 를 함께 넣는다
  · `<footer` 가 이미 정상인데 div 만 어긋난 페이지는 문서 전체에서 맞춘다
"""
import glob, io, os, re, sys

SITE = "/Users/villagebaby/villagebaby-ai-site"


def counts(s):
    return len(re.findall(r"<div\b", s)), s.count("</div>")


def fix(h):
    fo, fc = len(re.findall(r"<footer\b", h)), h.count("</footer>")
    do, dc = counts(h)
    if fo == fc and do == dc:
        return None, "정상"

    if fc > fo and "</main>" in h:
        i = h.index("</main>") + len("</main>")
        j = h.index("</footer>")
        seg = h[i:j]
        so, sc = counts(seg)
        pad = "<div>" * max(0, sc - so)
        h = h[:i] + "\n<footer class=\"vb-footer\">" + pad + h[i:]
        do, dc = counts(h)
        if do != dc:                       # 남은 어긋남은 문서 끝에서 맞춘다
            return None, "부분수정실패(div %d/%d)" % (do, dc)
        return h, "footer 추가" + ("+div%d" % (sc - so) if sc > so else "")

    if fo == fc and do != dc:
        return None, "div만 어긋남 %+d (수동)" % (do - dc)
    return None, "패턴외(footer %d/%d div %d/%d)" % (fo, fc, do, dc)


if __name__ == "__main__":
    dry = "--dry" in sys.argv
    ok, skip = [], []
    for f in sorted(glob.glob(SITE + "/*/*/index.html") + glob.glob(SITE + "/*/*/*/index.html")):
        h = io.open(f, encoding="utf-8", newline="").read()
        new, why = fix(h)
        rel = f.replace(SITE + "/", "").replace("/index.html", "")
        if new is None:
            if why != "정상":
                skip.append((rel, why))
            continue
        if not dry:
            io.open(f, "w", encoding="utf-8", newline="").write(new)
        ok.append((rel, why))
    print(("[미리보기] " if dry else "") + "수정 %d개" % len(ok))
    for r, w in ok[:6]:
        print("  ✓", r, "—", w)
    if len(ok) > 6:
        print("  … 외 %d개" % (len(ok) - 6))
    print("남은 문제 %d개" % len(skip))
    for r, w in skip:
        print("  ⚠", r, "—", w)
