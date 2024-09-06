document.addEventListener('DOMContentLoaded', function() {

});

function loadHome() {
    fetch('/static/html/home.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        // attachSignupFormSubmitListener();
    });
}

// Charger les parties de jeu
function loadGames() {
	// Code pour charger les parties depuis l'API du jeu
}

// Charger les classements
function loadLeaderboards() {
	// Code pour charger les classements depuis l'API des classements
}
