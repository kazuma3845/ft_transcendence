import * as THREE from 'three';

export default class power {
	constructor (form) {
		this.form = form;


		const ballGeometry = new THREE.SphereGeometry( this.form.ballRayon, 15, 15);
		const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xd724e0 });
		this.bonus = new THREE.Mesh(ballGeometry, ballMaterial);
		this.bonus.position.set(0, 0, this.form.ballRayon);
	}

	updatePaddleGeometry(paddle, size) {
		paddle.geometry.dispose();
		paddle.geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
	}
}
