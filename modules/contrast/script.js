document.addEventListener('DOMContentLoaded', function () {
    var minuteh = document.getElementById('minute');
    var hourh = document.getElementById('hour');
    var s1 = document.querySelector('.second.s1');
    var s2 = document.querySelector('.second.s2');
    var secondh = s1;
    var prevseconds = (new Date()).getSeconds();

    function updateHands() {
        var d = new Date();
        var sec = d.getSeconds();
        if(prevseconds > 0 && sec === 0){
            sec = 60;
            if(prevseconds < sec){
                swapHands();
            }
        }
        if(sec === 30 && sec > prevseconds){
            resetHand();
        }
        prevseconds = sec;
        var min = d.getMinutes() + ((d.getTime() / 1000 % 60) / 60);
        var hour = d.getHours() + (min / 60);
        secondh.style.transform = `rotate(${sec * 6}deg)`;
        minuteh.style.transform = `rotate(${min * 6}deg)`;
        hourh.style.transform = `rotate(${hour * 30}deg)`;
    }

    function swapHands() {
        setTimeout(function () {
            prevseconds = 0;
            secondh.style.visibility = 'hidden';
            secondh = (secondh === s1) ? s2 : s1;
            secondh.style.visibility = 'visible';
        }, 500);
    }

    function resetHand() {
        (secondh === s1 ? s2 : s1).style.transform = 'rotate(0deg)';
    }

    setInterval(updateHands, 50);

    getParams();
    updateHands();
});