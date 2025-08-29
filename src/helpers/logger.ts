import { isModeTest } from './mode';

type ConsoleFunctionParameters = Parameters<typeof console.log>;

const logger = (...args: ConsoleFunctionParameters) => {
  if (isModeTest) {
    return;
  }

  console.info(`${new Date().toISOString()}:`, ...args);
};

logger.error = (...args: ConsoleFunctionParameters) => {
  if (isModeTest) {
    return;
  }

  console.error(`[error] ${new Date().toISOString()}:`, ...args);
};

export { logger };
