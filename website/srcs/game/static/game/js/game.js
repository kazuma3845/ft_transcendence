
const allowedValues = [1, 3, 5, 7, 9, 11];
function loadGameForm() {
  fetch("/static/game/html/game-form.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;
      attachGameFormSubmitListener(currentUser);
    });
}

async function createGameSession(data, player1 = null, player2 = null, tourDataId = null) {
  // Ajoute player1 et player2 s'ils sont définis
  if (player1) data["player1"] = player1;
  if (player2) data["player2"] = player2;
  data["tour"] = tourDataId;


  // Envoie les données à l'API pour créer une nouvelle session de jeu
  const response = await fetch("/api/game/sessions/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken(), // Assure-toi que cette fonction est bien définie
    },
    body: JSON.stringify(data),
  });
  const data_1 = await response.json();
  if (data_1.error) {
    throw new Error(data_1.error);
  }
  return data_1;
}

function attachGameFormSubmitListener(player1 = null, player2 = null, invited = null) {
  document
    .getElementById("game-form")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Empêche le rechargement de la page

      const formData = new FormData(this);
      const data = {};

      // Convertit le formulaire en un objet JS
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Ajoute les valeurs de checkbox dans les données
      if (invited === true) {
        data["power"] = false;
        data["bot"] = false;
      } else {
        data["power"] = document.getElementById("power").checked;
        data["Multiplayer"] = document.getElementById("Multiplayer").checked;
        data["bot"] = document.getElementById("bot").checked;
      }
      // Ajoute player1 et player2 dans les données s'ils sont définis
      if (player1) data["player1"] = player1;
      if (player2) data["player2"] = player2;

      // Appelle la fonction pour créer une session de jeu avec les données
      createGameSession(data)
        .then((sessionData) => {
          let sessionId = sessionData.id;
          window.location.href = `/#game?sessionid=${sessionId}`;
          if (invited)
            sendInvitation(activeConversationId, sessionId);
        })
        .catch((error) => {
          console.error("Erreur lors de la création de la session de jeu:", error);
          document.getElementById('error-message').textContent = error.message;
          document.getElementById('error-message').style.display = 'block';
        });
    });
}

function loadGame(sessionId) {
  // localStorage.setItem('game_session_id', sessionId);
  const currentUrl = window.location.href;
  if (currentUrl.includes("#")) {
    const newUrl = currentUrl.split("#")[0] + "#game?sessionid=" + sessionId;
    window.history.replaceState({}, "", newUrl);
  }
  return new Promise((resolve, reject) => {
    fetch("/static/game/html/game.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((html) => {
        document.getElementById("app").innerHTML = html;
        const iframe = document.getElementById("pongWin"); // Assurez-vous que l'iframe a cet ID
        if (iframe) {
          iframe.src = "/pong/?sessionid=" + sessionId;
        } else {
          console.error(
            "Iframe 'pongWin' introuvable dans le fichier HTML chargé."
          );
        }
        resolve(); // Résoudre la promesse une fois que tout est chargé
      })
      .catch((error) => {
        console.error("Erreur lors du chargement de la page de jeu:", error);
        reject(error); // Rejeter la promesse en cas d'erreur
      });
  });
}

function updateScore(sessionId, player1Points, player2Points) {
  fetch(`/api/game/sessions/${sessionId}/update_score/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken(),
    },
    body: JSON.stringify({
      player1_points: player1Points,
      player2_points: player2Points,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update scores");
      }
      return response.json();
    })
    .then((data) => {
      // console.log('Updated Scores:', data);
      // Mettez à jour l'affichage du score dans l'interface utilisateur si nécessaire
    })
    .catch((error) => console.error("Error:", error));
}

function loadGameSessions() {
  fetch("/api/game/sessions/")
    .then((response) => response.json())
    .then((data) => {
      let gameList = document.getElementById("app");
      gameList.innerHTML = "";

      data.forEach((session) => {
        let listItem = document.createElement("li");
        listItem.textContent = `${session.player1} vs ${session.player2} - Début: ${session.start_time}`;
        if (session.end_time) {
          listItem.textContent += ` - Fin: ${session.end_time} - Gagnant: ${session.winner}`;
        }
        gameList.appendChild(listItem);
      });
    })
    .catch((error) => console.error("Error fetching game sessions:", error));
}

function updateValue(id, value) {
  document.getElementById(id).textContent = value;
}

function updateCheckboxValue(spanId, isChecked) {
  document.getElementById(spanId).innerText = isChecked ? "On" : "Off";
  if (spanId === "Multiplayer_value") {
    handleMultiplayerChange(isChecked);
  }
  if (spanId === "bot_value") {
    showBotDiff(isChecked);
  }
}


function showBotDiff(isChecked) {
  const botDiv = document.getElementById("bot-difficulty-div");
  if (isChecked) {
    botDiv.style.display = "block";
  } else {
    botDiv.style.display = "none";
  }
}
let multi = false;
function handleMultiplayerChange(isChecked) {
  const botOptions = document.getElementById("bot-options");
  const botCheckbox = document.getElementById("bot");

  if (isChecked) {
    multi = true;
    botOptions.style.display = "none";
    botCheckbox.checked = false;
    botCheckbox.dispatchEvent(new Event('change')); //ou appeler updateCheckboxValue()
  } else {
    multi = false;
    botOptions.style.display = "block";
  }
}

// let win_number = 5;

function updateWinNumber() {
  const rangeInput = document.getElementById("actual_win_number");
  const displayValue = document.getElementById("actual_win_number_value");
  const hiddenInput = document.getElementById("win_number");

  // Map the range slider position (1 to 5) to the allowed values
  const selectedValue = allowedValues[rangeInput.value - 1];

  // win_number = selectedValue;
  // Update the display value
  displayValue.textContent = selectedValue;

  hiddenInput.value = selectedValue;
  hiddenInput.value = selectedValue;
}

// Set initial value on load
window.onload = function () {
    // Vérifier si l'élément avec l'ID "game-form" est présent dans le DOM
    const gameForm = document.getElementById("game-form");

  if (gameForm) {
      // Si l'élément existe, appelez la fonction updateWinNumber
      updateWinNumber();
  }
};

// Fonction pour appeler l'API et afficher les GameSessions disponibles
async function fetchAvailableSessions() {
  try {
    // Effectuer un appel GET à l'API
    const response = await fetch("/api/game/sessions/available_sessions/");

    // Vérifier si la requête a réussi
    if (!response.ok) {
      throw new Error(`Erreur: ${response.status}`);
    }

    const sessions = await response.json();

    const sessionList = document.getElementById("session-list");

    // Vider le contenu précédent
    sessionList.innerHTML = "";

    if (sessions.length === 0) {
      document.getElementById("current-game-rooms").textContent =
        "No room available";
    }
    // Parcourir les sessions et créer un lien pour chacune
    sessions.forEach((session) => {
      const listItem = document.createElement("li"); // Créer un élément <li>
      const link = document.createElement("a"); // Créer un élément <a> pour le lien

      // Définir l'URL du lien et son texte
      link.href = `#`; // Pas de redirection directe
      link.textContent = `Rejoindre la session ${session.id}`;

      // Ajouter un événement de clic pour le lien
      link.addEventListener("click", function (event) {
        event.preventDefault(); // Empêcher la redirection par défaut
        joinGame(session.id); // Appeler la fonction pour rejoindre le jeu
      });

      listItem.appendChild(link);
      sessionList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions:", error);
  }
}

async function joinGame(sessionId) {
  try {
    // Appeler l'API pour rejoindre la session
    const response = await fetch(`/api/game/sessions/${sessionId}/join_game/`, {
      method: "POST", // Utilisation de POST pour rejoindre la session
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(), // Assurez-vous que le token CSRF est inclus si nécessaire
      },
    });

    // Vérifier si la requête a réussi
    if (!response.ok) {
      throw new Error(
        `Erreur lors de la connexion à la session: ${response.status}`
      );
    }
    // Si l'appel API est réussi, lancer la fonction pour charger le jeu
        console.log(`Vous avez rejoint la session ${sessionId}`);
        window.location.href = `/#game?sessionid=${sessionId}`;
    } catch (error) {
        console.error("Erreur lors de la connexion à la session:", error);
    }
}

let win_number;

async function getSession(sessionId) {
  try {
    // Appeler l'API pour obtenir la session
    const response = await fetch(`/api/game/sessions/${sessionId}/`, {
      method: "GET", // Utilisation de GET pour obtenir la session
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(), // Assurez-vous que le token CSRF est inclus si nécessaire
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const gameSession = await response.json();
    return gameSession;
  } catch (error) {
    console.error("gameSession NOT FOUND :", error);
  }
}

// ####################### ---------------- WEBSOCKET ---------------- #######################
function startWebSocket(sessionId) {
  this.pingInterval = null;
  const socket = new WebSocket(`/ws/game/sessions/${sessionId}/`);

let point1 = 0
let point2 = 0
let player2 = null

socket.onopen = async function (e) {
    const gameSession = await getSession(sessionId)
    console.log("GAMESESSION: ", gameSession)
    win_number = gameSession.win_number
    point1 = gameSession.player1_points
    point2 = gameSession.player2_points
    console.log("WebSocket connected.");
  };

  socket.onmessage = async function (e) {
    // console.log('Message received:', e.data);
    try {
    const data = JSON.parse(e.data);
    // console.log("F-E: client websocket parsed data:", data);
    if (data.type === "game_score") {
      point1 = data.player1_points;
      point2 = data.player2_points;
      updateScoreDisplay(data.player1, player2, data.player1_points, data.player2_points);
    }
    if (data.type === "display_player") {
      player2 = data.player2;
      player1 = data.player1;
      displayPlayer(data.player1, data.player2);
    }
    if (data.type === "disconnect_screen") {
      if (win_number !== point1 && win_number !== point2 && player2 !== "Bot" && player2 !== "LocalPlayer")
        displayForfaitMessage(data.content == player1 ? player2 : player1);
        setLobbyRedirect(sessionId);
  }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  socket.onclose = function (e) {
    console.log("WebSocket closed.");
  };

  socket.onerror = function (e) {
    console.error("WebSocket error:", e);
};

  function displayForfaitMessage(Player_disconnect) {		
    fetch(`/static/game/html/victory.html`)
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;
      const winnerMessage = document.getElementById('winnerMessage');
      winnerMessage.textContent = `${Player_disconnect} a left the game`;
    });
  }

  function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  async function checkWinCondition(username, username2, player1Points, player2Points) {
    if (player1Points >= win_number) {
      await sleep(0.2);
      fetch(`/static/game/html/victory.html`)
        .then((response) => response.text())
        .then((html) => {
          document.getElementById("app").innerHTML = html;
          displayWinnerMessage(username);
        });
    } else if (player2Points >= win_number) {
      await sleep(0.2);
      fetch(`/static/game/html/victory.html`)
        .then((response) => response.text())
        .then((html) => {
          document.getElementById("app").innerHTML = html;
          displayWinnerMessage(username2);
        });
    }
  }

  function displayWinnerMessage(winner) {
    // Sélectionner l'élément du message de victoire
    const winnerMessage = document.getElementById('winnerMessage');
    // Comparer les noms d'utilisateur et mettre à jour le message
    winnerMessage.textContent = `${winner} Win the game!`;
  }

  async function setLobbyRedirect(sessionId) {
    const gameSession = await getSession(sessionId);
    console.log(gameSession);
    const tourid = gameSession.tour;
    const redirectLink = document.getElementById('redirect');

    if (!redirectLink) {
        return;
    }

    if (tourid) {
        redirectLink.href = `#tournaments?tourid=${tourid}`;
        redirectLink.textContent = "Return to Lobby";
    } else {
        redirectLink.href = "#game";
        redirectLink.textContent = "Play again";
    }
}

  function updateScoreDisplay(username, username2, player1Points, player2Points) {
    const player1Elem = document.getElementById("player1");
    const player1ScoreElem = document.getElementById("player1Score");
    const player2ScoreElem = document.getElementById("player2Score");
    if (player1ScoreElem && player2ScoreElem && player1Elem) {
      player1Elem.textContent = username;
      player1ScoreElem.textContent = player1Points;
      player2ScoreElem.textContent = player2Points;
      checkWinCondition(username, username2, player1Points, player2Points);
      setLobbyRedirect(sessionId);
    }
  }

  function displayPlayer(username, username2) {
    const scoreboardDiv = document.getElementById("scoreboard");
    scoreboardDiv.classList.remove("d-none");

    const player1Elem = document.getElementById("player1");
    const player2Elem = document.getElementById("player2");

    if (player1Elem) {
      player1Elem.textContent = username;
      player2Elem.textContent = username2;
    } else {
      console.log("---->> : ", username);
      console.error("Score elements not found in the DOM");
    }
  }
}

async function getGame(game_session_id) {
  try {
    // Appeler l'API pour récupérer la conversation liée au tournoi
    const response = await fetch(`/api/game/sessions/${game_session_id}/`);

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la conversation: ${response.status}`);
    }

    const session = await response.json();
    return session;  // Retourne l'ID de la conversation
  } catch (error) {
    console.error("Erreur lors de la récupération de la conversation du tournoi:", error);
  }
}
