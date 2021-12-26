# Showpiece

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/CorySanin/showpiece/MultiArchDockerBuild/master) ![Docker Pulls](https://img.shields.io/docker/pulls/corysanin/showpiece) ![Docker Image Size (tag)](https://img.shields.io/docker/image-size/corysanin/showpiece/latest) ![GitHub](https://img.shields.io/github/license/CorySanin/showpiece)

An extremely simple web-based digital signage application.

## Configuration

Here's an example config:

```
{
    // Port for the viewer
    "port": 8080,
    // Port for the control panel
    // (use a different port to restrict access to this interface)
    "controlport": 8080,
    // (optional) provide weather data to modules that support it
    "weather": {
        // Provide an OpenWeatherMap API key
        // https://openweathermap.org/price
        // Showpiece caches the current weather
        // 2 calls / 5 minutes max
        "key": "not0a0real0key00281f631aef6ad3a1",
        // The following  fields can be used to lookup a location:
        // - "coordinates": [lat, long]
        // - "zip" and "country"
        // - "cityid"
        // - "city"
        "city": "chicago"
    }
}
```

## How to Use

```
npm install
npm run build
node index.js
```

Navigate to `http://localhost:8080` on the "sign." Content can be loaded from the control panel at `http://localhost:8080/control`.

## Modules

Screens made for Showpiece are called modules. Each module has its own subdirectory inside of the `modules` directory. The module must contain an `index.html` and any additional files needed for its function (CSS, JS, images, etc). An `icon.png` can also be included, which will appear in the control panel.

Modules can fetch the current weather from `/api/weather` or `/api/all-weather` if a weather config is provided.