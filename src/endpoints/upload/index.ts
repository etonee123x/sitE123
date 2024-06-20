import { Router } from 'express';
import busboy from 'busboy';
import { handler } from './handlers';
import { checkAuth } from '@/middleware';

const router = Router();

router.post('/', checkAuth, (req, res) => {
  const paths: Array<string> = [];

  req.pipe(
    busboy({ headers: req.headers })
      .on('file', (...args) => paths.push(handler(...args)))
      .on('close', () => res.send(paths)),
  );
});

export { router as upload };
