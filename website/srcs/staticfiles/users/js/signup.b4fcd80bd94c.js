function attachSignupFormListener() {
    document.getElementById('signup-button').addEventListener('click', function() {
        if (window.location.hash ==='#signup') {
            history.pushState(null, null, '#');
        } else {
            history.pushState(null, null, '#signup');
            // loadSignupForm();
        }
        router();
    });
}

function loadSignupForm() {
    fetch('/static/users/html/forms/signup-form.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        attachSignupFormSubmitListener();
    });
}

function attachSignupFormSubmitListener() {
    document.getElementById('signup-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(this);

        fetch('/api/users/profiles/', {  // Envoie la requête POST à l'API gérée par le ViewSet
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),  // Inclut le token CSRF dans l'en-tête
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // alert('Inscription réussie!');
                window.location.href = '#';
                updateHeader();
            }
        });
    });
}
