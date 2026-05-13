// AI-generated photos (ChatGPT/DALL-E 출력) → magazine cover 자산 변환
// 사용: node scripts/process-ai-photos.mjs
// 임시 파일을 리사이즈·압축해 public/covers/에 저장
import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'covers');
await mkdir(outDir, { recursive: true });

// 시간순 = 업로드순 매핑
// 이미지 1 (16:44, 6MB JPEG) — 양말 + 모슬린 + teether flat-lay
// 이미지 2 (16:50, 11MB PNG)  — top-down 무릎 + 초음파 + 양말
// 이미지 3 (16:54, 14MB WebP) — 임산부 + cream 니트 + 소파
const tasks = [
  // (src, [{dest, width}])
  {
    src: 'C:/Users/USER/AppData/Local/Temp/a7b75163-67da-48e0-8b36-014f18a6fc8d.tmp',
    outputs: [
      { name: 'newborn-card.jpg', width: 1000 },
    ],
  },
  {
    src: 'C:/Users/USER/AppData/Local/Temp/fee9291e-47d1-4d5b-a6a8-2f27a55f2057.tmp',
    outputs: [
      { name: 'pregnancy-hero.jpg', width: 1600 },
      { name: 'golden-time.jpg', width: 1600 },
    ],
  },
  {
    src: 'C:/Users/USER/AppData/Local/Temp/eeaa2e99-a989-47c7-a99c-3599691056e4.tmp',
    outputs: [
      { name: 'home-hero.jpg', width: 1600 },
      { name: 'pregnancy-card.jpg', width: 1000 },
    ],
  },
];

for (const task of tasks) {
  for (const out of task.outputs) {
    const destPath = path.join(outDir, out.name);
    const meta = await sharp(task.src).metadata();
    await sharp(task.src)
      .resize({ width: out.width, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(destPath);
    const stats = await sharp(destPath).metadata();
    console.log(`[ok] ${out.name}  ${stats.width}x${stats.height}  (src ${meta.width}x${meta.height} ${meta.format})`);
  }
}

console.log('\n✓ All AI photos processed.');
