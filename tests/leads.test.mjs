import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createLeadHandler, formatLead, validateLead } from '../server/leads.mjs';

const input = (changes = {}) => ({ requestId: randomUUID(), name: 'Тест NOVARY', contact: '@novary_test', task: 'Проверка заявки', direction: 'creative', serviceId: 'video', addon: 'voice', ...changes });
const channels = (changes = {}) => ({ configured: true, telegram: async () => {}, email: async () => {}, ...changes });

test('server derives the price and add-on from the catalog, ignoring client quote', () => {
  const lead = validateLead(input({ total: 1, serviceName: 'Подмена' }));
  assert.equal(lead.total, 17000);
  assert.match(formatLead(lead), /17\u00a0000 ₽/);
  assert.match(formatLead(lead), /AI-озвучка включена/);
  const cms = validateLead(input({ direction: 'development', serviceId: 'site', addon: 'cms' }));
  assert.equal(cms.total, 50000);
  assert.match(formatLead(cms), /отдельный индивидуальный расчёт/);
  assert.equal(validateLead(input({ direction: 'development', serviceId: 'updates', addon: null })).total, null);
});

test('rejects invalid contact, add-on, direction, package and excessive input', () => {
  for (const bad of [{ contact: '....' }, { contact: '-------' }, { addon: 'cms' }, { direction: 'development' }, { serviceId: 'fake' }, { task: 'a'.repeat(1801) }, { requestId: 'bad' }, { name: '' }]) {
    assert.throws(() => validateLead(input(bad)));
  }
  assert.doesNotThrow(() => validateLead(input({ contact: 'demo@example.com' })));
  assert.doesNotThrow(() => validateLead(input({ contact: '+7 (999) 123-45-67' })));
});

test('success requires acknowledgments from both channels and duplicate requests do not resend', async () => {
  let telegram = 0, email = 0;
  const handle = createLeadHandler(channels({ telegram: async () => { telegram++; }, email: async () => { email++; } }));
  const lead = input();
  assert.equal((await handle(lead)).status, 200);
  assert.equal((await handle(lead)).status, 200);
  assert.deepEqual([telegram, email], [1, 1]);
  assert.equal((await handle({ ...lead, task: 'Изменено' })).status, 409);
});

test('partial failure retries only the failed channel, keeping the same request ID', async () => {
  let telegram = 0, email = 0;
  const handle = createLeadHandler(channels({ telegram: async () => { telegram++; }, email: async () => { if (++email === 1) throw new Error('temporary'); } }));
  const lead = input();
  const first = await handle(lead);
  assert.equal(first.status, 503);
  assert.equal(first.body.ok, false);
  assert.equal((await handle(lead)).status, 200);
  assert.deepEqual([telegram, email], [1, 2]);
});

test('parallel retries share a single in-flight delivery', async () => {
  let telegram = 0;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const handle = createLeadHandler(channels({ telegram: async () => { telegram++; await gate; } }));
  const lead = input();
  const first = handle(lead), second = handle(lead);
  release();
  assert.deepEqual((await Promise.all([first, second])).map(result => result.status), [200, 200]);
  assert.equal(telegram, 1);
});

test('invalid data, honeypot, missing configuration and rate limit cause no outbound message', async () => {
  let count = 0;
  const handle = createLeadHandler(channels({ telegram: async () => { count++; } }));
  assert.equal((await handle(input({ website: 'spam' }))).status, 400);
  assert.equal((await handle(input({ contact: '....' }))).status, 400);
  assert.equal(count, 0);
  const unavailable = createLeadHandler(channels({ configured: false, telegram: async () => { count++; } }));
  assert.equal((await unavailable(input())).status, 503);
  assert.equal(count, 0);
  for (let i = 0; i < 6; i++) assert.equal((await handle(input(), 'same-ip')).status, 200);
  assert.equal((await handle(input(), 'same-ip')).status, 429);
  assert.equal(count, 6);
});
