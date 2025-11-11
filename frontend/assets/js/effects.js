// Простой конфетти-эффект на canvas без библиотек
const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d", { alpha: true });
let W = 0, H = 0;
let particles = [];
let raf = null;

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  W = canvas.clientWidth = window.innerWidth;
  H = canvas.clientHeight = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function rnd(a,b){ return a + Math.random()*(b-a); }

export function confettiBurst(x = W/2, y = H/2, count = 160){
  const colors = ["#ffd24d","#ffbf2f","#ffea7a","#8db372","#6e8f56","#a9e1cf"];
  for (let i=0;i<count;i++){
    const angle = rnd(-Math.PI, Math.PI);
    const speed = rnd(2.2, 6.2);
    particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - rnd(2,5),
      g: rnd(0.05, 0.12),
      w: rnd(6,12),
      h: rnd(8,16),
      rot: rnd(0, Math.PI*2),
      vr: rnd(-0.2, 0.2),
      life: rnd(60,120),
      color: colors[(Math.random()*colors.length)|0]
    });
  }
  if (!raf) tick();
}

function tick(){
  raf = requestAnimationFrame(tick);
  ctx.clearRect(0,0,W,H);

  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    ctx.restore();
  });

  if (particles.length === 0) {
    cancelAnimationFrame(raf);
    raf = null;
  }
}
