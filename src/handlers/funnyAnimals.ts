import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { getContentPath } from '@/utils';

export const funnyAnimals = () => {
  const contentPath = getContentPath();
  const FUNNY_ANIMALS_FOLDER = 'funny-animals';
  const imagesPath = join(contentPath, FUNNY_ANIMALS_FOLDER);

  const filesTitles = readdirSync(imagesPath);
  const fileTitle = filesTitles[Math.floor(Math.random() * filesTitles.length)];

  return readFileSync(join(imagesPath, fileTitle));
};
