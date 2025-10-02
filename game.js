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

// ===== Hero =====
const hero = {
  x: 300,
  y: 220,
  w: 32,
  h: 32,
  speed: 2,
  img: new Image(),
};
hero.img.src = "assets/hero.png";

// ===== Keys =====
const keys = {};
document.addEventListener("keydown", (e) => { keys[e.key] = true; });
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// ===== Background Sky =====
const sky = new Image();
sky.src = "assets/sky.webp";

// ===== Tiles =====
const tileImages = {
  grass: new Image(),
  dirt: new Image(),
};
tileImages.grass.src = "assets/tiles/grass.png";
tileImages.dirt.src = "assets/tiles/dirt.png";

// Map (rows from top to bottom)
// - แถวบน ๆ เป็นท้องฟ้า (0)
// - กลางเป็นหญ้า (1)
// - ล่างเป็นดิน (2)
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
function update() {
  if (keys["w"] || keys["W"]) hero.y -= hero.speed;
  if (keys["s"] || keys["S"]) hero.y += hero.speed;
  if (keys["a"] || keys["A"]) hero.x -= hero.speed;
  if (keys["d"] || keys["D"]) hero.x += hero.speed;

  // กันออกนอกจอ
  hero.x = Math.max(0, Math.min(canvas.width - hero.w, hero.x));
  hero.y = Math.max(0, Math.min(canvas.height - hero.h, hero.y));
}

// ===== Draw =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky background
  if (sky.complete) {
    ctx.drawImage(sky, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#87CEEB"; // fallback sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Tiles (grass/dirt)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const id = map[r][c];
      if (id === 1) { // grass
        ctx.drawImage(tileImages.grass, c*TILE, r*TILE, TILE, TILE);
      } else if (id === 2) { // dirt
        ctx.drawImage(tileImages.dirt, c*TILE, r*TILE, TILE, TILE);
      }
    }
  }

  // Hero
  ctx.drawImage(hero.img, hero.x, hero.y, hero.w, hero.h);
}

// ===== Game Loop =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

hero.img.onload = () => {
  gameLoop();
};
