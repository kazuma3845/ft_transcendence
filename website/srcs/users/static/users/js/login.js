function attachLoginFormListener() {
    document.getElementById('login-button').addEventListener('click', function() {
        if (window.location.hash ==='#login') {
            history.pushState(null, null, '#');
        } else {
            history.pushState(null, null, '#login');
            // loadSignupForm();
        }
        router();
    });
}

function attachLoginFormSubmitListener() {
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(this);

        fetch('/api/users/profiles/login/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),  // Inclut le token CSRF si nécessaire
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('error-message').textContent = data.error;
                document.getElementById('error-message').style.display = 'block';
            } else {
                // alert('Connexion réussie!');
				checkAuthentication();
                window.location.href = '#';  // Redirige ou recharge l'application après la connexion
                router();  // Recharge l'interface pour refléter l'état connecté
            }
        })
        .catch(error => console.error('Erreur:', error));
    });
}

function loadLoginForm() {
    fetch('/static/users/html/forms/login-form.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        attachLoginFormSubmitListener();
    });
}

function checkAuthentication() {
    fetch('/api/users/profiles/check-auth/')
        .then(response => response.json())
        .then(data => {
            const headerContainer = document.getElementById('nav-main-button');
            headerContainer.innerHTML = ''; // On vide le conteneur avant de le remplir

            if (data.authenticated) {
                // Si l'utilisateur est authentifié, on affiche le message de bienvenue et le bouton de déconnexion
                headerContainer.innerHTML = `
                    <p style="color: white;">Bienvenue, <span style="color: white; font-weight: 800;" >${data.email}</span></p>
                    <button type="click" id="logout-button" class="a-button grey">Déconnexion</button>

                `;
				attachLogoutListener();
                // document.getElementById('logout-form').addEventListener('submit', function(event) {
                //     event.preventDefault();
                //     logoutUser();
                // });

            } else {
                // Si l'utilisateur n'est pas authentifié, on affiche le bouton d'inscription
                headerContainer.innerHTML = `
                    <button id="login-button" class="a-button">Connexion</button>
                `;
				attachLoginFormListener();
            }
        });
}

// Appelle la fonction pour vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', checkAuthentication);

function attachLogoutListener() {
	document.getElementById('logout-button').addEventListener('click', function(event) {
		event.preventDefault();
		logoutUser();
	});

	// Optionnel : Afficher l'email de l'utilisateur connecté
	// document.getElementById('user-email').textContent = getUserEmail();  // Assume que cette fonction est définie
}

function logoutUser() {
    fetch('api/users/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),  // Inclure le token CSRF dans l'en-tête
        },
    })
    .then(response => {
        if (response.ok) {
            // alert('Déconnexion réussie!');
            window.location.href = '#';  // Redirige ou recharge l'application après la déconnexion
			checkAuthentication();
            router();  // Recharge l'interface pour refléter l'état déconnecté
        } else {
            alert('Erreur lors de la déconnexion.');
        }
    })
    .catch(error => console.error('Erreur:', error));
}
