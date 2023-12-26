import { format } from 'date-fns';

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd/HH:mm:ss';

// Хочу чтобы работало так:
// logger('message') -- console.log
// logger.error('message') -- console.error
// при этом в обоих вариантах первый аргумент должен быть текущая отформатированная дата (как сейчас)
// также при запуске тестов не должно производится логгирование
export const dtConsole = {
  error (...args: unknown[]) {
    console.error(`${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
  },
  log (...args: unknown[]) {
    console.log(`${format(new Date(), DEFAULT_DATE_FORMAT)}:`, ...args);
  },
};

export const envVarToBoolean = (envVar: string | undefined) => String(envVar).toLowerCase() === 'true';
