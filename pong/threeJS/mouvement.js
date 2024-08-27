import val from './value.json';

export default class Pong {
    constructor(form) {
        this.form = form;
        this.arenaWidth = val.arene_size[0] - (2 * val.LRborder_size[0]);
        this.arenaHeight = val.arene_size[1] - (2 * val.NSborder_size[1]);
        this.initialSpeed = val.ball_speed;
        this.ballSpeedX = val.ball_speed;
        this.ballSpeedY = 0;
        this.ballPaused = true;
        this.keysPressed = {};
        this.lastExecTime = 1; // Temps de la dernière exécution du script (1 pour lancer des le debut)
        this.botActivated = True;


        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        window.addEventListener('keydown', this.handleKeyPress.bind(this));

        this.animate();
    }

    handleKeyDown(event) {
        this.keysPressed[event.key] = true;
    }

    handleKeyUp(event) {
        this.keysPressed[event.key] = false;
    }

    deplacerRaquette(deltaTime) {
        const speedFactor = deltaTime / 16.67;
        const moveSpeed = val.paddle_move_speed * speedFactor;
        const halfArenaHeight = this.arenaHeight / 2;
        const halfRaquetteHeight = val.paddle_size[1] / 2;
    
        if (this.keysPressed['ArrowDown']) {
            if ((this.form.paddleRight.position.y - halfRaquetteHeight - moveSpeed) > -halfArenaHeight) {
                this.form.paddleRight.position.y -= moveSpeed;
            }
            else {
                this.form.paddleRight.position.y = -(halfArenaHeight - halfRaquetteHeight);
            }
        }
    
        if (this.keysPressed['ArrowUp']) {
            if ((this.form.paddleRight.position.y + halfRaquetteHeight + moveSpeed) < halfArenaHeight) {
                this.form.paddleRight.position.y += moveSpeed;
            }
            else {
                this.form.paddleRight.position.y = halfArenaHeight - halfRaquetteHeight;
            }
        }
    
        if (this.keysPressed['s']) {
            if ((this.form.paddleLeft.position.y - halfRaquetteHeight - moveSpeed) > -halfArenaHeight) {
                this.form.paddleLeft.position.y -= moveSpeed;
            }
            else {
                this.form.paddleLeft.position.y = -(halfArenaHeight - halfRaquetteHeight);
            }
        }
    
        if (this.keysPressed['w']) {
            if ((this.form.paddleLeft.position.y + halfRaquetteHeight + moveSpeed) < halfArenaHeight) {
                this.form.paddleLeft.position.y += moveSpeed;
            }
            else {
                this.form.paddleLeft.position.y = halfArenaHeight - halfRaquetteHeight;
            }
        }
    }
    

    handleKeyPress(event) {
        if (event.key === 'Enter' && this.ballPaused) {
            this.ballPaused = false;
        }
    }

    updateBallPosition() {
        if (this.ballPaused) {
            if (this.form.ball.position.x < 0) {
                this.form.ball.position.y = this.form.paddleLeft.position.y;
            }
            if (this.form.ball.position.x > 0) {
                this.form.ball.position.y = this.form.paddleRight.position.y;
            }
            return;
        }
        this.form.ball.rotation.x += this.ballSpeedY * 0.1;
        this.form.ball.rotation.y += this.ballSpeedX * 0.1;

        // val.ball_angle = Math.atan2(this.ballSpeedY, this.ballSpeedX);

        this.form.ball.position.x += this.ballSpeedX;
        this.form.ball.position.y += this.ballSpeedY;

        // val.ball_pos[0] = this.form.ball.position.x;
        // val.ball_pos[1] = this.form.ball.position.y;

        const halfArenaWidth = this.arenaWidth / 2;
        const halfArenaHeight = this.arenaHeight / 2;

        if ((this.form.ball.position.x + val.ballRayon) >= halfArenaWidth) {
            this.form.ball.position.x = this.form.paddleRight.position.x - val.paddle_size[0] / 2 - val.ballRayon;
            this.form.ball.position.y = this.form.paddleRight.position.y;
            this.ballSpeedX = -Math.abs(this.ballSpeedX);
            this.ballPaused = true;
        }

        if ((this.form.ball.position.x - val.ballRayon) <= -halfArenaWidth) {
            this.form.ball.position.x = this.form.paddleLeft.position.x + val.paddle_size[0] / 2 + val.ballRayon;
            this.form.ball.position.y = this.form.paddleLeft.position.y;
            this.ballSpeedX = Math.abs(this.ballSpeedX);
            this.ballPaused = true;
        }
        
        if ((this.form.ball.position.y + val.ballRayon) >= halfArenaHeight || (this.form.ball.position.y - val.ballRayon) <= -halfArenaHeight) {
            this.ballSpeedY = -this.ballSpeedY;
        }
        
        //-----------------paddle----------------------------
        const halfRaquetteHeight = val.paddle_size[1] / 2;
        const halfRaquetteWidth = val.paddle_size[0] / 2;
                
        if (this.form.ball.position.x - val.ballRayon <= this.form.paddleLeft.position.x + halfRaquetteWidth &&
            this.form.ball.position.y >= this.form.paddleLeft.position.y - halfRaquetteHeight &&
            this.form.ball.position.y <= this.form.paddleLeft.position.y + halfRaquetteHeight) {
            const impactY = this.form.ball.position.y - this.form.paddleLeft.position.y;
            const normalizedImpactY = impactY / halfRaquetteHeight;
            const bounceAngle = normalizedImpactY * (Math.PI / 4);
            this.ballSpeedX = Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
            this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
        
            const speed = Math.sqrt(this.ballSpeedX * this.ballSpeedX + this.ballSpeedY * this.ballSpeedY);
            this.ballSpeedX = (this.ballSpeedX / speed) * this.initialSpeed;
            this.ballSpeedY = (this.ballSpeedY / speed) * this.initialSpeed;
            this.handleBallHit(); //Envoie les informations
        }
        
        if (this.form.ball.position.x + val.ballRayon >= this.form.paddleRight.position.x - halfRaquetteWidth &&
            this.form.ball.position.y >= this.form.paddleRight.position.y - halfRaquetteHeight &&
            this.form.ball.position.y <= this.form.paddleRight.position.y + halfRaquetteHeight) {
            const impactY = this.form.ball.position.y - this.form.paddleRight.position.y;
            const normalizedImpactY = impactY / halfRaquetteHeight;
            const bounceAngle = normalizedImpactY * (Math.PI / 4);
            this.ballSpeedX = -Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
            this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
        
            const speed = Math.sqrt(this.ballSpeedX * this.ballSpeedX + this.ballSpeedY * this.ballSpeedY);
            this.ballSpeedX = (this.ballSpeedX / speed) * this.initialSpeed;
            this.ballSpeedY = (this.ballSpeedY / speed) * this.initialSpeed;
        }
    }

    animate(timestamp) {
        if (!this.lastTime) {
            this.lastTime = timestamp;
        }
    
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
    
        this.deplacerRaquette(deltaTime);
        requestAnimationFrame(this.animate.bind(this));
    }

    handleBallHit() {
        const currentTime = Date.now();
        const timeSinceLastExec = currentTime - this.lastExecTime;

        if (timeSinceLastExec >= 1000) {
            this.sendDataToBot(this);
        } else {
            setTimeout(() => {
                this.sendDataToBot(this);
            }, 1000 - timeSinceLastExec);
        }
    }

    sendDataToAPI() {
        //! A CORRIGER LES DATA SONT PAS BONNES
        const data = {
            ball_position: [this.form.ball.position.x, this.form.ball.position.y],
            ball_speed: Math.sqrt(this.ballSpeedX * this.ballSpeedX + this.ballSpeedY * this.ballSpeedY),
            ball_angle: Math.atan2(this.ballSpeedY, this.ballSpeedX),
            field_height: this.arenaHeight,
            field_length: this.arenaWidth,
            paddle_position: [this.form.paddleLeft.position.y, this.form.paddleRight.position.y],
            paddle_size: val.paddle_size[1],
            paddle_move_speed: val.paddle_move_speed,
            side: "right", // ou "left" selon la logique
            score: [5, 0], // Mettre à jour avec le score actuel
            ballPaused: this.ballPaused,
            bot_lvl: 1
        };

        fetch('http://bot:8081/api/receive-data', {
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
        this.updateBotPosition(data.input);
    }

    updateBotPosition(input) {
        console.log("Déplacer le bot de:", input);
    }
}