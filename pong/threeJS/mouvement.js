export default class Pong {
    constructor(form, bot, websocket, power) {
        this.bot = bot;
        this.form = form;
        this.websocket = websocket;
        this.power = power;

        this.arenaWidth = this.form.arene_size[0] - (2 * this.form.LRborder_size[0]);
        this.arenaHeight = this.form.arene_size[1] - (2 * this.form.NSborder_size[1]);
        this.lastExecTime = 1
        this.score = [0, 0]

        this.enterright = false;
        this.enterleft = false;
        this.ballPaused = true;
        this.keysPressed = {};

        this.touching = false;

        this.MalusCamLeft = false
        this.MalusCamRight = false


        // Ajout des événements clavier
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        window.addEventListener('keydown', this.handleKeyPress.bind(this));

        // Ajout des événements tactiles
        window.addEventListener('touchstart', this.handleTouchStart.bind(this));
        window.addEventListener('touchmove', this.handleTouchMove.bind(this));
        window.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleKeyDown(event) {
        this.keysPressed[event.key] = true;
    }

    handleKeyUp(event) {
        this.keysPressed[event.key] = false;
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && this.ballPaused) {
            if (this.MultiLocal) {
                this.enterleft = true;
                this.enterright = true;
            }
            else {
                if (this.player == this.playerLeft)
                    this.enterleft = true;
                else
                    this.enterright = true;
                this.ballPaused = false;
                if (this.botActivated) {
                    if (this.form.ball.position.x < 0)
                        this.bot.handleBallHit();
                }
            }
        }
    }

    // Gestion des événements tactiles
    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleTouchMove(touch);
        this.touching = true
    }

    handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const touchY = touch.clientY;

        // Mouvements tactiles pour les raquettes
        if (this.player == this.playerLeft) {
            if (touchY < this.form.paddleLeft.position.y) {
                this.left_up = true;
                this.left_back = false;
            } else {
                this.left_up = false;
                this.left_back = true;
            }
        }
        if (this.player == this.playerRight) {
            if (touchY < this.form.paddleRight.position.y) {
                this.right_up = true;
                this.right_back = false;
            } else {
                this.right_up = false;
                this.right_back = true;
            }
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();
        this.left_up = false;
        this.left_back = false;
        this.right_up = false;
        this.right_back = false;
        this.touching = false;
    }

    deplacerRaquette() {

        if (!this.touching) {
            this.left_back = false;
            this.left_up = false;
        }
        if (!this.botActivated) {
            this.right_back = false;
            this.right_up = false;
        }

        if (this.MultiLocal) {
            if (this.keysPressed['k'])
                this.right_back = true;
            if (this.keysPressed['o'])
                this.right_up = true;
            if (this.keysPressed['s'])
                this.left_back = true;
            if (this.keysPressed['w'])
                this.left_up = true;
        }
        else {
            if (this.keysPressed['s']) {
                if (this.player == this.playerLeft)
                    this.left_back = true;
                if (this.player == this.playerRight)
                    this.right_back = true;
            }
            if (this.keysPressed['w']) {
                if (this.player == this.playerLeft)
                    this.left_up = true;
                if (this.player == this.playerRight)
                    this.right_up = true;
            }
        }
        let key_position = {
            paddleSpeed: this.paddle_move_speed,
            moveSpeed: this.initialSpeed,
            power: this.powerActive,
            bot: this.botActivated,
            left_back: this.left_back,
            left_up: this.left_up,
            right_back: this.right_back,
            right_up: this.right_up,
            enterright: this.enterright,
            enterleft: this.enterleft
        };
        this.websocket.sendMessage("update_pos", key_position);
        this.enterright = false;
        this.enterleft = false;
    }

    updatePosition(data) {
        this.ballPaused = data.content.ballPaused;
        if (this.ballPaused) {
            this.form.ball.rotation.x += 0;
            this.form.ball.rotation.y += 0;
        } else {
            this.form.ball.rotation.x += -data.content.rotatey * 0.1;
            this.form.ball.rotation.y += data.content.rotatex * 0.1;
        }
        if (this.powerActive) {
            this.power.bonus.position.x = data.content.bonusPosx;
            this.power.bonus.position.y = data.content.bonusPosy;
            this.form.paddle_left_size[1] = data.content.bonuspadleLsize;
            this.form.paddle_right_size[1] = data.content.bonuspadleRsize;
            this.power.updatePaddleGeometry(this.form.paddleLeft, this.form.paddle_left_size);
            this.power.updatePaddleGeometry(this.form.paddleRight, this.form.paddle_right_size);
            this.MalusCamLeft = data.content.bonusChageCamLeft
            this.MalusCamRight = data.content.bonusChageCamRight
        }
        if (this.botActivated) {
            this.ball_angle = data.content.ball_angle;
            if (data.content.replaceBot)
                this.bot.replaceBot();
            if (data.content.botStartGame)
                this.bot.startGame();
            if (data.content.handleBallHit)
                this.bot.handleBallHit();
        }
        this.form.paddleRight.position.y = data.content.player_right_pos;
        this.form.paddleLeft.position.y = data.content.player_left_pos;
        this.form.ball.position.x = data.content.posx;
        this.form.ball.position.y = data.content.posy;
        if (this.score.some((score, index) => score !== data.content.score[index])) {
            this.score = data.content.score;
            this.sendDataToScore();
        }
    }

    async sendDataForID() {
        const urlParams = new URLSearchParams(window.location.search);
        let sessionId = urlParams.get('sessionid');
        try {
            const response = await fetch(`/api/game/sessions/${sessionId}/start_single/`, {
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
            this.initialSpeed = data.move_speed_ball * 2;
            this.paddle_move_speed = data.move_speed_paddle * 2;
            this.powerActive = data.power;
            this.MultiLocal = data.Multiplayer;
            this.botActivated = data.bot;
            this.botLVL = (data.bot_difficulty / 10);
            this.player1_started = data.player1_started;
            this.player2_started = data.player2_started;
        } catch (error) {
            return console.error('Erreur:', error);
        }
    }

    sendDataToScore() {
        const data = {
            player1_points: this.score[0],
            player2_points: this.score[1],
        };
        fetch(`/api/game/sessions/${this.id}/update_score/`, {
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
