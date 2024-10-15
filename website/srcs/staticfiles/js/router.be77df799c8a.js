async function router() {
  let hash = window.location.hash; // ex: #profile/?username=neah12
  console.log("Hash actuel : ", hash);

  let [route, queryString] = hash.split("?"); 
  if (route.endsWith("/")) {
    route = route.slice(0, -1); 
  }

  const params = new URLSearchParams(queryString);
  try {
    const isAuthenticated = await checkAuthentication();
    console.log("Utilisateur authentifié : ", isAuthenticated);

    if (isAuthenticated && !userInfo) {
      await fetchUserInfo();
      updateUsername();
    }

    switch (route) {
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
        if (isAuthenticated) {
          loadProfil(params);
        } else {
          loadLoginForm();
        }
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