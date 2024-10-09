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
        this.socket = new WebSocket(`wss://transcendence/ws/game/sessions/${sessionId}/`);

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
// window.addEventListener('message', (event) => {
//     if (event.origin !== 'https://transcendence/') {
//         return;
//     }
//     // Récupérer l'ID de la session de jeu
//     localStorage.setItem('game_session_id', event.data.gameSessionId);
//     console.log(`Dans addEvent : localStorage.getItem(${localStorage.getItem('game_session_id')})`)

// });
