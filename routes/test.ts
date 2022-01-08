import { Router, Request, Response } from 'express';

import { readFileSync } from 'fs';
import axios from 'axios';

const router = Router();

router.get('/test/', async(req: Request, res: Response) => {
  const options = readFileSync('./content/options.js');
  const id = 'test';
  res.json(
    await axios.post('http://localhost:3001/parser/', {
      options, id,
    }, { maxBodyLength: Infinity })
      .then(r => r.data),
  );
});
