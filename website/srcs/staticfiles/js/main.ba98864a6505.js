document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM content loaded, starting animation...");
  animateTitle();
});

function animateTitle() {
  const titleElement = document.getElementById("animated-title");

  // Les étapes d'écriture à suivre
  const titleSteps = [
    { text: "Transend", delete: 3 },    // Ecrit "Transend" puis supprime 3 caractères pour obtenir "Trans"
    { text: "Transcenden", delete: 2 }, // Ecrit "Transcenden" puis supprime 2 caractères pour obtenir "Transcend"
    { text: "Transcendance", delete: 0 } // Ecrit "Transcendance" en entier, sans suppression
  ];

  let stepIndex = 0;
  let currentText = "";
  let isDeleting = false;
  let speed = 100;  // Vitesse de l'animation

  function typeWriter() {
    const fullText = titleSteps[stepIndex].text;
    const deleteCount = titleSteps[stepIndex].delete;

    if (!isDeleting) {
      // Ajouter un caractère jusqu'à ce que le texte complet soit atteint
      currentText = fullText.substring(0, currentText.length + 1);
    } else {
      // Supprimer un caractère tant que le nombre de suppressions n'est pas atteint
      currentText = fullText.substring(0, currentText.length - 1);
    }

    // Met à jour le texte à afficher
    titleElement.textContent = currentText;

    // Si l'écriture est complète
    if (!isDeleting && currentText === fullText) {
      // Attendre avant de commencer à supprimer
      setTimeout(() => (isDeleting = true), 1000);
    } 
    // Si la suppression est en cours et qu'on a supprimé le bon nombre de caractères
    else if (isDeleting && currentText.length === fullText.length - deleteCount) {
      // Remettre isDeleting à false pour passer à l'étape suivante
      isDeleting = false;
      stepIndex++;

      // Si toutes les étapes sont terminées, créer le bouton Log In
      if (stepIndex >= titleSteps.length) {
        setTimeout(createLoginButton, 1000);
        return;
      }
    }

    // Relancer la fonction de manière continue à la vitesse définie
    setTimeout(typeWriter, speed);
  }

  // Lancer l'animation après un petit délai
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
