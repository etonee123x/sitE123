import { format } from 'date-fns';

import { DEFAULT_DATE_FORMAT, PROCESS_MODE } from '@/constants';

type ConsoleFunctionParameters = Parameters<typeof console.log>

const logger = (...args: ConsoleFunctionParameters) => {
  if (isTest()) {
    return;
  }

  console.log(`${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
};

logger.error = (...args: ConsoleFunctionParameters) => {
  if (isTest()) {
    return;
  }

  console.error(`${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
};

export { logger };

export const envVarToBoolean = (envVar: typeof process.env[string]) => String(envVar).toLowerCase() === 'true';

export const isTest = () => process.env.MODE === PROCESS_MODE.TEST;
