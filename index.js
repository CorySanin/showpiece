const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const express = require('express');
const json5 = require('json5');
const client = require('./client');
const server = require('./server');


const configpath = process.env.CONFIG || path.join('config', 'config.json5');

(async () => {
    const configfile = json5.parse(await fsp.readFile(configpath));
    const port = process.env.PORT || configfile.port || 8080;
    const config ={
        port,
        controlport: process.env.CONTROLPORT || configfile.controlport || port
    };
    const c = new client(config);
    const s = new server(config);
    const app = (config.clientonly) ? express() : s.middleware();

    app.set('trust proxy', 1);
    app.use('/', c.middleware());
    app.use('/assets/', express.static('assets'));

    app.listen(config.port, () => console.log(`Showpiece listening to port ${config.port}`));
})().catch(err => console.error(err));