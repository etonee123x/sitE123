import('dotenv/config');
import { Response } from 'express';

import pkg, { JwtPayload } from 'jsonwebtoken';
const { sign, verify } = pkg;

export default class Auth {
  private login?: string;
  private password?: string;
  private token?: string;
  private verifyIsLost = false;

  constructor({
    login,
    password,
    token,
  }: {
    login?: string;
    password?: string;
    token?: string;
  }) {
    const getLoginByToken = (token: string) => {
      let login;
      verify(token, process.env.THE_KEY as string, (error, payload) => {
        if (error) return (this.verifyIsLost = true);
        if (payload && (payload as JwtPayload).login)
          login = (payload as JwtPayload).login;
      });
      return login;
    };
    if (token) {
      this.token = token;
      this.login = getLoginByToken(token);
    } else {
      this.login = login;
      this.password = password;
    }
  }

  public tryAuth(res: Response) {
    if (this.token) {
      if (!this.verifyIsLost) return res.json(this.token);
      return res.sendStatus(403);
    }
    if (!(this.login && this.password)) return res.sendStatus(404);
    if (this.password === process.env[this.login])
      return res.json(
        sign({ login: this.login }, process.env.THE_KEY as string),
      );
    return res.sendStatus(403);
  }
}
