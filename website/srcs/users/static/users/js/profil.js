function loadProfil() {
    fetch('/static/users/html/profil/profil.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        // attachLoginFormSubmitListener();
    });
}

function attachLoginFormSubmitListener() {
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();

        // const formData = new FormData(this);

        // fetch('/api/users/profiles/login/', {
        //     method: 'POST',
        //     headers: {
        //         'X-CSRFToken': getCSRFToken(),  // Inclut le token CSRF si nécessaire
        //     },
        //     body: formData
        // })
        // .then(response => response.json())
        // .then(data => {
        //     if (data.error) {
        //         document.getElementById('error-message').textContent = data.error;
        //         document.getElementById('error-message').style.display = 'block';
        //     } else {
        //         // alert('Connexion réussie!');
		// 		updateHeader();
        //         // console.log("window.location.href :", window.location.href)
        //         if (window.location.hash === "#login")
        //             window.location.href = '#';  // Redirige ou recharge l'application après la connexion
        //         router();  // Recharge l'interface pour refléter l'état connecté
        //     }
        // })
        // .catch(error => console.error('Erreur:', error));
    });
}
