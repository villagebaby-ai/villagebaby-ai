# -*- coding: utf-8 -*-
"""
재실행: python3 scripts_temp/seo-guide/rebuild_guide_index.py  (새 글 발행 후 매번)
/guide/ 목록 페이지에 '전체 가이드' 섹션을 붙인다.

왜: 222편이 있는데 목록에서 링크되는 건 19편뿐이었다. 사이트맵에만 있고 사이트 안에서
아무도 안 가리키는 페이지는 구글이 '발견은 했지만 중요치 않음'으로 보고 색인을 미룬다
(실제로 8/14 발행 6주·7주가 닷새째 '발견됨-색인 안 됨'). 전체를 목록에 노출시켜
내부링크를 만들어 준다.
"""
import io, os, re, glob, json

SITE = "/Users/villagebaby/villagebaby-ai-site"

# 슬러그 → 분류. 위에서부터 먼저 걸리는 규칙을 쓴다.
RULES = [
    ("주차별 임신 가이드",       [r"^임신-\d+주", r"^임신-초기-주차별", r"^임신-주수-계산법", r"^임신-16주-태동",
                              r"^임신-주차별-보험"]),
    ("보험사별 태아보험 분석",     [r"태아보험-분석$", r"^금융감독원-태아보험", r"^q코드-태아보험", r"^갱신형-vs-비갱신형"]),
    ("질환·이력별 태아보험",      [r"태아보험$", r"태아보험-가입$", r"^유산-이력", r"^둘째-임신-태아보험",
                              r"^난소낭종", r"^갑상선-기능저하", r"^설소대-보험", r"^임신-전-보험-정비"]),
    ("태아보험 기본",           [r"^태아보험", r"^태아실손", r"^고령임신", r"^35세-이상-임신", r"^산모특약",
                              r"^쌍둥이", r"^fetal-insurance", r"^insurance-check", r"^benefit"]),
    ("우체국 엄마보험",          [r"^우체국", r"^엄마보험"]),
    ("산전검사·초음파",          [r"기형아", r"초음파", r"^아기집", r"^산전검사", r"^산전-", r"^신경관-결손",
                              r"^에드워드", r"^다태아-임신-산전", r"^NIPT", r"^다운증후군"]),
    ("임신 중 질환·응급",        [r"^자궁", r"^융모막", r"^계류유산", r"^자궁외임신", r"양수", r"^임신성-",
                              r"^전치태반", r"^태반조기박리", r"^절박유산", r"^임신중독증", r"^유산방지주사",
                              r"^임신오조", r"^태아-"]),
    ("정부 지원·제도",          [r"^맘편한", r"^보건소", r"^국민행복카드", r"^임신-출산-", r"^출산-지원",
                              r"^첫만남", r"^육아휴직", r"^근로시간", r"^난임", r"^부모급여", r"^가임력",
                              r"^고위험-임산부", r"^저소득-임산부", r"^청소년-산모", r"^지자체-출산지원금",
                              r"^다둥이-출산지원금", r"^유산-사산-휴가", r"^프리랜서-자영업", r"^산모-신생아-건강관리사",
                              r"^민영주택-신생아", r"^서울시민-안전보험", r"^2026-임산부-혜택", r"^임신기-근로시간",
                              r"^임신-확인서-발급"]),
    ("임신 초기 증상·몸의 변화",   [r"^임신-초기-", r"^임신-확인-", r"^입덧", r"^먹덧", r"^심한-입덧", r"^임신-질염",
                              r"^임신-준비-", r"^착상", r"^임신-체중", r"^임신-빈혈", r"^임신-불면", r"^임신-피부",
                              r"^임신-부종", r"^임신-요통", r"^임신선"]),
    ("임산부 생활·주의사항",      [r"^임산부-", r"^임신-목욕", r"^임신-수면", r"^임신-식단", r"^임신-운동"]),
    ("출산·산후",              [r"^출산-", r"^출산후-", r"^자연분만", r"^진통-", r"^신생아", r"^미숙아", r"^영유아"]),
    ("어린이보험·자녀",          [r"^어린이", r"^자녀-"]),
    ("실손보험",               [r"실손", r"^5세대-갈아타기"]),
    ("교육·목돈",              [r"^교육", r"비과세", r"^변액", r"^적립"]),
]


def cat(slug):
    for name, pats in RULES:
        for p in pats:
            if re.search(p, slug):
                return name
    return "그 밖의 가이드"

def title_of(path):
    h = io.open(path, encoding="utf-8", errors="ignore").read(6000)
    m = re.search(r"<title>(.*?)</title>", h, re.S)
    t = m.group(1) if m else ""
    t = t.split(" | ")[0].split(" — ")[0].split(" - ")[0].strip()
    return re.sub(r"\s+", " ", t)

items = {}
for d in sorted(glob.glob(os.path.join(SITE, "guide", "*", "index.html"))):
    slug = d.split("/")[-2]
    items.setdefault(cat(slug), []).append((slug, title_of(d)))

order = [n for n, _ in RULES] + ["그 밖의 가이드"]
total = sum(len(v) for v in items.values())

# 주차별은 숫자 순으로
def wk(x):
    m = re.match(r"임신-(\d+)주", x[0])
    return (0, int(m.group(1))) if m else (1, x[0])
if "주차별 임신 가이드" in items:
    items["주차별 임신 가이드"].sort(key=wk)
for k in items:
    if k != "주차별 임신 가이드":
        items[k].sort(key=lambda x: x[1])

out = ['<section class="sec" id="all-guides" style="padding:8px 0 0">',
       '<div class="sec-head"><h2 class="h2">전체 가이드 %d편</h2>' % total,
       '<p class="desc">임신 확인부터 출산 후까지, 지금까지 쓴 글을 주제별로 모았습니다.</p></div>',
       '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px 28px;margin-top:22px">']
for name in order:
    lst = items.get(name)
    if not lst:
        continue
    out.append('<div><h3 style="font-size:1rem;font-weight:800;color:#1F2937;margin:0 0 10px;'
               'padding-bottom:7px;border-bottom:2px solid #E2E8F0">%s <span style="font-weight:600;'
               'color:#9CA3AF;font-size:.85rem">%d</span></h3>' % (name, len(lst)))
    out.append('<ul style="list-style:none;margin:0;padding:0;font-size:.89rem;line-height:1.55">')
    for slug, t in lst:
        out.append('<li style="margin:0 0 7px"><a href="/guide/%s/" style="color:#374151;'
                   'text-decoration:none">%s</a></li>' % (slug, t))
    out.append('</ul></div>')
out.append('</div></section>')
block = "\n".join(out)

p = os.path.join(SITE, "guide", "index.html")
h = io.open(p, encoding="utf-8", newline="").read()
h = re.sub(r'<section class="sec" id="all-guides".*?</section>\s*(?=</div>\s*</main>)', "", h, flags=re.S)
anchor = "  </div>\n</main>"
if anchor not in h:
    m = re.search(r"(\s*</div>\s*</main>)", h)
    anchor = m.group(1)
    h = h.replace(anchor, "\n" + block + anchor, 1)
else:
    h = h.replace(anchor, "\n" + block + "\n" + anchor, 1)
io.open(p, "w", encoding="utf-8", newline="").write(h)

print("전체 %d편 · 분류 %d개" % (total, len([k for k in order if items.get(k)])))
for name in order:
    if items.get(name):
        print("  %-22s %3d" % (name, len(items[name])))
