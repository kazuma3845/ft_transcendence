async function router() {
  const hash = window.location.hash; // ex: #profile/?username=neah12
  const [route, queryString] = hash.split("?");
  const params = new URLSearchParams(queryString);
  if (route.endsWith("/")) {
    route = route.slice(0, -1);
  }
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
