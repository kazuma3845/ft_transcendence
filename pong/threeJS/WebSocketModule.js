// Module WebSocket pour chaque instance de jeu Pong
import {startGameDual} from './game.js';

export default class WebSocketModule {
    constructor(pong) {
        this.pong = pong;
        // this.sessionId = this.pong.id;
        this.socket = null;
    }

    startWebSocket(sessionId) {
        // Vérifier si la WebSocket est déjà connectée
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log(`WebSocket for session ${sessionId} is already connected.`);
            return;
        }

        // Créer une nouvelle connexion WebSocket pour cette session
        this.socket = new WebSocket(`ws://10.0.0.7:8000/ws/game/sessions/${sessionId}/`);

        // Connexion ouverte
        this.socket.onopen = (e) => {
            console.log(`WebSocket connected for session ${sessionId}.`);
        };

        // Réception des messages
        this.socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'update_position') {
                    // Appel de la fonction du jeu pour mettre à jour la position
                    this.pong.updatePosition(data);
                }
                if (data.type === 'start_game') {
                    // console.log(`start_game = ${data.message}`)
                    // Appel de la fonction du jeu pour mettre à jour la position
                    startGameDual();
                }
                if (data.type === 'launch_ball') {
                    console.log(`launch_ball = ${data.content}`)
                    // Appel de la fonction du jeu pour mettre à jour la position
                    this.pong.ballPaused = false;
                }                
                // if (data.type === 'readBeforeStart') {
                //     // Appel de la fonction du jeu pour mettre à jour la position
                // }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        // Fermeture de la connexion WebSocket
        this.socket.onclose = (e) => {
            console.log(`WebSocket closed for session ${sessionId}.`);
            this.socket = null;  // Réinitialiser la connexion fermée
        };

        // Gestion des erreurs WebSocket
        this.socket.onerror = (e) => {
            console.error(`WebSocket error for session ${sessionId}:`, e);
        };
    }

    // Méthode pour envoyer des messages sur la WebSocket
    sendMessage(messageType, messageContent) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: messageType,
                content: messageContent
            }));
            return true;
        } else {
            console.error(`WebSocket for session is not open. Cannot send message.`);
            return false;
        }
    }
}
window.addEventListener('message', (event) => {
    if (event.origin !== 'http://10.0.0.7:8000') {
        return;
    }
    // Récupérer l'ID de la session de jeu
    localStorage.setItem('game_session_id', event.data.gameSessionId);
    console.log(`Dans addEvent : localStorage.getItem(${localStorage.getItem('game_session_id')})`)

});

// // Module WebSocket
// import pong from './game.js';

// const WebSocketModule = (() => {
//     let socket;

//     function startWebSocket(sessionId) {
//         // Créer une connexion WebSocket
//         socket = new WebSocket(`ws://10.0.0.7:8000/ws/game/sessions/${sessionId}/`);

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
//         if (event.origin !== 'http://10.0.0.7:8000') {
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
