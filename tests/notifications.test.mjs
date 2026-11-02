import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createNotifications } from '../server/notifications.mjs';
import { getSmtpSocket } from '../cloudflare/smtp-socket.mjs';

const env = {
  TELEGRAM_BOT_TOKEN: 'test', TELEGRAM_CHAT_ID: 'test',
  SMTP_HOST: 'smtp.example.com', SMTP_USER: 'test', SMTP_PASSWORD: 'test',
  LEAD_EMAIL_FROM: 'from@example.com', LEAD_EMAIL_TO: 'to@example.com',
};
const lead = { id: '12345678-test', contact: '@novary_test' };

test('SMTP transport retains provider identity and requires recipient acceptance', async () => {
  let accepted = ['to@example.com'];
  const notifications = createNotifications(env, {
    getSocket: getSmtpSocket,
    createTransport: options => {
      assert.equal(options.host, 'smtp.example.com');
      assert.equal(options.secure, true);
      assert.equal(options.getSocket, getSmtpSocket);
      assert.deepEqual(options.tls, { servername: 'smtp.example.com', rejectUnauthorized: true });
      return { sendMail: async () => ({ accepted }) };
    },
  });
  await notifications.email('Test only', lead);
  accepted = [];
  await assert.rejects(notifications.email('Test only', lead), /EMAIL_DELIVERY_FAILED/);
});

test('Edge socket reports secured connection only after successful TLS handshake', () => {
  const socket = new EventEmitter();
  let calls = 0;
  getSmtpSocket({ host: 'smtp.example.com', port: 465, connectionTimeout: 1000 }, (error, result) => {
    calls++;
    assert.equal(error, null);
    assert.equal(result.connection, socket);
    assert.equal(result.secured, true);
  }, options => {
    assert.deepEqual(options, { host: 'smtp.example.com', port: 465, servername: 'smtp.example.com', rejectUnauthorized: true });
    return socket;
  });
  assert.equal(calls, 0);
  socket.emit('secureConnect');
  assert.equal(calls, 1);
});

test('Edge socket propagates TLS rejection without reporting delivery or an insecure connection', () => {
  const socket = new EventEmitter();
  const certificateError = Object.assign(new Error('Certificate rejected'), { code: 'CERT_INVALID' });
  let calls = 0;
  getSmtpSocket({ host: 'smtp.example.com', port: 465, connectionTimeout: 1000 }, (error, result) => {
    calls++;
    assert.equal(error, certificateError);
    assert.equal(result, undefined);
  }, () => socket);
  socket.emit('error', certificateError);
  socket.emit('secureConnect');
  assert.equal(calls, 1);
});
