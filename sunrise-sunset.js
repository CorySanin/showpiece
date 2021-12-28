const phin = require('phin');

const CACHEPERIOD = 5;
const MINUTES = 60000;
const DAY = 86400000;

function tomorrow() {
    let d = new Date();
    d = new Date(d.getTime() + DAY);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
}

async function createWeatherApi(options) {
    const AsyncWeather = (await import('@cicciosgamino/openweather-apis')).AsyncWeather;
    const weather = await (new AsyncWeather())
    weather.setLang(options.lang || 'en');
    weather.setUnits('metric');
    if ('coordinates' in options) {
        let coords = options.coordinates;
        if (typeof coords == 'string') {
            coords = coords.replace(/\s/g, '').split(',').map(Number.parseFloat);
        }
        else if (typeof coords == 'object' && !('length' in coords)) {
            coords = [coords['latitude'], coords['longitude']];
        }
        if (typeof coords == 'object' && 'length' in coords && coords.length >= 2) {
            weather.setCoordinates(coords[0], coords[1]);
        }
    }
    if ('zip' in options && 'country' in options) {
        weather.setZipCodeAndCountryCode(options.zip, options.country);
    }
    if ('cityid' in options) {
        weather.setCityId(options.cityid);
    }
    if ('city' in options) {
        weather.setCity(options.city);
    }
    if ('key' in options) {
        weather.setApiKey(options.key);
    }
    return weather;
}

class SunriseSunset {
    constructor(location) {
        this._location = location;
        this._state = {
            expiration: new Date()
        }
    }

    getSunrise = async () => {
        let now = new Date();
        if (now >= this._state.expiration) {
            console.log('Calling API');
            let resp = await phin({
                url: `https://api.sunrise-sunset.org/json?lat=${this._location.latitude}&lng=${this._location.longitude}&date=today&formatted=0`,
                parse: 'json'
            });
            resp.body.results.expiration = tomorrow();
            this._state = resp.body.results;
        }
        return this._state;
    }
}

module.exports = SunriseSunset;