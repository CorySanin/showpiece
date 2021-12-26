document.addEventListener('DOMContentLoaded', function () {
    var modulebtns = document.querySelectorAll('#modules button');
    var urltxt = document.getElementById('urltxt');
    var submitbtn = document.getElementById('submitbtn');

    function submitUrl() {
        fetch('api/load', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'url',
                body: urltxt.value
            })
        });
        urltxt.value = '';
    }

    submitbtn.addEventListener('click', submitUrl);
    urltxt.addEventListener('keyup', function (e) {
        if (e.key === 'Enter') {
            submitUrl();
        }
    });

    modulebtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            let mname = btn.querySelector('.module-name').innerText;
            fetch('api/load', {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'module',
                    body: mname
                })
            });
        });
    });
});