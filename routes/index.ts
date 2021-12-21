import { Router, Request, Response } from 'express';

import GetFolderData from '../functions/GetFolderData.js';
import HappyNorming from '../functions/HappyNorming.js';
import FunnyAnimals from '../functions/FunnyAnimals.js';
import RMSHandler from '../functions/RMSHandler.js';

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
  console.log('New request to /funny-animals/:');
  try {
    const funnyAnimals = new FunnyAnimals();
    res.type('image/jpeg').send(funnyAnimals.getPhoto());
  } catch (e) {
    res.status(500).send(`error: ${(e as Error).message}`);
  }
});
router.post('/rms-handler', async function(req: Request, res: Response) {
  try {
    res.send(
      new RMSHandler()
        .fromBuffer(req.body.data.data)
        .getRms()
        .formInfo(),
    );
  } catch (e) {
    res.send(e);
  }
});

/* router.get('/test', async(req: Request, res: Response) => {
  const data = readFileSync('./content/finalTest.wav');
  console.log('data size:', data.length);
  const response = await axios.post('http://localhost:3001/rms-handler'
    , { data }
    , { maxBodyLength: Infinity });
  res.send(response.data);
}); */

export default router;
