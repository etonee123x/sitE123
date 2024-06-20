import { Router } from 'express';

import { checkAuth } from '@/endpoints/checkAuth';
import { funnyAnimals } from '@/endpoints/funnyAnimals';
import { getFolderData } from '@/endpoints/getFolderData';
import { happyNorming } from '@/endpoints/happyNorming';
import { posts } from '@/endpoints/posts';
import { upload } from '@/endpoints/upload';

const router = Router();

router.use(checkAuth);
router.use(funnyAnimals);
router.use(getFolderData);
router.use(happyNorming);
router.use(posts);
router.use(upload);

export { router };
