import { Router } from 'express';

import { routerAuth } from '@/endpoints/auth';
import { funnyAnimals } from '@/endpoints/funnyAnimals';
import { getFolderData } from '@/endpoints/getFolderData';
import { happyNorming } from '@/endpoints/happyNorming';
import { router as routerPosts } from '@/endpoints/posts';
import { upload } from '@/endpoints/upload';

const router = Router();

router.use('/auth', routerAuth);
router.use(funnyAnimals);
router.use(getFolderData);
router.use(happyNorming);
router.use('/posts', routerPosts);
router.use('/upload', upload);

export { router };
