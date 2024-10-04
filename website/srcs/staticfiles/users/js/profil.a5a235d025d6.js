async function fetchUserInfo() {
  if (!userInfo) {
    const response = await fetch("/api/users/profiles/info-user");
    const data = await response.json();
    userInfo = data;
  }
  return userInfo;
}

function loadProfil() {
  fetch("/static/users/html/profil/profil.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;
      addProfil();
    });
}

function addProfil() {
  return fetchUserInfo()
    .then((data) => {
      console.log("DATA", data);

      document.getElementById("username").textContent = data.user.username;
      document.getElementById("email").textContent = data.user.email;
      document.getElementById("bio").textContent = data.bio
        ? data.bio
        : "Ceci est une bio vraiment pas très intéressante. J'imagine que j'aime le pong puisque je suis ici. (Aidez moi à trouver un stage svp)";

      document.querySelector(".avatar-div img").src = data.avatar_url
        ? data.avatar_url
        : "/static/users/avatars/avatar.png";

      document.querySelector(".div-banner img").src = data.banner
        ? data.banner
        : "/static/users/banners/ping-pong.gif";

      // Appel de la fonction pour créer le chart
      createWinrateChart(data.stats.win, data.stats.loss);
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des infos utilisateur:",
        error
      );
    });
}

// Fonction pour créer et afficher le winrate chart
function createWinrateChart(wins, losses) {
  const ctx = document.getElementById('winrateChart').getContext('2d');
  const winrateChart = new Chart(ctx, {
    type: 'doughnut', // Type de graphique, ici un doughnut
    data: {
      labels: ['Wins', 'Losses'], // Étiquettes des segments
      datasets: [{
        label: 'Winrate',
        data: [wins, losses], // Les données que tu récupères
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)', // Couleur des "wins"
          'rgba(255, 99, 132, 0.2)'  // Couleur des "losses"
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)', // Bordure des "wins"
          'rgba(255, 99, 132, 1)'  // Bordure des "losses"
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
