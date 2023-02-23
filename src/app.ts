import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import ip from 'ip';

import routes from './routes/index.js';
import { envVarToBoolean } from './utils/index.js';

import { config } from 'dotenv-flow';
config();

const projectDir = join(dirname(fileURLToPath(import.meta.url)), '..');

export const ports = {
  https: process.env.PORT_HTTPS ?? '8443',
  http: process.env.PORT_HTTP ?? '8080',
};

export const apiUrl = ip.address();

export const fullApiUrl = envVarToBoolean(process.env.SHOULD_USE_HTTP_ONLY)
  ? `http://${apiUrl}:${ports.http}`
  : `https://${process.env.DOMAIN_NAME ?? apiUrl}:${ports.https}`;

export const app = express()
  .use(express.urlencoded({ limit: 1000 * 1024 * 1024, extended: true }))
  .use(express.json())
  .use((...[, res, next]) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  })
  .use('/content/', express.static(join(projectDir, 'content')))
  .use(express.static(join(projectDir, 'public')))
  .use(routes)
  .use((...[, res]) => void res.sendStatus(404));
