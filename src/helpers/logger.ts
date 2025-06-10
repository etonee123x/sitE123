import { format } from 'date-fns';

import { DEFAULT_DATE_FORMAT } from '@/constants';
import { isModeTest } from './mode';

type ConsoleFunctionParameters = Parameters<typeof console.log>;

const logger = (...args: ConsoleFunctionParameters) => {
  if (isModeTest()) {
    return;
  }

  console.info(`${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
};

logger.error = (...args: ConsoleFunctionParameters) => {
  if (isModeTest()) {
    return;
  }

  console.error(`[error] ${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
};

export { logger };
