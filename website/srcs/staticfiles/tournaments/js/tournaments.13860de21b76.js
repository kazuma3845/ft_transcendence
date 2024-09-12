
function loadTournamentsForm() {
    fetch('/static/tournaments/html/tournaments.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
    });
}

