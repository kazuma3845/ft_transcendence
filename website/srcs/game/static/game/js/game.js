const allowedValues = [1, 3, 5, 7, 9, 11];

function loadGameForm() {
    fetch('/static/game/html/game-form.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        attachGameFormSubmitListener();
    });
}

function attachGameFormSubmitListener() {
    document.getElementById('game-form').addEventListener('submit', function(event) {
        event.preventDefault();  // Empêche le rechargement de la page

        const formData = new FormData(this);
        const data = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });

        data['power'] = document.getElementById('power').checked;
        data['bot'] = document.getElementById('bot').checked;

        fetch('/api/game/sessions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('error-message').textContent = data.error;
                document.getElementById('error-message').style.display = 'block';
            } else {
                let sessionId = data.id;
                localStorage.setItem('game_session_id', sessionId);
                console.log('Current session ID in Local Storage:', localStorage.getItem('game_session_id'));
                // Charger le formulaire de jeu avec loadGameForm() et attendre qu'il soit chargé
                loadGame().then(() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe) {
                        iframe.onload = function() {
                            iframe.contentWindow.postMessage({ gameSessionId: sessionId }, '*');
                        };
                    } else {
                        console.error('Iframe not found');
                    }

                    if (sessionId) {
                        startWebSocket(sessionId);  // Appeler une fonction pour gérer la session créée
                    }
                }).catch(error => {
                    console.error('Erreur lors du chargement du formulaire de jeu:', error);
                });
            }
        })
        .catch(error => console.error('Erreur:', error));
    });
}

function loadGame() {
    return new Promise((resolve, reject) => {
        fetch('/static/game/html/game.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('app').innerHTML = html;

            // Si tu veux démarrer la WebSocket ou attacher des listeners après le chargement de la page, tu peux les appeler ici.
            // startWebSocket(sessionId);
            // attachLoginFormSubmitListener();
            // attachSingleGameListener();

            resolve();  // Résoudre la promesse une fois que tout est chargé
        })
        .catch(error => {
            console.error('Erreur lors du chargement de la page de jeu:', error);
            reject(error);  // Rejeter la promesse en cas d'erreur
        });
    });
}

function updateScore(sessionId, player1Points, player2Points) {
    fetch(`/api/game/sessions/${sessionId}/update_score/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({
            player1_points: player1Points,
            player2_points: player2Points
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update scores');
        }
        return response.json();
    })
    .then(data => {
        // console.log('Updated Scores:', data);
        // Mettez à jour l'affichage du score dans l'interface utilisateur si nécessaire
    })
    .catch(error => console.error('Error:', error));
}

function loadGameSessions() {
    fetch('/api/game/sessions/')
        .then(response => response.json())
        .then(data => {
            let gameList = document.getElementById('app');
            gameList.innerHTML = '';

            data.forEach(session => {
                let listItem = document.createElement('li');
                listItem.textContent = `${session.player1} vs ${session.player2} - Début: ${session.start_time}`;
                if (session.end_time) {
                    listItem.textContent += ` - Fin: ${session.end_time} - Gagnant: ${session.winner}`;
                }
                gameList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching game sessions:', error));
}

function updateValue(id, value) {
    document.getElementById(id).textContent = value;
}

function updateCheckboxValue(id, isChecked) {
    document.getElementById(id).textContent = isChecked ? 'On' : 'Off';
}

function updateWinNumber() {
    const rangeInput = document.getElementById('actual_win_number');
    const displayValue = document.getElementById('actual_win_number_value');
    const hiddenInput = document.getElementById('win_number');

    // Map the range slider position (1 to 5) to the allowed values
    const selectedValue = allowedValues[rangeInput.value - 1];

    // Update the display value
    displayValue.textContent = selectedValue;

    hiddenInput.value = selectedValue;
}

// Set initial value on load
window.onload = function() {
    // Vérifier si l'élément avec l'ID "game-form" est présent dans le DOM
    const gameForm = document.getElementById('game-form');

    if (gameForm) {
        // Si l'élément existe, appelez la fonction updateWinNumber
        updateWinNumber();
    }
};

// Fonction pour appeler l'API et afficher les GameSessions disponibles
async function fetchAvailableSessions() {
    try {
        // Effectuer un appel GET à l'API
        const response = await fetch('/api/game/sessions/available_sessions/');

        // Vérifier si la requête a réussi
        if (!response.ok) {
            throw new Error(`Erreur: ${response.status}`);
        }

        // Récupérer les données JSON de l'API
        const sessions = await response.json();

        // Sélectionner l'élément HTML où afficher les liens
        const sessionList = document.getElementById('session-list');

        // Vider le contenu précédent
        sessionList.innerHTML = '';

        // Parcourir les sessions et créer un lien pour chacune
        sessions.forEach(session => {
            const listItem = document.createElement('li'); // Créer un élément <li>
            const link = document.createElement('a'); // Créer un élément <a> pour le lien

            // Définir l'URL du lien et son texte
            link.href = `#`; // Pas de redirection directe
            link.textContent = `Rejoindre la session ${session.id}`;

            // Ajouter un événement de clic pour le lien
            link.addEventListener('click', function(event) {
                event.preventDefault(); // Empêcher la redirection par défaut
                joinGame(session.id); // Appeler la fonction pour rejoindre le jeu
            });

            // Ajouter le lien à l'élément <li> et l'élément <li> à la liste
            listItem.appendChild(link);
            sessionList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des sessions:', error);
    }
}

async function joinGame(sessionId) {
    try {
        // Appeler l'API pour rejoindre la session
        const response = await fetch(`/api/game/sessions/${sessionId}/join_game/`, {
            method: 'POST', // Utilisation de POST pour rejoindre la session
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),  // Assurez-vous que le token CSRF est inclus si nécessaire
            },
        });

        // Vérifier si la requête a réussi
        if (!response.ok) {
            throw new Error(`Erreur lors de la connexion à la session: ${response.status}`);
        }

        // Si l'appel API est réussi, lancer la fonction pour charger le jeu
        console.log(`Vous avez rejoint la session ${sessionId}`);
        localStorage.setItem('game_session_id', sessionId);
        // console.log("ENV VARIABLE: ", response.env_variable)
        // Charger le formulaire de jeu avec loadGameForm() et attendre qu'il soit chargé
        loadGame().then(() => {
            const iframe = document.querySelector('iframe');
            if (iframe) {
                iframe.onload = function() {
                    iframe.contentWindow.postMessage({ gameSessionId: sessionId }, `http://10.18.203.86:8080`);
                };
            } else {
                console.error('Iframe not found');
            }

            if (sessionId) {
                startWebSocket(sessionId);  // Appeler une fonction pour gérer la session créée
            }
        }).catch(error => {
            console.error('Erreur lors du chargement du formulaire de jeu:', error);
        });


    } catch (error) {
        console.error('Erreur lors de la connexion à la session:', error);
    }
}

// ####################### ---------------- WEBSOCKET ---------------- #######################
function startWebSocket(sessionId) {
    const socket = new WebSocket(`ws://10.18.203.86:8000/ws/game/sessions/${sessionId}/`);

    socket.onopen = function(e) {
        console.log('WebSocket connected.');
    };

    socket.onmessage = function(e) {
        // console.log('Message received:', e.data);
        try {
            const data = JSON.parse(e.data);
            // console.log('F-E: client websocket parsed data:', data);
            if (data.type === 'game_score') {
                updateScoreDisplay(data.player1, data.player1_points, data.player2_points);
            }
            if (data.type === 'display_player') {
                displayPlayer(data.player1, data.player2);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };

    socket.onclose = function(e) {
        console.log('WebSocket closed.');
    };

    socket.onerror = function(e) {
        console.error('WebSocket error:', e);
    };

    function updateScoreDisplay(username, player1Points, player2Points) {
        // console.log('Updating scores:', player1Points, player2Points);
        const player1Elem = document.getElementById('player1');
        const player1ScoreElem = document.getElementById('player1Score');
        const player2ScoreElem = document.getElementById('player2Score');

        if (player1ScoreElem && player2ScoreElem && player1Elem) {
            player1Elem.textContent = username;
            player1ScoreElem.textContent = player1Points;
            player2ScoreElem.textContent = player2Points;
        } else {
            console.error('Score elements not found in the DOM');
        }
    }

    function displayPlayer(username, username2) {
        const player1Elem = document.getElementById('player1');
        const player2Elem = document.getElementById('player2');

        if (player1Elem) {
            player1Elem.textContent = username;
            player2Elem.textContent = username2;
        } else {
            console.log('---->> : ', username);
            console.error('Score elements not found in the DOM');
        }
    }
}
