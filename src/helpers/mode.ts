import { PROCESS_MODE } from '@/constants';

export const isModeTest = () => process.env.MODE === PROCESS_MODE.TEST;

export const isModeProd = () => process.env.MODE === PROCESS_MODE.PROD;
