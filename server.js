const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const json5 = require('json5');
const express = require('express');
const ExpressWS = require('express-ws');
const version = require('./version');

const VIEWOPTIONS = {
    outputFunctionName: 'echo'
};
const MODULES = 'modules';

class Server {
    constructor(options = {}) {
        const app = this._app = express();
        const controlapp = this._controlapp = express();
        controlapp.use(express.json());
        const clients = this._clients = [];
        this._current = {
            type: 'none',
            body: null
        }
        app.set('view engine', 'ejs');
        app.set('view options', VIEWOPTIONS);
        controlapp.set('view engine', 'ejs');
        controlapp.set('view options', VIEWOPTIONS);
        ExpressWS(app);

        app.ws('/control', (ws, req) => {
            clients.push(ws);
            console.log(`new client connected: ${req.ip}`);
            this.send(this._current, [ws]);
            this.send({
                type: 'version',
                body: version
            }, [ws]);
            ws.on('close', (ws) => {
                clients.splice(clients.indexOf(ws), 1);
                console.log(`client disconnected: ${req.ip}`);
            });
        });

        controlapp.post('/api/load', (req, res) => {
            let body = req.body;
            if ('type' in body) {
                this.send(this._current = body);
            }
            res.end();
        });
        controlapp.get('/', async (req, res) => {
            res.redirect(`${req.baseUrl}/load`);
        });

        controlapp.get('/load', async (req, res) => {
            res.render('load', {
                modules: await this.getModules()
            }, (err, html) => {
                if (!err) {
                    res.send(html);
                }
                else {
                    res.send(err);
                }
            });
        });

        app.use(`/${MODULES}/`, express.static(MODULES));

        if (options.port !== options.controlport) {
            controlapp.use('/assets/', express.static('assets'));
            controlapp.use(`/${MODULES}/`, express.static(MODULES));
            controlapp.listen(options.controlport, () => console.log(`Showpiece listening to port ${options.controlport}`));
        }
        else {
            app.use('/control/', controlapp);
        }
    }

    send(payload, clients = this._clients) {
        clients.forEach((ws, index) => {
            try {
                ws.send(JSON.stringify(payload));
            }
            catch {
                clients.splice(index, 1);
            }
        });
    }

    getModules = async () => {
        let dirs = (await fsp.readdir(MODULES, { withFileTypes: true })).filter(dirent => !dirent.isFile());
        let result = [];
        for (const index in dirs) {
            const dir = dirs[index];
            let obj = {
                name: dir.name,
            };
            try {
                obj = json5.parse(await fsp.readFile(path.join(MODULES, dir.name, 'module.json')));
                if (obj.icon) {
                    obj.icon = `/${path.join(MODULES, dir.name, obj.icon)}`;
                }
            }
            catch {
                console.log(`Module metadata for ${dir.name} could not be loaded`);
            }
            obj.path = dir.name;
            result.push(obj);
        }
        return result;
    }

    middleware() {
        return this._app;
    }
}

module.exports = Server;