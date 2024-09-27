
export default class Pong {
    constructor(form, bot, websocket) {
        this.bot = bot;
        this.form = form;
        this.websocket = websocket;

        this.arenaWidth = this.form.arene_size[0] - (2 * this.form.LRborder_size[0]);
        this.arenaHeight = this.form.arene_size[1] - (2 * this.form.NSborder_size[1]);
        this.initialSpeed = 6;
        this.ballSpeedX = this.initialSpeed;
        this.ballSpeedY = 0;
        this.posx = this.form.ball.position.x;
        this.posy = this.form.ball.position.y;
        this.ballPaused = true;
        this.keysPressed = {};
        this.lastExecTime = 1;
        this.ball_angle = 90;
        this.score = [0, 0];
        this.rebond = 0;

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

        this.trueSpeed = Math.round(moveSpeed);

        const halfArenaHeight = this.arenaHeight / 2;
        const halfRaquetteHeight2 = this.form.paddle_right_size[1] / 2;

        this.player_left_pos =  this.form.paddleLeft.position.y;
        this.player_right_pos = this.form.paddleRight.position.y;


        // let w = false;
        // let s = false;

        if (this.keysPressed['k']) {
            if ((this.form.paddleRight.position.y - halfRaquetteHeight2 - moveSpeed) > -halfArenaHeight) {
                this.form.paddleRight.position.y -= moveSpeed;
            } else {
                this.form.paddleRight.position.y = -(halfArenaHeight - halfRaquetteHeight2);
            }
        }

        if (this.keysPressed['o']) {
            if ((this.form.paddleRight.position.y + halfRaquetteHeight2 + moveSpeed) < halfArenaHeight) {
                this.form.paddleRight.position.y += moveSpeed;
            } else {
                this.form.paddleRight.position.y = halfArenaHeight - halfRaquetteHeight2;
            }
        }

        if (this.keysPressed['s']) {
            // s = true;
            if (this.player == this.playerLeft)
            {
                if ((this.form.paddleLeft.position.y - halfRaquetteHeight - moveSpeed) > -halfArenaHeight) {
                    this.player_left_pos -= moveSpeed;
                } else {
                    this.player_left_pos = -(halfArenaHeight - halfRaquetteHeight);
                }
            }

            if (this.player == this.playerRight)
            {
                if ((this.form.paddleRight.position.y - halfRaquetteHeight2 - moveSpeed) > -halfArenaHeight) {
                    this.player_right_pos -= moveSpeed;
                } else {
                    this.player_right_pos = -(halfArenaHeight - halfRaquetteHeight2);
                }
            }
        }

        if (this.keysPressed['w']) {
            // w = true;
            if (this.player == this.playerLeft)
            {
                if ((this.form.paddleLeft.position.y + halfRaquetteHeight + moveSpeed) < halfArenaHeight) {
                    this.player_left_pos += moveSpeed;
                } else {
                    this.player_left_pos = halfArenaHeight - halfRaquetteHeight;
                }
            }
            if (this.player == this.playerRight)
            {
                if ((this.form.paddleRight.position.y + halfRaquetteHeight2 + moveSpeed) < halfArenaHeight) {
                    this.player_right_pos += moveSpeed;
                } else {
                    this.player_right_pos = halfArenaHeight - halfRaquetteHeight2;
                }
            }
        }
        let key_position;
        if (this.player == this.playerLeft)
        {
            key_position = {
                player_left: this.player_left_pos,
                player_right: this.player_right_pos,
                posX: this.posx,
                posY: this.posy,
            };
        }
    else {
        key_position = {
            player_left: this.player_left_pos,
            player_right: this.player_right_pos,
        };
    }
        // if (w || s)
        this.websocket.sendMessage("update_position", key_position);
    }


    // A VOIR !!!
    handleKeyPress(event) {
        let key_launch = {
            ballPaused: false,
        };

        if (event.key === 'Enter' && this.ballPaused) {
            this.websocket.sendMessage("launch_ball", key_launch);
            // this.ballPaused = false;
            if (this.botActivated) {
                if (this.form.ball.position.x < 0)
                    this.bot.handleBallHit();
            }
        }
    }

    updateBallPosition(deltaTime) {
        if (this.ballPaused) {
            if (this.form.ball.position.x < 0) {
                this.posy = this.form.paddleLeft.position.y;
            }
            if (this.form.ball.position.x > 0) {
                this.posy = this.form.paddleRight.position.y;
                if (this.botActivated) {
                    this.bot.startGame();
                }
            }
            return;
        }

        const halfArenaWidth = this.arenaWidth / 2;
        const halfArenaHeight = this.arenaHeight / 2;

        if ((this.form.ball.position.x + this.form.ballRayon) >= halfArenaWidth) {
            this.posx = this.form.paddleRight.position.x - this.form.paddle_right_size[0] / 2 - this.form.ballRayon;
            this.posy = this.form.paddleRight.position.y;
            this.ballSpeedX = -this.initialSpeed;
            this.ballPaused = true;
            this.score[0] += 1;
            this.rebond = 0;
            this.sendDataToScore();
        }

        if ((this.form.ball.position.x - this.form.ballRayon) <= -halfArenaWidth) {
            this.posx = this.form.paddleLeft.position.x + this.form.paddle_left_size[0] / 2 + this.form.ballRayon;
            this.posy = this.form.paddleLeft.position.y;
            this.ballSpeedX = this.initialSpeed;
            this.ballPaused = true;
            this.score[1] += 1;
            this.rebond = 0;
            this.sendDataToScore();
        }

        if ((this.form.ball.position.y + this.form.ballRayon) >= halfArenaHeight && this.rebond != 1) {
            this.ballSpeedY = -this.ballSpeedY;
            this.rebond = 1;
        }

        if ((this.form.ball.position.y - this.form.ballRayon) <= -halfArenaHeight && this.rebond != 2) {
            this.ballSpeedY = -this.ballSpeedY;
            this.rebond = 2;
        }

        //-----------------paddle----------------------------
        const halfRaquetteHeight = this.form.paddle_left_size[1] / 2;
        const halfRaquetteHeight2 = this.form.paddle_right_size[1] / 2;

        const halfRaquetteWidth = this.form.paddle_left_size[0] / 2;

        if (this.form.ball.position.x - this.form.ballRayon <= this.form.paddleLeft.position.x + halfRaquetteWidth &&
            this.form.ball.position.y >= this.form.paddleLeft.position.y - halfRaquetteHeight &&
            this.form.ball.position.y <= this.form.paddleLeft.position.y + halfRaquetteHeight) {
                const impactY = this.form.ball.position.y - this.form.paddleLeft.position.y;
                const normalizedImpactY = impactY / halfRaquetteHeight;
                const bounceAngle = normalizedImpactY * (Math.PI / 4);
                this.ballSpeedX = Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
                this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
                if (this.botActivated) {
                    const angleRadians = Math.atan2(this.ballSpeedY, this.ballSpeedX);
                    const angleDegrees = angleRadians * (180 / Math.PI);
                    this.ball_angle = 90 - angleDegrees;
                    if (!this.ballPaused)
                        this.bot.handleBallHit();
                    else
                    this.bot.replaceBot();
            }
            this.rebond = 0;
        }

        if (this.form.ball.position.x + this.form.ballRayon >= this.form.paddleRight.position.x - halfRaquetteWidth &&
            this.form.ball.position.y >= this.form.paddleRight.position.y - halfRaquetteHeight2 &&
            this.form.ball.position.y <= this.form.paddleRight.position.y + halfRaquetteHeight2) {
                const impactY = this.form.ball.position.y - this.form.paddleRight.position.y;
                const normalizedImpactY = impactY / halfRaquetteHeight2;
                const bounceAngle = normalizedImpactY * (Math.PI / 4);
                this.ballSpeedX = -Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
                this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
                if (this.botActivated) {
                    if (!this.ballPaused)
                        this.bot.replaceBot();
                }
                this.rebond = 0;
            }

            const speed = Math.sqrt(this.ballSpeedX * this.ballSpeedX + this.ballSpeedY * this.ballSpeedY);
            this.ballSpeedX = (this.ballSpeedX / speed) * this.initialSpeed;
            this.ballSpeedY = (this.ballSpeedY / speed) * this.initialSpeed;

            const speedFactor = deltaTime / 16.67;
            this.adjustedSpeedX = this.ballSpeedX * speedFactor;
            this.adjustedSpeedY = this.ballSpeedY * speedFactor;

            this.form.ball.rotation.x += this.adjustedSpeedY * 0.1;
            this.form.ball.rotation.y += this.adjustedSpeedX * 0.1;

            this.coordBefore = this.form.ball.position.x;
            this.posx += this.adjustedSpeedX;
            this.posy += this.adjustedSpeedY;
        }

        updatePosition(data)
        {
            this.form.paddleRight.position.y = data.content.player_right;
            this.form.paddleLeft.position.y = data.content.player_left;
            if (data.content.posX && data.content.posY)
            {
                this.form.ball.position.x = data.content.posX;
                this.form.ball.position.y = data.content.posY;
            }
        }

        sendDataToScore() {
            // const testorData = {
                //     salut: this.score[0],
                //     coucou: this.score[1],
                // };
                // WebSocketModule.sendMessage("update_position", testorData);
                const data = {
                    player1_points: this.score[0],
                    player2_points: this.score[1],
                };
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
        // WebSocketModule.sendMessage("game_score", data);
    }

    async sendDataForID() {
        let sessionId = localStorage.getItem('game_session_id');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/game/sessions/${sessionId}/start_single/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken'),
                },
            });
            const data = await response.json();
            this.id = data.id;
            this.player = data.currentPlayer;
            this.playerLeft = data.player1;
            this.playerRight = data.player2;
            this.winScore = data.win_number;
            this.initialSpeed = data.move_speed_ball;
            this.paddle_move_speed = data.move_speed_paddle;
            this.power = data.power;
            this.botActivated = data.bot;
            this.botLVL = (data.bot_difficulty / 10);
            this.player1_started = data.player1_started;
            this.player2_started = data.player2_started;
        } catch (error) {
            return console.error('Erreur:', error);
        }
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}
