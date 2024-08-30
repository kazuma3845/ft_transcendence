// Fonction pour gérer le routage
function router() {
    const hash = window.location.hash;  // Récupère le fragment d'URL

    switch(hash) {
        case '#signup':
            loadSignupForm();
            break;
        case '#login':
            loadLoginForm();
            break;
        case '#game':
            loadGame();
            break;
        case '#pong':
            loadPong();
            break;
        // Ajoute ici d'autres cas pour d'autres vues
        default:
            loadHome();
            // loadHomePage();  // Par défaut, charge la page d'accueil ou vide le conteneur
            break;
    }
}

// Fonction à appeler lorsqu'une navigation par l'utilisateur est détectée
window.onpopstate = router;

// Charger la vue correcte si l'utilisateur arrive directement sur une URL avec un fragment
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
