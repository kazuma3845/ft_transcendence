let userInfo = null;
let externUserInfo = null;

function fetchBlockchainResults(games) {
  const fetchPromises = games.map(async (game) => {
    try {
      const response = await fetch(
        `/api/blockchain/get_score/?game_session_id=${game.id}`
      );
      return await response.json();
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des scores pour le jeu",
        error
      );
      return null;
    }
  });
  return Promise.all(fetchPromises).catch((error) => {
    console.error("Erreur lors de la gestion globale des résultats:", error);
  });
}

async function computeStats(results) {
  const gamePlayed = results.length;
  const matchWon = results.filter(
    (result) => result.winner === userInfo.username
  );
  console.log("Match joués:", gamePlayed);
  console.log("Match won:", matchWon);
  // return gamePlayed, matchWon;
}

async function fetchUserStats() {
  fetch("/api/users/profiles/game-sessions/")
    .then((response) => response.json())
    .then((games) => fetchBlockchainResults(games))
    .then((results) => computeStats(results))
    .catch((error) => {
      console.error(
        "Erreur lors de la recuperation des sessions de jeu:",
        error
      );
    });

  return {
    win: 12,
    loss: 5,
    nemesis: "Martin",
    winStreak: 5,
    matchHistory: [
      { opponent: "Martin", result: "Win", date: "2024-10-01" },
      { opponent: "Alice", result: "Loss", date: "2024-09-28" },
    ],
  };
}

// Fonction pour récupérer les infos utilisateur
async function fetchUserInfo() {
  if (!userInfo) {
    const response = await fetch("/api/users/profiles/info-user");
    const data = await response.json();
    userInfo = data;
    userInfo.stats = await fetchUserStats();
  }
  return userInfo;
}

// Fonction pour charger la page de profil
function loadProfil() {
  fetch("/static/users/html/profil/profil.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;

      fetchUserInfo().then(() => {
        createProfilBlock();
        createWinRateBlock();
        createWinStreakBlock();
        createNemesisBlock();
        createMatchHistoryBlock();
      });
    })
    .catch((error) => {
      console.error("Erreur lors du chargement du profil:", error);
    });
}

// Fonction pour créer le bloc profil
function createProfilBlock() {
  const data = userInfo;

  if (!data || !data.user) {
    throw new Error("Données utilisateur non disponibles.");
  }

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
}

function createWinStreakBlock() {
  const winStreak = userInfo.stats.winStreak;
  const winStreakTitle = document.querySelector("#win-streack-block h2");
  winStreakTitle.textContent = `Win Streak: ${winStreak}`;
  const flameIframe = document.getElementById("flame-iframe");
  let flameGif;
  if (winStreak === 0) {
    flameGif = "https://giphy.com/embed/NTur7XlVDUdqM"; // GIF pour streak = 0 (exemple)
  } else if (winStreak >= 1 && winStreak <= 3) {
    flameGif = "https://giphy.com/embed/lE6MQFHe6NREA"; // GIF pour streak entre 1 et 3
  } else if (winStreak >= 4 && winStreak <= 6) {
    flameGif = "https://giphy.com/embed/bP0y34GHtOzp6"; // GIF pour streak supérieure à 3 (par exemple)
  } else if (winStreak >= 7 && winStreak != 42) {
    flameGif = "https://giphy.com/embed/3o72FfM5HJydzafgUE";
  } else if (winStreak === 42) {
    flameGif = "https://giphy.com/embed/qPVzemjFi150Q";
  }

  flameIframe.src = flameGif;
}

function createMatchHistoryBlock() {
  const matchHistory = userInfo.stats.matchHistory || [];
  const historyContainer = document.getElementById("user-match-history");

  historyContainer.innerHTML = "<h3>Match History</h3>";

  if (matchHistory.length === 0) {
    historyContainer.innerHTML += "<p>No matches played yet.</p>";
  } else {
    const table = document.createElement("table");
    table.classList.add("table", "table-striped");

    const headerRow = table.insertRow();
    headerRow.innerHTML = `
      <th>Opponent</th>
      <th>Result</th>
      <th>Date</th>
    `;

    matchHistory.forEach((match) => {
      const row = table.insertRow();
      row.innerHTML = `
        <td>${match.opponent}</td>
        <td>${match.result}</td>
        <td>${match.date}</td>
      `;
    });

    historyContainer.appendChild(table);
  }
}

function createNemesisBlock() {
  const nemesis = userInfo.stats.nemesis;
  const nemesisAvatar = document.getElementById("nemesis-avatar");
  const nemesisBlockTitle = document.querySelector("#nemesis-block h2");

  nemesisBlockTitle.textContent = `Nemesis: ${nemesis}`;

  nemesisAvatar.src = userInfo.nemesis_avatar_url
    ? userInfo.nemesis_avatar_url
    : "/static/users/avatars/default_nemesis.png";
}

// Fonction pour créer le bloc WinRate
function createWinRateBlock() {
  const stats = userInfo.stats || { win: 0, loss: 0 };

  const wins = stats.win;
  const losses = stats.loss;
  const totalGames = wins + losses;
  const winrate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  const winrateTitle = document.querySelector("#winrate-block h2");
  winrateTitle.textContent = `Winrate: ${winrate.toFixed(2)}%`;

  createWinrateChart(wins, losses);
}

function createWinrateChart(wins, losses) {
  const ctx = document.getElementById("winrateChart").getContext("2d");
  const winrateChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Wins", "Losses"],
      datasets: [
        {
          label: "Winrate",
          data: [wins, losses],
          backgroundColor: [
            "rgba(91, 188, 186, 0.3)",
            "rgba(148, 91, 188, 0.3)",
          ],
          borderColor: ["rgba(91, 188, 186, 1)", "rgba(148, 91, 188, 1)"],
          borderWidth: 3,
        },
      ],
    },
    options: {
      cutout: 35,
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}
