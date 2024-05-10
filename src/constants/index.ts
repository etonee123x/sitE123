import { HANDLER_NAME } from '@/types';

export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd/HH:mm:ss';

export const HANDLER_NAME_TO_ROUTE = Object.freeze({
  [HANDLER_NAME.GET_FOLDER_DATA]: '/get-folder-data',
  [HANDLER_NAME.HAPPY_NORMING]: '/happy-norming',
  [HANDLER_NAME.FUNNY_ANIMALS]: '/funny-animals',
  [HANDLER_NAME.POSTS]: '/posts',
  [HANDLER_NAME.UPLOAD]: '/upload',
});

export enum PROCESS_MODE {
  DEV = 'DEV',
  PROD = 'PROD',
  TEST = 'TEST'
}

export const CONTENT_FOLDER = 'content';
