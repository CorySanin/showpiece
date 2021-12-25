document.addEventListener('DOMContentLoaded', function () {
    var modulebtns = document.querySelectorAll('#modules button');
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