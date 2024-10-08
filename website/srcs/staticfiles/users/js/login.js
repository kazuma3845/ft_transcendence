function attachLoginFormListener() {
  document
    .getElementById("login-button")
    .addEventListener("click", function () {
      if (window.location.hash === "#login") {
        history.pushState(null, null, "#");
      } else {
        history.pushState(null, null, "#login");
      }
      router();
    });
}

function attachLoginFormSubmitListener() {
  document
    .getElementById("login-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(this);

      fetch("/api/users/profiles/login/", {
        method: "POST",
        headers: {
          "X-CSRFToken": getCSRFToken(), // Inclut le token CSRF si nécessaire
        },
        body: formData,
      })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.error) {
            document.getElementById("error-message").textContent = data.error;
            document.getElementById("error-message").style.display = "block";
          } else {
            await fetchUserInfo();
            updateUsername();
            loadModal(
              "Logged In Successfully",
              `Welcome back ${userInfo.user.username}, you've been missed 💜`
            );
            updateHeader();
            if (window.location.hash === "#login") window.location.href = "#profile"; // Redirige ou recharge l'application après la connexion
            router(); // Recharge l'interface pour refléter l'état connecté
          }
        })
        .catch((error) => console.error("Erreur:", error));
    });
}

function loadLoginForm() {
  fetch("/static/users/html/forms/login-form.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;
      attachLoginFormSubmitListener();
    });
}

function updateHeader() {
  fetch("/api/users/profiles/check-auth/")
    .then((response) => response.json())
    .then((data) => {
      const login_btn = document.getElementById("nav-bar-login-btn");
      const menu_btn = document.getElementById("menu-btn");

      if (data.authenticated) {
        login_btn.style.display = "none";
        menu_btn.style.display = "block";
        attachLogoutListener();
      } else {
        login_btn.style.display = "block";
        menu_btn.style.display = "none";
        attachLoginFormListener();
      }
    });
}

function checkAuthentication() {
  return fetch("/api/users/profiles/check-auth/")
    .then((response) => {
      console.log("Response received:", response);
      return response.json();
    })
    .then(async (data) => {
      console.log("Parsed JSON data:", data);
      if (data.authenticated) {
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      console.error("Error in checkAuthentication:", error); // Log des erreurs
      return false; // Retourne false en cas d'erreur
    });
}

// Appelle la fonction pour vérifier l'authentification au chargement de la page
document.addEventListener("DOMContentLoaded", updateHeader);

function attachLogoutListener() {
  document
    .getElementById("logout-button")
    .addEventListener("click", function (event) {
      event.preventDefault();
      logoutUser();
    });

  // Optionnel : Afficher l'email de l'utilisateur connecté
  // document.getElementById('user-email').textContent = getUserEmail();  // Assume que cette fonction est définie
}

function logoutUser() {
  fetch("api/users/logout/", {
    method: "POST",
    headers: {
      "X-CSRFToken": getCSRFToken(), // Inclure le token CSRF dans l'en-tête
    },
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "#"; // Redirige ou recharge l'application après la déconnexion
        loadModal(
          "Logged Out Successfully",
          `Goodbye ${userInfo.user.username}, you will be missed...💔`
        );
        userInfo = null;
        updateHeader();
        updateUsername();
        router(); // Recharge l'interface pour refléter l'état déconnecté
      } else {
        alert("Erreur lors de la déconnexion.");
      }
    })
    .catch((error) => console.error("Erreur:", error));
}
