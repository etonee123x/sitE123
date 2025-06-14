import { logger as _logger } from '@/helpers/logger';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { isNotEmptyObject } from '@etonee123x/shared/utils/isNotEmptyObject';
import { RequestHandler } from 'express';

export const logger: RequestHandler = (...[req, , next]) => {
  const messages = [`New request to ${req.originalUrl}`];

  const hasQuery = isNotNil(req.query) && isNotEmptyObject(req.query);
  const hasBody = isNotEmptyObject(req.body);
  const hasParams = isNotNil(req.params) && isNotEmptyObject(req.params);

  if (hasQuery || hasBody || hasParams) {
    if (hasQuery) {
      messages.push(`Query: ${JSON.stringify(req.query)}`);
    }

    if (hasBody) {
      messages.push(`Body: ${JSON.stringify(req.body)}`);
    }

    if (hasParams) {
      messages.push(`Params: ${JSON.stringify(req.params)}`);
    }
  } else {
    messages.push('No special params');
  }

  _logger(messages.join(' | '));

  next();
};
