import app from './app.js';
import http from 'http';
import https from 'https';
import ip from 'ip';
import { readFileSync, existsSync } from 'fs';
import { dtConsole, envVarToBoolean } from './utils/index.js';

import { config } from 'dotenv-flow';
config();

const ports = {
  https: process.env.PORT_HTTPS ?? '8443',
  http: process.env.PORT_HTTP ?? '8080',
};

const apiUrl = ip.address();
export const fullApiUrl = envVarToBoolean(process.env.SHOULD_USE_HTTP_ONLY)
  ? `http://${apiUrl}:${ports.http}`
  : `https://${process.env.DOMAIN_NAME ?? apiUrl}:${ports.https}`;

const pathToCert = String(process.env.PATH_TO_CERT);
const pathToKey = String(process.env.PATH_TO_KEY);

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
