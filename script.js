// ---------- Page switching ----------
const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const btnArea = document.getElementById("btnArea");
const backBtn = document.getElementById("backBtn");

let dodgeCount = 0;
let yesScale = 1;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const rand = (min, max) => Math.random() * (max - min) + min;

function showPage2() {
  page1.classList.remove("active");
  page1.setAttribute("aria-hidden", "true");
  page2.classList.add("active");
  page2.setAttribute("aria-hidden", "false");

  // BIG celebration sequence
  megaCelebrate();

  // timeline
  setupTimelineReveal();

  // IMPORTANT: draw timeline AFTER layout is stable
  setTimeout(() => {
    animateTimelinePath();
    // in case fonts/images shift layout slightly:
    setTimeout(animateTimelinePath, 350);
  }, 450);
}

yesBtn?.addEventListener("click", showPage2);

backBtn?.addEventListener("click", () => {
  page2.classList.remove("active");
  page2.setAttribute("aria-hidden", "true");
  page1.classList.add("active");
  page1.setAttribute("aria-hidden", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ---------- NO button dodge ----------
function moveNoButton() {
  const rect = btnArea.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  const side = dodgeCount % 2 === 0 ? -1 : 1;

  let x = w / 2 + side * (w * 0.25) + (Math.random() * 40 - 20);
  let y = h / 2 + (Math.random() * 50 - 25);

  x = clamp(x, 75, w - 75);
  y = clamp(y, 45, h - 45);

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = `translate(-50%, -50%)`;

  dodgeCount++;

  yesScale = clamp(1 + dodgeCount * 0.09, 1, 2.0);
  yesBtn.style.transform = `scale(${yesScale})`;

  if (dodgeCount >= 6) {
    noBtn.style.opacity = "0.03";
    noBtn.style.zIndex = "1";
    noBtn.style.left = "50%";
    noBtn.style.top = "50%";
    noBtn.style.pointerEvents = "none";
    yesBtn.style.transform = `scale(2.05)`;
  }
}

noBtn?.addEventListener("mouseenter", moveNoButton);
noBtn?.addEventListener(
  "touchstart",
  (e) => {
    moveNoButton();
    e.preventDefault();
  },
  { passive: false }
);

btnArea?.addEventListener("mousemove", (e) => {
  const nb = noBtn.getBoundingClientRect();
  const dx = e.clientX - (nb.left + nb.width / 2);
  const dy = e.clientY - (nb.top + nb.height / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 95 && dodgeCount < 6) moveNoButton();
});

// ---------- Envelope: letter comes OUT ----------
const envBtn = document.getElementById("envBtn");
const letter = document.getElementById("letter");

envBtn?.addEventListener("click", () => {
  const open = envBtn.classList.toggle("open");
  envBtn.setAttribute("aria-expanded", open ? "true" : "false");

  if (open) {
    burstConfetti(140, window.innerWidth / 2, window.innerHeight / 3);
    burstHearts(18, window.innerWidth / 2, window.innerHeight / 3);

    setTimeout(() => {
      letter?.classList.add("show");
      letter?.setAttribute("aria-hidden", "false");
      letter?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 520);
  } else {
    letter?.classList.remove("show");
    letter?.setAttribute("aria-hidden", "true");
  }
});

// ---------- Canvases ----------
const heartsCanvas = document.getElementById("hearts");
const confCanvas = document.getElementById("confetti");

const hctx = heartsCanvas?.getContext("2d");
const cctx = confCanvas?.getContext("2d");

function resizeCanvas(c) {
  const dpr = window.devicePixelRatio || 1;
  c.width = window.innerWidth * dpr;
  c.height = window.innerHeight * dpr;
  c.style.width = window.innerWidth + "px";
  c.style.height = window.innerHeight + "px";
}

function setTransform(ctx) {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function safeResizeAll() {
  if (!heartsCanvas || !confCanvas || !hctx || !cctx) return;
  resizeCanvas(heartsCanvas);
  setTransform(hctx);
  resizeCanvas(confCanvas);
  setTransform(cctx);
}
window.addEventListener("resize", safeResizeAll);

// ---------- Floating hearts background ----------
const hearts = [];
const HEARTS_COUNT = 22;

function spawnHeart() {
  hearts.push({
    x: rand(0, window.innerWidth),
    y: window.innerHeight + rand(30, 240),
    vy: rand(0.25, 0.85),
    vx: rand(-0.2, 0.2),
    s: rand(10, 20),
    r: rand(-0.8, 0.8),
    vr: rand(-0.005, 0.005),
    a: rand(0.22, 0.55),
  });
}

function drawHeart(ctx, x, y, s, rot, a) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = a;

  ctx.beginPath();
  const t = s;
  ctx.moveTo(0, t / 4);
  ctx.bezierCurveTo(0, -t / 2, -t, -t / 2, -t, t / 6);
  ctx.bezierCurveTo(-t, t, 0, t * 1.15, 0, t * 1.45);
  ctx.bezierCurveTo(0, t * 1.15, t, t, t, t / 6);
  ctx.bezierCurveTo(t, -t / 2, 0, -t / 2, 0, t / 4);

  const g = ctx.createLinearGradient(-t, -t, t, t);
  g.addColorStop(0, "rgba(255,93,168,0.9)");
  g.addColorStop(1, "rgba(183,166,255,0.85)");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,93,168,0.20)";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.restore();
}

function animHearts() {
  if (!hctx) return;
  hctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const p of hearts) {
    p.x += p.vx;
    p.y -= p.vy;
    p.r += p.vr;
    drawHeart(hctx, p.x, p.y, p.s, p.r, p.a);

    if (p.y < -90) {
      p.y = window.innerHeight + rand(60, 220);
      p.x = rand(0, window.innerWidth);
      p.vy = rand(0.25, 0.85);
    }
  }
  requestAnimationFrame(animHearts);
}

// ---------- Confetti ----------
const confetti = [];

function burstConfetti(count = 160, cx = window.innerWidth / 2, cy = window.innerHeight / 3) {
  for (let i = 0; i < count; i++) {
    confetti.push({
      x: cx + rand(-60, 60),
      y: cy + rand(-20, 20),
      vx: rand(-5.2, 5.2),
      vy: rand(-8.5, -3.2),
      g: rand(0.1, 0.16),
      w: rand(5, 10),
      h: rand(10, 18),
      r: rand(0, Math.PI),
      vr: rand(-0.22, 0.22),
      life: rand(85, 150),
    });
  }
}

function burstHearts(count = 22, cx = window.innerWidth / 2, cy = window.innerHeight / 3) {
  for (let i = 0; i < count; i++) {
    hearts.push({
      x: cx + rand(-30, 30),
      y: cy + rand(-10, 10),
      vy: rand(1.0, 2.2),
      vx: rand(-1.6, 1.6),
      s: rand(14, 24),
      r: rand(-1.2, 1.2),
      vr: rand(-0.02, 0.02),
      a: rand(0.55, 0.9),
      pop: true,
      ttl: rand(70, 110),
    });
  }
}

function animConfetti() {
  if (!cctx) return;

  cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = confetti.length - 1; i >= 0; i--) {
    const p = confetti[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.r += p.vr;
    p.life -= 1;

    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.r);
    cctx.globalAlpha = Math.min(1, p.life / 70);

    const g = cctx.createLinearGradient(-p.w, -p.h, p.w, p.h);
    g.addColorStop(0, "rgba(255,93,168,0.95)");
    g.addColorStop(1, "rgba(183,166,255,0.9)");
    cctx.fillStyle = g;
    cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

    cctx.restore();

    if (p.life <= 0 || p.y > window.innerHeight + 100) confetti.splice(i, 1);
  }

  // fade out popped hearts faster
  for (const p of hearts) {
    if (p.pop) {
      p.x += p.vx;
      p.y -= p.vy;
      p.ttl -= 1;
      p.a *= 0.985;
      if (p.ttl <= 0) {
        p.pop = false;
        p.a = 0.25;
        p.vx = rand(-0.2, 0.2);
        p.vy = rand(0.25, 0.85);
      }
    }
  }

  requestAnimationFrame(animConfetti);
}

function megaCelebrate() {
  burstConfetti(220, window.innerWidth * 0.25, window.innerHeight * 0.35);
  burstConfetti(220, window.innerWidth * 0.75, window.innerHeight * 0.35);
  burstConfetti(260, window.innerWidth * 0.5, window.innerHeight * 0.25);
  burstHearts(26, window.innerWidth * 0.5, window.innerHeight * 0.32);

  setTimeout(() => burstConfetti(220, window.innerWidth * 0.5, window.innerHeight * 0.28), 220);
  setTimeout(() => burstHearts(18, window.innerWidth * 0.5, window.innerHeight * 0.30), 240);
}

// ---------- Timeline reveal + connecting path draw ----------
function setupTimelineReveal() {
  const items = document.querySelectorAll(".t-item");
  if (!items.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("show");
          obs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  items.forEach((i) => obs.observe(i));
}

function animateTimelinePath() {
  const svg = document.getElementById("timelinePath");
  const path = document.getElementById("tlPath") || document.querySelector("#timelinePath path");
  const wrap = document.querySelector(".timeline-wrap");

  if (!svg || !path || !wrap) return;

  // Make SVG height match the timeline area (so the line spans)
  const h = wrap.offsetHeight;
  svg.setAttribute("width", "40");
  svg.setAttribute("height", String(h));
  svg.setAttribute("viewBox", `0 0 40 ${h}`);

  // Draw animation
  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length}`;
  path.style.opacity = "1";
  path.style.transition = "none";

  // force layout repaint
  path.getBoundingClientRect();

  path.style.transition = "stroke-dashoffset 1.8s ease";
  path.style.strokeDashoffset = "0";
}

// init
safeResizeAll();
for (let i = 0; i < HEARTS_COUNT; i++) spawnHeart();
animHearts();
animConfetti();
