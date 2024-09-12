
function loadTournamentsForm() {
    fetch('/static/tournaments/html/tournaments.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
    });
}

function loadJointTournamentsForm() {
    fetch('/static/tournaments/html/jointournaments.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
    });
}

function loadCreatTournamentsForm() {
    fetch('/static/tournaments/html/creat.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
    });
}
