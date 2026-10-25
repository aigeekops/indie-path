#!/usr/bin/env node
// 逐条实测 content/sources 里的原始链接，输出可复跑的核验表。
// 用法：
//   node scripts/verify-sources.mjs              全部资料
//   node scripts/verify-sources.mjs cn- alipay   只核 id 含这些关键字的资料
//   node scripts/verify-sources.mjs --json       输出机器可读结果
// 出口码始终为 0：这是取证工具，不是测试断言。链接失效由人判断如何处理。

import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourcesDir = path.join(root, 'content', 'sources');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const asMarkdown = args.includes('--markdown');
const strict = args.includes('--strict');
const filters = args.filter(a => !a.startsWith('--'));
// 超过这个天数没重新核验的政策类资料，提示人工复核。政策会变，链接活着不代表口径没变。
const STALE_DAYS = 180;
const dayMs = 24 * 60 * 60 * 1000;
const staleDays = date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null;
  return Math.floor((Date.now() - new Date(date + 'T00:00:00Z').getTime()) / dayMs);
};

const extract = (text, key) => {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
};

const unquote = value => value.replace(/^["']|["']$/g, '').trim();

async function loadSources() {
  const files = (await readdir(sourcesDir)).filter(f => f.endsWith('.md')).sort();
  const out = [];
  for (const file of files) {
    const text = await readFile(path.join(sourcesDir, file), 'utf8');
    const url = unquote(extract(text, 'url') || '');
    if (!url) continue;
    out.push({id: extract(text, 'id') || path.basename(file, '.md'), file, url, checkedAt: extract(text, 'checked_at')});
  }
  return out;
}

async function probe(url) {
  const controller = AbortSignal.timeout(20000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller,
      headers: {'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
    });
    const body = await res.text().catch(() => '');
    const found = body.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i);
    const title = found ? found[1].replace(/\s+/g, ' ').trim().slice(0, 60) : '';
    return {status: res.status, title};
  } catch (error) {
    return {status: 0, title: '', error: error.name === 'TimeoutError' ? '超时' : error.message};
  }
}

const sources = await loadSources();
const targets = filters.length ? sources.filter(s => filters.some(f => s.id.includes(f) || s.url.includes(f) || s.file.includes(f))) : sources;

const results = [];
let cursor = 0;
const workers = 6;
async function work() {
  while (cursor < targets.length) {
    const item = targets[cursor++];
    const probeResult = await probe(item.url);
    results.push({...item, ...probeResult});
  }
}
await Promise.all(Array.from({length: Math.min(workers, targets.length)}, work));
results.sort((a, b) => a.id.localeCompare(b.id));

const annotated = results.map(r => ({...r, ageDays: staleDays(r.checkedAt)}));
// 403/429/503 通常是反爬、验证码或限流，不等于链接失效，单独列出由人打开确认。
const BLOCKED = [403, 429, 503];
const broken = annotated.filter(r => r.status !== 200 && !BLOCKED.includes(r.status));
const blocked = annotated.filter(r => BLOCKED.includes(r.status));
const stale = annotated.filter(r => r.status === 200 && r.ageDays !== null && r.ageDays > STALE_DAYS);
const summary = {total: annotated.length, ok: annotated.length - broken.length - blocked.length, broken: broken.length, blocked: blocked.length, stale: stale.length};

if (asJson) {
  console.log(JSON.stringify({summary, broken, stale, results: annotated}, null, 2));
} else if (asMarkdown) {
  const row = r => `| ${r.status || 'ERR'} | \`${r.id}\` | ${r.checkedAt || '—'} | ${r.ageDays === null ? '—' : r.ageDays} | ${(r.title || r.error || '（未取到标题）').replace(/\|/g, '\\|')} |`;
  console.log(`## 资料核验 ${summary.total} 份`);
  console.log('');
  console.log(`- 入口返回 200：${summary.ok} 份`);
  console.log(`- 链接失效：${summary.broken} 份`);
  console.log(`- 被拒绝或限流（需人工打开确认）：${summary.blocked} 份`);
  console.log(`- 超过 ${STALE_DAYS} 天未重新核验：${summary.stale} 份`);
  console.log('');
  if (broken.length) {
    console.log('### 链接失效');
    console.log('');
    console.log('| 状态 | 资料 id | 上次核验 | 距今(天) | 说明 |');
    console.log('|---|---|---|---|---|');
    for (const r of broken) console.log(row(r));
    console.log('');
  }
  if (blocked.length) {
    console.log('### 被拒绝或限流（多半是反爬或验证码，不等于失效）');
    console.log('');
    console.log('| 状态 | 资料 id | 上次核验 | 距今(天) | 说明 |');
    console.log('|---|---|---|---|---|');
    for (const r of blocked) console.log(row(r));
    console.log('');
  }
  if (stale.length) {
    console.log(`### 超过 ${STALE_DAYS} 天未重新核验（政策可能已变）`);
    console.log('');
    console.log('| 状态 | 资料 id | 上次核验 | 距今(天) | 页面标题 |');
    console.log('|---|---|---|---|---|');
    for (const r of stale) console.log(row(r));
    console.log('');
  }
  console.log('返回 200 只代表入口可达，不等于页面内容已被逐条核对；政策口径以官方页面为准。');
} else {
  const bad = results.filter(r => r.status !== 200);
  console.log(`核验 ${results.length} 份资料 · 返回 200 的 ${results.length - bad.length} 份`);
  console.log('');
  const pad = (value, width) => String(value) + ' '.repeat(Math.max(0, width - [...String(value)].length));
  console.log(pad('状态', 6) + pad('资料 id', 30) + '页面标题');
  console.log('-'.repeat(100));
  for (const r of results) {
    const mark = r.status === 200 ? '200' : String(r.status || 'ERR');
    console.log(pad(mark, 6) + pad(r.id, 30) + (r.title || r.error || '（未取到标题）'));
  }
  if (bad.length) {
    console.log('');
    console.log('需要人工复核：');
    for (const r of bad) console.log(`  ${r.id} → ${r.url}${r.error ? '（' + r.error + '）' : ''}`);
  }
  console.log('');
  if (stale.length) {
    console.log('');
    console.log(`超过 ${STALE_DAYS} 天未重新核验（政策可能已变，需人工复核）：`);
    for (const r of stale) console.log(`  ${r.id} → 上次核验 ${r.checkedAt}（${r.ageDays} 天前）`);
  }
  console.log('');
  console.log('注意：返回 200 只代表入口可达，不等于页面内容已被逐条核对。');
}
// 默认不阻断：外部站点可达性不是本仓库的代码质量。本地可用 --strict 让它因失效或过期而失败。
if (strict && (broken.length || stale.length)) process.exit(1);
