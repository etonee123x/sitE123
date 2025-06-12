import { throwError } from '@etonee123x/shared/dist/utils/throwError';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export const handler = (dayOfTheWeek?: string) => {
  const imagesPath = join('.', 'src', 'endpoints', 'happyNorming', 'content');

  const dotw = String(dayOfTheWeek ?? new Date().getDay());
  const filesTitles = readdirSync(join(imagesPath, dotw));
  const fileTitle = filesTitles[Math.floor(Math.random() * filesTitles.length)] ?? throwError();

  return readFileSync(join(imagesPath, dotw, fileTitle));
};
