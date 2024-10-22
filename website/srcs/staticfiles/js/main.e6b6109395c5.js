document.addEventListener("DOMContentLoaded", function () {
  animateTitle();
});

function animateTitle() {
  const titleElement = document.getElementById("title");
  const buttonContainer = document.getElementById("button-container");

  const titleSteps = ["Trancsen", "Transcanda", "Transcenden", "Transcendance"];
  let currentText = "";
  let stepIndex = 0;
  let isDeleting = false;
  let speed = 150; // Vitesse de l'animation

  function typeWriter() {
    const fullText = titleSteps[stepIndex];

    if (!isDeleting) {
      // Ajouter un caractère
      currentText = fullText.substring(0, currentText.length + 1);
    } else {
      // Supprimer un caractère
      currentText = fullText.substring(0, currentText.length - 1);
    }

    titleElement.textContent = currentText;

    if (!isDeleting && currentText === fullText) {
      // Quand le texte est entièrement écrit, attends avant de supprimer
      setTimeout(() => (isDeleting = true), 1000);
    } else if (isDeleting && currentText === "") {
      // Quand le texte est complètement supprimé, passe à l'étape suivante
      isDeleting = false;
      stepIndex++;
      if (stepIndex >= titleSteps.length) {
        // Une fois toutes les étapes terminées, afficher le bouton
        setTimeout(createLoginButton, 1000);
        return;
      }
    }

    // Vitesse variable pour l'animation
    setTimeout(typeWriter, speed);
  }

  // Lancer l'animation
  setTimeout(typeWriter, 500);
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
