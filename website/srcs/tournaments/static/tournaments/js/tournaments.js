function loadTourForm() {
  fetch("/static/tournaments/html/tour-form.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;
      attachTourFormSubmitListener(currentUser);
    });
}

function loadTour(tourId) {
  fetch("/static/tournaments/html/tour-lobby.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;
      updateTree(tourId);
    });
}

async function createTourSession(data) {
  // Envoie les données à l'API pour créer une nouvelle session de jeu
  const response = await fetch('/api/tournaments/tournament/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(), // Assure-toi que cette fonction est bien définie
    },
    body: JSON.stringify(data),
  });
  const data_1 = await response.json();
  if (data_1.error) {
    console.log("ca foir le createTourSession")
    throw new Error(data_1.error);
  }
  return data_1;
}

function attachTourFormSubmitListener(player1 = null) {
  document
    .getElementById("tour-form")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Empêche le rechargement de la page

      const formData = new FormData(this);
      const data = {};

      // Convertit le formulaire en un objet JS
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Ajoute player1 dans les données s'il est défini
      console.log("player1 :", player1);
      if (player1) data["player1"] = player1;

      // Appelle la fonction pour créer une session de tournoi
      createTourSession(data)
        .then((tourData) => {
          // Appel à l'API pour créer la conversation associée au tournoi
          return fetch("/api/messaging/conversations/create_tour_conv/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({ tour: tourData.id }), // Envoyer l'ID du tournoi créé
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(
                  `Erreur lors de la création de la conversation : ${response.statusText}`
                );
              }
              return response.json(); // Convertir la réponse en JSON
            })
            .then((convData) => {
              console.log(
                "Nouvelle conversation créée pour le tournoi:",
                convData
              );

              // Charger les conversations et connecter le WebSocket
              connectWebSocket();
              socket.onopen = function () {
                sendTourConv(convData.id, `${currentUser} created this tournament.`);
              };

              let tourId = tourData.id; // Accéder à game_1_1 à partir de tourData
              window.location.href = `/#tournaments?tourid=${tourId}`;
              // let sessionId = tourData.game_1_1.id;  // Accéder à game_1_1 à partir de tourData
              // window.location.href = `/#game?sessionid=${sessionId}`;
            });
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la création du tournoi ou de la conversation:",
            error
          );
          document.getElementById("error-message").textContent = error.message;
          document.getElementById("error-message").style.display = "block";
        });
    });
}

async function fetchAvailableTours() {
  try {
    // Effectuer un appel GET à l'API des tournois
    const response = await fetch("/api/tournaments/tournament/");

    // Vérifier si la requête a réussi
    if (!response.ok) {
      throw new Error(`Erreur: ${response.status}`);
    }

    const tournaments = await response.json();

    const tourList = document.getElementById("tour-list");

    // Vider le contenu précédent
    tourList.innerHTML = "";

    if (tournaments.length === 0) {
      document.getElementById("current-tours").textContent =
        "No tournaments available";
    }

    // Filtrer les tournois dont participantNum est < 4
    const availableTours = tournaments.filter(
      (tour) =>
        tour.participantNum < 4 && !tour.participants.includes(currentUser)
    );

    // Parcourir les tournois disponibles et créer un lien pour chacun
    availableTours.forEach((tour) => {
      const listItem = document.createElement("li"); // Créer un élément <li>
      const link = document.createElement("a"); // Créer un élément <a> pour le lien

      // Définir l'URL du lien et son texte
      link.href = `#`; // Pas de redirection directe
      link.textContent = `Rejoindre le tournoi ${tour.id}`;

      // Ajouter un événement de clic pour le lien
      link.addEventListener("click", function (event) {
        event.preventDefault(); // Empêcher la redirection par défaut
        joinTour(tour.id); // Appeler la fonction pour rejoindre le tournoi
        window.location.href = `/#tournaments?tourid=${tour.id}`;
      });

      listItem.appendChild(link);
      tourList.appendChild(listItem);
    });

    if (availableTours.length === 0) {
      document.getElementById("current-tours").textContent =
        "No tournaments available";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des tournois:", error);
  }
}

async function joinTour(tourId) {
  try {
    // Appeler l'API pour rejoindre la session
    const response = await fetch(
      `/api/tournaments/tournament/${tourId}/join_tour/`,
      {
        method: "POST", // Utilisation de POST pour rejoindre la session
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(), // Assurez-vous que le token CSRF est inclus si nécessaire
        },
      }
    );
    const conv = await getTourConversation(tourId);
    const tour = await getTour(tourId);
    console.log("tour ==> ", tour);
    const convId = conv.id;

    // Si convId est valide, connecter WebSocket et envoyer un message
    if (convId) {
      connectWebSocket();
      socket.onopen = function () {
        sendTourConv(convId, `${currentUser} a rejoint le tournoi`);
        if (tour.participantNum === 2)
          sendTourConv(
            convId,
            `${tour.participants[0]} affronte ${tour.participants[1]}`
          );
        if (tour.participantNum === 4)
          sendTourConv(
            convId,
            `${tour.participants[2]} affronte ${tour.participants[3]}`
          );
      };
    }
    // Vérifier si la requête a réussi
    if (!response.ok) {
      throw new Error(
        `Erreur lors de la connexion au tournoi: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Erreur lors de la connexion à la session:", error);
  }
}

async function getTourConversation(tourId) {
  try {
    // Appeler l'API pour récupérer la conversation liée au tournoi
    const response = await fetch(
      `/api/messaging/conversations/tour/${tourId}/`
    );

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération de la conversation: ${response.status}`
      );
    }

    const conversation = await response.json();
    return conversation; // Retourne l'ID de la conversation
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la conversation du tournoi:",
      error
    );
  }
}

async function getTour(tourId) {
  try {
    // Appeler l'API pour récupérer la conversation liée au tournoi
    const response = await fetch(`/api/tournaments/tournament/${tourId}/`);

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération de la conversation: ${response.status}`
      );
    }

    const tour = await response.json();
    return tour; // Retourne l'ID de la conversation
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la conversation du tournoi:",
      error
    );
  }
}

async function updateTree(tourId) {
  let tour = await getTour(tourId);
  console.log("updateTree() called on tour ", tour);
  let player111 = document.querySelector("#player111 text");
  if (player111 && tour.participants[0])
    player111.innerHTML = tour.participants[0]; // Remplacer le contenu du texte par le nom du joueur
  let player112 = document.querySelector("#player112 text");
  if (player112 && tour.participants[1])
    player112.innerHTML = tour.participants[1]; // Remplacer le contenu du texte par le nom du joueur
  let player121 = document.querySelector("#player121 text");
  if (player121 && tour.participants[2])
    player121.innerHTML = tour.participants[2]; // Remplacer le contenu du texte par le nom du joueur
  let player122 = document.querySelector("#player122 text");
  if (player122 && tour.participants[3])
    player122.innerHTML = tour.participants[3]; // Remplacer le contenu du texte par le nom du joueur
  game_1_1 = getGame(tour.game_1_1.id);
  // console.log ("game_1_1 : ",game_1_1);

  // Mise à jour des scores pour game_1_1
  if (tour.game_1_1.start_time) {
    let score111 = document.querySelector("#score111 text");
    if (score111) score111.innerHTML = tour.game_1_1.player1_points;
    let score112 = document.querySelector("#score112 text");
    if (score112) score112.innerHTML = tour.game_1_1.player2_points;
  }

  // Mise à jour des scores pour game_1_2
  if (tour.game_1_2.start_time) {
    let score121 = document.querySelector("#score121 text");
    if (score121) score121.innerHTML = tour.game_1_2.player1_points; // Remplacer le contenu du texte par le nom du joueur
    let score122 = document.querySelector("#score122 text");
    if (score122) score122.innerHTML = tour.game_1_2.player2_points; // Remplacer le contenu du texte par le nom du joueur
  }

  // Mise à jour des gagnants
  if (tour.game_1_1.winner) {
    let winner1 = document.querySelector("#winner1 text");
    if (winner1)
      winner1.innerHTML = tour.game_1_1.winner;
  }

  if (tour.game_1_2.winner) {
    let winner2 = document.querySelector("#winner2 text");
    if (winner2)
      winner2.innerHTML = tour.game_1_2.winner;
  }

  // Mise à jour des scores pour game_2
  if (tour.game_2.start_time) {
    let score1 = document.querySelector("#score1 text");
    if (score1) score1.innerHTML = tour.game_2.player1_points; // Remplacer le contenu du texte par le nom du joueur
    let score2 = document.querySelector("#score2 text");
    if (score2) score2.innerHTML = tour.game_2.player2_points; // Remplacer le contenu du texte par le nom du joueur
  }

  // Mise à jour des gagnants de la finale
  if (tour.game_2.winner) {
    let winner = document.querySelector("#winner text");
    if (winner)
      winner.innerHTML = tour.game_2.winner;
    let winnerBox = document.getElementById("winnerbox");
    if (winnerBox) {
      winnerBox.style.display = "block";  // Rendre le groupe visible
    }
    let groupButton = document.getElementById("groupButton");
    if (groupButton) {
      groupButton.style.display = "none";  // Rendre le groupe visible
    }
  }

  let playButton = document.getElementById("playButton");
  let groupButton = document.getElementById("groupButton");
  if (playButton) {
    groupButton.style.display = "none"; // Par défaut, le bouton est masqué
    // Vérifier si le joueur est impliqué dans la prochaine partie
    if (!tour.game_1_1.winner && (tour.participants[0] === currentUser || tour.participants[1] === currentUser)) {
      groupButton.style.display = "block";
      playButton.setAttribute("onclick", `playTour(${tourId})`);
    } else if (!tour.game_1_2.winner && (tour.participants[2] === currentUser || tour.participants[3] === currentUser)) {
      groupButton.style.display = "block";
      playButton.setAttribute("onclick", `playTour(${tourId})`);
    } else if (!tour.game_2.winner && (tour.game_1_1.winner === currentUser || tour.game_1_2.winner === currentUser)) {
      groupButton.style.display = "block";
      playButton.setAttribute("onclick", `playTour(${tourId})`);
    }
  }
}

// A corriger avec le user info de Francois
async function playTour(tourId) {
  let tour = await getTour(tourId);
  // console.log("--->  tour = ", tour)
  let sessionId;
  if (!tour.game_1_1.winner) {
    if (tour.participants[0] === currentUser || tour.participants[1] === currentUser) {
      sessionId = tour.game_1_1.id;
      return window.location.href = `/#game?sessionid=${sessionId}`;
    }
  }
  if (!tour.game_1_2.winner) {
    if (tour.participants[2] === currentUser || tour.participants[3] === currentUser) {
      sessionId = tour.game_1_2.id;
      return window.location.href = `/#game?sessionid=${sessionId}`;
    }
  }
  if (!tour.game_2.winner) {
    if (tour.game_1_1.winner === currentUser || tour.game_1_2.winner === currentUser) {
      sessionId = tour.game_2.id;
      return window.location.href = `/#game?sessionid=${sessionId}`;
    }
  }
}
