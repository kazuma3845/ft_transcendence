import * as THREE from 'three';
import Form from './form.js';
import Pong from './mouvement.js';
import Bot from './bot.js';
import Power from './power.js';
import WebSocketModule from './WebSocketModule.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
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
    behindPaddleLeft: { x: -205, y: 0, z: 100, rotationZ: -90 * Math.PI / 180, rotationY: -60 * Math.PI / 180},
    behindPaddleRight: { x: 205, y: 0, z: 100, rotationZ: 90 * Math.PI / 180, rotationY: 60 * Math.PI / 180},

    malusbehindPaddleLeft: { x: -205, y: 0, z: 100, rotationZ: 90 * Math.PI / 180, rotationY: -60 * Math.PI / 180},
    malusbehindPaddleRight: { x: 205, y: 0, z: 100, rotationZ: -90 * Math.PI / 180, rotationY: 60 * Math.PI / 180},
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
            if (pong.MalusCamLeft && pong.player == pong.playerLeft)
                updateCameraPosition(cameraPositions.malusbehindPaddleLeft);
            else if (pong.MalusCamRight)
                updateCameraPosition(cameraPositions.malusbehindPaddleRight);
            else
                updateCameraPosition(cameraPositions.default);
            break;
        case '2':
            if (pong.MalusCamLeft && pong.player == pong.playerLeft)
                updateCameraPosition(cameraPositions.malusbehindPaddleLeft);
            else if (pong.MalusCamRight)
                updateCameraPosition(cameraPositions.malusbehindPaddleRight);
            else
                updateCameraPosition(cameraPositions.top);
            break;
        case '3':
            if (pong.MalusCamLeft)
                updateCameraPosition(cameraPositions.malusbehindPaddleLeft);
            else if (pong.MalusCamRight)
                updateCameraPosition(cameraPositions.malusbehindPaddleRight);
            else {
                if (pong.player == pong.playerLeft)
                    updateCameraPosition(cameraPositions.behindPaddleLeft);
                else
                    updateCameraPosition(cameraPositions.behindPaddleRight);
            }
            break;
    }
});

let i = 0

let fps = 60;
let lastFrameTime = performance.now();
const frameDuration = 1000 / fps;
let isAnimating = true;

function animate() {
    if (!isAnimating) return;

    const now = performance.now();
    const deltaTime = now - lastFrameTime;

    if (pong.MalusCamLeft && pong.player == pong.playerLeft)
        updateCameraPosition(cameraPositions.malusbehindPaddleLeft)
    if (pong.MalusCamRight && pong.player == pong.playerRight)
        updateCameraPosition(cameraPositions.malusbehindPaddleRight)
    if (deltaTime < frameDuration) {
        requestAnimationFrame(animate);
        return;
    }
    lastFrameTime = now;
    if (pong.powerActive && i++ === 0) {
        scene.add(power.bonus);
    }
    if (pong.botActivated) {
        bot.updateBotPosition();
    }
    pong.deplacerRaquette();
    renderer.render(scene, camera);
    checkWinCondition()
    requestAnimationFrame(animate);
}

let winner = null

function checkWinCondition() {
    if (pong.score[0] === pong.winScore) {
        showWinScreen(pong.playerLeft, 'Wins! ', pong.score[0], pong.score[1], false);
    }
    if (pong.score[1] === pong.winScore) {
        showWinScreen(pong.playerRight, 'Wins! ', pong.score[0], pong.score[1], false);
    }
}


export function showWinScreen(player, message, score1, score2, forfait) {
    const winScreen = document.getElementById("winScreen");
    const winMessage = document.getElementById("winMessage");
    winMessage.innerHTML = `${player} ${message} ${score1} - ${score2}`
    winScreen.style.display = "block";
    isAnimating = false;
    winner = player
    console.log(winner, message, score1, score2)
    registerScores(forfait, winner);

    renderer.setAnimationLoop(null);
}

function registerScores(forfeit, winner) {
    const url = `/api/blockchain/set_score/`;

    const gameData = {
        game_session_id: pong.id,
        players: [pong.playerLeft, pong.playerRight],
        scores: pong.score,
        winner: winner,
        forfeit: forfeit,
    };
    console.log("Game Data: ", gameData)
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
    const urlParams = new URLSearchParams(window.location.search);
    let sessionId = urlParams.get('sessionid');
    pong.websocket = websocket;
    pong.websocket.startWebSocket(sessionId);
    await pong.sendDataForID();
    startScreen.style.display = 'none';
    if (!pong.MultiLocal && !pong.botActivated && (pong.player1_started != true || pong.player2_started != true)) {
        loader.style.display = 'flex';
    } else {
        lastFrameTime = performance.now()
        renderer.setAnimationLoop(animate);
    }
}

export function startGameDual() {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
    lastFrameTime = performance.now()
    renderer.setAnimationLoop(animate);
}

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('startButton').addEventListener('touchstart', startGame);
