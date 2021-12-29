document.addEventListener('DOMContentLoaded', function () {
    const weatherdiv = document.getElementById('weatherdiv');
    const pixi = new PIXI.Application({ transparent: true });
    weatherdiv.appendChild(pixi.view);
    const sprites = [];
    const snowflakeG = new PIXI.Graphics();
    snowflakeG.lineStyle(0);
    snowflakeG.beginFill(0xFFFFFF, 1);
    snowflakeG.drawCircle(0, 0, 3);
    snowflakeG.endFill();
    const drizzleG = new PIXI.Graphics();
    drizzleG.lineStyle(3, 0xFFFFFF, .6);
    drizzleG.lineTo(-3, 15);
    drizzleG.closePath();
    const rainG = new PIXI.Graphics();
    rainG.lineStyle(3, 0xFFFFFF, .7);
    rainG.lineTo(-7.5, 37.5);
    rainG.closePath();
    const fogG = new PIXI.Graphics();
    fogG.lineStyle(0);
    fogG.beginFill(0x607D8B, .5);
    fogG.drawCircle(0, 0, 50);
    fogG.endFill();
    const cloudMaxOpacity = .8;
    const cloudG = new PIXI.Graphics();
    cloudG.lineStyle(0);
    cloudG.beginFill(0xECEFF1, 1);
    cloudG.drawCircle(0, 0, 50);
    cloudG.endFill();
    var lastFrame = (new Date()).getTime();
    var lastGen = {
        snow: lastFrame,
        rain: lastFrame,
        fog: lastFrame,
        cloud: lastFrame
    };
    let count = 0;

    pixi.ticker.add((delta) => {
        count++;
        let t = (new Date()).getTime();
        let weather = weatherdiv.classList;
        if (weather.contains('Snow')) {
            if (t - lastGen.snow >= 100000 / pixi.view.width) {
                let g = new PIXI.Graphics(snowflakeG.geometry);
                pixi.stage.addChild(g);
                sprites.push({
                    type: 'snow',
                    x: Math.random() * pixi.view.width,
                    y: -10,
                    speedx: -.4,
                    speedy: 2,
                    graphic: g
                });
                lastGen.snow = t;
            }
        }
        if (weather.contains('Rain') || weather.contains('Drizzle') || weather.contains('Thunderstorm')) {
            let drizzle = weather.contains('Drizzle');
            if (t - lastGen.rain >= (drizzle ? 50000 : 20000) / pixi.view.width) {
                let g = new PIXI.Graphics((drizzle ? drizzleG : rainG).geometry);
                pixi.stage.addChild(g);
                let variance = Math.random() / 2 + 1;
                sprites.push({
                    type: 'rain',
                    x: Math.random() * pixi.view.width,
                    y: -20,
                    mag: drizzle ? 1.5 : 3,
                    speedx: -1.6 * (drizzle ? 1 : 3) * variance,
                    speedy: 8 * (drizzle ? 1 : 3) * variance,
                    graphic: g
                });
                lastGen.rain = t;
            }
        }
        if (weather.contains('Clouds') || weather.contains('Fog') || weather.contains('Mist') || weather.contains('Haze') || weather.contains('Dust') || weather.contains('Smoke')) {
            let fog = weather.contains('Fog') || weather.contains('Haze') || weather.contains('Dust');
            if (t - lastGen.cloud >= 300000 / pixi.view.width && true) {
                let g = new PIXI.Graphics((fog ? fogG : cloudG).geometry);
                g.alpha = 0;
                pixi.stage.addChild(g);
                let variance = Math.random() * .8 + .3;
                sprites.push({
                    type: 'cloud',
                    x: Math.random() * pixi.view.width,
                    y: Math.random() * (pixi.view.height * .20) + 30,
                    speedx: .5 * variance * (Math.random() >= .5 ? 1 : -1),
                    speedy: 0,
                    dying: false,
                    countdown: 0,
                    graphic: g
                });
                lastGen.cloud = t;
            }
        }
        sprites.forEach(function (s, index) {
            s.graphic.x = s.x;
            s.graphic.y = s.y;
            if (s.type === 'snow') {
                s.speedx = Math.min(Math.max(s.speedx + (Math.floor(Math.random() * 2) ? .04 : -.04), -1), 1);
            }
            else if (s.type === 'cloud') {
                if (s.dying) {
                    s.graphic.alpha = Math.min((s.countdown -= delta / 100), cloudMaxOpacity);
                }
                else {
                    s.graphic.alpha = Math.min((s.countdown += delta / 100), cloudMaxOpacity);
                    s.dying = s.countdown >= 5;
                }
            }
            s.x += s.speedx * delta;
            let wrapTolerance = (s.type === 'snow' || s.type === 'rain') ? 3 : 50;
            if (s.x < -wrapTolerance) {
                s.x = pixi.view.width - s.x;
            }
            else if (s.x > pixi.view.width + wrapTolerance) {
                s.x = -wrapTolerance;
            }
            s.y += s.speedy * delta;
            if (s.y > pixi.view.height || s.graphic.alpha <= 0) {
                s.graphic.destroy();
                sprites.splice(index, 1);
            }
        });
        lastFrame = t;
    });

    function resizeCanvas() {
        pixi.renderer.resize(window.innerWidth, window.innerHeight);
        pixi.view.width = window.innerWidth;
        pixi.view.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
});