import * as http from "http";
import path from 'path';
import fsp from 'fs/promises';
import json5 from 'json5';
import express from 'express';
import ExpressWS from 'express-ws';
import Version from './version.ts';
import type WebSocket from 'ws';
import type { AppOptions } from './index.ts';

const VIEWOPTIONS = {
    outputFunctionName: 'echo'
};

interface Payload {
    type: 'none' | 'version';
    body: null | string;
}

interface Scene extends Payload {
    type: 'none';
    body: null | string;
}

interface ModuleParam {
    name: string,
    param: string,
    type: "color" | "bool",
    default?: string | boolean
}

interface Module {
    name: string;
    description?: string;
    icon?: string;
    parameters?: ModuleParam[]
    path: string;
}

class Server {
    private app: ExpressWS.Application;
    private current: Scene;
    private clients: WebSocket[];
    private modulesDir: string;
    private webservers: http.Server[] = [];
    constructor(options: AppOptions = {}) {
        this.modulesDir = options.modulesDir || process.env['MODULESDIR'] || path.join('.', 'modules');
        const app = express();
        const controlapp = express();
        controlapp.use(express.json());
        const clients: WebSocket[] = this.clients = [];
        this.current = {
            type: 'none',
            body: null
        }
        app.set('view engine', 'ejs');
        app.set('view options', VIEWOPTIONS);
        controlapp.set('view engine', 'ejs');
        controlapp.set('view options', VIEWOPTIONS);
        this.app = ExpressWS(app).app;

        this.app.ws('/control', (ws, req) => {
            clients.push(ws);
            console.log(`new client connected: ${req.ip}`);
            this.send(this.current, [ws]);
            this.send({
                type: 'version',
                body: Version
            }, [ws]);
            ws.on('close', (_) => {
                clients.splice(clients.indexOf(ws), 1);
                console.log(`client disconnected: ${req.ip}`);
            });
        });

        controlapp.post('/api/load', (req, res) => {
            let body = req.body;
            if ('type' in body) {
                this.send(this.current = body);
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

        app.use(`/modules/`, express.static(this.modulesDir));

        if (options.port !== options.controlport) {
            controlapp.use('/assets/', express.static('assets'));
            controlapp.use(`/modules/`, express.static(this.modulesDir));
            this.webservers.push(controlapp.listen(options.controlport, () => console.log(`Showpiece listening to port ${options.controlport}`)));
        }
        else {
            app.use('/control/', controlapp);
        }
    }

    send(payload: Payload, clients: WebSocket[] = this.clients) {
        clients.forEach((ws, index) => {
            try {
                ws.send(JSON.stringify(payload));
            }
            catch {
                clients.splice(index, 1);
            }
        });
    }

    async getModules (): Promise<Module[]> {
        const dirs = (await fsp.readdir(this.modulesDir, { withFileTypes: true })).filter(dirent => !dirent.isFile());
        const result: Module[] = [];
        for (const index in dirs) {
            const dir = dirs[index];
            let obj: Module = {
                name: dir.name,
                path: dir.name
            };
            try {
                obj = json5.parse((await fsp.readFile(path.join(this.modulesDir, dir.name, 'module.json'))).toString());
                if (obj.icon) {
                    obj.icon = `/${path.join(this.modulesDir, dir.name, obj.icon)}`;
                }
            }
            catch {
                console.error(`Module metadata for ${dir.name} could not be loaded`);
            }
            obj.path = dir.name;
            result.push(obj);
        }
        return result;
    }

    middleware(): ExpressWS.Application {
        return this.app;
    }

    close() {
        this.webservers.forEach(s => {
            s.close();
        });
    }
}

export default Server;
export { Server };
export type { Payload, Scene, Module, ModuleParam };
