import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { handleCloudflareLead } from '../cloudflare/leads.mjs';

function setup() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../cloudflare/schema.sql', import.meta.url), 'utf8'));
  const LEADS_DB = { prepare(sql) { return { bind(...params) { return { async run() { const r = sqlite.prepare(sql).run(...params); return { meta: { changes: Number(r.changes) } }; }, async first() { return sqlite.prepare(sql).get(...params) || null; } }; } }; } };
  return { env: { LEADS_DB, TELEGRAM_BOT_TOKEN: 'test-only-salt' }, context: { waitUntil(promise) { promise.catch(() => {}); } } };
}
const data = () => ({ requestId: randomUUID(), name: 'Тест', contact: '@barbos_test', task: 'Проверка', direction: 'creative', serviceId: 'video', addon: 'voice' });
const request = (body, headers = {}, url = 'https://novary.pages.dev/api/leads') => new Request(url, { method: 'POST', headers: { origin: new URL(url).origin, 'content-type': 'application/json', 'CF-Connecting-IP': '192.0.2.1', ...headers }, body: JSON.stringify(body) });

test('Cloudflare receipts survive handler instances and retry only failed transport', async () => {
  const { env, context } = setup();
  let telegram = 0, email = 0;
  const channels = { configured: true, telegram: async () => { telegram++; }, email: async () => { if (++email === 1) throw new Error('temporary'); } };
  const lead = data();
  assert.equal((await handleCloudflareLead(request(lead), env, context, channels)).status, 503);
  assert.equal((await handleCloudflareLead(request(lead), { ...env }, context, channels)).status, 200);
  assert.equal((await handleCloudflareLead(request(lead), { ...env }, context, channels)).status, 200);
  assert.deepEqual([telegram, email], [1, 2]);
  assert.equal((await handleCloudflareLead(request({ ...lead, task: 'Изменено' }), env, context, channels)).status, 409);
});

test('Cloudflare rejects cross-origin, invalid data and oversized body before delivery', async () => {
  const { env, context } = setup();
  let count = 0;
  const channels = { configured: true, telegram: async () => { count++; }, email: async () => { count++; } };
  assert.equal((await handleCloudflareLead(request(data(), { origin: 'https://example.com' }), env, context, channels)).status, 403);
  assert.equal((await handleCloudflareLead(request({ ...data(), contact: '....' }), env, context, channels)).status, 400);
  assert.equal((await handleCloudflareLead(request({ ...data(), website: 'spam' }), env, context, channels)).status, 400);
  assert.equal((await handleCloudflareLead(request({ ...data(), task: 'x'.repeat(11000) }), env, context, channels)).status, 413);
  assert.equal(count, 0);
});

test('Cloudflare rate limiting is persisted across requests and stores no raw IP or content', async () => {
  const { env, context } = setup();
  const channels = { configured: true, telegram: async () => {}, email: async () => {} };
  for (let i = 0; i < 6; i++) assert.equal((await handleCloudflareLead(request(data()), env, context, channels)).status, 200);
  assert.equal((await handleCloudflareLead(request(data()), { ...env }, context, channels)).status, 429);
  const receipt = await env.LEADS_DB.prepare('SELECT * FROM lead_receipts LIMIT ?').bind(1).first();
  assert.ok(receipt.payload_hash);
  assert.equal('contact' in receipt, false);
  assert.equal('task' in receipt, false);
  const limit = await env.LEADS_DB.prepare('SELECT * FROM lead_limits LIMIT ?').bind(1).first();
  assert.equal(limit.key.includes('192.0.2.1'), false);
});
