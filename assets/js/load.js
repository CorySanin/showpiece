document.addEventListener('DOMContentLoaded', function () {
    var modulebtns = document.querySelectorAll('#modules button.module-btn');
    var expandbtns = document.querySelectorAll('#modules button.expand-btn');
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

    function loadModule(event) {
        var mname = event.currentTarget.querySelector('.module-path').innerText;
        var inputs = event.currentTarget.parentElement.querySelectorAll('form input');
        var params = {};
        inputs.forEach(el => {
            if (el.type === 'checkbox') {
                params[el.name] = el.checked;
            }
            else {
                params[el.name] = el.value;
            }
        });
        fetch('api/load', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'module',
                body: `${mname}/?${new URLSearchParams(params).toString()}`
            })
        });
    }

    modulebtns.forEach(function (btn) {
        btn.addEventListener('click', loadModule);
    });

    function toggleExpand(event) {
        const CLPSD = 'collapsed';
        var parent = event.currentTarget.parentElement;
        if (parent.classList.contains(CLPSD)) {
            parent.classList.remove(CLPSD);
        }
        else {
            parent.classList.add(CLPSD);
        }
    }

    expandbtns.forEach(function (btn) {
        btn.addEventListener('click', toggleExpand);
    });
});