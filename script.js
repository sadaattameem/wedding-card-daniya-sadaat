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

  // RSVP → Google Sheet (recommended): deploy google-apps-script/rsvp-to-sheet.gs
  // and paste your Web app URL below (ends with /exec).
  rsvpSheetEndpoint: "https://script.google.com/macros/s/AKfycbw5PVJ_NskpyMpBDip1FhCc4yeMblg8ix2aJ1a_uKS5EY_hAlch5snkTAHA7xH5wESU/exec",
  // Optional Formspree fallback if rsvpSheetEndpoint is empty.
  formspreeEndpoint: "",
  contactEmail: "you@example.com",

  musicFile: "music/wedding-song.mp4",
  musicTitle: "Our song",
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 768px)").matches;
const isNarrow = window.matchMedia("(max-width: 480px)").matches;
const rand = (a, b) => a + Math.random() * (b - a);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
const lerpFactor = (rate, dt) => 1 - Math.pow(1 - rate, dt * 60);

function canvasDPR() {
  if (isNarrow) return 1;
  if (isMobile) return Math.min(1.25, window.devicePixelRatio || 1);
  return Math.min(1.5, window.devicePixelRatio || 1);
}

function butterflyCount() {
  const area = window.innerWidth * window.innerHeight;
  if (isNarrow) return Math.max(70, Math.min(130, Math.round(area / 7200)));
  if (isMobile) return Math.max(95, Math.min(200, Math.round(area / 5500)));
  return Math.max(180, Math.min(340, Math.round(area / 4200)));
}

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
  { fill: "#e8c4cc", edge: "#c98b96" }, // deeper blush
  { fill: "#b8c8a4", edge: "#8fa87a" }, // deeper sage
  { fill: "#d4a0ac", edge: "#b07080" }, // dusty rose
  { fill: "#c4b0d0", edge: "#9a88b0" }, // deeper lavender
  { fill: "#ddd0c4", edge: "#b8a898" }, // warm ivory
];
let butterflyTextures = [];
let heartTextures = [];

const RSVP_HEART_COLORS = [
  "#dc2626", "#ef4444", "#f43f5e", "#e63946", "#b91c1c",
  "#ff4d6d", "#ff758f", "#fb6f92", "#f72585", "#ff006e",
  "#c1121f", "#d00000", "#9d0208", "#ff0a54", "#e5383b",
  "#ff1744", "#c9184a", "#a4133c", "#ff758f", "#e63946",
  "#b5179e", "#7209b7", "#9b5de5", "#4895ef", "#4cc9f0",
  "#06d6a0", "#2ec4b6", "#ffd166", "#f4a261", "#ff9f1c",
];

const RSVP_CONFETTI_COLORS = [
  "#dc2626", "#ef4444", "#e63946", "#ff4d6d", "#f72585",
  "#ff006e", "#c1121f", "#ff758f", "#ffd166", "#06d6a0",
  "#4895ef", "#b5179e", "#4cc9f0", "#ff9f1c", "#9b5de5",
  "#2ec4b6", "#fb5607", "#ffbe0b", "#3a86ff", "#ff0a54",
];

const RSVP_RED_HEART_COUNT = 20;

const FLOWER_PALETTES = [
  { fill: "#f8d8e4", accent: "#e8a8be" }, // blush
  { fill: "#f5dcc4", accent: "#e0b896" }, // peach
  { fill: "#ddd4f0", accent: "#b8a8d8" }, // lilac
  { fill: "#cce4c4", accent: "#9cc49a" }, // sage
  { fill: "#f0e4b8", accent: "#d8c080" }, // butter
  { fill: "#f0c8dc", accent: "#d8a0b8" }, // rose
  { fill: "#c8d8f4", accent: "#98b8e0" }, // sky
  { fill: "#ecd8c0", accent: "#d0b898" }, // champagne
];

const FLOWER_TYPES = ["blossom", "blossom", "floret", "daisy", "bloom", "petal", "petal"];

function drawSoftPetalPath(ctx, w, h) {
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.48);
  ctx.bezierCurveTo(w * 0.62, -h * 0.22, w * 0.5, h * 0.18, 0, h * 0.32);
  ctx.bezierCurveTo(-w * 0.5, h * 0.18, -w * 0.62, -h * 0.22, 0, -h * 0.48);
  ctx.closePath();
}

function drawFlowerBlossom(ctx, size, fill, accent) {
  const petalW = size * 0.2;
  const petalH = size * 0.4;
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 5);
    ctx.fillStyle = fill;
    drawSoftPetalPath(ctx, petalW, petalH);
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
}

function drawFlowerFloret(ctx, size, fill, accent) {
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 4 + Math.PI / 4);
    ctx.fillStyle = fill;
    drawSoftPetalPath(ctx, size * 0.17, size * 0.3);
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
}

function drawFlowerDaisy(ctx, size, fill, accent) {
  const n = 6;
  const petalW = size * 0.14;
  const petalH = size * 0.28;
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / n);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.2, petalW, petalH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
}

function drawFlowerBloom(ctx, size, fill, accent) {
  const buds = [
    { x: 0, y: 0, r: 0, s: 1, c: fill },
    { x: size * 0.14, y: -size * 0.06, r: 0.7, s: 0.82, c: accent },
    { x: -size * 0.1, y: size * 0.08, r: -0.5, s: 0.75, c: fill },
  ];
  for (const b of buds) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.r);
    ctx.globalAlpha *= b.s;
    ctx.fillStyle = b.c;
    drawSoftPetalPath(ctx, size * 0.18, size * 0.34);
    ctx.fill();
    ctx.restore();
  }
}

function drawFloatingFlower(ctx, x, y, rot, size, type, palette, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  if (type === "blossom") drawFlowerBlossom(ctx, size, palette.fill, palette.accent);
  else if (type === "floret") drawFlowerFloret(ctx, size, palette.fill, palette.accent);
  else if (type === "daisy") drawFlowerDaisy(ctx, size, palette.fill, palette.accent);
  else if (type === "bloom") drawFlowerBloom(ctx, size, palette.fill, palette.accent);
  else {
    ctx.fillStyle = palette.fill;
    drawSoftPetalPath(ctx, size * 0.22, size * 0.44);
    ctx.fill();
  }
  ctx.restore();
}

function randomFlowerSpec(sizeScale = 1) {
  return {
    type: FLOWER_TYPES[(Math.random() * FLOWER_TYPES.length) | 0],
    palette: FLOWER_PALETTES[(Math.random() * FLOWER_PALETTES.length) | 0],
    size: rand(12, 24) * sizeScale,
    alpha: rand(0.38, 0.62),
  };
}

function drawHeartShape(ctx, cx, cy, s, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.35);
  ctx.bezierCurveTo(cx, cy - s * 0.45, cx - s * 1.1, cy - s * 0.45, cx - s * 1.1, cy + s * 0.15);
  ctx.bezierCurveTo(cx - s * 1.1, cy + s * 0.85, cx, cy + s * 1.25, cx, cy + s * 1.65);
  ctx.bezierCurveTo(cx, cy + s * 1.25, cx + s * 1.1, cy + s * 0.85, cx + s * 1.1, cy + s * 0.15);
  ctx.bezierCurveTo(cx + s * 1.1, cy - s * 0.45, cx, cy - s * 0.45, cx, cy + s * 0.35);
  ctx.closePath();
  ctx.fill();
}

function buildRsvpHeartTextures() {
  const S = 180;
  return RSVP_HEART_COLORS.map((fill, i) => {
    const c = document.createElement("canvas");
    c.width = S;
    c.height = S;
    const x = c.getContext("2d");
    drawHeartShape(x, S / 2, S / 2 + 8, 22, fill);
    return { canvas: c, size: S, isRed: i < RSVP_RED_HEART_COUNT };
  });
}

function pickRsvpHeartTex() {
  const pool = rsvpHeartTextures;
  if (!pool.length) return null;
  if (Math.random() < 0.62) {
    const reds = pool.filter((t) => t.isRed);
    if (reds.length) return reds[(Math.random() * reds.length) | 0];
  }
  return pool[(Math.random() * pool.length) | 0];
}

function pickRsvpConfettiColor() {
  if (Math.random() < 0.38) {
    const reds = RSVP_CONFETTI_COLORS.slice(0, 8);
    return reds[(Math.random() * reds.length) | 0];
  }
  return RSVP_CONFETTI_COLORS[(Math.random() * RSVP_CONFETTI_COLORS.length) | 0];
}

function buildHeartTextures() {
  const S = 120;
  const fills = ["#d4a0ac", "#b07080", "#e8c4cc", "#9a6878"];
  return fills.map((fill) => {
    const c = document.createElement("canvas");
    c.width = S; c.height = S;
    const x = c.getContext("2d");
    drawHeartShape(x, S / 2, S / 2 + 6, 16, fill);
    return { canvas: c, size: S };
  });
}

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
      x.fillStyle = pal.fill;
      x.strokeStyle = pal.edge;
      x.lineWidth = 1.1;
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
    x.fillStyle = "#8a6a72";
    x.beginPath();
    x.ellipse(cx, cy, 3.4, 24, 0, 0, Math.PI * 2);
    x.fill();
    // antennae
    x.strokeStyle = "#8a6a72"; x.lineWidth = 1.2;
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
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const backdrop = document.getElementById("navBackdrop");
  if (!nav) return;

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (toggle) toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  }

  if (toggle && links) {
    toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
    backdrop?.addEventListener("click", () => setMenu(false));
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenu(false));
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  }
}

/* ============================================================
   REVEAL ON SCROLL — ScrollTrigger.batch + gsap.matchMedia
   ============================================================ */
/** Hero sits at the top — reveal it when the intro hands off (scroll triggers miss it). */
function revealHero() {
  const heroItems = document.querySelectorAll("#hero .reveal");
  scheduleHeroButterfly();
  heroItems.forEach((el) => el.classList.add("is-visible"));
  if (heroItems.length && window.gsap) {
    gsap.to(heroItems, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: "power2.out", stagger: 0.12,
      onComplete: () => {
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        fitHeroContent();
      },
    });
  }
  fitHeroContent();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
  enableScrollPrompt();
}

/* ============================================================
   HERO BUTTERFLIES — pink (Daniya) & blue (Sadaat)
   ============================================================ */
const BFLY_ROLES = ["pink", "blue"];
let bflyScrollRaf = 0;
let bflyScrollEndTimer = 0;
let bflyScrollBound = false;
const bflyMerge = { active: false, running: false, tl: null };
const BFLY_SECTIONS = [
  { id: "footer", el: () => document.getElementById("footer") },
  { id: "rsvp", el: () => document.getElementById("rsvp") },
  { id: "venue", el: () => document.getElementById("venue") },
  { id: "dresscode", el: () => document.getElementById("dresscode") },
  { id: "celebrations", el: () => document.getElementById("events") },
  { id: "countdown", el: () => document.getElementById("countdown") },
  { id: "hero", el: () => document.getElementById("hero") },
];
const BFLY_CFG = {
  pink: {
    bflyId: "heroBfly",
    wrapId: "heroButterfly",
    partnerField: "partner2",
    titleAnchor: "title-top-right",
    perchRotation: 8,
    spin: 1,
  },
  blue: {
    bflyId: "heroBflyBlue",
    wrapId: "heroButterflyBlue",
    partnerField: "partner1",
    titleAnchor: "title-top-left",
    perchRotation: -8,
    spin: -1,
  },
};
const bflyState = {
  pink: { active: false, currentStop: "hero", flying: false, flyingTo: null, flightTl: null, heroStarted: false },
  blue: { active: false, currentStop: "hero", flying: false, flyingTo: null, flightTl: null, heroStarted: false },
};

function getBflyCfg(role) {
  return BFLY_CFG[role];
}

function getBflyEl(role) {
  return document.getElementById(getBflyCfg(role).bflyId);
}

function heroButterflySize(ovalWidth) {
  return Math.min(52, Math.max(36, ovalWidth * 0.058));
}

function heroNamePerchGap(size) {
  return Math.max(8, size * 0.12);
}

function getHeroButterflyLayout(role) {
  const cfg = getBflyCfg(role);
  const oval = document.querySelector(".hero__oval");
  const names = document.querySelector(".hero__names");
  const partner = names?.querySelector(`[data-field="${cfg.partnerField}"]`);
  if (!oval || !names) return null;

  const o = oval.getBoundingClientRect();
  const n = names.getBoundingClientRect();
  const anchor = partner?.getBoundingClientRect() || n;
  const bflyW = heroButterflySize(o.width);
  const bflyH = bflyW * (168 / 200);

  return {
    bflyW,
    bflyH,
    ovalW: o.width,
    ovalH: o.height,
    names: {
      left: n.left - o.left,
      top: n.top - o.top,
      right: n.right - o.left,
      bottom: n.bottom - o.top,
      width: n.width,
      height: n.height,
    },
    perch: (() => {
      const gap = heroNamePerchGap(bflyW);
      const x = (anchor.left + anchor.right) / 2 - o.left - bflyW * 0.5;
      if (role === "blue") {
        return { x, y: anchor.top - o.top - bflyH - gap, rotation: cfg.perchRotation, scale: 1 };
      }
      return { x, y: anchor.bottom - o.top + gap, rotation: cfg.perchRotation, scale: 1 };
    })(),
  };
}

function getHeroButterflyPerch(role) {
  return getHeroButterflyLayout(role)?.perch ?? null;
}

function enrichFlightPoints(points) {
  return points.map((point, i) => {
    if (point.rotation != null) return { ...point };
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const wobble = Math.sin(i * 0.85) * 2;
    return {
      ...point,
      x: point.x + wobble * 0.25,
      y: point.y + wobble * 0.35,
      rotation: (Math.atan2(dy, dx) * 180) / Math.PI + 88,
      scale: 0.92 + (i % 3) * 0.03,
      isMeet: point.isMeet,
    };
  });
}

function smoothFlightPath(waypoints, stepsBetween = 3) {
  if (waypoints.length < 2) return enrichFlightPoints(waypoints);
  const smooth = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    for (let s = 0; s < stepsBetween; s++) {
      const t = s / stepsBetween;
      const ease = t * t * (3 - 2 * t);
      smooth.push({
        x: a.x + (b.x - a.x) * ease,
        y: a.y + (b.y - a.y) * ease,
      });
    }
  }
  smooth.push(waypoints[waypoints.length - 1]);
  return enrichFlightPoints(smooth);
}

const HERO_FLYOVER_DURATION = 3;

function buildHeroFlyoverPath(layout, role) {
  const { names, ovalW, bflyW, perch } = layout;
  const cfg = getBflyCfg(role);
  const zoneTop = Math.max(0, names.top - bflyW);
  const zoneBot = names.bottom + bflyW * 2.2;
  const randY = () => zoneTop + Math.random() * (zoneBot - zoneTop);
  const randX = () => bflyW * 0.1 + Math.random() * (ovalW - bflyW * 1.2);
  const entry = {
    x: cfg.spin > 0 ? ovalW + bflyW * 0.6 : -bflyW * 0.8,
    y: randY(),
  };

  return enrichFlightPoints([
    entry,
    { x: randX(), y: randY() },
    { x: randX(), y: randY() },
    { x: randX(), y: randY() },
    { x: randX(), y: randY() },
    { x: randX(), y: randY() },
    { x: perch.x + 8 * cfg.spin, y: perch.y + (role === "blue" ? 14 : -12) },
    { x: perch.x, y: perch.y, rotation: perch.rotation, scale: 1 },
  ]);
}

function getLetterRect(el, index) {
  if (!el) return null;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const node = walker.nextNode();
  if (!node || !node.textContent) return null;
  const text = node.textContent;
  const i = Math.max(0, Math.min(index, text.length - 1));
  const range = document.createRange();
  try {
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const r = range.getBoundingClientRect();
    if (r.width || r.height) return r;
  } catch (_) {
    /* fall through */
  }
  return null;
}

function rewriteBflySvgIds(html, prefix) {
  return html
    .replace(/\bid="hbBl/g, `id="${prefix}`)
    .replace(/url\(#hbBl/g, `url(#${prefix}`)
    .replace(/\bid="hb/g, `id="${prefix}`)
    .replace(/url\(#hb/g, `url(#${prefix}`);
}

function introBflySize() {
  return Math.min(44, Math.max(28, window.innerWidth * 0.055));
}

function mountIntroButterflies() {
  const headline = document.getElementById("introHeadline");
  if (!headline || headline.dataset.bfliesMounted) return;
  headline.dataset.bfliesMounted = "1";

  const specs = [
    { role: "blue", srcId: "heroBflyBlue", wrapId: "introBflyWrapBlue", bflyId: "introBflyBlue", prefix: "introBl", partnerField: "partner1" },
    { role: "pink", srcId: "heroBfly", wrapId: "introBflyWrapPink", bflyId: "introBflyPink", prefix: "introPk", partnerField: "partner2" },
  ];

  specs.forEach(({ role, srcId, wrapId, bflyId, prefix, partnerField }) => {
    const src = document.getElementById(srcId);
    if (!src) return;
    const wrap = document.createElement("div");
    wrap.id = wrapId;
    wrap.className = `intro-bfly-wrap intro-bfly-wrap--${role}`;
    wrap.setAttribute("aria-hidden", "true");
    const bfly = document.createElement("div");
    bfly.id = bflyId;
    bfly.className = `${src.className} is-visible is-intro-perched`;
    bfly.innerHTML = rewriteBflySvgIds(src.innerHTML, prefix);
    wrap.appendChild(bfly);
    headline.appendChild(wrap);
  });

  positionIntroButterflies();
}

function positionIntroButterflies() {
  const headline = document.getElementById("introHeadline");
  const intro = document.getElementById("intro");
  if (!headline || !intro || intro.classList.contains("is-done") || introOrbit.active) return;

  const hRect = headline.getBoundingClientRect();
  const size = introBflySize();
  const hh = size * (168 / 200);
  const sadaat = headline.querySelector('[data-field="partner1"]');
  const daniya = headline.querySelector('[data-field="partner2"]');
  const blueWrap = document.getElementById("introBflyWrapBlue");
  const pinkWrap = document.getElementById("introBflyWrapPink");

  if (sadaat && blueWrap) {
    const rect = getTitleTextRect(sadaat);
    const gap = Math.max(6, size * 0.12);
    if (rect) {
      blueWrap.style.width = `${size}px`;
      blueWrap.style.left = `${rect.right - hRect.left + gap}px`;
      blueWrap.style.top = `${rect.top - hRect.top - hh * 0.08}px`;
    }
  }

  if (daniya && pinkWrap) {
    const dRect = getLetterRect(daniya, 0);
    if (dRect) {
      const gap = Math.max(2, size * 0.035);
      pinkWrap.style.width = `${size}px`;
      pinkWrap.style.left = `${dRect.left - hRect.left - size * 0.92}px`;
      pinkWrap.style.top = `${dRect.bottom - hRect.top - hh + gap}px`;
    }
  }
}

let introOrbitRaf = 0;
const introOrbit = { active: false, startTime: 0 };

function getIntroOvalMetrics() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  return {
    cx: W / 2,
    cy: H * 0.44,
    A: Math.min(W * 0.27, 280),
    B: Math.min(H * 0.24, 240),
  };
}

function getIntroOrbitPoint(role, timeSec) {
  const { cx, cy, A, B } = getIntroOvalMetrics();
  const size = introBflySize();
  const hh = size * (168 / 200);
  const base = role === "pink" ? -0.35 : Math.PI - 0.35;
  const ang = base + timeSec * 0.58;
  return {
    x: cx + Math.cos(ang) * A - size / 2,
    y: cy + Math.sin(ang) * B - hh / 2,
    rotation: Math.sin(ang) * 12 + (role === "pink" ? 6 : -6),
  };
}

function detachIntroButterflyWrap(wrap) {
  if (!wrap || wrap.dataset.detached === "1") return;
  const rect = wrap.getBoundingClientRect();
  const host = document.getElementById("intro") || document.body;
  wrap.dataset.detached = "1";
  wrap.classList.add("intro-bfly-wrap--orbit");
  host.appendChild(wrap);
  wrap.style.width = `${rect.width}px`;
  if (window.gsap) {
    gsap.set(wrap, { position: "fixed", left: 0, top: 0, margin: 0, x: rect.left, y: rect.top, zIndex: 48, opacity: 1, visibility: "visible" });
  } else {
    wrap.style.position = "fixed";
    wrap.style.left = "0";
    wrap.style.top = "0";
    wrap.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
    wrap.style.zIndex = "48";
    wrap.style.opacity = "1";
    wrap.style.visibility = "visible";
  }
}

function detachIntroButterfliesFromHeadline() {
  detachIntroButterflyWrap(document.getElementById("introBflyWrapPink"));
  detachIntroButterflyWrap(document.getElementById("introBflyWrapBlue"));
}

function tickIntroOrbit() {
  if (!introOrbit.active || !window.gsap) return;
  const t = (performance.now() - introOrbit.startTime) / 1000;
  const roles = [
    { role: "pink", wrapId: "introBflyWrapPink", bflyId: "introBflyPink" },
    { role: "blue", wrapId: "introBflyWrapBlue", bflyId: "introBflyBlue" },
  ];

  roles.forEach(({ role, wrapId, bflyId }) => {
    const wrap = document.getElementById(wrapId);
    const bfly = document.getElementById(bflyId);
    if (!wrap || !bfly) return;
    const pt = getIntroOrbitPoint(role, t);
    gsap.set(wrap, { x: pt.x, y: pt.y });
    gsap.set(bfly, { rotation: pt.rotation });
  });

  introOrbitRaf = requestAnimationFrame(tickIntroOrbit);
}

function startIntroOrbitFlight() {
  if (!window.gsap) return;
  detachIntroButterfliesFromHeadline();

  const roles = [
    { role: "pink", wrapId: "introBflyWrapPink", bflyId: "introBflyPink" },
    { role: "blue", wrapId: "introBflyWrapBlue", bflyId: "introBflyBlue" },
  ];

  let ready = 0;
  const beginOrbit = () => {
    ready += 1;
    if (ready < roles.length) return;
    introOrbit.active = true;
    introOrbit.startTime = performance.now();
    if (introOrbitRaf) cancelAnimationFrame(introOrbitRaf);
    tickIntroOrbit();
  };

  roles.forEach(({ role, wrapId, bflyId }) => {
    const wrap = document.getElementById(wrapId);
    const bfly = document.getElementById(bflyId);
    if (!wrap || !bfly) {
      beginOrbit();
      return;
    }

    bfly.classList.remove("is-intro-perched");
    bfly.classList.add("is-flying", "is-circling");
    const target = getIntroOrbitPoint(role, 0);

    gsap.to(wrap, {
      x: target.x,
      y: target.y,
      duration: 2.4,
      ease: "power2.inOut",
      onComplete: () => {
        bfly.classList.remove("is-flying");
        bfly.classList.add("is-circling");
        beginOrbit();
      },
    });
  });
}

function stopIntroOrbit() {
  introOrbit.active = false;
  if (introOrbitRaf) {
    cancelAnimationFrame(introOrbitRaf);
    introOrbitRaf = 0;
  }
}

function hideIntroButterflies() {
  stopIntroOrbit();
  document.querySelectorAll(".intro-bfly-wrap").forEach((el) => {
    el.style.display = "none";
  });
}

function initIntroButterflies() {
  const setup = () => mountIntroButterflies();
  if (document.fonts?.ready) document.fonts.ready.then(setup);
  else setup();
  window.addEventListener("resize", positionIntroButterflies, { passive: true });
}

function flightSegmentDuration(a, b) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  return Math.max(0.16, Math.min(0.48, dist / 190));
}

function bflyLiveSize(role) {
  const bfly = getBflyEl(role);
  return bfly?.offsetWidth || heroButterflySize(window.innerWidth * 0.9);
}

function mergeClientRects(rectList) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const r of rectList) {
    if (!r.width && !r.height) continue;
    left = Math.min(left, r.left);
    top = Math.min(top, r.top);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }

  if (right <= left || bottom <= top) return null;
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

function getTitleTextRect(el) {
  if (!el) return null;

  const range = document.createRange();
  try {
    range.selectNodeContents(el);
    const merged = mergeClientRects(range.getClientRects());
    if (merged) return merged;
  } catch (_) {
    /* fall through */
  }

  return el.getBoundingClientRect();
}

function bflyAnchorFromRect(rect, mode, role) {
  const cfg = getBflyCfg(role);
  const size = bflyLiveSize(role);
  const hh = size * (168 / 200);

  const nameGap = heroNamePerchGap(size);

  if (mode === "below-center") {
    return {
      left: rect.left + rect.width / 2 - size / 2,
      top: rect.bottom + nameGap,
      rotation: cfg.perchRotation,
    };
  }
  if (mode === "above-center") {
    return {
      left: rect.left + rect.width / 2 - size / 2,
      top: rect.top - hh - nameGap,
      rotation: cfg.perchRotation,
    };
  }
  if (mode === "title-top-right") {
    const gap = Math.max(10, size * 0.18);
    return { left: rect.right + gap, top: rect.top - hh * 0.06, rotation: 12 };
  }
  if (mode === "title-top-left") {
    const gap = Math.max(10, size * 0.18);
    return { left: rect.left - gap - size * 0.72, top: rect.top - hh * 0.06, rotation: -12 };
  }
  return { left: rect.left, top: rect.top, rotation: cfg.perchRotation };
}

function getTitleAnchorEl(stopId) {
  const map = {
    countdown: "#countdown .script-title",
    celebrations: "#events .script-title",
    dresscode: "#dresscode .script-title",
    venue: "#venue .script-title",
    rsvp: "#rsvp .script-title",
  };
  const sel = map[stopId];
  return sel ? document.querySelector(sel) : null;
}

function getBflyStopAnchor(stopId, role) {
  const cfg = getBflyCfg(role);
  if (stopId === "hero") {
    const el = document.querySelector(`[data-field="${cfg.partnerField}"]`);
    if (!el) return null;
    const mode = role === "blue" ? "above-center" : "below-center";
    return bflyAnchorFromRect(el.getBoundingClientRect(), mode, role);
  }
  const el = getTitleAnchorEl(stopId);
  if (!el) return null;
  const rect = getTitleTextRect(el);
  if (!rect) return null;
  return bflyAnchorFromRect(rect, cfg.titleAnchor, role);
}

function applyPageBflyPos(bfly, anchor) {
  if (!bfly || !anchor) return;
  if (window.gsap) {
    gsap.set(bfly, {
      position: "fixed",
      left: 0,
      top: 0,
      margin: 0,
      x: anchor.left,
      y: anchor.top,
      rotation: anchor.rotation,
    });
  } else {
    bfly.style.position = "fixed";
    bfly.style.left = "0";
    bfly.style.top = "0";
    bfly.style.margin = "0";
    bfly.style.transform = `translate(${anchor.left}px, ${anchor.top}px) rotate(${anchor.rotation}deg)`;
  }
}

function setBflyAtAnchor(stopId, role) {
  const bfly = getBflyEl(role);
  const target = getBflyStopAnchor(stopId, role);
  if (!bfly || !target) return;
  applyPageBflyPos(bfly, target);
  bflyState[role].currentStop = stopId;
}

function isFooterStopActive() {
  const footer = document.getElementById("footer");
  const logo = getFooterLogoRect();
  if (!footer || !logo) return false;

  const scrollBottom = window.scrollY + window.innerHeight;
  const pageBottom = document.documentElement.scrollHeight;
  const nearBottom = scrollBottom >= pageBottom - 200;
  const logoOnScreen = logo.bottom > 6 && logo.top < window.innerHeight - 6;
  const footerOnScreen = footer.getBoundingClientRect().top < window.innerHeight * 0.92;

  return nearBottom && logoOnScreen && footerOnScreen;
}

function getActiveBflyStop() {
  const probeY = window.innerHeight * 0.36;
  if (isFooterStopActive()) return "footer";

  for (const { id, el } of BFLY_SECTIONS) {
    if (id === "footer") continue;
    const node = el();
    if (!node) continue;
    const r = node.getBoundingClientRect();
    if (r.top <= probeY && r.bottom >= probeY) return id;
  }

  const hero = document.getElementById("hero");
  if (hero) {
    const r = hero.getBoundingClientRect();
    if (r.bottom > window.innerHeight * 0.12) return "hero";
  }

  return bflyState.pink.currentStop || "hero";
}

function followBflyAnchor(stopId, role) {
  const bfly = getBflyEl(role);
  const target = getBflyStopAnchor(stopId, role);
  if (!bfly || !target) return;
  applyPageBflyPos(bfly, target);
}

function getFooterLogoRect() {
  const logo = document.querySelector(".footer__mono");
  return logo ? logo.getBoundingClientRect() : null;
}

function getFooterMergeAnchors() {
  const rect = getFooterLogoRect();
  if (!rect) return null;
  const size = bflyLiveSize("pink");
  const hh = size * (168 / 200);
  const orbitR = size * 0.44;
  const orbitVertical = orbitR * 0.7;
  const gapAboveLogo = Math.max(12, size * 0.18);
  const orbitCx = rect.left + rect.width / 2;
  const orbitCy = rect.top - gapAboveLogo - orbitVertical;
  const centerX = orbitCx - size / 2;
  const centerY = orbitCy - hh / 2;
  return {
    center: { left: centerX, top: centerY, rotation: 4 },
    orbitCx,
    orbitCy,
    pinkSide: { left: centerX + orbitR * 1.05, top: centerY - size * 0.05, rotation: 8 },
    blueSide: { left: centerX - orbitR * 1.3, top: centerY - size * 0.05, rotation: -8 },
  };
}

function getFooterMergeOrbitPoint(anchors, role, angleRad) {
  if (!anchors) return { left: 0, top: 0, rotation: 0 };
  const size = bflyLiveSize("pink");
  const hh = size * (168 / 200);
  const radius = size * 0.44;
  const roleOffset = role === "pink" ? 0 : Math.PI;
  const a = angleRad + roleOffset;
  const cx = anchors.orbitCx;
  const cy = anchors.orbitCy;
  return {
    left: cx + Math.cos(a) * radius - size / 2,
    top: cy + Math.sin(a) * radius * 0.7 - hh / 2,
    rotation: Math.sin(a) * 16 + (role === "pink" ? 5 : -5),
  };
}

function appendMergeOrbit(tl, pink, blue, startAt, revolutions, duration) {
  const steps = Math.max(10, Math.round(12 * revolutions));
  const stepDur = duration / steps;
  for (let i = 1; i <= steps; i++) {
    const ang = (i / steps) * Math.PI * 2 * revolutions;
    const t = startAt + (i - 1) * stepDur;
    tl.to(pink, {
      x: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "pink", ang).left,
      y: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "pink", ang).top,
      rotation: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "pink", ang).rotation,
      duration: stepDur,
      ease: "none",
    }, t);
    tl.to(blue, {
      x: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "blue", ang).left,
      y: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "blue", ang).top,
      rotation: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "blue", ang).rotation,
      duration: stepDur,
      ease: "none",
    }, t);
  }
  return startAt + duration;
}

function followFooterMerge() {
  const anchors = getFooterMergeAnchors();
  const pink = getBflyEl("pink");
  if (!anchors || !pink) return;
  applyPageBflyPos(pink, anchors.center);
}

function resetBflyMerge() {
  if (!bflyMerge.active && !bflyMerge.running) return;
  if (bflyMerge.tl) {
    bflyMerge.tl.kill();
    bflyMerge.tl = null;
  }
  bflyMerge.active = false;
  bflyMerge.running = false;
  const blue = getBflyEl("blue");
  const pink = getBflyEl("pink");
  if (blue) {
    gsap.set(blue, { opacity: 1, scale: 1 });
    blue.classList.remove("is-merged");
  }
  if (pink) {
    pink.classList.remove("is-merged", "is-gold");
    gsap.set(pink, { scale: 1 });
  }
}

function finishBflyMerge() {
  bflyMerge.running = false;
  bflyMerge.active = true;
  bflyMerge.tl = null;
  bflyState.pink.currentStop = "footer";
  bflyState.blue.currentStop = "footer";
  bflyState.pink.flying = false;
  bflyState.blue.flying = false;
  bflyState.pink.flyingTo = null;
  bflyState.blue.flyingTo = null;

  const pink = getBflyEl("pink");
  const blue = getBflyEl("blue");
  if (pink) {
    pink.classList.remove("is-flying", "is-circling");
    pink.classList.add("is-perched", "is-merged", "is-gold");
  }
  if (blue) {
    blue.classList.remove("is-flying", "is-circling", "is-perched");
    gsap.set(blue, { opacity: 0, scale: 0.3 });
  }
  followFooterMerge();
}

function footerMergeApproachDuration(pink, blue) {
  const anchors = getFooterMergeAnchors();
  if (!anchors || !pink || !blue || !window.gsap) return 1.6;
  const px = gsap.getProperty(pink, "x") || 0;
  const py = gsap.getProperty(pink, "y") || 0;
  const bx = gsap.getProperty(blue, "x") || 0;
  const by = gsap.getProperty(blue, "y") || 0;
  const pinkDist = Math.hypot(anchors.pinkSide.left - px, anchors.pinkSide.top - py);
  const blueDist = Math.hypot(anchors.blueSide.left - bx, anchors.blueSide.top - by);
  const dist = Math.max(pinkDist, blueDist);
  return Math.max(0.85, Math.min(2.1, dist / 240));
}

function flyBflyMergeFinale() {
  if (bflyMerge.active || bflyMerge.running || !anyBflyActive() || !window.gsap) return;
  if (!isFooterStopActive()) return;
  const anchors = getFooterMergeAnchors();
  const pink = getBflyEl("pink");
  const blue = getBflyEl("blue");
  if (!anchors || !pink || !blue) return;

  BFLY_ROLES.forEach((role) => stopBflyFlight(role));
  bflyMerge.running = true;

  pink.classList.remove("is-perched", "is-merged", "is-gold");
  blue.classList.remove("is-perched", "is-merged");
  pink.classList.add("is-flying", "is-circling");
  blue.classList.add("is-flying", "is-circling");
  gsap.set([pink, blue], { opacity: 1, scale: 1, visibility: "visible" });

  const tl = gsap.timeline({ onComplete: finishBflyMerge });
  bflyMerge.tl = tl;
  const approachDur = footerMergeApproachDuration(pink, blue);
  const orbitStart = approachDur + 0.15;
  const orbitDur = 2.6;
  const mergeStart = orbitStart + orbitDur + 0.1;

  tl.to(pink, {
    x: () => getFooterMergeAnchors()?.pinkSide.left ?? anchors.pinkSide.left,
    y: () => getFooterMergeAnchors()?.pinkSide.top ?? anchors.pinkSide.top,
    rotation: () => getFooterMergeAnchors()?.pinkSide.rotation ?? anchors.pinkSide.rotation,
    duration: approachDur,
    ease: "power2.inOut",
  }, 0);
  tl.to(blue, {
    x: () => getFooterMergeAnchors()?.blueSide.left ?? anchors.blueSide.left,
    y: () => getFooterMergeAnchors()?.blueSide.top ?? anchors.blueSide.top,
    rotation: () => getFooterMergeAnchors()?.blueSide.rotation ?? anchors.blueSide.rotation,
    duration: approachDur,
    ease: "power2.inOut",
  }, 0);

  tl.to(pink, {
    x: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "pink", 0).left,
    y: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "pink", 0).top,
    rotation: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "pink", 0).rotation,
    duration: 0.35,
    ease: "sine.inOut",
  }, orbitStart - 0.35);
  tl.to(blue, {
    x: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "blue", 0).left,
    y: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "blue", 0).top,
    rotation: () => getFooterMergeOrbitPoint(getFooterMergeAnchors(), "blue", 0).rotation,
    duration: 0.35,
    ease: "sine.inOut",
  }, orbitStart - 0.35);

  appendMergeOrbit(tl, pink, blue, orbitStart, 1.35, orbitDur);

  tl.to(pink, {
    x: () => getFooterMergeAnchors()?.center.left ?? anchors.center.left,
    y: () => getFooterMergeAnchors()?.center.top ?? anchors.center.top,
    rotation: () => getFooterMergeAnchors()?.center.rotation ?? anchors.center.rotation,
    duration: 0.75,
    ease: "sine.inOut",
  }, mergeStart);
  tl.to(blue, {
    x: () => getFooterMergeAnchors()?.center.left ?? anchors.center.left,
    y: () => getFooterMergeAnchors()?.center.top ?? anchors.center.top,
    rotation: 4,
    duration: 0.75,
    ease: "sine.inOut",
  }, mergeStart);

  const uniteAt = mergeStart + 0.8;
  tl.to(blue, {
    opacity: 0,
    scale: 0.3,
    duration: 0.85,
    ease: "power2.in",
  }, uniteAt);
  tl.to(pink, {
    scale: 1.08,
    duration: 0.85,
    ease: "power2.out",
  }, uniteAt);
  tl.call(() => pink.classList.add("is-gold"), null, uniteAt + 0.45);
}

function buildSectionTravelPath(fromX, fromY, target, role) {
  const cfg = getBflyCfg(role);
  const size = bflyLiveSize(role);
  const hh = size * (168 / 200);
  const px = target.left;
  const py = target.top;
  const r = Math.max(size * 1.45, 38);
  const spin = cfg.spin;

  return enrichFlightPoints([
    { x: fromX, y: fromY },
    { x: fromX + (px - fromX) * 0.35 + size * 0.4 * spin, y: fromY + (py - fromY) * 0.28 - size * 0.75 },
    { x: fromX + (px - fromX) * 0.68 + size * 0.15 * spin, y: fromY + (py - fromY) * 0.58 - size * 0.28 },
    { x: px + r * 0.85 * spin, y: py - r * 0.5 },
    { x: px - r * 0.45 * spin, y: py - r * 0.08 },
    { x: px + r * 0.22 * spin, y: py + r * 0.32 },
    { x: px + size * 0.12 * spin, y: py - hh * 0.16 },
  ]);
}

function stopBflyFlight(role) {
  const state = bflyState[role];
  const bfly = getBflyEl(role);
  if (state.flightTl) {
    state.flightTl.kill();
    state.flightTl = null;
  }
  if (bfly) gsap.killTweensOf(bfly);
  state.flying = false;
  state.flyingTo = null;
  if (bfly) bfly.classList.remove("is-flying", "is-circling");
}

function finishBflyLanding(role, stopId) {
  const state = bflyState[role];
  const bfly = getBflyEl(role);
  state.flightTl = null;
  state.flying = false;
  state.flyingTo = null;
  state.currentStop = stopId;
  if (!bfly) return;
  bfly.classList.remove("is-flying", "is-circling");
  bfly.classList.add("is-perched");
  followBflyAnchor(stopId, role);
}

function flyBflyToStop(stopId, role) {
  if (stopId === "footer") return;
  const state = bflyState[role];
  const bfly = getBflyEl(role);
  const target = getBflyStopAnchor(stopId, role);
  if (!state.active || !bfly || !target || !window.gsap) return;

  if (stopId === state.currentStop && !state.flying) {
    followBflyAnchor(stopId, role);
    return;
  }

  if (state.flying && state.flyingTo === stopId) return;

  const fromX = gsap.getProperty(bfly, "x") || 0;
  const fromY = gsap.getProperty(bfly, "y") || 0;

  stopBflyFlight(role);

  state.flying = true;
  state.flyingTo = stopId;
  bfly.classList.remove("is-perched");
  bfly.classList.add("is-flying", "is-circling");
  gsap.set(bfly, { position: "fixed", left: 0, top: 0, margin: 0, opacity: 1 });

  const flightPath = buildSectionTravelPath(fromX, fromY, target, role);
  const travelSegs = 3;
  const orbitSegs = flightPath.length - 1 - travelSegs;
  const travelDur = 3.1;
  const orbitDur = 1.45;
  const landDur = 1.35;

  const tl = gsap.timeline({
    onComplete: () => finishBflyLanding(role, stopId),
  });
  state.flightTl = tl;

  flightPath.slice(1).forEach((point, i) => {
    const isTravel = i < travelSegs;
    const dur = isTravel ? travelDur / travelSegs : orbitDur / orbitSegs;
    tl.to(bfly, {
      x: point.x,
      y: point.y,
      rotation: point.rotation,
      scale: point.scale ?? 1,
      duration: dur,
      ease: "none",
    });
  });

  tl.to(bfly, {
    x: () => getBflyStopAnchor(stopId, role)?.left ?? target.left,
    y: () => getBflyStopAnchor(stopId, role)?.top ?? target.top,
    rotation: () => getBflyStopAnchor(stopId, role)?.rotation ?? target.rotation,
    scale: 1,
    duration: landDur,
    ease: "power1.out",
  });
}

function tickBflyRole(role, stop) {
  const state = bflyState[role];
  if (!state.active) return;

  if (bflyMerge.running) return;

  if (state.flying) {
    if (stop !== state.flyingTo) flyBflyToStop(stop, role);
    return;
  }

  if (stop !== state.currentStop) {
    flyBflyToStop(stop, role);
    return;
  }

  followBflyAnchor(stop, role);
}

function tickBflyOnScroll() {
  const stop = getActiveBflyStop();
  if (!stop) return;

  if (stop === "footer") {
    if (!bflyMerge.active && !bflyMerge.running) flyBflyMergeFinale();
    else if (bflyMerge.active) followFooterMerge();
    return;
  }

  if (bflyMerge.active || bflyMerge.running) resetBflyMerge();

  BFLY_ROLES.forEach((role) => tickBflyRole(role, stop));
}

function anyBflyActive() {
  return BFLY_ROLES.some((role) => bflyState[role].active);
}

function scheduleBflyScrollTick() {
  if (!anyBflyActive()) return;
  if (!bflyScrollRaf) {
    bflyScrollRaf = requestAnimationFrame(() => {
      bflyScrollRaf = 0;
      tickBflyOnScroll();
    });
  }
  clearTimeout(bflyScrollEndTimer);
  bflyScrollEndTimer = setTimeout(() => {
    tickBflyOnScroll();
  }, 120);
}

function bindBflyScroll() {
  if (bflyScrollBound) return;
  bflyScrollBound = true;
  window.addEventListener("scroll", scheduleBflyScrollTick, { passive: true });
  window.addEventListener("resize", onBflyResize, { passive: true });
  if ("onscrollend" in window) {
    window.addEventListener("scrollend", scheduleBflyScrollTick, { passive: true });
  }
}

function promoteButterflyToPage(role) {
  const cfg = getBflyCfg(role);
  const state = bflyState[role];
  const bfly = getBflyEl(role);
  const wrap = document.getElementById(cfg.wrapId);
  if (!wrap || !bfly || state.active) return;

  const rect = bfly.getBoundingClientRect();
  const rotation = window.gsap ? (gsap.getProperty(bfly, "rotation") || cfg.perchRotation) : cfg.perchRotation;
  const scale = window.gsap ? (gsap.getProperty(bfly, "scale") || 1) : 1;

  wrap.classList.add("companion-bfly");
  document.body.appendChild(wrap);

  if (window.gsap) {
    gsap.killTweensOf(bfly);
    gsap.set(bfly, {
      position: "fixed",
      left: 0,
      top: 0,
      margin: 0,
      x: rect.left,
      y: rect.top,
      rotation,
      scale,
      opacity: 1,
    });
  } else {
    bfly.style.position = "fixed";
    bfly.style.left = "0";
    bfly.style.top = "0";
    bfly.style.margin = "0";
    bfly.style.transform = `translate(${rect.left}px, ${rect.top}px) rotate(${rotation}deg) scale(${scale})`;
    bfly.style.opacity = "1";
  }

  state.active = true;
  state.currentStop = "hero";

  if (!bflyScrollBound) bindBflyScroll();
  scheduleBflyScrollTick();
}

function onBflyResize() {
  if (bflyMerge.active) {
    followFooterMerge();
    return;
  }
  BFLY_ROLES.forEach((role) => {
    const state = bflyState[role];
    if (state.active && !state.flying) setBflyAtAnchor(state.currentStop, role);
  });
}

function perchHeroButterfly(role) {
  const bfly = getBflyEl(role);
  const perch = getHeroButterflyPerch(role);
  if (!bfly || !perch) return;

  bfly.classList.add("is-visible", "is-perched");
  bfly.classList.remove("is-flying", "is-circling");
  bfly.style.opacity = "1";

  if (window.gsap) {
    gsap.set(bfly, {
      x: perch.x, y: perch.y, rotation: perch.rotation, scale: perch.scale, opacity: 1,
    });
  } else {
    bfly.style.transform = `translate(${perch.x}px, ${perch.y}px) rotate(${perch.rotation}deg) scale(${perch.scale})`;
    bfly.style.opacity = "1";
  }
  promoteButterflyToPage(role);
}

function flyHeroButterfly(role, flightPath) {
  const state = bflyState[role];
  if (state.heroStarted) return;
  const bfly = getBflyEl(role);
  const oval = document.querySelector(".hero__oval");
  if (!bfly || !oval || !flightPath?.length) return;

  state.heroStarted = true;
  bfly.classList.add("is-visible");

  if (reducedMotion || !window.gsap) {
    perchHeroButterfly(role);
    return;
  }

  const entry = flightPath[0];
  const cfg = getBflyCfg(role);

  gsap.set(bfly, {
    x: entry.x,
    y: entry.y,
    rotation: entry.rotation ?? (cfg.spin > 0 ? -28 : 28),
    scale: 0.82,
    opacity: 0,
  });
  bfly.classList.add("is-flying");

  const tl = gsap.timeline({ delay: 0.05 });
  tl.to(bfly, { opacity: 1, duration: 0.35, ease: "sine.out" })
    .add(() => bfly.classList.add("is-circling"), 0.1);

  const wanderCount = 5;
  flightPath.slice(1).forEach((point, i) => {
    const isLanding = i === flightPath.length - 2;
    const isApproach = i === flightPath.length - 3;
    let duration = HERO_FLYOVER_DURATION / wanderCount;
    if (isApproach) duration = 0.45;
    else if (isLanding) duration = 1.05;
    else if (i >= wanderCount) duration = 0.45;

    tl.to(bfly, {
      x: point.x,
      y: point.y,
      rotation: point.rotation,
      scale: point.scale,
      duration,
      ease: isLanding ? "power2.out" : isApproach ? "sine.inOut" : "none",
    });
  });

  tl.add(() => {
    bfly.classList.remove("is-circling", "is-flying");
    bfly.classList.add("is-perched");
    promoteButterflyToPage(role);
  });
}

function scheduleHeroButterfly() {
  const run = () => {
    const pinkLayout = getHeroButterflyLayout("pink");
    const blueLayout = getHeroButterflyLayout("blue");
    if (!pinkLayout || !blueLayout) return;
    flyHeroButterfly("pink", buildHeroFlyoverPath(pinkLayout, "pink"));
    flyHeroButterfly("blue", buildHeroFlyoverPath(blueLayout, "blue"));
  };
  if (BFLY_ROLES.every((role) => bflyState[role].heroStarted)) return;
  if (document.fonts?.ready) {
    document.fonts.ready.then(run);
  } else {
    run();
  }
}

/* ============================================================
   SCROLL PROMPT — after load, until page bottom, no overlap
   ============================================================ */
let scrollPromptVisible = false;
let scrollPromptReady = false;
let scrollPromptListenersBound = false;
let scrollPromptScrollRaf = 0;
let scrollPromptEnableTimer = 0;

function isIntroBlockingScrollPrompt() {
  const intro = document.getElementById("intro");
  return intro && !intro.classList.contains("is-done");
}

function hasMoreContentBelow() {
  const scrollBottom = window.scrollY + window.innerHeight;
  const pageBottom = document.documentElement.scrollHeight;
  return scrollBottom < pageBottom - 72;
}

function isHeroScrollPromptActive() {
  const hero = document.getElementById("hero");
  if (!hero) return window.scrollY < window.innerHeight * 0.35;
  const rect = hero.getBoundingClientRect();
  return rect.bottom > window.innerHeight * 0.48 && rect.top < window.innerHeight * 0.42;
}

function positionScrollPrompt() {
  const prompt = document.getElementById("scrollPrompt");
  const music = document.getElementById("musicToggle");
  if (!prompt) return;

  const onHero = isHeroScrollPromptActive();
  prompt.classList.toggle("scroll-prompt--hero", onHero);
  prompt.classList.toggle("scroll-prompt--dock", !onHero);

  if (onHero) {
    prompt.style.removeProperty("--scroll-prompt-bottom");
    return;
  }

  const gap = 8;
  let bottom = 72;

  if (music) {
    const musicRect = music.getBoundingClientRect();
    if (musicRect.height > 0 && musicRect.top > 0) {
      bottom = window.innerHeight - musicRect.top + gap;
    }
  }

  prompt.style.setProperty("--scroll-prompt-bottom", `${Math.round(bottom)}px`);
}

function enableScrollPrompt() {
  clearTimeout(scrollPromptEnableTimer);
  scrollPromptEnableTimer = window.setTimeout(() => {
    scrollPromptReady = true;
    positionScrollPrompt();
    updateScrollPrompt(true);
  }, 400);
}

function setScrollPromptVisible(show, animateIn = false) {
  const prompt = document.getElementById("scrollPrompt");
  if (!prompt || show === scrollPromptVisible) return;

  scrollPromptVisible = show;
  if (window.gsap) {
    gsap.killTweensOf(prompt);
    gsap.set(prompt, { clearProps: "all" });
  }

  if (show) {
    prompt.style.removeProperty("display");
    prompt.setAttribute("aria-hidden", "false");
    prompt.classList.remove("is-dismissed");
    prompt.classList.add("is-visible");
    prompt.classList.toggle("is-entering", animateIn && !reducedMotion);
    return;
  }

  prompt.classList.remove("is-visible", "is-entering");
  prompt.classList.add("is-dismissed");
  prompt.setAttribute("aria-hidden", "true");
}

function updateScrollPrompt(animateIn = false) {
  if (!scrollPromptReady || isIntroBlockingScrollPrompt()) {
    setScrollPromptVisible(false);
    return;
  }
  positionScrollPrompt();
  const shouldShow = hasMoreContentBelow();
  setScrollPromptVisible(shouldShow, animateIn);
}

function initScrollPrompt() {
  const prompt = document.getElementById("scrollPrompt");
  if (!prompt || scrollPromptListenersBound) return;
  scrollPromptListenersBound = true;

  const scheduleScrollPromptUpdate = () => {
    if (scrollPromptScrollRaf) return;
    scrollPromptScrollRaf = requestAnimationFrame(() => {
      scrollPromptScrollRaf = 0;
      updateScrollPrompt();
    });
  };

  window.addEventListener("scroll", scheduleScrollPromptUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollPromptUpdate, { passive: true });
  window.addEventListener("load", scheduleScrollPromptUpdate);

  prompt.querySelector(".scroll-prompt__link")?.addEventListener("click", (e) => {
    e.preventDefault();
    const remaining = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    if (remaining <= 72) return;
    window.scrollBy({
      top: Math.min(window.innerHeight * 0.85, remaining - 48),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  });

}

/* ============================================================
   HERO OVAL FIT — scale inner content if it overflows the frame
   ============================================================ */
function fitHeroContent() {
  const oval = document.querySelector(".hero__oval");
  const inner = document.querySelector(".hero__inner");
  const names = document.querySelector(".hero__names");
  if (!oval || !inner || !names) return;

  function fit() {
    const maxH = oval.clientHeight * 0.62;
    const maxW = oval.clientWidth * 0.4;
    const innerH = names.scrollHeight;
    const innerW = names.scrollWidth;
    let scale = 1;
    if (maxH > 0 && innerH > maxH) scale = Math.min(scale, maxH / innerH);
    if (maxW > 0 && innerW > maxW) scale = Math.min(scale, maxW / innerW);
    scale = Math.max(0.72, Math.min(1, scale));
    inner.style.setProperty("--hero-scale", scale < 0.99 ? scale.toFixed(3) : "1");
  }

  fit();
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(fit);
    ro.observe(oval);
    ro.observe(names);
  } else {
    window.addEventListener("resize", fit);
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
  let W, H, petals = [];
  let petalsActive = false;

  function resize() {
    const DPR = canvasDPR();
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function make() {
    const count = Math.round(Math.min(isNarrow ? 32 : isMobile ? 42 : 58, Math.max(24, W / (isNarrow ? 34 : 28))));
    petals = [];
    for (let i = 0; i < count; i++) {
      const flower = randomFlowerSpec(1);
      petals.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: flower.size,
        type: flower.type,
        palette: flower.palette,
        alpha: flower.alpha,
        sp: rand(0.35, 1.15),
        sway: rand(0.4, 1.1),
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSp: rand(-0.02, 0.02),
      });
    }
  }
  function draw() {
    if (!petalsActive) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      p.y += p.sp;
      p.phase += 0.01;
      p.x += Math.sin(p.phase) * p.sway * 0.5;
      p.rot += p.rotSp;
      if (p.y - p.size > H) {
        p.y = -p.size * 2;
        p.x = Math.random() * W;
      }
      drawFloatingFlower(ctx, p.x, p.y, p.rot, p.size, p.type, p.palette, p.alpha);
    }
    requestAnimationFrame(draw);
  }
  function startPetals() {
    if (petalsActive) return;
    petalsActive = true;
    resize();
    make();
    requestAnimationFrame(draw);
  }
  window.refreshFallingPetals = () => {
    resize();
    make();
    startPetals();
  };
  window.addEventListener("resize", () => {
    if (!petalsActive) return;
    resize();
    make();
  });
  startPetals();
}

/* ============================================================
   BACKGROUND MUSIC (your MP3) + CINEMATIC SFX
   ============================================================ */
const BackgroundMusic = {
  el: null, ready: false, playing: false, maxVol: 0.16, swellRaf: 0,

  init() {
    this.el = document.getElementById("music");
    if (!this.el || !WEDDING.musicFile) return;
    const src = this.el.querySelector("source");
    if (src) src.src = WEDDING.musicFile;
    this.el.volume = 0;
    this.el.load();
    this.el.addEventListener("canplaythrough", () => { this.ready = true; }, { once: true });
    this.el.addEventListener("error", () => { this.ready = false; });
  },

  targetVol(level) {
    return Math.min(this.maxVol, 0.012 + level * 0.12);
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

  async play(startLevel = 0.06) {
    if (!this.el) return false;
    this.el.volume = this.targetVol(startLevel);
    try {
      await this.el.play();
      this.playing = true;
      updateMusicButtonUI();
      return true;
    } catch (_) {
      this.playing = false;
      updateMusicButtonUI();
      return false;
    }
  },

  pause() {
    if (!this.el) return;
    cancelAnimationFrame(this.swellRaf);
    this.el.pause();
    this.playing = false;
    updateMusicButtonUI();
  },

  toggle() {
    if (this.playing) this.pause();
    else this.play().then((ok) => { if (ok) this.swell(0.16, 1.8); });
  },
};

function updateMusicButtonUI() {
  if (!musicBtn) return;
  const playing = BackgroundMusic.playing;
  musicBtn.classList.toggle("is-playing", playing);
  musicBtn.classList.toggle("is-muted", !playing);
  musicBtn.setAttribute("aria-pressed", playing ? "true" : "false");
  musicBtn.setAttribute("aria-label", playing ? "Mute music" : "Unmute music");
  musicBtn.title = playing ? "Mute music" : "Unmute music";
}

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
  updateMusicButtonUI();
  if (!musicBtn) return;
  musicBtn.addEventListener("click", () => BackgroundMusic.toggle());
}
function startMusic() {
  CinematicAudio.init();
  CinematicAudio.resume();
  BackgroundMusic.play(0.02).then((ok) => {
    if (ok) BackgroundMusic.swell(0.08, 2.4);
  });
}

/* ============================================================
   RSVP
   ============================================================ */
async function submitRsvpResponse(data) {
  if (WEDDING.rsvpSheetEndpoint) {
    const res = await fetch(WEDDING.rsvpSheetEndpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        name: data.name || "",
        phone: data.phone || "",
        attending: data.attending || "",
        guests: data.guests || "",
        message: data.message || "",
        submittedAt: new Date().toISOString(),
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error("sheet");
    return json;
  }

  if (WEDDING.formspreeEndpoint) {
    const body = new FormData();
    Object.entries(data).forEach(([key, value]) => body.append(key, value));
    const res = await fetch(WEDDING.formspreeEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
    });
    if (!res.ok) throw new Error("formspree");
    return;
  }

  const subject = encodeURIComponent(`RSVP — ${data.name}`);
  const body = encodeURIComponent(
    `Name: ${data.name}\nPhone: ${data.phone || "-"}\nAttending: ${data.attending}\nGuests: ${data.guests || "-"}\nNote: ${data.message || "-"}`
  );
  window.location.href = `mailto:${WEDDING.contactEmail}?subject=${subject}&body=${body}`;
}

let rsvpSubmitting = false;

function setRsvpFormBusy(form, busy) {
  rsvpSubmitting = busy;
  form.querySelectorAll("button, input, textarea, select").forEach((el) => {
    el.disabled = busy;
  });
}

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
    if (rsvpSubmitting) return;
    status.className = "rsvp-status";
    status.textContent = "";

    const nameEl = form.elements["name"];
    const valid = nameEl && nameEl.value.trim();
    if (nameEl) nameEl.classList.toggle("invalid", !valid);
    if (!attending.value) attending.value = "yes";
    if (!valid) {
      status.classList.add("is-error");
      status.textContent = "Please enter your name to RSVP.";
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    setRsvpFormBusy(form, true);
    try {
      const result = await submitRsvpResponse(data);
      status.classList.add("is-success");
      if (result?.duplicate) {
        status.textContent = "Submit already recorded — thank you!";
      } else if (result?.updated) {
        status.textContent = "Submit recorded — updated!";
      } else {
        status.textContent = "Submit recorded — thank you!";
      }
      playRsvpHeartSplash();
      form.reset();
      if (attending) attending.value = "";
    } catch (err) {
      status.classList.add("is-error");
      status.textContent = "Something went wrong — please try again or email us directly.";
    } finally {
      setRsvpFormBusy(form, false);
    }
  });

  initRsvpAcceptHover();
}

function initRsvpAcceptHover() {
  const wrap = document.querySelector(".rsvp-accept-wrap");
  const canvas = wrap?.querySelector(".rsvp-accept-orbit");
  const btn = wrap?.querySelector(".btn--accept");
  if (!wrap || !canvas || !btn || reducedMotion) return;

  if (!butterflyTextures.length) butterflyTextures = buildButterflyTextures();

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const canvasSize = 220;
  canvas.width = canvasSize * DPR;
  canvas.height = canvasSize * DPR;
  canvas.style.width = `${canvasSize}px`;
  canvas.style.height = `${canvasSize}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const flies = Array.from({ length: 6 }, (_, i) => ({
    angle: (i / 6) * Math.PI * 2,
    speed: 0.85 + (i % 3) * 0.18,
    radiusX: 78 + (i % 2) * 14,
    radiusY: 50 + (i % 3) * 10,
    size: 24 + (i % 2) * 5,
    tex: butterflyTextures[i % butterflyTextures.length],
    wobble: (i * 0.7) % (Math.PI * 2),
  }));

  let raf = 0;
  let active = false;
  let orbitStart = 0;

  function draw(now) {
    if (!active) return;
    const sec = (now - orbitStart) / 1000;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    const cx = canvasSize / 2;
    const cy = canvasSize / 2;

    for (const f of flies) {
      const ang = f.angle + sec * f.speed;
      const x = cx + Math.cos(ang) * f.radiusX;
      const y = cy + Math.sin(ang) * f.radiusY;
      const half = f.size / 2;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.translate(x, y);
      ctx.rotate(Math.sin(ang + f.wobble) * 0.35);
      ctx.drawImage(f.tex.canvas, -half, -half, f.size, f.size);
      ctx.restore();
    }

    raf = requestAnimationFrame(draw);
  }

  function startHover() {
    if (active) return;
    active = true;
    wrap.classList.add("is-hover");
    orbitStart = performance.now();
    raf = requestAnimationFrame(draw);
  }

  function endHover() {
    if (!active) return;
    active = false;
    wrap.classList.remove("is-hover");
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  }

  btn.addEventListener("mouseenter", startHover);
  btn.addEventListener("mouseleave", endHover);
  btn.addEventListener("focus", startHover);
  btn.addEventListener("blur", endHover);
}

/* ---------- Heart splash on RSVP success ---------- */
let rsvpHeartTextures = [];

function playRsvpHeartSplash() {
  const canvas = document.getElementById("fxCanvas");
  if (!canvas || reducedMotion) return;
  if (!rsvpHeartTextures.length) rsvpHeartTextures = buildRsvpHeartTextures();

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const hearts = [];
  const confetti = [];
  const minSize = isMobile ? 26 : 34;
  const maxSize = isMobile ? 78 : 104;
  const cx = W / 2;
  const cy = H / 2;
  const margin = 40;

  function addHeart(opts) {
    hearts.push({
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.1, 0.1),
      alpha: rand(0.9, 1),
      pulse: Math.random() * Math.PI * 2,
      tex: pickRsvpHeartTex(),
      pop: rand(0.75, 1.12),
      ...opts,
    });
  }

  // Fill entire screen immediately
  const fillCount = isMobile ? 160 : 260;
  for (let i = 0; i < fillCount; i++) {
    addHeart({
      x: rand(-margin, W + margin),
      y: rand(-margin, H + margin),
      vx: rand(-2.4, 2.4),
      vy: rand(-2.4, 2.4),
      size: rand(minSize, maxSize),
      delay: rand(0, 6),
    });
  }

  // Centre burst — radiates outward to every corner
  const burstCount = isMobile ? 120 : 200;
  for (let i = 0; i < burstCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = rand(4, 14);
    addHeart({
      x: cx + rand(-W * 0.08, W * 0.08),
      y: cy + rand(-H * 0.08, H * 0.08),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - rand(0.4, 2.8),
      size: rand(minSize + 4, maxSize + 12),
      delay: rand(0, 10),
    });
  }

  // Edge inflow — hearts from all four sides
  const edgeCount = isMobile ? 80 : 130;
  for (let i = 0; i < edgeCount; i++) {
    const side = i % 4;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    if (side === 0) {
      x = rand(0, W); y = -margin; vx = rand(-2, 2); vy = rand(2, 7);
    } else if (side === 1) {
      x = W + margin; y = rand(0, H); vx = rand(-7, -2); vy = rand(-2, 2);
    } else if (side === 2) {
      x = rand(0, W); y = H + margin; vx = rand(-2, 2); vy = rand(-7, -2);
    } else {
      x = -margin; y = rand(0, H); vx = rand(2, 7); vy = rand(-2, 2);
    }
    addHeart({ x, y, vx, vy, size: rand(minSize, maxSize), delay: rand(0, 14) });
  }

  function addConfetti(opts) {
    confetti.push({
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.22, 0.22),
      alpha: rand(0.86, 1),
      color: pickRsvpConfettiColor(),
      shape: Math.random() < 0.68 ? "rect" : "dot",
      gravity: rand(0.1, 0.22),
      drag: rand(0.988, 0.996),
      ...opts,
    });
  }

  // Full-width confetti rain
  const rainCount = isMobile ? 420 : 680;
  for (let i = 0; i < rainCount; i++) {
    addConfetti({
      x: rand(-margin, W + margin),
      y: rand(-H * 0.35, -4),
      vx: rand(-3.2, 3.2),
      vy: rand(4, 12),
      w: rand(5, 12),
      h: rand(8, 18),
      delay: rand(0, 28),
    });
  }

  // Burst confetti from centre
  const burstConfetti = isMobile ? 220 : 360;
  for (let i = 0; i < burstConfetti; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = rand(3, 13);
    addConfetti({
      x: cx + rand(-W * 0.06, W * 0.06),
      y: cy + rand(-H * 0.06, H * 0.06),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - rand(0.5, 3),
      w: rand(4, 11),
      h: rand(7, 16),
      delay: rand(0, 12),
    });
  }

  // Side streams
  const streamCount = isMobile ? 120 : 200;
  for (let i = 0; i < streamCount; i++) {
    const fromLeft = Math.random() < 0.5;
    addConfetti({
      x: fromLeft ? -margin : W + margin,
      y: rand(0, H),
      vx: fromLeft ? rand(3, 9) : rand(-9, -3),
      vy: rand(-3, 3),
      w: rand(4, 10),
      h: rand(6, 14),
      delay: rand(0, 20),
    });
  }

  let frame = 0;
  let raf = 0;
  const maxFrames = 420; // 7 seconds at 60fps
  const fadeFrames = 36;

  function drawConfettiPiece(c) {
    if (c.shape === "dot") {
      ctx.beginPath();
      ctx.arc(0, 0, c.w * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
      return;
    }
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
  }

  function draw() {
    frame += 1;
    ctx.clearRect(0, 0, W, H);

    for (const c of confetti) {
      if (frame < c.delay) continue;
      c.vy += c.gravity;
      c.vx *= c.drag;
      c.vy *= c.drag;
      c.x += c.vx;
      c.y += c.vy;
      c.rot += c.rotSpeed;
      const popIn = Math.min(1, (frame - c.delay) / 8);
      const fadeOut = frame > maxFrames - fadeFrames ? (maxFrames - frame) / fadeFrames : 1;
      ctx.save();
      ctx.globalAlpha = c.alpha * popIn * fadeOut;
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      drawConfettiPiece(c);
      ctx.restore();
    }

    for (const h of hearts) {
      if (frame < h.delay) continue;
      h.x += h.vx;
      h.y += h.vy;
      h.vy += 0.06;
      h.vx *= 0.99;
      h.vy *= 0.99;
      h.rot += h.rotSpeed;
      h.pulse += 0.14;
      const popIn = Math.min(1, (frame - h.delay) / 12) * h.pop;
      const scale = (0.78 + 0.22 * Math.sin(h.pulse)) * popIn;
      const fadeOut = frame > maxFrames - fadeFrames ? (maxFrames - frame) / fadeFrames : 1;
      const drawSize = h.size * scale;
      const half = drawSize / 2;
      ctx.save();
      ctx.globalAlpha = h.alpha * Math.min(1, popIn + 0.1) * fadeOut;
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      ctx.drawImage(h.tex.canvas, -half, -half, drawSize, drawSize);
      ctx.restore();
    }

    if (frame < maxFrames) raf = requestAnimationFrame(draw);
    else {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    }
  }

  draw();
}

/* ---------- Butterflies sweep across (legacy) ---------- */
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
  let W, H, DPR, dots = [], paused = false;

  function resize() {
    DPR = canvasDPR();
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.round(Math.min(58, Math.max(28, W / 30)));
    dots = Array.from({ length: n }, () => {
      const flower = randomFlowerSpec(0.78);
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        size: flower.size,
        type: flower.type,
        palette: flower.palette,
        a: flower.alpha * 0.9,
        sp: rand(0.12, 0.48),
        ph: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
      };
    });
  }
  function draw() {
    if (paused || document.getElementById("introCanvas")?.dataset.active === "1") {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.y -= d.sp; d.ph += 0.012; d.x += Math.sin(d.ph) * 0.25;
      if (d.y < -4) { d.y = H + 4; d.x = Math.random() * W; }
      d.rot += 0.003;
      drawFloatingFlower(ctx, d.x, d.y, d.rot + Math.sin(d.ph) * 0.2, d.size, d.type, d.palette, d.a);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener("resize", resize);
  window.pauseAmbientParticles = () => { paused = true; };
  window.resumeAmbientParticles = () => { paused = false; };
  requestAnimationFrame(draw);
}

/* ============================================================
   CINEMATIC INTRO — GSAP timeline + butterfly swarm
   ============================================================ */
function initIntro() {
  const intro = document.getElementById("intro");
  const stage = document.getElementById("cinematicStage");
  const headline = document.getElementById("introHeadline");
  const envelope = document.getElementById("luxuryEnvelope");
  const envTop = document.getElementById("envTop");
  const envBottom = document.getElementById("envBottom");
  const envBloom = document.getElementById("envBloom");
  const seal = document.getElementById("waxSeal");
  const sealHearts = document.getElementById("sealHearts");
  const hint = document.getElementById("envHint");
  const curtains = document.getElementById("curtains");
  const canvas = document.getElementById("introCanvas");
  const names = document.getElementById("introNames");
  const body = document.body;

  initIntroButterflies();

  if (!intro || !envelope) {
    body.classList.remove("intro-active");
    revealHero();
    window.refreshFallingPetals?.();
    return;
  }

  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, A = 0, B = 0;
  let particles = [];
  let raf = 0, startTime = 0, lastFrame = 0, dispersed = false, canvasAlpha = 1;
  let washGradient = null, washRadius = 0;

  const T_BURST = 650, T_ARRANGE = 2600, T_NAMES = 2300, T_DISPERSE = 7800, T_FINISH = 10000;

  function finish() {
    if (canvas) canvas.dataset.active = "0";
    window.resumeAmbientParticles?.();
    hideIntroButterflies();
    intro.classList.add("is-done");
    body.classList.remove("intro-active");
    window.scrollTo({ top: 0, behavior: "auto" });
    revealHero();
    window.refreshFallingPetals?.();
    setTimeout(() => updateScrollPrompt(true), 1400);
    setTimeout(() => {
      intro.remove();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 1100);
  }

  function resize() {
    if (!ctx) return;
    DPR = canvasDPR();
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H * 0.44;
    A = Math.min(W * 0.27, 280); B = Math.min(H * 0.24, 240);
    washRadius = Math.max(A, B) * 1.28;
    washGradient = null;
  }

  function ensureWashGradient() {
    if (washGradient && washGradient._r === washRadius) return washGradient;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, washRadius);
    g.addColorStop(0, "rgba(255, 252, 248, 0.95)");
    g.addColorStop(0.38, "rgba(245, 226, 230, 0.5)");
    g.addColorStop(0.68, "rgba(251, 247, 240, 0.22)");
    g.addColorStop(1, "rgba(253, 249, 242, 0)");
    g._r = washRadius;
    washGradient = g;
    return g;
  }

  const OVAL_RINGS = [
    { aScale: 0.78, bScale: 0.78, weight: 0.34 },
    { aScale: 0.9, bScale: 0.9, weight: 0.46 },
    { aScale: 1.0, bScale: 0.98, weight: 0.2 },
  ];

  function makeParticles(count) {
    const ovalCount = Math.round(count * 0.94);
    particles = [];
    let ovalIdx = 0;

    for (const ring of OVAL_RINGS) {
      const ringCount = Math.max(1, Math.round(ovalCount * ring.weight));
      for (let j = 0; j < ringCount && ovalIdx < ovalCount; j++, ovalIdx++) {
        const ang = (j / ringCount) * Math.PI * 2 + ring.aScale * 0.12;
        const tx = cx + Math.cos(ang) * (A * ring.aScale + rand(-3, 3));
        const ty = cy + Math.sin(ang) * (B * ring.bScale + rand(-3, 3));
        const depth = rand(0.65, 1);
        const isHeart = Math.random() < 0.12;
        const p = {
          x: cx + rand(-14, 14), y: cy + rand(-10, 10), tx, ty,
          isOval: true, depth, ang,
          kind: isHeart ? "heart" : "butterfly",
          size: rand(24, 40) * (0.72 + 0.28 * depth) * (isHeart ? 0.82 : 1),
          alpha: 0.62 + 0.38 * depth,
          rot: ang + Math.PI / 2 + rand(-0.2, 0.2),
          targetRot: ang + Math.PI / 2 + rand(-0.15, 0.15),
          rotSpeed: rand(-0.35, 0.35),
          flap: Math.random() * Math.PI * 2,
          flapSpeed: rand(8, 14) * (0.85 + 0.35 * depth),
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: rand(2, 4),
          tex: isHeart
            ? (Math.random() * heartTextures.length) | 0
            : (Math.random() * butterflyTextures.length) | 0,
          driftA: ang + rand(-0.4, 0.4),
          driftR: rand(2, 6) * depth,
          driftS: rand(0.45, 0.95),
          bvx: 0, bvy: 0, dvx: 0, dvy: 0,
        };
        const a = Math.atan2(ty - cy, tx - cx) + rand(-0.15, 0.15);
        const spd = rand(14, 26) * (0.8 + 0.4 * depth);
        p.bvx = Math.cos(a) * spd; p.bvy = Math.sin(a) * spd;
        particles.push(p);
      }
    }

    for (let i = ovalIdx; i < count; i++) {
      const ang = rand(0, Math.PI * 2);
      const dist = rand(1.05, 1.22);
      const tx = cx + Math.cos(ang) * A * dist;
      const ty = cy + Math.sin(ang) * B * dist;
      const depth = rand(0.35, 0.6);
      particles.push({
        x: cx + rand(-20, 20), y: cy + rand(-14, 14), tx, ty,
        isOval: false, depth, ang,
        kind: "butterfly",
        size: rand(16, 28) * depth,
        alpha: 0.28 + 0.22 * depth,
        rot: rand(-0.5, 0.5), targetRot: ang + Math.PI / 2,
        rotSpeed: rand(-0.5, 0.5),
        flap: Math.random() * Math.PI * 2,
        flapSpeed: rand(7, 12),
        pulse: 0, pulseSpeed: 0,
        tex: (Math.random() * butterflyTextures.length) | 0,
        driftA: Math.random() * Math.PI * 2,
        driftR: rand(14, 28) * depth,
        driftS: rand(0.35, 0.75),
        bvx: Math.cos(ang) * rand(10, 18),
        bvy: Math.sin(ang) * rand(10, 18),
        dvx: 0, dvy: 0,
      });
    }

    particles.sort((m, n) => m.depth - n.depth);
  }

  function drawPastelWash(t) {
    const bloom = easeOutCubic(Math.min(1, t / 1400));
    ctx.globalAlpha = 0.55 + 0.45 * bloom;
    ctx.fillStyle = ensureWashGradient();
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    if (t >= T_BURST * 0.5 && !dispersed) {
      const ringAlpha = canvasAlpha * easeOutCubic(Math.min(1, (t - T_BURST * 0.5) / 1600)) * 0.18;
      ctx.globalAlpha = ringAlpha;
      ctx.strokeStyle = "rgba(231, 185, 194, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, A * 0.96, B * 0.96, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawButterfly(p) {
    const tex = butterflyTextures[p.tex];
    if (!tex) return;
    const sx = 0.5 + 0.5 * Math.abs(Math.sin(p.flap));
    const half = p.size / 2;
    ctx.globalAlpha = canvasAlpha * p.alpha;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(sx, 1);
    ctx.drawImage(tex.canvas, -half, -half, p.size, p.size);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function drawHeart(p) {
    const tex = heartTextures[p.tex];
    if (!tex) return;
    const pulse = 0.88 + 0.12 * Math.sin(p.pulse);
    const half = p.size / 2;
    ctx.globalAlpha = canvasAlpha * p.alpha;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(pulse, pulse);
    ctx.drawImage(tex.canvas, -half, -half, p.size, p.size);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function drawParticle(p) {
    if (p.kind === "heart") drawHeart(p);
    else drawButterfly(p);
  }

  function frame(now) {
    if (!startTime) startTime = now;
    const t = now - startTime;
    const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 1 / 60;
    lastFrame = now;
    const arrangeProg = t < T_BURST ? 0 : easeOutCubic(Math.min(1, (t - T_BURST) / (T_ARRANGE - T_BURST)));

    ctx.clearRect(0, 0, W, H);
    drawPastelWash(t);

    for (const p of particles) {
      if (p.kind === "heart") p.pulse += p.pulseSpeed * dt;
      else p.flap += p.flapSpeed * dt;
      if (t < T_BURST) {
        const burstEase = easeOutQuad(t / T_BURST);
        p.x += p.bvx * dt * 60 * (0.55 + 0.45 * (1 - burstEase));
        p.y += p.bvy * dt * 60 * (0.55 + 0.45 * (1 - burstEase));
        p.bvx *= Math.pow(0.91, dt * 60);
        p.bvy *= Math.pow(0.91, dt * 60);
        p.rot += p.rotSpeed * dt;
      } else if (!dispersed) {
        const arranged = arrangeProg >= 1;
        const snap = p.isOval ? lerpFactor(0.035 + 0.07 * arrangeProg, dt) : lerpFactor(0.02, dt);
        const dox = arranged ? Math.cos(p.driftA + t * 0.0008 * p.driftS) * p.driftR : 0;
        const doy = arranged ? Math.sin(p.driftA + t * 0.001 * p.driftS) * p.driftR : 0;
        p.x += (p.tx + dox - p.x) * snap;
        p.y += (p.ty + doy - p.y) * snap;
        const flutter = p.isOval ? Math.sin(p.flap * 0.07) * 0.1 : Math.sin(p.flap * 0.08) * 0.14;
        const goal = (p.targetRot ?? p.rot) + flutter;
        p.rot += (goal - p.rot) * lerpFactor(p.isOval ? 0.06 : 0.035, dt);
      } else {
        p.x += p.dvx * dt * 60; p.y += p.dvy * dt * 60;
        p.dvy += 0.05 * dt * 60; p.rot += p.rotSpeed * dt;
      }
      drawParticle(p);
    }
    ctx.globalAlpha = 1;
    if (dispersed) canvasAlpha = Math.max(0, canvasAlpha - 0.008 * dt * 60);
    raf = requestAnimationFrame(frame);
  }

  const onResize = () => resize();

  function revealIntroNames() {
    if (names) names.classList.add("show");
  }

  function runCanvasIntro() {
    if (!ctx) { setTimeout(finish, 1400); return; }
    resize();
    dispersed = false;
    canvasAlpha = 1;
    startTime = 0;
    lastFrame = 0;
    canvas.dataset.active = "1";
    window.pauseAmbientParticles?.();
    window.addEventListener("resize", onResize);
    const count = butterflyCount();
    makeParticles(count);
    if (raf) cancelAnimationFrame(raf);
    startTime = performance.now();
    raf = requestAnimationFrame(frame);
    setTimeout(revealIntroNames, T_NAMES);
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
      canvas.dataset.active = "0";
      window.resumeAmbientParticles?.();
      window.removeEventListener("resize", onResize);
    }, T_FINISH + 1400);
  }

  function spawnSealHearts() {
    if (!sealHearts) return;
    sealHearts.innerHTML = "";
    const count = 8;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "seal-heart";
      el.textContent = "\u2665";
      sealHearts.appendChild(el);
      const ang = (i / count) * Math.PI * 2;
      const dist = rand(36, 58);
      const tx = Math.cos(ang) * dist;
      const ty = Math.sin(ang) * dist - rand(8, 18);
      if (window.gsap) {
        gsap.set(el, { x: 0, y: 0, scale: 0.2, opacity: 0, rotation: rand(-20, 20) });
        gsap.to(el, {
          x: tx, y: ty, scale: 1, opacity: 1, rotation: rand(-15, 15),
          duration: 1.1, delay: i * 0.06, ease: "power2.out",
        });
        gsap.to(el, { opacity: 0, scale: 0.4, y: ty + 24, duration: 0.7, delay: 1.0 + i * 0.05, ease: "power1.in" });
      } else {
        el.style.opacity = "1";
        el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
        setTimeout(() => { el.style.opacity = "0"; }, 1200);
      }
    }
  }

  const curtainLeft = document.getElementById("curtainLeft");
  const curtainRight = document.getElementById("curtainRight");
  const curtainBloom = document.getElementById("curtainBloom");
  const brightWash = document.querySelector(".curtain-bright-wash");
  const curtainMist = document.getElementById("curtainMist");
  const volumetricGlow = document.getElementById("volumetricGlow");
  const curtainSpotlight = document.getElementById("curtainSpotlight");

  function runCinematicTimeline() {
    CinematicAudio.init();
    CinematicAudio.resume();
    startMusic();
    window.pauseAmbientParticles?.();

    if (reducedMotion || !window.gsap) {
      if (seal) { seal.classList.add("is-glowing", "is-opening"); }
      envelope.classList.add("is-pulsing", "is-opening", "is-open", "is-gone");
      if (curtains) {
        curtains.classList.add("is-visible", "is-spotlit", "is-valance-down", "is-open", "is-blooming");
      }
      if (window.gsap && curtainLeft && curtainRight) {
        gsap.set(curtainLeft, { transformOrigin: "100% 0%", x: -window.innerWidth * 0.54, rotation: -7, skewY: 5, scaleY: 1.04, force3D: true });
        gsap.set(curtainRight, { transformOrigin: "0% 0%", x: window.innerWidth * 0.54, rotation: 7, skewY: -5, scaleY: 1.04, force3D: true });
      }
      if (brightWash) brightWash.style.opacity = "1";
      if (curtainBloom) {
        curtainBloom.style.opacity = "0.95";
        curtainBloom.style.transform = "translate(-50%, -50%) scale(1)";
      }
      CinematicAudio.swellMusic(0.18, 1.5);
      detachIntroButterfliesFromHeadline();
      setTimeout(() => {
        runCanvasIntro();
        startIntroOrbitFlight();
      }, 300);
      return;
    }

    gsap.config({ force3D: true });
    const resetCurtainPanel = (panel, side) => {
      const isLeft = side === "left";
      gsap.set(panel, {
        transformOrigin: isLeft ? "100% 0%" : "0% 0%",
        x: 0, rotation: 0, skewY: 0, scaleY: 1, force3D: true,
      });
      panel.querySelectorAll(".curtain__cloth, .curtain__pleats").forEach((el) => {
        gsap.set(el, { x: 0, skewY: 0, rotation: 0, transformOrigin: isLeft ? "100% 0%" : "0% 0%" });
      });
    };
    if (curtainLeft) resetCurtainPanel(curtainLeft, "left");
    if (curtainRight) resetCurtainPanel(curtainRight, "right");

    const drapeCurtain = (panel, side, tl, start, stagger = 0) => {
      const isLeft = side === "left";
      const origin = isLeft ? "100% 0%" : "0% 0%";
      const xEnd = isLeft ? -window.innerWidth * 0.54 : window.innerWidth * 0.54;
      tl.to(panel, {
        x: xEnd,
        rotation: isLeft ? -7 : 7,
        skewY: isLeft ? 5 : -5,
        scaleY: 1.05,
        transformOrigin: origin,
        duration: 4.4,
        ease: "power2.inOut",
        force3D: true,
      }, start + stagger);
      const cloth = panel.querySelector(".curtain__cloth");
      const pleats = panel.querySelector(".curtain__pleats");
      if (cloth) {
        tl.to(cloth, {
          skewY: isLeft ? 11 : -11,
          transformOrigin: origin,
          duration: 4.4,
          ease: "power2.inOut",
        }, start + stagger);
      }
      if (pleats) {
        tl.to(pleats, {
          x: isLeft ? "-7%" : "7%",
          skewY: isLeft ? 4 : -4,
          duration: 4.4,
          ease: "power2.inOut",
        }, start + stagger + 0.1);
      }
    };
    if (curtainBloom) gsap.set(curtainBloom, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
    if (brightWash) gsap.set(brightWash, { opacity: 0 });
    if (curtainMist) gsap.set(curtainMist, { opacity: 0 });
    if (volumetricGlow) gsap.set(volumetricGlow, { opacity: 0 });
    if (curtainSpotlight) gsap.set(curtainSpotlight, { xPercent: -50, yPercent: -50, scale: 0.5, opacity: 0 });
    const tl = gsap.timeline({ defaults: { ease: "power1.inOut" } });

    // 1) Seal glows warmly
    tl.call(() => seal.classList.add("is-glowing"), null, 0);
    tl.to(".wax-seal__glow", { scale: 1.2, duration: 1.4, ease: "sine.inOut", repeat: 1, yoyo: true }, 0);

    // 2) Seal lifts and fades — positive reveal
    tl.call(() => seal.classList.add("is-opening"), null, 1.4);
    tl.to(seal, {
      y: -28, scale: 1.12, opacity: 0, duration: 1.3, ease: "power1.out", force3D: true,
    }, 1.4);
    tl.call(() => {
      spawnSealHearts();
      CinematicAudio.swellMusic(0.1, 1.6);
    }, null, 1.7);

    // 3) Envelope gentle pulse
    tl.call(() => envelope.classList.add("is-pulsing"), null, 2.2);

    // 4) Envelope splits — both halves open forward toward the viewer
    tl.call(detachIntroButterfliesFromHeadline, null, 2.45);
    if (headline) tl.to(headline, { autoAlpha: 0, y: -16, duration: 0.8, ease: "power2.in" }, 2.5);
    tl.call(() => envelope.classList.add("is-opening", "is-open"), null, 2.6);
    if (envTop && envBottom) {
      gsap.set([envTop, envBottom], { transformPerspective: 1600, transformStyle: "preserve-3d" });
      tl.to(envTop, {
        rotateX: 92, y: "-4%", z: 56, duration: 2.4, ease: "power2.inOut",
        transformOrigin: "bottom center", force3D: true,
      }, 2.7);
      tl.to(envBottom, {
        rotateX: -96, y: "4%", z: 56, duration: 2.4, ease: "power2.inOut",
        transformOrigin: "top center", force3D: true,
      }, 2.7);
    } else {
      tl.call(() => envelope.classList.add("is-open"), null, 2.7);
    }
    if (envBloom) {
      tl.to(envBloom, { scale: 1.2, opacity: 1, duration: 2, ease: "power2.out" }, 2.9);
    }
    tl.to(stage, { scale: isMobile ? 1.04 : 1.08, z: 30, duration: 2.6, ease: "power1.out", force3D: true }, 2.6);
    tl.call(() => CinematicAudio.swellMusic(0.14, 2.4), null, 2.9);

    // 5) Envelope fades — grand curtains rise into view
    tl.call(() => {
      envelope.classList.add("is-gone");
      if (curtains) curtains.classList.add("is-visible");
    }, null, 4.0);

    // 7) Theatrical curtain sequence — spotlight, valance, tension, grand part
    tl.call(() => {
      if (curtains) curtains.classList.add("is-spotlit");
      CinematicAudio.swellMusic(0.12, 1.4);
    }, null, 4.35);
    if (curtainSpotlight) {
      tl.to(curtainSpotlight, { scale: 1, opacity: 1, duration: 2, ease: "power2.out" }, 4.35);
    }
    tl.call(() => { if (curtains) curtains.classList.add("is-valance-down"); }, null, 4.7);
    if (curtainLeft && curtainRight) {
      tl.to(curtainLeft, {
        x: -10, skewY: 2, scaleY: 1.01, duration: 0.6, ease: "sine.inOut", transformOrigin: "100% 0%",
      }, 5.35);
      tl.to(curtainRight, {
        x: 10, skewY: -2, scaleY: 1.01, duration: 0.6, ease: "sine.inOut", transformOrigin: "0% 0%",
      }, 5.35);
    }
    tl.call(() => {
      if (curtains) curtains.classList.add("is-open", "is-blooming");
      CinematicAudio.playWhoosh();
      CinematicAudio.swellMusic(0.2, 3);
      runCanvasIntro();
      startIntroOrbitFlight();
    }, null, 5.95);
    if (curtainLeft) drapeCurtain(curtainLeft, "left", tl, 5.95, 0);
    if (curtainRight) drapeCurtain(curtainRight, "right", tl, 5.95, 0.12);
    if (brightWash) tl.to(brightWash, { opacity: 1, duration: 3, ease: "sine.out" }, 5.95);
    if (curtainBloom) tl.to(curtainBloom, { scale: 1, opacity: 0.95, duration: 3, ease: "sine.out" }, 5.95);
    if (curtainMist) tl.to(curtainMist, { opacity: 1, duration: 2.8, ease: "sine.out" }, 6.15);
    if (volumetricGlow) tl.to(volumetricGlow, { opacity: 1, duration: 2.6, ease: "sine.out" }, 6.2);
    if (curtainSpotlight) tl.to(curtainSpotlight, { scale: 1.12, duration: 3.2, ease: "sine.out" }, 5.95);
  }

  let opened = false;
  function open(e) {
    if (opened) return;
    opened = true;
    if (e) e.stopPropagation();
    if (hint) hint.classList.add("is-hidden");
    if (seal) seal.blur();
    runCinematicTimeline();
  }

  if (seal) {
    seal.addEventListener("click", open);
    seal.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); }
    });
  }

  initAmbientParticles();
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  butterflyTextures = buildButterflyTextures();
  heartTextures = buildHeartTextures();
  applyConfig();
  initLoader();
  initIntro();
  initCountdown();
  initNav();
  initReveal();
  initScrollPrompt();
  initParallax();
  initPetals();
  initMusic();
  initRSVP();
});
