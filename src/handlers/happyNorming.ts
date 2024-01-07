import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { getContentPath } from '@/utils';

export const happyNorming = (dayOfTheWeek?: string) => {
  const contentPath = getContentPath();
  const HAPPY_NORMING_FOLDER = 'happy-norming';
  const picturesPath = join(contentPath, HAPPY_NORMING_FOLDER);

  const dotw = String(dayOfTheWeek ?? new Date().getDay());
  const filesTitles = readdirSync(join(picturesPath, dotw));
  const fileTitle = filesTitles[Math.floor(Math.random() * filesTitles.length)];

  return readFileSync(join(picturesPath, dotw, fileTitle));
};
