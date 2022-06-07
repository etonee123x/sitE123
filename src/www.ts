import app from './app.js';
import http from 'http';
import ip from 'ip';

const port = normalizePort(process.env.PORT || '3001');
export const apiUrl = `${ip.address()}:${port}`;

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
