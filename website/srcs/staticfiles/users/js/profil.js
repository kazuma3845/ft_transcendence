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
  console.log("Current username:", userInfo.user.username);
  const gamePlayed = results.length;
  const matchWon = results.filter(
    (result) => result.winner === userInfo.user.username
  );
  const winNumber = matchWon.length;
  const matchLost = results.filter(
    (result) => result.winner != userInfo.user.username
  );
  const loseNumber = matchLost.length;
  console.log("Match joués:", gamePlayed);
  console.log("Match won:", winNumber);
  const winRate = Math.round((winNumber / gamePlayed) * 100);
  console.log("winRate:", winRate);
  const allForfeitWon = matchWon.filter(
    (forfeitWon) => forfeitWon.forfeit === true
  );
  const forfeitWonNumber = allForfeitWon.length;
  console.log("Win by forfeit:", forfeitWonNumber);

  let currentWinStreak = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].winner === userInfo.user.username) {
      currentWinStreak++;
    } else {
      break;
    }
  }
  console.log("Current win streak:", currentWinStreak);

  const lossCounter = {};
  results.forEach((result) => {
    if (result.winner !== userInfo.user.username) {
      const opponent = result.winner;
      if (lossCounter[opponent]) {
        lossCounter[opponent]++;
      } else {
        lossCounter[opponent] = 1;
      }
    }
  });
  let nemesis = null;
  let maxLosses = 0;
  for (const [opponent, losses] of Object.entries(lossCounter)) {
    if (losses > maxLosses) {
      maxLosses = losses;
      nemesis = opponent;
    }
  }
  console.log("Nemesis:", nemesis, "with losses:", maxLosses);

  return {
    total: gamePlayed || 0,
    win: winNumber || 0,
    loss: loseNumber || 0,
    nemesis: nemesis || "Aucun",
    winStreak: currentWinStreak || 0,
    winrate: winRate || 0,
    forfeit: forfeitWonNumber || 0,
    matchHistory: results || [],
  };
}

async function fetchUserStats() {
  return fetch("/api/users/profiles/game-sessions/")
    .then((response) => response.json())
    .then((games) => fetchBlockchainResults(games))
    .then((results) => computeStats(results))
    .catch((error) => {
      console.error(
        "Erreur lors de la recuperation des sessions de jeu:",
        error
      );
    });
}

async function fetchUserInfo() {
  if (!userInfo) {
    const response = await fetch("/api/users/profiles/info-user");
    const data = await response.json();
    userInfo = data;
    console.log(userInfo);
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
        createLeaderboard();
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
  const matchHistory = userInfo.stats.matchHistory;
  console.log(
    "Current match history is :",
    matchHistory,
    "with a length of:",
    matchHistory.length
  );
  const historyContainer = document.getElementById("user-match-history");

  if (matchHistory.length === 0) {
    historyContainer.innerHTML += "<p>No matches played yet.</p>";
  } else {
    const table = document.createElement("table");
    table.classList.add("table", "table-hover", "table-responsive");

    const headerRow = table.insertRow();
    headerRow.innerHTML = `
      <th>Opponent</th>
      <th>Scores</th>
      <th>Date</th>
      <th>Result</th>
      <th>Winner</th>
    `;

    matchHistory
      .slice()
      .reverse()
      .forEach((match) => {
        const row = table.insertRow();
        const userScore = match.scores[userInfo.user.username] || 0;
        const opponentName = Object.keys(match.scores).find(
          (name) => name !== userInfo.user.username
        );
        const opponentScore = match.scores[opponentName] || 0;

        let resultText = "";
        let rowColor = "";

        if (match.forfeit) {
          resultText = "Forfeit";
          rowColor = "white";
        } else if (match.winner === userInfo.user.username) {
          resultText = "Win";
          rowColor = "rgba(91, 188, 186, 0.3)";
        } else {
          resultText = "Loss";
          rowColor = "rgba(148, 91, 188, 0.3)";
        }
        row.style.backgroundColor = rowColor;
        row.innerHTML = `
        <td>${opponentName}</td>
        <td>${userScore} - ${opponentScore}</td>
        <td>${match.date}</td>
        <td>${resultText}</td>
        <td>${match.winner}</td>
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
    : "/static/users/avatars/bot.gif";
}

// Fonction pour créer le bloc WinRate
function createWinRateBlock() {
  const stats = userInfo.stats;
  const wins = stats.win;
  const losses = stats.loss;

  const winrateTitle = document.querySelector("#winrate-block h2");
  winrateTitle.textContent = `Winrate: ${userInfo.stats.winrate}%`;

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

function createLeaderboard() {
  //getLeaderBoard()
  const leaderboardContainer = document.getElementById("top-three-leaderboard");
  leaderboardContainer.innerHTML = "";
  leaderboardData = [];
  if (leaderboardData.length === 0) {
    leaderboardContainer.innerHTML = "<p>No leaderboard data available.</p>";
    return;
  }

  leaderboardData.slice(0, 3).forEach((player, index) => {
    const playerDiv = document.createElement("div");
    playerDiv.classList.add("d-flex", "align-items-center", "mb-2");

    const avatarSize = index === 0 ? "70px" : index === 1 ? "60px" : "50px";

    playerDiv.innerHTML = `
      <img src="${player.avatar_url}" class="rounded-circle" style="width: ${avatarSize}; height: ${avatarSize}; margin-right: 10px;">
      <div>
        <strong>${player.username}</strong>
        <p>Points: ${player.score}</p>
      </div>
    `;

    leaderboardContainer.appendChild(playerDiv);
  });

  const currentRankingContainer = document.getElementById("current-ranking");
  const userRank = leaderboardData.find(
    (player) => player.username === userInfo.user.username
  );

  if (userRank && userRank.rank > 3) {
    currentRankingContainer.innerHTML = `
      <p>Your Current Rank: ${userRank.rank} (Points: ${userRank.score})</p>
    `;
  } else {
    currentRankingContainer.innerHTML = `<p>You are in the Top 3!</p>`;
  }
}
