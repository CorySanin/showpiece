const express = require('express');
const weather = require('./weather');
const sun = require('./sunrise-sunset');
const version = require('./version');

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
                version
            }, (err, js) => {
                if (!err) {
                    res.type('text/javascript').send(js);
                }
                else {
                    res.send(err);
                }
            });
        });

        if(options.weather && options.weather.key){
            let w = new weather();
            w.prepareApi(options.weather).then(async () => {
                let results = await w.getAllWeather();
                let s = new sun({
                    latitude: results.coord.lat,
                    longitude: results.coord.lon
                });
                app.get('/api/sun', async (req, res) => {
                    res.send(await s.getSunrise());
                });
            });
            app.get('/api/weather', async (req, res) => {
                res.send(await w.getSimpleWeather());
            });

            app.get('/api/all-weather', async (req, res) => {
                res.send(await w.getAllWeather());
            });
        }
    }

    middleware() {
        return this._app;
    }
}

module.exports = Client;