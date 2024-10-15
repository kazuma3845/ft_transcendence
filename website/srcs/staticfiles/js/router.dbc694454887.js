async function router() {
  const hash = window.location.hash; // ex: #profile/?username=neah12
  console.log("Hash actuel : ", hash);

  const [route, queryString] = hash.split("?");
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
          const username = params.get("username");
          if (username) {
            console.log("Chargement du profil de l'utilisateur :", username);
          }
          loadProfil(); // Ici, tu passes peut-être `username` à `loadProfil()` si nécessaire
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
