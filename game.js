const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.width = 640;
canvas.height = 480;

document.body.style.margin = '0';
document.body.style.backgroundColor = '#0f1126';

const hero = {
  x: 300,
  y: 220,
  width: 32,
  height: 32,
  speed: 2,
  image: new Image(),
};

hero.image.src = 'assets/hero.png'; // โหลดรูปจาก assets

const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function update() {
  if (keys['ArrowUp']) hero.y -= hero.speed;
  if (keys['ArrowDown']) hero.y += hero.speed;
  if (keys['ArrowLeft']) hero.x -= hero.speed;
  if (keys['ArrowRight']) hero.x += hero.speed;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(he
