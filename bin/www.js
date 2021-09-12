import app from '../app.js';
import http from 'http';

const port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

const server = http.createServer(app);
console.log(`Server have been launched at http://localhost:${port}`);

server.listen(port);

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
