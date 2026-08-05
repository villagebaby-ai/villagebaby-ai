#!/usr/bin/env node
/**
 * submit-urls.mjs
 * GitHub Actions 빌드 후 자동 실행.
 * 변경된 MDX 파일을 감지해 URL 변환 후 3종 검색엔진에 자동 제출.
 *
 * - IndexNow: 신규/수정 URL 즉시 색인 요청
 *   → 참여 엔진(Bing·Yandex·Naver·Seznam·Yep)에 함께 전달된다.
 *
 * ⚠️ 2026-08-05 확인 — 아래 두 경로는 제거했다. 살아있는 줄 알고 뒀지만 죽은 코드였다.
 *   · Google sitemap ping: 구글이 2023-06 에 폐기 → 프로덕션 로그에서 계속 404
 *   · Naver  sitemap ping: 같은 로그에서 404
 *   구글은 IndexNow 를 지원하지 않으므로 사이트맵 수집이 유일한 경로다.
 *   (구글 Indexing API 는 JobPosting/BroadcastEvent 전용 — 일반 콘텐츠에 쓰면 정책 위반)
 */

import { execSync } from 'child_process';
import https from 'https';

const SITE = 'https://villagebaby.kr';
const INDEXNOW_KEY = '4b9f2c5e7a1d8b3f6e0c9a7d2b5e8f3c';

// ─── 변경된 MDX 파일 감지 ───────────────────────────────────────────────────
function getChangedMdxFiles() {
  const before = process.env.BEFORE_SHA || '';
  const after  = process.env.AFTER_SHA  || '';
  const empty  = '0'.repeat(40);

  try {
    let cmd;
    if (before && before !== empty && after && after !== empty) {
      // 트리거 커밋 기준 diff
      cmd = `git diff --name-only "${before}" "${after}" -- "magazine-src/src/content/articles/"`;
    } else {
      // fallback: HEAD~1 ~ HEAD
      cmd = `git diff --name-only HEAD~1 HEAD -- "magazine-src/src/content/articles/"`;
    }
    const output = execSync(cmd, { encoding: 'utf8' }).trim();
    return output ? output.split('\n').filter(f => f.endsWith('.mdx')) : [];
  } catch (e) {
    console.warn('MDX diff 감지 실패 (무시):', e.message);
    return [];
  }
}

// ─── MDX 경로 → 퍼블릭 URL 변환 ────────────────────────────────────────────
// magazine-src/src/content/articles/{pillar}/{slug}.mdx
// → https://villagebaby.kr/magazine/{pillar}/{encodeSlug}/
function mdxToUrl(filePath) {
  const m = filePath.match(
    /magazine-src\/src\/content\/articles\/([^/]+)\/(.+)\.mdx$/
  );
  if (!m) return null;
  const [, pillar, slug] = m;
  // Astro 5는 content slug를 소문자로 정규화
  const encodedSlug = encodeURIComponent(slug.toLowerCase());
  return `${SITE}/magazine/${pillar}/${encodedSlug}/`;
}

// ─── IndexNow (Bing / Yandex) ───────────────────────────────────────────────
async function submitIndexNow(urlList) {
  if (urlList.length === 0) return;

  const body = JSON.stringify({
    host: 'villagebaby.kr',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList,
  });

  console.log(`\n[IndexNow] 제출 URL ${urlList.length}개:`);
  urlList.forEach(u => console.log('  -', u));

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
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        console.log(`[IndexNow] 응답: ${res.statusCode}`, data.trim() || '(ok)');
        resolve(res.statusCode);
      });
    });
    req.on('error', e => {
      console.warn('[IndexNow] 오류:', e.message);
      resolve(null);
    });
    req.setTimeout(15_000, () => {
      req.destroy();
      console.warn('[IndexNow] 타임아웃');
      resolve(null);
    });
    req.write(body);
    req.end();
  });
}

// ─── main ────────────────────────────────────────────────────────────────────
console.log('\n=== 검색엔진 URL 자동 제출 시작 ===');

const changedMdx = getChangedMdxFiles();
console.log('변경된 MDX 파일:', changedMdx.length ? changedMdx : '(없음)');

const articleUrls = changedMdx.map(mdxToUrl).filter(Boolean);
const submitUrls  = [`${SITE}/magazine/`, ...articleUrls];

// IndexNow 제출
await submitIndexNow(submitUrls);

console.log('\n=== 제출 완료 ===\n');
