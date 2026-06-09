/* ============================================================
   Sadaat & Daniya — Luxury Digital Wedding Invitation
   ------------------------------------------------------------
   EDIT YOUR DETAILS in the WEDDING object below.
   ============================================================ */

const WEDDING = {
  partner1: "Sadaat",
  partner2: "Daniya",

  weddingDateISO: "2026-07-18T11:15:00", // Nikah day — drives the live countdown
  "date-long": "Saturday, July 18, 2026",

  "e1-name": "Haldi",
  "e1-when": "Friday, 17th July 2026",
  "e1-time": "6:00 PM onwards",
  "e1-venue": "116 Shady Pt Ct, Andice, TX 78628",

  "e2-name": "Nikah",
  "e2-when": "Saturday, 18th July 2026",
  "e2-time": "11:15 AM",
  "e2-venue": "11900 N Lamar Blvd, Austin, TX 78753",

  "e3-name": "Dinner",
  "e3-when": "Saturday, 18th July 2026",
  "e3-time": "7:00 PM onwards",
  "e3-venue": "NAMCC Event Hall, 11900 N Lamar Blvd, Austin, TX 78753",

  "dresscode-note": "Traditional & modest elegance kindly requested",
  "rsvp-deadline": "Kindly respond by July 1, 2026",

  // RSVP delivery (free, no server):
  //   1) Create a free form at https://formspree.io
  //   2) Paste the endpoint below (e.g. https://formspree.io/f/abcdwxyz)
  //   Leave empty ("") to use a mailto: fallback instead.
  formspreeEndpoint: "",
  contactEmail: "you@example.com",
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------- Populate fields from config ---------- */
function applyConfig() {
  document.querySelectorAll("[data-field]").forEach((el) => {
    const key = el.getAttribute("data-field");
    if (key === "partner1") el.textContent = WEDDING.partner1;
    else if (key === "partner2") el.textContent = WEDDING.partner2;
    else if (WEDDING[key] !== undefined) el.textContent = WEDDING[key];
  });
  document.title = `${WEDDING.partner1} & ${WEDDING.partner2} · Wedding`;
}

/* ============================================================
   Butterfly textures (procedural, luxury palette)
   ============================================================ */
const BFLY_PALETTE = [
  { fill: "#ffffff", edge: "#f0debf" }, // pearl white + gold edge
  { fill: "#f4cfd8", edge: "#e7b9c2" }, // soft blush
  { fill: "#ecd6a3", edge: "#cfae6a" }, // champagne gold
  { fill: "#f5ecd9", edge: "#e6d2a2" }, // ivory
  { fill: "#e7b9c2", edge: "#c98b96" }, // dusty rose
];
let butterflyTextures = [];

function buildButterflyTextures() {
  const S = 150;
  return BFLY_PALETTE.map((pal) => {
    const c = document.createElement("canvas");
    c.width = S; c.height = S;
    const x = c.getContext("2d");
    const cx = S / 2, cy = S / 2;

    const wing = (dx, dy, w, h, rot) => {
      x.save();
      x.translate(cx + dx, cy + dy);
      x.rotate(rot);
      const g = x.createRadialGradient(0, 0, 2, 0, 0, w);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(0.5, pal.fill);
      g.addColorStop(1, pal.edge);
      x.fillStyle = g;
      x.strokeStyle = "rgba(184,146,63,0.45)";
      x.lineWidth = 1.4;
      x.beginPath();
      x.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
      x.fill();
      x.stroke();
      x.restore();
    };

    // upper + lower wings (left & right)
    wing(-24, -16, 26, 20, -0.5);
    wing(24, -16, 26, 20, 0.5);
    wing(-20, 18, 19, 15, 0.6);
    wing(20, 18, 19, 15, -0.6);

    // body
    x.fillStyle = "#6a4a3a";
    x.beginPath();
    x.ellipse(cx, cy, 3.4, 24, 0, 0, Math.PI * 2);
    x.fill();
    // antennae
    x.strokeStyle = "#6a4a3a"; x.lineWidth = 1.4;
    x.beginPath();
    x.moveTo(cx, cy - 20); x.quadraticCurveTo(cx - 9, cy - 34, cx - 13, cy - 30);
    x.moveTo(cx, cy - 20); x.quadraticCurveTo(cx + 9, cy - 34, cx + 13, cy - 30);
    x.stroke();

    return { canvas: c, size: S };
  });
}

/* ============================================================
   COUNTDOWN
   ============================================================ */
function initCountdown() {
  const target = new Date(WEDDING.weddingDateISO).getTime();
  const els = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    minutes: document.querySelector('[data-cd="minutes"]'),
    seconds: document.querySelector('[data-cd="seconds"]'),
  };
  if (isNaN(target) || !els.days) return;
  const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      Object.values(els).forEach((e) => (e.textContent = "00"));
      clearInterval(timer);
      return;
    }
    els.days.textContent = pad(Math.floor(diff / 86400000));
    els.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    els.minutes.textContent = pad(Math.floor((diff % 3600000) / 60000));
    els.seconds.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  const timer = setInterval(tick, 1000);
}

/* ============================================================
   NAV
   ============================================================ */
function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ============================================================
   REVEAL ON SCROLL (GSAP ScrollTrigger if available, else IO)
   ============================================================ */
function initReveal() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    items.forEach((el) => {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1, y: 0, duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onStart: () => el.classList.add("is-visible"),
        }
      );
    });
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  items.forEach((el) => io.observe(el));
}

/* ============================================================
   PARALLAX (hero drifts gently on scroll)
   ============================================================ */
function initParallax() {
  if (reducedMotion) return;
  const oval = document.querySelector(".hero__oval");
  if (!oval) return;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        oval.style.transform = `translateY(${y * 0.12}px)`;
        oval.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.9)));
      }
      ticking = false;
    });
  }, { passive: true });
}

/* ============================================================
   FALLING PETALS (ambient background)
   ============================================================ */
function initPetals() {
  const canvas = document.getElementById("petalCanvas");
  if (!canvas || reducedMotion) return;
  const ctx = canvas.getContext("2d");
  let W, H, DPR, petals = [];
  const COLORS = ["#f5e2e6", "#e7b9c2", "#ecd6a3", "#f5ecd9", "#c98b96"];

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function make() {
    const count = Math.round(Math.min(34, Math.max(16, W / 46)));
    petals = [];
    for (let i = 0; i < count; i++) {
      petals.push({
        x: Math.random() * W, y: Math.random() * H,
        r: rand(5, 11), sp: rand(0.4, 1.3),
        sway: rand(0.4, 1.1), phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2, rotSp: rand(-0.02, 0.02),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        alpha: rand(0.25, 0.6),
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      p.y += p.sp; p.phase += 0.01; p.x += Math.sin(p.phase) * p.sway * 0.5; p.rot += p.rotSp;
      if (p.y - p.r > H) { p.y = -p.r * 2; p.x = Math.random() * W; }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.alpha;
      const g = ctx.createLinearGradient(0, -p.r, 0, p.r);
      g.addColorStop(0, "#ffffff"); g.addColorStop(1, p.color);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 0.62, p.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }
  resize(); make();
  window.addEventListener("resize", () => { resize(); make(); });
  requestAnimationFrame(draw);
}

/* ============================================================
   AMBIENT MUSIC
   ============================================================ */
let musicEl, musicBtn, musicReady = false;
function initMusic() {
  musicEl = document.getElementById("music");
  musicBtn = document.getElementById("musicToggle");
  if (!musicEl || !musicBtn) return;
  musicBtn.addEventListener("click", () => {
    if (musicEl.paused) startMusic(true);
    else { musicEl.pause(); musicBtn.classList.remove("is-playing"); }
  });
}
function startMusic(force) {
  if (!musicEl) return;
  musicEl.volume = 0;
  const p = musicEl.play();
  if (p && p.catch) {
    p.then(() => {
      musicReady = true;
      musicBtn.classList.add("is-playing");
      let v = 0;
      const ramp = setInterval(() => {
        v = Math.min(0.55, v + 0.04);
        musicEl.volume = v;
        if (v >= 0.55) clearInterval(ramp);
      }, 90);
    }).catch(() => {
      // No audio file / autoplay blocked — stay silent
      if (force) musicBtn.classList.remove("is-playing");
    });
  }
}

/* ============================================================
   RSVP
   ============================================================ */
function initRSVP() {
  const form = document.getElementById("rsvpForm");
  const status = document.getElementById("rsvpStatus");
  const attending = document.getElementById("attending");
  if (!form) return;

  form.querySelectorAll("[data-attend]").forEach((btn) => {
    btn.addEventListener("click", () => { if (attending) attending.value = btn.dataset.attend; });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "rsvp-status";
    status.textContent = "";

    let valid = true;
    ["name", "email"].forEach((id) => {
      const el = form.elements[id];
      if (!el.value.trim()) { el.classList.add("invalid"); valid = false; }
      else el.classList.remove("invalid");
    });
    const email = form.elements["email"];
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add("invalid"); valid = false;
    }
    if (!attending.value) attending.value = "yes";
    if (!valid) {
      status.classList.add("is-error");
      status.textContent = "Please share your name and a valid email.";
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    try {
      if (WEDDING.formspreeEndpoint) {
        const res = await fetch(WEDDING.formspreeEndpoint, {
          method: "POST", headers: { Accept: "application/json" }, body: new FormData(form),
        });
        if (!res.ok) throw new Error("bad response");
      } else {
        const subject = encodeURIComponent(`RSVP — ${data.name}`);
        const body = encodeURIComponent(
          `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "-"}\nAttending: ${data.attending}\nGuests: ${data.guests}\nNote: ${data.message || "-"}`
        );
        window.location.href = `mailto:${WEDDING.contactEmail}?subject=${subject}&body=${body}`;
      }
      status.classList.add("is-success");
      status.textContent = data.attending === "no"
        ? "Thank you for letting us know — you will be dearly missed."
        : "Thank you! We can't wait to celebrate with you, In Sha Allah.";
      if (data.attending !== "no") flyButterfliesAcross();
      form.reset();
      attending.value = "";
    } catch (err) {
      status.classList.add("is-error");
      status.textContent = "Something went wrong — please try again or email us directly.";
    }
  });
}

/* ---------- Butterflies sweep across on RSVP success ---------- */
function flyButterfliesAcross() {
  const canvas = document.getElementById("fxCanvas");
  if (!canvas || reducedMotion || !butterflyTextures.length) return;
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const W = window.innerWidth, H = window.innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const flock = [];
  for (let i = 0; i < 26; i++) {
    flock.push({
      x: rand(-160, -20), y: rand(H * 0.15, H * 0.85),
      vx: rand(5, 9), amp: rand(20, 60), freq: rand(0.02, 0.05),
      phase: Math.random() * Math.PI * 2, size: rand(26, 52),
      flap: Math.random() * Math.PI * 2, flapSpeed: rand(10, 16),
      tex: butterflyTextures[(Math.random() * butterflyTextures.length) | 0],
    });
  }
  let t = 0, raf;
  function frame() {
    t++; ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const b of flock) {
      b.x += b.vx; b.phase += b.freq; b.flap += b.flapSpeed / 60;
      const y = b.y + Math.sin(b.phase) * b.amp;
      if (b.x < W + 120) alive = true;
      const sx = 0.45 + 0.55 * Math.abs(Math.sin(b.flap));
      const ar = b.tex.size, w = b.size, h = b.size;
      ctx.save();
      ctx.translate(b.x, y); ctx.scale(sx, 1);
      ctx.drawImage(b.tex.canvas, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    if (alive && t < 600) raf = requestAnimationFrame(frame);
    else { cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); }
  }
  frame();
}

/* ============================================================
   LOADER
   ============================================================ */
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  const hide = () => loader.classList.add("is-done");
  if (document.readyState === "complete") setTimeout(hide, 600);
  else window.addEventListener("load", () => setTimeout(hide, 500));
  setTimeout(hide, 4000); // safety
}

/* ============================================================
   CINEMATIC INTRO
   ============================================================ */
function initIntro() {
  const intro = document.getElementById("intro");
  const envScene = document.getElementById("envScene");
  const envCard = document.getElementById("envCard");
  const seal = document.getElementById("waxSeal");
  const hint = document.getElementById("envHint");
  const curtains = document.getElementById("curtains");
  const canvas = document.getElementById("introCanvas");
  const names = document.getElementById("introNames");
  const body = document.body;

  if (!intro || !envCard) { body.classList.remove("intro-active"); return; }

  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, A = 0, B = 0;
  let particles = [], sparks = [];
  let raf = 0, startTime = 0, dispersed = false, canvasAlpha = 1;

  const T_BURST = 850;
  const T_ARRANGE = 2700;
  const T_NAMES = 2900;
  const T_DISPERSE = 6300;
  const T_FINISH = 8300;

  function finish() {
    intro.classList.add("is-done");
    body.classList.remove("intro-active");
    window.scrollTo({ top: 0, behavior: "auto" });
    setTimeout(() => intro.remove(), 1000);
  }

  function resize() {
    if (!ctx) return;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H * 0.44;
    A = Math.min(W * 0.32, 360); B = Math.min(H * 0.30, 300);
  }

  function makeParticles(count) {
    const ovalCount = Math.round(count * 0.55);
    particles = [];
    for (let i = 0; i < count; i++) {
      const isOval = i < ovalCount;
      let tx, ty;
      if (isOval) {
        const ring = i % 3;
        const ang = (i / ovalCount) * Math.PI * 2;
        const ra = A * (1 + ring * 0.13) + rand(-12, 12);
        const rb = B * (1 + ring * 0.13) + rand(-12, 12);
        tx = cx + Math.cos(ang) * ra;
        ty = cy + Math.sin(ang) * rb;
      } else {
        tx = rand(0.03, 0.97) * W; ty = rand(0.05, 0.95) * H;
        for (let tries = 0; tries < 6; tries++) {
          const nx = (tx - cx) / (A * 0.95), ny = (ty - cy) / (B * 0.95);
          if (nx * nx + ny * ny > 1.05) break;
          tx = rand(0.03, 0.97) * W; ty = rand(0.05, 0.95) * H;
        }
      }
      const depth = rand(0.45, 1);
      const base = isOval ? rand(26, 44) : rand(18, 50);
      const p = {
        x: cx + rand(-26, 26), y: cy + rand(-18, 18),
        tx, ty, isOval, depth,
        size: base * (0.65 + 0.35 * depth),
        alpha: 0.45 + 0.55 * depth,
        rot: rand(-0.5, 0.5), rotSpeed: rand(-0.7, 0.7),
        flap: Math.random() * Math.PI * 2, flapSpeed: rand(9, 16) * (0.8 + 0.4 * depth),
        tex: (Math.random() * butterflyTextures.length) | 0,
        driftA: Math.random() * Math.PI * 2,
        driftR: (isOval ? rand(5, 12) : rand(10, 26)) * depth,
        driftS: rand(0.5, 1.2),
        bvx: 0, bvy: 0, dvx: 0, dvy: 0,
      };
      const a = Math.atan2(p.y - cy, p.x - cx) + rand(-0.5, 0.5);
      const spd = rand(8, 18) * (0.7 + 0.5 * depth);
      p.bvx = Math.cos(a) * spd; p.bvy = Math.sin(a) * spd;
      particles.push(p);
    }
    // sort by depth so far (small) butterflies draw first → parallax depth
    particles.sort((m, n) => m.depth - n.depth);
  }

  function makeSparks(n) {
    sparks = [];
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), spd = rand(2, 9);
      sparks.push({
        x: cx + rand(-20, 20), y: cy + rand(-14, 14),
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - rand(0, 3),
        r: rand(1.5, 4), life: 1, decay: rand(0.008, 0.02),
        color: Math.random() < 0.5 ? "#fff4d6" : "#ffffff",
      });
    }
  }

  function drawButterfly(p) {
    const tex = butterflyTextures[p.tex];
    if (!tex) return;
    const sx = 0.42 + 0.58 * Math.abs(Math.sin(p.flap));
    ctx.save();
    ctx.globalAlpha = canvasAlpha * p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(sx, 1);
    ctx.drawImage(tex.canvas, -p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  }

  function frame(now) {
    if (!startTime) startTime = now;
    const t = now - startTime;
    const dt = 1 / 60;
    ctx.clearRect(0, 0, W, H);

    // magical sparks
    if (sparks.length) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const s of sparks) {
        s.x += s.vx; s.y += s.vy; s.vy += 0.04; s.life -= s.decay;
        if (s.life <= 0) continue;
        ctx.globalAlpha = Math.max(0, s.life) * canvasAlpha;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        g.addColorStop(0, s.color); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      sparks = sparks.filter((s) => s.life > 0);
    }

    for (const p of particles) {
      p.flap += p.flapSpeed * dt;
      if (t < T_BURST) {
        p.x += p.bvx; p.y += p.bvy; p.bvx *= 0.93; p.bvy *= 0.93;
        p.rot += p.rotSpeed * dt;
      } else if (!dispersed) {
        const arranged = t >= T_ARRANGE;
        const dox = arranged ? Math.cos(p.driftA + t * 0.001 * p.driftS) * p.driftR : 0;
        const doy = arranged ? Math.sin(p.driftA + t * 0.0013 * p.driftS) * p.driftR : 0;
        const ease = 0.055;
        p.x += (p.tx + dox - p.x) * ease;
        p.y += (p.ty + doy - p.y) * ease;
        p.rot += (Math.sin(p.flap * 0.08) * 0.18 - p.rot) * 0.04;
      } else {
        p.x += p.dvx; p.y += p.dvy; p.dvy += 0.05;
        p.rot += p.rotSpeed * dt;
      }
      drawButterfly(p);
    }

    ctx.globalAlpha = 1;
    if (dispersed) canvasAlpha = Math.max(0, canvasAlpha - 0.012);
    raf = requestAnimationFrame(frame);
  }

  const onResize = () => resize();

  function runCanvasIntro() {
    if (!ctx) { setTimeout(finish, 1400); return; }
    resize();
    window.addEventListener("resize", onResize);
    const count = Math.max(180, Math.min(400, Math.round((W * H) / 4600)));
    makeParticles(count);
    makeSparks(110);
    startTime = 0;
    raf = requestAnimationFrame(frame);

    setTimeout(() => { if (names) names.classList.add("show"); }, T_NAMES);

    setTimeout(() => {
      dispersed = true;
      for (const p of particles) {
        const a = Math.atan2(p.y - cy, p.x - cx) + rand(-0.3, 0.3);
        const spd = rand(10, 22);
        p.dvx = Math.cos(a) * spd; p.dvy = Math.sin(a) * spd - rand(0, 4);
      }
    }, T_DISPERSE);

    setTimeout(finish, T_FINISH);
    setTimeout(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    }, T_FINISH + 1400);
  }

  let opened = false;
  function open() {
    if (opened) return;
    opened = true;
    if (hint) hint.classList.add("is-hidden");
    startMusic(false);

    // 1) seal cracks
    if (seal) seal.classList.add("is-cracked");

    if (reducedMotion || !ctx) {
      if (envScene) envScene.classList.add("gone");
      if (names) names.classList.add("show");
      setTimeout(finish, 1400);
      return;
    }

    // 2) card lifts away, curtains appear (closed)
    setTimeout(() => {
      if (envScene) envScene.classList.add("gone");
      if (curtains) curtains.classList.add("is-visible");
    }, 560);

    // 3) curtains part + butterflies pour out
    setTimeout(() => {
      if (curtains) curtains.classList.add("is-open");
      runCanvasIntro();
    }, 1100);
  }

  if (seal) seal.addEventListener("click", (e) => { e.stopPropagation(); open(); });
  envCard.addEventListener("click", open);
  envCard.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  butterflyTextures = buildButterflyTextures();
  applyConfig();
  initLoader();
  initIntro();
  initCountdown();
  initNav();
  initReveal();
  initParallax();
  initPetals();
  initMusic();
  initRSVP();
});
