import { readFile, access } from 'fs/promises';
import http from 'http';
import https from 'https';

import { app, ports, apiUrl } from '@/app';
import { logger } from '@/utils';

const pathToCert = String(process.env.PATH_TO_CERT);
const pathToKey = String(process.env.PATH_TO_KEY);

Promise.all([
  access(pathToCert).then(() => String(readFile(pathToCert))),
  access(pathToKey).then(() => String(readFile(pathToKey))),
]).then(async ([cert, key]) => {
  https
    .createServer({ key, cert }, app)
    .once('listening', () => logger(`HTTPS server is listening on https://${apiUrl}:${ports.https}`))
    .listen(ports.https)
    .on('error', (error) => logger.error('Failed to start HTTPS server due to:', error));
}).catch(() => {
  logger.error('HTTPS server was not started because SSL certs were not found or not accessable');
});

http
  .createServer(app)
  .once('listening', () => logger(`HTTP server is listening on http://${apiUrl}:${ports.http}`))
  .listen(ports.http)
  .on('error', (error) => logger.error('Failed to start HTTP server due to:', error));
