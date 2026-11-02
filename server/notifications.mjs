import nodemailer from 'nodemailer';

export function createNotifications(env, { getSocket, createTransport = nodemailer.createTransport } = {}) {
  const required = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'LEAD_EMAIL_FROM', 'LEAD_EMAIL_TO'];
  const configured = required.every(key => env[key]?.trim());
  const smtpOptions = {
    port: Number(env.SMTP_PORT || 465), secure: true,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000,
    logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true,
  };
  return {
    configured,
    async telegram(text) {
      const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error('TELEGRAM_DELIVERY_FAILED');
    },
    async email(text, lead) {
      const mail = createTransport({
        ...smtpOptions, host: env.SMTP_HOST,
        tls: { servername: env.SMTP_HOST, rejectUnauthorized: true },
        ...(getSocket ? { getSocket } : {}),
      });
      const result = await mail.sendMail({
        from: { name: 'NOVARY', address: env.LEAD_EMAIL_FROM }, to: env.LEAD_EMAIL_TO,
        subject: `NOVARY — новая заявка ${lead.id.slice(0, 8)}`,
        text, ...(lead.contact.includes('@') && !lead.contact.startsWith('@') ? { replyTo: lead.contact } : {}),
      });
      if (!result.accepted?.some(address => address.toLowerCase() === env.LEAD_EMAIL_TO.toLowerCase())) {
        throw new Error('EMAIL_DELIVERY_FAILED');
      }
    },
  };
}
