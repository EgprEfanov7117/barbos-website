import { connect } from 'node:tls';

// Let the edge runtime resolve and connect to the provider hostname itself.
// This avoids Nodemailer's OS interface probes and keeps TLS verification on.
export function getSmtpSocket(options, callback, connectTLS = connect) {
  let settled = false;
  const socket = connectTLS({
    host: options.host, port: options.port,
    servername: options.host, rejectUnauthorized: true,
  });
  const timer = setTimeout(() => {
    const error = Object.assign(new Error('SMTP connection timeout'), { code: 'ETIMEDOUT' });
    finish(error);
    socket.destroy();
  }, options.connectionTimeout);
  const finish = error => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    socket.removeListener('error', finish);
    callback(error, error ? undefined : { connection: socket, secured: true });
  };
  socket.once('error', finish);
  socket.once('secureConnect', () => finish(null));
}
