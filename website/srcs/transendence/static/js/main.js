document.addEventListener('DOMContentLoaded', function() {

});

function loadUserProfiles() {
	fetch('/api/users/profiles/')
		.then(response => response.json())
		.then(data => {
			let userList = document.getElementById('user-list');
			userList.innerHTML = '';

			data.forEach(profile => {
				let listItem = document.createElement('li');
				listItem.textContent = `${profile.user.username} - ${profile.bio}`;
				userList.appendChild(listItem);
			});
		})
		.catch(error => console.error('Error fetching user profiles:', error));
}

// Charger les parties de jeu
function loadGames() {
	// Code pour charger les parties depuis l'API du jeu
}

// Charger les classements
function loadLeaderboards() {
	// Code pour charger les classements depuis l'API des classements
}
