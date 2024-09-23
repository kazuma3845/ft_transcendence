function loadProfil() {
    fetch('/static/users/html/profil/profil.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        addProfil();
    });
}

function addProfil() {
    return fetch('/api/users/profiles/info-user')
    .then(response => response.json())
    .then(data => {
        console.log("DATA", data)
        document.getElementById('username').textContent = data.user.username;
        document.getElementById('email').textContent = data.user.email;
        document.getElementById('bio').textContent = data.bio;
    });
}