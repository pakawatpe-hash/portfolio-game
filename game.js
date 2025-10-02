// ===== Canvas setup =====
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.width = 640;   // 20 tiles
canvas.height = 480;  // 15 tiles

// ===== Constants =====
const TILE = 32;
const COLS = canvas.width / TILE;
const ROWS = canvas.height / TILE;

// ===== Keys =====
const keys = {};
function setKey(e, isDown) {
  const k = e.key;
  // ปุ่มที่ใช้เดิน + กันสกรอลหน้า
  const controlKeys = ['w','W','a','A','s','S','d','D','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '];
  if (controlKeys.includes(k)) e.preventDefault();
  keys[k] = isDown;
}
document.addEventListener('keydown', e => setKey(e, true), { passive:false });
document.addEventListener('keyup',   e => setKey(e, false), { passive:false });

// บางทีหน้าเว็บไม่ได้ focus → บังคับโฟกัส
window.addEventListener('load', () => window.focus());
document.addEventListener('click', () => window.focus());

// ===== Hero =====
const hero = {
  x: 300,
  y: 220,
  w: 32,
  h: 32,
  speed: 2,
  img: new Image(),
  imgLoaded: false,
};
hero.img.onload = () => { hero.imgLoaded = true; };
hero.img.src = "assets/hero.png"; // ถ้า path ผิด เกมก็ยังรันและวาดสี่เหลี่ยมแทน

// ===== Background Sky =====
const sky = new Image();
let skyLoaded = false;
sky.onload = () => skyLoaded = true;
sky.src = "assets/sky.webp";

// ===== Tiles =====
const tileImages = {
  grass: new Image(),
  dirt: new Image(),
};
let grassLoaded = false, dirtLoaded = false;
tileImages.grass.onload = () => grassLoaded = true;
tileImages.dirt.onload  = () => dirtLoaded  = true;
tileImages.grass.src = "assets/tiles/grass.png";
tileImages.dirt.src  = "assets/tiles/dirt.png";

// ===== Map: sky(0) / grass(1) / dirt(2) =====
const map = [];
for (let r = 0; r < ROWS; r++) {
  if (r < 8) {
    map[r] = Array(COLS).fill(0);   // sky
  } else if (r === 8) {
    map[r] = Array(COLS).fill(1);   // grass
  } else {
    map[r] = Array(COLS).fill(2);   // dirt
  }
}

// ===== Update =====
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function update() {
  let dx = 0, dy = 0;

  // WASD
  if (keys['w'] || keys['W']) dy -= hero.speed;
  if (keys['s'] || keys['S']) dy += hero.speed;
  if (keys['a'] || keys['A']) dx -= hero.speed;
  if (keys['d'] || keys['D']) dx += hero.speed;

  // Arrow keys
  if (keys['ArrowUp'])    dy -= hero.speed;
  if (keys['ArrowDown'])  dy += hero.speed;
  if (keys['ArrowLeft'])  dx -= hero.speed;
  if (keys['ArrowRight']) dx += hero.speed;

  hero.x = clamp(hero.x + dx, 0, canvas.width - hero.w);
  hero.y = clamp(hero.y + dy, 0, canvas.height - hero.h);
}

// ===== Draw =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky
  if (skyLoaded) {
    ctx.drawImage(sky, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Tiles
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const id = map[r][c];
      if (id === 1) { // grass
        if (grassLoaded) ctx.drawImage(tileImages.grass, c*TILE, r*TILE, TILE, TILE);
        else { ctx.fillStyle = "#4caf50"; ctx.fillRect(c*TILE, r*TILE, TILE, TILE); }
      } else if (id === 2) { // dirt
        if (dirtLoaded) ctx.drawImage(tileImages.dirt, c*TILE, r*TILE, TILE, TILE);
        else { ctx.fillStyle = "#8b4513"; ctx.fillRect(c*TILE, r*TILE, TILE, TILE); }
      }
    }
  }

  // Hero
  if (hero.imgLoaded) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hero.img, hero.x, hero.y, hero.w, hero.h);
  } else {
    // Fallback: กล่องสี่เหลี่ยมแทน hero
    ctx.fillStyle = "#fff";
    ctx.fillRect(hero.x, hero.y, hero.w, hero.h);
  }
}

// ===== Loop =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
// เริ่ม loop ทันที — ไม่ต้องรอรูปโหลด
gameLoop();
