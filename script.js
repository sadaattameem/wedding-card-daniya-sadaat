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

function buildHeartTextures() {
  const S = 120;
  const fills = ["#d4a0ac", "#b07080", "#e8c4cc", "#9a6878"];
  return fills.map((fill) => {
    const c = document.createElement("canvas");
    c.width = S; c.height = S;
    const x = c.getContext("2d");
    const cx = S / 2, cy = S / 2 + 6, s = 16;
    x.fillStyle = fill;
    x.beginPath();
    x.moveTo(cx, cy + s * 0.35);
    x.bezierCurveTo(cx, cy - s * 0.45, cx - s * 1.1, cy - s * 0.45, cx - s * 1.1, cy + s * 0.15);
    x.bezierCurveTo(cx - s * 1.1, cy + s * 0.85, cx, cy + s * 1.25, cx, cy + s * 1.65);
    x.bezierCurveTo(cx, cy + s * 1.25, cx + s * 1.1, cy + s * 0.85, cx + s * 1.1, cy + s * 0.15);
    x.bezierCurveTo(cx + s * 1.1, cy - s * 0.45, cx, cy - s * 0.45, cx, cy + s * 0.35);
    x.closePath();
    x.fill();
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
  if (!heroItems.length) return;
  scheduleHeroButterfly();
  heroItems.forEach((el) => el.classList.add("is-visible"));
  if (window.gsap) {
    gsap.to(heroItems, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: "power2.out", stagger: 0.12,
      onComplete: () => {
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        fitHeroContent();
        showScrollPrompt();
      },
    });
  } else {
    fitHeroContent();
    showScrollPrompt();
  }
}

/* ============================================================
   HERO BUTTERFLY — loops naturally around names, lands near Daniya
   ============================================================ */
let heroButterflyStarted = false;
let bflyScrollRaf = 0;
const BFLY_SECTIONS = [
  { id: "rsvp", el: () => document.getElementById("rsvp") },
  { id: "venue", el: () => document.getElementById("venue") },
  { id: "dresscode", el: () => document.getElementById("dresscode") },
  { id: "celebrations", el: () => document.getElementById("events") },
  { id: "countdown", el: () => document.getElementById("countdown") },
  { id: "hero", el: () => document.getElementById("hero") },
];
const pageBfly = {
  active: false,
  currentStop: "hero",
  flying: false,
  flyingTo: null,
  flightTl: null,
  scrollBound: false,
};

function heroButterflySize(ovalWidth) {
  return Math.min(52, Math.max(36, ovalWidth * 0.058));
}

function getHeroButterflyLayout() {
  const oval = document.querySelector(".hero__oval");
  const names = document.querySelector(".hero__names");
  const partner2 = names?.querySelector('[data-field="partner2"]');
  if (!oval || !names) return null;

  const o = oval.getBoundingClientRect();
  const n = names.getBoundingClientRect();
  const anchor = partner2?.getBoundingClientRect() || n;
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
    perch: {
      x: (anchor.left + anchor.right) / 2 - o.left - bflyW * 0.5,
      y: anchor.bottom - o.top + Math.max(6, bflyW * 0.12),
      rotation: 8,
      scale: 1,
    },
  };
}

function getHeroButterflyPerch() {
  return getHeroButterflyLayout()?.perch ?? null;
}

function enrichFlightPoints(points) {
  return points.map((point, i) => {
    if (point.rotation != null) return point;
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

function buildHeroNaturalPath(layout) {
  const { names, bflyW, bflyH, perch, ovalW } = layout;
  const hw = bflyW * 0.5;
  const hh = bflyH * 0.58;
  const gap = Math.max(bflyW * 0.72, 12);
  const centerX = (names.left + names.right) / 2 - hw;
  const topLane = names.top - gap - hh;
  const leftLane = names.left - gap - hw;
  const rightLane = names.right + gap - hw;
  const shoulderY = names.top + names.height * 0.28 - hh;
  const waistY = names.bottom + gap * 0.25 - hh;

  const waypoints = [
    { x: ovalW * 1.08, y: topLane - gap * 0.8 },
    { x: rightLane + gap * 0.85, y: topLane - gap * 0.35 },
    { x: rightLane, y: topLane },
    { x: centerX, y: topLane - gap * 0.2 },
    { x: leftLane, y: topLane },
    { x: leftLane - gap * 0.5, y: shoulderY },
    { x: leftLane, y: waistY },
    { x: centerX, y: topLane + gap * 0.1 },
    { x: rightLane, y: shoulderY },
    { x: rightLane + gap * 0.35, y: waistY },
    { x: perch.x + 16, y: perch.y - 18 },
    { x: perch.x, y: perch.y, rotation: perch.rotation, scale: perch.scale },
  ];

  return smoothFlightPath(waypoints, 4);
}

function flightSegmentDuration(a, b) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  return Math.max(0.16, Math.min(0.48, dist / 190));
}

function bflyLiveSize() {
  const bfly = document.getElementById("heroBfly");
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

function bflyAnchorFromRect(rect, mode) {
  const size = bflyLiveSize();
  const hh = size * (168 / 200);

  if (mode === "below-center") {
    return { left: rect.left + rect.width / 2 - size / 2, top: rect.bottom + 8, rotation: 8 };
  }
  if (mode === "title-top-right") {
    const gap = Math.max(10, size * 0.18);
    return {
      left: rect.right + gap,
      top: rect.top - hh * 0.06,
      rotation: 12,
    };
  }
  return { left: rect.left, top: rect.top, rotation: 8 };
}

function getBflyStopAnchor(stopId) {
  const stops = {
    hero: { el: () => document.querySelector('[data-field="partner2"]'), mode: "below-center", text: false },
    countdown: { el: () => document.querySelector("#countdown .script-title"), mode: "title-top-right", text: true },
    celebrations: { el: () => document.querySelector("#events .script-title"), mode: "title-top-right", text: true },
    dresscode: { el: () => document.querySelector("#dresscode .script-title"), mode: "title-top-right", text: true },
    venue: { el: () => document.querySelector("#venue .script-title"), mode: "title-top-right", text: true },
    rsvp: { el: () => document.querySelector("#rsvp .script-title"), mode: "title-top-right", text: true },
  };
  const stop = stops[stopId];
  if (!stop) return null;
  const el = stop.el();
  if (!el) return null;
  const rect = stop.text ? getTitleTextRect(el) : el.getBoundingClientRect();
  if (!rect) return null;
  return bflyAnchorFromRect(rect, stop.mode);
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

function setBflyAtAnchor(stopId) {
  const bfly = document.getElementById("heroBfly");
  const target = getBflyStopAnchor(stopId);
  if (!bfly || !target) return;
  applyPageBflyPos(bfly, target);
  pageBfly.currentStop = stopId;
}

function getActiveBflyStop() {
  const probeY = window.innerHeight * 0.36;

  for (const { id, el } of BFLY_SECTIONS) {
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

  return pageBfly.currentStop || "hero";
}

function followBflyAnchor(stopId) {
  const bfly = document.getElementById("heroBfly");
  const target = getBflyStopAnchor(stopId);
  if (!bfly || !target) return;
  applyPageBflyPos(bfly, target);
}

function buildSectionTravelPath(fromX, fromY, target) {
  const size = bflyLiveSize();
  const hh = size * (168 / 200);
  const px = target.left;
  const py = target.top;
  const r = Math.max(size * 1.45, 38);
  const spin = Math.random() < 0.5 ? 1 : -1;

  return enrichFlightPoints([
    { x: fromX, y: fromY },
    { x: fromX + (px - fromX) * 0.35 + size * 0.4 * spin, y: fromY + (py - fromY) * 0.28 - size * 0.75 },
    { x: fromX + (px - fromX) * 0.68 + size * 0.15 * spin, y: fromY + (py - fromY) * 0.58 - size * 0.28 },
    { x: px + r * 0.85 * spin, y: py - r * 0.5 },
    { x: px - r * 0.45 * spin, y: py - r * 0.08 },
    { x: px + r * 0.22 * spin, y: py + r * 0.32 },
    { x: px + size * 0.12, y: py - hh * 0.16 },
  ]);
}

function stopBflyFlight(bfly) {
  if (pageBfly.flightTl) {
    pageBfly.flightTl.kill();
    pageBfly.flightTl = null;
  }
  if (bfly) gsap.killTweensOf(bfly);
  pageBfly.flying = false;
  pageBfly.flyingTo = null;
  if (bfly) bfly.classList.remove("is-flying", "is-circling");
}

function finishBflyLanding(bfly, stopId) {
  pageBfly.flightTl = null;
  pageBfly.flying = false;
  pageBfly.flyingTo = null;
  pageBfly.currentStop = stopId;
  bfly.classList.remove("is-flying", "is-circling");
  bfly.classList.add("is-perched");
  followBflyAnchor(stopId);
}

function flyBflyToStop(stopId) {
  if (!pageBfly.active) return;
  const bfly = document.getElementById("heroBfly");
  const target = getBflyStopAnchor(stopId);
  if (!bfly || !target || !window.gsap) return;

  if (stopId === pageBfly.currentStop && !pageBfly.flying) {
    followBflyAnchor(stopId);
    return;
  }

  if (pageBfly.flying && pageBfly.flyingTo === stopId) return;

  const fromX = gsap.getProperty(bfly, "x") || 0;
  const fromY = gsap.getProperty(bfly, "y") || 0;

  stopBflyFlight(bfly);

  pageBfly.flying = true;
  pageBfly.flyingTo = stopId;
  bfly.classList.remove("is-perched");
  bfly.classList.add("is-flying", "is-circling");
  gsap.set(bfly, { position: "fixed", left: 0, top: 0, margin: 0, opacity: 1 });

  const flightPath = buildSectionTravelPath(fromX, fromY, target);
  const travelSegs = 3;
  const orbitSegs = flightPath.length - 1 - travelSegs;
  const travelDur = 3.1;
  const orbitDur = 1.45;
  const landDur = 1.35;

  const tl = gsap.timeline({
    onComplete: () => finishBflyLanding(bfly, stopId),
  });
  pageBfly.flightTl = tl;

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
    x: () => getBflyStopAnchor(stopId)?.left ?? target.left,
    y: () => getBflyStopAnchor(stopId)?.top ?? target.top,
    rotation: () => getBflyStopAnchor(stopId)?.rotation ?? target.rotation,
    scale: 1,
    duration: landDur,
    ease: "power1.out",
  });
}

function tickBflyOnScroll() {
  if (!pageBfly.active) return;
  const stop = getActiveBflyStop();
  if (!stop) return;

  if (pageBfly.flying) {
    if (stop !== pageBfly.flyingTo) flyBflyToStop(stop);
    return;
  }

  if (stop !== pageBfly.currentStop) {
    flyBflyToStop(stop);
    return;
  }

  followBflyAnchor(stop);
}

function scheduleBflyScrollTick() {
  if (!pageBfly.active || bflyScrollRaf) return;
  bflyScrollRaf = requestAnimationFrame(() => {
    bflyScrollRaf = 0;
    tickBflyOnScroll();
  });
}

function bindBflyScroll() {
  if (pageBfly.scrollBound) return;
  pageBfly.scrollBound = true;
  window.addEventListener("scroll", scheduleBflyScrollTick, { passive: true });
}

function promoteButterflyToPage(bfly) {
  const wrap = document.getElementById("heroButterfly");
  if (!wrap || !bfly || pageBfly.active) return;

  const rect = bfly.getBoundingClientRect();
  const rotation = window.gsap ? (gsap.getProperty(bfly, "rotation") || 8) : 8;
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

  pageBfly.active = true;
  pageBfly.currentStop = "hero";

  bindBflyScroll();
  scheduleBflyScrollTick();

  window.addEventListener("resize", onBflyResize, { passive: true });
}

function onBflyResize() {
  if (!pageBfly.active || pageBfly.flying) return;
  setBflyAtAnchor(pageBfly.currentStop);
}

function perchHeroButterfly() {
  const bfly = document.getElementById("heroBfly");
  const perch = getHeroButterflyPerch();
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
  promoteButterflyToPage(bfly);
}

function flyHeroButterfly() {
  if (heroButterflyStarted) return;
  const bfly = document.getElementById("heroBfly");
  const oval = document.querySelector(".hero__oval");
  const layout = getHeroButterflyLayout();
  if (!bfly || !oval || !layout) return;

  const { perch } = layout;
  heroButterflyStarted = true;
  bfly.classList.add("is-visible");

  if (reducedMotion || !window.gsap) {
    perchHeroButterfly();
    return;
  }

  const flightPath = buildHeroNaturalPath(layout);
  const entry = flightPath[0];

  gsap.set(bfly, {
    x: entry.x,
    y: entry.y,
    rotation: entry.rotation ?? -28,
    scale: 0.82,
    opacity: 0,
  });
  bfly.classList.add("is-flying");

  const tl = gsap.timeline({ delay: 0.05 });
  tl.to(bfly, { opacity: 1, duration: 0.35, ease: "sine.out" })
    .add(() => bfly.classList.add("is-circling"), 0.1);

  let prev = entry;
  flightPath.slice(1).forEach((point, i) => {
    const isLanding = i === flightPath.length - 2;
    tl.to(bfly, {
      x: point.x,
      y: point.y,
      rotation: point.rotation,
      scale: point.scale,
      duration: isLanding ? 1.05 : flightSegmentDuration(prev, point),
      ease: isLanding ? "power2.out" : "sine.inOut",
    });
    prev = point;
  });

  tl.add(() => {
    bfly.classList.remove("is-circling", "is-flying");
    bfly.classList.add("is-perched");
    promoteButterflyToPage(bfly);
  });
}

function scheduleHeroButterfly() {
  if (heroButterflyStarted) return;
  const run = () => flyHeroButterfly();
  if (document.fonts?.ready) {
    document.fonts.ready.then(run);
  } else {
    run();
  }
}

/* ============================================================
   SCROLL PROMPT — appears after intro, hides on first scroll
   ============================================================ */
let scrollPromptShown = false;
let scrollPromptDismissed = false;
let scrollPromptListenersBound = false;

function dismissScrollPrompt() {
  if (scrollPromptDismissed) return;
  scrollPromptDismissed = true;
  const prompt = document.getElementById("scrollPrompt");
  if (!prompt) return;

  const hide = () => {
    prompt.classList.add("is-dismissed");
    prompt.classList.remove("is-visible");
    prompt.setAttribute("aria-hidden", "true");
    prompt.style.display = "none";
  };

  if (window.gsap) gsap.killTweensOf(prompt);
  if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.to(prompt, { autoAlpha: 0, y: 14, duration: 0.3, ease: "power2.in", onComplete: hide });
  } else {
    hide();
  }

  window.removeEventListener("scroll", onScrollDismiss, { passive: true });
  window.removeEventListener("wheel", onWheelDismiss, { passive: true });
  window.removeEventListener("touchstart", onTouchDismiss, { passive: true });
  window.removeEventListener("touchmove", onTouchDismiss, { passive: true });
}

function onScrollDismiss() {
  if (window.scrollY > 0) dismissScrollPrompt();
}

function onWheelDismiss(e) {
  if (Math.abs(e.deltaY) > 0) dismissScrollPrompt();
}

let touchDismissStartY = 0;
function onTouchDismiss(e) {
  if (e.type === "touchstart") {
    touchDismissStartY = e.touches[0].clientY;
    return;
  }
  if (Math.abs(touchDismissStartY - e.touches[0].clientY) > 8) dismissScrollPrompt();
}

function showScrollPrompt() {
  if (scrollPromptShown || scrollPromptDismissed) return;
  const prompt = document.getElementById("scrollPrompt");
  if (!prompt) return;

  scrollPromptShown = true;
  prompt.style.display = "";
  prompt.setAttribute("aria-hidden", "false");
  prompt.classList.add("is-visible");
  if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.fromTo(prompt,
      { y: 18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.75, ease: "back.out(1.3)" }
    );
  }
}

function initScrollPrompt() {
  const prompt = document.getElementById("scrollPrompt");
  if (!prompt || scrollPromptListenersBound) return;
  scrollPromptListenersBound = true;

  window.addEventListener("scroll", onScrollDismiss, { passive: true });
  window.addEventListener("wheel", onWheelDismiss, { passive: true });
  window.addEventListener("touchstart", onTouchDismiss, { passive: true });
  window.addEventListener("touchmove", onTouchDismiss, { passive: true });

  prompt.querySelector(".scroll-prompt__link")?.addEventListener("click", dismissScrollPrompt);
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
  let W, H, DPR, petals = [];
  const COLORS = ["#f5e2e6", "#e7b9c2", "#ecd6a3", "#f5ecd9", "#c98b96"];

  function resize() {
    DPR = canvasDPR();
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function make() {
    const count = Math.round(Math.min(isNarrow ? 18 : isMobile ? 24 : 34, Math.max(12, W / (isNarrow ? 56 : 46))));
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
    if (document.body.classList.contains("intro-active")) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      p.y += p.sp; p.phase += 0.01; p.x += Math.sin(p.phase) * p.sway * 0.5; p.rot += p.rotSp;
      if (p.y - p.r > H) { p.y = -p.r * 2; p.x = Math.random() * W; }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
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
  el: null, ready: false, playing: false, maxVol: 0.38, swellRaf: 0,

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
    return Math.min(this.maxVol, 0.03 + level * 0.35);
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
    else this.play().then((ok) => { if (ok) this.swell(0.32, 1.8); });
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
  BackgroundMusic.play(0.04).then((ok) => {
    if (ok) BackgroundMusic.swell(0.1, 2.4);
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
        : "Thank you! We can't wait to celebrate with you, InshaAllah.";
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
  let W, H, DPR, dots = [], paused = false;

  function resize() {
    DPR = canvasDPR();
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
    if (paused || document.getElementById("introCanvas")?.dataset.active === "1") {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.y -= d.sp; d.ph += 0.012; d.x += Math.sin(d.ph) * 0.25;
      if (d.y < -4) { d.y = H + 4; d.x = Math.random() * W; }
      ctx.globalAlpha = d.a;
      ctx.fillStyle = d.hue;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!document.getElementById("intro")?.classList.contains("is-done")) {
      requestAnimationFrame(draw);
    }
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

  if (!intro || !envelope) {
    body.classList.remove("intro-active");
    revealHero();
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
      CinematicAudio.swellMusic(0.38, 1.5);
      setTimeout(runCanvasIntro, 300);
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
      CinematicAudio.swellMusic(0.2, 1.6);
    }, null, 1.7);

    // 3) Envelope gentle pulse
    tl.call(() => envelope.classList.add("is-pulsing"), null, 2.2);

    // 4) Envelope splits — both halves open forward toward the viewer
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
    tl.call(() => CinematicAudio.swellMusic(0.28, 2.4), null, 2.9);

    // 5) Envelope fades — grand curtains rise into view
    tl.call(() => {
      envelope.classList.add("is-gone");
      if (curtains) curtains.classList.add("is-visible");
    }, null, 4.0);

    // 7) Theatrical curtain sequence — spotlight, valance, tension, grand part
    tl.call(() => {
      if (curtains) curtains.classList.add("is-spotlit");
      CinematicAudio.swellMusic(0.22, 1.4);
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
      CinematicAudio.swellMusic(0.42, 3);
      runCanvasIntro();
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
