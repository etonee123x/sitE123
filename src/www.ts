import app from './app.js';
import http from 'http';
import { networkInterfaces } from 'os';

const port = normalizePort(process.env.PORT || '3001');
const ip =
  Object.values(networkInterfaces())
    .find((type) => type?.find((_interface) => _interface.family === 'IPv4'))
    ?.find((_interface) => _interface.family === 'IPv4')?.address ?? 'localhost';
export const apiUrl = `${ip}:${port}`;

app.set('port', port);

const server = http.createServer(app);
server.once('listening', () => {
  console.log(`Server is listening on ${apiUrl}`);
});

server.listen(port);

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}
