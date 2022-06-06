import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes/index.js';
const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
const app = express();
app
    .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
})
    .use(express.static(path.join(__dirname, '../public')))
    .use(express.urlencoded({ limit: 1000 * 1024 * 1024, extended: true }))
    .use('/', indexRouter)
    .use((req, res) => {
    res.sendStatus(404);
})
    .set('view engine', 'pug');
export default app;
