let userInfo = null;

async function fetchUserInfo() {
  if (!userInfo) {
    const response = await fetch("/api/users/profiles/info-user");
    const data = await response.json();
    userInfo = data;
  }
  return userInfo;
}

function loadProfil() {
  fetch("/static/users/html/profil/profil.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;
      addProfil();
    });
}

function addProfil() {
  return fetchUserInfo()
    .then((data) => {
      console.log("DATA", data);

      document.getElementById("username").textContent = data.user.username;
      document.getElementById("email").textContent = data.user.email;
      document.getElementById("bio").textContent = data.bio
        ? data.bio
        : "Ceci est une bio vraiment pas très intéressante. J'imagine que j'aime le pong puisque je suis ici. (Aidez moi à trouver un stage svp)";

      document.querySelector(".avatar-div img").src = data.avatar_url
        ? data.avatar_url
        : "/static/users/avatars/avatar.png";

      document.querySelector(".div-banner img").src = data.banner
        ? data.banner
        : "/static/users/banners/ping-pong.gif";
    })

    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des infos utilisateur:",
        error
      );
    });
}
