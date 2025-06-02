import ky from 'ky';
import dayjs from 'dayjs';

interface Location {
    latitude: number;
    longitude: number;
}

interface SunriseResponse {
    results: SunriseResults | "";
    status: "OK" | "INVALID_REQUEST";
    tzid?: string;
}

interface SunriseResults {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: number;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
}

class SunriseSunset {
    private location: Location
    private state: SunriseResults;
    private expiration: dayjs.Dayjs;

    constructor(location: Location) {
        this.location = location;
        this.invalidateCache();
    }

    invalidateCache(): void {
        this.expiration = dayjs().subtract(1, 'day');
    }

    async getSunrise(): Promise<SunriseResults> {
        const now = dayjs();
        if (now.isAfter(this.expiration)) {
            console.log('Calling Sunrise API');
            const resp: SunriseResponse = await ky.get(`https://api.sunrise-sunset.org/json?lat=${this.location.latitude}&lng=${this.location.longitude}&date=today&formatted=0`).json();
            this.expiration = now.add(1, 'day').set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
            this.state = resp.results as SunriseResults;
        }
        return this.state;
    }

    getId(): string {
        return `${this.location.latitude},${this.location.longitude}`;
    }
}

export default SunriseSunset;
export { SunriseSunset };
export type { Location, SunriseResponse, SunriseResults };
