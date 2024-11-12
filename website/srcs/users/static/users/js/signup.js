function attachSignupFormListener() {
  document
    .getElementById("signup-button")
    .addEventListener("click", function () {
      if (window.location.hash === "#signup") {
        history.pushState(null, null, "#");
      } else {
        history.pushState(null, null, "#signup");
        // loadSignupForm();
      }
      router();
    });
}

function loadSignupForm() {
  fetch("/static/users/html/forms/signup-form.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;
      attachSignupFormSubmitListener();
    });
}

function attachSignupFormSubmitListener() {
  document
    .getElementById("signup-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(this);

      fetch("/api/users/profiles/", {
        method: "POST",
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
        body: formData,
      })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.error) {
            displayErrorMessage(data.error);
          } else {
            await fetchCurrentUserInfo();
            currentUser = currentUserInfo.user.username;
            updateUsername();
            loadModal(
              "Signed Up Successfully",
              `Welcome ${currentUserInfo.user.username}, it's nice having you here ✨`
            );
            updateHeader();
            window.location.href = "#profile";
            router();
          }
        });
    });
}

// Fonction pour afficher les messages d'erreur dans le formulaire
function displayErrorMessage(message) {
  const errorMessageDiv = document.getElementById("error-message");
  errorMessageDiv.textContent = message;
  errorMessageDiv.classList.remove("d-none");
}
