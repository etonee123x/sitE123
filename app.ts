import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ limit: 1000 * 1024 * 1024, extended: true }));
app.use(express.json({ limit: 1000 * 1024 * 1024 }));

app.use('/', indexRouter);
export default app;
