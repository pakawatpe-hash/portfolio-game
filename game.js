// สร้าง <canvas> แล้วแปะลงหน้าเว็บ
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// ตั้งค่าขนาด
canvas.width = 640;
canvas.height = 480;

// ตั้งค่า CSS หน้าจอ
document.body.style.margin = '0';
document.body.style.backgroundColor = '#0f1126';

// โหลดรูปตัวละคร
const hero = {
  x: 300,
  y: 220,
  width: 32,
  height: 32,
  speed: 2,
  image: new Image(),
};

hero.image.src = 'assets/hero.png'; // รูปที่พี่อัปไว้ในโฟลเดอร์ assets

// เก็บสถานะปุ่ม
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// อัปเดตตำแหน่ง
function update() {
  if (keys['ArrowUp']) hero.y -= hero.speed;
  if (keys['ArrowDown']) hero.y += hero.speed;
  if (keys['ArrowLeft']) hero.x -= hero.speed;
  if (keys['ArrowRight']) hero.x += hero.speed;
}

// วาดลงจอ
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(hero.image, hero.x, hero.y, hero.width, hero.height);
}

// วนเกม
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// เริ่มเกมเมื่อโหลดรูปเสร็จ
hero.image.onload = () => {
  gameLoop();
};
