// Fonction pour gérer le routage
function router() {
    const hash = window.location.hash;  // Récupère le fragment d'URL

    checkAuthentication()
        .then(isAuthenticated => {
            switch(hash) {
                case '#signup':
                    loadSignupForm();
                    break;
                case '#login':
                    loadLoginForm();
                    break;
                case '#game':
                    if (isAuthenticated) {
                        loadGameForm();
                        fetchAvailableSessions();
                    } else {
                        loadLoginForm();  // Rediriger vers la page de connexion si non authentifié
                    }
                    break;
                case '#tournaments':
                    loadTournamentsForm();
                    break;
                case '#createTournament':
                    loadCreatTournamentsForm();
                    break;
                case '#profil':
                    if (isAuthenticated)
                        loadProfil();
                    else
                        loadLoginForm();
                    break;
                default:
                    loadHome();
                    break;
            }
        })
        .catch(error => {
            console.error('Error in router:', error);  // Log des erreurs dans router
        });
}

window.addEventListener('hashchange', router); //Detecte les changemtns d'url via le changement de HASH
document.addEventListener("DOMContentLoaded", router);

function getCSRFToken() {
    // Récupère le token CSRF du cookie
    let cookieValue = null;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            cookieValue = cookie.substring('csrftoken='.length);
            break;
        }
    }
    return cookieValue;
}
