const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // วาดพื้นหลังชั่วคราว
  ctx.fillStyle = "#0b1737";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // วาดข้อความทดสอบ
  ctx.fillStyle = "#e8eef6";
  ctx.font = "20px sans-serif";
  ctx.fillText("RPG Portfolio Prototype", 50, 50);

  requestAnimationFrame(loop);
}

// เริ่ม loop
loop();
