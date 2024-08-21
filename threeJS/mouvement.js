import val from './value.json';
import test from './test.json';
import fs from 'fs';

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

    deplacerRaquette() {
        const halfArenaHeight = this.arenaHeight / 2;
        const halfRaquetteHeight = val.paddle_size[1] / 2;

        if (this.keysPressed['ArrowDown']) {
            if (this.form.paddleRight.position.y - halfRaquetteHeight > -halfArenaHeight) {
                this.form.paddleRight.position.y -= val.paddle_move_speed;
            }
        }

        if (this.keysPressed['ArrowUp']) {
            if (this.form.paddleRight.position.y + halfRaquetteHeight < halfArenaHeight) {
                this.form.paddleRight.position.y += val.paddle_move_speed;
            }
        }
        if (this.keysPressed['s']) {
            if (this.form.paddleLeft.position.y - halfRaquetteHeight > -halfArenaHeight) {
                this.form.paddleLeft.position.y -= val.paddle_move_speed;
            }
        }
        if (this.keysPressed['w']) {
            if (this.form.paddleLeft.position.y + halfRaquetteHeight < halfArenaHeight) {
                this.form.paddleLeft.position.y += val.paddle_move_speed;
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

        test.ball_angle = Math.atan2(this.ballSpeedY, this.ballSpeedX);

        this.form.ball.position.x += this.ballSpeedX;
        this.form.ball.position.y += this.ballSpeedY;

        test.ball_pos[0] = this.form.ball.position.x;
        test.ball_pos[1] = this.form.ball.position.y;

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

    animate() {
        this.deplacerRaquette();
        requestAnimationFrame(this.animate.bind(this));
    }
}