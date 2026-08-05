#!/usr/bin/env python3
"""villagebaby.kr OG 카드 생성기 (1200x630, 5색 변형)
기존 guide_임신-초기-배뭉침-*.png 레이아웃을 그대로 재현."""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
FONT_DIR = os.path.expanduser("~/Library/Fonts")
F_BOLD = os.path.join(FONT_DIR, "Pretendard-ExtraBold.otf")
F_SEMI = os.path.join(FONT_DIR, "Pretendard-Bold.otf")
F_MED = os.path.join(FONT_DIR, "Pretendard-SemiBold.otf")
IMG_DIR = "/Users/villagebaby/villagebaby-ai-site/assets/img"

PALETTE = {
    "blue":     dict(bg_top=(234, 243, 251), bg_bot=(227, 239, 249), badge=(108, 143, 196), title=(92, 127, 182),  sub=(124, 147, 184)),
    "mint":     dict(bg_top=(233, 245, 239), bg_bot=(223, 241, 233), badge=(58, 138, 122),  title=(44, 122, 103),  sub=(79, 152, 133)),
    "cream":    dict(bg_top=(255, 248, 232), bg_bot=(253, 242, 215), badge=(224, 160, 20),  title=(169, 114, 12),  sub=(185, 138, 34)),
    "lavender": dict(bg_top=(241, 236, 251), bg_bot=(234, 227, 248), badge=(124, 105, 185), title=(106, 87, 166),  sub=(134, 118, 180)),
    "peach":    dict(bg_top=(253, 238, 231), bg_bot=(252, 228, 218), badge=(225, 104, 60),  title=(192, 81, 42),   sub=(203, 106, 70)),
}
VARIANTS = list(PALETTE)

PAD_X = 76
BADGE_Y, BADGE_H = 96, 50
TITLE_Y = 186
TITLE_SIZE, TITLE_LEAD = 62, 85
SUB_Y = 392
SUB_SIZE = 32
LOGO_X, LOGO_Y, LOGO_W = 80, 515, 82


def vgrad(top, bot):
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        d.line([(0, y), (W, y)], fill=tuple(round(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    return img


def make(slug, badge_text, title_lines, subtitle, illust, variant, out_dir, flip=False):
    p = PALETTE[variant]
    img = vgrad(p["bg_top"], p["bg_bot"])

    # 일러스트 — 우측 하단 기준 배치 (텍스트 영역 아래로 깔림)
    ip = os.path.join(IMG_DIR, illust + ".png")
    if os.path.exists(ip):
        il = Image.open(ip).convert("RGBA")
        bb = il.getbbox()
        if bb:
            il = il.crop(bb)
        if flip:
            il = il.transpose(Image.FLIP_LEFT_RIGHT)
        scale = min(578 / il.height, 552 / il.width)
        il = il.resize((max(1, round(il.width * scale)), max(1, round(il.height * scale))), Image.LANCZOS)
        img.paste(il, (W - 24 - il.width, H - 6 - il.height), il)

    d = ImageDraw.Draw(img)
    fb = ImageFont.truetype(F_SEMI, 25)
    ft = ImageFont.truetype(F_BOLD, TITLE_SIZE)
    fs = ImageFont.truetype(F_MED, SUB_SIZE)

    # 배지
    tw = d.textlength(badge_text, font=fb)
    bw = round(tw) + 56
    d.rounded_rectangle([PAD_X, BADGE_Y, PAD_X + bw, BADGE_Y + BADGE_H], radius=BADGE_H // 2, fill=p["badge"])
    d.text((PAD_X + 28, BADGE_Y + BADGE_H / 2), badge_text, font=fb, fill=(255, 255, 255), anchor="lm")

    # 제목 — 글리프 상단이 정확히 TITLE_Y 에 오도록 보정
    for i, line in enumerate(title_lines):
        off = ft.getbbox(line)[1]
        d.text((PAD_X, TITLE_Y + i * TITLE_LEAD - off), line, font=ft, fill=p["title"])

    # 부제
    sy = SUB_Y + (len(title_lines) - 2) * TITLE_LEAD
    d.text((PAD_X, sy - fs.getbbox(subtitle)[1]), subtitle, font=fs, fill=p["sub"])

    # 로고
    lp = os.path.join(IMG_DIR, "logo-billy.png")
    if os.path.exists(lp):
        lg = Image.open(lp).convert("RGBA")
        lg = lg.resize((LOGO_W, round(lg.height * LOGO_W / lg.width)), Image.LANCZOS)
        img.paste(lg, (LOGO_X, LOGO_Y), lg)

    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f"guide_{slug}-{variant}.png")
    img.save(out, optimize=True)
    return out


def make_all(slug, badge_text, title_lines, subtitle, illust, out_dir, flip=False):
    return [make(slug, badge_text, title_lines, subtitle, illust, v, out_dir, flip) for v in VARIANTS]


if __name__ == "__main__":
    for f in make_all("임신-초기-배뭉침", "임신 초기", ["임신 초기 배뭉침,", "괜찮은 걸까?"], "대부분 정상이에요", "billy-hero-wink",
                      "./ogtest"):
        print(f)
