import { readFileSync, existsSync } from 'fs';
import http from 'http';
import https from 'https';

import { app, ports, apiUrl } from './app.js';
import { dtConsole } from './utils/index.js';

const pathToCert = String(process.env.PATH_TO_CERT);
const pathToKey = String(process.env.PATH_TO_KEY);

console.log(456);

if (existsSync(pathToCert) && existsSync(pathToKey)) {
  try {
    const credentials = {
      cert: String(readFileSync(pathToCert)),
      key: String(readFileSync(pathToKey)),
    };

    https
      .createServer(credentials, app)
      .once('listening', () => dtConsole.log(`HTTPS server is listening on https://${apiUrl}:${ports.https}`))
      .listen(ports.https);
  } catch (e) {
    dtConsole.error('Failed to start HTTPS server due to:', e);
  }
} else {
  dtConsole.error('HTTPS server was not started because SSL certs were not found');
}

try {
  http
    .createServer(app)
    .once('listening', () => dtConsole.log(`HTTP server is listening on http://${apiUrl}:${ports.http}`))
    .listen(ports.http);
} catch (e) {
  dtConsole.error('Failed to start HTTP server due to:', e);
}
