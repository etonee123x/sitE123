import { readdirSync, readFileSync } from 'fs';
import { Buffer } from 'buffer';

export default class AlinaHandler {
  private readonly randomPhoto: string;

  constructor() {
    const files = readdirSync('./content/alina-handler');
    const file = files[Math.floor(Math.random() * files.length)];
    this.randomPhoto = `./content/alina-handler/${file}`;
  }

  public getPhoto(): Buffer {
    return readFileSync(this.randomPhoto!);
  }
}
