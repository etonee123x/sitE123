import express from 'express';
import { join } from 'path';

import { router } from '@/router';
import { logger, errorHandler, cors, send404 } from '@/middleware';
import { UploadController } from '@/helpers/databaseController';

const projectDir = process.cwd();

export const app = express()
  .use(express.json())
  .use(cors)
  .use('/content', express.static(join(projectDir, 'content')))
  .use(`/${UploadController.PATH_UPLOADS}`, express.static(join(projectDir, UploadController.pathUploadsFull)))
  .use(express.static(join(projectDir, 'public')))
  .use(logger)
  .use(router)
  .use(errorHandler)
  .use(send404);
