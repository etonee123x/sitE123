import { readFileSync, existsSync } from 'fs';
import http from 'http';
import https from 'https';

import { app, ports, apiUrl } from '@/app';
import { logger } from '@/utils';

const pathToCert = String(process.env.PATH_TO_CERT);
const pathToKey = String(process.env.PATH_TO_KEY);

// Здесь надо параллельную проверку
if (existsSync(pathToCert) && existsSync(pathToKey)) {
  try {
    const credentials = {
      cert: String(readFileSync(pathToCert)),
      key: String(readFileSync(pathToKey)),
    };

    https
      .createServer(credentials, app)
      .once('listening', () => logger(`HTTPS server is listening on https://${apiUrl}:${ports.https}`))
      .listen(ports.https);
  } catch (e) {
    logger.error('Failed to start HTTPS server due to:', e);
  }
} else {
  logger.error('HTTPS server was not started because SSL certs were not found');
}

try {
  http
    .createServer(app)
    .once('listening', () => logger(`HTTP server is listening on http://${apiUrl}:${ports.http}`))
    .listen(ports.http);
} catch (e) {
  logger.error('Failed to start HTTP server due to:', e);
}
