const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 464;

// --- Configuração de Áudio ---
const bgMusic = new Audio("music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;
bgMusic.preload = "auto";

const stompSound = new Audio("Audio1.mp3");
stompSound.volume = 0.7;

canvas.width = 800;
canvas.height = 464;  

//____HUD elements______________________________________________
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const coinsElement = document.getElementById('coins');
const timeElement = document.getElementById('time');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const overlayBtn = document.getElementById('overlay-btn');

//__________Constants_____________________________________________________

const GRAVITY           = 0.5;
const TILE              = 32;
const GROUND_Y          = canvas.height -TILE;
const CAM_DEADZONE      = 300; 

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  sky:      '#5c94fc',
  ground:   '#c84c0c',
  groundTop:'#e86818',
  brick:    '#c84c0c',
  brickTop: '#e86818',
  question: '#e8a000',
  qShine:   '#f8c800',
  coin:     '#f8c800',
  coinRim:  '#c89600',
  mario:    { hat:'#e52521', skin:'#ffa060', overalls:'#0070e0', shoes:'#7b3f00' },
  goomba:   { body:'#c07038', dark:'#7b3000', eye:'#fff', pupil:'#000' },
  pipe:     { body:'#00a800', rim:'#00d800', dark:'#006800' },
  flag:     { pole:'#888', flag:'#e52521' },
  cloud:    '#fff',
  hill:     '#00a800',
};


//___World definition_______________________________________________________
// Level is 6400 px wide (200 tiles × 32)
const WORLD_W = 200 * TILE;

// Platforms: { x, y, w } in tile units
const platformDefs = [
  // floating bricks / question blocks – row at tile-y 8 (y=256)
  { x:16, y:8, w:1, type:'question', coinVal:1 },
  { x:20, y:8, w:1, type:'question', coinVal:1 },
  { x:21, y:8, w:1, type:'brick' },
  { x:22, y:8, w:1, type:'question', coinVal:1 },
  { x:23, y:8, w:1, type:'brick' },
  // staircase hint
  { x:28, y:11, w:4, type:'brick' },
  { x:28, y:9,  w:2, type:'question', coinVal:1 },
  // more blocks
  { x:37, y:8, w:1, type:'question', coinVal:5 },
  { x:40, y:6, w:3, type:'brick' },
  { x:44, y:8, w:1, type:'question', coinVal:1 },
  { x:46, y:8, w:3, type:'brick' },
  { x:47, y:6, w:1, type:'question', coinVal:1 },
  // overhead row
  { x:57, y:6, w:5, type:'brick' },
  { x:60, y:8, w:1, type:'question', coinVal:1 },
  // platform islands
  { x:70, y:10, w:3, type:'brick' },
  { x:80, y:8,  w:4, type:'brick' },
  { x:85, y:6,  w:2, type:'question', coinVal:2 },
  { x:95, y:8,  w:5, type:'brick' },
  { x:100,y:6,  w:3, type:'question', coinVal:3 },
  { x:110,y:9,  w:4, type:'brick' },
  { x:120,y:7,  w:3, type:'brick' },
  { x:130,y:8,  w:4, type:'question', coinVal:2 },
  { x:140,y:7,  w:5, type:'brick' },
  { x:150,y:9,  w:3, type:'brick' },
  { x:160,y:6,  w:4, type:'question', coinVal:3 },
  { x:170,y:8,  w:4, type:'brick' },
  { x:180,y:7,  w:3, type:'question', coinVal:2 },
];

// Pipes: { x, h } in tile units (x = left edge, h = height in tiles)
const pipeDefs = [
    { x:14, h:2 }, { x:24, h:3 }, { x:31, h:4 }, { x:36, h:4 },
    { x:55, h:2 }, { x:67, h:3 }, { x:90, h:2 }, { x:105, h:3 },
    { x:118, h:2 }, { x:135, h:4 }, { x:148, h:3 }, { x:165, h:2 },
    { x:178, h:3 }, { x:190, h:2 },
  ];
  
  // Staircases at end: groups of stacked blocks
  const stairDefs = [
    { x:187, maxH:4 }, { x:193, maxH:8 },
  ];
  
  // Gaps (holes in the ground): { x, w } in tile units
  const gapDefs = [
    { x:50, w:3 }, { x:75, w:3 }, { x:115, w:4 }, { x:155, w:3 }, { x:175, w:2 },
  ];
  
  // Enemies: { x, dir } in tile units
  const enemyDefs = [
    { x:22 },{ x:30 },{ x:38 },{ x:48 },{ x:58 },{ x:65 },
    { x:72 },{ x:83 },{ x:92 },{ x:103 },{ x:112 },{ x:123 },
    { x:133 },{ x:143 },{ x:152 },{ x:162 },{ x:173 },{ x:182 },
  ];
  
  // Coins on platforms: { x, y } in tile units
  const coinDefs = [
    { x:17, y:7 },{ x:21, y:7 },{ x:41, y:5 },{ x:47, y:5 },
    { x:57, y:5 },{ x:58, y:5 },{ x:59, y:5 },{ x:70, y:9 },
    { x:80, y:7 },{ x:95, y:7 },{ x:100, y:5 },{ x:120, y:6 },
    { x:130, y:7 },{ x:140, y:6 },{ x:160, y:5 },{ x:180, y:6 },
  ];
  
  // Clouds (decorative): { x, y } tile units
  const cloudDefs = [
    { x:5,  y:3 },{ x:18, y:2 },{ x:35, y:4 },{ x:50, y:2 },
    { x:65, y:3 },{ x:80, y:2 },{ x:95, y:4 },{ x:110,y:2 },
    { x:125,y:3 },{ x:140,y:2 },{ x:155,y:4 },{ x:170,y:2 },
    { x:185,y:3 },
  ];
  
  // Hills (decorative)
  const hillDefs = [
    { x:2, r:50 },{ x:10, r:40 },{ x:20, r:60 },{ x:35, r:45 },
    { x:55, r:55 },{ x:70, r:40 },{ x:90, r:50 },{ x:110, r:45 },
    { x:130, r:60 },{ x:150, r:40 },{ x:170, r:55 },{ x:185, r:45 },
  ];
  
  // Flag at end
  const FLAG_X = 195;

//__________Game State______________________________

let state = "Title"; //title | playing | dead | win | gameover
let score = 0;
let lives = 3;
let coinCount = 0;
let timeLeft = 400;
let timeInterval = null;
let camX = 0;

let mario, plataforms, pipes, enemies, coins, particles;

// ── Particle system ───────────────────────────────────────────────────────────
function spawnParticles(x, y, color, n = 6) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: -(Math.random() * 4 + 2),
        life: 40,
        color,
        r: Math.random() * 4 + 2,
      });
    }
  }
  
  function updateParticles() {
    for (let p of particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.2;
      p.life--;
    }
    particles = particles.filter(p => p.life > 0);
  }
  
  function drawParticles(cx) {
    for (let p of particles) {
      ctx.globalAlpha = p.life / 40;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - cx, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  
  // ── Init / reset ──────────────────────────────────────────────────────────────
  function initGame() {
    score     = 0;
    coinCount = 0;
    timeLeft  = 400;
    camX      = 0;
    particles = [];
    pendingSuperJump = false;
    lastJumpTapTime  = 0;
    superFlash       = 0;
  
    scoreEl.textContent = '000000';
    coinsEl.textContent = '0';
    timerEl.textContent = '400';
    livesEl.textContent = lives;
  
    mario = {
      x: 3 * TILE,
      y: GROUND_Y - 2 * TILE,
      w: 24,
      h: 32,
      vx: 0,
      vy: 0,
      onGround: false,
      dir: 1,          // 1=right, -1=left
      walking: false,
      frame: 0,
      frameTimer: 0,
      dead: false,
      deadTimer: 0,
      invincible: 0,   // invincibility frames after damage
    };
  
    // Build platforms from defs
    platforms = platformDefs.map(p => ({
      x: p.x * TILE,
      y: p.y * TILE,
      w: p.w * TILE,
      h: TILE,
      type: p.type,
      coinVal: p.coinVal || 0,
      hit: false,
      bounce: 0,
    }));
  
    // Build pipes
    pipes = pipeDefs.map(p => ({
      x: p.x * TILE,
      y: GROUND_Y - p.h * TILE,
      w: 2 * TILE,
      h: p.h * TILE,
    }));
  
    // Build staircase blocks
    for (let s of stairDefs) {
      for (let col = 0; col < s.maxH; col++) {
        for (let row = 0; row <= col; row++) {
          platforms.push({
            x: (s.x + col) * TILE,
            y: GROUND_Y - (row + 1) * TILE,
            w: TILE,
            h: TILE,
            type: 'brick',
            coinVal: 0,
            hit: false,
            bounce: 0,
          });
        }
      }
    }
  
    // Build enemies
    enemies = enemyDefs.map(e => ({
      x: e.x * TILE,
      y: GROUND_Y - TILE,
      w: TILE - 4,
      h: TILE - 6,
      vx: -1,
      dead: false,
      squished: false,
      squishTimer: 0,
      frame: 0,
      frameTimer: 0,
    }));
  
    // Build coins
    coins = coinDefs.map(c => ({
      x: c.x * TILE + TILE / 2,
      y: c.y * TILE + TILE / 2,
      r: 8,
      collected: false,
      anim: 0,
    }));
  
    // Build gaps as a lookup set of tile-x coords that have no ground
    // (handled at draw/collision time)
  }
  
  // ── Gap helpers ───────────────────────────────────────────────────────────────
  function isGap(worldX) {
    for (let g of gapDefs) {
      if (worldX >= g.x * TILE && worldX < (g.x + g.w) * TILE) return true;
    }
    return false;
  }
  
  // ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const JUMP_KEYS = ['Space','ArrowUp','KeyW'];
const DOUBLE_TAP_MS = 400;
let lastJumpTapTime = 0;
let pendingSuperJump = false;
let superFlash = 0; // frames remaining for on-screen "SUPER!" indicator

window.addEventListener('keydown', e => {
  if (JUMP_KEYS.includes(e.code) && !e.repeat) {
    const now = performance.now();
    // Double-tap detection
    if (now - lastJumpTapTime < DOUBLE_TAP_MS) {
      pendingSuperJump = true;
    }
    // Shift held + jump also triggers super jump (fallback trigger)
    if (keys['ShiftLeft'] || keys['ShiftRight']) {
      pendingSuperJump = true;
    }
    lastJumpTapTime = now;
  }
  keys[e.code] = true;
  if (['Space','ArrowUp','ArrowLeft','ArrowRight','ArrowDown',
       'KeyW','KeyA','KeyD','KeyS'].includes(e.code)) {
    e.preventDefault();
  }
});

window.addEventListener('keyup', e => { keys[e.code] = false; });

function isLeft() { return keys['ArrowLeft'] || keys['KeyA']; }
function isRight() { return keys['ArrowRight'] || keys['KeyD']; }
function isJump() { return keys['Space'] || keys['ArrowUp'] || keys['KeyW']; }

// ______Physics / collision______
function isOverlappingSolid(x, y) {
  for (let p of pipes) {
    if (rectOverlap(x, y, mario.w, mario.h, p.x, p.y, p.w, p.h)) return true;
  }
  for (let p of platforms) {
    if (rectOverlap(x, y, mario.w, mario.h, p.x, p.y, p.w, p.h)) return true;
  }
  return false;
}

function updateMario() {
  if(mario.dead) {
     
    mario.deadTimer++
    if(mario.deadTimer < 20) {
      mario.vy = -8
    }
    mario.vy += GRAVITY;
    mario.v  += mario.vy;
    if(mario.y > canvas.height + 100) {
      lives--;
    if(lives <= 0)
        endGame('gameover')
    } else {
      livesEl.textContent = lives;
      initGame();
      state = playing;
      startTimer();
    }
  }
}

if (mario.invincible > 0) mario.invincible--;

const speed = 3.9;
if (isLeft()) {
    mario.vx = speed;
    mario.dir = -1;
    mario.walking = true;
} else if (isRight()) {
    mario.vx = speed;
    mario.dir = 1;
    mario.walking = true;
} else {
    mario.vx = 0;
    mario.walking = false;
}
mario.x += mario.vx;

// Gravity
mario.vy += GRAVITY;
mario.y += mario.vy;
mario.onGround = false;

// Ceiling clamp so Mario can never leave the top of the screen
if (mario.y < 0) {
  mario.y = 0;
  if (mario.vy < 0) mario.vy = 0;
}

// Ground collision
const mx1 = mario.x, mx2 = mario.x + mario.w;
const groundTileLeft = Math.floor(mx1 / TILE);
const groundTileRight = Math.floor((mx2 - 1) / TILE);

const feetY = mario.y + mario.h;
if (mario.vy >= 0) {
    // Check if any tile under feet is ground (not a gap)
    let onGround = false;
    for (let tx = groundTileLeft; tx <= groundTileRight; tx++) {
        if (!isGap(tx * TILE)) {
            onGround = true;
            break;
        }
    }
    if (onGround && feetY >= GROUND_Y && mario.y < GROUND_Y) {
        mario.y = GROUND_Y - mario.h;
        mario.vy = 0;
        mario.onGround = true;
    }
}


// Fall into gap - die
if (mario.y > canvas.height + 50 && !mario.dead) {
killMario();
return;
}

// Plataform collisions

for (let p of plataforms) {
  if (!rectOverlap(mario.x, mario.y, mario.w, mario.h, p.x, p.y, p.w, p.h)) continue;

  const overlapLeft = (mario.x + mario.w) - p.x;
  const overlapRight = (p.x + p.w) - mario.x;
  const overlapTop = (mario.y + mario.h) - p.y;
  const overlapBottom = (p.y + p.h) - mario.y;

  const minH = Math.min(overlapLeft, overlapRight);
  const minV = Math.min(overlapTop, overlapBottom);

  if (minH > minV) {
    if (overlapTop < overlapBottom) {
      mario.y = p.y - mario.h;
      mario.vy = 0;
      mario.onGround = true;
    } else {
      mario.y = p.y + p.h;
      mario.vy = Math.abs(mario.vy) * 0.3;
      hitBlock(p);
    }
  } if (overlapLeft < overlapRight) {
    mario.x = p.x - mario.w;
  } else {
    mario.x = p.x + p.w;
  }
    mario.vx = 0;
}

for (let p of pipes) {
  if (!rectOverlap(mario.x, mario.y, mario.w, mario.h, p.x, p.y, p.w, p.h)) continue;

  const overlapLeft = (mario.x + mario.w) - p.x;
  const overlapRight = (p.x + p.w) - mario.x;
  const overlapTop = (mario.y + mario.h) - p.y;
  const overlapBottom = (p.y + p.h) - mario.y;

  const minH = Math.min(overlapLeft, overlapRight);
  const minV = Math.min(overlapTop, overlapBottom);

  if (minH > minV) {
    if (overlapTop < overlapBottom) {
      mario.y = p.y - mario.h;
      mario.vy = 0;
      mario.onGround = true;
    } else {
      mario.y = p.y + p.h;
      mario.vy = Math.abs(mario.vy) * 0.3;
      hitBlock(p);
    }
  } if (overlapLeft < overlapRight) {
    mario.x = p.x - mario.w;
  } else {
    mario.x = p.x + p.w;
  }
    mario.vx = 0;
}

//Super Jump (double-top jump or Shift + jump): escapes wedges
if (pendingSuperJump && mario.onGround) {
  let safety = 0; // safety counter to avoid infinite loop
  while (safety++ < 8 && isOverlappingSolid(mario.x, mario.y)){
      mario.y -= 2;
}
mario.vy = -12;
mario.onGround = false;
pendingSuperJump = false;
superFlash = 45;
spawnParticles(mario.x + mario.w / 2, mario.y + mario.h, '#fff', 16);
spawnParticles(mario.x + mario.w / 2, mario.y + mario.h, C.qShine, 10);
  } else if (isJump() && mario.onGround) {
    // Normal jump
    mario.vy = -11;
    mario.onGround = false;
  }

// Coin Collection

for (let c of coins) {
  if (c.collected) continue;
  const dx = (mario.x + mario.w / 2) - c.x;
  const dy = (mario.y + mario.h / 2) - c.y;
  if (Math.abs(dx) < mario.w / 2 + c.r && Math.abs(dy) < mario.h / 2 + c.r) {
      c.collected = true;
      score += 200;
      coinCount++;
      coinsEl.textContent = coinCount;
      spawnParticles(c.x, c.y, C.coin, 8);
  }
}

// Enemy collisions
for (let e of enemies) {
  if (e.dead) continue;
  if (!rectOverlap(mario.x, mario.y, mario.w, mario.h, e.x, e.y, e.w, e.h)) continue;

  const mBottom = mario.y + mario.h;
  const eTop    = e.y;

  // Stomp from above
  if (mario.vy > 0 && mBottom - mario.vy <= eTop + 4) {

    const stomp = new Audio("stomp.mp3");
stomp.volume = 0.8;
stomp.play();

    e.dead = true;
    e.squished = true;
    e.squishTimer = 30;
    mario.vy = -6;
    addScore(100);
    spawnParticles(e.x + e.w / 2, e.y, C.goomba.body);
  } else if (mario.invincible === 0) {
    killMario();
    return;
  }
}

// Flag / win
const flagX = FLAG_X * TILE;
if (mario.x + mario.w > flagX && mario.x < flagX + TILE * 2) {
    endGame('win');
}

// Walking Animation

if (mario.walking && mario.onGround) {
  mario.frameTimer++;
  if (mario.frameTimer > 6) {
      mario.frame = (mario.frame + 1) % 3;
      mario.frameTimer = 0;
  }
} else if (!mario.walking) {
  mario.frame = 0;
}

// camera
const targetCam = mario.x - CAM_DEADZONE;
if (targetCam > camX) { camX = Math.min(targetCam, WORLD_W - canvas.width); }
if (camX < 0) camX = 0;

function hitBlock(p) {
    if (p.hit) return; // already hit
    if (p.type === 'question') {
        p.hit = true;
        p.bounce = 8;
        //Spawn coin from block
        coinCount += p.coinVal;
    

// Play coin sound
const coinSound = new Audio("coin.mp3");
coinSound.volume = 0.8;
coinSound.play();

addScore(p.coinVal * 200);
  coinEl.textContent = coinCount;
spawnParticles(p.x + p.w / 2, p.y, C.coin, p.coinVal * 3);
} else if (p.type === 'brick') {
// Break brick
p.hit = true;
spawnParticles(p.x + p.w / 2, p.y, C.brick, 8);
platforms.splice(platforms.indexOf(p), 1);
addScore(50);
 }
}

function killMario() {

  bgMusic.pause();
  // Play death sound
  const deathSound = new Audio("death.mp3");
  deathSound.volume = 0.8;
  deathSound.currentTime = 1;
  deathSound.play();

  if (mario.dead || mario.invincible > 0) return;

  mario.dead = true;
  mario.deadTimer = 0;
  mario.vy = -12;
  stopTimer();

  // Nota: Na imagem está escrito "setTimeoutr", o correto é "setTimeout"
  setTimeout(() => {

      // Optional reset
      bgMusic.currentTime = 0;
      bgMusic.play();
  }, 4000);
}

function addScore(n) {
  score += n;
  scoreEl.textContent = String(score).padStart(6, '0');
}

//__Enemy update and draw functions___
function updateEnemies() {
  for (let e of enemies) {
      if (e.squished) { // Corrigido de e.dsquished para e.squished
          e.squishTimer--;
          if(e.squishTimer <= 0) { e.dead = true; }
          continue;
      }
      if (e.dead) continue;

      e.x += e.vx;

      // Ground check
      const eTileLeft = Math.floor(e.x / TILE);
      const eTileRight = Math.floor((e.x + e.w - 1) / TILE);
      const aheadTile = e.vx > 0 ? eTileRight + 1 : eTileLeft - 1;

      if (isGap(aheadTile * TILE) || e.x < 0 || e.x + e.w > WORLD_W) {
        e.vx = -e.vx;
      }

      // Reverse at pipes / platforms
    for (let p of pipes) {
      if (rectOverlap(e.x, e.y, e.w, e.h, p.x, p.y, p.w, p.h)) {
          e.vx = -e.vx;
          e.x += e.vx * 2;
          break;
      }
  }

  // Keep on ground surface
  e.y = GROUND_Y - e.h;

  // Anim
e.frameTimer++;
if (e.frameTimer > 10) { e.frame = (e.frame + 1) % 2; e.frameTimer = 0; }
}
}

// - Timer
function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        if (state !== 'playing') return;
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) killMario();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

// _________________________________ End game _______________________________
function endGame(result) {
    state = result;
    stopTimer();
    
    if (result === 'win') {
        bgMusic.pause();
        const winSound = new Audio("win.mp3");
        winSound.play();
        
        addScore(timeLeft * 50);
        showOverlay('YOU WIN!', `Score: ${score}\nCoins: ${coinCount}`, 'PLAY AGAIN');
    } else {
        lives = 0;
        showOverlay('GAME OVER', `Final Score: ${score}`, 'TRY AGAIN');
    }
}

function showOverlay(title, msg, btn) {
    overlayTitle.textContent = title;
    overlayMsg.innerHTML = msg.replace(/\n/g, '<br>');
    overlayBtn.textContent = btn;
    overlay.classList.remove('hidden');
}
