let userInfo = null;  // Stocke les infos de l'utilisateur connecté
let externUserInfo = null;  // Stocke les infos d'un utilisateur externe, si nécessaire

// Fonction pour récupérer le username soit depuis l'URL, soit depuis le profil de l'utilisateur connecté
function getUsername() {
  const params = new URLSearchParams(window.location.search);
  const queryUsername = params.get('username');
  
  // Si un username est dans l'URL, on l'utilise, sinon on retourne celui de l'utilisateur connecté
  return queryUsername ? queryUsername : userInfo?.user?.username;
}

// Fonction pour charger les informations de l'utilisateur connecté
async function fetchUserInfo() {
  if (!userInfo) {
    // Charger les infos de l'utilisateur connecté
    const response = await fetch("/api/users/profiles/info-user");
    userInfo = await response.json();
  }
  
  return userInfo;
}

// Fonction pour charger les informations dynamiques, soit de l'utilisateur connecté soit d'un utilisateur externe
async function fetchUserData() {
  // Récupère les informations de l'utilisateur connecté si nécessaire
  await fetchUserInfo();
  
  const username = getUsername();  // Détermine quel username utiliser
  if (username !== userInfo.user.username) {
    // Si le username est différent, charger les infos de l'utilisateur externe
    try {
      const response = await fetch(`/api/users/profiles/info-user?username=${username}`);
      externUserInfo = await response.json();
      externUserInfo.stats = await fetchUserStatsForUser(username);  // Charger ses stats
      return externUserInfo;
    } catch (error) {
      console.error(`Erreur lors de la récupération des informations pour l'utilisateur ${username}:`, error);
    }
  } else {
    // Utiliser les informations de l'utilisateur connecté
    if (!userInfo.stats) {
      userInfo.stats = await fetchUserStatsForUser(username);
    }
    return userInfo;
  }
}

// Fonction pour charger les stats d'un utilisateur, externe ou connecté
async function fetchUserStatsForUser(username) {
  // Charger les résultats de jeu spécifiques pour un utilisateur (connecté ou externe)
  return fetch(`/api/users/profiles/game-sessions/?username=${username}`)
    .then((response) => response.json())
    .then((games) => fetchBlockchainResults(games))
    .then((results) => computeStatsForUser(results, username))
    .catch((error) => {
      console.error(`Erreur lors de la récupération des sessions de jeu pour ${username}:`, error);
    });
}

// Fonction pour calculer les stats pour un utilisateur donné
function computeStatsForUser(results, username) {
  console.log("Current username:", username);
  const gamePlayed = results.length;
  const matchWon = results.filter((result) => result.winner === username);
  const winNumber = matchWon.length;
  const matchLost = results.filter((result) => result.winner !== username);
  const loseNumber = matchLost.length;
  console.log("Match joués:", gamePlayed);
  console.log("Match won:", winNumber);
  const winRate = Math.round((winNumber / gamePlayed) * 100);
  console.log("winRate:", winRate);
  
  // Calcul des autres stats (par exemple, win streak, nemesis, etc.)...
  
  return {
    total: gamePlayed || 0,
    win: winNumber || 0,
    loss: loseNumber || 0,
    winrate: winRate || 0,
    // autres stats...
  };
}

// Fonction pour charger la page de profil et gérer si un username est présent dans l'URL ou non
function loadProfile() {
  fetch("/static/users/html/profil/profil.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;

      // Charger les infos du profil (externe ou connecté)
      fetchUserData().then((user) => {
        createProfilBlock(user);
        createWinRateBlock(user);
        // Autres blocs à créer comme le win streak, nemesis, etc.
      });
    })
    .catch((error) => {
      console.error("Erreur lors du chargement du profil:", error);
    });
}

// Fonction pour créer le bloc de profil (photo, nom, bio, etc.)
function createProfilBlock(user) {
  if (!user || !user.user) {
    throw new Error("Données utilisateur non disponibles.");
  }

  document.getElementById("username").textContent = user.user.username;
  document.getElementById("email").textContent = user.user.email;
  document.getElementById("bio").textContent = user.bio || "Bio non disponible.";

  document.querySelector(".avatar-div img").src = user.avatar_url
    ? user.avatar_url
    : "/static/users/avatars/avatar.png";
  document.querySelector(".div-banner img").src = user.banner
    ? user.banner
    : "/static/users/banners/banner.webp";
  loadFriends(user);
}

// Fonction pour créer le bloc de Win Rate
function createWinRateBlock(user) {
  const stats = user.stats;
  const wins = stats.win;
  const losses = stats.loss;

  const winrateTitle = document.querySelector("#winrate-block h2");
  winrateTitle.textContent = `Winrate: ${stats.winrate}%`;

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
            "rgba(59, 93, 223, 0.30)",
            "rgba(223, 59, 59, 0.30)",
          ],
          borderColor: ["rgba(59, 93, 223, 0.8)", "rgba(223, 59, 59, 0.8)"],
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
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

async function loadFriends(user) {
  try {
    const response = await fetch("/api/friends");
    const friends = await response.json();

    const friendsListBlock = document.getElementById("friend-list-block");
    friendsListBlock.innerHTML = "";

    friends.forEach((friend) => {
      const friendImg = document.createElement("img");
      friendImg.src = friend.avatar_url;
      friendImg.alt = `Avatar de ${friend.name}`;
      friendImg.className = "img-fluid rounded-circle friends-avatar";
      friendsListBlock.appendChild(friendImg);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des amis:", error);
    document.getElementById("friend-list-block").innerHTML =
      "<p>Erreur de chargement des amis.</p>";
  }
}
