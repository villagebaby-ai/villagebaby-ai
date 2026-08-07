#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""연락처를 받아놓고 아무 데도 안 보내던 폼 3개를 걷어내고 상담 버튼으로 통일.

배경(2026-08-07): villagebaby.kr 401개 페이지 중 321개(80%)가 이미 '상담 페이지 링크'
방식이고, 연락처를 직접 받는 폼은 4개뿐인 예외였다. 그 4개 중
  - `guide/태아보험료-계산기`  → 시트 연결 완료(검색 1위 페이지라 폼 유지)
  - 나머지 3개                 → 전송 주소가 자리표시자거나 아예 안 보냄 → 이 스크립트로 제거
표준(링크)으로 되돌리면 시트·스크립트·배포가 안 늘고 리드는 신전산으로 바로 간다.
"""
import os
import re
import sys

SITE = "/Users/villagebaby/villagebaby-ai-site"


def block(h, start_idx):
    """start_idx 의 <div ...> 와 짝이 맞는 </div> 까지의 (시작, 끝) 반환."""
    i = start_idx
    depth = 0
    for m in re.finditer(r"<div\b[^>]*>|</div>", h[i:]):
        depth += 1 if m.group(0) != "</div>" else -1
        if depth == 0:
            return i, i + m.end()
    raise SystemExit("div 짝을 못 찾았습니다")


def cut_function(h, sig):
    """`sig` 로 시작하는 함수를 중괄호 짝을 맞춰 통째로 제거."""
    i = h.find(sig)
    if i < 0:
        return h
    j = h.find("{", i)
    if j < 0:
        return h
    depth = 0
    for k in range(j, len(h)):
        if h[k] == "{":
            depth += 1
        elif h[k] == "}":
            depth -= 1
            if depth == 0:
                return h[:i] + h[k + 1:]
    return h


def card(icon, title, desc, href, btn):
    return (
        f'<div class="lead-form-card" id="lead-form" style="text-align:center">'
        f'<div style="font-size:36px;margin-bottom:.5rem">{icon}</div>'
        f'<h3>{title}</h3><p>{desc}</p>'
        f'<a href="{href}" target="_blank" rel="noopener" class="btn-kakao" '
        f'style="display:inline-block;margin-top:14px">{btn}</a></div>')


U = ("https://babybilly.co/insurance/general/v2?utm_source=villagebaby&utm_medium=content"
     "&utm_campaign={c}&utm_content=cta_main")

JOBS = [
    dict(path="guide/태아보험-자가진단/index.html", anchor='<div class="lead-form-card" id="lead-form">',
         new=card("💬", "진단 결과에 맞는 견적, 무료로 받아보세요",
                  "지금 나온 결과를 그대로 들고 가시면 돼요. 보험사별 견적을 전문가가 비교해 드리고, "
                  "영업 강요 없는 1회성 상담입니다.",
                  U.format(c="%ED%83%9C%EC%95%84%EB%B3%B4%ED%97%98-%EC%9E%90%EA%B0%80%EC%A7%84%EB%8B%A8"),
                  "내 진단 결과로 견적 비교하기 →")),
    dict(path="tools/claim-calculator/index.html", anchor='<div class="lead-form-card" id="lead-form">',
         new=card("🔎", "놓친 병원비가 있는지 무료로 점검받으세요",
                  "아이 보험 증권을 기준으로 못 받은 청구와 빠진 특약이 없는지 확인해 드려요. "
                  "청구권 시효가 3년이라 지난 영수증도 함께 볼 수 있어요.",
                  U.format(c="claim-calculator"), "놓친 청구 점검받기 →")),
]

for j in JOBS:
    p = os.path.join(SITE, j["path"])
    if not os.path.exists(p):
        print("건너뜀(파일없음):", j["path"]); continue
    h = open(p, encoding="utf-8", newline="").read()
    i = h.find(j["anchor"])
    if i < 0:
        print("건너뜀(이미 처리됨/앵커없음):", j["path"]); continue

    if j.get("form_tag"):
        end = h.find("</form>", i) + len("</form>")
        h = h[:i] + j["new"] + h[end:]
    else:
        s, e = block(h, i)
        h = h[:s] + j["new"] + h[e:]

    # 죽은 전송 코드 제거 — 중괄호 짝을 세서 함수 전체를 정확히 도려낸다
    # (정규식 non-greedy 로 자르면 안쪽 } 에서 끊겨 JS 가 깨진다 — 실제로 한 번 깨뜨림)
    h = cut_function(h, "function submitForm")
    h = cut_function(h, "function showSuccess")
    open(p, "w", encoding="utf-8", newline="").write(h)

    left = [k for k in ("YOUR_FORM_ID", "submitForm(event)") if k in h]
    print(f"✓ {j['path']}  잔존 위험코드: {left or '없음'}")


# ── form/general : 폼 UI 는 유지하고 '가짜 접수' 핸들러만 카톡 연결로 교체 ──
GP = os.path.join(SITE, "form/general/index.html")
h = open(GP, encoding="utf-8", newline="").read()
i = h.find("form.addEventListener('submit'")
if i < 0:
    print("건너뜀(이미 처리됨): form/general")
else:
    j0 = h.find("(", i)
    depth = 0
    for k in range(j0, len(h)):
        if h[k] == "(":
            depth += 1
        elif h[k] == ")":
            depth -= 1
            if depth == 0:
                end = k + 1
                if h[end:end + 1] == ";":
                    end += 1
                break
    NEW = ("""form.addEventListener('submit', function(e){
    e.preventDefault();
    var fd = new FormData(form);
    if (!fd.get('name') || !fd.get('phone')) { alert('\uC131\uD568\uACFC \uC5F0\uB77D\uCC98\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.'); return; }
    if (!fd.get('agree')) { alert('\uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1\u00B7\uC774\uC6A9 \uB3D9\uC758\uC5D0 \uCCB4\uD06C\uD574\uC8FC\uC138\uC694.'); return; }
    if (typeof gtag === 'function') { gtag('event','cta_click',{cta_type:'kakao',cta_variant:'general_form',page_slug:'form-general',send_to:'G-SRWXXLKTKD'}); }
    window.open('https://pf.kakao.com/_bxjJfn/chat', '_blank', 'noopener');
  });""")
    h = h[:i] + NEW + h[end:]
    # 지키지 못할 약속 문구 제거
    h = h.replace("🎁 신청만 해도 사은품 증정", "💬 카톡으로 바로 상담")
    h = h.replace('action="/api/inquiry" ', "")
    open(GP, "w", encoding="utf-8", newline="").write(h)
    left = [k for k in ("/api/inquiry", "\uC0AC\uC740\uD488") if k in h]
    print("✓ form/general/index.html  가짜 접수 핸들러 → 카톡 연결로 교체")
