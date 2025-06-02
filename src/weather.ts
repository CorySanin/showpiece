import OpenWeatherMap from 'openweathermap-ts';
import NodeCache from "node-cache";
import type { Location } from './sunrise-sunset.ts';
import type { ThreeHourResponse, CurrentResponse, CountryCode } from 'openweathermap-ts/dist/types/index.js';

const CACHEPERIOD = 5;
const MINUTES = 60;

interface CityName {
    cityName: string;
    state: string;
    countryCode: CountryCode;
}

interface WeatherConfig {
    key: string;
    lang?: string;
    coordinates?: number[] | string | Location;
    zip?: number;
    country?: CountryCode;
    cityid?: number;
    city?: CityName;
}

type LocationType = 'coordinates' | 'zip' | 'cityid' | 'city' | null;

function parseCoords(coords: number[] | string | Location): number[] {
    if (typeof coords == 'string') {
        return coords.replace(/\s/g, '').split(',').map(Number.parseFloat);
    }
    else if (typeof coords == 'object' && !('length' in coords)) {
        return [coords.latitude, coords.longitude];
    }
    return coords;
}

class Weather {
    private openWeather: OpenWeatherMap.default;
    private cache: NodeCache;
    private locationType: LocationType;

    constructor(options: WeatherConfig) {
        this.cache = new NodeCache({
            stdTTL: CACHEPERIOD * MINUTES,
            useClones: false
        });
        this.locationType = null;
        this.openWeather = new OpenWeatherMap.default({
            apiKey: options.key
        });
        if ('city' in options && 'cityName' in options.city && 'state' in options.city && 'countryCode' in options.city) {
            this.openWeather.setCityName(options.city);
            this.locationType = 'city';
        }
        if ('cityid' in options) {
            this.openWeather.setCityId(options.cityid);
            this.locationType = 'cityid';
        }
        if ('zip' in options && 'country' in options) {
            this.openWeather.setZipCode(options.zip, options.country)
            this.locationType = 'zip';
        }
        if ('coordinates' in options) {
            const coords = parseCoords(options.coordinates);
            if (coords.length >= 2) {
                this.openWeather.setGeoCoordinates(coords[0], coords[1]);
                this.locationType = 'coordinates';
            }
        }
    }

    async getCurrentWeather(): Promise<CurrentResponse> {
        let returnable = this.cache.get('current') as undefined | CurrentResponse;
        if (returnable === undefined) {
            switch (this.locationType) {
                case 'city':
                    returnable = await this.openWeather.getCurrentWeatherByCityName();
                    break;
                case 'cityid':
                    returnable = await this.openWeather.getCurrentWeatherByCityId();
                    break;
                case 'zip':
                    returnable = await this.openWeather.getCurrentWeatherByZipcode();
                    break;
                case 'coordinates':
                    returnable = await this.openWeather.getCurrentWeatherByGeoCoordinates();
                    break;
                default:
                    throw new Error(`Can't fetch weather for location type '${this.locationType}'`);
            }
            this.cache.set('current', returnable);
        }
        return returnable;
    }

    async getThreeHourForecast(): Promise<ThreeHourResponse> {
        let returnable = this.cache.get('forecast') as undefined | ThreeHourResponse;
        if (returnable === undefined) {
            switch (this.locationType) {
                case 'city':
                    returnable = await this.openWeather.getThreeHourForecastByCityName();
                    break;
                case 'cityid':
                    returnable = await this.openWeather.getThreeHourForecastByCityId();
                    break;
                case 'zip':
                    returnable = await this.openWeather.getThreeHourForecastByZipcode();
                    break;
                case 'coordinates':
                    returnable = await this.openWeather.getThreeHourForecastByGeoCoordinates();
                    break;
                default:
                    throw new Error(`Can't fetch weather for location type '${this.locationType}'`);
            }
            this.cache.set('forecast', returnable);
        }
        return returnable;
    }

    getSimpleWeather(): Promise<CurrentResponse> {
        return this.getSimpleWeather();
    }

    getAllWeather(): Promise<ThreeHourResponse> {
        return this.getThreeHourForecast();
    }
}

export default Weather;
export { Weather };
export type { WeatherConfig, CityName };
