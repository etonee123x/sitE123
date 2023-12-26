import express from 'express';
import { join } from 'path';
import ip from 'ip';
import { config } from 'dotenv-flow';

import routes from '@/routes';
import { envVarToBoolean } from '@/utils';

config();

const projectDir = process.cwd();

export const ports = {
  https: process.env.PORT_HTTPS ?? '8443',
  http: process.env.PORT_HTTP ?? '8080',
};

export const apiUrl = ip.address();

export const fullApiUrl = envVarToBoolean(process.env.SHOULD_USE_HTTP_API_URL)
  ? `http://${apiUrl}:${ports.http}`
  : `https://${process.env.DOMAIN_NAME ?? apiUrl}:${ports.https}`;

export const app = express()
  // посмотреть на что влияет и удалить по возможности
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
  .use((...[, res]) => {
    res.sendStatus(404);
  });
