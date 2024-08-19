import dim from './2player.js';

export default class Pong {
    constructor(form) {
        const dimension = new dim();
        this.form = form;
        this.vitesseY = 3;
        this.sphereRayon = dimension.sphereRayon;
        this.arenaWidth = dimension.areneX - (2 * dimension.LRborderX);
        this.arenaHeight = dimension.areneY - (2 * dimension.NSborderY);
        this.raquetteHeight = dimension.LLeftY;
        this.raquetteWidth = dimension.LLeftX;
        this.ballSpeedX = 0.01;
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
        const halfRaquetteHeight = this.raquetteHeight / 2;

        if (this.keysPressed['ArrowDown']) {
            if (this.form.LRight.position.y - halfRaquetteHeight > -halfArenaHeight) {
                this.form.LRight.position.y -= this.vitesseY;
            }
        }
        if (this.keysPressed['ArrowUp']) {
            if (this.form.LRight.position.y + halfRaquetteHeight < halfArenaHeight) {
                this.form.LRight.position.y += this.vitesseY;
            }
        }
        if (this.keysPressed['s']) {
            if (this.form.LLeft.position.y - halfRaquetteHeight > -halfArenaHeight) {
                this.form.LLeft.position.y -= this.vitesseY;
            }
        }
        if (this.keysPressed['w']) {
            if (this.form.LLeft.position.y + halfRaquetteHeight < halfArenaHeight) {
                this.form.LLeft.position.y += this.vitesseY;
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
            if (this.form.sphere.position.x < 0) {
                this.form.sphere.position.y = this.form.LLeft.position.y;
            }
            if (this.form.sphere.position.x > 0) {
                this.form.sphere.position.y = this.form.LRight.position.y;
            }
            return;
        }

        this.form.sphere.position.x += this.ballSpeedX;
        this.form.sphere.position.y += this.ballSpeedY;

        const halfArenaWidth = this.arenaWidth / 2;
        const halfArenaHeight = this.arenaHeight / 2;

        if ((this.form.sphere.position.x + this.sphereRayon) >= halfArenaWidth) {
            this.form.sphere.position.x = this.form.LRight.position.x - this.raquetteWidth / 2 - this.sphereRayon;
            this.form.sphere.position.y = this.form.LRight.position.y;
            this.ballSpeedX = -Math.abs(this.ballSpeedX);
            this.ballPaused = true;
        }

        if ((this.form.sphere.position.x - this.sphereRayon) <= -halfArenaWidth) {
            this.form.sphere.position.x = this.form.LLeft.position.x + this.raquetteWidth / 2 + this.sphereRayon;
            this.form.sphere.position.y = this.form.LLeft.position.y;
            this.ballSpeedX = Math.abs(this.ballSpeedX);
            this.ballPaused = true;
        }
        
        if ((this.form.sphere.position.y + this.sphereRayon) >= halfArenaHeight || (this.form.sphere.position.y - this.sphereRayon) <= -halfArenaHeight) {
            this.ballSpeedY = -this.ballSpeedY;
        }
        
        const halfRaquetteHeight = this.raquetteHeight / 2;
        const halfRaquetteWidth = this.raquetteWidth / 2;
        
        const initialSpeed = Math.sqrt(this.ballSpeedX * this.ballSpeedX + this.ballSpeedY * this.ballSpeedY);
        
        if (this.form.sphere.position.x - this.sphereRayon <= this.form.LLeft.position.x + halfRaquetteWidth &&
            this.form.sphere.position.y >= this.form.LLeft.position.y - halfRaquetteHeight &&
            this.form.sphere.position.y <= this.form.LLeft.position.y + halfRaquetteHeight) {
            const impactY = this.form.sphere.position.y - this.form.LLeft.position.y;
            const normalizedImpactY = impactY / halfRaquetteHeight;
            const bounceAngle = normalizedImpactY * (Math.PI / 4);
            this.ballSpeedX = Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
            this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
        
            const speed = Math.sqrt(this.ballSpeedX * this.ballSpeedX + this.ballSpeedY * this.ballSpeedY);
            this.ballSpeedX = (this.ballSpeedX / speed) * initialSpeed;
            this.ballSpeedY = (this.ballSpeedY / speed) * initialSpeed;
        }
        
        if (this.form.sphere.position.x + this.sphereRayon >= this.form.LRight.position.x - halfRaquetteWidth &&
            this.form.sphere.position.y >= this.form.LRight.position.y - halfRaquetteHeight &&
            this.form.sphere.position.y <= this.form.LRight.position.y + halfRaquetteHeight) {
            const impactY = this.form.sphere.position.y - this.form.LRight.position.y;
            const normalizedImpactY = impactY / halfRaquetteHeight;
            const bounceAngle = normalizedImpactY * (Math.PI / 4);
            this.ballSpeedX = -Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
            this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
        
            const speed = Math.sqrt(this.ballSpeedX * this.ballSpeedX + this.ballSpeedY * this.ballSpeedY);
            this.ballSpeedX = (this.ballSpeedX / speed) * initialSpeed;
            this.ballSpeedY = (this.ballSpeedY / speed) * initialSpeed;
        }
    }

    animate() {
        this.deplacerRaquette();
        requestAnimationFrame(this.animate.bind(this));
    }
}