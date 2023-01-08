import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import api from './routes/index.js';

const projectDir = join(dirname(fileURLToPath(import.meta.url)), '..');

export default express()
  .use(express.urlencoded({ limit: 1000 * 1024 * 1024, extended: true }))
  .use(express.json())
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  })
  .use('/static/', express.static(join(projectDir, 'static')))
  .use(express.static(join(projectDir, 'public')))
  .use(api)
  .use((req, res) => void res.sendStatus(404));
