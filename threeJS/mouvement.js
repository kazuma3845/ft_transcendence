import dim from './2player.js';

export default class Pong {
    constructor(form) {
        const dimension = new dim();
        this.form = form;
        this.vitesseY = 5;
        this.delta = 1;
        this.sphereRayon = dimension.sphereRayon;
        this.arenaWidth = dimension.areneX - (2 * dimension.LRborderX);
        this.arenaHeight = dimension.areneY - (2 * dimension.NSborderY);
        this.raquetteHeight = dimension.LLeftY;
        this.raquetteWidth = dimension.LLeftX;
        this.ballSpeedX = 0.005;
        this.ballSpeedY = 0.005;
        this.ballPaused = false;
        window.addEventListener('keydown', this.deplacerRaquette.bind(this));
        window.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    //@param {KeyboardEvent} event 
    deplacerRaquette(event) {
        const halfArenaHeight = this.arenaHeight / 2;
        const halfRaquetteHeight = this.raquetteHeight / 2;

        if (event.key === 'ArrowDown') {
            if (this.form.LRight.position.y - halfRaquetteHeight > -halfArenaHeight) {
                this.form.LRight.position.y -= this.vitesseY * this.delta;
            }
        } else if (event.key === 'ArrowUp') {
            if (this.form.LRight.position.y + halfRaquetteHeight < halfArenaHeight) {
                this.form.LRight.position.y += this.vitesseY * this.delta;
            }
        }
        if (event.key === 's') {
            if (this.form.LLeft.position.y - halfRaquetteHeight > -halfArenaHeight) {
                this.form.LLeft.position.y -= this.vitesseY * this.delta;
            }
        } else if (event.key === 'w') {
            if (this.form.LLeft.position.y + halfRaquetteHeight < halfArenaHeight) {
                this.form.LLeft.position.y += this.vitesseY * this.delta;
            }
        }
    }

    //@param {KeyboardEvent} event 
    
    handleKeyPress(event) {
        if ((event.key === 'w' || event.key === 's' || event.key === 'ArrowUp' || event.key === 'ArrowDown') && this.ballPaused) {
            this.ballPaused = false;
        }
    }

    //Met à jour la position de la balle et gère les collisions
    updateBallPosition() {
        if (this.ballPaused) {
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

        // Collision avec la raquette gauche
        if (this.form.sphere.position.x - this.sphereRayon <= this.form.LLeft.position.x + halfRaquetteWidth &&
            this.form.sphere.position.y >= this.form.LLeft.position.y - halfRaquetteHeight &&
            this.form.sphere.position.y <= this.form.LLeft.position.y + halfRaquetteHeight) {
            const impactY = this.form.sphere.position.y - this.form.LLeft.position.y;
            const normalizedImpactY = impactY / halfRaquetteHeight;
            const bounceAngle = normalizedImpactY * (Math.PI / 4);
            this.ballSpeedX = Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
            this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
        }

        // Collision avec la raquette droite
        if (this.form.sphere.position.x + this.sphereRayon >= this.form.LRight.position.x - halfRaquetteWidth &&
            this.form.sphere.position.y >= this.form.LRight.position.y - halfRaquetteHeight &&
            this.form.sphere.position.y <= this.form.LRight.position.y + halfRaquetteHeight) {
            const impactY = this.form.sphere.position.y - this.form.LRight.position.y;
            const normalizedImpactY = impactY / halfRaquetteHeight;
            const bounceAngle = normalizedImpactY * (Math.PI / 4);
            this.ballSpeedX = -Math.abs(this.ballSpeedX) * Math.cos(bounceAngle);
            this.ballSpeedY = Math.abs(this.ballSpeedX) * Math.sin(bounceAngle);
        }
    }
}