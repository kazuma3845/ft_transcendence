import * as THREE from 'three';
import Form from './form.js';
import Pong from './mouvement.js';
import Bot from './bot.js';
import Power from './power.js';
import WebSocketModule from './WebSocketModule.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xfeb47b);
document.body.appendChild(renderer.domElement);

const form = new Form();
const pong = new Pong(form, null, null, null);
const bot = new Bot(pong, form);
const power = new Power(form);
pong.bot = bot;
pong.power = power;
form.pong = pong;

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

let i = 0;

function animate() {
    if (pong.powerActive) {
        if (i++ == 0)
            scene.add(power.bonus);
    }
    if (pong.botActivated)
        bot.updateBotPosition();
    pong.deplacerRaquette();
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


    registerScores();

    winScreen.style.display = 'flex';
    renderer.setAnimationLoop(null);
}

function registerScores() {

    const url = "http://127.0.0.1:8000/api/blockchain/set_score/"

    const gameData = {
        game_session_id: pong.id,
        players: [pong.playerLeft, pong.playerRight],
        scores: pong.score
    };

    const fetchOptions = {
        method: 'POST',
        headers: {
            'X-CSRFToken': pong.getCookie('csrftoken'),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(gameData)
    };

    fetch(url, fetchOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        });
}

async function startGame() {
    const startScreen = document.getElementById('startScreen');
    const loader = document.getElementById('loader');
    const websocket = new WebSocketModule(pong);
    // console.log(`Avant : localStorage.getItem(${localStorage.getItem('game_session_id')})`)
    pong.websocket = websocket;
    pong.websocket.startWebSocket(localStorage.getItem('game_session_id'));
    await pong.sendDataForID();
    startScreen.style.display = 'none';
    if (pong.botActivated === true) {
        renderer.setAnimationLoop(animate);
    }
    if (pong.botActivated === false && (pong.player1_started != true || pong.player2_started != true)) {
        loader.style.display = 'flex';
    }
}

export function startGameDual() {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
    renderer.setAnimationLoop(animate);
}

document.getElementById('startButton').addEventListener('click', startGame);

export default pong;
