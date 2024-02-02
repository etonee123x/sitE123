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

  console.error(`${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
};

export { logger };

export const envVarToBoolean = (envVar: typeof process.env[string]) => String(envVar).toLowerCase() === 'true';

export const isModeTest = () => process.env.MODE === PROCESS_MODE.TEST;

export const isModeProd = () => process.env.MODE === PROCESS_MODE.PROD;

export const getFullApiUrl = () => isModeProd()
  ? `https://${process.env.DOMAIN_NAME}:${process.env.PORT_HTTPS}`
  : `http://${process.env.DOMAIN_NAME}:${process.env.PORT_HTTP}`;

export const getContentPath = () => join('.', 'src', CONTENT_FOLDER);

export const omit = <T1 extends Record<string, unknown>, T2 extends keyof T1>(object: T1, keys: T2[]): Omit<T1, T2> =>
  Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key as T2))) as Omit<T1, T2>;

export const pick = <T1 extends Record<string, unknown>, T2 extends keyof T1>(object: T1, keys: T2[]): Pick<T1, T2> =>
    Object.fromEntries(Object.entries(object).filter(([key]) => keys.includes(key as T2))) as Pick<T1, T2>;
