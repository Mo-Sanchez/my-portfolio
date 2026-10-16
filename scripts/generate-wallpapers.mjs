// Generates the built-in MoOS wallpapers as layered SVG landscapes:
// misty pine ridges that fade into fog, drawn far to near.
//
//   node scripts/generate-wallpapers.mjs
//
// These are stand-ins. Drop a real photo named `misty-forest.jpg` (or .webp/.png)
// into src/assets/wallpapers/ and it automatically becomes the default wallpaper.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const W = 2560;
const H = 1440;
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "assets", "wallpapers", "generated");

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ridgeFn(rand, base, amp) {
  const waves = Array.from({ length: 5 }, (_, i) => ({
    f: (0.6 + rand() * 1.4) * (i + 1) * 0.0011,
    p: rand() * Math.PI * 2,
    a: amp / (i + 1.3),
  }));
  return (x) => base + waves.reduce((y, w) => y + Math.sin(x * w.f + w.p) * w.a, 0);
}

const r = (n) => Math.round(n);

// A fir/pine silhouette as one closed subpath, drawn with tiers of drooping branches.
function tree(rand, x, baseY, h, tiers) {
  const width = h * (0.24 + rand() * 0.08);
  const left = [];
  const right = [];
  for (let i = 1; i <= tiers; i++) {
    const t = i / tiers;
    const y = baseY - h + h * t * 0.9;
    const tierH = (h * 0.9) / tiers;
    const wl = width * Math.pow(t, 0.85) * (0.85 + rand() * 0.3);
    const wr = width * Math.pow(t, 0.85) * (0.85 + rand() * 0.3);
    left.push([x - wl, y + tierH * 0.12], [x - wl * 0.38, y - tierH * 0.05]);
    right.push([x + wr * 0.38, y - tierH * 0.05], [x + wr, y + tierH * 0.12]);
  }
  const trunk = Math.max(1, width * 0.08);
  // The last notch on each side is replaced by the trunk.
  left.pop();
  right.shift();
  const pts = [
    [x, baseY - h - h * 0.04],
    ...left,
    [x - trunk, baseY + 2],
    [x + trunk, baseY + 2],
    ...right.reverse(),
  ];
  return "M" + pts.map(([px, py]) => `${r(px)} ${r(py)}`).join("L") + "Z";
}

function simpleTree(rand, x, baseY, h) {
  const w = h * (0.22 + rand() * 0.1);
  return `M${r(x)} ${r(baseY - h)}L${r(x - w)} ${r(baseY + 1)}L${r(x + w)} ${r(baseY + 1)}Z`;
}

function layer(rand, opts) {
  const { base, amp, color, treeMin, treeMax, spacing, tiers, density = 1 } = opts;
  const y = ridgeFn(rand, base, amp);
  // Traced right-to-left so it winds the same way as the trees; opposite
  // windings would cancel under the nonzero fill rule and leave seams.
  let d = `M${W} ${H}`;
  for (let x = W; x >= 0; x -= 16) d += `L${x} ${r(y(x) - treeMax * 0.1)}`;
  d += `L0 ${H}Z`;
  for (let x = -spacing; x < W + spacing; x += spacing * (0.55 + rand() * 0.9)) {
    if (rand() > density) continue;
    const h = treeMin + Math.pow(rand(), 1.6) * (treeMax - treeMin);
    const by = y(x) + rand() * h * 0.15;
    if (tiers <= 1) d += simpleTree(rand, x, by, h);
    else d += tree(rand, x, by, h, tiers);
  }
  return { path: `<path fill="${color}" d="${d}"/>`, y };
}

function wallpaper({ seed, sky, fog, haze, layers, glow, clouds }) {
  const rand = rng(seed);
  const defs = [];
  const body = [];

  defs.push(
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${sky
      .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
      .join("")}</linearGradient>`,
  );
  body.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);

  if (glow) {
    defs.push(
      `<radialGradient id="glow" cx="${glow.x}" cy="${glow.y}" r="${glow.r}"><stop offset="0" stop-color="${glow.color}" stop-opacity="${glow.opacity}"/><stop offset="1" stop-color="${glow.color}" stop-opacity="0"/></radialGradient>`,
    );
    body.push(`<rect width="${W}" height="${H}" fill="url(#glow)"/>`);
  }

  defs.push(
    `<radialGradient id="cloud"><stop offset="0" stop-color="${fog}" stop-opacity="0.9"/><stop offset="0.55" stop-color="${fog}" stop-opacity="0.45"/><stop offset="1" stop-color="${fog}" stop-opacity="0"/></radialGradient>`,
  );

  for (let c = 0; c < 5; c++) {
    body.push(
      `<ellipse cx="${r(rand() * W)}" cy="${r(180 + rand() * 360)}" rx="${r(500 + rand() * 700)}" ry="${r(50 + rand() * 90)}" fill="url(#cloud)" opacity="${(0.18 + rand() * 0.22).toFixed(2)}"/>`,
    );
  }

  layers.forEach((spec, i) => {
    const { path } = layer(rand, spec);
    body.push(path);
    // Mist settles into the valley in front of each ridge.
    const top = spec.base - spec.amp * 0.6;
    const bottom = spec.base + spec.mistDepth;
    defs.push(
      `<linearGradient id="mist${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fog}" stop-opacity="0"/><stop offset="0.6" stop-color="${fog}" stop-opacity="${spec.mist * 0.7}"/><stop offset="1" stop-color="${fog}" stop-opacity="${spec.mist}"/></linearGradient>`,
    );
    body.push(`<rect x="0" y="${r(top)}" width="${W}" height="${r(bottom - top)}" fill="url(#mist${i})"/>`);
    if (spec.mist > 0.05) body.push(`<rect x="0" y="${r(bottom)}" width="${W}" height="${r(H - bottom)}" fill="${fog}" opacity="${spec.mist}"/>`);

    for (let c = 0; c < (clouds[i] || 0); c++) {
      const cx = rand() * W;
      const cy = spec.base - spec.amp * (0.2 + rand() * 0.9);
      const rx = 260 + rand() * 520;
      const ry = 40 + rand() * 70;
      body.push(
        `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx)}" ry="${r(ry)}" fill="url(#cloud)" opacity="${(0.35 + rand() * 0.4).toFixed(2)}"/>`,
      );
    }
  });

  // Tall pines at the edges frame the scene and add foreground depth.
  const framing = layers[layers.length - 1].color;
  let frame = "";
  for (const [x, h] of [[70, 1180], [230, 900], [2330, 960], [2500, 1240]]) frame += tree(rand, x, H + 40, h, 10);
  body.push(`<path fill="${framing}" d="${frame}"/>`);

  // Gentle vignette and a darker floor so the dock and icons stay legible.
  defs.push(
    `<radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${haze}"/></radialGradient>`,
  );
  body.push(`<rect width="${W}" height="${H}" fill="url(#vig)"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs.join("")}</defs>${body.join("")}</svg>`;
}

function forestLayers(colors, mists) {
  return [
    { base: 620, amp: 150, color: colors[0], treeMin: 4, treeMax: 9, spacing: 5, tiers: 1, mist: mists[0], mistDepth: 170 },
    { base: 760, amp: 80, color: colors[1], treeMin: 12, treeMax: 22, spacing: 7, tiers: 1, mist: mists[1], mistDepth: 110 },
    { base: 860, amp: 85, color: colors[2], treeMin: 22, treeMax: 40, spacing: 10, tiers: 1, mist: mists[2], mistDepth: 120 },
    { base: 975, amp: 90, color: colors[3], treeMin: 38, treeMax: 66, spacing: 15, tiers: 3, mist: mists[3], mistDepth: 130 },
    { base: 1110, amp: 80, color: colors[4], treeMin: 66, treeMax: 118, spacing: 24, tiers: 4, mist: mists[4], mistDepth: 120 },
    { base: 1265, amp: 70, color: colors[5], treeMin: 120, treeMax: 210, spacing: 36, tiers: 5, mist: mists[5], mistDepth: 90 },
    { base: 1350, amp: 50, color: colors[6], treeMin: 240, treeMax: 430, spacing: 55, tiers: 7, mist: 0, mistDepth: 40, density: 0.9 },
  ];
}

const wallpapers = {
  "misty-forest": {
    seed: 7,
    sky: [
      [0, "#7f8b86"],
      [0.35, "#a1aaa6"],
      [0.6, "#b4bab7"],
      [1, "#a5aca8"],
    ],
    fog: "#aab1ad",
    haze: 0.35,
    glow: { x: 0.62, y: 0.28, r: 0.55, color: "#e8ede9", opacity: 0.35 },
    layers: forestLayers(
      ["#93a09a", "#7f8f87", "#68796f", "#4c6156", "#2e463b", "#1b3a30", "#0f251f"],
      [0.35, 0.45, 0.45, 0.42, 0.32, 0.18, 0],
    ),
    clouds: [4, 4, 4, 3, 3, 2],
  },
  "dawn-ridge": {
    seed: 21,
    sky: [
      [0, "#8d8f86"],
      [0.4, "#c2bdae"],
      [0.65, "#cfc6b4"],
      [1, "#b9b5a6"],
    ],
    fog: "#c4bfb0",
    haze: 0.3,
    glow: { x: 0.35, y: 0.42, r: 0.5, color: "#f1dfbf", opacity: 0.45 },
    layers: forestLayers(
      ["#a3a394", "#8e927f", "#748069", "#566950", "#384f3c", "#22382c", "#13241c"],
      [0.32, 0.42, 0.42, 0.38, 0.28, 0.16, 0],
    ),
    clouds: [2, 3, 2, 2, 1, 1],
  },
  "blue-hour": {
    seed: 42,
    sky: [
      [0, "#2c3a3e"],
      [0.45, "#53646a"],
      [0.7, "#6b7c80"],
      [1, "#56676b"],
    ],
    fog: "#6f8085",
    haze: 0.45,
    glow: { x: 0.5, y: 0.35, r: 0.55, color: "#a9bcc0", opacity: 0.25 },
    layers: forestLayers(
      ["#5a6b6f", "#4b5d60", "#3b4e4f", "#2a3e3c", "#1b302c", "#11231f", "#0a1714"],
      [0.32, 0.4, 0.42, 0.38, 0.3, 0.16, 0],
    ),
    clouds: [2, 2, 3, 2, 2, 1],
  },
  "night-pines": {
    seed: 99,
    sky: [
      [0, "#0e1413"],
      [0.5, "#1c2624"],
      [0.75, "#28332f"],
      [1, "#1c2523"],
    ],
    fog: "#33403c",
    haze: 0.5,
    glow: { x: 0.72, y: 0.2, r: 0.3, color: "#d9e2dc", opacity: 0.18 },
    layers: forestLayers(
      ["#26302d", "#212b28", "#1b2522", "#151f1c", "#101915", "#0b1310", "#070d0b"],
      [0.3, 0.38, 0.4, 0.36, 0.3, 0.16, 0],
    ),
    clouds: [1, 2, 2, 2, 1, 1],
  },
};

mkdirSync(outDir, { recursive: true });
for (const [id, spec] of Object.entries(wallpapers)) {
  const svg = wallpaper(spec);
  writeFileSync(join(outDir, `${id}.svg`), svg);
  console.log(`${id}.svg  ${(svg.length / 1024).toFixed(0)} KB`);
}
