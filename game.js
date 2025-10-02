(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const TILE = 32, COLS = 20, ROWS = 15;
  canvas.width = COLS*TILE;
  canvas.height = ROWS*TILE;

  const banner = document.getElementById('banner');
  const dialogBox = document.getElementById('dialog');

  // Keys
  const keys = {};
  function setKey(e,isDown){
    keys[e.code]=isDown;
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","KeyW","KeyA","KeyS","KeyD","KeyE"].includes(e.code)){
      e.preventDefault();
    }
  }
  document.addEventListener('keydown', e=>setKey(e,true), {passive:false});
  document.addEventListener('keyup',   e=>setKey(e,false), {passive:false});

  // Hero
  const hero = {x:300,y:220,w:32,h:32,speed:2.2,img:new Image(),imgLoaded:false};
  hero.img.onload=()=>hero.imgLoaded=true;
  hero.img.src="assets/hero.png";

  // Tiles
  const sky=new Image(); let skyLoaded=false;
  sky.onload=()=>skyLoaded=true; sky.src="assets/sky.webp";
  const tileImages={grass:new Image(),dirt:new Image()};
  let grassLoaded=false,dirtLoaded=false;
  tileImages.grass.onload=()=>grassLoaded=true;
  tileImages.dirt.onload=()=>dirtLoaded=true;
  tileImages.grass.src="assets/tiles/grass.png";
  tileImages.dirt.src="assets/tiles/dirt.png";

  const npcSprite=new Image(); let npcLoaded=false;
  npcSprite.onload=()=>npcLoaded=true;
  npcSprite.src="assets/tiles/tile_0000.png";

  function say(text){
    dialogBox.innerText=text; dialogBox.style.display='block';
    clearTimeout(say._t); say._t=setTimeout(()=>dialogBox.style.display='none',2800);
  }
  function flash(text){
    banner.textContent=text; banner.style.display='block';
    clearTimeout(flash._t); flash._t=setTimeout(()=>banner.style.display='none',1200);
  }

  // Basic map
  function makeBasicMap(variant=0){
    const grassRow=8+(variant%2);
    const m=[];
    for(let r=0;r<ROWS;r++){
      if(r<grassRow) m[r]=Array(COLS).fill(0);
      else if(r===grassRow) m[r]=Array(COLS).fill(1);
      else m[r]=Array(COLS).fill(2);
    }
    return m;
  }

  // Scenes (6)
  const scenes={
    town:{
      title:"Town (Home)",
      info:"ยินดีต้อนรับ 👋",
      map:makeBasicMap(0),
      npcs:[{x:6*TILE,y:8*TILE,w:32,h:32,msg:"นี่คือฉาก Home"}],
      exits:{right:"projects",left:"contact"}
    },
    projects:{
      title:"Projects",
      info:"โปรเจกต์หลักของผม",
      map:makeBasicMap(1),
      npcs:[{x:10*TILE,y:8*TILE,w:32,h:32,msg:"Projects Zone"}],
      exits:{right:"certificates",left:"town"}
    },
    certificates:{
      title:"Certificates",
      info:"เกียรติบัตร/รางวัล",
      map:makeBasicMap(0),
      npcs:[{x:4*TILE,y:8*TILE,w:32,h:32,msg:"Certificates Zone"}],
      exits:{right:"skills",left:"projects"}
    },
    skills:{
      title:"Skills",
      info:"ทักษะ/ความสามารถ",
      map:makeBasicMap(1),
      npcs:[{x:14*TILE,y:8*TILE,w:32,h:32,msg:"Skills Zone"}],
      exits:{right:"experience",left:"certificates"}
    },
    experience:{
      title:"Experience",
      info:"ประสบการณ์",
      map:makeBasicMap(0),
      npcs:[{x:8*TILE,y:8*TILE,w:32,h:32,msg:"Experience Zone"}],
      exits:{right:"contact",left:"skills"}
    },
    contact:{
      title:"Contact",
      info:"ช่องทางติดต่อ",
      map:makeBasicMap(1),
      npcs:[{x:12*TILE,y:8*TILE,w:32,h:32,msg:"Contact Zone"}],
      exits:{right:"town",left:"experience"}
    }
  };
  Object.values(scenes).forEach(sc=>sc.npcs.forEach(n=>n.img=npcSprite));

  let current="town";
  flash(scenes[current].title);
  say(scenes[current].info);

  // Update
  function update(){
    let dx=0,dy=0;
    if(keys["KeyW"]||keys["ArrowUp"])dy-=hero.speed;
    if(keys["KeyS"]||keys["ArrowDown"])dy+=hero.speed;
    if(keys["KeyA"]||keys["ArrowLeft"])dx-=hero.speed;
    if(keys["KeyD"]||keys["ArrowRight"])dx+=hero.speed;
    hero.x+=dx; hero.y+=dy;

    const exits=scenes[current].exits||{};
    if(hero.x<0){
      if(exits.left){current=exits.left; hero.x=canvas.width-hero.w-1; flash(scenes[current].title); say(scenes[current].info);}
      else hero.x=0;
    }
    if(hero.x+hero.w>canvas.width){
      if(exits.right){current=exits.right; hero.x=1; flash(scenes[current].title); say(scenes[current].info);}
      else hero.x=canvas.width-hero.w;
    }
    if(hero.y<0){ hero.y=0; }
    if(hero.y+hero.h>canvas.height){ hero.y=canvas.height-hero.h; }

    if(keys["KeyE"]){
      for(const n of scenes[current].npcs){
        const dist=Math.hypot((hero.x+hero.w/2)-(n.x+n.w/2),(hero.y+hero.h/2)-(n.y+n.h/2));
        if(dist<48){ say(n.msg); break; }
      }
      keys["KeyE"]=false;
    }
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(skyLoaded) ctx.drawImage(sky,0,0,canvas.width,canvas.height);
    else {ctx.fillStyle="#87CEEB"; ctx.fillRect(0,0,canvas.width,canvas.height);}
    const m=scenes[current].map;
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const id=m[r][c];
        if(id===1){ if(grassLoaded) ctx.drawImage(tileImages.grass,c*TILE,r*TILE,TILE,TILE); else {ctx.fillStyle="#4caf50";ctx.fillRect(c*TILE,r*TILE,TILE,TILE);} }
        else if(id===2){ if(dirtLoaded) ctx.drawImage(tileImages.dirt,c*TILE,r*TILE,TILE,TILE); else {ctx.fillStyle="#8b4513";ctx.fillRect(c*TILE,r*TILE,TILE,TILE);} }
      }
    }
    if(hero.imgLoaded){ ctx.imageSmoothingEnabled=false; ctx.drawImage(hero.img,hero.x,hero.y,hero.w,hero.h); }
    else { ctx.fillStyle="#fff"; ctx.fillRect(hero.x,hero.y,hero.w,hero.h); }
    for(const n of scenes[current].npcs){
      if(npcLoaded){ ctx.imageSmoothingEnabled=false; ctx.drawImage(n.img,n.x,n.y,n.w,n.h); }
      else { ctx.fillStyle="#FFD166"; ctx.fillRect(n.x,n.y,n.w,n.h); }
    }
  }

  function loop(){ update(); draw(); requestAnimationFrame(loop); }
  loop();
})();
