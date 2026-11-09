import test from 'node:test';
import assert from 'node:assert/strict';
import {analyticsTag,injectAnalytics} from '../scripts/analytics.mjs';

const ID = '00000000-0000-0000-0000-000000000000';
const CLOUD = 'https://cloud.umami.is/script.js';
const HTML = '<!doctype html><html><head><title>x</title></head><body></body></html>';

test('no id means no third-party script', () => {
  assert.equal(analyticsTag({}), '');
  assert.equal(analyticsTag({UMAMI_WEBSITE_ID: ''}), '');
  assert.equal(injectAnalytics(HTML, {}), HTML);
});

test('an opted-in deploy builds exactly one tag', () => {
  const tag = analyticsTag({UMAMI_WEBSITE_ID: ID});
  assert.equal(tag, `<script defer src="${CLOUD}" data-website-id="${ID}"></script>`);
  const out = injectAnalytics(HTML, {UMAMI_WEBSITE_ID: ID});
  assert.equal((out.match(/cloud\.umami\.is/g) || []).length, 1);
  assert.ok(out.includes(`${tag}\n</head>`));
  assert.equal(out.replace(tag, '').replace('  \n', ''), HTML);
});

test('self-hosted script url is supported', () => {
  assert.equal(
    analyticsTag({UMAMI_WEBSITE_ID: ID, UMAMI_SCRIPT_URL: 'https://stats.example.com/script.js'}),
    `<script defer src="https://stats.example.com/script.js" data-website-id="${ID}"></script>`);
});

test('invalid ids, urls and head structure are rejected', () => {
  assert.throws(() => analyticsTag({UMAMI_WEBSITE_ID: 'not-a-uuid'}), /UUID/);
  assert.throws(() => analyticsTag({UMAMI_WEBSITE_ID: ID, UMAMI_SCRIPT_URL: 'http://insecure.example.com/s.js'}), /https/);
  assert.throws(() => analyticsTag({UMAMI_WEBSITE_ID: ID, UMAMI_SCRIPT_URL: 'https://x.example.com/s.js" onload="bad()'}), /https/);
  assert.throws(() => injectAnalytics('<head></head></head>', {UMAMI_WEBSITE_ID: ID}), /<\/head>/);
});
