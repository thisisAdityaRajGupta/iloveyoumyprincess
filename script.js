// ---------- Page switching ----------
const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const btnArea = document.getElementById("btnArea");
const backBtn = document.getElementById("backBtn");

let dodgeCount = 0;
let yesScale = 1;

// Helper
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function showPage2(){
  page1.classList.remove("active");
  page1.setAttribute("aria-hidden", "true");
  page2.classList.add("active");
  page2.setAttribute("aria-hidden", "false");

  // celebration
  burstConfetti(180);
  setTimeout(() => burstConfetti(220), 250);
  setTimeout(() => burstConfetti(220), 650);

  // animate timeline items as user scrolls
  setupTimelineReveal();
}

yesBtn.addEventListener("click", showPage2);

backBtn?.addEventListener("click", () => {
  page2.classList.remove("active");
  page2.setAttribute("aria-hidden", "true");
  page1.classList.add("active");
  page1.setAttribute("aria-hidden", "false");
  window.scrollTo({top:0, behavior:"smooth"});
});

// ---------- NO button dodge logic ----------
function moveNoButton(nearX, nearY){
  const rect = btnArea.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  // Make it bounce to left/right around the YES
  const side = (dodgeCount % 2 === 0) ? -1 : 1;

  // range inside container
  let x = w/2 + side * (w * 0.22) + (Math.random()*30 - 15);
  let y = h/2 + (Math.random()*40 - 20);

  // keep inside area
  x = clamp(x, 70, w - 70);
  y = clamp(y, 40, h - 40);

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = `translate(-50%, -50%)`;

  dodgeCount++;

  // YES grows as she tries to reach NO
  yesScale = clamp(1 + dodgeCount * 0.08, 1, 1.85);
  yesBtn.style.transform = `scale(${yesScale})`;

  // after 5-6 tries, NO goes behind YES + becomes basically impossible
  if(dodgeCount >= 6){
    noBtn.style.zIndex = "1";
    yesBtn.style.zIndex = "3";
    noBtn.style.left = "50%";
    noBtn.style.top = "50%";
    noBtn.style.opacity = "0.05";
    // put it behind yes
    noBtn.style.pointerEvents = "none";
    yesBtn.style.transform = `scale(1.9)`;
  }
}

// Desktop: when mouse approaches NO
noBtn.addEventListener("mouseenter", (e) => {
  moveNoButton(e.clientX, e.clientY);
});

// Mobile: when finger touches near NO
noBtn.addEventListener("touchstart", (e) => {
  moveNoButton(0,0);
  e.preventDefault();
}, {passive:false});

// Also dodge if mouse moves close to it
btnArea.addEventListener("mousemove", (e) => {
  const nb = noBtn.getBoundingClientRect();
  const dx = e.clientX - (nb.left + nb.width/2);
  const dy = e.clientY - (nb.top + nb.height/2);
  const dist = Math.sqrt(dx*dx + dy*dy);

  if(dist < 90 && dodgeCount < 6){
    moveNoButton(e.clientX, e.clientY);
  }
});

// ---------- Envelope open ----------
const envBtn = document.getElementById("envBtn");
const letter = document.getElementById("letter");

envBtn?.addEventListener("click", () => {
  const open = letter.classList.toggle("show");
  envBtn.setAttribute("aria-expanded", open ? "true" : "false");
  letter.setAttribute("aria-hidden", open ? "false" : "true");
  if(open){
    burstConfetti(90);
    setTimeout(() => letter.scrollIntoView({behavior:"smooth", block:"start"}), 120);
  }
});

// ---------- Floating hearts canvas ----------
const heartsCanvas = document.getElementById("hearts");
const hctx = heartsCanvas.getContext("2d");

function resizeCanvas(c){
  const dpr = window.devicePixelRatio || 1;
  c.width = window.innerWidth * dpr;
  c.height = window.innerHeight * dpr;
  c.style.width = window.innerWidth + "px";
  c.style.height = window.innerHeight + "px";
}

function setTransform(ctx){
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function safeResizeAll(){
  resizeCanvas(heartsCanvas);
  setTransform(hctx);
  resizeCanvas(confCanvas);
  setTransform(cctx);
}
window.addEventListener("resize", safeResizeAll);

// hearts
const hearts = [];
const HEARTS_COUNT = 26;
const rand = (min,max)=> Math.random()*(max-min)+min;

function spawnHeart(){
  hearts.push({
    x: rand(0, window.innerWidth),
    y: window.innerHeight + rand(20, 200),
    vy: rand(0.35, 1.05),
    vx: rand(-0.25, 0.25),
    s: rand(10, 22),
    r: rand(-0.8, 0.8),
    vr: rand(-0.006, 0.006),
    a: rand(0.35, 0.75),
  });
}
for(let i=0;i<HEARTS_COUNT;i++) spawnHeart();

function drawHeart(ctx,x,y,s,rot,a){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot);
  ctx.globalAlpha = a;

  ctx.beginPath();
  const t = s;
  ctx.moveTo(0, t/4);
  ctx.bezierCurveTo(0, -t/2, -t, -t/2, -t, t/6);
  ctx.bezierCurveTo(-t, t, 0, t*1.15, 0, t*1.45);
  ctx.bezierCurveTo(0, t*1.15, t, t, t, t/6);
  ctx.bezierCurveTo(t, -t/2, 0, -t/2, 0, t/4);

  const g = ctx.createLinearGradient(-t, -t, t, t);
  g.addColorStop(0, "rgba(255,79,191,0.95)");
  g.addColorStop(1, "rgba(123,231,255,0.85)");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,79,191,0.35)";
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.restore();
}

function animHearts(){
  hctx.clearRect(0,0,window.innerWidth, window.innerHeight);
  for(const p of hearts){
    p.x += p.vx;
    p.y -= p.vy;
    p.r += p.vr;
    drawHeart(hctx, p.x, p.y, p.s, p.r, p.a);
    if(p.y < -80){
      p.y = window.innerHeight + rand(60, 220);
      p.x = rand(0, window.innerWidth);
      p.vy = rand(0.35, 1.05);
    }
  }
  requestAnimationFrame(animHearts);
}

// ---------- Confetti canvas ----------
const confCanvas = document.getElementById("confetti");
const cctx = confCanvas.getContext("2d");
const confetti = [];

function burstConfetti(count=140){
  const cx = window.innerWidth/2;
  const cy = window.innerHeight/4;
  for(let i=0;i<count;i++){
    confetti.push({
      x: cx + rand(-40, 40),
      y: cy + rand(-10, 10),
      vx: rand(-4.6, 4.6),
      vy: rand(-7.6, -2.8),
      g: rand(0.09, 0.15),
      w: rand(6, 11),
      h: rand(10, 18),
      r: rand(0, Math.PI),
      vr: rand(-0.2, 0.2),
      life: rand(70, 130)
    });
  }
}

function animConfetti(){
  cctx.clearRect(0,0,window.innerWidth, window.innerHeight);
  for(let i=confetti.length - 1; i>=0; i--){
    const p = confetti[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.r += p.vr;
    p.life -= 1;

    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.r);
    cctx.globalAlpha = Math.min(1, p.life/60);

    const g = cctx.createLinearGradient(-p.w, -p.h, p.w, p.h);
    g.addColorStop(0, "rgba(255,79,191,0.95)");
    g.addColorStop(1, "rgba(123,231,255,0.9)");
    cctx.fillStyle = g;
    cctx.shadowColor = "rgba(255,255,255,0.14)";
    cctx.shadowBlur = 10;
    cctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    cctx.restore();

    if(p.life <= 0 || p.y > window.innerHeight + 90){
      confetti.splice(i, 1);
    }
  }
  requestAnimationFrame(animConfetti);
}

// ---------- Timeline reveal ----------
function setupTimelineReveal(){
  const items = document.querySelectorAll(".t-item");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting){
        en.target.classList.add("show");
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach(i => obs.observe(i));
}

// init
safeResizeAll();
animHearts();
animConfetti();
