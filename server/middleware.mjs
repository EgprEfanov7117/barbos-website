import { createNotifications } from './notifications.mjs';
import { createLeadHandler } from './leads.mjs';

export function createLeadMiddleware(env) {
  const handle = createLeadHandler(createNotifications(env));
  const reply = (res, status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
  };
  return async (req, res, next) => {
    if (new URL(req.url, 'http://localhost').pathname !== '/api/leads') return next();
    if (req.method !== 'POST') return reply(res, 405, { ok: false, message: 'Метод не поддерживается.' });
    let origin;
    try { origin = new URL(req.headers.origin); } catch { return reply(res, 403, { ok: false, message: 'Отправьте заявку через форму сайта.' }); }
    const allowed = (env.LEAD_ALLOWED_ORIGINS || '').split(',').map(item => item.trim()).filter(Boolean);
    const sameOrigin = origin.host === req.headers.host && ['http:', 'https:'].includes(origin.protocol);
    if (!(allowed.length ? allowed.includes(origin.origin) : sameOrigin)) return reply(res, 403, { ok: false, message: 'Отправьте заявку через форму сайта.' });
    if (!req.headers['content-type']?.startsWith('application/json')) return reply(res, 415, { ok: false, message: 'Неверный формат запроса.' });
    try {
      const chunks = [];
      let length = 0;
      for await (const chunk of req) {
        length += Buffer.byteLength(chunk);
        if (length > 10000) return reply(res, 413, { ok: false, message: 'Сократите описание задачи.' });
        chunks.push(chunk);
      }
      let input;
      try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return reply(res, 400, { ok: false, message: 'Неверный формат заявки.' }); }
      // Never trust client-supplied forwarding headers as a rate-limit identity.
      const result = await handle(input, req.socket.remoteAddress || 'unknown');
      reply(res, result.status, result.body);
    } catch {
      // Raw provider errors can contain secret URLs or credentials; never log or return them.
      if (!res.headersSent) reply(res, 503, { ok: false, message: 'Отправка временно недоступна. Попробуйте ещё раз.' });
    }
  };
}
