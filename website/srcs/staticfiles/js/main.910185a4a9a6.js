document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM content loaded, starting animation...");
  animateTitle();
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateTitle() {
  const titleElement = document.getElementById("animated-title");

  // Les étapes d'écriture à suivre
  const titleSteps = [
    { text: "Transend", deleteFrom: 8, newPart: "cenden" },  // Supprimer "end" et continuer avec "cenden"
    { text: "Transcenden", deleteFrom: 10, newPart: "ce" },  // Supprimer "en" et continuer avec "dance"
    { text: "Transcendance", deleteFrom: 12 }                // Écrit "Transcendance" en entier
  ];

  let speed = 100;
  let pauseBetweenSteps = 500;

  for (let x = 0; x < titleSteps.length; x++) {
    let { text, deleteFrom, newPart } = titleSteps[x];
    
    // Écriture initiale
    for (let i = 0; i <= text.length; i++) {
      const currentText = text.substring(0, i);
      titleElement.textContent = currentText;
      await sleep(speed);  // Pause entre chaque lettre
    }

    // Petite pause après l'écriture complète
    await sleep(pauseBetweenSteps);

    // Suppression partielle pour effacer des lettres à partir du point "deleteFrom"
    for (let j = text.length; j >= deleteFrom; j--) {
      const currentText = text.substring(0, j);
      titleElement.textContent = currentText;
      await sleep(speed);  // Pause entre chaque suppression
    }

    // Si un nouveau texte doit être ajouté, on l'ajoute ici sans recommencer l'écriture
    if (newPart) {
      for (let k = 0; k <= newPart.length; k++) {
        const currentText = text.substring(0, deleteFrom) + newPart.substring(0, k);
        titleElement.textContent = currentText;
        await sleep(speed);  // Pause entre chaque lettre ajoutée
      }

      // Met à jour `text` avec le texte après ajout de "newPart"
      text = text.substring(0, deleteFrom) + newPart;
    }

    // Pause avant de passer à l'étape suivante
    await sleep(pauseBetweenSteps);
  }

  // Appeler la fonction pour afficher le bouton une fois l'animation terminée
  setTimeout(createLoginButton, 1000);
}
function createLoginButton() {
  const buttonContainer = document.getElementById("button-container");
  const button = document.createElement("button");
  button.textContent = "Log In";
  button.className = "btn btn-primary btn-lg";
  button.addEventListener("click", function () {
    // Appeler la fonction pour charger le contenu de la page d'accueil
    loadHome();
  });
  buttonContainer.appendChild(button);
  buttonContainer.classList.remove("hidden"); // Afficher le bouton
}

function loadHome() {
  fetch("/static/html/home.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;
    });
}

function updateUsername() {
  if (
    currentUserInfo &&
    currentUserInfo.user &&
    currentUserInfo.user.username
  ) {
    document.getElementById("nav-bar-username").textContent =
      currentUserInfo.user.username;
  } else {
    document.getElementById("nav-bar-username").textContent = "";
  }
}

function loadModal(title, message) {
  fetch("/static/html/modal.html")
    .then((response) => response.text())
    .then((html) => {
      document.body.insertAdjacentHTML("beforeend", html);
      document.getElementById("centeredLabel").innerText = title;
      document.getElementById("modal-message").innerText = message;

      var myModal = new bootstrap.Modal(document.getElementById("centered"));
      myModal.show();
    })
    .catch((error) =>
      console.error("Erreur lors du chargement du modal:", error)
    );
}

async function fetchCurrentUserInfo() {
  const response = await fetch("/api/users/profiles/info-user");
  const data = await response.json();
  currentUserInfo = data;
  currentUserInfo.friends_requests = await fetchFriendRequests();
  console.log("Current user is:", currentUserInfo);
  udpateFRbadge(currentUserInfo.friends_requests.length);
  return currentUserInfo;
}

async function fetchFriendRequests() {
  const response = await fetch("/api/users/profiles/friend-requests/");
  const data = await response.json();
  return data.friend_requests;
}

function udpateFRbadge(frLength) {
  const badge = document.getElementById("friend-request-badge");

  if (frLength > 0) {
    badge.classList.remove("d-none");
    if (frLength > 9) {
      badge.textContent = "9+";
    } else {
      badge.textContent = frLength;
    }
  } else {
    badge.classList.add("d-none");
  }
}
// Charger les parties de jeu
function loadGames() {
  // Code pour charger les parties depuis l'API du jeu
}

// Charger les classements
function loadLeaderboards() {
  // Code pour charger les classements depuis l'API des classements
}

function loadTournamentsForm() {}

function loadCreatTournamentsForm() {}

function loadProfil() {}
