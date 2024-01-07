import { HANDLER_NAME } from '@includes/types';

export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd/HH:mm:ss';

export const HANDLER_NAME_TO_ROUTE = Object.freeze({
  [HANDLER_NAME.GET_FOLDER_DATA]: '/get-folder-data',
  [HANDLER_NAME.HAPPY_NORMING]: '/happy-norming',
  [HANDLER_NAME.FUNNY_ANIMALS]: '/funny-animals',
});

export enum PROCESS_MODE {
  DEV = 'DEV',
  PROD = 'PROD',
  TEST = 'TEST'
}
