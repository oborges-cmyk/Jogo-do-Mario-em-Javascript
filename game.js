// Configuração inicial
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variáveis do jogo
let mario = { x: 50, y: 200, width: 30, height: 50, speed: 5, jumpPower: 15, isJumping: false };
let gravity = 1;
let platforms = [{ x: 0, y: 250, width: 500, height: 20 }];
let keys = {};

// Controle de entrada
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Função de atualização
function update() {
    // Movimento horizontal
    if (keys['ArrowRight']) mario.x += mario.speed;
    if (keys['ArrowLeft']) mario.x -= mario.speed;

    // Pulo
    if (keys['ArrowUp'] && !mario.isJumping) {
        mario.isJumping = true;
        mario.y -= mario.jumpPower;
    }

    // Gravidade
    mario.y += gravity;

    // Colisão com plataformas
    platforms.forEach(platform => {
        if (mario.y + mario.height > platform.y &&
            mario.x + mario.width > platform.x &&
            mario.x < platform.x + platform.width) {
            mario.y = platform.y - mario.height;
            mario.isJumping = false;
        }
    });
}

// Função de renderização
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar Mario
    ctx.fillStyle = 'red';
    ctx.fillRect(mario.x, mario.y, mario.width, mario.height);

    // Desenhar plataformas
    ctx.fillStyle = 'green';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

// Loop do jogo
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
gameLoop();

