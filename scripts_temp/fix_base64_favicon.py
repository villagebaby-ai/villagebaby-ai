"""
villagebaby.kr 4편의 base64 favicon link → /favicon.png 외부 파일로 교체
정상 페이지 표준 패턴:
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/favicon.png">
"""
import sys, re
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent

TARGETS = [
    "guide/태아보험-가입시기-필수특약/index.html",
    "guide/태아보험-보험사-추천-비교/index.html",
    "guide/태아보험-특약-총정리/index.html",
    "child/어린이보험-보험사-비교-추천/index.html",
]

# base64 favicon link 패턴 — sizes 다양 (32x32, 16x16, 180x180 등)
PATTERN_ICON = re.compile(
    r'<link\s+rel="icon"[^>]*href="data:image/png;base64,[^"]+"\s*/?>',
    re.IGNORECASE,
)
PATTERN_APPLE = re.compile(
    r'<link\s+rel="apple-touch-icon"[^>]*href="data:image/png;base64,[^"]+"\s*/?>',
    re.IGNORECASE,
)

STANDARD_BLOCK = (
    '<link rel="icon" type="image/png" href="/favicon.png">\n'
    '  <link rel="apple-touch-icon" href="/favicon.png">'
)

for rel in TARGETS:
    p = ROOT / rel
    if not p.exists():
        print(f"  ⚠ 파일 없음: {rel}")
        continue

    text = p.read_text(encoding="utf-8")
    before_size = len(text)
    before_count_icon = len(PATTERN_ICON.findall(text))
    before_count_apple = len(PATTERN_APPLE.findall(text))

    # 첫 base64 icon link를 표준 블록으로 교체, 나머지는 제거
    if before_count_icon > 0:
        text = PATTERN_ICON.sub(STANDARD_BLOCK, text, count=1)
        text = PATTERN_ICON.sub("", text)  # 나머지 제거
    elif before_count_apple > 0:
        # icon은 없고 apple만 있는 경우 (드물 것)
        text = PATTERN_APPLE.sub(STANDARD_BLOCK, text, count=1)

    # 잔존 base64 apple 제거
    text = PATTERN_APPLE.sub("", text)

    # 빈 줄 정리
    text = re.sub(r"\n\s*\n\s*\n", "\n\n", text)

    after_size = len(text)
    p.write_text(text, encoding="utf-8")

    saved = before_size - after_size
    print(f"  ✓ {rel}")
    print(f"      base64 icon 제거: {before_count_icon}건")
    print(f"      base64 apple-touch 제거: {before_count_apple}건")
    print(f"      파일 사이즈: -{saved:,} bytes ({saved*100//before_size}% 감소)")
