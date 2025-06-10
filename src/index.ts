import 'dotenv/config';

import { readFile, access } from 'fs/promises';
import http from 'http';
import https from 'https';

import { app } from '@/app';
import { logger } from '@/helpers/logger';

const pathToCert = process.env.PATH_TO_CERT;
const pathToKey = process.env.PATH_TO_KEY;

if (pathToCert && pathToKey) {
  Promise.all([
    access(pathToCert).then(() => readFile(pathToCert, 'utf-8')),
    access(pathToKey).then(() => readFile(pathToKey, 'utf-8')),
  ])
    .then(async ([cert, key]) => {
      https
        .createServer({ key, cert }, app)
        .once('listening', () =>
          logger(`HTTPS server is listening on https://${process.env.DOMAIN_NAME}:${process.env.PORT_HTTPS}`),
        )
        .listen(process.env.PORT_HTTPS)
        .on('error', (error) => logger.error('Failed to start HTTPS server due to:', error));
    })
    .catch((e) => {
      logger.error('Failed to start HTTPS server due to:', e);
    });
} else {
  logger('HTTPS server was not started because the certificate paths are missing');
}

http
  .createServer(app)
  .once('listening', () =>
    logger(`HTTP server is listening on http://${process.env.DOMAIN_NAME}:${process.env.PORT_HTTP}`),
  )
  .listen(process.env.PORT_HTTP)
  .on('error', (error) => logger.error('Failed to start HTTP server due to:', error));
