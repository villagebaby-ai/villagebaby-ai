#!/usr/bin/env node
/**
 * index-submit.mjs — 색인 제출 큐 (하루 N건씩 자동)
 *
 * sitemap.xml 을 읽어 "아직 제출 안 했거나 lastmod 가 바뀐" URL 을 골라
 * 하루 N건만 IndexNow 에 제출한다. 나머지는 다음 날로 넘긴다.
 *
 * 왜 큐 방식인가: 8편을 한 번에 밀면 배치 신호가 된다.
 *                 (2026-08-05 세션 결론 — docs/CONTENT_PLAYBOOK.md 참고)
 *
 * ⚠️ 커버 범위 = IndexNow 참여 엔진 (Bing · Yandex · Naver · Seznam · Yep).
 *    구글은 IndexNow 를 지원하지 않는다. 구글은 사이트맵 + lastmod 가 유일한 경로.
 *    (구글 Indexing API 는 JobPosting/BroadcastEvent 전용이라 일반 콘텐츠에 쓰면 정책 위반)
 *
 * 실행: node scripts/index-submit.mjs
 *   INDEXNOW_LIMIT=3   하루 제출 건수 (기본 3)
 *   DRY_RUN=1          실제 전송 없이 대상만 출력
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = 'https://villagebaby.kr';
const HOST = 'villagebaby.kr';
const KEY = '4b9f2c5e7a1d8b3f6e0c9a7d2b5e8f3c';
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const STATE = path.join(ROOT, '.github', 'state', 'indexnow-submitted.json');
const LIMIT = Number(process.env.INDEXNOW_LIMIT || 3);
const DRY = process.env.DRY_RUN === '1';

// ─── sitemap.xml → [{url, lastmod}] ────────────────────────────────────────
function readSitemap() {
  const xml = fs.readFileSync(SITEMAP, 'utf8');
  const out = [];
  for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) || []) {
    const loc = block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/);
    if (!loc) continue;
    const lm = block.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/);
    out.push({ url: loc[1], lastmod: lm ? lm[1] : '' });
  }
  return out;
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE, 'utf8'));
  } catch {
    return { submitted: {} };
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(STATE), { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');
}

// ─── IndexNow 제출 ──────────────────────────────────────────────────────────
function submit(urlList) {
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList,
  });
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'villagebaby-bot/1.0',
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ code: res.statusCode, data: data.trim() }));
    });
    req.on('error', (e) => resolve({ code: null, data: e.message }));
    req.setTimeout(15_000, () => { req.destroy(); resolve({ code: null, data: 'timeout' }); });
    req.write(body);
    req.end();
  });
}

// ─── main ───────────────────────────────────────────────────────────────────
const entries = readSitemap();
const state = readState();
const seen = state.submitted || {};

// 같은 lastmod 안에서는 콘텐츠 페이지를 먼저 — 도구·부속 페이지가 큐를 막지 않게
function priority(url) {
  const p = decodeURIComponent(url);
  if (/\/(guide|child|magazine|cancer|female|care|driver|education)\//.test(p)) return 0;
  return 1;
}

// 신규 = 기록 없음 / 갱신 = lastmod 변경
const pending = entries
  .map((e, i) => ({ ...e, i }))
  .filter((e) => seen[e.url] !== e.lastmod)
  .sort((a, b) =>
    (b.lastmod || '').localeCompare(a.lastmod || '') ||
    priority(a.url) - priority(b.url) ||
    a.i - b.i);

console.log(`sitemap ${entries.length}건 · 기제출 ${Object.keys(seen).length}건 · 대기 ${pending.length}건`);

if (pending.length === 0) {
  console.log('제출할 URL 없음.');
  process.exit(0);
}

const batch = pending.slice(0, LIMIT);
console.log(`\n오늘 제출 ${batch.length}건 (한도 ${LIMIT}) — 잔여 ${pending.length - batch.length}건은 다음 실행으로:`);
batch.forEach((e) => console.log(`  · ${decodeURIComponent(e.url)}  (lastmod ${e.lastmod || '없음'})`));

if (DRY) {
  console.log('\n[DRY_RUN] 실제 전송 안 함. 상태 파일도 안 건드림.');
  process.exit(0);
}

const res = await submit(batch.map((e) => e.url));
console.log(`\n[IndexNow] 응답 ${res.code} ${res.data || '(ok)'}`);

// 200 / 202 만 성공 처리 (그 외엔 다음 실행에서 재시도)
if (res.code === 200 || res.code === 202) {
  batch.forEach((e) => { seen[e.url] = e.lastmod; });
  state.submitted = seen;
  state.lastRun = new Date().toISOString();
  writeState(state);
  console.log(`상태 갱신 — 누적 ${Object.keys(seen).length}건`);
} else {
  console.log('성공 응답이 아니라 상태를 갱신하지 않음 (다음 실행에서 재시도).');
  process.exit(1);
}
