document.addEventListener('DOMContentLoaded', function () {
    const minute = 60000;
    const weatherInterval = 180000;
    const time = document.getElementById('time');
    const tempcontainer = document.getElementById('temps');
    const temp = document.getElementById('temp');
    const high = document.getElementById('high');
    const low = document.getElementById('low');
    const weatherdiv = document.getElementById('weatherdiv');
    var sun = null;
    var metric = true;
    var clock24h = true;
    var currentWeather = null;

    function getParams() {
        const urlParams = new URLSearchParams(window.location.search);
        var string = urlParams.get('metric');
        metric = string === null || string === 'true';
        string = urlParams.get('24h');
        clock24h = string === null || string === 'true';
    }

    function getHours(hours, mod) {
        const h = hours % mod;
        if (h === 0) {
            return mod;
        }
        return h;
    }

    function updateTime() {
        var d = new Date();
        var hours = d.getHours();
        var suffix = '';
        if (!clock24h) {
            suffix = ' ' + (Math.floor(hours / 12) ? 'PM' : 'AM');
        }

        emptyElement(time).appendChild(document.createTextNode(`${('' + getHours(hours, clock24h ? 24 : 12)).padStart(clock24h ? 2 : 1, '0')}:${('' + d.getMinutes()).padStart(2, '0')}${suffix}`));
        resizeTemp();
        setDayNight(d);
        setTimeout(updateTime, minute - (d.getTime() % minute));
    }

    function emptyElement(e) {
        while (e.firstChild) {
            e.removeChild(e.lastChild);
        }
        return e;
    }

    function formatTemp(t) {
        if (metric) {
            t = (t - 32) / 1.8;
        }
        return `${Math.round(t)}°`;
    }

    function resizeTemp() {
        tempcontainer.style.width = `${time.offsetWidth}px`;
    }

    function setDayNight(d = new Date()) {
        if (sun) {
            document.body.classList.forEach(function (c) {
                document.body.classList.remove(c);
            });
            document.body.classList.add((d >= sun.sunrise && d < sun.sunset) ? 'day' : 'night');
        }
    }

    function getWeather() {
        fetch('/api/all-weather')
            .then(resp => resp.json())
            .then(weather => {
                currentWeather = weather.list[0];
                weatherdiv.classList.forEach(function (c) {
                    weatherdiv.classList.remove(c);
                });
                currentWeather.weather.forEach(function (w) {
                    weatherdiv.classList.add(w.main);
                });
                emptyElement(temp).appendChild(document.createTextNode(formatTemp(currentWeather.main.temp)));
                emptyElement(high).appendChild(document.createTextNode(formatTemp(currentWeather.main.temp_max) + '⭎'));
                emptyElement(low).appendChild(document.createTextNode(formatTemp(currentWeather.main.temp_min) + '⭏'));
            });
    }

    function getSun() {
        fetch('/api/sun')
            .then(resp => resp.json())
            .then(s => {
                sun = {
                    sunrise: new Date(s.sunrise),
                    sunset: new Date(s.sunset)
                }
                setDayNight();
            });
    }

    getParams();
    getSun();
    updateTime();
    getWeather();
    window.addEventListener('resize', resizeTemp);
    setInterval(getWeather, weatherInterval);
    setInterval(getSun, weatherInterval);
});