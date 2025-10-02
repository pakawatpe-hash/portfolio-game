(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // ===== Full HD Size =====
  const TILE = 32;
  const COLS = 60; 
  const ROWS = 33; 
  canvas.width  = COLS * TILE;   // 1920
  canvas.height = ROWS * TILE;   // 1056

  // ===== Keys =====
  const keys = {};
  function setKey(e, isDown) {
    keys[e.code] = isDown;
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","KeyW","KeyA","KeyS","KeyD","KeyE"].includes(e.code)) {
      e.preventDefault();
    }
  }
  document.addEventListener("keydown", e => setKey(e, true),  { passive:false });
  document.addEventListener("keyup",   e => setKey(e, false), { passive:false });

  // ===== Hero =====
  const hero = { x: 300, y: 220, w: 32, h: 32, speed: 4, img: new Image(), imgLoaded: false };
  hero.img.onload = () => hero.imgLoaded = true;
  hero.img.src = "assets/hero.png";

  // ===== Background Sky =====
  const sky = new Image();
  let skyLoaded = false;
  sky.onload = () => skyLoaded = true;
  sky.src = "assets/sky.webp";

  // ===== Tiles =====
  const tileImages = { grass: new Image(), dirt: new Image() };
  let grassLoaded = false, dirtLoaded = false;
  tileImages.grass.onload = () => grassLoaded = true;
  tileImages.dirt.onload  = () => dirtLoaded  = true;
  tileImages.grass.src = "assets/tiles/grass.png";
  tileImages.dirt.src  = "assets/tiles/dirt.png";

  // ===== Map =====
  const map = [];
  for (let r = 0; r < ROWS; r++) {
    if (r < 16) map[r] = Array(COLS).fill(0);       // sky
    else if (r === 16) map[r] = Array(COLS).fill(1); // grass line
    else map[r] = Array(COLS).fill(2);              // dirt
  }

  // ===== NPC (ใช้ tile_0000.png) =====
  const npcs = [
    {
      x: 28 * TILE,
      y: 16 * TILE,
      w: 32,
      h: 32,
      img: new Image(),
      imgLoaded: false,
      message: "สวัสดี! 👋\nผมคือ NPC Guide\nกด E เพื่อดูโปรเจกต์"
    }
  ];
  npcs[0].img.onload = () => npcs[0].imgLoaded = true;
  npcs[0].img.src = "assets/tiles/tile_0000.png"; // ✅ ใช้ sprite แทนกล่อง

  // ===== Dialog =====
  const dialogBox = document.getElementById("dialog");
  function showDialog(text) {
    if (!dialogBox) return;
    dialogBox.innerText = text;
    dialogBox.style.display = "block";
    clearTimeout(showDialog._t);
    showDialog._t = setTimeout(()=> dialogBox.style.display = "none", 3000);
  }

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // ===== Update =====
  function update() {
    let dx = 0, dy = 0;
    if (keys["KeyW"] || keys["ArrowUp"])    dy -= hero.speed;
    if (keys["KeyS"] || keys["ArrowDown"])  dy += hero.speed;
    if (keys["KeyA"] || keys["ArrowLeft"])  dx -= hero.speed;
    if (keys["KeyD"] || keys["ArrowRight"]) dx += hero.speed;

    hero.x = clamp(hero.x + dx, 0, canvas.width - hero.w);
    hero.y = clamp(hero.y + dy, 0, canvas.height - hero.h);

    if (keys["KeyE"]) {
      for (const npc of npcs) {
        const dist = Math.hypot(
          (hero.x+hero.w/2)-(npc.x+npc.w/2),
          (hero.y+hero.h/2)-(npc.y+npc.h/2)
        );
        if (dist < 60) showDialog(npc.message);
      }
      keys["KeyE"] = false;
    }
  }

  // ===== Draw =====
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (skyLoaded) ctx.drawImage(sky, 0, 0, canvas.width, canvas.height);
    else { ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, canvas.width, canvas.height); }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const id = map[r][c];
        if (id === 1) {
          if (grassLoaded) ctx.drawImage(tileImages.grass, c*TILE, r*TILE, TILE, TILE);
          else { ctx.fillStyle = "#4caf50"; ctx.fillRect(c*TILE, r*TILE, TILE, TILE); }
        } else if (id === 2) {
          if (dirtLoaded) ctx.drawImage(tileImages.dirt, c*TILE, r*TILE, TILE, TILE);
          else { ctx.fillStyle = "#8b4513"; ctx.fillRect(c*TILE, r*TILE, TILE, TILE); }
        }
      }
    }

    if (hero.imgLoaded) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(hero.img, hero.x, hero.y, hero.w, hero.h);
    } else {
      ctx.fillStyle = "#fff";
      ctx.fillRect(hero.x, hero.y, hero.w, hero.h);
    }

    for (const npc of npcs) {
      if (npc.imgLoaded) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(npc.img, npc.x, npc.y, npc.w, npc.h);
      } else {
        ctx.fillStyle = "#FFD166";
        ctx.fillRect(npc.x, npc.y, npc.w, npc.h);
      }
    }
  }

  // ===== Loop =====
  function loop() { update(); draw(); requestAnimationFrame(loop); }
  loop();
})();
