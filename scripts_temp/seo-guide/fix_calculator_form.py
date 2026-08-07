#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""태아보험료 계산기 폼 전송 복구.

원래 상태(2026-08-07 발견): ENDPOINT 가 'formspree.io/f/YOUR_FORM_ID' 자리표시자인데
`.catch(()=>{}).finally(()=>showSuccess())` 라서 **전송 실패를 삼키고 무조건 성공 화면**을 띄웠다.
→ 이름·연락처 남긴 사람은 접수됐다고 믿고 나가고, 우리는 한 건도 못 받았다.

바꾸는 것:
  1) 시트(Apps Script) 로 실제 전송 + 성공했을 때만 성공 화면
  2) 실패하면 거짓말 대신 **카톡 상담으로 바로 연결**하는 안내를 띄운다 (리드를 안 잃는다)
  3) GA4 에 폼 제출 성공/실패를 남긴다

ENDPOINT 를 인자로 주면 그 값으로 박고, 안 주면 자리표시자를 유지하되
'실패해도 카톡으로 살린다' 로직만 먼저 넣는다.
  python3 fix_calculator_form.py                       # 실패 안전장치만 먼저
  python3 fix_calculator_form.py https://script.google.com/macros/s/AKfy.../exec
"""
import os
import re
import sys

PAGE = "/Users/villagebaby/villagebaby-ai-site/guide/태아보험료-계산기/index.html"
KAKAO = ("https://babybilly.co/insurance/general/v2?utm_source=villagebaby&utm_medium=content"
         "&utm_campaign=%ED%83%9C%EC%95%84%EB%B3%B4%ED%97%98%EB%A3%8C-%EA%B3%84%EC%82%B0%EA%B8%B0"
         "&utm_content=form_fallback")
ENDPOINT = sys.argv[1] if len(sys.argv) > 1 else "SHEET_ENDPOINT_PENDING"

NEW_JS = """function submitForm(e){e.preventDefault();
  var EP='%EP%';
  var g=function(id){var el=document.getElementById(id);return el?el.value:'';};
  var payload={phone:g('f_phone'),name:g('f_name'),weeks:g('f_weeks'),gender:g('f_gender'),
    coverage:g('f_coverage'),range:g('f_range'),pref:g('f_pref'),
    pageUrl:location.href,referrer:document.referrer||''};
  var btn=e.target.querySelector('.btn-submit');
  if(btn){btn.disabled=true;btn.textContent='\\uC804\\uC1A1 \\uC911...';}
  function ga(ok){if(typeof gtag==='function'){gtag('event','form_submit',
    {form_name:'fetal_calc',status:ok?'success':'fail',send_to:'G-SRWXXLKTKD'});}}
  if(EP.indexOf('https://')!==0){ga(false);showFallback();return;}
  fetch(EP,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify(payload)})
    .then(function(r){return r.json();})
    .then(function(j){ if(j&&j.ok){ga(true);showSuccess();} else {ga(false);showFallback();} })
    .catch(function(){ga(false);showFallback();});
}
function showFallback(){
  var a=document.getElementById('form-area'); if(a)a.style.display='none';
  var f=document.getElementById('form-fallback');
  if(f){f.style.display='block';f.scrollIntoView({behavior:'smooth'});}
}"""


def main():
    h = open(PAGE, encoding="utf-8", newline="").read()

    # 1) submitForm 교체
    m = re.search(r"function submitForm\(e\)\{.*?\n\}", h, re.S)
    if not m:
        sys.exit("submitForm 을 못 찾았습니다 — 페이지 구조가 바뀌었는지 확인하세요.")
    h = h[:m.start()] + NEW_JS.replace("%EP%", ENDPOINT) + h[m.end():]

    # 2) 실패 안내 블록 추가 (성공 블록 바로 뒤에 한 번만)
    if 'id="form-fallback"' not in h:
        anchor = '<div id="form-success">'
        i = h.find(anchor)
        if i < 0:
            sys.exit("form-success 블록을 못 찾았습니다.")
        end = h.find("</div>", h.find("btn-kakao", i)) + len("</div>")
        fallback = (
            '\n<div id="form-fallback" style="display:none;text-align:center;padding:28px 20px">'
            '<div class="success-icon">💬</div>'
            '<h4>지금은 접수 창구를 점검하고 있어요</h4>'
            '<p>입력하신 내용이 저장되지 않았어요. 번거로우시겠지만 아래 버튼으로 '
            '바로 상담 연결해 드릴게요. 같은 내용으로 빠르게 도와드립니다.</p>'
            f'<a href="{KAKAO}" target="_blank" rel="noopener" class="btn-kakao">'
            '💬 카톡으로 바로 상담하기</a></div>')
        h = h[:end] + fallback + h[end:]

    open(PAGE, "w", encoding="utf-8", newline="").write(h)

    live = ENDPOINT.startswith("https://")
    print("✅ 폼 전송 로직 교체 완료")
    print("   엔드포인트:", ENDPOINT if live else "미지정 — 제출 시 카톡 상담 안내로 우회")
    print("   거짓 성공화면 제거:", "예" if ".finally(()=>showSuccess())" not in h else "❌ 남아 있음")
    print("   실패 안내 블록:", "있음" if 'id="form-fallback"' in h else "없음")


if __name__ == "__main__":
    main()
