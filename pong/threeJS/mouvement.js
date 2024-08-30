
export default class Pong {
    constructor(form, bot) {
        this.bot = bot;
        this.form = form;
        this.arenaWidth = this.form.arene_size[0] - (2 * this.form.LRborder_size[0]);
        this.arenaHeight = this.form.arene_size[1] - (2 * this.form.NSborder_size[1]);
        this.initialSpeed = 6;
        this.ballSpeedX = this.initialSpeed;
        this.ballSpeedY = 0;
        this.ballPaused = true;
        this.keysPressed = {};
        this.paddle_move_speed = 4;
        this.lastExecTime = 1; // Temps de la dernière exécution du script (1 pour lancer des le debut)
        this.ball_angle = 90;
        // this.botActivated = True;
        this.botLVL = 1;
        this.score = [0, 0];


        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        window.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    handleKeyDown(event) {
        this.keysPressed[event.key] = true;
    }

    handleKeyUp(event) {
        this.keysPressed[event.key] = false;
    }

    deplacerRaquette(deltaTime) {
        const speedFactor = deltaTime / 16.67;
        const moveSpeed = this.paddle_move_speed * speedFactor;
        const halfArenaHeight = this.arenaHeight / 2;
        const halfRaquetteHeight = this.form.paddle_size[1] / 2;

        if (this.keysPressed['k']) {
            if ((this.form.paddleRight.position.y - halfRaquetteHeight - moveSpeed) > -halfArenaHeight) {
                this.form.paddleRight.position.y -= moveSpeed;
            } else {
                this.form.paddleRight.position.y = -(halfArenaHeight - halfRaquetteHeight);
            }
        }

        if (this.keysPressed['o']) {
            if ((this.form.paddleRight.position.y + halfRaquetteHeight + moveSpeed) < halfArenaHeight) {
                this.form.paddleRight.position.y += moveSpeed;
            } else {
                this.form.paddleRight.position.y = halfArenaHeight - halfRaquetteHeight;
            }
        }

        if (this.keysPressed['s']) {
            if ((this.form.paddleLeft.position.y - halfRaquetteHeight - moveSpeed) > -halfArenaHeight) {
                this.form.paddleLeft.position.y -= moveSpeed;
            } else {
                this.form.paddleLeft.position.y = -(halfArenaHeight - halfRaquetteHeight);
            }
        }

        if (this.keysPressed['w']) {
            if ((this.form.paddleLeft.position.y + halfRaquetteHeight + moveSpeed) < halfArenaHeight) {
                this.form.paddleLeft.position.y += moveSpeed;
            } else {
                this.form.paddleLeft.position.y = halfArenaHeight - halfRaquetteHeight;
            }
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && this.ballPaused) {
            this.ballPaused = false;
        if (this.form.ball.position.x < 0)
            this.bot.handleBallHit();
        }
    }

    updateBallPosition(deltaTime) {
        if (this.ballPaused) {
            if (this.form.ball.position.x < 0) {
                this.form.ball.position.y = this.form.paddleLeft.position.y;
            }
            if (this.form.ball.position.x > 0) {
                this.form.ball.position.y = this.form.paddleRight.position.y;
                this.bot.startGame();
            }
            return;
        }

        const speedFactor = deltaTime / 16.67;
        const adjustedSpeedX = this.ballSpeedX * speedFactor;
        const adjustedSpeedY = this.ballSpeedY * speedFactor;

        this.form.ball.rotation.x += adjustedSpeedY * 0.1;
        this.form.ball.rotation.y += adjustedSpeedX * 0.1;

        this.form.ball.position.x += adjustedSpeedX;
        this.form.ball.position.y += adjustedSpeedY;

        const halfArenaWidth = this.arenaWidth / 2;
        const halfArenaHeight = this.arenaHeight / 2;

        if ((this.form.ball.position.x + this.form.ballRayon) >= halfArenaWidth) {
            this.form.ball.position.x = this.form.paddleRight.position.x - this.form.paddle_size[0] / 2 - this.form.ballRayon;
            this.form.ball.position.y = this.form.paddleRight.position.y;
            this.ballSpeedX = -this.initialSpeed;
            this.ballPaused = true;
            this.score[0] += 1;
            this.sendDataToScore();
        }

        if ((this.form.ball.position.x - this.form.ballRayon) <= -halfArenaWidth) {
            this.form.ball.position.x = this.form.paddleLeft.position.x + this.form.paddle_size[0] / 2 + this.form.ballRayon;
            this.form.ball.position.y = this.form.paddleLeft.position.y;
            this.ballSpeedX = this.initialSpeed;
            this.ballPaused = true;
            this.score[1] += 1;
            this.sendDataToScore();
        }

        if ((this.form.ball.position.y + this.form.ballRayon) >= halfArenaHeight || (this.form.ball.position.y - this.form.ballRayon) <= -halfArenaHeight) {
            this.ballSpeedY = -this.ballSpeedY;
        }

        //-----------------paddle----------------------------
        const halfRaquetteHeight = this.form.paddle_size[1] / 2;
        const halfRaquetteWidth = this.form.paddle_size[0] / 2;

        if (this.form.ball.position.x - this.form.ballRayon <= this.form.paddleLeft.position.x + halfRaquetteWidth &&
            this.form.ball.position.y >= this.form.paddleLeft.position.y - halfRaquetteHeight &&
            this.form.ball.position.y <= this.form.paddleLeft.position.y + halfRaquetteHeight) {
            const impactY = this.form.ball.position.y - this.form.paddleLeft.position.y;
            const normalizedImpactY = impactY / halfRaquetteHeight;
            const bounceAngle = normalizedImpactY * (Math.PI / 4);
            this.ballSpeedX = Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
            this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
            const angleRadians = Math.atan2(this.ballSpeedY, this.ballSpeedX);
            const angleDegrees = angleRadians * (180 / Math.PI);
            this.ball_angle = 90 - angleDegrees;
            if (!this.ballPaused)
                this.bot.handleBallHit();
            else 
                this.bot.replaceBot();
        }

        if (this.form.ball.position.x + this.form.ballRayon >= this.form.paddleRight.position.x - halfRaquetteWidth &&
            this.form.ball.position.y >= this.form.paddleRight.position.y - halfRaquetteHeight &&
            this.form.ball.position.y <= this.form.paddleRight.position.y + halfRaquetteHeight) {
            const impactY = this.form.ball.position.y - this.form.paddleRight.position.y;
            const normalizedImpactY = impactY / halfRaquetteHeight;
            const bounceAngle = normalizedImpactY * (Math.PI / 4);
            this.ballSpeedX = -Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
            this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
            if (!this.ballPaused)
                this.bot.replaceBot();
        }

        const speed = Math.sqrt(this.ballSpeedX * this.ballSpeedX + this.ballSpeedY * this.ballSpeedY);
        this.ballSpeedX = (this.ballSpeedX / speed) * this.initialSpeed;
        this.ballSpeedY = (this.ballSpeedY / speed) * this.initialSpeed;
    }

    sendDataToScore() {
        const data = {
            player1_points: this.score[0],
            player2_points: this.score[1],
        };
        console.log("Sending data:", JSON.stringify(data));

        fetch(`http://127.0.0.1:8000/api/game/sessions/${this.id}/update_score/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCookie('csrftoken'),
            },
            body: JSON.stringify(data)
        })
        .catch(error => console.error('Erreur:', error));
    }

    sendDataForID() {
        // const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        fetch('http://127.0.0.1:8000/api/game/sessions/start_single/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCookie('csrftoken'),
            },
        })
        .then(response => response.json())
        .then(data => {
            this.id = data.id;
        })
        .catch(error => console.error('Erreur:', error));
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Vérifie si ce cookie commence par le nom donné
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}
