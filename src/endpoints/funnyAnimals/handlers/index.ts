import { throwError } from '@etonee123x/shared/utils/throwError';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export const handler = () => {
  const imagesPath = join('.', 'src', 'endpoints', 'funnyAnimals', 'content');

  const filesTitles = readdirSync(imagesPath);
  const fileTitle = filesTitles[Math.floor(Math.random() * filesTitles.length)] ?? throwError();

  return readFileSync(join(imagesPath, fileTitle));
};
