(() => {
  // ===== Canvas (640×480) =====
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const TILE = 32, COLS = 20, ROWS = 15;
  canvas.width  = COLS*TILE;
  canvas.height = ROWS*TILE;

  // UI refs
  const banner = document.getElementById('banner');
  const dialogBox = document.getElementById('dialog');
  const overlay = document.getElementById('overlay');
  const panelTitle = document.getElementById('panelTitle');
  const panelExternal = document.getElementById('panelExternal');
  const panelClose = document.getElementById('panelClose');
  const panelFrame = document.getElementById('panelFrame');

  // Keys (event.code รองรับคีย์บอร์ดไทย/อังกฤษ)
  const keys = {};
  function setKey(e, isDown) {
    keys[e.code] = isDown;
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","KeyW","KeyA","KeyS","KeyD","KeyE","Enter"].includes(e.code)) {
      e.preventDefault();
    }
  }
  document.addEventListener('keydown', e=>setKey(e,true), {passive:false});
  document.addEventListener('keyup',   e=>setKey(e,false), {passive:false});

  // Assets
  const hero = { x:300, y:220, w:32, h:32, speed:2.2, img:new Image(), imgLoaded:false };
  hero.img.onload = () => hero.imgLoaded = true;
  hero.img.src = "assets/hero.png";

  const sky = new Image(); let skyLoaded=false;
  sky.onload = () => skyLoaded = true;
  sky.src = "assets/sky.webp";

  const tileImages = { grass:new Image(), dirt:new Image() };
  let grassLoaded=false, dirtLoaded=false;
  tileImages.grass.onload = () => grassLoaded = true;
  tileImages.dirt.onload  = () => dirtLoaded  = true;
  tileImages.grass.src = "assets/tiles/grass.png";
  tileImages.dirt.src  = "assets/tiles/dirt.png";

  const npcSprite = new Image(); let npcLoaded=false;
  npcSprite.onload = () => npcLoaded = true;
  npcSprite.src = "assets/tiles/tile_0000.png";

  // Helpers
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  function say(text){
    dialogBox.innerText = text; dialogBox.style.display='block';
    clearTimeout(say._t); say._t=setTimeout(()=>dialogBox.style.display='none', 2800);
  }
  function flash(text){
    banner.textContent=text; banner.style.display='block';
    clearTimeout(flash._t); flash._t=setTimeout(()=>banner.style.display='none', 1200);
  }
  function openOverlay({title,url}){
    panelTitle.textContent = title || 'Portfolio';
    panelExternal.href = url;
    panelFrame.src = url;              // ลองฝังใน iframe
    overlay.style.display = 'flex';
  }
  function closeOverlay(){ overlay.style.display='none'; panelFrame.src='about:blank'; }
  panelClose.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeOverlay(); });

  // Basic ground map (sky/grass/dirt)
  function makeBasicMap(variant=0){
    const grassRow = 8 + (variant%2);
    const m=[];
    for(let r=0;r<ROWS;r++){
      if (r<grassRow) m[r]=Array(COLS).fill(0);
      else if (r===grassRow) m[r]=Array(COLS).fill(1);
      else m[r]=Array(COLS).fill(2);
    }
    return m;
  }

  // ===== Scene link targets (ของพี่เอง) =====
  const PORT = "https://pakawatpe-hash.github.io/pakawat-portfolio/";        // หน้า Portfolio หลัก :contentReference[oaicite:2]{index=2}
  const PORT_CONTACT = "https://pakawatpe-hash.github.io/pakawat-portfolio/#contact"; // หน้าติดต่อ :contentReference[oaicite:3]{index=3}

  // ===== 6 Scenes + link ของแต่ละฉาก =====
  const scenes = {
    town: {
      title: "Town (Home)",
      info: "Hi! I'm Pakawat 👋\nนี่คือ Portfolio Game แบบย่อ — กด Enter เพื่อเปิดพอร์ต",
      map: makeBasicMap(0),
      link: { title: "Portfolio — Home", url: PORT },
      npcs: [{ x:6*TILE, y:8*TILE, w:32, h:32, msg:"ยินดีต้อนรับ! กด Enter เพื่อเปิดพอร์ต (หรือกด E เพื่ออ่านข้อความ)" }],
      exits: { right:"projects", left:"contact" }
    },
    projects: {
      title: "Projects",
      info: "โปรเจกต์หลักของผม: Flutter • Python/Tkinter • Roblox • Web\nกด Enter เพื่อดูรายละเอียดในพอร์ต",
      map: makeBasicMap(1),
      link: { title: "Portfolio — Projects", url: PORT+"#portfolio" },
      npcs: [{ x:11*TILE, y:8*TILE, w:32, h:32, msg:"กด Enter เพื่อเปิด Projects ในแท็บพอร์ต" }],
      exits: { right:"certificates", left:"town" }
    },
    certificates: {
      title: "Certificates",
      info: "เกียรติบัตร/หลักสูตร/การแข่งขันที่เกี่ยวข้อง\nกด Enter เพื่อดูในพอร์ต",
      map: makeBasicMap(0),
      link: { title: "Portfolio — Certificates", url: PORT+"#certificates" },
      npcs: [{ x:4*TILE, y:8*TILE, w:32, h:32, msg:"รวมใบประกาศ/รางวัล — เปิดด้วย Enter" }],
      exits: { right:"skills", left:"projects" }
    },
    skills: {
      title: "Skills",
      info: "ทักษะ: JS/HTML/CSS, Python, Lua, Flutter, Compose, Canvas\nกด Enter เพื่ออ่านสรุปในพอร์ต",
      map: makeBasicMap(1),
      link: { title: "Portfolio — Tech Stack", url: PORT+"#tech-stack" },
      npcs: [{ x:14*TILE, y:8*TILE, w:32, h:32, msg:"Tech Stack & Tools" }],
      exits: { right:"experience", left:"certificates" }
    },
    experience: {
      title: "Experience",
      info: "ประสบการณ์จริงที่ได้ทำและได้เรียนรู้\nกด Enter เพื่อดูตัวอย่าง",
      map: makeBasicMap(0),
      link: { title: "Portfolio — Experience", url: PORT+"#about" },
      npcs: [{ x:8*TILE, y:8*TILE, w:32, h:32, msg:"ประสบการณ์/สิ่งที่เรียนรู้" }],
      exits: { right:"contact", left:"skills" }
    },
    contact: {
      title: "Contact",
      info: "ช่องทางติดต่อ — Email / GitHub / LINE\nกด Enter เพื่อไป Contact",
      map: makeBasicMap(1),
      link: { title: "Portfolio — Contact", url: PORT_CONTACT },
      npcs: [{ x:12*TILE, y:8*TILE, w:32, h:32, msg:"ขอบคุณครับ 🙏 กด Enter เพื่อเปิด Contact" }],
      exits: { right:"town", left:"experience" }
    },
  };

  // bind NPC sprite
  Object.values(scenes).forEach(sc => sc.npcs.forEach(n => n.img = npcSprite));

  let current = "town";
  flash(scenes[current].title);
  say(scenes[current].info);

  // Update
  function update(){
    let dx=0, dy=0;
    if (keys["KeyW"]||keys["ArrowUp"])    dy -= hero.speed;
    if (keys["KeyS"]||keys["ArrowDown"])  dy += hero.speed;
    if (keys["KeyA"]||keys["ArrowLeft"])  dx -= hero.speed;
    if (keys["KeyD"]||keys["ArrowRight"]) dx += hero.speed;
    hero.x += dx; hero.y += dy;

    // change scene at edges
    const exits = scenes[current].exits||{};
    if (hero.x < 0) {
      if (exits.left){ current = exits.left; hero.x = canvas.width-hero.w-1; flash(scenes[current].title); say(scenes[current].info); }
      else hero.x=0;
    }
    if (hero.x+hero.w > canvas.width) {
      if (exits.right){ current = exits.right; hero.x = 1; flash(scenes[current].title); say(scenes[current].info); }
      else hero.x = canvas.width-hero.w;
    }
    if (hero.y < 0) {
      if (exits.up){ current = exits.up; hero.y = canvas.height-hero.h-1; flash(scenes[current].title); say(scenes[current].info); }
      else hero.y=0;
    }
    if (hero.y+hero.h > canvas.height) {
      if (exits.down){ current = exits.down; hero.y = 1; flash(scenes[current].title); say(scenes[current].info); }
      else hero.y = canvas.height-hero.h;
    }

    // talk (E) near npc — แค่บอกข้อความสั้น ๆ
    if (keys["KeyE"]) {
      for (const n of scenes[current].npcs) {
        const dist = Math.hypot((hero.x+hero.w/2)-(n.x+n.w/2),(hero.y+hero.h/2)-(n.y+n.h/2));
        if (dist < 48){ say(n.msg); break; }
      }
      keys["KeyE"]=false;
    }

    // ENTER = เปิดพอร์ตของฉากใน overlay (หรือแท็บใหม่ถ้าฝังไม่ได้)
    if (keys["Enter"]) {
      const link = scenes[current].link;
      if (link?.url){
        try { openOverlay(link); } catch { window.open(link.url, "_blank"); }
      }
      keys["Enter"]=false;
    }
  }

  // Draw
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (skyLoaded) ctx.drawImage(sky, 0,0, canvas.width, canvas.height);
    else { ctx.fillStyle = "#87CEEB"; ctx.fillRect(0,0,canvas.width,canvas.height); }

    // tiles (grass/dirt)
    const m = scenes[current].map;
    for (let r=0;r<ROWS;r++){
      for (let c=0;c<COLS;c++){
        const id=m[r][c];
        if (id===1)      { if (grassLoaded) ctx.drawImage(tileImages.grass,c*TILE,r*TILE,TILE,TILE); else {ctx.fillStyle="#4caf50";ctx.fillRect(c*TILE,r*TILE,TILE,TILE);} }
        else if (id===2) { if (dirtLoaded)  ctx.drawImage(tileImages.dirt, c*TILE,r*TILE,TILE,TILE);   else {ctx.fillStyle="#8b4513";ctx.fillRect(c*TILE,r*TILE,TILE,TILE);} }
      }
    }

    // hero
    if (hero.imgLoaded) { ctx.imageSmoothingEnabled=false; ctx.drawImage(hero.img, hero.x, hero.y, hero.w, hero.h); }
    else { ctx.fillStyle="#fff"; ctx.fillRect(hero.x, hero.y, hero.w, hero.h); }

    // npcs
    for (const n of scenes[current].npcs){
      if (npcLoaded) { ctx.imageSmoothingEnabled=false; ctx.drawImage(n.img, n.x, n.y, n.w, n.h); }
      else { ctx.fillStyle="#FFD166"; ctx.fillRect(n.x, n.y, n.w, n.h); }
    }
  }

  // Loop
  function loop(){ update(); draw(); requestAnimationFrame(loop); }
  loop();
})();
