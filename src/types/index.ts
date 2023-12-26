import type { Request } from 'express';

export type ReqAfterMidd = Request<
  Record<string, any> | undefined,
  any,
  any,
  Record<string, any> | undefined,
  Record<string, any>
>
