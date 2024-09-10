

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

        // Utiliser FormData pour récupérer les données du formulaire
        const formData = new FormData(this);

        // Convertir FormData en un objet JavaScript
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Pour les cases à cocher, s'assurer d'avoir une valeur booléenne
        data['power'] = document.getElementById('power').checked;
        data['bot'] = document.getElementById('bot').checked;

        // Convertir l'objet en JSON et envoyer avec fetch
        fetch('/api/game/sessions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),  // Assurez-vous que le token CSRF est inclus si nécessaire
            },
            body: JSON.stringify(data)  // Convertir l'objet en JSON
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('error-message').textContent = data.error;
                document.getElementById('error-message').style.display = 'block';
            } else {
                loadGame();  // Charger la session de jeu si elle est créée avec succès
                const sessionId = data.id;  // Supposons que l'ID de la session soit renvoyé dans `data.id`
                if (sessionId) {
                    startWebSocket(sessionId);  // Appeler une fonction pour gérer la session créée avec l'ID
                }
            }
        })
        .catch(error => console.error('Erreur:', error));
    });
}

// function createGameSession() {
//     fetch('/api/game/sessions/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'X-CSRFToken': getCSRFToken()  // Si nécessaire pour les requêtes POST
//         },
//         body: JSON.stringify({
//             // Vous pouvez passer des données supplémentaires ici si nécessaire
//         })
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();  // Convertir la réponse en JSON
//     })
//     .then(data => {
//         console.log('Game session created:', data);
//         const sessionId = data.id;  // Supposons que l'ID de la session soit renvoyé dans `data.id`
//         if (sessionId) {
//             startWebSocket(sessionId);  // Appeler une fonction pour gérer la session créée avec l'ID
//         }
//     })
//     .catch(error => {
//         console.error('There was a problem with the fetch operation:', error);
//     });
// }


function loadGame() {
    fetch('/static/game/html/game.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        // startWebSocket(sessionId);
        // attachLoginFormSubmitListener();
		// attachSingleGameListener();
    });
}

function loadPong() {
    fetch('/static/game/html/pong.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        // attachLoginFormSubmitListener();
		// attachSingleGameListener();
    });
}

function startSingleGame() {
    fetch('/api/game/sessions/start_single/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to start game session');
        }
        return response.json();
    })
    .then(data => {
        const sessionId = data.id;
        const player1 = data.player1;

        // Traite les données de la session ici
        // startWebSocket(sessionId);
        console.log(`Game Session ID: ${sessionId}, Player1: ${player1}`);
    })
    .catch(error => console.error('Error:', error));
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

function attachSingleGameListener() {
	document.getElementById('myButton').addEventListener('click', function() {
			// Appeler la fonction souhaitée
			startSingleGame();
	});
}

function startWebSocket(sessionId) {
    const socket = new WebSocket(`ws://${window.location.host}/ws/game/sessions/${sessionId}/`);

    socket.onopen = function(e) {
        console.log('WebSocket connected.');
    };

    socket.onmessage = function(e) {
        console.log('Message received:', e.data);
        try {
            const data = JSON.parse(e.data);
            console.log('Parsed data:', data.type);
            if (data.type === 'game_score') {
                updateScoreDisplay(data.player1, data.player1_points, data.player2_points);
            }
            if (data.type === 'display_player1') {
                console.log('->> displayPlayer1');
                displayPlayer1(data.player1, data.player2);
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
        console.log('Updating scores:', player1Points, player2Points);
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

    function displayPlayer1(username, username2) {
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

const allowedValues = [1, 3, 5, 7, 9, 11];

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
