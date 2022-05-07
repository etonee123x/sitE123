import('dotenv/config');
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
export default class Auth {
    constructor({ login, password, token, }) {
        this.verifyIsLost = false;
        const getLoginByToken = (token) => {
            let login;
            verify(token, process.env.THE_KEY, (error, payload) => {
                if (error)
                    return (this.verifyIsLost = true);
                if (payload && payload.login)
                    login = payload.login;
            });
            return login;
        };
        if (token) {
            this.token = token;
            this.login = getLoginByToken(token);
        }
        else {
            this.login = login;
            this.password = password;
        }
    }
    tryAuth(res) {
        if (this.token) {
            if (!this.verifyIsLost)
                return res.json(this.token);
            return res.sendStatus(403);
        }
        if (!(this.login && this.password))
            return res.sendStatus(404);
        if (this.password === process.env[this.login])
            return res.json(sign({ login: this.login }, process.env.THE_KEY));
        return res.sendStatus(403);
    }
}
