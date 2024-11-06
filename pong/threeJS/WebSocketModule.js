// Module WebSocket pour chaque instance de jeu Pong
import {startGameDual} from './game.js';
import  {showWinScreen} from './game.js';

export default class WebSocketModule {
    constructor(pong) {
        this.pong = pong;
        this.socket = null;
        this.pingInterval = null;  // Pour gérer l'intervalle de ping
    }

    startWebSocket(sessionId) {
        // Vérifier si la WebSocket est déjà connectée
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log(`WebSocket for session ${sessionId} is already connected.`);
            return;
        }

        // Créer une nouvelle connexion WebSocket pour cette session
        this.socket = new WebSocket(`/ws/game/sessions/${sessionId}/`);

        // Connexion ouverte
        this.socket.onopen = (e) => {
            console.log(`WebSocket connected for session ${sessionId}.`);
        };

        // Réception des messages
        this.socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'update_position') {
                    this.pong.updatePosition(data);
                }
                if (data.type === 'start_game') {
                    startGameDual();
                }
                if (data.type === 'player_disconnected') {
                    if (this.pong.score[0] != this.pong.winScore && this.pong.score[1] != this.pong.winScore)
                        this.pong.sendDataToScore();
                        showWinScreen(this.pong.player, "win the game by forfeit!", this.pong.score[0], this.pong.score[1], true);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        // Fermeture de la connexion WebSocket
        this.socket.onclose = (e) => {
            console.log(`WebSocket closed for session ${sessionId}.`);
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
