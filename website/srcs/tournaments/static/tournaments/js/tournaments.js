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
    const response = await fetch('/api/tournaments/tournament/', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(), // Assure-toi que cette fonction est bien définie
        },
        body: JSON.stringify(data),
    });
    const data_1 = await response.json();
    if (data_1.error) {
        console.log("ca foir le createTourSession")
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

                // Ajoute player1 dans les données s'il est défini
                console.log("player1 :", player1);
                if (player1) data["player1"] = player1;

                // Appelle la fonction pour créer une session de tournoi
                createTourSession(data)
                    .then((tourData) => {
                        // Appel à l'API pour créer la conversation associée au tournoi
                        return fetch('/api/messaging/conversations/create_tour_conv/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCSRFToken(),
                            },
                            body: JSON.stringify({ tour: tourData.id })  // Envoyer l'ID du tournoi créé
                        }).then((response) => {
                            if (!response.ok) {
                                throw new Error(`Erreur lors de la création de la conversation : ${response.statusText}`);
                            }
                            return response.json(); // Convertir la réponse en JSON
                        })
                        .then((convData) => {
                            console.log('Nouvelle conversation créée pour le tournoi:', convData);

                            // Charger les conversations et connecter le WebSocket
                            connectWebSocket();
                            socket.onopen = function () {
                                sendTourConv(convData.id, `${currentUser} a créé le tournois`);
                            };

                            // Rediriger vers le jeu après la création de la conversation et tout le chargement
                            let sessionId = tourData.game_1_1.id;  // Accéder à game_1_1 à partir de tourData
                            window.location.href = `/#game?sessionid=${sessionId}`;
                        });
                    })
                    .catch((error) => {
                        console.error("Erreur lors de la création du tournoi ou de la conversation:", error);
                        document.getElementById('error-message').textContent = error.message;
                        document.getElementById('error-message').style.display = 'block';
                    });
            });
    }

async function fetchAvailableTours() {
    try {
        // Effectuer un appel GET à l'API des tournois
        const response = await fetch("/api/tournaments/tournament/");

        // Vérifier si la requête a réussi
        if (!response.ok) {
            throw new Error(`Erreur: ${response.status}`);
        }

        const tournaments = await response.json();

        const tourList = document.getElementById("tour-list");

        // Vider le contenu précédent
        tourList.innerHTML = "";

        if (tournaments.length === 0) {
            document.getElementById("current-tours").textContent = "No tournaments available";
        }

        // Filtrer les tournois dont participantNum est < 4
        const availableTours = tournaments.filter(tour =>
            tour.participantNum < 4 && !tour.participants.includes(currentUser)
        );

        // Parcourir les tournois disponibles et créer un lien pour chacun
        availableTours.forEach((tour) => {
            const listItem = document.createElement("li"); // Créer un élément <li>
            const link = document.createElement("a"); // Créer un élément <a> pour le lien

            // Définir l'URL du lien et son texte
            link.href = `#`; // Pas de redirection directe
            link.textContent = `Rejoindre le tournoi ${tour.id}`;

            // Ajouter un événement de clic pour le lien
            link.addEventListener("click", function (event) {
                event.preventDefault(); // Empêcher la redirection par défaut
                joinTour(tour.id); // Appeler la fonction pour rejoindre le tournoi
            });

            listItem.appendChild(link);
            tourList.appendChild(listItem);
        });

        if (availableTours.length === 0) {
            document.getElementById("current-tours").textContent = "No tournaments available";
        }

    } catch (error) {
        console.error("Erreur lors de la récupération des tournois:", error);
    }
}

async function joinTour(tourId) {
    try {
        // Appeler l'API pour rejoindre la session
        const response = await fetch(`/api/tournaments/tournament/${tourId}/join_tour/`, {
            method: 'POST', // Utilisation de POST pour rejoindre la session
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),  // Assurez-vous que le token CSRF est inclus si nécessaire
            },
        });
        const conv = await getTourConversation(tourId);
        const tour = await getTour(tourId);
        console.log('tour ==> ',tour);
        const convId = conv.id;

        // Si convId est valide, connecter WebSocket et envoyer un message
        if (convId) {
            connectWebSocket();
            socket.onopen = function () {
                sendTourConv(convId, `${currentUser} a rejoint le tournoi`);
                if (tour.participantNum === 2)
                    sendTourConv(convId, `${tour.participants[0]} affronte ${tour.participants[1]}`);
                if (tour.participantNum === 4)
                    sendTourConv(convId, `${tour.participants[2]} affronte ${tour.participants[3]}`);
            };
        }
    // Vérifier si la requête a réussi
    if (!response.ok) {
    throw new Error(
        `Erreur lors de la connexion au tournoi: ${response.status}`
    );
    }
    } catch (error) {
        console.error("Erreur lors de la connexion à la session:", error);
    }
}

async function getTourConversation(tourId) {
    try {
        // Appeler l'API pour récupérer la conversation liée au tournoi
        const response = await fetch(`/api/messaging/conversations/tour/${tourId}/`);

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de la conversation: ${response.status}`);
        }

        const conversation = await response.json();
        return conversation;  // Retourne l'ID de la conversation
    } catch (error) {
        console.error("Erreur lors de la récupération de la conversation du tournoi:", error);
    }
}

async function getTour(tourId) {
    try {
        // Appeler l'API pour récupérer la conversation liée au tournoi
        const response = await fetch(`/api/tournaments/tournament/${tourId}/`);

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de la conversation: ${response.status}`);
        }

        const tour = await response.json();
        return tour;  // Retourne l'ID de la conversation
    } catch (error) {
        console.error("Erreur lors de la récupération de la conversation du tournoi:", error);
    }
}
