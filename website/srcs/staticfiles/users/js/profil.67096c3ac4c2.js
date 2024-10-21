let currentUserInfo = null;
let requestedUserProfile = null;

function getRequestedUsername(params) {
  const queryUsername = params.get("username");
  return queryUsername ? queryUsername : currentUserInfo?.user?.username;
}

function fetchBlockchainResults(games) {
  const sortedGames = games.sort((a, b) => b.id - a.id);
  const fetchPromises = sortedGames.map(async (game) => {
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

async function computeStats(results, username) {
  console.log("Current username:", username);
  const gamePlayed = results.length;
  const matchWon = results.filter((result) => result.winner === username);
  const winNumber = matchWon.length;
  const matchLost = results.filter((result) => result.winner != username);
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
  for (let i = 0; i <= results.length; i++) {
    if (results[i].winner === username) {
      currentWinStreak++;
    } else {
      break;
    }
  }
  console.log("Current win streak:", currentWinStreak);

  const lossCounter = {};
  results.forEach((result) => {
    if (result.winner !== username) {
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

async function fetchUserStats(username) {
  return fetch(`/api/users/profiles/game-sessions/?username=${username}`)
    .then((response) => {
      if (!response.ok) {
        // Si une autre erreur que 404 survient
        throw new Error("Erreur lors de la récupération des sessions de jeu.");
      }
      return response.json();
    })
    .then((games) => {
      if (games.data.length === 0) {
        // Si aucune session n'a été trouvée, on retourne le message et on arrête ici
        return {
          message: "Aucune session trouvée pour cet utilisateur.",
          username,
        };
      }
      // Sinon, on continue avec le traitement normal
      return fetchBlockchainResults(games.data);
    })
    .then((results) => {
      if (results.message) {
        // Si c'était un message d'erreur, on l'arrête ici
        return results;
      }
      return computeStats(results, username);
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des sessions de jeu:",
        error
      );
    });
}

async function fetchUserProfileInfo(username) {
  if (username != currentUserInfo.user.username) {
    const response = await fetch(
      `/api/users/profiles/info-user/?username=${username}`
    );
    const data = await response.json();
    requestedUserProfile = data;
    requestedUserProfile.stats = await fetchUserStats(username);
    return requestedUserProfile;
  } else {
    currentUserInfo.stats = await fetchUserStats(username);
    return currentUserInfo;
  }
}

// Fonction pour charger la page de profil
function loadProfil(params) {
  fetch("/static/users/html/profil/profil.html")
    .then((response) => response.text())
    .then(async (html) => {
      document.getElementById("app").innerHTML = html;

      const username = getRequestedUsername(params);
      const user = await fetchUserProfileInfo(username);
      createProfilBlock(user);
      createWinRateBlock(user);
      createWinStreakBlock(user);
      createNemesisBlock(user);
      createMatchHistoryBlock(user);
      createLeaderboard(user);
    })
    .catch((error) => {
      console.error("Erreur lors du chargement du profil:", error);
    });
}

// Fonction pour créer le bloc profil
function createProfilBlock(user) {
  const data = user;

  if (!data || !data.user) {
    throw new Error("Données utilisateur non disponibles.");
  }

  document.getElementById("username").textContent = data.user.username;
  document.getElementById("email").textContent = data.user.email;
  document.getElementById("bio").textContent = data.bio
    ? data.bio
    : "Ceci est une bio vraiment pas très intéressante. J'imagine que j'aime le pong puisque je suis ici. (Aidez moi à trouver un stage svp)";

  document.querySelector(".avatar-div img").src = data.avatar
    ? data.avatar
    : "/static/users/avatars/avatar.png";

  document.querySelector(".div-banner img").src = data.banner
    ? data.banner
    : "/static/users/banners/banner.webp";
  if (currentUserInfo && currentUserInfo.user.username !== data.user.username) {
    document.getElementById("send-friend-request-btn").style.display = "block";

    document
      .getElementById("send-friend-request-btn")
      .addEventListener("click", () => {
        sendFriendRequest(data.user.id);
      });
  } else {
    document.getElementById("send-friend-request-btn").style.display = "none";
    document.getElementById("block-user-btn").style.display = "none";
  }
  if (data.user.username === currentUserInfo.user.username) {
    loadFriends();
  }
}

async function sendFriendRequest(userId) {
  try {
    const response = await fetch(
      `/api/users/profiles/${userId}/send-friend-request/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      alert(result.message);
    } else {
      const errorData = await response.json();
      alert(`Erreur: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande d'ami :", error);
    alert("Une erreur est survenue lors de l'envoi de la demande d'ami.");
  }
}

async function rejectFriendRequest(userId) {
  try {
    const response = await fetch(
      `/api/users/profiles/${userId}/reject-friend-request/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      alert(result.message);
    } else {
      const errorData = await response.json();
      alert(`Erreur: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Erreur lors du refus de demande d'ami :", error);
    alert("Une erreur est survenue lors du refus de demande d'ami.");
  }
}

async function acceptFriendRequest(userId) {
  try {
    const response = await fetch(
      `/api/users/profiles/${userId}/accept-friend-request/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      alert(result.message);
    } else {
      const errorData = await response.json();
      alert(`Erreur: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'acceptation de la demande d'ami :", error);
    alert("Une erreur est survenue lors de l'acceptation de la demande d'ami.");
  }
}

async function fetchUserInfoLight(username) {
  const response = await fetch(
    `/api/users/profiles/info-user/?username=${username}`
  );
  const profile = await response.json();
  return profile;
}

function createWinStreakBlock(user) {
  const winStreak = user.stats.winStreak;
  const winStreakTitle = document.querySelector("#win-streack-block h2");
  winStreakTitle.textContent = `Win Streak: ${winStreak}`;
  const flameIMG = document.getElementById("winstreak-gif");
  let flameGif;
  if (winStreak === 0) {
    flameGif = "/static/users/scores/dog.webp";
  } else if (winStreak >= 1 && winStreak <= 3) {
    flameGif = "/static/users/scores/aspi.webp";
  } else if (winStreak >= 4 && winStreak <= 6) {
    flameGif = "/static/users/scores/man.webp";
  } else if (winStreak >= 7 && winStreak != 42) {
    flameGif = "/static/users/scores/fire.webp";
  } else if (winStreak === 42) {
    flameGif = "/static/users/scores/42.webp";
  }
  flameIMG.src = flameGif;
}

function createMatchHistoryBlock(user) {
  const matchHistory = user.stats.matchHistory;
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

    matchHistory.forEach((match) => {
      const row = table.insertRow();
      const userScore = match.scores[user.user.username] || 0;
      const opponentName = Object.keys(match.scores).find(
        (name) => name !== user.user.username
      );
      const opponentScore = match.scores[opponentName] || 0;

      let resultText = "";
      let rowColor = "";

      if (match.forfeit) {
        resultText = "Forfeit";
        rowColor = "white";
      } else if (match.winner === user.user.username) {
        resultText = "Win";
        rowColor = "rgba(59, 93, 223, 0.45)";
      } else {
        resultText = "Loss";
        rowColor = "rgba(223, 59, 59, 0.45)";
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

async function createNemesisBlock(user) {
  const nemesis = user.stats.nemesis;
  const nemesis_profile = await fetchUserInfoLight(nemesis);
  const nemesisProfileLink = document.getElementById("nemesis-link");
  const nemesisAvatar = document.getElementById("nemesis-avatar");
  const nemesisBlockTitle = document.querySelector("#nemesis-block h2");

  nemesisBlockTitle.textContent = `Nemesis: ${nemesis}`;

  nemesisAvatar.src = nemesis_profile.avatar
    ? nemesis_profile.avatar
    : "/static/users/avatars/avatar.png";
  nemesisProfileLink.href = `#profile/?username=${nemesis}`;
}

// Fonction pour créer le bloc WinRate
function createWinRateBlock(user) {
  const stats = user.stats;
  const wins = stats.win;
  const losses = stats.loss;

  const winrateTitle = document.querySelector("#winrate-block h2");
  winrateTitle.textContent = `Winrate: ${user.stats.winrate}%`;

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

function createLeaderboard(user) {
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
    (player) => player.username === user.user.username
  );

  if (userRank && userRank.rank > 3) {
    currentRankingContainer.innerHTML = `
      <p>Your Current Rank: ${userRank.rank} (Points: ${userRank.score})</p>
    `;
  } else {
    currentRankingContainer.innerHTML = `<p>You are in the Top 3!</p>`;
  }
}

async function loadFriends() {
  try {
    console.log("Loading some friends");

    const profileBlock = document.getElementById("profile-block");
    const friendsListBlock = document.createElement("div");

    friendsListBlock.className =
      "friend-list-block position-relative d-inline-block p-3";
    currentUserInfo.friends.forEach(async (friend) => {
      console.log("Loading new friend");

      const friendLink = document.createElement("a");
      friendLink.href = `#profile/?username=${friend.username}`;
      const friendAvatar = document.createElement("img");
      friendAvatar.src = friend.avatar_url
        ? friend.avatar_url
        : "/static/users/avatars/avatar.png";
      friendAvatar.className = "img-fluid rounded-circle friends-avatar";
      friendLink.appendChild(friendAvatar);
      friendsListBlock.appendChild(friendLink);
    });
    profileBlock.appendChild(friendsListBlock);
    if (currentUserInfo.friends_requests.length > 0) {
      loadFriendRequest(friendsListBlock);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des amis:", error);
    document.getElementById("friend-list-block").innerHTML =
      "<p>Erreur de chargement des amis.</p>";
  }
}

async function loadFriendRequest(friendsListBlock) {
  try {
    const friendRequests = currentUserInfo.friends_requests;
    friendRequests.forEach(async (request) => {
      // Crée un div unique pour chaque request avec une position relative
      const friendRequestDiv = document.createElement("div");
      friendRequestDiv.className = "position-relative d-inline-block"; // Pour que les icônes soient bien positionnées autour de chaque image

      // Lien vers le profil de l'utilisateur
      const requestLink = document.createElement("a");
      requestLink.href = `#profile/?username=${request.from_user.username}`;
      const requestImg = document.createElement("img");
      requestImg.src = request.from_user.avatar
        ? request.from_user.avatar
        : "/static/users/avatars/avatar.png";
      requestImg.alt = `Avatar de ${request.from_user.username}`;
      requestImg.className = "img-fluid rounded-circle friends-avatar";
      requestLink.appendChild(requestImg);

      // Ajoute le lien au div de demande d'ami
      friendRequestDiv.appendChild(requestLink);

      // Icône pour accepter la demande
      const acceptIcon = document.createElement("i");
      acceptIcon.className =
        "friend-request-icons fas fa-check-circle position-absolute";
      acceptIcon.style.cursor = "pointer";
      acceptIcon.style.top = "0px"; // Position en haut à droite
      acceptIcon.style.right = "5px";
      acceptIcon.style.color = "rgba(74, 130, 209, 0.75)";
      acceptIcon.addEventListener("click", () => {
        acceptFriendRequest(request.id);
      });

      // Icône pour refuser la demande
      const rejectIcon = document.createElement("i");
      rejectIcon.className =
        "friend-request-icons fas fa-times-circle position-absolute";
      rejectIcon.style.cursor = "pointer";
      rejectIcon.style.top = "0px"; // Position en haut à gauche
      rejectIcon.style.left = "5px";
      rejectIcon.addEventListener("click", () => {
        rejectFriendRequest(request.id);
      });
      rejectIcon.style.color = "rgba(230, 59, 59, 0.75)";

      // Ajoute les icônes au même div que l'image
      friendRequestDiv.appendChild(acceptIcon);
      friendRequestDiv.appendChild(rejectIcon);

      // Ajoute ce bloc complet (lien + icônes) dans la liste d'amis
      friendsListBlock.appendChild(friendRequestDiv);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes d'amis:", error);
    document.getElementById("friend-requests-block").innerHTML =
      "<p>Erreur de chargement des demandes d'amis.</p>";
  }
}
