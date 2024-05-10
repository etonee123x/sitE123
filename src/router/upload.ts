import { Router } from 'express';
import busboy from 'busboy';
import { upload } from '@/handlers';

const routerUpload = Router();

routerUpload.post('/', (req, res) => {
  const paths: Array<string> = [];

  req.pipe(
    busboy({ headers: req.headers })
      .on('file', (...args) => paths.push(upload(...args)))
      .on('close', () => res.send(paths)),
  );
});

export { routerUpload };
