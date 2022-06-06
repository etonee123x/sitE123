import app from './app.js';
import http from 'http';
import { networkInterfaces } from 'os';
const port = normalizePort(process.env.PORT || '3001');
app.set('port', port);
const server = http.createServer(app);
server.once('listening', () => {
    var _a, _b;
    const net = networkInterfaces();
    let ip;
    for (const _interfaceTitle in net) {
        if (Object.prototype.hasOwnProperty.call(net, _interfaceTitle) && !ip) {
            ip = (_b = (_a = net[_interfaceTitle]) === null || _a === void 0 ? void 0 : _a.find(_interface => !_interface.internal && _interface.family === 'IPv4')) === null || _b === void 0 ? void 0 : _b.address;
        }
    }
    console.log(`Server have been launched at http://${ip || 'localhost'}:${port}`);
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
