import app from '../app.js';
import http from 'http';
import { networkInterfaces } from 'os';

const port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

const server = http.createServer(app);
server.once('listening', () => {
  const net = networkInterfaces();
  for (const iface in net) {
    if (Object.prototype.hasOwnProperty.call(net, iface)) {
      console.log(iface);
    }
  }
  console.log(`Server have been launched at http://localhost:${port}`);
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
