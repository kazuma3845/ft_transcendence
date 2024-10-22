document.addEventListener("DOMContentLoaded", function () {
  const landingPage = document.getElementById("landingPage");
  const homePage = document.getElementById("homePage");

  // Vérifier si l'utilisateur a déjà visité la page
  if (localStorage.getItem("hasVisited")) {
    landingPage.classList.add("d-none");
    homePage.classList.remove("d-none");
    loadHome();
  } else {
    animateTitle();
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min + 1) + min;
}

async function animateTitle() {
  const titleElement = document.getElementById("animated-title");

  const titleSteps = [
    { text: "Transend", deleteCount: 3 }, // Écrit "Transend", supprime "end"
    { text: "Transcendenc", deleteCount: 3 }, // Écrit "Transcendenc", supprime "enc"
    { text: "Transcendance", deleteCount: 0 }, // Écrit "Transcendance", rien à supprimer
  ];

  let speed = 150;
  let currentText = "";

  for (let x = 0; x < titleSteps.length; x++) {
    const { text, deleteCount } = titleSteps[x];

    for (let y = currentText.length; y <= text.length; y++) {
      currentText = text.substring(0, y);
      titleElement.style.fontVariationSettings = `"ELSH" ${getRandomNumber(
        0,
        10
      )}`;
      titleElement.textContent = currentText;
      await sleep(speed);
    }
    await sleep(speed * 2.5);
    for (let z = 0; z < deleteCount; z++) {
      currentText = currentText.substring(0, currentText.length - 1);
      titleElement.style.fontVariationSettings = `"ELSH" ${getRandomNumber(
        0,
        10
      )}`;
      titleElement.textContent = currentText;
      await sleep(speed);
    }
  }

  setTimeout(createLoginButton, 1000);
}

function createLoginButton() {
  const buttonContainer = document.getElementById("button-container");
  const button = document.createElement("button");
  button.textContent = "Log In";
  button.addEventListener("click", function () {
    localStorage.setItem("hasVisited", "true");
    const landingPage = document.getElementById("landing-page");
    const mainPage = document.getElementById("main-page");
    landingPage.classList.toggle("d-none");
    mainPage.classList.remove("d-none");
    window.location.hash = "#login";
  });
  buttonContainer.appendChild(button);
  buttonContainer.classList.remove("hidden");
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
