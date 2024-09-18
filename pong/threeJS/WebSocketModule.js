// Module WebSocket
import pong from './game.js';

const WebSocketModule = (() => {
    let sockets = {};  // Utiliser un objet pour stocker les sockets par session

    function startWebSocket(sessionId) {
        // Vérifier si une WebSocket pour cette session existe déjà et est ouverte
        if (sockets[sessionId] && sockets[sessionId].readyState === WebSocket.OPEN) {
            console.log(`WebSocket for session ${sessionId} is already connected.`);
            return;  // Ne pas recréer de socket si elle est déjà ouverte
        }

        // Créer une nouvelle connexion WebSocket pour cette session
        const socket = new WebSocket(`ws://127.0.0.1:8000/ws/game/sessions/${sessionId}/`);

        // Stocker la socket dans l'objet `sockets` avec le sessionId comme clé
        sockets[sessionId] = socket;

        // Connexion ouverte
        socket.onopen = function(e) {
            console.log(`WebSocket connected for session ${sessionId}.`);
        };

        // Réception des messages
        socket.onmessage = function(e) {
            console.log(`Message received for session ${sessionId}:`, e.data);
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'update_position') {
                    pong.updatePosition(data);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        // Fermeture de la connexion WebSocket
        socket.onclose = function(e) {
            console.log(`WebSocket closed for session ${sessionId}.`);
            delete sockets[sessionId];  // Supprimer la socket du tableau lors de la fermeture
        };

        // Gestion des erreurs WebSocket
        socket.onerror = function(e) {
            console.error(`WebSocket error for session ${sessionId}:`, e);
        };
    }

    // Fonction pour envoyer des messages sur la WebSocket
    function sendMessage(sessionId, messageType, messageContent) {
        const socket = sockets[sessionId];  // Récupérer la socket associée à la session
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: messageType,
                content: messageContent
            }));
            return 1;
        } else {
            console.error(`WebSocket for session ${sessionId} is not open. Cannot send message.`);
            return 0;
        }
    }

        window.addEventListener('message', (event) => {
            if (event.origin !== 'http://127.0.0.1:8000') {
                return;
            }
            // Récupérer l'ID de la session de jeu
            localStorage.setItem('game_session_id', event.data.gameSessionId);

        });
    // Retourner les fonctions accessibles depuis l'extérieur du module
    return {
        startWebSocket: startWebSocket,
        sendMessage: sendMessage
    };
})();

export default WebSocketModule;

// // Module WebSocket
// import pong from './game.js';

// const WebSocketModule = (() => {
//     let socket;

//     function startWebSocket(sessionId) {
//         // Créer une connexion WebSocket
//         socket = new WebSocket(`ws://127.0.0.1:8000/ws/game/sessions/${sessionId}/`);

//         // Connexion ouverte
//         socket.onopen = function(e) {
//             // console.log('WebSocket connected.');
//         };

//         // Réception des messages
//         socket.onmessage = function(e) {
//             // console.log('Message received:', e.data);
//             try {
//                 const data = JSON.parse(e.data);
//                 if (data.type === 'update_position') {
//                     // console.log("Nous sommes dans le bot !");
//                     pong.updatePosition(data);
//                 }
//             } catch (error) {
//                 console.error('Error parsing message:', error);
//             }
//         };

//         // Fermeture de la connexion WebSocket
//         socket.onclose = function(e) {
//             console.log('WebSocket closed.');
//         };

//         // Gestion des erreurs WebSocket
//         socket.onerror = function(e) {
//             console.error('WebSocket error:', e);
//         };
//     }

//     // Fonction pour envoyer des messages sur la WebSocket
//     function sendMessage(messageType, messageContent) {
//         if (socket && socket.readyState === WebSocket.OPEN) {
//             socket.send(JSON.stringify({
//                 type: messageType,
//                 content: messageContent
//             }));
//             return 1;
//         } else {
//             console.error('WebSocket is not open. Cannot send message.');
//             return 0;
//         }
//     }
//     // Écoute le message venant du frontend principal
//     window.addEventListener('message', (event) => {
//         if (event.origin !== 'http://127.0.0.1:8000') {
//             return;
//         }
//         // Récupérer l'ID de la session de jeu
//         localStorage.setItem('game_session_id', event.data.gameSessionId);

//     });

//     // Retourner les fonctions accessibles depuis l'extérieur du module
//     return {
//         startWebSocket: startWebSocket,
//         sendMessage: sendMessage
//     };
// })();

// export default WebSocketModule;
