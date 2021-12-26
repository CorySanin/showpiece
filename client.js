const express = require('express');

const VIEWOPTIONS = {
    outputFunctionName: 'echo'
};

class Client {
    constructor(options = {}) {
        const app = this._app = express();
        app.set('view engine', 'ejs');
        app.set('view options', VIEWOPTIONS);

        app.get('/', (req, res) => {
            res.render('client', {}, (err, html) => {
                if (!err) {
                    res.send(html);
                }
                else {
                    res.send(err);
                }
            });
        });

        app.get('/client.js', (req, res) => {
            res.render('clientjs', {
                server: `${req.protocol.replace(/^http/i, 'ws')}://${req.hostname}:${req.socket.localPort}`
            }, (err, js) => {
                if (!err) {
                    res.type('text/javascript').send(js);
                }
                else {
                    res.send(err);
                }
            });
        });
    }

    middleware() {
        return this._app;
    }
}

module.exports = Client;