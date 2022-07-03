var _a;
import app from './app.js';
import http from 'http';
import ip from 'ip';
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : '3001';
export const apiUrl = `${ip.address()}:${port}`;
app.set('port', port);
http
    .createServer(app)
    .once('listening', () => console.log(`Server is listening on ${apiUrl}`))
    .listen(port);
