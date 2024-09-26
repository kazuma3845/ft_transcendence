function loadTournamentsForm() {
    fetch('/static/tournaments/html/tournaments.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        test();
    });
}

function test() {
    document.getElementById('tournaments').addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        data['power'] = document.getElementById('power').checked;
        data['bot'] = false;

        try {
            const response = await fetch('/api/game/sessions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.error) {
                displayError(result.error);
            } else {
                handleSuccess(result.id);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    });
}

function displayError(errorMessage) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = errorMessage;
    errorElement.style.display = 'block';
}

async function handleSuccess(tournamentsId) {
    localStorage.setItem('tournament_session_id', tournamentsId);
    console.log('Current session ID in Local Storage:', localStorage.getItem('tournament_session_id'));

    try {
        await loadtournament();
        if (tournamentsId) {
            startWebSocket(tournamentsId);
        }
    } catch (error) {
        console.error('Erreur lors du chargement du formulaire de jeu:', error);
    }
}

function loadtournament() {
    fetch('/static/tournaments/html/startTournaments.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        // loadTournamentsGame();
        console.log("Tounarmanent start")
    });
}

// function loadTournamentsGame() {
//     return new Promise((resolve, reject) => {
//         fetch('/static/game/html/game.html')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.text();
//         })
//         .then(html => {
//             document.getElementById('app').innerHTML = html;
//             resolve();
//         })
//         .catch(error => {
//             console.error('Erreur lors du chargement de la page de jeu:', error);
//             reject(error);
//         });
//     });
// }