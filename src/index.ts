import path from 'path';
import fsp from 'fs/promises';
import express from 'express';
import json5 from 'json5';
import Client from './client.ts';
import Server from './server.ts';
import type { WeatherConfig } from "./weather.ts";

interface AppOptions {
    port?: number;
    controlport?: number;
    modulesDir?: string;
    weather?: WeatherConfig;
    clientonly?: boolean
}

const configpath = process.env.CONFIG || path.join('config', 'config.json5');

const configfile = json5.parse((await fsp.readFile(configpath)).toString());
configfile.port = process.env.PORT || configfile.port || 8080;
configfile.controlport = process.env.CONTROLPORT || configfile.controlport || configfile.port;
const c = new Client(configfile);
const s = new Server(configfile);
const app = (configfile?.clientonly) ? express() : s.middleware();
app.set('trust proxy', 1);
app.use('/', c.middleware());
(app as express.Application).use('/assets/', express.static('assets'));
process.on('SIGTERM', app.listen(configfile.port, () => {
    console.log(`Showpiece listening to port ${configfile.port}`);
}).close);

export type { AppOptions }
