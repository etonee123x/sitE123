var _a, _b, _c;
import app from './app.js';
import http from 'http';
import { networkInterfaces } from 'os';
const port = normalizePort(process.env.PORT || '3001');
const ip = (_c = (_b = (_a = Object.values(networkInterfaces())
    .find((type) => type === null || type === void 0 ? void 0 : type.find((_interface) => _interface.family === 'IPv4'))) === null || _a === void 0 ? void 0 : _a.find((_interface) => _interface.family === 'IPv4')) === null || _b === void 0 ? void 0 : _b.address) !== null && _c !== void 0 ? _c : 'localhost';
export const apiUrl = `${ip}:${port}`;
app.set('port', port);
const server = http.createServer(app);
server.once('listening', () => {
    console.log(`Server is listening on ${apiUrl}`);
});
server.listen(port);
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}
