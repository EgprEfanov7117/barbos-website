import { createHash } from 'node:crypto';
import { getSmtpSocket } from './smtp-socket.mjs';
import { validateLead, formatLead } from '../server/leads.mjs';
import { createNotifications } from '../server/notifications.mjs';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const error = (status, message) => json(status, { ok: false, message });
const digest = value => createHash('sha256').update(value).digest('hex');

export async function handleCloudflareLead(request, env, context, notifications = createNotifications(env, {
  getSocket: getSmtpSocket,
})) {
  if (request.method !== 'POST') return error(405, 'Метод не поддерживается.');
  const url = new URL(request.url);
  const trustedHost = url.hostname === 'novary.pages.dev' || url.hostname.endsWith('.novary.pages.dev') || ['localhost', '127.0.0.1'].includes(url.hostname);
  if (!trustedHost || request.headers.get('origin') !== url.origin) return error(403, 'Отправьте заявку через форму сайта.');
  if (!request.headers.get('content-type')?.startsWith('application/json')) return error(415, 'Неверный формат запроса.');
  let input, lead;
  try {
    const reader = request.body?.getReader();
    if (!reader) return error(400, 'Неверный формат заявки.');
    const chunks = [];
    let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 10000) { await reader.cancel(); return error(413, 'Сократите описание задачи.'); }
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const part of chunks) { bytes.set(part, offset); offset += part.byteLength; }
    input = JSON.parse(new TextDecoder().decode(bytes));
    lead = validateLead(input);
    if (input.website) throw new Error('HONEYPOT');
  } catch { return error(400, 'Проверьте имя, контакт и выбранную услугу.'); }
  if (!notifications.configured || !env.LEADS_DB) return error(503, 'Отправка временно недоступна. Попробуйте позже.');
  const db = env.LEADS_DB;
  const now = Date.now();
  const hash = digest(JSON.stringify(lead));
  let locked = false;
  try {
    context.waitUntil(Promise.all([
      db.prepare('DELETE FROM lead_receipts WHERE expires_at < ? AND lease_until < ?').bind(now, now).run(),
      db.prepare('DELETE FROM lead_limits WHERE expires_at < ?').bind(now).run(),
    ]).catch(() => {}));
    await db.prepare('INSERT OR IGNORE INTO lead_receipts (id,payload_hash,expires_at) VALUES (?,?,?)').bind(lead.id, hash, now + 86400000).run();
    const receipt = await db.prepare('SELECT * FROM lead_receipts WHERE id = ?').bind(lead.id).first();
    if (receipt.payload_hash !== hash) return error(409, 'Данные изменились. Обновите страницу и повторите отправку.');
    if (receipt.telegram && receipt.email) return json(200, { ok: true, requestId: lead.id });
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = digest(`${env.TELEGRAM_BOT_TOKEN}:${ip}:${Math.floor(now / 600000)}`);
    const rate = await db.prepare('INSERT INTO lead_limits (key,hits,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits').bind(key, now + 600000).first();
    if (rate.hits > 6) return error(429, 'Слишком много попыток. Повторите отправку через 10 минут.');
    const claim = await db.prepare('UPDATE lead_receipts SET lease_until=? WHERE id=? AND lease_until<=?').bind(now + 90000, lead.id, now).run();
    if (!claim.meta.changes) return error(409, 'Заявка ещё отправляется. Подождите немного и повторите попытку.');
    locked = true;
    const text = formatLead(lead);
    await Promise.allSettled(['telegram', 'email'].filter(channel => !receipt[channel]).map(async channel => {
      try {
        await notifications[channel](text, lead);
        await db.prepare(`UPDATE lead_receipts SET ${channel}=1 WHERE id=?`).bind(lead.id).run();
      } catch (reason) {
        // Only diagnostic categories: never log recipient, message, or raw errors.
        console.warn(JSON.stringify({
          event: 'lead_delivery_failed',
          channel,
          code: /^[A-Z_0-9]+$/.test(reason?.code || '') ? reason.code : 'UNKNOWN',
          smtpStatus: Number(reason?.responseCode) || null,
          phase: /^[A-Z ]+$/.test(reason?.command || '') ? reason.command : null,
          detail: ['proxy request failed', 'network connection lost', 'TLS', 'certificate', 'socket', 'closed', 'connect', 'timeout', 'SNI', 'IP address', 'not implemented', 'unsupported']
            .filter(term => String(reason?.message || '').toLowerCase().includes(term.toLowerCase())),
          category: /spam|suspicious|policy/i.test(reason?.response || '') ? 'policy'
            : /authentication|credentials|authorization/i.test(reason?.response || '') ? 'auth' : 'other',
        }));
      }
    }));
    const result = await db.prepare('SELECT telegram,email FROM lead_receipts WHERE id=?').bind(lead.id).first();
    return result.telegram && result.email
      ? json(200, { ok: true, requestId: lead.id })
      : error(503, 'Не удалось завершить отправку. Попробуйте ещё раз — введённые данные сохранены.');
  } catch {
    return error(503, 'Отправка временно недоступна. Попробуйте ещё раз.');
  } finally {
    if (locked) await db.prepare('UPDATE lead_receipts SET lease_until=0 WHERE id=?').bind(lead.id).run().catch(() => {});
  }
}
