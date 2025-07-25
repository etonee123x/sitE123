import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { ROUTE_TO_VALIDATORS } from '@/middleware';
import { HANDLER_NAME } from '@/types';
import { Router } from 'express';
import { handler } from './handlers';
import { addSinceTimestamps } from '@/helpers/addSinceTimestamps';

const router = Router();

router.get(
  new RegExp(`${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.GET_FOLDER_DATA]}((/[^/]+)+)*`),
  ...ROUTE_TO_VALIDATORS[HANDLER_NAME_TO_ROUTE[HANDLER_NAME.GET_FOLDER_DATA]],
  async (req, res, next) => {
    await handler(req.params[0] || '/')
      .then((folderData) => {
        const now = Date.now();

        const folderDataWithSinceTimestamps = {
          ...folderData,
          items: folderData.items.map((item) => ({
            ...item,
            _meta: addSinceTimestamps(item._meta, now),
          })),
          linkedFile: folderData.linkedFile
            ? {
                ...folderData.linkedFile,
                _meta: addSinceTimestamps(folderData.linkedFile._meta, now),
              }
            : null,
        };

        res.send(folderDataWithSinceTimestamps);
      })
      .catch(next);
  },
);

export { router as getFolderData };
