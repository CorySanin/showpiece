const CACHEPERIOD = 5;
const MINUTES = 60000;

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

class Weather {
    constructor(options) {
        this._state = {
            expiration: new Date()
        }
        this._simplestate = {
            expiration: new Date()
        }
        createWeatherApi(options).then(weather => {
            this._weather = weather;
        }).catch(err => console.error(err));
    }

    getSimpleWeather = async () => {
        let now = new Date();
        if (now >= this._simplestate.expiration) {
            this._simplestate.weather = await this._weather.getSmartJSON();
            this._simplestate.expiration = new Date(now.getTime() + CACHEPERIOD * MINUTES);
        }
        return this._simplestate.weather;
    }

    getAllWeather = async () => {
        let now = new Date();
        if (now >= this._state.expiration) {
            this._state.weather = await this._weather.getAllWeather();
            this._state.expiration = new Date(now.getTime() + CACHEPERIOD * MINUTES);
        }
        return this._state.weather;
    }
}

module.exports = Weather;