async function router() {
  const hash = window.location.hash; // Récupère le fragment d'URL
  console.log("Hash actuel : ", hash);

  try {
    const isAuthenticated = await checkAuthentication();
    // console.log("Utilisateur authentifié : ", isAuthenticated);
    if (isAuthenticated && !userInfo) {
      await fetchUserInfo();
      updateUsername();
    }
    switch (hash.split('?')[0]) {
      case "#signup":
        loadSignupForm();
        break;
      case "#login":
        loadLoginForm();
        break;
      case "#game":
        if (isAuthenticated) {
          const params = new URLSearchParams(window.location.hash.split('?')[1]);
          const sessionId = params.get('sessionid'); // Récupère le paramètre 'sessionid'
          console.log("sessionId actuel : ", sessionId);

          if (sessionId) {
            // Charger le jeu avec le sessionId et démarrer le WebSocket
            loadGame(sessionId).then(() => {
              startWebSocket(sessionId); // Démarre la session WebSocket
            }).catch((error) => {
              console.error("Erreur lors du chargement du jeu:", error);
            });
          } else {
            loadGameForm();
            fetchAvailableSessions();
          }
        } else {
          loadLoginForm();
        }
        break;
      case "#tournaments":
        loadTournamentsForm();
          break;
      case "#chat":
          loadChat();
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
