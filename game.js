(() => {
  // ===== Canvas setup (640×480) =====
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const TILE = 32, COLS = 20, ROWS = 15;
  canvas.width  = COLS * TILE; // 640
  canvas.height = ROWS * TILE; // 480

  // ===== UI refs =====
  const dialogBox = document.getElementById('dialog');
  const banner = document.getElementById('banner');

  // ===== Keys (WASD/Arrow; event.code รองรับคีย์บอร์ดไทย/อังกฤษ) =====
  const keys = {};
  function setKey(e, isDown) {
    keys[e.code] = isDown;
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","KeyW","KeyA","KeyS","KeyD","KeyE"].includes(e.code)) {
      e.preventDefault();
    }
  }
  document.addEventListener("keydown", e => setKey(e, true),  { passive:false });
  document.addEventListener("keyup",   e => setKey(e, false), { passive:false });

  // ===== Assets =====
  const hero = { x: 300, y: 220, w: 32, h: 32, speed: 2.2, img: new Image(), imgLoaded: false };
  hero.img.onload = () => hero.imgLoaded = true;
  hero.img.src = "assets/hero.png";

  const sky = new Image(); let skyLoaded = false;
  sky.onload = () => skyLoaded = true;
  sky.src = "assets/sky.webp";

  const tileImages = { grass: new Image(), dirt: new Image() };
  let grassLoaded = false, dirtLoaded = false;
  tileImages.grass.onload = () => grassLoaded = true;
  tileImages.dirt.onload  = () => dirtLoaded  = true;
  tileImages.grass.src = "assets/tiles/grass.png";
  tileImages.dirt.src  = "assets/tiles/dirt.png";

  const npcSprite = new Image(); let npcLoaded = false;
  npcSprite.onload = () => npcLoaded = true;
  npcSprite.src = "assets/tiles/tile_0000.png"; // NPC sprite

  // ===== Helpers =====
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function say(text) {
    if (!dialogBox) return;
    dialogBox.innerText = text;
    dialogBox.style.display = 'block';
    clearTimeout(say._t);
    say._t = setTimeout(() => dialogBox.style.display = 'none', 2800);
  }
  function flashBanner(text) {
    banner.textContent = text;
    banner.style.display = 'block';
    clearTimeout(flashBanner._t);
    flashBanner._t = setTimeout(() => banner.style.display = 'none', 1200);
  }

  // ===== Basic ground map (sky/grass/dirt) =====
  function makeBasicMap(variant = 0) {
    // variant ใช้ปรับโทนแต่ละฉากเล็ก ๆ (เช่น เส้นหญ้าขยับ)
    const grassRow = 8 + (variant % 2); // 8 หรือ 9
    const m = [];
    for (let r = 0; r < ROWS; r++) {
      if (r < grassRow) m[r] = Array(COLS).fill(0);         // sky
      else if (r === grassRow) m[r] = Array(COLS).fill(1);  // grass line
      else m[r] = Array(COLS).fill(2);                      // dirt
    }
    return m;
  }

  // ===== Scenes (6) with exits loop =====
  const scenes = {
    town: {
      title: "Town (Home)",
      map: makeBasicMap(0),
      npcs: [
        { x: 6*TILE, y: 8*TILE, w:32, h:32, msg: "สวัสดีครับ! 👋\nผมคือภาควัฒน์ — เกมนี้คือ Portfolio แบบโต้ตอบ\nเดินชนขอบเพื่อไปโซนอื่น ๆ และกด E เพื่อคุย" },
      ],
      exits: { right: "projects", left: "contact" }
    },
    projects: {
      title: "Projects Zone",
      map: makeBasicMap(1),
      npcs: [
        { x: 3*TILE,  y: 8*TILE, w:32, h:32, msg: "Projects:\n• Dr.Pharma (Android/Compose)\n• Python/Tkinter Doc Manager\n• Roblox: Grow a Garden\n• Web Portfolio" },
        { x: 12*TILE, y: 8*TILE, w:32, h:32, msg: "กด E บนแต่ละโปรเจกต์เพื่อดูรายละเอียด/ลิงก์" },
      ],
      exits: { right: "certificates", left: "town" }
    },
    certificates: {
      title: "Certificates Zone",
      map: makeBasicMap(0),
      npcs: [
        { x: 10*TILE, y: 8*TILE, w:32, h:32, msg: "Certificates:\n• Competition/Workshop\n• Online Courses\n• รางวัล/เกียรติบัตร" },
      ],
      exits: { right: "skills", left: "projects" }
    },
    skills: {
      title: "Skills Zone",
      map: makeBasicMap(1),
      npcs: [
        { x: 14*TILE, y: 8*TILE, w:32, h:32, msg: "Skills:\nJS/HTML/CSS, Python, Lua\nFlutter, Jetpack Compose\nCanvas/Phaser Basics" },
      ],
      exits: { right: "experience", left: "certificates" }
    },
    experience: {
      title: "Experience Zone",
      map: makeBasicMap(0),
      npcs: [
        { x: 8*TILE, y: 8*TILE, w:32, h:32, msg: "Experience:\nงานจริง/โปรเจกต์ใช้จริงในโรงเรียน/ชุมชน\nสิ่งที่เรียนรู้และปัญหาที่แก้" },
      ],
      exits: { right: "contact", left: "skills" }
    },
    contact: {
      title: "Contact / Ending",
      map: makeBasicMap(1),
      npcs: [
        { x: 12*TILE, y: 8*TILE, w:32, h:32, msg: "ติดต่อผม:\nEmail: your@email\nGitHub: github.com/...\nLINE: ..." },
      ],
      exits: { right: "town", left: "experience" }
    },
  };

  // ผูก sprite ให้ทุก NPC
  for (const name of Object.keys(scenes)) {
    scenes[name].npcs.forEach(n => { n.img = npcSprite; });
  }

  let current = "town";
  flashBanner(scenes[current].title);

  // ===== Update =====
  function update() {
    let dx = 0, dy = 0;
    if (keys["KeyW"] || keys["ArrowUp"])    dy -= hero.speed;
    if (keys["KeyS"] || keys["ArrowDown"])  dy += hero.speed;
    if (keys["KeyA"] || keys["ArrowLeft"])  dx -= hero.speed;
    if (keys["KeyD"] || keys["ArrowRight"]) dx += hero.speed;

    hero.x += dx; hero.y += dy;

    // ขอบจอ = ประตูเปลี่ยนฉาก
    const exits = scenes[current].exits || {};
    if (hero.x < 0) {
      if (exits.left) { current = exits.left; hero.x = canvas.width - hero.w - 1; flashBanner(scenes[current].title); }
      else hero.x = 0;
    }
    if (hero.x + hero.w > canvas.width) {
      if (exits.right) { current = exits.right; hero.x = 1; flashBanner(scenes[current].title); }
      else hero.x = canvas.width - hero.w;
    }
    if (hero.y < 0) {
      if (exits.up) { current = exits.up; hero.y = canvas.height - hero.h - 1; flashBanner(scenes[current].title); }
      else hero.y = 0;
    }
    if (hero.y + hero.h > canvas.height) {
      if (exits.down) { current = exits.down; hero.y = 1; flashBanner(scenes[current].title); }
      else hero.y = canvas.height - hero.h;
    }

    // คุยกับ NPC (กด E เมื่ออยู่ใกล้)
    if (keys["KeyE"]) {
      for (const npc of scenes[current].npcs) {
        const dist = Math.hypot(
          (hero.x + hero.w/2) - (npc.x + npc.w/2),
          (hero.y + hero.h/2) - (npc.y + npc.h/2)
        );
        if (dist < 48) { say(npc.msg); break; }
      }
      keys["KeyE"] = false;
    }
  }

  // ===== Draw helpers =====
  function drawBackground() {
    if (skyLoaded) ctx.drawImage(sky, 0, 0, canvas.width, canvas.height);
    else { ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  }
  function drawMap(m) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const id = m[r][c];
        if (id === 1) { // grass
          if (grassLoaded) ctx.drawImage(tileImages.grass, c*TILE, r*TILE, TILE, TILE);
          else { ctx.fillStyle = "#4caf50"; ctx.fillRect(c*TILE, r*TILE, TILE, TILE); }
        } else if (id === 2) { // dirt
          if (dirtLoaded) ctx.drawImage(tileImages.dirt, c*TILE, r*TILE, TILE, TILE);
          else { ctx.fillStyle = "#8b4513"; ctx.fillRect(c*TILE, r*TILE, TILE, TILE); }
        }
      }
    }
  }
  function drawNPCs(list) {
    for (const n of list) {
      if (npcLoaded) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(n.img, n.x, n.y, n.w, n.h);
      } else {
        ctx.fillStyle = "#FFD166";
        ctx.fillRect(n.x, n.y, n.w, n.h);
      }
    }
  }

  // ===== Draw =====
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawMap(scenes[current].map);

    // Hero
    if (hero.imgLoaded) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(hero.img, hero.x, hero.y, hero.w, hero.h);
    } else {
      ctx.fillStyle = "#fff";
      ctx.fillRect(hero.x, hero.y, hero.w, hero.h);
    }

    drawNPCs(scenes[current].npcs);
  }

  // ===== Loop =====
  function loop(){ update(); draw(); requestAnimationFrame(loop); }
  loop();
})();
