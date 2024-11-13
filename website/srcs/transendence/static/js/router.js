async function router() {
  disposeTooltips();
  let hash = window.location.hash; // ex: #profile/?username=neah12
  console.log("Routing to:", window.location.hash);

  let [route, queryString] = hash.split("?");
  if (route.endsWith("/")) {
    route = route.slice(0, -1);
  }

  const params = new URLSearchParams(queryString);

  try {
    const isAuthenticated = await checkAuthentication();
    // console.log("Utilisateur authentifié : ", isAuthenticated);

    if (isAuthenticated && !currentUserInfo) {
      await fetchCurrentUserInfo();
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
          const params = new URLSearchParams(window.location.hash.split('?')[1]);
          const sessionId = params.get('sessionid'); // Récupère le paramètre 'sessionid'
          console.log("sessionId actuel : ", sessionId);

          if (sessionId) {
            let gameSession = await getGame(sessionId);
            if (gameSession.end_time)
            {
              loadGameForm();
              fetchAvailableSessions();
              break;
            }
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
        if (isAuthenticated) {
          const params = new URLSearchParams(window.location.hash.split('?')[1]);
          const tourId = params.get('tourid'); // Récupère le paramètre 'sessionid'
          console.log("tourId actuel : ", tourId);

          if (tourId) {
            // Charger le jeu avec le sessionId et démarrer le WebSocket
            loadTour(tourId);
          } else {
            loadTourForm();
            fetchAvailableTours();
          }
        } else {
          loadLoginForm();
        }
        break;
      case "#chat":
        loadChat();
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
        if (isAuthenticated) {
          loadProfil(params);
        } else {
          loadLoginForm();
        }
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

function disposeTooltips() {
  const tooltips = document.querySelectorAll('.tooltip');
  tooltips.forEach(tooltip => {
    const instance = bootstrap.Tooltip.getInstance(tooltip);
    if (instance) {
      instance.dispose();
    }
  });
}
