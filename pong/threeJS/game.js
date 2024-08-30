import * as THREE from 'three';
import Form from './form.js';
import Pong from './mouvement.js';
import Bot from './bot.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, (window.innerWidth / 100 * 90) / (window.innerHeight / 100 * 90), 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
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

camera.position.z = 150;
camera.position.y = -200;
camera.rotateX(45 * Math.PI / 180);

let lastTime;

function animate(timestamp) {
    if (!lastTime) {
        lastTime = timestamp;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    pong.updateBallPosition(deltaTime);
    pong.deplacerRaquette(deltaTime);
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

    const winScoreInput = document.getElementById('winScoreInput');
    win_score = parseInt(winScoreInput.value) || 7;

    settingsScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

// function sendDataForID() {
//     // const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

//     fetch('http://127.0.0.1:8000/api/game/sessions/start_single/', {
//         method: 'POST',
//         credentials: 'include',
//         headers: {
//             'Content-Type': 'application/json',
//             'X-CSRFToken': getCookie('csrftoken'),
//         },
//     })
//     .then(response => response.json())
//     .then(data => {
//         this.id = data.id;
//         pong.id = this.id;
//     })
//     .catch(error => console.error('Erreur:', error));
// }

// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             // Vérifie si ce cookie commence par le nom donné
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('settingsButton').addEventListener('click', showSettings);
document.getElementById('backButton').addEventListener('click', backToStart);
