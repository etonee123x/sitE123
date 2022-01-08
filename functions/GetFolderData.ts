import fs from 'fs';
import musMetaData from 'music-metadata';

interface IMetadata {
  bitrate: number | null,
  duration: string | null,
  album: string | null,
  artists: string[] | null,
  bpm: number | null,
  year: number | null
}

interface IItem {
  name: string
  type: string
  ext: string | null,
  url: string,
  numberOfThisExt: number,
  birthTime: Date,
  metadata?: IMetadata,
}

interface ILinkedFile {
  name?: string,
  ext?: string,
  url?: string,
  metadata?: IMetadata,
}

interface INavItem {
  text: string,
  link: string,
}

interface IPlaylistItem {
  name: string,
  ext: string,
  url: string,
  thisIsLinkedFile: boolean
  metadata?: IMetadata,
}

interface IGetFolderData {
  linkedFile?: ILinkedFile | string,
  currentDirectory?: string,
  filesList?: IItem[],
  playlist?: IPlaylistItem[] | null,
  paths?: {
    rel?: string,
    abs?: string,
    lvlUp?: string | null,
  }
  navigation?: INavItem[],
}

export default class GetFolderData {
  private readonly contentPath: string;
  private url?: string;
  public data?: IGetFolderData;
  private fileIsLinked?: boolean;
  private elementsNumbers: any;

  constructor(contentPath: string) {
    this.contentPath = contentPath.replace(/\/{2,}|\/$|^\//g, '');
  }

  // parses url and gets new data
  public async newRequest(url: string) {
    this.url = decodeURI(url).replace(/\/{2,}|\/$|^\//g, '');
    this.data = {};
    await this.getData();
  }

  private async getData() {
    this.getLinkedFile();
    this.getFolderList();
    this.getAllPaths();
    this.getNavigation();

    if (this.fileIsLinked) {
      this.getPlaylist();
    } else {
      this.data!.playlist = null;
    }
    await this.getMetas();
    this.sortItems();
  }

  private getLinkedFile() {
    try {
      if (fs.statSync(`${this.contentPath}/${this.url}`).isFile()) {
        this.data!.linkedFile = {};

        // detects full file name in .match[0]
        //        file name without .ext in .match[1]
        //        file extension without "." in .match[2]
        // eslint-disable-next-line no-useless-escape
        const fileMatch = this.url!.match(/([^\/]*)\.([^\/]*)$/);
        this.data!.linkedFile.name = fileMatch![0];
        this.data!.linkedFile.ext = fileMatch![2];

        // will contain url from location.pathname
        this.data!.linkedFile.url = `/${this.url}`;

        this.fileIsLinked = true;

        // current directory is location.pathname without `.../name.ext`
        this.data!.currentDirectory = this.url!.replace(fileMatch![0], '');
      } else {
        this.data!.linkedFile = 'none';
        this.fileIsLinked = false;
        this.data!.currentDirectory = this.url || '/';
      }
    } catch (e) {
      this.data!.linkedFile = 'Linked file not found!';
    }
  }

  private getFolderList() {
    this.elementsNumbers = {};
    this.data!.filesList = fs.readdirSync(
      `${this.contentPath}/${this.data!.currentDirectory}`,
      { withFileTypes: true },
    ).map(element => {
      const name = element.name;
      const type = element.isDirectory() ? 'folder' : 'file';
      const ext = element.isDirectory() ? null : element.name.match(/([^.]+)$/g)![0];

      // cyphers file name to url (space => '%20' and etc)
      const url = encodeURI(element.name);

      // counts the ordinal number of file with this extension
      if (typeof this.elementsNumbers[ext!] === 'undefined') {
        this.elementsNumbers[ext!] = 0;
      }
      const number = this.elementsNumbers[ext!]++;

      const birthTime = fs.statSync(`${this.contentPath}/${this.data!.currentDirectory}/${element.name}`).birthtime;
      return {
        name,
        type,
        ext,
        url,
        numberOfThisExt: number,
        birthTime: birthTime,
      };
    });
  }

  private getAllPaths() {
    this.data!.paths = {};
    this.data!.paths.rel = `/${this.data!.currentDirectory}/`.replace(/\/{2,}/, '/');
    this.data!.paths.abs = `/${this.contentPath}/${this.data!.currentDirectory}/`.replace(/\/{2,}/, '/');
    try {
      this.data!.paths.lvlUp = this.data!.paths.rel.match(/.*\/(?=.+$)/)![0];
    } catch (e) {
      this.data!.paths.lvlUp = null;
    }
  }

  private getNavigation() {
    let buffResult = this.data!.paths!.rel!.split('/');
    buffResult = buffResult.filter(e => e !== '');
    const result: { text: string, link: string }[] = [];
    result.unshift({
      text: 'root',
      link: '/',
    });
    for (let i = 0; i < buffResult.length; i++) {
      result[i + 1] = {
        text: buffResult[i],
        link: result[i].link + buffResult[i] + '/',
      };
    }
    this.data!.navigation = result;
  }

  private getPlaylist() {
    const playlist: IPlaylistItem[] = [];
    this.data!.filesList!.forEach(e => {
      if (e.ext === 'mp3' && typeof this.data!.linkedFile! !== 'string') {
        playlist.push({
          name: e.name,
          ext: e.ext,
          url: '/' + this.data!.currentDirectory + e.url,
          thisIsLinkedFile: (e.name === this.data!.linkedFile!.name),
        });
      }
    });
    this.data!.playlist = playlist;
  }

  private static async getMetaDataFields(path: string) {
    const metadata = await musMetaData
      .parseFile(path);
    return Promise.resolve({
      bitrate: metadata.format.bitrate || null,
      duration: metadata.format.duration!.toFixed(2) || null,
      album: metadata.common.album || null,
      artists: metadata.common.artists || null,
      bpm: metadata.common.bpm || null,
      year: metadata.common.year || null,
    });
  }

  private sortItems() {
    this.data!.filesList = this.data!.filesList!.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') {
        return -1;
      }
      return 0;
    });
  }

  private async getMetas() {
    try {
      for (let i = 0; i < this.data!.filesList!.length; i++) {
        if (this.data!.filesList![i].ext === 'mp3') {
          this.data!.filesList![i].metadata =
            await GetFolderData
              .getMetaDataFields(`${this.contentPath}/${this.data!.currentDirectory}/${this.data!.filesList![i].name}`);
        }
      }
    } catch (e) {
      console.log('Не получилось найти метаданные для файлов');
    }
    try {
      if (this.data!.linkedFile !== 'none' &&
        this.data!.linkedFile !== 'Linked file not found!' &&
        typeof this.data!.linkedFile !== 'string') {
        this.data!.linkedFile!.metadata =
          await GetFolderData
            .getMetaDataFields(`${this.contentPath}/${this.data!.linkedFile!.url}`);
      }
    } catch (e) {
      console.log('Не получилось найти метаданные для привязанного файла');
    }
    try {
      if (this.data!.playlist) {
        for (const elem of this.data!.playlist) {
          elem.metadata =
            await GetFolderData
              .getMetaDataFields(`${this.contentPath}/${decodeURI(elem.url)}`);
        }
      }
    } catch (e) {
      console.log('Не получилось найти метаданные для плейлиста');
    }
  }
};
