import * as THREE from 'three';

export default class power {
	constructor (form, pong) {
		this.pong = pong;
		this.form = form;
		this.powerSpeedBall = false;
		this.powerPaddleSize = false;
		this.powerReverse = false;
		this.sizebase = this.form.paddle_left_size[1];
		this.speedBall = this.pong.initialSpeed;


		const ballGeometry = new THREE.SphereGeometry( this.form.ballRayon, 15, 15);
		const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xd724e0 });
		this.bonus = new THREE.Mesh(ballGeometry, ballMaterial);
		this.bonus.position.set(0, 0, this.form.ballRayon);
		this.randomPos();
	}

	augmentSpeedBall() {
		if (this.powerSpeedBall) {
			this.pong.initialSpeed *= 1.5;
			this.powerSpeedBall = false;
			setTimeout(() => {
				this.pong.initialSpeed = this.speedBall;
			}, 2000);
		}
	}

	augmentPaddle() {
		if (this.powerPaddleSize) {
			if (this.pong.coordBefore < this.form.ball.position.x) {
				this.form.paddle_left_size[1] = (this.form.arene_size[1] - (this.form.NSborder_size[1] * 2));
				this.form.paddleLeft.position.y = 0;
				this.updatePaddleGeometry(this.form.paddleLeft, this.form.paddle_left_size);
				this.powerPaddleSize = false;
				setTimeout(() => {
					this.form.paddle_left_size[1] = this.sizebase;
					this.updatePaddleGeometry(this.form.paddleLeft, this.form.paddle_left_size);
				}, 5000);
			} else {
				this.form.paddle_right_size[1] = (this.form.arene_size[1] - (this.form.NSborder_size[1] * 2));
				this.form.paddleRight.position.y = 0;
				this.updatePaddleGeometry(this.form.paddleRight, this.form.paddle_right_size);
				this.powerPaddleSize = false;
				setTimeout(() => {
					this.form.paddle_right_size[1] = this.sizebase;
					this.updatePaddleGeometry(this.form.paddleRight, this.form.paddle_right_size);
				}, 5000);
			}
		}
	}
	
	updatePaddleGeometry(paddle, size) {
		paddle.geometry.dispose();
		paddle.geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
	}

	reverseBall() {
		if (this.powerReverse){
        	this.pong.ballSpeedY = -this.pong.ballSpeedY;
        	this.pong.ballSpeedX = -this.pong.ballSpeedX;
			this.powerReverse = false;
		}
	}

activePower() {
    if (this.form.ball.position.x > (this.bonus.position.x - (this.form.ballRayon * 2)) && 
        this.form.ball.position.x < (this.bonus.position.x + (this.form.ballRayon * 2)) &&
        this.form.ball.position.y > (this.bonus.position.y - (this.form.ballRayon * 2)) && 
        this.form.ball.position.y < (this.bonus.position.y + (this.form.ballRayon * 2))) {
        this.randomPos();
        this.randomPower();
        this.pong.rebond = 0;
    }
    this.augmentPaddle();
    this.augmentSpeedBall();
    this.reverseBall();
}

	randomPos() {
		this.bonus.position.x = (Math.random() * (this.form.paddle_pos - this.form.ballRayon * 2) + this.form.ballRayon) - (this.form.paddle_pos / 2);
		this.bonus.position.y = (Math.random() * (this.form.arene_size[1] - this.form.NSborder_size[1] * 2 - this.form.ballRayon * 2) + this.form.NSborder_size[1] + this.form.ballRayon) - (this.form.arene_size[1] / 2);
	}

	randomPower() {
		switch (Math.floor(Math.random() * 3)) {
			case 0 :
				console.log("Bonus reverse");
				this.powerReverse = true;
				break ;
			case 1 :
				console.log("Bonus size paddle");
				this.powerPaddleSize = true;
				break ;
			case 2 :
				console.log("Bonus speed ball");
				this.powerSpeedBall = true;
				break ;
		}
	}
}
