import { Router } from 'express';
import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { HANDLER_NAME } from '@/types';

import { router as routerCheckAuth } from '@/endpoints/checkAuth';
import { router as routerFunnyAnimals } from '@/endpoints/funnyAnimals';
import { router as routerGetFolderData } from '@/endpoints/getFolderData';
import { router as routerHappyNorming } from '@/endpoints/happyNorming';
import { router as routerPosts } from '@/endpoints/posts';
import { router as routerUpload } from '@/endpoints/upload';

const router = Router();

router.use(HANDLER_NAME_TO_ROUTE[HANDLER_NAME.CHECK_AUTH],routerCheckAuth);
router.use(HANDLER_NAME_TO_ROUTE[HANDLER_NAME.FUNNY_ANIMALS], routerFunnyAnimals);
router.use(HANDLER_NAME_TO_ROUTE[HANDLER_NAME.GET_FOLDER_DATA], routerGetFolderData);
router.use(HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING], routerHappyNorming);
router.use('/posts', routerPosts);
router.use('/upload', routerUpload);

export { router };
