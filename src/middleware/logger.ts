import type { Middleware } from '@/types';
import { logger as _logger } from '@/utils';
import { isNotNil, isNotEmptyObject, isTruthy } from '@includes/types/utils';

export const logger: Middleware = (...[req, , next]) => {
  const messages = [`New request to ${req.originalUrl}`];

  const hasQuery = isNotNil(req.query) && isNotEmptyObject(req.query);
  const hasBody = isNotEmptyObject(req.body);
  const hasParams = isNotNil(req.params) && isNotEmptyObject(req.params);
  if (hasQuery || hasBody || hasParams) {
    messages.push(...[
      hasQuery && `Query: ${JSON.stringify(req.query)}`,
      hasBody && `Body: ${JSON.stringify(req.body)}`,
      hasParams && `Params: ${JSON.stringify(req.params)}`,
    ].filter(isTruthy));
  } else {
    messages.push('No special params');
  }

  _logger(messages.join(' | '));

  next();
};
