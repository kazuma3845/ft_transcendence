import * as THREE from 'three';
import Form from './form.js';
import Pong from './mouvement.js';
import Bot from './bot.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xfeb47b);
document.body.appendChild(renderer.domElement);

const form = new Form();
const pong = new Pong(form, null);
const bot = new Bot(pong, form);
let win_score = 3;

pong.bot = bot;

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
    default: { x: 0, y: 0, z: 150 },
    top: { x: 0, y: -150, z: 150, rotationX: 45 * Math.PI / 180 },
    behindPaddle: { x: -200, y: 0, z: 100, rotationZ: -90 * Math.PI / 180, rotationY: -60 * Math.PI / 180}
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

function animate(timestamp) {
    if (!lastTime) {
        lastTime = timestamp;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    pong.updateBallPosition(deltaTime);
    pong.deplacerRaquette(deltaTime);
    if (pong.botActivated)
        bot.updateBotPosition();
    renderer.render(scene, camera);

    checkWinCondition();
}

function checkWinCondition() {
    if (pong.score[0] === win_score) {
        showWinScreen('Left Player Wins! ', pong.score[0], pong.score[1]);
    }
    if (pong.score[1] === win_score) {
        showWinScreen('Right Player Wins! ', pong.score[0], pong.score[1]);
    }
}

function showWinScreen(message, score1, score2) {
    const winScreen = document.getElementById('winScreen');
    const winMessage = document.getElementById('winMessage');
    winMessage.textContent = `${message} Final Score: ${score1} - ${score2}`;

    winScreen.style.display = 'flex';
    renderer.setAnimationLoop(null);
}

function startGame() {
    const startScreen = document.getElementById('startScreen');
    startScreen.style.display = 'none';
    pong.sendDataForID();
    renderer.setAnimationLoop(animate);
}

function showSettings() {
    const startScreen = document.getElementById('startScreen');
    const settingsScreen = document.getElementById('settingsScreen');

    startScreen.style.display = 'none';
    settingsScreen.style.display = 'flex';
}

function backToStart() {
    const startScreen = document.getElementById('startScreen');
    const settingsScreen = document.getElementById('settingsScreen');

    const winScoreSelect = document.getElementById('winScoreSelect');
    win_score = parseInt(winScoreSelect.value);

    const SpeedBall = document.getElementById('SpeedBall');
    pong.initialSpeed = parseInt(SpeedBall.value);

    const SpeedPadle = document.getElementById('SpeedPadle');
    pong.paddle_move_speed = parseInt(SpeedPadle.value);

    settingsScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('settingsButton').addEventListener('click', showSettings);
document.getElementById('backButton').addEventListener('click', backToStart);
