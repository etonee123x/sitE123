/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Response } from 'express';
import { validationResult } from 'express-validator';
import { dtConsole } from '../utils/index.ts';
import type { ReqAfterMidd } from '../types/index.ts';

const handleRequestError = async (e: unknown) => {
  dtConsole.error(e);
};

export const handleRequests = async (
  req: ReqAfterMidd,
  res: Response,
  cb: (req: ReqAfterMidd, res: Response) => unknown,
) => {
  dtConsole.log(`New request to ${req.route.path}`);
  const errors = validationResult(req).array();
  if (errors.length) {
    return res.status(400).send(errors);
  }

  const hasQuery = Boolean(Object.keys(req.query ?? {}).length);
  const hasBody = Boolean(Object.keys(req.body).length);
  const hasParams = Boolean(Object.keys(req.params ?? {}).length);
  if (hasQuery || hasBody || hasParams) {
    if (hasQuery) {
      dtConsole.log('Query:', req.query);
    }
    if (hasBody) {
      dtConsole.log('Body:', req.body);
    }
    if (hasParams) {
      dtConsole.log('Params:', req.params);
    }
  } else {
    dtConsole.log('No special params');
  }

  try {
    await cb(req, res);
  } catch (e) {
    await handleRequestError(e);
    res.sendStatus(404);
  }
};
