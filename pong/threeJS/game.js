import * as THREE from 'three';
import Form from './form.js';
import Pong from './mouvement.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const form = new Form();
const pong = new Pong(form);

scene.add( form.ball );
scene.add( form.Arene );
scene.add( form.paddleRight );
scene.add( form.paddleLeft );
scene.add( form.Lborder );
scene.add( form.Rborder );
scene.add( form.Sborder );
scene.add( form.Nborder );
scene.add( form.line );

//--------------------affichage---------------------------------------

camera.position.z = 150;
// camera.position.y = -200;
// camera.rotateX(45);


function animate() {
	queueMicrotask
    requestAnimationFrame(animate);
	pong.updateBallPosition();
	renderer.render( scene, camera );
}
