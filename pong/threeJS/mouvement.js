export default class Pong {
    constructor(form) {
        this.form = form;
        this.arenaWidth = this.form.arene_size[0] - (2 * this.form.LRborder_size[0]);
        this.arenaHeight = this.form.arene_size[1] - (2 * this.form.NSborder_size[1]);
        this.initialSpeed = 0.005;
        this.ballSpeedX = this.initialSpeed;
        this.ballSpeedY = 0;
        this.ballPaused = true;
        this.keysPressed = {};
        this.paddle_move_speed = 4;

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
        const moveSpeed = this.paddle_move_speed * speedFactor;
        const halfArenaHeight = this.arenaHeight / 2;
        const halfRaquetteHeight = this.form.paddle_size[1] / 2;

        if (this.keysPressed['ArrowDown']) {
            console.log('ArrowDown pressed');
            if ((this.form.paddleRight.position.y - halfRaquetteHeight - moveSpeed) > -halfArenaHeight) {
                this.form.paddleRight.position.y -= moveSpeed;
            } else {
                this.form.paddleRight.position.y = -(halfArenaHeight - halfRaquetteHeight);
            }
        }

        if (this.keysPressed['ArrowUp']) {
            console.log('ArrowUp pressed');
            if ((this.form.paddleRight.position.y + halfRaquetteHeight + moveSpeed) < halfArenaHeight) {
                this.form.paddleRight.position.y += moveSpeed;
            } else {
                this.form.paddleRight.position.y = halfArenaHeight - halfRaquetteHeight;
            }
        }
    
        if (this.keysPressed['s']) {
            console.log('s pressed');
            if ((this.form.paddleLeft.position.y - halfRaquetteHeight - moveSpeed) > -halfArenaHeight) {
                this.form.paddleLeft.position.y -= moveSpeed;
            } else {
                this.form.paddleLeft.position.y = -(halfArenaHeight - halfRaquetteHeight);
            }
            console.log('Updated paddle positions:', this.form.paddleLeft.position.y);
        }

        if (this.keysPressed['w']) {
            console.log('w pressed');
            if ((this.form.paddleLeft.position.y + halfRaquetteHeight + moveSpeed) < halfArenaHeight) {
                this.form.paddleLeft.position.y += moveSpeed;
            } else {
                this.form.paddleLeft.position.y = halfArenaHeight - halfRaquetteHeight;
            }
            console.log('Updated paddle positions:', this.form.paddleLeft.position.y);
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

        this.form.ball.position.x += this.ballSpeedX;
        this.form.ball.position.y += this.ballSpeedY;

        const halfArenaWidth = this.arenaWidth / 2;
        const halfArenaHeight = this.arenaHeight / 2;

        if ((this.form.ball.position.x + this.form.ballRayon) >= halfArenaWidth) {
            this.form.ball.position.x = this.form.paddleRight.position.x - this.form.paddle_size[0] / 2 - this.form.ballRayon;
            this.form.ball.position.y = this.form.paddleRight.position.y;
            this.ballSpeedX = -Math.abs(this.ballSpeedX);
            this.ballPaused = true;
        }

        if ((this.form.ball.position.x - this.form.ballRayon) <= -halfArenaWidth) {
            this.form.ball.position.x = this.form.paddleLeft.position.x + this.form.paddle_size[0] / 2 + this.form.ballRayon;
            this.form.ball.position.y = this.form.paddleLeft.position.y;
            this.ballSpeedX = Math.abs(this.ballSpeedX);
            this.ballPaused = true;
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

        }
        
        if (this.form.ball.position.x + this.form.ballRayon >= this.form.paddleRight.position.x - halfRaquetteWidth &&
            this.form.ball.position.y >= this.form.paddleRight.position.y - halfRaquetteHeight &&
            this.form.ball.position.y <= this.form.paddleRight.position.y + halfRaquetteHeight) {
            const impactY = this.form.ball.position.y - this.form.paddleRight.position.y;
            const normalizedImpactY = impactY / halfRaquetteHeight;
            const bounceAngle = normalizedImpactY * (Math.PI / 4);
            this.ballSpeedX = -Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
            this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
        }
        const speed = Math.sqrt(this.ballSpeedX * this.ballSpeedX + this.ballSpeedY * this.ballSpeedY);
        this.ballSpeedX = (this.ballSpeedX / speed) * this.initialSpeed;
        this.ballSpeedY = (this.ballSpeedY / speed) * this.initialSpeed;
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
}