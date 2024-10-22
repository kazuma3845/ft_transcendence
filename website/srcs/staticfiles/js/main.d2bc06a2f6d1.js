document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM content loaded, starting animation...");
  animateTitle();
});

function animateTitle() {
  const titleElement = document.getElementById("animated-title");

  // Les étapes d'écriture à suivre
  const titleSteps = [
    { text: "Transend", delete: 5 }, // Ecrit "Transend" puis supprime 3 caractères pour obtenir "Trans"
    { text: "Transcenden", delete: 8 }, // Ecrit "Transcenden" puis supprime 2 caractères pour obtenir "Transcend"
    { text: "Transcendance", delete: 12 }, // Ecrit "Transcendance" en entier, sans suppression
  ];

  let currentText = "";
  let speed = 100;

  for (x = 0; x < titleSteps.length; x++);
  {
    for (y = 0; y < titleSteps[x].length; y++) {
      currentText = titleSteps[x].substring(0, y);
      titleElement.textContent = currentText;
      pause(speed);
    }
    for (z = currentText.length; z > titleSteps[z].delete; z--) {
      currentText = titleSteps[x].substring(0, z);
      titleElement.textContent = currentText;
      pause(speed);
    }
  }
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
