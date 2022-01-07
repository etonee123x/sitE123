import { Router, Request, Response } from 'express';

import GetFolderData from '../functions/GetFolderData.js';
import HappyNorming from '../functions/HappyNorming.js';
import FunnyAnimals from '../functions/FunnyAnimals.js';
import RMSHandler from '../functions/RMSHandler.js';
import Parser from '../functions/Parser.js';
import Index from '../functions/YaSearch/index.js';
// import { readFileSync } from 'fs';
// import axios from 'axios';

const router = Router();

router.get('/get-folder-data/*', async function(req: Request, res: Response) {
  console.log(`New request to /get-folder-data/: ${req.params[0] || '/'}`);
  try {
    const getFolderData = new GetFolderData('public/content');
    await getFolderData.newRequest(req.params[0]);
    res.send(getFolderData.data);
  } catch (e) {
    res.status(500).send(`error: ${(e as Error).message}`);
  }
});

router.get('/happy-norming/', async function(req: Request, res: Response) {
  console.log('New request to /happy-norming/:', req.query);
  try {
    const happyNorming = new HappyNorming(req.query.dotw as string);
    res.type('image/jpeg').send(happyNorming.getPhoto());
  } catch (e) {
    res.status(500).send(`error: ${(e as Error).message}`);
  }
});

router.get('/funny-animals/', async function(req: Request, res: Response) {
  console.log('New request to /funny-animals/');
  try {
    const funnyAnimals = new FunnyAnimals();
    res.type('image/jpeg').send(funnyAnimals.getPhoto());
  } catch (e) {
    res.status(500).send(`error: ${(e as Error).message}`);
  }
});

router.post('/rms-handler/', async function(req: Request, res: Response) {
  console.log('new request to /rms-handler/');
  try {
    res.send(
      new RMSHandler()
        .fromBuffer(req.body.data.data)
        .getRms()
        .formInfo(),
    );
  } catch (e) {
    console.log('failed:', e);
    res.send(e);
  }
});

router.post('/parser/', async function(req: Request, res: Response) {
  console.log('new request to /parser/:', req.body);
  try {
    const parser = new Parser(req.body.options, req.body.id);
    await parser.init();
    res.json(await parser.parse());
  } catch (e) {
    console.log('failed:', e);
    res.send(e);
  }
});

router.get('/search/', async(req: Request, res: Response) => {
  console.log('New request to /search/:', req.query);
  if (!req.query.q) {
    res.json('nothing to search!');
  }
  const yaSearch = new Index(req.query.q as string);
  await yaSearch.search();
  res.json(yaSearch.getResults());
});

/* router.get('/test/', async(req: Request, res: Response) => {
  const options = readFileSync('./content/options.js');
  const id = 'test';
  res.json(
    await axios.post('http://localhost:3001/parser/', {
      options, id,
    }, { maxBodyLength: Infinity })
      .then(r => r.data),
  );
}); */

export default router;
