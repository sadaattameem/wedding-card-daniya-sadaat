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

  // Background music — add your legally purchased MP3 to this path:
  musicFile: "music/i-found-love.mp3",
  musicTitle: "Perfect — Ed Sheeran",
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a, b) => a + Math.random() * (b - a);

function withGSAP(fn) {
  if (window.gsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    return fn(gsap, window.ScrollTrigger);
  }
  return null;
}

/** Animate a countdown digit change (gsap-core: autoAlpha + transform aliases). */
function flipCountdownDigit(el, next) {
  const padded = String(next).padStart(2, "0");
  if (el.textContent === padded) return;
  if (!window.gsap || reducedMotion) {
    el.textContent = padded;
    return;
  }
  gsap.fromTo(el,
    { y: -10, autoAlpha: 0 },
    {
      y: 0, autoAlpha: 1, duration: 0.38, ease: "power2.out",
      onStart: () => { el.textContent = padded; },
    }
  );
}

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

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      Object.values(els).forEach((e) => (e.textContent = "00"));
      clearInterval(timer);
      return;
    }
    flipCountdownDigit(els.days, Math.floor(diff / 86400000));
    flipCountdownDigit(els.hours, Math.floor((diff % 86400000) / 3600000));
    flipCountdownDigit(els.minutes, Math.floor((diff % 3600000) / 60000));
    flipCountdownDigit(els.seconds, Math.floor((diff % 60000) / 1000));
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
   REVEAL ON SCROLL — ScrollTrigger.batch + gsap.matchMedia
   ============================================================ */
/** Hero sits at the top — reveal it when the intro hands off (scroll triggers miss it). */
function revealHero() {
  const heroItems = document.querySelectorAll("#hero .reveal");
  if (!heroItems.length) return;
  heroItems.forEach((el) => el.classList.add("is-visible"));
  if (window.gsap) {
    gsap.to(heroItems, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: "power2.out", stagger: 0.12,
      onComplete: () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); },
    });
  }
}

function initReveal() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  const usedGSAP = withGSAP((gsap, ScrollTrigger) => {
    // Hero is above the fold — hide only non-hero sections until scroll
    const scrollItems = items.filter((el) => !el.closest("#hero"));
    gsap.set(scrollItems, { autoAlpha: 0, y: 36 });
    gsap.set("#hero .reveal", { autoAlpha: 0, y: 24 });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".reveal", { autoAlpha: 1, y: 0, clearProps: "transform" });
      items.forEach((el) => el.classList.add("is-visible"));
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.batch(scrollItems, {
        start: "top 85%",
        once: true,
        onEnter: (elements) => {
          elements.forEach((el) => el.classList.add("is-visible"));
          gsap.to(elements, {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            stagger: { each: 0.1, from: "start" },
          });
        },
      });
    });
    return true;
  });

  if (usedGSAP) return;

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
   PARALLAX — ScrollTrigger scrub (replaces scroll listener)
   ============================================================ */
function initParallax() {
  const oval = document.querySelector(".hero__oval");
  const hero = document.getElementById("hero");
  if (!oval || !hero) return;

  withGSAP((gsap, ScrollTrigger) => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(oval, { autoAlpha: 1, y: 0 });
      gsap.to(oval, {
        y: () => window.innerHeight * 0.12,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  });
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
   BACKGROUND MUSIC (your MP3) + CINEMATIC SFX
   ============================================================ */
const BackgroundMusic = {
  el: null, ready: false, playing: false, maxVol: 0.72, swellRaf: 0,

  init() {
    this.el = document.getElementById("music");
    if (!this.el || !WEDDING.musicFile) return;
    const src = this.el.querySelector("source");
    if (src) src.src = WEDDING.musicFile;
    this.el.load();
    this.el.addEventListener("canplaythrough", () => { this.ready = true; }, { once: true });
    this.el.addEventListener("error", () => { this.ready = false; });
  },

  targetVol(level) {
    return Math.min(this.maxVol, 0.06 + level * 0.66);
  },

  swell(level, durationSec = 2.4) {
    if (!this.el || !this.playing) return;
    const target = this.targetVol(level);
    const start = this.el.volume;
    const t0 = performance.now();
    const dur = durationSec * 1000;
    cancelAnimationFrame(this.swellRaf);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const ease = p * p * (3 - 2 * p);
      this.el.volume = start + (target - start) * ease;
      if (p < 1) this.swellRaf = requestAnimationFrame(step);
    };
    this.swellRaf = requestAnimationFrame(step);
  },

  async play(startLevel = 0.12) {
    if (!this.el) return false;
    this.el.volume = this.targetVol(startLevel);
    try {
      await this.el.play();
      this.playing = true;
      if (musicBtn) musicBtn.classList.add("is-playing");
      return true;
    } catch (_) {
      this.playing = false;
      if (musicBtn) musicBtn.classList.remove("is-playing");
      return false;
    }
  },

  pause() {
    if (!this.el) return;
    cancelAnimationFrame(this.swellRaf);
    this.el.pause();
    this.playing = false;
    if (musicBtn) musicBtn.classList.remove("is-playing");
  },

  toggle() {
    if (this.playing) this.pause();
    else this.play().then((ok) => { if (ok) this.swell(0.55, 1.8); });
  },
};

const CinematicAudio = {
  ctx: null, master: null, sfxGain: null,

  init() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.85;
    this.master.connect(this.ctx.destination);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.7;
    this.sfxGain.connect(this.master);
    return this.ctx;
  },

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === "suspended") return this.ctx.resume();
    return Promise.resolve();
  },

  /** Fade background track during the cinematic intro (0 = quiet … 1 = full). */
  swellMusic(level, durationSec = 2.4) {
    BackgroundMusic.swell(level, durationSec);
  },

  playCrack() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    src.connect(g); g.connect(this.sfxGain);
    src.start(t);
  },

  playWhoosh() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 1.2, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.setValueAtTime(400, t);
    filt.frequency.exponentialRampToValueAtTime(2400, t + 0.8);
    filt.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    src.connect(filt); filt.connect(g); g.connect(this.sfxGain);
    src.start(t);
  },

  playShimmer() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [1046.5, 1318.5, 1568.0].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0, t + i * 0.05);
      g.gain.linearRampToValueAtTime(0.06, t + i * 0.05 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 1.2);
      o.connect(g); g.connect(this.sfxGain);
      o.start(t + i * 0.05); o.stop(t + i * 0.05 + 1.3);
    });
  },

};

let musicBtn;
function initMusic() {
  musicBtn = document.getElementById("musicToggle");
  BackgroundMusic.init();
  if (!musicBtn) return;
  musicBtn.addEventListener("click", () => BackgroundMusic.toggle());
}
function startMusic() {
  CinematicAudio.init();
  CinematicAudio.resume();
  BackgroundMusic.play(0.08).then((ok) => {
    if (ok) BackgroundMusic.swell(0.18, 2.2);
  });
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
   AMBIENT PARTICLES (idle intro atmosphere)
   ============================================================ */
function initAmbientParticles() {
  const canvas = document.getElementById("ambientCanvas");
  if (!canvas || reducedMotion) return;
  const ctx = canvas.getContext("2d");
  let W, H, DPR, dots = [];

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.round(Math.min(48, Math.max(22, W / 38)));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: rand(1, 2.8), sp: rand(0.15, 0.55),
      ph: Math.random() * Math.PI * 2,
      a: rand(0.15, 0.45),
      hue: Math.random() < 0.5 ? "#fff4d6" : "#f5e2e6",
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.y -= d.sp; d.ph += 0.012; d.x += Math.sin(d.ph) * 0.25;
      if (d.y < -4) { d.y = H + 4; d.x = Math.random() * W; }
      ctx.globalAlpha = d.a;
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 3);
      g.addColorStop(0, d.hue); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!document.getElementById("intro")?.classList.contains("is-done")) {
      requestAnimationFrame(draw);
    }
  }
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

/* ============================================================
   CINEMATIC INTRO — GSAP timeline + butterfly swarm
   ============================================================ */
function initIntro() {
  const intro = document.getElementById("intro");
  const stage = document.getElementById("cinematicStage");
  const envelope = document.getElementById("luxuryEnvelope");
  const seal = document.getElementById("waxSeal");
  const shards = document.getElementById("sealShards");
  const hint = document.getElementById("envHint");
  const curtains = document.getElementById("curtains");
  const canvas = document.getElementById("introCanvas");
  const names = document.getElementById("introNames");
  const body = document.body;

  if (!intro || !envelope) { body.classList.remove("intro-active"); return; }

  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, A = 0, B = 0;
  let particles = [], sparks = [], goldDust = [];
  let raf = 0, startTime = 0, dispersed = false, canvasAlpha = 1;

  const T_BURST = 900, T_ARRANGE = 3000, T_NAMES = 3200, T_DISPERSE = 7000, T_FINISH = 9200;

  function finish() {
    intro.classList.add("is-done");
    body.classList.remove("intro-active");
    window.scrollTo({ top: 0, behavior: "auto" });
    revealHero();
    setTimeout(() => {
      intro.remove();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 1100);
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
        tx = cx + Math.cos(ang) * (A * (1 + ring * 0.13) + rand(-12, 12));
        ty = cy + Math.sin(ang) * (B * (1 + ring * 0.13) + rand(-12, 12));
      } else {
        tx = rand(0.03, 0.97) * W; ty = rand(0.05, 0.95) * H;
      }
      const depth = rand(0.45, 1);
      const p = {
        x: cx + rand(-26, 26), y: cy + rand(-18, 18), tx, ty, isOval, depth,
        size: (isOval ? rand(26, 44) : rand(18, 50)) * (0.65 + 0.35 * depth),
        alpha: 0.45 + 0.55 * depth,
        rot: rand(-0.5, 0.5), rotSpeed: rand(-0.7, 0.7),
        flap: Math.random() * Math.PI * 2, flapSpeed: rand(9, 16) * (0.8 + 0.4 * depth),
        tex: (Math.random() * butterflyTextures.length) | 0,
        driftA: Math.random() * Math.PI * 2,
        driftR: (isOval ? rand(5, 12) : rand(10, 26)) * depth,
        driftS: rand(0.5, 1.2), bvx: 0, bvy: 0, dvx: 0, dvy: 0,
      };
      const a = Math.atan2(p.y - cy, p.x - cx) + rand(-0.5, 0.5);
      const spd = rand(8, 18) * (0.7 + 0.5 * depth);
      p.bvx = Math.cos(a) * spd; p.bvy = Math.sin(a) * spd;
      particles.push(p);
    }
    particles.sort((m, n) => m.depth - n.depth);
  }

  function makeSparks(n) {
    sparks = [];
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), spd = rand(2, 11);
      sparks.push({
        x: cx + rand(-30, 30), y: cy + rand(-20, 20),
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - rand(0, 4),
        r: rand(1.5, 5), life: 1, decay: rand(0.006, 0.018),
        color: Math.random() < 0.6 ? "#fff4d6" : "#ffffff",
      });
    }
  }

  function makeGoldDust(n) {
    goldDust = [];
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), spd = rand(3, 14);
      goldDust.push({
        x: cx, y: cy, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - rand(2, 6),
        r: rand(1, 3), life: 1, decay: rand(0.004, 0.012),
      });
    }
  }

  function drawButterfly(p) {
    const tex = butterflyTextures[p.tex];
    if (!tex) return;
    const sx = 0.42 + 0.58 * Math.abs(Math.sin(p.flap));
    ctx.save();
    ctx.globalAlpha = canvasAlpha * p.alpha;
    ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(sx, 1);
    ctx.drawImage(tex.canvas, -p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  }

  function frame(now) {
    if (!startTime) startTime = now;
    const t = now - startTime;
    const dt = 1 / 60;
    ctx.clearRect(0, 0, W, H);

    if (goldDust.length) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (const g of goldDust) {
        g.x += g.vx; g.y += g.vy; g.vy += 0.06; g.life -= g.decay;
        if (g.life <= 0) continue;
        ctx.globalAlpha = g.life * canvasAlpha;
        ctx.fillStyle = "#ffd878";
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      goldDust = goldDust.filter((g) => g.life > 0);
    }

    if (sparks.length) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (const s of sparks) {
        s.x += s.vx; s.y += s.vy; s.vy += 0.04; s.life -= s.decay;
        if (s.life <= 0) continue;
        ctx.globalAlpha = Math.max(0, s.life) * canvasAlpha;
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        grd.addColorStop(0, s.color); grd.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grd;
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
        p.x += (p.tx + dox - p.x) * 0.055;
        p.y += (p.ty + doy - p.y) * 0.055;
        p.rot += (Math.sin(p.flap * 0.08) * 0.18 - p.rot) * 0.04;
      } else {
        p.x += p.dvx; p.y += p.dvy; p.dvy += 0.05; p.rot += p.rotSpeed * dt;
      }
      drawButterfly(p);
    }
    ctx.globalAlpha = 1;
    if (dispersed) canvasAlpha = Math.max(0, canvasAlpha - 0.01);
    raf = requestAnimationFrame(frame);
  }

  const onResize = () => resize();

  function startBurstFX() {
    if (!ctx) return;
    resize();
    window.addEventListener("resize", onResize);
    makeGoldDust(90);
    makeSparks(110);
    if (!raf) {
      startTime = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  function runCanvasIntro() {
    if (!ctx) { setTimeout(finish, 1400); return; }
    resize();
    if (!raf) window.addEventListener("resize", onResize);
    const count = Math.max(200, Math.min(400, Math.round((W * H) / 4400)));
    makeParticles(count);
    makeSparks(60);
    makeGoldDust(40);
    if (!raf) {
      startTime = performance.now();
      raf = requestAnimationFrame(frame);
    }
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

  function spawnSealShards() {
    if (!shards || !seal) return;
    shards.innerHTML = "";
    const offsets = [
      { x: -28, y: -22, r: -35, clip: "polygon(0 0, 100% 0, 50% 100%)" },
      { x: 30, y: -18, r: 40, clip: "polygon(0 0, 100% 50%, 0 100%)" },
      { x: 24, y: 26, r: 55, clip: "polygon(100% 0, 100% 100%, 0 50%)" },
      { x: -26, y: 24, r: -50, clip: "polygon(0 0, 100% 100%, 0 100%)" },
      { x: 0, y: -34, r: 12, clip: "polygon(50% 0, 100% 100%, 0 100%)" },
      { x: -12, y: 8, r: -20, clip: "polygon(0 0, 100% 0, 100% 100%)" },
      { x: 14, y: 6, r: 28, clip: "polygon(0 0, 100% 50%, 50% 100%)" },
      { x: 0, y: 30, r: -8, clip: "polygon(0 0, 100% 0, 50% 100%)" },
    ];
    offsets.forEach((o, i) => {
      const el = document.createElement("span");
      el.className = "seal-shard";
      el.style.clipPath = o.clip;
      el.style.backgroundPosition = `${50 + (i % 3) * 8}% ${50 + (i % 2) * 10}%`;
      shards.appendChild(el);
      if (window.gsap) {
        gsap.set(el, { x: 0, y: 0, rotation: 0, opacity: 0 });
        gsap.to(el, {
          opacity: 1, x: o.x * 2.2, y: o.y * 2.2, rotation: o.r,
          duration: 0.9, delay: 0.05 * i, ease: "power3.out",
          onStart: () => el.classList.add("is-flying"),
        });
        gsap.to(el, { opacity: 0, y: o.y * 2.2 + 40, duration: 0.6, delay: 0.7 + i * 0.04, ease: "power2.in" });
      } else {
        el.classList.add("is-flying");
        el.style.transform = `translate(calc(-50% + ${o.x * 2}px), calc(-50% + ${o.y * 2}px)) rotate(${o.r}deg)`;
        el.style.opacity = "0";
        setTimeout(() => { el.style.opacity = "1"; }, i * 50);
        setTimeout(() => { el.style.opacity = "0"; }, 900 + i * 40);
      }
    });
  }

  function runCinematicTimeline() {
    CinematicAudio.init();
    CinematicAudio.resume();
    startMusic();

    if (reducedMotion || !window.gsap) {
      if (seal) { seal.classList.add("is-glowing", "is-cracking", "is-shattered"); }
      envelope.classList.add("is-shaking", "is-open", "is-gone");
      if (curtains) curtains.classList.add("is-visible", "is-open", "is-blazing");
      if (names) names.classList.add("show");
      CinematicAudio.swellMusic(0.85, 1.5);
      setTimeout(runCanvasIntro, 400);
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // 1) Seal glows with golden light
    tl.call(() => seal.classList.add("is-glowing"), null, 0);
    tl.to(".wax-seal__glow", { scale: 1.15, duration: 1.2, ease: "sine.inOut", repeat: 1, yoyo: true }, 0);
    tl.call(() => CinematicAudio.playShimmer(), null, 0.3);

    // 2) Cracks spread in slow motion
    tl.call(() => seal.classList.add("is-cracking"), null, 0.6);
    tl.to(".wax-seal__cracks .crack", {
      strokeDashoffset: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: "power1.out",
    }, 0.7);

    // 3) Seal shatters + crack SFX
    tl.call(() => {
      CinematicAudio.playCrack();
      CinematicAudio.swellMusic(0.42, 1.8);
      seal.classList.add("is-shattered");
      spawnSealShards();
    }, null, 2.0);

    // 4) Envelope vibrates — magic waiting inside
    tl.call(() => {
      envelope.classList.add("is-shaking");
      CinematicAudio.playShimmer();
    }, null, 2.5);
    tl.to(envelope, { x: 0, duration: 0.55 }, 2.5);

    // 5) Flap opens dramatically + camera zooms in
    tl.call(() => envelope.classList.add("is-open"), null, 3.2);
    tl.to(stage, { scale: 1.14, duration: 2.8, ease: "power1.inOut" }, 3.0);
    tl.call(() => CinematicAudio.swellMusic(0.62, 2.2), null, 3.4);

    // 6) Golden burst from envelope interior
    tl.call(() => {
      startBurstFX();
      CinematicAudio.playShimmer();
    }, null, 4.0);

    // 7) Envelope fades — royal curtains appear
    tl.call(() => {
      envelope.classList.add("is-gone");
      if (curtains) curtains.classList.add("is-visible");
    }, null, 4.6);

    // 8) Curtains part — cinematic trailer moment
    tl.call(() => {
      if (curtains) curtains.classList.add("is-open", "is-blazing");
      CinematicAudio.playWhoosh();
      CinematicAudio.swellMusic(1.0, 2.8);
      CinematicAudio.playShimmer();
    }, null, 5.4);

    // 9) Butterfly swarm + names reveal
    tl.call(runCanvasIntro, null, 6.0);
  }

  let opened = false;
  function open(e) {
    if (opened) return;
    opened = true;
    if (e) e.stopPropagation();
    if (hint) hint.classList.add("is-hidden");
    runCinematicTimeline();
  }

  if (seal) seal.addEventListener("click", open);
  envelope.addEventListener("click", (e) => {
    if (e.target === seal || seal?.contains(e.target)) return;
    open(e);
  });
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); }
  });

  initAmbientParticles();
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
