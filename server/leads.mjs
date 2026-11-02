import { createHash } from 'node:crypto';
import { allServices, development, money } from '../src/data.js';

const directions = { development: 'Разработка', creative: 'Дизайн и креативы', complex: 'Комплекс' };
const fail = (status, code, message) => ({ status, body: { ok: false, code, message } });
export function validateLead(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('INVALID_INPUT');
  const clean = (value, max, required = false) => {
    if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error('INVALID_INPUT');
    const result = value.trim();
    if (required && !result) throw new Error('INVALID_INPUT');
    return result;
  };
  const name = clean(input.name, 120, true);
  const contact = clean(input.contact, 160, true);
  const task = clean(input.task, 1800);
  const id = clean(input.requestId, 36, true);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new Error('INVALID_INPUT');
  if (!Object.hasOwn(directions, input.direction)) throw new Error('INVALID_INPUT');
  const digits = (contact.match(/\d/g) || []).length;
  if (!/^@?[a-zA-Z][a-zA-Z0-9_]{3,31}$/.test(contact) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !(/^\+?[\d ()-]+$/.test(contact) && digits >= 7 && digits <= 15)) throw new Error('INVALID_INPUT');
  const service = input.serviceId ? allServices.find(item => item.id === input.serviceId) : null;
  if (input.serviceId && !service) throw new Error('INVALID_INPUT');
  if (service && input.direction !== (development.some(item => item.id === service.id) ? 'development' : 'creative')) throw new Error('INVALID_INPUT');
  const addon = input.addon || null;
  if (addon && (!service?.addon || service.addon !== addon)) throw new Error('INVALID_INPUT');
  const total = service?.price == null ? null : service.price + (addon === 'voice' ? 2000 : 0);
  return { id, name, contact, task, direction: input.direction, serviceId: service?.id || null, addon, total };
}

export function formatLead(lead) {
  const service = allServices.find(item => item.id === lead.serviceId);
  const quote = service ? `${service.name} — ${lead.total === null ? 'после оценки' : money(lead.total)}` : 'Индивидуальная задача';
  return [
    'NOVARY — новая заявка', `Номер: ${lead.id}`, `Имя: ${lead.name}`, `Контакт: ${lead.contact}`,
    `Направление: ${directions[lead.direction]}`, `Услуга: ${quote}`,
    lead.addon === 'cms' ? 'Самостоятельное редактирование: отдельный индивидуальный расчёт' : lead.addon === 'voice' ? 'AI-озвучка включена в сумму (+2 000 ₽)' : '',
    `Задача: ${lead.task || 'Обсудить при контакте'}`,
  ].filter(Boolean).join('\n');
}

// Per-process receipts live for 15 minutes, contain only a payload hash and channel states.
// A retry sends only to the channel that has not acknowledged the previous attempt.
export function createLeadHandler(notifications, { now = Date.now } = {}) {
  const receipts = new Map();
  const rates = new Map();
  const ttl = 15 * 60 * 1000;
  return async function handle(input, ip = 'local') {
    for (const [key, value] of receipts) if (now() - value.created > ttl && !value.pending) receipts.delete(key);
    for (const [key, value] of rates) if (now() - value.created > 10 * 60 * 1000) rates.delete(key);
    let lead;
    try { lead = validateLead(input); } catch { return fail(400, 'INVALID_INPUT', 'Проверьте имя, контакт и выбранную услугу.'); }
    if (input.website) return fail(400, 'INVALID_INPUT', 'Не удалось отправить заявку.');
    if (!notifications.configured) return fail(503, 'NOT_CONFIGURED', 'Отправка временно недоступна. Попробуйте позже.');
    const hash = createHash('sha256').update(JSON.stringify(lead)).digest('hex');
    let receipt = receipts.get(lead.id);
    if (receipt && receipt.hash !== hash) return fail(409, 'REQUEST_CONFLICT', 'Данные изменились. Обновите страницу и повторите отправку.');
    if (receipt?.pending) return receipt.pending;
    if (receipt?.telegram && receipt?.email) return { status: 200, body: { ok: true, requestId: lead.id } };
    const rate = rates.get(ip) || { count: 0, created: now() };
    if (rate.count >= 6 || receipts.size >= 10000 || rates.size >= 10000) return fail(429, 'RATE_LIMITED', 'Слишком много попыток. Повторите отправку через 10 минут.');
    rate.count += 1;
    rates.set(ip, rate);
    if (!receipt) {
      receipt = { hash, created: now(), telegram: false, email: false, pending: null };
      receipts.set(lead.id, receipt);
    }
    const text = formatLead(lead);
    receipt.pending = (async () => {
      await Promise.allSettled(['telegram', 'email'].filter(channel => !receipt[channel]).map(async channel => {
        await notifications[channel](text, lead);
        receipt[channel] = true;
      }));
      return receipt.telegram && receipt.email
        ? { status: 200, body: { ok: true, requestId: lead.id } }
        : fail(503, 'DELIVERY_FAILED', 'Не удалось завершить отправку. Попробуйте ещё раз — введённые данные сохранены.');
    })();
    try { return await receipt.pending; } finally { receipt.pending = null; }
  };
}
