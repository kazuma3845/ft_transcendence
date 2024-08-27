import * as THREE from 'three';
import Form from './form.js';
import Pong from './mouvement.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const form = new Form();
const pong = new Pong(form); // Passer l'instance de form à Pong

scene.add(form.ball);
scene.add(form.Arene);
scene.add(form.paddleRight);
scene.add(form.paddleLeft);
scene.add(form.Lborder);
scene.add(form.Rborder);
scene.add(form.Sborder);
scene.add(form.Nborder);
scene.add(form.line);

camera.position.z = 150;
camera.position.y = -200;
camera.rotateX(45);

function animate(timestamp) {
    pong.deplacerRaquette(timestamp); // Met à jour les positions des raquettes
    // pong.updateBallPosition(); // Décommentez pour animer la balle
    renderer.render(scene, camera);
    requestAnimationFrame(animate); // Boucle d'animation
}

requestAnimationFrame(animate); // Démarrer l'animation
