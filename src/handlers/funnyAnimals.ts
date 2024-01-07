import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { getContentPath } from '@/utils';

export const funnyAnimals = () => {
  const contentPath = getContentPath();
  const FUNNY_ANIMALS_FOLDER = 'funny-animals';
  const picturesPath = join(contentPath, FUNNY_ANIMALS_FOLDER);

  const filesTitles = readdirSync(picturesPath);
  const fileTitle = filesTitles[Math.floor(Math.random() * filesTitles.length)];

  return readFileSync(join(picturesPath, fileTitle));
};
