import express from 'express';

import GetFolderData from '../functions/GetFolderData.js';

const router = express.Router();
const getFolderData = new GetFolderData('public/content');

// resolves any url
router.get('/get_folder_data/*', async function(req, res) {
  console.log(`New request: ${req.params[0] || '/'}`);
  try {
    // gets new data
    await getFolderData.newRequest(req.params[0]);
    // sends data
    res.send(getFolderData.data);
  } catch (e) {
    // sends 'error'
    res.send('error');

    // sends error
    // res.send(e)
  }
});

export default router;
