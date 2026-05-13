# AI 이미지 생성 prompt 모음 — 매거진 cover용

Midjourney / DALL-E / Stable Diffusion에 그대로 붙여넣기. 결과물을 `public/covers/{파일명}` 에 저장.

## 공통 스타일 anchor

```
soft natural daylight, cream and ivory color palette, minimalist editorial photography,
shallow depth of field, warm white balance, no text, no watermark,
candid lifestyle moment, --ar 4:5 --style raw --v 6
```

위 anchor를 모든 prompt 뒤에 붙이면 톤이 일관돼요.

---

## Hero 홈 (`home-hero.jpg`, 4:5)

```
A young Asian pregnant woman in a soft cream knit sweater, sitting on a light beige
linen couch, gently holding an ultrasound photo, sunlight streaming through a sheer
white curtain, neutral living room, editorial maternity photography,
[공통 anchor]
```

## 임신 pillar hero (`pregnancy-hero.jpg`, 4:5)

```
Top-down view of a pregnant woman's lap wearing a ribbed cream lounge dress,
holding a Clearblue digital pregnancy test in one hand and a sonogram print in the
other, tiny knitted baby booties beside her, light grey tile floor, soft morning light,
[공통 anchor]
```

## 신생아 pillar (`newborn-hero.jpg`, 4:3)

```
Tiny hand-knit ivory baby socks with pompoms placed on a soft cream blanket,
overhead flat-lay, dreamy soft focus, pastel cream tones, no people,
[공통 anchor — change --ar 4:3]
```

## 영유아 pillar (`toddler-hero.jpg`, 4:3)

```
A 9-month-old Asian baby sitting on a beige rug, surrounded by simple wooden
montessori toys, soft natural window light, parent's hand gently visible at the edge,
warm minimalist nursery,
[공통 anchor — change --ar 4:3]
```

## 학동기 pillar (`school-hero.jpg`, 4:3)

```
Flat-lay of a children's leather school bag, a small lunch box, a worn picture book,
and a wooden pencil case on a beige linen surface, soft daylight, no logos,
[공통 anchor — change --ar 4:3]
```

## 케이스 pillar (`case-hero.jpg`, 4:3)

```
A close-up of a young Asian couple's hands gently resting on a pregnant belly,
woman in soft cream cardigan, man in beige knit, intimate documentary feel,
shallow depth of field,
[공통 anchor — change --ar 4:3]
```

## 글 cover 예시 — 가입 골든타임 (`golden-time.jpg`, 16:9)

```
A pregnant woman's hand circling week 12 to 22 on a soft cream paper calendar
with a brown pencil, ultrasound photo beside it, warm desk lamp light,
editorial overhead shot,
[공통 anchor — change --ar 16:9]
```

---

## 톤 일관성 체크리스트

생성한 이미지가 다음을 만족하는지 확인:

- [ ] 색감이 cream / ivory / 베이지 위주 (강한 채도 없음)
- [ ] 자연광 (인공조명·플래시 느낌 없음)
- [ ] 인물이 있다면 얼굴이 너무 정면이지 않음 (편집·교체 자유도)
- [ ] 텍스트 / 워터마크 / 시계 / 로고 없음
- [ ] 가로 1600px 이상

만족하지 않으면 prompt에 `, no harsh shadow, no logos, no text` 추가 후 재생성.
