let currentUserInfo = null;
let requestedUserProfile = null;

function loadEditProfileModal() {
  fetch("/static/users/html/profil/editProfileModal.html")
    .then((response) => response.text())
    .then((html) => {
      document.body.insertAdjacentHTML("beforeend", html);
      var myModal = new bootstrap.Modal(
        document.getElementById("editProfileModal")
      );
      myModal.show();

      document
        .getElementById("submitProfileChanges")
        .addEventListener("click", () => {
          const email = document.getElementById("edit-email").value
            ? document.getElementById("edit-email").value
            : null;
          const password = document.getElementById("edit-password").value
            ? document.getElementById("edit-password").value
            : null;
          const bio = document.getElementById("edit-bio").value
            ? document.getElementById("edit-bio").value
            : null;

          updateUserInfo(email, password, bio);
        });
    })
    .catch((error) =>
      console.error("Erreur lors du chargement du modal:", error)
    );
}

function uploadImage(file, type) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    loadModal(
      "Unauthorized file type 🚓",
      "Allowed types are JPEG, PNG, WebP, and GIF."
    );
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", type);

  fetch("/api/users/profiles/update-avatar-banner/", {
    method: "PATCH",
    headers: {
      "X-CSRFToken": getCSRFToken(),
    },
    body: formData,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        console.log(`${type} uploaded successfully.`);
        window.location.reload();
      } else {
        console.error(`Failed to upload ${type}.`);
      }
    })
    .catch((error) => {
      loadModal("File upload failed 🚨", `${error.message}`);
    });
}

function updateUserInfo(email, password, bio) {
  const data = {};
  if (email) data.email = email;
  if (password) data.password = password;
  if (bio) data.bio = bio;

  fetch("/api/users/profiles/update-user-info/", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken(),
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(errorData.message || "Une erreur est survenue.");
        });
      }
      return response.json();
    })
    .then((updatedData) => {
      window.location.reload();
    })
    .catch((error) => {
      const errorMessageDiv = document.getElementById("error-message");
      errorMessageDiv.textContent = error.message;
      errorMessageDiv.classList.remove("d-none");
    });
}

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
  // console.log("Current username:", username);

  // Filter out matches with empty string winners
  const filteredResults = results.filter((result) => result.winner !== "");

  console.log("Filtered results:", filteredResults);

  const gamePlayed = filteredResults.length;
  const matchWon = filteredResults.filter(
    (result) => result.winner === username
  );
  const winNumber = matchWon.length;
  const matchLost = filteredResults.filter(
    (result) => result.winner != username
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
  for (let i = 0; i < filteredResults.length; i++) {
    if (filteredResults[i].winner === username) {
      currentWinStreak++;
    } else {
      break;
    }
  }
  console.log("Current win streak:", currentWinStreak);

  const lossCounter = {};
  filteredResults.forEach((result) => {
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
    nemesis: nemesis || "None",
    winStreak: currentWinStreak || 0,
    winrate: winRate || 0,
    forfeit: forfeitWonNumber || 0,
    matchHistory: filteredResults || [],
  };
}

async function fetchUserStats(username) {
  return fetch(`/api/users/profiles/game-sessions/?username=${username}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des sessions de jeu.");
      }
      return response.json();
    })
    .then((games) => {
      console.log(games);
      if (games.message) {
        return {
          message: "Aucune session trouvée pour cet utilisateur.",
        };
      }
      return fetchBlockchainResults(games);
    })
    .then((results) => {
      if (results.message) {
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
    if (!response.ok) return null;
    const data = await response.json();
    requestedUserProfile = data;
    requestedUserProfile.stats = await fetchUserStats(username);
    return requestedUserProfile;
  } else {
    currentUserInfo.stats = await fetchUserStats(username);
    console.log(currentUserInfo);
    return currentUserInfo;
  }
}

function displayNoGame() {
  const rightPart = document.getElementById("right-profile-block");
  rightPart.innerHTML = "";
  rightPart.className =
    "d-flex flex-column align-items-center justify-content-center";
  rightPart.id = "no-game-message";
  const message = "User with no game data.";
  let index = 0;

  function typeWriter() {
    if (index < message.length) {
      rightPart.textContent += message.charAt(index);
      index++;
      setTimeout(typeWriter, 50);
    }
  }
  typeWriter();
}

function loadProfil(params) {
  fetch("/static/users/html/profil/profil.html")
    .then((response) => response.text())
    .then(async (html) => {
      document.getElementById("app").innerHTML = html;

      const username = getRequestedUsername(params);
      const user = await fetchUserProfileInfo(username);
      console.log("Le user id demandé est: ", user.user.id);
      if (!user) {
        loadHome();
      } else {
        createProfilBlock(user);
        if (!user.stats.message) {
          createWinRateBlock(user);
          createWinStreakBlock(user);
          createNemesisBlock(user);
          createMatchHistoryBlock(user);
          createLeaderboard(user);
        } else displayNoGame();
      }
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
    : "Ceci est une bio vraiment pas très intéressante. On dirait bien qu'elle m'a été donné par défaut parce que je suis une feignasse qui prend pas le temps de se présenter... C'est dur. J'imagine que j'aime le pong puisque je suis ici ! (Aidez moi à trouver un stage svp)";

  document.querySelector(".avatar-div img").src = data.avatar
    ? data.avatar
    : "/media/avatars/avatar.png";

  document.querySelector(".div-banner img").src = data.banner
    ? data.banner
    : "/media/banners/banner.webp";

  const bannerImg = document.getElementById("user-banner");
  const avatarImg = document.getElementById("user-avatar");

  const bannerUpload = document.getElementById("banner-upload");
  const avatarUpload = document.getElementById("avatar-upload");

  if (data.user.username == currentUserInfo.user.username) {
    bannerImg.addEventListener("click", function () {
      bannerUpload.click();
    });

    avatarImg.addEventListener("click", function () {
      avatarUpload.click();
    });

    bannerUpload.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        uploadImage(file, "banner");
      }
    });

    avatarUpload.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        uploadImage(file, "avatar");
      }
    });
  }

  if (currentUserInfo && currentUserInfo.user.username !== data.user.username) {
    loadProfileFriendsButtons(data);
  } else {
    document.getElementById("remove-friend-btn").style.display = "none";
    document.getElementById("send-friend-request-btn").style.display = "none";
    document.getElementById("edit-profile").addEventListener("click", () => {
      loadEditProfileModal();
    });
  }
  if (
    data.user.username === currentUserInfo.user.username &&
    (data.friends.length != 0 || data.friends_requests.length != 0)
  ) {
    loadFriends();
  }
}

async function loadProfileFriendsButtons(data) {
  username = data.user.username;
  document.getElementById("edit-profile").style.display = "none";

  if (username != "Bot" && username != "LocalPlayer") {
    let currentlyFriends = false;
    let friendship_id;
    currentUserInfo.friends.forEach((friend) => {
      if (friend.username == username) {
        currentlyFriends = true;
        friendship_id = friend.friendship_id;
      }
    });
    if (currentlyFriends) {
      document.getElementById("send-friend-request-btn").style.display = "none";
      document
        .getElementById("remove-friend-btn")
        .addEventListener("click", () => {
          removeFriend(friendship_id);
        });
    } else {
      document.getElementById("remove-friend-btn").style.display = "none";
      document
        .getElementById("send-friend-request-btn")
        .addEventListener("click", () => {
          sendFriendRequest(data.user.id);
        });
    }
  } else {
    document.getElementById("remove-friend-btn").style.display = "none";
    document.getElementById("send-friend-request-btn").style.display = "none";
  }
}

async function removeFriend(friendship_id) {
  try {
    const response = await fetch(
      `/api/users/profiles/${friendship_id}/remove-friendship/`,
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
      loadModal("Friend deleted", "Bye loser ... 👋", true);
    } else {
      const errorData = await response.json();
      loadModal("Error 🤕", `${errorData.error}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de la suppression d'ami", error);
    alert("Une erreur est survenue lors de l'envoi de la suppression d'ami.");
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
      loadModal("It's in the mail 💌", result.message);
    } else {
      const errorData = await response.json();
      loadModal("Error 🤕", `${errorData.error}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande d'ami :", error);
    alert("Une erreur est survenue lors de l'envoi de la demande d'ami.");
  }
}

async function rejectFriendRequest(requestId) {
  try {
    const response = await fetch(
      `/api/users/profiles/${requestId}/reject-friend-request/`,
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
      loadModal("Who's that guy ? 🤷‍♂️", result.message, true);
    } else {
      const errorData = await response.json();
      loadModal("Error 🤕", `${errorData.error}`);
    }
  } catch (error) {
    console.error("Erreur lors du refus de demande d'ami :", error);
    alert("Une erreur est survenue lors du refus de demande d'ami.");
  }
}

async function acceptFriendRequest(requestId) {
  try {
    const response = await fetch(
      `/api/users/profiles/${requestId}/accept-friend-request/`,
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
      loadModal("The more, the merrier 👯", result.message, true);
    } else {
      const errorData = await response.json();
      loadModal("Error 🤕", `${errorData.error}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'acceptation de la demande d'ami :", error);
    alert("Une erreur est survenue lors de l'acceptation de la demande d'ami.");
  }
}

async function fetchUserInfoLight(username) {
  if (username == "Aucun" || username == "None") return username;
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
    flameGif = "/media/scores/dog.webp";
  } else if (winStreak >= 1 && winStreak <= 3) {
    flameGif = "/media/scores/aspi.webp";
  } else if (winStreak >= 4 && winStreak <= 6) {
    flameGif = "/media/scores/man.webp";
  } else if (winStreak >= 7 && winStreak != 42) {
    flameGif = "/media/scores/fire.webp";
  } else if (winStreak === 42) {
    flameGif = "/media/scores/42.webp";
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
      const row = table.insertRow();
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

  if (nemesis != "None") {
    nemesisAvatar.src = nemesis_profile.avatar
      ? nemesis_profile.avatar
      : "/media/avatars/avatar.png";
    nemesisProfileLink.href = `#profile/?username=${nemesis}`;
  } else {
    nemesisAvatar.classList.add("hidden");
  }
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

async function getLeaderBoard() {
  const response = await fetch("api/game/sessions");
  if (!response.ok) {
    console.log("Error fetching games", response.status);
  } else {
    const allGames = await response.json();
    console.log("Fetched games: ", allGames);

    //On chope un objet, acc = accumulateur temp
    const winnerCounts = allGames.reduce((acc, game) => {
      const winnerName = game.winner;
      if (winnerName) {
        if (!acc[winnerName]) {
          acc[winnerName] = 0;
        }
        acc[winnerName]++;
      }
      return acc;
    }, {});

    const leaderboard = Object.keys(winnerCounts) //On transforme en tableau puis on le trie
      .map((key) => {
        return { username: key, wins: winnerCounts[key] };
      })
      .sort((a, b) => b.wins - a.wins);

    console.log("Leaderboard: ", leaderboard);

    // On ajoute un rank a tous pour l'extraire plus facilement apres
    leaderboard.forEach((player, index) => {
      player.rank = index + 1;
    });
    return leaderboard;
  }
}

async function createLeaderboard(user) {
  const leaderboardData = await getLeaderBoard();
  const leaderboardContainer = document.getElementById("top-three-leaderboard");
  leaderboardContainer.innerHTML = "";
  if (leaderboardData.length === 0) {
    leaderboardContainer.innerHTML = "<p>No leaderboard data available.</p>";
    return;
  }

  const topThreeData = leaderboardData.slice(0, 3);
  const playerInfos = await Promise.all(
    topThreeData.map((player) => fetchUserInfoLight(player.username))
  );

  playerInfos.forEach((infoUser, index) => {
    const player = topThreeData[index];
    const playerDiv = document.createElement("div");
    playerDiv.classList.add("d-flex", "align-items-center");
    playerDiv.innerHTML = `
      <a href="#profile/?username=${player.username}">
        <img src="${
          infoUser.avatar ? infoUser.avatar : "/media/avatars/avatar.png"
        } " class="rounded-circle avatar-leaderboard">
      </a>
      <div>
        <h3 class="username-leaderboard">${player.username}</h3>
        <p>Points: ${player.wins}</p>
      </div>
    `;

    leaderboardContainer.appendChild(playerDiv);
  });

  const currentRankingContainer = document.getElementById("current-ranking");
  const userRankIndex = leaderboardData.findIndex(
    (player) => player.username === user.user.username
  );

  if (userRankIndex !== -1) {
    const rank = leaderboardData[userRankIndex].rank;
    console.log("Current user rank:", rank);
    switch (rank) {
      case 1:
        msg = "You're in first place! 🥇";
        break;
      case 2:
        msg = "Second place, great job!🥈";
        break;
      case 3:
        msg = "Third place, good effort!🥉";
        break;
      default:
        msg = `Thanks for participating! (${rank})`;
        break;
    }
    currentRankingContainer.innerHTML = `<p>${msg}</p>`;
  } else {
    console.log("User not found in the leaderboard");
    currentRankingContainer.innerHTML = `<p>User not found in the leaderboard</p>`;
  }
}

async function loadFriends() {
  try {
    const friendTitle = document.getElementById("friends-title");
    const friendDivider = document.getElementById("friends-divider");
    friendTitle.classList.remove("hidden");
    friendDivider.classList.remove("hidden");

    const profileBlock = document.getElementById("profile-block");
    const friendsListBlock = document.createElement("friends-div");
    friendsListBlock.innerHTML = "";

    friendsListBlock.className =
      "friend-list-block position-relative d-inline-block ms-3 me-3 mb-2  ";

    currentUserInfo.friends.forEach(async (friend) => {
      const friendLink = document.createElement("a");
      friendLink.href = `#profile/?username=${friend.username}`;
      const friendAvatar = document.createElement("img");
      friendAvatar.src = friend.avatar_url
        ? friend.avatar_url
        : "/media/avatars/avatar.png";
      friendAvatar.className = "img-fluid rounded-circle friends-avatar";
      friendAvatar.setAttribute("title", friend.username);
      friendLink.appendChild(friendAvatar);
      friendsListBlock.appendChild(friendLink);
    });

    profileBlock.appendChild(friendsListBlock);

    if (currentUserInfo.friends_requests.length > 0) {
      loadFriendRequest(friendsListBlock);
    } else {
      initializeTooltips();
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
      const friendRequestDiv = document.createElement("div");
      friendRequestDiv.className = "friend-request-div";

      const requestLink = document.createElement("a");
      requestLink.href = `#profile/?username=${request.from_user.username}`;
      const requestImg = document.createElement("img");
      requestImg.src = request.from_user.avatar
        ? request.from_user.avatar
        : "/media/avatars/avatar.png";
      requestImg.alt = `Avatar de ${request.from_user.username}`;
      requestImg.setAttribute("data-bs-toggle", "tooltip");
      requestImg.setAttribute("title", request.from_user.username);
      requestImg.className = "img-fluid rounded-circle friends-request-avatar";
      requestLink.appendChild(requestImg);
      friendRequestDiv.appendChild(requestLink);

      const acceptIcon = document.createElement("i");
      acceptIcon.className =
        "friend-request-icons fas fa-check-circle position-absolute";
      acceptIcon.style.cursor = "pointer";
      acceptIcon.style.top = "-5px"; // Position en haut à droite
      acceptIcon.style.right = "5px";
      acceptIcon.style.color = "rgba(74, 130, 209, 0.75)";
      acceptIcon.addEventListener("click", () => {
        acceptFriendRequest(request.id);
      });

      const rejectIcon = document.createElement("i");
      rejectIcon.className =
        "friend-request-icons fas fa-times-circle position-absolute";
      rejectIcon.style.cursor = "pointer";
      rejectIcon.style.top = "-5px";
      rejectIcon.style.left = "5px";
      rejectIcon.addEventListener("click", () => {
        rejectFriendRequest(request.id);
      });
      rejectIcon.style.color = "rgba(230, 59, 59, 0.75)";

      friendRequestDiv.appendChild(acceptIcon);
      friendRequestDiv.appendChild(rejectIcon);

      friendsListBlock.appendChild(friendRequestDiv);
      initializeTooltips();
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes d'amis:", error);
    document.getElementById("friend-requests-block").innerHTML =
      "<p>Erreur de chargement des demandes d'amis.</p>";
  }
}

function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

async function getUsername(userId) {
  try {
    // Faire une requête GET à l'API
    const response = await fetch(`/api/users/profiles/${userId}/`);

    // Vérifier si la réponse est correcte
    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération du profil: ${response.status}`
      );
    }

    // Convertir la réponse en JSON
    const data = await response.json();

    // Extraire le nom d'utilisateur
    const username = data.user.username;
    console.log("Nom d'utilisateur:", username);

    // Retourner le nom d'utilisateur
    return username;
  } catch (error) {
    console.error("Erreur:", error);
  }
}
