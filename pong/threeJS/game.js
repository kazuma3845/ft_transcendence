import * as THREE from 'three';
import Form from './form.js';
import Pong from './mouvement.js';
import Bot from './bot.js';
import Power from './power.js';
// import WebSocketModule from './WebSocketModule.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xfeb47b);
document.body.appendChild(renderer.domElement);

const form = new Form(null);
const pong = new Pong(form, null);
const bot = new Bot(pong, form);
pong.bot = bot;
form.pong = pong;
const power = new Power(form, pong);

scene.add(form.ball);
scene.add(form.Arene);
scene.add(form.paddleRight);
scene.add(form.paddleLeft);
scene.add(form.Lborder);
scene.add(form.Rborder);
scene.add(form.Sborder);
scene.add(form.Nborder);
scene.add(form.line);

const cameraPositions = {
    default: { x: 0, y: 0, z: 180 },
    top: { x: 0, y: -150, z: 150, rotationX: 45 * Math.PI / 180 },
    behindPaddle: { x: -205, y: 0, z: 100, rotationZ: -90 * Math.PI / 180, rotationY: -60 * Math.PI / 180}
};

function updateCameraPosition(position) {
    camera.position.set(position.x, position.y, position.z);
    camera.rotation.x = position.rotationX || 0;
    camera.rotation.y = position.rotationY || 0;
    camera.rotation.z = position.rotationZ || 0;
}

updateCameraPosition(cameraPositions.default);

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case '1':
            updateCameraPosition(cameraPositions.default);
            break;
        case '2':
            updateCameraPosition(cameraPositions.top);
            break;
        case '3':
            updateCameraPosition(cameraPositions.behindPaddle);
            break;
    }
});

let lastTime;
let i = 0;

function animate(timestamp) {
    if (!lastTime) {
        lastTime = timestamp;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    pong.updateBallPosition(deltaTime);
    pong.deplacerRaquette(deltaTime);
    if (pong.power) {
        if (i++ == 0)
            scene.add(power.bonus);
        power.activePower();
    }
    if (pong.botActivated)
        bot.updateBotPosition();
    renderer.render(scene, camera);

    checkWinCondition();
}

function checkWinCondition() {
    if (pong.score[0] === pong.winScore) {
        showWinScreen(pong.playerLeft, 'Wins! ', pong.score[0], pong.score[1]);
    }
    if (pong.score[1] === pong.winScore) {
        showWinScreen(pong.playerRight, 'Wins! ', pong.score[0], pong.score[1]);
    }
}

function showWinScreen(player, message, score1, score2) {
    const winScreen = document.getElementById('winScreen');
    const winMessage = document.getElementById('winMessage');
    winMessage.textContent = `${player} ${message} Final Score: ${score1} - ${score2}`;

    winScreen.style.display = 'flex';
    renderer.setAnimationLoop(null);
}

async function startGame() {
    const startScreen = document.getElementById('startScreen');
    await pong.sendDataForID();

    // WebSocketModule.startWebSocket(pong.id);
    startScreen.style.display = 'none';
    renderer.setAnimationLoop(animate);
    // if (pong.player1start && pong.player2start) {
    // }
}

document.getElementById('startButton').addEventListener('click', startGame);

export default pong;
