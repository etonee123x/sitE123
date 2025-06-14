import { isModeProd } from './mode';

export const getOrigin = () =>
  isModeProd
    ? `https://${process.env.DOMAIN_NAME}:${process.env.PORT_HTTPS}`
    : `http://${process.env.DOMAIN_NAME}:${process.env.PORT_HTTP}`;

export const formFullApiUrl = (path: ConstructorParameters<typeof URL>[0]) =>
  decodeURI(new URL(path, getOrigin()).href);
