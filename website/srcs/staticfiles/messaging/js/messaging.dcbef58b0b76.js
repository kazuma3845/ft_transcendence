// 1.	loadChat : Charge le HTML du chat.
// 2.	loadConversations : Charge la liste des conversations via l’API.
// 3.	loadMessages : Charge les messages d’une conversation sélectionnée.
// 4.	openWebSocket : Ouvre une connexion WebSocket pour la conversation active.
// 5.	sendMessage : Envoie un message via WebSocket.
// 6.	displayNewMessage : Affiche un nouveau message dans la zone de chat.

// Fonction pour afficher la modal
function openSearchUserModal() {
    const modal = document.getElementById('newConversationModal');
    modal.style.display = 'flex';  // Afficher la modal en mode flex pour centrer le contenu
}

// Fonction pour fermer la modal
function closeSearchUserModal() {
    const modal = document.getElementById('newConversationModal');
    modal.style.display = 'none';  // Masquer la modal
}

// Fermer la modal si l'utilisateur clique en dehors du contenu
window.onclick = function(event) {
    console.log("ourter")
    const modal = document.getElementById('newConversationModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

function searchUser() {
    const query = document.getElementById('searchUserInput').value;

    if (query.length > 0) {
        fetch(`/api/users/profiles/search/?query=${query}`)  // Remplacer par ton endpoint API de recherche d'utilisateur
        .then(response => response.json())
        .then(users => {
            const resultsList = document.getElementById('searchResults');
            resultsList.innerHTML = '';  // Réinitialiser les résultats

            users.forEach(user => {
                if (user.username !== currentUser) {  // Exclure l'utilisateur actuel
                    const userItem = document.createElement('li');
                    userItem.textContent = user.username;
                    userItem.onclick = () => selectUser(user.id, user.username);  // Sélectionner un utilisateur
                    resultsList.appendChild(userItem);
                }
            });
        });
    }
}

function startConversation(selectedUserId) {
    const participants = [selectedUserId, currentUser.id];  // Liste des participants : utilisateur sélectionné et utilisateur actuel

    // Envoyer une requête POST pour créer une nouvelle conversation avec plusieurs participants
    fetch('/api/messaging/conversations/create_conversation/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()  // Assure-toi de bien gérer le token CSRF
        },
        body: JSON.stringify({
            participants: participants  // Envoyer la liste des participants
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la création de la conversation');
        }
        return response.json();
    })
    .then(data => {
        console.log('Nouvelle conversation créée:', data);
        // Charger les conversations et fermer la modal
        loadConversations();
        closeSearchUserModal();
    })
    .catch(error => {
        console.error('Erreur lors de la création de la conversation:', error);
    });
}

// Fonction pour sélectionner un utilisateur et démarrer la conversation
let selectedUserId = null;

function selectUser(userId, username) {
    selectedUserId = userId;  // Stocke l'ID de l'utilisateur sélectionné
    console.log(`Utilisateur sélectionné : ${username}`);

    // Appeler la fonction pour démarrer la conversation avec l'utilisateur sélectionné
    // startConversation(selectedUserId);
}

function loadChat() {
    fetch('/static/messaging/html/chat.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;

        // Charger la liste des conversations
        loadConversations();

        // Ouvrir la WebSocket globale pour l'utilisateur
        connectWebSocket();  // La WebSocket globale est connectée ici

        // Associer l'envoi de message au bouton "Envoyer"
        document.getElementById('send-message').addEventListener('click', () => {
            const conversationId = getActiveConversationId();  // Obtenir l'ID de la conversation active
            const messageInput = document.getElementById('message-input');
            const message = messageInput.value;

            if (conversationId && message.trim() !== '') {
                sendMessage(conversationId, message);  // Envoyer le message à cette conversation
                messageInput.value = '';  // Réinitialiser le champ de saisie après l'envoi
            } else {
                console.error("Aucune conversation active sélectionnée ou message vide");
            }
        });

        // Associer l'envoi de message à la touche "Entrée"
        document.getElementById('message-input').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const conversationId = getActiveConversationId();
                const message = document.getElementById('message-input').value;

                if (conversationId && message.trim() !== '') {
                    sendMessage(conversationId, message);  // Envoyer le message à cette conversation
                    document.getElementById('message-input').value = '';  // Réinitialiser le champ de saisie après l'envoi
                } else {
                    console.error("Aucune conversation active sélectionnée ou message vide");
                }
            }
        });
    })
    .catch(error => console.error('Erreur lors du chargement du chat:', error));
}

let activeConversationId = 0;  // Variable globale pour stocker l'ID de la conversation active

function loadConversations() {
    fetch('/api/messaging/conversations/')
    .then(response => response.json())
    .then(conversations => {
        const convList = document.querySelector('.discussion-list');
        convList.innerHTML = '';  // Réinitialiser la liste

        conversations.forEach(conversation => {
            const convItem = document.createElement('div');
            convItem.classList.add('user-conversation', 'bg-primary', 'p-2', 'mb-2', 'rounded');
            convItem.textContent = `Conversation avec ${conversation.participants}`;

            // Ajouter un event listener pour charger les messages et définir la conversation active
            convItem.addEventListener('click', () => {
                activeConversationId = conversation.id;  // Stocker l'ID de la conversation active
                loadMessages(conversation.id);  // Charger les messages de cette conversation
                // openWebSocket(conversation.id);  // Ouvrir la WebSocket pour cette conversation
            });

            convList.appendChild(convItem);
        });
    });
}

function getActiveConversationId() {
    return activeConversationId;  // Retourner l'ID de la conversation active
}

function loadMessages(conversationId) {
    fetch(`/api/messaging/conversations/${conversationId}/messages/`)  // API pour récupérer les messages
    .then(response => response.json())
    .then(messages => {
        const messagesList = document.getElementById('chat-messages');
        messagesList.innerHTML = '';  // Réinitialiser la zone des messages

        messages.forEach(message => {
            const messageItem = document.createElement('div');

            // Vérifier si le message appartient à l'utilisateur actuel
            const isUserMessage = message.sender === currentUser;

            // Ajout des classes pour l'alignement à droite ou à gauche
            messageItem.classList.add('d-flex', isUserMessage ? 'justify-content-end' : 'justify-content-start');

            const messageContent = document.createElement('div');

            // Styles des messages : vert pour les messages de l'utilisateur, autre pour les autres
            messageContent.classList.add('p-2', 'mb-1', 'rounded-3', isUserMessage ? 'bg-success' : 'bg-body-tertiary');
            messageContent.textContent = message.content;

            messageItem.appendChild(messageContent);
            messagesList.appendChild(messageItem);
        });

        // Scroller en bas de la zone de messages pour voir les nouveaux messages
        messagesList.scrollTop = messagesList.scrollHeight;
    });
}

function displayNewMessage(data) {
    const messagesList = document.getElementById('chat-messages');

    const messageItem = document.createElement('div');

    // Vérifier si l'utilisateur actuel est l'expéditeur
    const isUserMessage = data.sender === currentUser;

    // Ajout des classes CSS en fonction de l'expéditeur
    messageItem.classList.add('d-flex', isUserMessage ? 'justify-content-end' : 'justify-content-start');

    const messageContent = document.createElement('div');

    // Ajouter des styles en fonction de l'expéditeur (vert pour l'utilisateur, autre couleur pour les autres)
    messageContent.classList.add('p-2', 'mb-1', 'rounded-3', isUserMessage ? 'bg-success' : 'bg-body-tertiary');
    messageContent.textContent = data.message;

    messageItem.appendChild(messageContent);
    messagesList.appendChild(messageItem);

    // Scroller automatiquement en bas de la zone de messages
    messagesList.scrollTop = messagesList.scrollHeight;
}

// ------------------------>> WEBSOCKET

let socket;

function connectWebSocket() {
    // Si une WebSocket existe déjà, on la ferme avant d'en ouvrir une nouvelle
    if (socket) {
        socket.close();
    }

    // Ouvrir la WebSocket globale pour l'utilisateur
    socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/`);  // Connexion WebSocket globale

    // Gérer l'ouverture de la WebSocket
    socket.onopen = function(e) {
        console.log("Connexion WebSocket établie");
        // Optionnel : Informer le serveur que l'utilisateur est connecté
        socket.send(JSON.stringify({
            'type': 'new_connection',
            'content': {}
        }));
    };

    // Gérer la réception des messages WebSocket
    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);


        // Vérifier le type du message reçu
        if (data.type === "upload_message") {
            const conversationId = data.content.conversation_id;  // Récupérer l'ID de la conversation
            // const message = data.content.message;  // Récupérer le contenu du message
            // Afficher le message dans la boîte de la conversation correspondante
			console.log(`activeConversationId : ${activeConversationId} | data.content.conversation_id : ${data.content.conversation_id}`);
			if (activeConversationId === data.content.conversation_id)
				displayNewMessage(data.content);
			// loadMessages(conversationId);
        } else {
            console.log(`Type de message non géré : ${data.type}`);
        }
    };

    // Gestion de la fermeture de la WebSocket
    socket.onclose = function(e) {
        console.log("WebSocket fermée");
    };

    // Gestion des erreurs WebSocket
    socket.onerror = function(e) {
        console.log("Erreur WebSocket", e);
    };
}

function sendMessage(conversationId, message) {
    // Envoi du message à travers la WebSocket
    socket.send(JSON.stringify({
        type: 'newMessage',
        content: {
            conversation_id: conversationId,
            message: message,
			sender: currentUser,
			from: 'front'
        }
    }));
}

function setupChatInterface(socket) {
    // Vérifier l'état de l'utilisateur (si il est authentifié)
    const userIsAuthenticated = false;//{{ user.is_authenticated|lower }};

    if (userIsAuthenticated) {
        console.log("Utilisateur authentifié, interface de chat active.");

        // Boucler sur tous les boutons d'envoi de message pour chaque conversation
        document.querySelectorAll(".send-message").forEach(button => {
            button.onclick = function() {
                const conversationId = this.getAttribute('data-conversation-id');  // Récupérer l'ID de la conversation
                const messageInput = document.querySelector(`#message-input-${conversationId}`);
                const message = messageInput.value;

                // Envoyer le message avec l'ID de la conversation via la WebSocket
                if (message && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        'conversation_id': conversationId,
                        'message': message
                    }));
                    messageInput.value = '';  // Réinitialiser le champ de saisie après envoi
                } else {
                    console.error("Message non envoyé : WebSocket non connectée ou message vide.");
                }
            };
        });
    } else {
        console.log("Utilisateur non authentifié.");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // 1. Connexion WebSocket
    const socket = connectWebSocket();

    // 2. Configuration de l'interface de chat
    // setupChatInterface(socket);
});
