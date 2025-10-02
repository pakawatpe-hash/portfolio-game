(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // ===== Size 640×480 =====
  const TILE = 32;
  const COLS = 20; // 640 / 32
  const ROWS = 15; // 480 / 32
  canvas.width  = COLS * TILE;
  canvas.height = ROWS * TILE;

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
  const hero = { x: 300, y: 220, w: 32, h: 32, speed: 2, img: new Image(), imgLoaded: false };
  hero.img.onload = () => hero.imgLoaded = true;
  hero.img.src = "assets/hero.png";

  // ===== Dialog =====
  const dialogBox = document.getElementById("dialog");
  function showDialog(text) {
    if (!dialogBox) return;
    dialogBox.innerText = text;
    dialogBox.style.display = "block";
    clearTimeout(showDialog._t);
    showDialog._t = setTimeout(()=> dialogBox.style.display = "none", 3000);
  }

  // ===== Maps =====
  const maps = {
    town: {
      bg: "#4caf50", // grass
      npcs: [
        { x: 5*TILE, y: 8*TILE, w:32, h:32, color:"#FFD166", message:"สวัสดี! นี่คือ Town" }
      ],
      exits: { right: "forest" }
    },
    forest: {
      bg: "#2e7d32", // darker green
      npcs: [
        { x: 10*TILE, y: 6*TILE, w:32, h:32, color:"#FF6F61", message:"คุณเข้ามาใน Forest แล้ว" }
      ],
      exits: { left: "town" }
    }
  };

  let currentMap = "town";

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // ===== Update =====
  function update() {
    let dx = 0, dy = 0;
    if (keys["KeyW"] || keys["ArrowUp"])    dy -= hero.speed;
    if (keys["KeyS"] || keys["ArrowDown"])  dy += hero.speed;
    if (keys["KeyA"] || keys["ArrowLeft"])  dx -= hero.speed;
    if (keys["KeyD"] || keys["ArrowRight"]) dx += hero.speed;

    hero.x += dx; hero.y += dy;

    // ===== Change scene when hit edge =====
    if (hero.x < 0) {
      if (maps[currentMap].exits.left) {
        currentMap = maps[currentMap].exits.left;
        hero.x = canvas.width - hero.w - 1;
      } else { hero.x = 0; }
    }
    if (hero.x + hero.w > canvas.width) {
      if (maps[currentMap].exits.right) {
        currentMap = maps[currentMap].exits.right;
        hero.x = 1;
      } else { hero.x = canvas.width - hero.w; }
    }
    if (hero.y < 0) {
      if (maps[currentMap].exits.up) {
        currentMap = maps[currentMap].exits.up;
        hero.y = canvas.height - hero.h - 1;
      } else { hero.y = 0; }
    }
    if (hero.y + hero.h > canvas.height) {
      if (maps[currentMap].exits.down) {
        currentMap = maps[currentMap].exits.down;
        hero.y = 1;
      } else { hero.y = canvas.height - hero.h; }
    }

    // กด E คุยกับ NPC
    if (keys["KeyE"]) {
      for (const npc of maps[currentMap].npcs) {
        const dist = Math.hypot((hero.x+hero.w/2)-(npc.x+npc.w/2), (hero.y+hero.h/2)-(npc.y+npc.h/2));
        if (dist < 50) { showDialog(npc.message); }
      }
      keys["KeyE"] = false;
    }
  }

  // ===== Draw =====
  function draw() {
    ctx.fillStyle = maps[currentMap].bg;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    if (hero.imgLoaded) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(hero.img, hero.x, hero.y, hero.w, hero.h);
    } else {
      ctx.fillStyle = "#fff";
      ctx.fillRect(hero.x, hero.y, hero.w, hero.h);
    }

    for (const npc of maps[currentMap].npcs) {
      ctx.fillStyle = npc.color;
      ctx.fillRect(npc.x, npc.y, npc.w, npc.h);
    }
  }

  // ===== Loop =====
  function loop() { update(); draw(); requestAnimationFrame(loop); }
  loop();
})();
