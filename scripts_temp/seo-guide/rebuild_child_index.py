# -*- coding: utf-8 -*-
"""
재실행: python3 scripts_temp/seo-guide/rebuild_child_index.py
/child/ 목록에도 전체 목록 섹션을 붙인다 (31편 중 9편만 링크돼 있었다)."""
import io, os, re, glob
SITE = "/Users/villagebaby/villagebaby-ai-site"
SEC = "child"

RULES = [
    ("가입 시기·보험료",   [r"가입", r"보험료", r"^어린이보험-\d", r"시기"]),
    ("특약·보장 구성",     [r"특약", r"보장", r"만기", r"환급", r"^어린이-실손", r"실손"]),
    ("질환·상황별",       [r"^아토피", r"^ADHD", r"^자폐", r"^발달", r"^심장", r"^선천", r"^미숙아",
                        r"^난청", r"^사시", r"^성조숙", r"^틱", r"^언어", r"^알레르기", r"^천식"]),
    ("청구·갱신",        [r"청구", r"갱신", r"해지", r"변경", r"전환"]),
    ("비교·선택",        [r"비교", r"추천", r"vs", r"순위", r"분석"]),
]
def cat(s):
    for n, ps in RULES:
        for p in ps:
            if re.search(p, s, re.I): return n
    return "그 밖의 어린이보험 가이드"

def title_of(path):
    h = io.open(path, encoding="utf-8", errors="ignore").read(6000)
    m = re.search(r"<title>(.*?)</title>", h, re.S)
    t = (m.group(1) if m else "").split(" | ")[0].split(" — ")[0].split(" - ")[0].strip()
    return re.sub(r"\s+", " ", t)

items = {}
for d in sorted(glob.glob(os.path.join(SITE, SEC, "*", "index.html"))):
    slug = d.split("/")[-2]
    items.setdefault(cat(slug), []).append((slug, title_of(d)))
order = [n for n, _ in RULES] + ["그 밖의 어린이보험 가이드"]
total = sum(len(v) for v in items.values())
for k in items: items[k].sort(key=lambda x: x[1])

out = ['<section class="sec" id="all-child" style="padding:8px 0 40px">',
       '<h2 class="h2">어린이보험 가이드 전체 %d편</h2>' % total,
       '<p class="desc">가입 시기부터 특약·청구까지, 지금까지 쓴 글을 주제별로 모았습니다.</p>',
       '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px 28px;margin-top:20px">']
for n in order:
    lst = items.get(n)
    if not lst: continue
    out.append('<div><h3 style="font-size:1rem;font-weight:800;color:#1F2937;margin:0 0 10px;'
               'padding-bottom:7px;border-bottom:2px solid #E2E8F0">%s <span style="font-weight:600;'
               'color:#9CA3AF;font-size:.85rem">%d</span></h3>'
               '<ul style="list-style:none;margin:0;padding:0;font-size:.89rem;line-height:1.55">' % (n, len(lst)))
    for slug, t in lst:
        out.append('<li style="margin:0 0 7px"><a href="/%s/%s/" style="color:#374151;text-decoration:none">%s</a></li>'
                   % (SEC, slug, t))
    out.append('</ul></div>')
out.append('</div></section>')
block = "\n".join(out)

p = os.path.join(SITE, SEC, "index.html")
h = io.open(p, encoding="utf-8", newline="").read()
h = re.sub(r'<section class="sec" id="all-child".*?</section>\s*(?=</div>\s*</main>)', "", h, flags=re.S)
m = re.search(r"(\s*</div>\s*</main>)", h)
h = h[:m.start()] + "\n" + block + m.group(1) + h[m.end():]
io.open(p, "w", encoding="utf-8", newline="").write(h)
print("전체 %d편" % total)
for n in order:
    if items.get(n): print("  %-26s %2d" % (n, len(items[n])))
