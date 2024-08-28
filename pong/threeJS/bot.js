export default class Bot {
    constructor(pong, form) {
        this.pong = pong;
        this.form = form;
    }

    handleBallHit() {
        const currentTime = Date.now();
        const timeSinceLastExec = currentTime - this.pong.lastExecTime;

        if (timeSinceLastExec >= 1000) {
            this.sendDataToBot(this);
        } else {
            setTimeout(() => {
                this.sendDataToBot(this);
            }, 1000 - timeSinceLastExec);
        }
    }

    sendDataToBot() {
        const data = {
            ball_position: [this.form.ball.position.x, this.form.ball.position.y],
            ball_speed: this.pong.initialSpeed,
            ball_angle: this.pong.ball_angle,
            field_height: this.pong.arenaHeight,
            field_length: this.pong.arenaWidth,
            paddle_position: [this.form.paddleRight.position.x, this.form.paddleRight.position.y],
            paddle_size: this.form.paddle_size[1],
            paddle_move_speed: this.pong.paddle_move_speed,
            side: "right", // ou "left" selon la logique
            score: [1, 0], // Mettre à jour avec le score actuel
            ballPaused: this.pong.ballPaused,
            bot_lvl: this.pong.botLVL,
        };
        console.log("Sending data:", JSON.stringify(data));
        fetch('http://localhost:8081/api/receive-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            this.processBotResponse(data);
        })
        .catch(error => console.error('Erreur:', error));
    }
    
    processBotResponse(data) {
        console.log("Réponse reçue:", data);
        this.input = data.input;
    }

    updateBotPosition() {
        console.log("Déplacer le bot de:", this.input);
        // Reset the key presses
        this.pong.keysPressed['o'] = false;
        this.pong.keysPressed['k'] = false;

        if (this.input > 0) {
            this.pong.keysPressed['o'] = true;
            this.input--;
        } else if (this.input < 0) {
            this.pong.keysPressed['k'] = true;
            this.input++;
        }
    }
}