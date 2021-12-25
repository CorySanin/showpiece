document.addEventListener('DOMContentLoaded', function () {
    var minuteh = document.getElementById('minute');
    var hourh = document.getElementById('hour');
    var secondh = document.getElementById('second');

    function getParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const color = urlParams.get('color');
        document.body.style.backgroundColor = color;
    }

    function updateHands() {
        var d = new Date();
        var sec = (d.getTime() / 1000) % 60;
        var min = d.getMinutes() + (sec / 60);
        var hour = d.getHours() + (min / 60);
        secondh.style.transform = `rotate(${sec * 6}deg)`;
        minuteh.style.transform = `rotate(${min * 6}deg)`;
        hourh.style.transform = `rotate(${hour * 30}deg)`;
    }

    setInterval(updateHands, 50);

    getParams();
    updateHands();
});