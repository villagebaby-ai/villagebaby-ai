// 사용자가 채팅에 첨부한 이미지들을 세션 jsonl에서 추출
// 각 이미지를 ./public/covers/_inbox/{N}.{ext}로 저장
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const sessionPath = 'C:/Users/USER/.claude/projects/C--Users-USER-Documents-ai-202605/c6893e73-86ad-4d61-a5e8-3d9b222a29b1.jsonl';
const outDir = path.resolve(import.meta.dirname, '..', 'public', 'covers', '_inbox');
fs.mkdirSync(outDir, { recursive: true });

const rl = readline.createInterface({ input: fs.createReadStream(sessionPath), crlfDelay: Infinity });
let userMsgCounter = 0;
const userImageMessages = []; // [{ lineNo, attachmentCount, attachments: [{mediaType, dataLen, dataPreview}] }]

let lineNo = 0;
for await (const line of rl) {
  lineNo++;
  if (!line) continue;
  let obj;
  try { obj = JSON.parse(line); } catch { continue; }
  if (obj.type !== 'user' || !obj.message?.content) continue;
  const content = obj.message.content;
  if (!Array.isArray(content)) continue;
  const images = content.filter(c => c.type === 'image' && c.source?.type === 'base64');
  if (images.length === 0) continue;
  userMsgCounter++;
  userImageMessages.push({
    lineNo,
    msgIdx: userMsgCounter,
    images: images.map(im => ({
      mediaType: im.source.media_type,
      dataLen: im.source.data.length,
    })),
    timestamp: obj.timestamp,
  });
}

console.log(`Found ${userImageMessages.length} user messages with image attachments:`);
for (const m of userImageMessages) {
  console.log(`  msg #${m.msgIdx} @ line ${m.lineNo} (${m.timestamp})  → ${m.images.length} images  [${m.images.map(i => i.mediaType + '/' + Math.round(i.dataLen / 1024) + 'KB').join(', ')}]`);
}
