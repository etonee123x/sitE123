import { format } from 'date-fns';
import { join } from 'path';

import { DEFAULT_DATE_FORMAT, PROCESS_MODE, CONTENT_FOLDER } from '@/constants';

type ConsoleFunctionParameters = Parameters<typeof console.log>

const logger = (...args: ConsoleFunctionParameters) => {
  if (isModeTest()) {
    return;
  }

  console.log(`${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
};

logger.error = (...args: ConsoleFunctionParameters) => {
  if (isModeTest()) {
    return;
  }

  console.error(`[error] ${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
};

export { logger };

export const envVarToBoolean = (envVar: typeof process.env[string]) => String(envVar).toLowerCase() === 'true';

export const isModeTest = () => process.env.MODE === PROCESS_MODE.TEST;

export const isModeProd = () => process.env.MODE === PROCESS_MODE.PROD;

export const getFullApiUrl = () => isModeProd()
  ? `https://${process.env.DOMAIN_NAME}:${process.env.PORT_HTTPS}`
  : `http://${process.env.DOMAIN_NAME}:${process.env.PORT_HTTP}`;

export const createFullLink = (path: string) => {
  const fullApiUrl = getFullApiUrl();

  return decodeURI(new URL(path, fullApiUrl).href);
};

export const getContentPath = () => join('.', 'src', CONTENT_FOLDER);

export const _sleep = async (time = 5 * 1000) => new Promise<void>(resolve => setTimeout(resolve, time));
