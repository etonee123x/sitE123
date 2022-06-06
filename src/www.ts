import app from './app.js';
import http from 'http';
import { networkInterfaces } from 'os';

const port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

const server = http.createServer(app);
server.once('listening', () => {
  const net = networkInterfaces();
  let ip;
  for (const _interfaceTitle in net) {
    if (Object.prototype.hasOwnProperty.call(net, _interfaceTitle) && !ip) {
      ip = net[_interfaceTitle]?.find(
        _interface => !_interface.internal && _interface.family === 'IPv4',
      )?.address;
    }
  }
  console.log(`Server have been launched at http://${ip || 'localhost'}:${port}`);
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
