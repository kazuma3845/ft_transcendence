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

function loadGame() {
    fetch('/static/game/html/game.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        // attachLoginFormSubmitListener();
		attachSingleGameListener();
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
        console.log(`Game Session ID: ${sessionId}, Player1: ${player1}`);
    })
    .catch(error => console.error('Error:', error));
}

function attachSingleGameListener() {
	document.getElementById('myButton').addEventListener('click', function() {
			// Appeler la fonction souhaitée
			startSingleGame();
	});
}
