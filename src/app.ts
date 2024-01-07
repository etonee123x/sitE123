import express from 'express';
import { join } from 'path';
import ip from 'ip';
import { config } from 'dotenv-flow';

import { router } from '@/router';
import { envVarToBoolean } from '@/utils';
import { logger, errorHandler, cors, send404 } from '@/middleware';

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
  .use(express.json())
  .use(cors)
  .use('/content/', express.static(join(projectDir, 'content')))
  .use(express.static(join(projectDir, 'public')))
  .use(logger)
  .use(router)
  .use(errorHandler)
  .use(send404);
