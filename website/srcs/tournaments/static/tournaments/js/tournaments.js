function loadTourForm() {
    fetch("/static/tournaments/html/tour-form.html")
        .then((response) => response.text())
        .then((html) => {
        document.getElementById("app").innerHTML = html;
        attachTourFormSubmitListener(currentUser);
        });
    }

async function createTourSession(data) {
    // Envoie les données à l'API pour créer une nouvelle session de jeu
    const response = await fetch('/api/tournaments/tour/', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(), // Assure-toi que cette fonction est bien définie
        },
        body: JSON.stringify(data),
    });
    const data_1 = await response.json();
    if (data_1.error) {
        throw new Error(data_1.error);
    }
    return data_1;
    }

    function attachTourFormSubmitListener(player1 = null) {
        document
            .getElementById("tour-form")
            .addEventListener("submit", function (event) {
                event.preventDefault(); // Empêche le rechargement de la page

                const formData = new FormData(this);
                const data = {};

                // Convertit le formulaire en un objet JS
                formData.forEach((value, key) => {
                    data[key] = value;
                });

                // Ajoute player1 et player2 dans les données s'ils sont définis
                if (player1) data["player1"] = player1;

                // Appelle la fonction pour créer une session de jeu avec les données
                createTourSession(data)
                    .then((tourData) => {
                        createGameSession(data, tourData.id)
                            .then((sessionData) => {
                                createGameSession(data);
                                let sessionId = sessionData.id;
                                window.location.href = `/#game?sessionid=${sessionId}`;

                            })
                            .catch((error) => {
                                console.error("Erreur lors de la création de la session de jeu:", error);
                                document.getElementById('error-message').textContent = error.message;
                                document.getElementById('error-message').style.display = 'block';
                            });
                    })
                    .catch((error) => {
                        console.error("Erreur lors de la création du tournoi:", error);
                        document.getElementById('error-message').textContent = error.message;
                        document.getElementById('error-message').style.display = 'block';
                    });
            });
    }

// Fonction pour appeler l'API et afficher les GameSessions disponibles
async function fetchAvailableTours() {
    // try {
    //     // Effectuer un appel GET à l'API
    //     const response = await fetch("/api/game/sessions/available_sessions/");

    //     // Vérifier si la requête a réussi
    //     if (!response.ok) {
    //     throw new Error(`Erreur: ${response.status}`);
    //     }

    //     const sessions = await response.json();

    //     const sessionList = document.getElementById("session-list");

    //     // Vider le contenu précédent
    //     sessionList.innerHTML = "";

    //     if (sessions.length === 0) {
    //     document.getElementById("current-game-rooms").textContent =
    //         "No room available";
    //     }
    //     // Parcourir les sessions et créer un lien pour chacune
    //     sessions.forEach((session) => {
    //     const listItem = document.createElement("li"); // Créer un élément <li>
    //     const link = document.createElement("a"); // Créer un élément <a> pour le lien

    //     // Définir l'URL du lien et son texte
    //     link.href = `#`; // Pas de redirection directe
    //     link.textContent = `Rejoindre la session ${session.id}`;

    //     // Ajouter un événement de clic pour le lien
    //     link.addEventListener("click", function (event) {
    //         event.preventDefault(); // Empêcher la redirection par défaut
    //         joinGame(session.id); // Appeler la fonction pour rejoindre le jeu
    //     });

    //     listItem.appendChild(link);
    //     sessionList.appendChild(listItem);
    //     });
    // } catch (error) {
    //     console.error("Erreur lors de la récupération des sessions:", error);
    // }
}
