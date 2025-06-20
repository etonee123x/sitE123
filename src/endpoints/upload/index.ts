import { Router } from 'express';
import busboy from 'busboy';
import { checkAuth } from '@/middleware';
import { UploadController } from '@/helpers/databaseController';

const router = Router();

router.post('/', checkAuth, (req, res) => {
  const paths: Array<string> = [];

  req.pipe(
    busboy({ headers: req.headers })
      .on('file', (...args) => paths.push(UploadController.uploadFile(...args)))
      .on('close', () => res.send(paths)),
  );
});

export { router };
