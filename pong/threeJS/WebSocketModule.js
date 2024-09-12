// Module WebSocket
const WebSocketModule = (() => {
    let socket;

    function startWebSocket(sessionId) {
        // Créer une connexion WebSocket
        socket = new WebSocket(`ws://127.0.0.1:8000/ws/game/sessions/${sessionId}/`);

        // Connexion ouverte
        socket.onopen = function(e) {
            console.log('WebSocket connected.');
        };

        // Réception des messages
        socket.onmessage = function(e) {
            console.log('Message received:', e.data);
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'update_position') {
                    console.log("Nous sommes dans le bot !");
                    updatePosition(data);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        // Fermeture de la connexion WebSocket
        socket.onclose = function(e) {
            console.log('WebSocket closed.');
        };

        // Gestion des erreurs WebSocket
        socket.onerror = function(e) {
            console.error('WebSocket error:', e);
        };
    }

    // Fonction pour envoyer des messages sur la WebSocket
    function sendMessage(messageType, messageContent) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: messageType,
                content: messageContent
            }));
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    }

    // Retourner les fonctions accessibles depuis l'extérieur du module
    return {
        startWebSocket: startWebSocket,
        sendMessage: sendMessage
    };
})();

export default WebSocketModule;
