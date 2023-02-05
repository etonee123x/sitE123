import { format } from 'date-fns';

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd/HH:mm:ss';

export const dtConsole = {
  error (...args: unknown[]) {
    console.error(`${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
  },
  log (...args: unknown[]) {
    console.log(`${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
  },
};

export const envVarToBoolean = (envVar: string | undefined) => String(envVar) === 'true';
