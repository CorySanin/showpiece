import express from 'express';
import SunriseSunset from './sunrise-sunset.ts';
import Weather from './weather.ts';
import Version from './version.ts';
import type { AppOptions } from './index.ts';

const VIEWOPTIONS = {
    outputFunctionName: 'echo'
};

class Client {
    private app: express.Application;
    constructor(options: AppOptions = {}) {
        const app: express.Application = this.app = express();
        app.set('view engine', 'ejs');
        app.set('view options', VIEWOPTIONS);

        app.get('/', (_, res) => {
            res.render('client', {}, (err, html) => {
                if (!err) {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.send(html);
                }
                else {
                    res.send(err);
                }
            });
        });

        app.get('/client.js', (req, res) => {
            res.render('clientjs', {
                Version
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
            const w = new Weather(options.weather);
            w.getAllWeather().then((resp) => {
                const s = new SunriseSunset({
                    latitude: resp.city.coord.lat,
                    longitude: resp.city.coord.lon
                });
                app.get('/api/sun', async (_, res) => {
                    res.send(await s.getSunrise());
                });
            });
            app.get('/api/weather', async (_, res) => {
                res.send(await w.getSimpleWeather());
            });

            app.get('/api/all-weather', async (_, res) => {
                res.send(await w.getAllWeather());
            });
        }
    }

    middleware(): express.Application {
        return this.app;
    }
}

export default Client;
export { Client };
