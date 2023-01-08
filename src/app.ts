import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import api from './routes/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express()
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  })
  .use(express.urlencoded({ limit: 1000 * 1024 * 1024, extended: true }))
  .use(express.json())
  .use('/static/', express.static(join(__dirname, '..', 'static')))
  .use(express.static(join(__dirname, '..', 'public')))
  .use(api)
  .use((req, res) => {
    res.sendStatus(404);
  });
export default app;
