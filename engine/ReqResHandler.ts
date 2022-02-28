import { Request, Response } from 'express';

export type Handler = (req: Request, res: Response) => unknown;

export default class ReqResHandler {
  private readonly request: Request;
  private readonly response: Response;
  private readonly handler: Handler;

  constructor(req: Request, res: Response, handler: Handler) {
    this.request = req;
    this.response = res;
    this.handler = handler;
    console.log(`New request to ${req.route.path}`);
    const qL = Object.keys(req.query).length;
    const bL = Object.keys(req.body).length;
    const pL = Object.keys(req.params).length;
    if (qL || bL || pL) {
      if (qL) console.log('Query:', req.query);
      if (bL) console.log('Body:', req.body);
      if (pL) console.log('Params:', req.params);
    } else console.log('No special params');
  }

  public async init() {
    try {
      await this.handler(this.request, this.response);
    } catch (e) {
      console.log(e);
      this.response.sendStatus(404);
    }
  }
}
