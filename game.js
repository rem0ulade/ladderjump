const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dynamisch an Bildschirm anpassen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

let player = {
    x: canvas.width / 2 - 10,
    y: canvas.height - 30,
    width: 20,
    height: 20,
    speedY: 0,
    speedX: 0,
    gravity: 0.5,
    jumpPower: -10,
    moveSpeed: 5,
    onGround: true
};

let obstacles = [];
let score = 0;
let highscore = localStorage.getItem("ladderHighscore") || 0;
let gameSpeed = 2;
let keys = {};

// Tastatursteuerung
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Touchsteuerung
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

let touchLeft = false;
let touchRight = false;

leftBtn.addEventListener('touchstart', e => { e.preventDefault(); touchLeft = true; });
leftBtn.addEventListener('touchend', e => { e.preventDefault(); touchLeft = false; });

rightBtn.addEventListener('touchstart', e => { e.preventDefault(); touchRight = true; });
rightBtn.addEventListener('touchend', e => { e.preventDefault(); touchRight = false; });

jumpBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    if (player.onGround) {
        player.speedY = player.jumpPower;
        player.onGround = false;
    }
});

function updatePlayer() {
    if ((keys['ArrowLeft'] || keys['a'] || touchLeft) && player.x > 0) {
        player.x -= player.moveSpeed;
    }
    if ((keys['ArrowRight'] || keys['d'] || touchRight) && player.x + player.width < canvas.width) {
        player.x += player.moveSpeed;
    }
    if ((keys['ArrowUp'] || keys[' '] || keys['w']) && player.onGround) {
        player.speedY = player.jumpPower;
        player.onGround = false;
    }

    player.speedY += player.gravity;
    player.y += player.speedY;

    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.speedY = 0;
        player.onGround = true;
    }
}

function createObstacle() {
    let width = 60;
    let gap = Math.random() * (canvas.width - width);
    obstacles.push({ x: gap, y: 0, width, height: 10 });
}

function updateObstacles() {
    for (let obs of obstacles) {
        obs.y += gameSpeed;
    }
    obstacles = obstacles.filter(obs => obs.y < canvas.height);
    if (Math.random() < 0.03) createObstacle();
}

function detectCollision() {
    for (let obs of obstacles) {
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            if (score > highscore) {
                localStorage.setItem("ladderHighscore", score);
                alert("Neuer Highscore: " + score);
            } else {
                alert("Game Over! Score: " + score + "\nHighscore: " + highscore);
            }
            document.location.reload();
        }
    }
}

function drawPixelCharacter(x, y) {
    const pixelSize = 4;
    const shape = [
        " 1 ",
        "111",
        " 1 ",
        "1 1"
    ];
    ctx.fillStyle = "white";
    shape.forEach((row, rowIndex) => {
        [...row].forEach((col, colIndex) => {
            if (col === "1") {
                ctx.fillRect(x + colIndex * pixelSize, y + rowIndex * pixelSize, pixelSize, pixelSize);
            }
        });
    });
}

function drawPlayer() {
    drawPixelCharacter(player.x, player.y);
}

function drawObstacles() {
    ctx.fillStyle = 'gray';
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Highscore: ' + highscore, 10, 40);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayer();
    updateObstacles();
    detectCollision();
    drawPlayer();
    drawObstacles();
    drawScore();
    score++;
    requestAnimationFrame(gameLoop);
}

gameLoop();
