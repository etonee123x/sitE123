import app from './app.js';
import http from 'http';
import ip from 'ip';
import 'dotenv/config';
const port = process.env.PORT ?? '80';
export const apiUrl = `${ip.address()}:${port}`;
app.set('port', port);
http
    .createServer(app)
    .once('listening', () => console.log(`Server is listening on ${apiUrl}`))
    .listen(port);
