import { format } from 'date-fns';

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd/HH:mm:ss';

type ConsoleParams = Parameters<typeof console.log>

const logger = (...args: ConsoleParams) => {
  console.log(`${format(new Date(), DEFAULT_DATE_FORMAT)}`, ...args);
};

logger.error = (...args: ConsoleParams) => {
  console.error(`${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
};

export { logger };

export const envVarToBoolean = (envVar: string | undefined) => String(envVar).toLowerCase() === 'true';

export const isNotEmptyArray = <T>(arg: T[]): boolean => {
  return arg.length > 0;
};
