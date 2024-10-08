async function router() {
  const hash = window.location.hash;
  console.log("Hash actuel : ", hash);

  try {
    const isAuthenticated = await checkAuthentication();
    console.log("Utilisateur authentifié : ", isAuthenticated);
    if (isAuthenticated) {
      fetchUserInfo();
      updateUsername();
    }
    switch (hash) {
      case "#signup":
        loadSignupForm();
        break;
      case "#login":
        loadLoginForm();
        break;
      case "#game":
        if (isAuthenticated) {
          loadGameForm();
          fetchAvailableSessions();
        } else {
          loadLoginForm();
        }
        break;
      case "#tournaments":
        loadTournamentsForm();
        break;
      case "#createTournament":
        loadCreatTournamentsForm();
        break;
      case "#profile":
        if (isAuthenticated) loadProfil();
        else loadLoginForm();
        break;
      default:
        loadHome();
        break;
    }
  } catch (error) {
    console.error("Erreur dans le routeur : ", error);
  }
}

window.addEventListener("hashchange", router);
document.addEventListener("DOMContentLoaded", router);

function getCSRFToken() {
  // Récupère le token CSRF du cookie
  let cookieValue = null;
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith("csrftoken=")) {
      cookieValue = cookie.substring("csrftoken=".length);
      break;
    }
  }
  return cookieValue;
}
