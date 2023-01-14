import app from './app.js';
import http from 'http';
import https from 'https';
import ip from 'ip';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { dtConsole } from './utils/index.js';

const ports = {
  https: process.env.PORT_HTTPS ?? '8443',
  http: process.env.PORT_HTTP ?? '8080',
};

const apiUrl = ip.address();
export const fullHttpsApiUrl = `https://${process.env.DOMAIN_NAME ?? apiUrl}:${ports.https}`;

try {
  const credentials = {
    cert: readFileSync('/etc/pki/tls/certs/localhost.crt', 'utf-8'),
    key: readFileSync('/etc/pki/tls/private/localhost.key', 'utf-8'),
  };

  https
    .createServer(credentials, app)
    .once('listening', () => dtConsole.log(`HTTPS server is listening on https://${apiUrl}:${ports.https}`))
    .listen(ports.https);
} catch (e) {
  dtConsole.error('Failed to start HTTPS server due to:', e);
}

http
  .createServer(app)
  .once('listening', () => dtConsole.log(`HTTP server is listening on http://${apiUrl}:${ports.http}`))
  .listen(ports.http);
