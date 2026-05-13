// 사용자 첨부 AI 사진 3장을 세션 jsonl에서 추출 → sharp로 매거진 자산 변환
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import sharp from 'sharp';

const sessionPath = 'C:/Users/USER/.claude/projects/C--Users-USER-Documents-ai-202605/c6893e73-86ad-4d61-a5e8-3d9b222a29b1.jsonl';
const outDir = path.resolve(import.meta.dirname, '..', 'public', 'covers');
fs.mkdirSync(outDir, { recursive: true });

// Find user message #2 (the AI photos)
const rl = readline.createInterface({ input: fs.createReadStream(sessionPath), crlfDelay: Infinity });
let foundMsg = null;
let userMsgCount = 0;
for await (const line of rl) {
  if (!line) continue;
  let obj;
  try { obj = JSON.parse(line); } catch { continue; }
  if (obj.type !== 'user' || !Array.isArray(obj.message?.content)) continue;
  const imgs = obj.message.content.filter(c => c.type === 'image' && c.source?.type === 'base64');
  if (imgs.length === 0) continue;
  userMsgCount++;
  if (userMsgCount === 2) {
    foundMsg = imgs;
    break;
  }
}

if (!foundMsg) {
  console.error('Could not find user message #2 with images');
  process.exit(1);
}

console.log(`Found ${foundMsg.length} images. Processing...\n`);

// 매핑 (사용자 메시지 순서대로 image 0/1/2)
// image 0: 양말 + 모슬린 + teether (newborn-card 용)
// image 1: top-down 무릎 + 초음파 + 양말 (pregnancy-hero + golden-time)
// image 2: 임산부 + cream 니트 + 소파 (home-hero + pregnancy-card)
const mapping = [
  { idx: 0, outputs: [
    { name: 'newborn-card.jpg', width: 1000 },
  ]},
  { idx: 1, outputs: [
    { name: 'pregnancy-hero.jpg', width: 1600 },
    { name: 'golden-time.jpg', width: 1600 },
  ]},
  { idx: 2, outputs: [
    { name: 'home-hero.jpg', width: 1600 },
    { name: 'pregnancy-card.jpg', width: 1000 },
  ]},
];

for (const m of mapping) {
  const img = foundMsg[m.idx];
  const buf = Buffer.from(img.source.data, 'base64');
  const meta = await sharp(buf).metadata();
  console.log(`Image ${m.idx}: ${meta.format} ${meta.width}x${meta.height} (${Math.round(buf.length / 1024)}KB src)`);
  for (const out of m.outputs) {
    const destPath = path.join(outDir, out.name);
    await sharp(buf)
      .resize({ width: out.width, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(destPath);
    const stat = fs.statSync(destPath);
    console.log(`  → ${out.name}  (${Math.round(stat.size / 1024)}KB)`);
  }
}

console.log('\n✓ All AI photos extracted and processed.');
