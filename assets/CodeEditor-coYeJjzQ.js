import{r as x,j as i}from"./index-C5-7-11d.js";import{c as v,D as B,X as _,k as G,e as Y,m as U,b as X,E as K}from"./MoOS-CmOF8Yng.js";import"./content-B9E831KQ.js";const J=new Set("import export from default as const let var function return if else for while do switch case break continue new delete typeof instanceof in of class extends super this null undefined true false try catch finally throw async await yield type interface enum implements private public protected readonly static declare keyof satisfies void".split(" ")),V=/^@[\w-]+/;function d(n,o,a){if(!o)return;const e=n[n.length-1];e&&e.type===a?e.text+=o:n.push({text:o,type:a})}function R(n,o,a){let e=o+1;for(;e<n.length;)if(n[e]==="\\")e+=2;else{if(n[e]===a)return e+1;e++}return n.length}function A(n){for(let o=n.length-1;o>=0;o--)if(n[o].text.trim())return n[o]}function q(n,o,a){const e=[];let t=0;for(;t<n.length;){if(o.mode==="block"){const r=n.indexOf("*/",t);if(r===-1)return d(e,n.slice(t),"comment"),e;d(e,n.slice(t,r+2),"comment"),t=r+2,o.mode="code";continue}if(o.mode==="template"){let r=t;for(;r<n.length&&n[r]!=="`";)n[r]==="\\"&&r++,r++;if(r>=n.length)return d(e,n.slice(t),"string"),e;d(e,n.slice(t,r+1),"string"),t=r+1,o.mode="code";continue}const l=n.slice(t),s=n[t],p=/^\s+/.exec(l);if(p){d(e,p[0],"plain"),t+=p[0].length;continue}if(l.startsWith("//"))return d(e,l,"comment"),e;if(l.startsWith("/*")){o.mode="block",d(e,"/*","comment"),t+=2;continue}if(s==='"'||s==="'"){const r=R(n,t,s);d(e,n.slice(t,r),"string"),t=r;continue}if(s==="`"){o.mode="template",d(e,"`","string"),t+=1;continue}const m=/^(0[xob][\da-f_]+n?|\d[\d_]*(\.\d+)?(e[+-]?\d+)?n?|\.\d+)/i.exec(l);if(m){d(e,m[0],"number"),t+=m[0].length;continue}if(a&&s==="<"){const r=/^<\/?([A-Za-z][\w.]*)/.exec(l),u=A(e),g=u&&(u.type==="plain"||u.type==="number"||u.text.endsWith(")"));if(r&&!g){const w=r[0].length-r[1].length;d(e,r[0].slice(0,w),"punctuation"),d(e,r[1],"tag"),t+=r[0].length;continue}}const f=/^[A-Za-z_$][\w$]*/.exec(l);if(f){const r=f[0],u=n.slice(t+r.length),g=A(e);let w="plain";g&&g.text.endsWith(".")&&g.type==="punctuation"?(w="property",/^\s*\(/.test(u)&&(w="function")):J.has(r)?w="keyword":/^\s*(<[^>]*>)?\s*\(/.test(u)&&!(g&&g.text==="new")?w="function":/^[A-Z]/.test(r)?w="type":/^\??:(?!:)/.test(u)&&(w="property"),d(e,r,w),t+=r.length;continue}/[{}()[\];,.]/.test(s)?d(e,s,"punctuation"):d(e,s,"operator"),t+=1}return e}function Z(n,o){const a=[];let e=0;for(;e<n.length;){if(o.mode==="block"){const u=n.indexOf("*/",e);if(u===-1)return d(a,n.slice(e),"comment"),a;d(a,n.slice(e,u+2),"comment"),e=u+2,o.mode="code";continue}const t=n.slice(e),l=n[e],s=/^\s+/.exec(t);if(s){d(a,s[0],"plain"),e+=s[0].length;continue}if(t.startsWith("/*")){o.mode="block",d(a,"/*","comment"),e+=2;continue}if(l==='"'||l==="'"){const u=R(n,e,l);d(a,n.slice(e,u),"string"),e=u;continue}const p=V.exec(t);if(p){d(a,p[0],"keyword"),e+=p[0].length;continue}const m=/^#[\da-f]{3,8}\b/i.exec(t);if(m&&o.depth>0){d(a,m[0],"number"),e+=m[0].length;continue}const f=/^-?(\d*\.)?\d+(%|[a-z]+)?/i.exec(t);if(f){d(a,f[0],"number"),e+=f[0].length;continue}const r=/^-*[A-Za-z_][\w-]*/.exec(t);if(r){const u=r[0],g=n.slice(e+u.length),w=g.indexOf("{"),k=g.indexOf(";"),b=n[e-1],I=w!==-1&&(k===-1||w<k)&&b!=="(";let h="plain";/^\(/.test(g)?h="function":I||o.depth===0&&/^\s*,?\s*$/.test(g)?b==="."||b==="#"?h="type":b===":"?h="keyword":h="tag":/^\s*:/.test(g)&&(h="property"),d(a,u,h),e+=u.length;continue}l==="{"&&(o.depth+=1),l==="}"&&(o.depth=Math.max(0,o.depth-1)),/[{}()[\];,.:#]/.test(l)?d(a,l,"punctuation"):d(a,l,"operator"),e+=1}return a}function Q(n,o){const a={mode:"code",depth:0};return n.split(`
`).map(e=>{const t=e.replace(/\r$/,"");try{return o==="css"?Z(t,a):q(t,a,o==="tsx")}catch{return[{text:t,type:"plain"}]}})}function ee(n){return n.endsWith(".tsx")?"tsx":n.endsWith(".css")?"css":n.endsWith(".ts")?"ts":"js"}const ne=`// Generates the built-in MoOS wallpapers as layered SVG landscapes:
// misty pine ridges that fade into fog, drawn far to near.
//
//   node scripts/generate-wallpapers.mjs
//
// These are stand-ins. Drop a real photo named \`misty-forest.jpg\` (or .webp/.png)
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
  return "M" + pts.map(([px, py]) => \`\${r(px)} \${r(py)}\`).join("L") + "Z";
}

function simpleTree(rand, x, baseY, h) {
  const w = h * (0.22 + rand() * 0.1);
  return \`M\${r(x)} \${r(baseY - h)}L\${r(x - w)} \${r(baseY + 1)}L\${r(x + w)} \${r(baseY + 1)}Z\`;
}

function layer(rand, opts) {
  const { base, amp, color, treeMin, treeMax, spacing, tiers, density = 1 } = opts;
  const y = ridgeFn(rand, base, amp);
  // Traced right-to-left so it winds the same way as the trees; opposite
  // windings would cancel under the nonzero fill rule and leave seams.
  let d = \`M\${W} \${H}\`;
  for (let x = W; x >= 0; x -= 16) d += \`L\${x} \${r(y(x) - treeMax * 0.1)}\`;
  d += \`L0 \${H}Z\`;
  for (let x = -spacing; x < W + spacing; x += spacing * (0.55 + rand() * 0.9)) {
    if (rand() > density) continue;
    const h = treeMin + Math.pow(rand(), 1.6) * (treeMax - treeMin);
    const by = y(x) + rand() * h * 0.15;
    if (tiers <= 1) d += simpleTree(rand, x, by, h);
    else d += tree(rand, x, by, h, tiers);
  }
  return { path: \`<path fill="\${color}" d="\${d}"/>\`, y };
}

function wallpaper({ seed, sky, fog, haze, layers, glow, clouds }) {
  const rand = rng(seed);
  const defs = [];
  const body = [];

  defs.push(
    \`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">\${sky
      .map(([o, c]) => \`<stop offset="\${o}" stop-color="\${c}"/>\`)
      .join("")}</linearGradient>\`,
  );
  body.push(\`<rect width="\${W}" height="\${H}" fill="url(#sky)"/>\`);

  if (glow) {
    defs.push(
      \`<radialGradient id="glow" cx="\${glow.x}" cy="\${glow.y}" r="\${glow.r}"><stop offset="0" stop-color="\${glow.color}" stop-opacity="\${glow.opacity}"/><stop offset="1" stop-color="\${glow.color}" stop-opacity="0"/></radialGradient>\`,
    );
    body.push(\`<rect width="\${W}" height="\${H}" fill="url(#glow)"/>\`);
  }

  defs.push(
    \`<radialGradient id="cloud"><stop offset="0" stop-color="\${fog}" stop-opacity="0.9"/><stop offset="0.55" stop-color="\${fog}" stop-opacity="0.45"/><stop offset="1" stop-color="\${fog}" stop-opacity="0"/></radialGradient>\`,
  );

  for (let c = 0; c < 5; c++) {
    body.push(
      \`<ellipse cx="\${r(rand() * W)}" cy="\${r(180 + rand() * 360)}" rx="\${r(500 + rand() * 700)}" ry="\${r(50 + rand() * 90)}" fill="url(#cloud)" opacity="\${(0.18 + rand() * 0.22).toFixed(2)}"/>\`,
    );
  }

  layers.forEach((spec, i) => {
    const { path } = layer(rand, spec);
    body.push(path);
    // Mist settles into the valley in front of each ridge.
    const top = spec.base - spec.amp * 0.6;
    const bottom = spec.base + spec.mistDepth;
    defs.push(
      \`<linearGradient id="mist\${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="\${fog}" stop-opacity="0"/><stop offset="0.6" stop-color="\${fog}" stop-opacity="\${spec.mist * 0.7}"/><stop offset="1" stop-color="\${fog}" stop-opacity="\${spec.mist}"/></linearGradient>\`,
    );
    body.push(\`<rect x="0" y="\${r(top)}" width="\${W}" height="\${r(bottom - top)}" fill="url(#mist\${i})"/>\`);
    if (spec.mist > 0.05) body.push(\`<rect x="0" y="\${r(bottom)}" width="\${W}" height="\${r(H - bottom)}" fill="\${fog}" opacity="\${spec.mist}"/>\`);

    for (let c = 0; c < (clouds[i] || 0); c++) {
      const cx = rand() * W;
      const cy = spec.base - spec.amp * (0.2 + rand() * 0.9);
      const rx = 260 + rand() * 520;
      const ry = 40 + rand() * 70;
      body.push(
        \`<ellipse cx="\${r(cx)}" cy="\${r(cy)}" rx="\${r(rx)}" ry="\${r(ry)}" fill="url(#cloud)" opacity="\${(0.35 + rand() * 0.4).toFixed(2)}"/>\`,
      );
    }
  });

  // Tall pines at the edges frame the scene and add foreground depth.
  const framing = layers[layers.length - 1].color;
  let frame = "";
  for (const [x, h] of [[70, 1180], [230, 900], [2330, 960], [2500, 1240]]) frame += tree(rand, x, H + 40, h, 10);
  body.push(\`<path fill="\${framing}" d="\${frame}"/>\`);

  // Gentle vignette and a darker floor so the dock and icons stay legible.
  defs.push(
    \`<radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="\${haze}"/></radialGradient>\`,
  );
  body.push(\`<rect width="\${W}" height="\${H}" fill="url(#vig)"/>\`);

  return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${W} \${H}" preserveAspectRatio="xMidYMid slice"><defs>\${defs.join("")}</defs>\${body.join("")}</svg>\`;
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
  writeFileSync(join(outDir, \`\${id}.svg\`), svg);
  console.log(\`\${id}.svg  \${(svg.length / 1024).toFixed(0)} KB\`);
}
`,te=`// Single source of truth for site copy. Edit text here, not in components.
// Anything marked PLACEHOLDER still needs real details before publishing.

export const profile = {
  name: "Moises Sanchez",
  role: "Software Engineer · Operations & Automation",
  location: "Lakeland, Florida",
  email: "Moisessanchez6100@gmail.com",
  github: "https://github.com/Mo-Sanchez",
  linkedin: "https://www.linkedin.com/in/moises-sanchez-/",
  resume: \`\${import.meta.env.BASE_URL}Moises_Sanchez_Resume.pdf\`,
  headline: "I build software that makes large-scale operations faster, cheaper, and easier to run.",
  intro:
    "Computer Science graduate from the University of Florida with five years inside Amazon Air's operations. " +
    "I find the manual, error-prone parts of a workflow, measure them, and replace them with tools people actually use.",
  status: "Open to software engineering, TPM, and technical program roles",
};

export type Metric = { value: string; label: string; detail: string };

export const metrics: Metric[] = [
  { value: "~$900K", label: "annual savings", detail: "Trailer loading process redesign" },
  { value: "94%", label: "less reporting time", detail: "Automated daily operations reports" },
  { value: "23%", label: "fewer shift labor hours", detail: "Headcount & labor optimization tool" },
  { value: "75%", label: "fewer ad-hoc shipments", detail: "From 64 to 16 per week" },
];

export const about = {
  paragraphs: [
    "I sit between engineering and operations. My degree is in Computer Science, and I've spent the last five years at Amazon Air planning aircraft loads under strict weight, balance, and timing constraints.",
    "That work taught me where software earns its keep: in the reports built by hand every shift, the staffing decisions made without data, and the processes that quietly cost money. I build internal tools and automation for those problems, then standardize the process so the improvement sticks.",
  ],
  focus: [
    { title: "Software & automation", text: "Internal tools in Java, C#, and Python that remove manual work." },
    { title: "Data-driven decisions", text: "Turning operational data into metrics, reports, and staffing plans." },
    { title: "Operations leadership", text: "Improving processes on the floor and getting teams to adopt them." },
  ],
  education: [
    { school: "University of Florida", credential: "B.S. Computer Science", date: "Dec 2025" },
    { school: "Polk State College", credential: "Associate of Arts", date: "Dec 2023" },
  ],
  certifications: [{ name: "AWS Certified Cloud Practitioner", date: "2026" }],
};

export type CaseStudy = {
  title: string;
  problem: string;
  action: string;
  result: string;
  metric: string;
};

export type Role = {
  company: string;
  title: string;
  location: string;
  period: string;
  summary: string;
  scope: string[];
  cases: CaseStudy[];
};

export const experience: Role[] = [
  {
    company: "Amazon Air",
    title: "Load Planner",
    location: "Lakeland, FL",
    period: "2021 — Present",
    summary:
      "Plan aircraft load configurations for an Amazon Air hub, balancing package dimensions, container types, and flight constraints to keep every departure within center-of-gravity limits and on schedule.",
    scope: [
      "Aircraft weight & balance planning",
      "Internal logistics simulation software",
      "Cross-shift process ownership",
      // PLACEHOLDER: add team leadership scope, e.g. "Led a team of N associates per shift"
      "[Placeholder: team size / leadership scope]",
    ],
    cases: [
      {
        title: "Trailer loading process",
        problem: "Inefficient trailer loading was forcing 64 ad-hoc shipments every week, each one an unplanned cost.",
        action: "Analyzed load and departure data to find the root causes, then redesigned and standardized the loading process across shifts.",
        result: "Ad-hoc shipments dropped from 64 to 16 per week.",
        metric: "~$900K saved annually",
      },
      {
        title: "Daily operations reporting",
        problem: "Daily operations reports were compiled by hand every shift, consuming hours of analyst time.",
        action: "Built a Java tool that ingests trailer load data from CSV, calculates on-time departure and cost metrics, and generates a formatted Excel report.",
        result: "Report time cut by 94%, freeing staff for operational work.",
        metric: "$1,200 / week in labor",
      },
      {
        title: "Labor planning",
        problem: "Shift staffing wasn't tied to actual volume, leading to overstaffed hours.",
        action: "Used operational data to build a headcount tracking and labor optimization tool that aligned staffing with workload.",
        result: "Shift labor hours reduced by nearly a quarter.",
        metric: "23% fewer labor hours",
      },
    ],
  },
];

export type ProjectCategory = "operations-tools" | "automation-ai" | "apps-games";

export const projectCategories: { id: ProjectCategory; label: string; description: string }[] = [
  { id: "operations-tools", label: "Operations Tools", description: "Internal tools used in live operations." },
  { id: "automation-ai", label: "Automation & AI", description: "Scrapers, pipelines, and assistants." },
  { id: "apps-games", label: "Apps & Games", description: "Products and team-built games." },
];

export type Project = {
  slug: string;
  category: ProjectCategory;
  name: string;
  tagline: string;
  problem: string;
  challenge: string;
  stack: string[];
  status?: string;
  image?: string;
  github?: string;
  demo?: string;
  note?: string;
};

export const featuredProjects: Project[] = [
  {
    slug: "mymedia",
    category: "apps-games",
    name: "MyMedia",
    status: "In development",
    // PLACEHOLDER: replace tagline/problem/challenge with MyMedia specifics
    tagline: "[Placeholder: one-sentence description of what MyMedia does and who it's for.]",
    problem: "[Placeholder: the problem MyMedia solves.]",
    challenge: "[Placeholder: the hardest technical or product decision so far, e.g. data model, sync, or search.]",
    stack: ["C#", "PostgreSQL"],
    // PLACEHOLDER: add github / demo / image once public
  },
  {
    slug: "aircraft-milestone-dashboard",
    category: "operations-tools",
    name: "Aircraft Milestone Dashboard",
    tagline: "A real-time operations dashboard that tracks each aircraft's critical milestones and counts down to departure.",
    problem: "Milestone status for each departing aircraft was spread across people and systems, so at-risk flights were hard to spot early.",
    challenge: "Keeping countdowns and milestone status consistent for every viewer in real time, while keeping the interface readable at a glance on a busy floor.",
    stack: ["C#", "Blazor", "Supabase", "PostgreSQL"],
    note: "Internal tool: source not public",
  },
  {
    slug: "trailer-delay-report",
    category: "operations-tools",
    name: "Trailer Delay Report Automation",
    tagline: "A desktop tool that turns raw trailer load data into a formatted, decision-ready Excel report in seconds.",
    problem: "Delay and on-time reporting was assembled manually every shift, which was slow and inconsistent.",
    challenge: "Handling messy CSV exports reliably and producing Excel output that matched the format leadership already used, so adoption required no retraining.",
    stack: ["Java", "Swing", "Apache POI"],
    note: "Internal tool: source not public",
  },
];

export const otherProjects: Project[] = [
  {
    slug: "flight-info-scraper",
    category: "automation-ai",
    name: "Flight Info Scraper & Webhook",
    tagline: "Scrapes flight information and posts formatted updates to a team chat via webhook, with modular timing, parsing, and delivery components.",
    problem: "",
    challenge: "",
    stack: ["Java", "Selenium"],
  },
  {
    slug: "phantom-sky",
    category: "apps-games",
    name: "Phantom Sky",
    tagline: "2D samurai-inspired action platformer with fast movement and precision combat, built with a student team.",
    problem: "",
    challenge: "",
    stack: ["Unity", "C#"],
    github: "https://github.com/Gator-Code-Studio/Phantom-Sky",
    demo: "https://play.unity.com/en/games/eeb6d377-a0eb-4fdb-98dc-824a55133886/phantom-sky",
  },
  {
    slug: "ai-voice-assistant",
    category: "automation-ai",
    name: "AI Voice Assistant",
    tagline: "Voice-driven assistant combining speech recognition, LLM text generation, and text-to-speech in one pipeline.",
    problem: "",
    challenge: "",
    stack: ["Python", "LLM APIs"],
  },
];

export const allProjects: Project[] = [...featuredProjects, ...otherProjects];

// Copy that still starts with "[Placeholder" is hidden in MoOS instead of shown raw.
export function isFilled(text: string | undefined): text is string {
  return Boolean(text && text.trim() && !text.trim().startsWith("[Placeholder"));
}

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["C#", "Java", "Python", "TypeScript / JavaScript", "SQL", "C++"] },
  { group: "Web & Applications", items: ["React", "Blazor", "HTML / CSS", "REST APIs", "Flask", "Java Swing"] },
  { group: "Data & Backend", items: ["PostgreSQL", "Supabase", "MongoDB", "Apache POI", "Selenium"] },
  { group: "Tools & Platforms", items: ["Git / GitHub", "AWS (EC2)", "Docker", "Linux", "JetBrains Rider", "Unity"] },
  {
    group: "Professional",
    items: ["Process Improvement", "Automation", "Data Analysis", "Technical Leadership", "Program Management"],
  },
];

export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
`,ie=`// The MoOS virtual filesystem. Files, the Terminal, and the Reader all read
// from this one tree, and every file is generated from src/data/content.ts so
// there is a single source of truth for portfolio facts.

import {
  about,
  allProjects,
  experience,
  isFilled,
  metrics,
  profile,
  projectCategories,
  skills,
  type Project,
} from "../data/content";
import { appList, type AppId } from "./apps/meta";
import { shortcutsText } from "./shortcuts";

export type OpenTarget = { appId: AppId; route: string } | { url: string };

type NodeBase = { name: string; label: string };
export type FolderNode = NodeBase & { kind: "folder"; description?: string; children: FsNode[] };
export type FileKind = "text" | "project" | "app" | "pdf" | "link";
export type FileNode = NodeBase & {
  kind: "file";
  type: FileKind;
  // App to use for a file icon (apps and project files).
  iconApp?: AppId;
  slug?: string;
  open: OpenTarget;
  text: () => string;
  size?: number;
};
export type FsNode = FolderNode | FileNode;

export const HOME = "/home/moises";

function textFile(name: string, label: string, path: string, text: () => string): FileNode {
  return { kind: "file", type: "text", name, label, open: { appId: "reader", route: path }, text };
}

function appFile(name: string, label: string, appId: AppId, route = ""): FileNode {
  const meta = appList.find((a) => a.id === appId);
  return {
    kind: "file",
    type: "app",
    name,
    label,
    iconApp: appId,
    open: { appId, route },
    text: () => \`\${label}: \${meta?.description || "application"}.\\nOpen it with: open \${name}\`,
  };
}

function resumeFile(): FileNode {
  return {
    kind: "file",
    type: "pdf",
    name: "resume.pdf",
    label: "Résumé.pdf",
    open: { appId: "resume", route: "" },
    text: () => "resume.pdf is a PDF document. Run \`resume\` or \`open resume.pdf\` to view it.",
  };
}

const categoryLabel = (id: string) => projectCategories.find((c) => c.id === id)?.label || id;

export function projectText(p: Project) {
  const lines = [\`# \${p.name}\`, ""];
  if (isFilled(p.tagline)) lines.push(p.tagline, "");
  if (p.status) lines.push(\`Status:     \${p.status}\`);
  lines.push(\`Category:   \${categoryLabel(p.category)}\`);
  lines.push(\`Stack:      \${p.stack.join(", ")}\`);
  if (isFilled(p.problem)) lines.push("", "## Problem", p.problem);
  if (isFilled(p.challenge)) lines.push("", "## Key challenge", p.challenge);
  const links: string[] = [];
  if (p.github) links.push(\`Source:     \${p.github}\`);
  if (p.demo) links.push(\`Live demo:  \${p.demo}\`);
  if (p.note) links.push(\`Note:       \${p.note}\`);
  if (links.length) lines.push("", ...links);
  return lines.join("\\n");
}

export function aboutText() {
  return [
    \`\${profile.name}\`,
    \`\${profile.role}\`,
    \`\${profile.location}\`,
    "",
    profile.headline,
    "",
    ...about.paragraphs.flatMap((p) => [p, ""]),
    "Focus",
    ...about.focus.map((f) => \`  • \${f.title}: \${f.text}\`),
    "",
    \`Status: \${profile.status}\`,
  ].join("\\n");
}

export function educationText() {
  return about.education.map((e) => \`\${e.credential}\\n  \${e.school} · \${e.date}\`).join("\\n\\n");
}

export function certificationsText() {
  return about.certifications.map((c) => \`\${c.name} (\${c.date})\`).join("\\n");
}

export function skillsText() {
  return skills.map((g) => \`\${g.group}\\n  \${g.items.join(" · ")}\`).join("\\n\\n");
}

export function contactText() {
  return [
    \`Email     \${profile.email}\`,
    \`LinkedIn  \${profile.linkedin}\`,
    \`GitHub    \${profile.github}\`,
    "",
    "Run \`open contact\` to write a message, or \`resume\` for the PDF.",
  ].join("\\n");
}

export function experienceText() {
  const out: string[] = [];
  for (const role of experience) {
    out.push(\`\${role.title} · \${role.company}\`, \`\${role.period} · \${role.location}\`, "", role.summary, "");
    for (const c of role.cases) {
      out.push(\`## \${c.title}  [\${c.metric}]\`, \`Problem: \${c.problem}\`, \`Action:  \${c.action}\`, \`Result:  \${c.result}\`, "");
    }
  }
  out.push("Impact at a glance", ...metrics.map((m) => \`  \${m.value.padEnd(7)} \${m.label} (\${m.detail})\`));
  return out.join("\\n");
}

function readmeText() {
  return [
    "# Welcome to MoOS",
    "",
    \`MoOS is \${profile.name}'s portfolio, built as a small desktop operating system\`,
    "in React and TypeScript. Everything here is real portfolio content.",
    "",
    "Quick start",
    "  • Projects live in ~/projects. Open any project file for details.",
    "  • The résumé is in ~/documents/resume.pdf.",
    "  • Press Ctrl+K (⌘K on Mac) to search apps, projects, and skills.",
    "  • In Terminal, type \`help\` to see every command.",
    "",
    "Prefer a simple page? Add ?view=classic to the address.",
  ].join("\\n");
}

function projectFile(p: Project): FileNode {
  return {
    kind: "file",
    type: "project",
    name: \`\${p.slug}.md\`,
    label: p.name,
    slug: p.slug,
    iconApp: "project",
    open: { appId: "project", route: p.slug },
    text: () => projectText(p),
  };
}

function buildTree(): FolderNode {
  const projectFolders: FolderNode[] = projectCategories.map((c) => ({
    kind: "folder",
    name: c.id,
    label: c.label,
    description: c.description,
    children: allProjects.filter((p) => p.category === c.id).map(projectFile),
  }));

  return {
    kind: "folder",
    name: "",
    label: "Home",
    children: [
      {
        kind: "folder",
        name: "desktop",
        label: "Desktop",
        children: [
          appFile("about-me.app", "About Me", "about"),
          appFile("projects.app", "Projects", "finder", "projects"),
          appFile("experience.app", "Experience", "experience"),
          resumeFile(),
          appFile("contact.app", "Contact", "contact"),
        ],
      },
      {
        kind: "folder",
        name: "projects",
        label: "Projects",
        description: "Everything I've built, grouped by kind.",
        children: projectFolders,
      },
      {
        kind: "folder",
        name: "documents",
        label: "Documents",
        children: [
          resumeFile(),
          appFile("experience.app", "Experience", "experience"),
          textFile("education.txt", "Education.txt", "documents/education.txt", educationText),
          textFile("certifications.txt", "Certifications.txt", "documents/certifications.txt", certificationsText),
          textFile("skills.txt", "Skills.txt", "documents/skills.txt", skillsText),
          textFile("keyboard-shortcuts.txt", "Keyboard Shortcuts.txt", "documents/keyboard-shortcuts.txt", shortcutsText),
        ],
      },
      {
        kind: "folder",
        name: "applications",
        label: "Applications",
        children: appList.filter((a) => !a.internal).map((a) => appFile(\`\${a.id}.app\`, a.title, a.id)),
      },
      textFile("about.txt", "About.txt", "about.txt", aboutText),
      textFile("contact.txt", "Contact.txt", "contact.txt", contactText),
      textFile("README.md", "README.md", "README.md", readmeText),
    ],
  };
}

export const root: FolderNode = buildTree();

export function splitPath(path: string) {
  return path.split("/").filter(Boolean);
}

export function getNode(parts: string[]): FsNode | null {
  let node: FsNode = root;
  for (const part of parts) {
    if (node.kind !== "folder") return null;
    const next: FsNode | undefined = node.children.find((c) => c.name === part);
    if (!next) return null;
    node = next;
  }
  return node;
}

// Resolve a shell-style path against the current directory. The filesystem is
// rooted at the home directory: "/", "~" and the absolute home path all map there.
export function resolvePath(cwd: string[], input: string): string[] {
  let parts: string[] = [...cwd];
  let rest = input.trim();
  if (rest === "" || rest === "~") return [];
  if (rest.startsWith(HOME)) {
    parts = [];
    rest = rest.slice(HOME.length);
  } else if (rest.startsWith("~/") || rest.startsWith("/")) {
    parts = [];
  }
  for (const seg of rest.replace(/^~/, "").split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return parts;
}

export function displayPath(parts: string[]) {
  if (parts.length === 0) return "~";
  return "~/" + parts.join("/");
}

export function absolutePath(parts: string[]) {
  if (parts.length === 0) return HOME;
  return \`\${HOME}/\${parts.join("/")}\`;
}

export function labelPath(parts: string[]) {
  const labels: string[] = [];
  let node: FsNode = root;
  for (const part of parts) {
    if (node.kind !== "folder") break;
    const next: FsNode | undefined = node.children.find((c) => c.name === part);
    if (!next) break;
    labels.push(next.label);
    node = next;
  }
  return labels;
}

// Depth-first list of every file, used by search.
export function allFiles(): { path: string[]; node: FileNode }[] {
  const out: { path: string[]; node: FileNode }[] = [];
  const walk = (folder: FolderNode, path: string[]) => {
    for (const child of folder.children) {
      const childPath = [...path, child.name];
      if (child.kind === "folder") walk(child, childPath);
      else out.push({ path: childPath, node: child });
    }
  };
  walk(root, []);
  return out;
}
`,oe=`// Search index for the launcher. Pure data so it's easy to test: each result
// carries an OSAction describing what selecting it should do.

import { about, allProjects, experience, isFilled, profile, projectCategories, skills } from "../data/content";
import { appList } from "./apps/meta";
import { allFiles } from "./fs";
import type { OSAction } from "./state/os";
import type { IconKind } from "./ui/AppIcon";

export type SearchKind = "App" | "Project" | "Section" | "Skill" | "Experience" | "Document" | "Action";

export type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: SearchKind;
  icon: IconKind;
  keywords: string;
  action: OSAction;
};

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const app of appList) {
    if (app.internal) continue;
    items.push({
      id: \`app:\${app.id}\`,
      title: app.title,
      subtitle: app.description,
      kind: "App",
      icon: app.id,
      keywords: app.keywords,
      action: { type: "open", appId: app.id },
    });
  }

  for (const p of allProjects) {
    let subtitle = p.stack.join(" · ");
    if (isFilled(p.tagline)) subtitle = p.tagline;
    const category = projectCategories.find((c) => c.id === p.category)?.label || "";
    items.push({
      id: \`project:\${p.slug}\`,
      title: p.name,
      subtitle,
      kind: "Project",
      icon: "project",
      keywords: [p.stack.join(" "), category, p.status || "", "project"].join(" "),
      action: { type: "open", appId: "project", route: p.slug },
    });
  }

  for (const c of projectCategories) {
    items.push({
      id: \`folder:\${c.id}\`,
      title: c.label,
      subtitle: \`Projects folder · \${c.description}\`,
      kind: "Section",
      icon: "folder",
      keywords: "projects folder category",
      action: { type: "open", appId: "finder", route: \`projects/\${c.id}\` },
    });
  }

  const sections: [string, string, OSAction, string][] = [
    ["All Projects", "Browse every project in Files", { type: "open", appId: "finder", route: "projects" }, "work portfolio built"],
    ["Skills", "Languages, frameworks, and tools", { type: "open", appId: "about", route: "skills" }, "tech stack toolkit"],
    ["Education", about.education.map((e) => e.credential).join(" · "), { type: "open", appId: "about", route: "education" }, "school university degree college uf"],
    ["Certifications", about.certifications.map((c) => c.name).join(" · "), { type: "open", appId: "about", route: "education" }, "aws cloud certified"],
    ["Impact Metrics", "Measured results from operations work", { type: "open", appId: "experience" }, "results savings numbers achievements"],
  ];
  for (const [title, subtitle, action, keywords] of sections) {
    items.push({ id: \`section:\${slugify(title)}\`, title, subtitle, kind: "Section", icon: "folder", keywords, action });
  }

  for (const role of experience) {
    items.push({
      id: \`role:\${slugify(role.company + role.title)}\`,
      title: \`\${role.title} · \${role.company}\`,
      subtitle: \`\${role.period} · \${role.location}\`,
      kind: "Experience",
      icon: "experience",
      keywords: role.scope.filter(isFilled).join(" ") + " job work career",
      action: { type: "open", appId: "experience" },
    });
    for (const c of role.cases) {
      items.push({
        id: \`case:\${slugify(c.title)}\`,
        title: c.title,
        subtitle: \`\${c.metric} · \${role.company}\`,
        kind: "Experience",
        icon: "experience",
        keywords: \`\${c.problem} \${c.result} case study\`,
        action: { type: "open", appId: "experience", route: slugify(c.title) },
      });
    }
  }

  for (const group of skills) {
    for (const skill of group.items) {
      items.push({
        id: \`skill:\${slugify(skill)}\`,
        title: skill,
        subtitle: \`Skill · \${group.group}\`,
        kind: "Skill",
        icon: "about",
        keywords: group.group,
        action: { type: "open", appId: "about", route: "skills" },
      });
    }
  }

  for (const { node } of allFiles()) {
    if (node.type !== "text" || !("appId" in node.open)) continue;
    items.push({
      id: \`doc:\${node.name}\`,
      title: node.label,
      subtitle: "Document",
      kind: "Document",
      icon: "reader",
      keywords: "file document text",
      action: { type: "open", appId: node.open.appId, route: node.open.route },
    });
  }

  const actions: [string, string, OSAction, IconKind, string][] = [
    ["Download Résumé", "Moises_Sanchez_Resume.pdf", { type: "downloadResume" }, "resume", "resume cv pdf download"],
    ["Copy Email Address", profile.email, { type: "copyEmail" }, "contact", "email mail contact copy"],
    ["Email Moises", \`Write to \${profile.email}\`, { type: "open", appId: "contact" }, "contact", "email mail contact hire message"],
    ["LinkedIn Profile", "Opens in a new tab", { type: "url", url: profile.linkedin }, "contact", "linkedin social network"],
    ["GitHub Profile", "Opens in a new tab", { type: "url", url: profile.github }, "contact", "github code repositories source"],
    ["Use Dark Appearance", "Theme", { type: "theme", theme: "dark" }, "settings", "theme dark mode appearance night"],
    ["Use Light Appearance", "Theme", { type: "theme", theme: "light" }, "settings", "theme light mode appearance day"],
    ["Change Wallpaper", "Settings › Wallpaper", { type: "open", appId: "settings", route: "wallpaper" }, "settings", "wallpaper background desktop"],
  ];
  for (const [title, subtitle, action, icon, keywords] of actions) {
    items.push({ id: \`action:\${slugify(title)}\`, title, subtitle, kind: "Action", icon, keywords, action });
  }

  return items;
}

const SUGGESTED = ["app:finder", "app:experience", "app:resume", "app:about", "app:contact", "app:terminal"];

function score(item: SearchItem, tokens: string[]) {
  const title = item.title.toLowerCase();
  const rest = \`\${item.subtitle} \${item.keywords} \${item.kind}\`.toLowerCase();
  let total = 0;
  for (const t of tokens) {
    if (title === t) total += 120;
    else if (title.startsWith(t)) total += 80;
    else if (new RegExp(\`\\\\b\${t.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&")}\`).test(title)) total += 55;
    else if (title.includes(t)) total += 35;
    else if (rest.includes(t)) total += 12;
    else return 0;
  }
  // Prefer apps and projects over long-tail matches when scores tie.
  if (item.kind === "App" || item.kind === "Project") total += 6;
  return total;
}

export function search(index: SearchItem[], query: string, limit = 14): SearchItem[] {
  const tokens = query.toLowerCase().trim().split(/\\s+/).filter(Boolean);
  if (tokens.length === 0) {
    const suggested = SUGGESTED.map((id) => index.find((i) => i.id === id)).filter((i): i is SearchItem => Boolean(i));
    const projects = index.filter((i) => i.kind === "Project").slice(0, 4);
    return [...suggested, ...projects];
  }
  return index
    .map((item) => ({ item, s: score(item, tokens) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((r) => r.item);
}
`,se=`import { Component, memo, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { appComponents, titleOf } from "../apps/registry";
import { appMeta, type AppId } from "../apps/meta";
import { clamp, cx } from "../lib/util";
import { useOS } from "../state/os";
import { clampRect, type Rect, type WindowState } from "../state/windows";
import AppIcon from "../ui/AppIcon";
import { MaximizeIcon, MinimizeIcon, RestoreIcon, XIcon } from "../ui/Glyphs";

// ---------------------------------------------------------------------------
// App host: loads the app lazily and contains crashes to a single window.
// ---------------------------------------------------------------------------

class AppErrorBoundary extends Component<{ children: ReactNode; name: string }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="appState" role="alert">
          <p className="appStateTitle">{this.props.name} ran into a problem.</p>
          <p className="muted">Something went wrong while loading this app.</p>
          <button type="button" className="btn" onClick={() => this.setState({ error: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AppLoading() {
  return (
    <div className="appState" aria-busy="true">
      <div className="spinner" />
      <span className="srOnly">Loading…</span>
    </div>
  );
}

type HostProps = {
  appId: AppId;
  route: string;
  windowId: string;
  active: boolean;
  setRoute: (route: string) => void;
};

// Memoized so window moves and focus changes don't re-render app content.
export const AppHost = memo(function AppHost({ appId, route, windowId, active, setRoute }: HostProps) {
  const App = appComponents[appId];
  return (
    <AppErrorBoundary name={appMeta[appId].title}>
      <Suspense fallback={<AppLoading />}>
        <App windowId={windowId} route={route} setRoute={setRoute} active={active} />
      </Suspense>
    </AppErrorBoundary>
  );
});

// ---------------------------------------------------------------------------
// Window frame
// ---------------------------------------------------------------------------

type Hint = "left" | "right" | "max" | null;
const DIRS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;
type Dir = (typeof DIRS)[number];

function WindowFrame({ win, focused, z }: { win: WindowState; focused: boolean; z: number }) {
  const os = useOS();
  const { focusWindow, setWindowRect, toggleMaximize, snapWindow, closeWindow, minimizeWindow, setWindowRoute } = os;
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState<Rect | null>(null);
  const [hint, setHint] = useState<Hint>(null);
  const [mode, setMode] = useState<"idle" | "drag" | "resize">("idle");
  const cleanup = useRef<(() => void) | null>(null);
  const appId = win.appId as AppId;
  const meta = appMeta[appId];
  const floating = !win.maximized && win.snap === "none";

  useEffect(() => () => cleanup.current?.(), []);

  // Move keyboard focus into the window when it becomes active.
  useEffect(() => {
    const el = ref.current;
    if (focused && !win.minimized && el && !el.contains(document.activeElement)) {
      el.focus({ preventScroll: true });
    }
  }, [focused, win.minimized]);

  const track = (onMove: (ev: PointerEvent) => void, onEnd: () => void) => {
    const end = (ev?: PointerEvent) => {
      // Browsers coalesce pointermove, so the release point can be newer than
      // the last move we saw. Apply it so the window lands under the cursor.
      if (ev?.type === "pointerup") onMove(ev);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      document.documentElement.classList.remove("isInteracting");
      cleanup.current = null;
      onEnd();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    cleanup.current = end;
  };

  const desktopBox = () => ref.current?.parentElement?.getBoundingClientRect();

  const onTitlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const el = ref.current;
    const desk = desktopBox();
    if (!el || !desk) return;
    focusWindow(win.id);

    const box = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    let grabX = e.clientX - box.left;
    const grabY = e.clientY - box.top;
    let attached = !floating;
    let w = box.width;
    let h = box.height;
    if (attached) {
      w = win.rect.w;
      h = win.rect.h;
    }
    let moved = false;
    let last: Rect = win.rect;
    let lastHint: Hint = null;

    track(
      (ev) => {
        if (!moved) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 4) return;
          moved = true;
          setMode("drag");
          document.documentElement.classList.add("isInteracting");
        }
        if (attached) {
          // Pulling a maximized window off the edge: keep the cursor at the
          // same relative spot on the (now smaller) title bar.
          grabX = clamp(w * (grabX / box.width), 40, w - 40);
          attached = false;
        }
        const x = Math.round(ev.clientX - desk.left - grabX);
        const y = Math.round(clamp(ev.clientY - desk.top - grabY, 0, desk.height - 40));
        last = { x, y, w, h };
        setLive(last);

        let next: Hint = null;
        if (ev.clientX <= desk.left + 8) next = "left";
        else if (ev.clientX >= desk.right - 8) next = "right";
        else if (ev.clientY <= desk.top + 4) next = "max";
        if (next !== lastHint) {
          lastHint = next;
          setHint(next);
        }
      },
      () => {
        setMode("idle");
        setLive(null);
        setHint(null);
        if (!moved) return;
        const rect = clampRect(last, desk.width, desk.height);
        setWindowRect(win.id, rect, true);
        if (lastHint === "max") toggleMaximize(win.id);
        else if (lastHint) snapWindow(win.id, lastHint);
      },
    );
  };

  const onResizeDown = (dir: Dir) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = ref.current;
    const desk = desktopBox();
    if (!el || !desk) return;
    focusWindow(win.id);
    const box = el.getBoundingClientRect();
    const base: Rect = { x: box.left - desk.left, y: box.top - desk.top, w: box.width, h: box.height };
    const startX = e.clientX;
    const startY = e.clientY;
    let last = base;
    setMode("resize");
    document.documentElement.classList.add("isInteracting");

    track(
      (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let { x, y, w, h } = base;
        if (dir.includes("e")) w = Math.max(meta.minSize.w, Math.min(base.w + dx, desk.width - base.x));
        if (dir.includes("s")) h = Math.max(meta.minSize.h, Math.min(base.h + dy, desk.height - base.y));
        if (dir.includes("w")) {
          w = Math.max(meta.minSize.w, base.w - dx);
          x = base.x + base.w - w;
        }
        if (dir.includes("n")) {
          h = Math.max(meta.minSize.h, base.h - dy);
          y = base.y + base.h - h;
          if (y < 0) {
            h += y;
            y = 0;
          }
        }
        last = { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
        setLive(last);
      },
      () => {
        setMode("idle");
        setLive(null);
        setWindowRect(win.id, last, true);
      },
    );
  };

  const setRoute = useCallback(
    (route: string) => setWindowRoute(win.id, route, titleOf(appId, route)),
    [setWindowRoute, win.id, appId],
  );

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    let maxLabel = "Maximize";
    if (win.maximized) maxLabel = "Restore";
    os.openContextMenu({
      x: e.clientX,
      y: e.clientY,
      label: \`\${win.title} window\`,
      items: [
        { label: "Minimize", onSelect: () => minimizeWindow(win.id), shortcut: "Alt⇧M" },
        { label: maxLabel, onSelect: () => toggleMaximize(win.id), shortcut: "Alt⇧↑" },
        { label: "Snap Left", onSelect: () => snapWindow(win.id, "left"), shortcut: "Alt⇧←" },
        { label: "Snap Right", onSelect: () => snapWindow(win.id, "right"), shortcut: "Alt⇧→" },
        "separator",
        { label: "Close", onSelect: () => closeWindow(win.id), shortcut: "Alt⇧W", danger: true },
      ],
    });
  };

  const rect = live || win.rect;
  const style: React.CSSProperties = { zIndex: z };
  if (live || floating) {
    style.left = rect.x;
    style.top = rect.y;
    style.width = rect.w;
    style.height = rect.h;
  }

  let MaxGlyph = MaximizeIcon;
  let maxLabel = "Maximize";
  if (win.maximized) {
    MaxGlyph = RestoreIcon;
    maxLabel = "Restore";
  }

  let hintClass = "";
  if (hint === "left") hintClass = "snapLeft";
  if (hint === "right") hintClass = "snapRight";
  if (hint === "max") hintClass = "snapMax";

  return (
    <>
      {hint && <div className={cx("snapPreview", hintClass)} aria-hidden="true" />}
      <section
        ref={ref}
        className={cx(
          "window",
          focused && "isFocused",
          win.minimized && "isMinimized",
          win.closing && "isClosing",
          !live && win.maximized && "isMaximized",
          !live && win.snap === "left" && "isSnapLeft",
          !live && win.snap === "right" && "isSnapRight",
          mode === "idle" && "animGeom",
          mode === "drag" && "isDragging",
        )}
        style={style}
        aria-label={win.title}
        aria-hidden={win.minimized || undefined}
        tabIndex={-1}
        onPointerDownCapture={() => {
          if (!focused) focusWindow(win.id);
        }}
        data-window={win.id}
      >
        <header
          className="titlebar"
          onPointerDown={onTitlePointerDown}
          onDoubleClick={(e) => {
            if (!(e.target as HTMLElement).closest("button")) toggleMaximize(win.id);
          }}
          onContextMenu={onContextMenu}
        >
          <AppIcon app={appId} size={18} className="titleIcon" />
          <h2 className="winTitle">{win.title}</h2>
          <div className="winControls">
            <button type="button" className="winBtn" aria-label={\`Minimize \${win.title}\`} title="Minimize" onClick={() => minimizeWindow(win.id)}>
              <MinimizeIcon />
            </button>
            <button type="button" className="winBtn" aria-label={\`\${maxLabel} \${win.title}\`} title={maxLabel} onClick={() => toggleMaximize(win.id)}>
              <MaxGlyph width={14} height={14} />
            </button>
            <button type="button" className="winBtn winClose" aria-label={\`Close \${win.title}\`} title="Close" onClick={() => closeWindow(win.id)}>
              <XIcon />
            </button>
          </div>
        </header>

        <div className="winBody">
          <AppHost appId={appId} route={win.route} windowId={win.id} active={focused && !win.minimized} setRoute={setRoute} />
        </div>

        {floating &&
          DIRS.map((d) => <div key={d} className={\`rz rz-\${d}\`} onPointerDown={onResizeDown(d)} aria-hidden="true" />)}
      </section>
    </>
  );
}

export default memo(WindowFrame);
`,re=`// Deep links use the URL hash so they work on GitHub Pages without server
// rewrites: #/finder/projects, #/project/phantom-sky, #/resume.
//
// Anchors from the previous single-page portfolio (#projects, #contact, ...)
// still resolve, so existing shared links keep working.

export type Target = { appId: string; route: string };

const legacy: Record<string, Target> = {
  about: { appId: "about", route: "" },
  experience: { appId: "experience", route: "" },
  projects: { appId: "finder", route: "projects" },
  skills: { appId: "about", route: "skills" },
  contact: { appId: "contact", route: "" },
  resume: { appId: "resume", route: "" },
};

export function parseHash(hash: string): Target | null {
  let raw = hash.replace(/^#/, "");
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // Malformed escapes: use the raw string.
  }
  if (!raw || raw === "/") return null;

  if (!raw.startsWith("/")) return legacy[raw.toLowerCase()] || null;

  const parts = raw.slice(1).split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const appId = parts[0].toLowerCase();
  if (!/^[a-z][a-z0-9-]*$/.test(appId)) return null;
  return { appId, route: parts.slice(1).join("/") };
}

export function formatHash(target: Target | null) {
  if (!target) return "#/";
  const route = target.route
    .split("/")
    .filter(Boolean)
    .map((p) => encodeURIComponent(p))
    .join("/");
  if (route) return \`#/\${target.appId}/\${route}\`;
  return \`#/\${target.appId}\`;
}

export function sameTarget(a: Target | null, b: Target | null) {
  if (a === null || b === null) return a === b;
  return a.appId === b.appId && a.route === b.route;
}
`,ae=`// Window manager state. Pure reducer so it can be unit tested without a DOM.
//
// Geometry is stored as the window's "normal" rectangle. Maximized and snapped
// windows keep that rectangle so restoring returns them to where they were;
// the shell renders the maximized/snapped layout from CSS.

export type Rect = { x: number; y: number; w: number; h: number };
export type Snap = "none" | "left" | "right";

export type WindowState = {
  id: string;
  appId: string;
  route: string;
  title: string;
  rect: Rect;
  minimized: boolean;
  maximized: boolean;
  snap: Snap;
  closing: boolean;
};

export type WMState = {
  windows: Record<string, WindowState>;
  // Stacking order, bottom to top.
  order: string[];
  focused: string | null;
};

export type WMAction =
  | { type: "open"; id: string; appId: string; route: string; title: string; rect: Rect; maximized?: boolean }
  | { type: "focus"; id: string }
  | { type: "blur" }
  | { type: "minimize"; id: string }
  | { type: "close"; id: string }
  | { type: "remove"; id: string }
  | { type: "toggleMaximize"; id: string }
  | { type: "snap"; id: string; side: Snap }
  | { type: "move"; id: string; x: number; y: number }
  | { type: "setRect"; id: string; rect: Rect }
  | { type: "detach"; id: string; rect: Rect }
  | { type: "setRoute"; id: string; route: string; title?: string }
  | { type: "clamp"; width: number; height: number };

export const initialWM: WMState = { windows: {}, order: [], focused: null };

export function focusedWindow(state: WMState): WindowState | undefined {
  if (!state.focused) return undefined;
  return state.windows[state.focused];
}

// The window that should receive focus once \`excludeId\` goes away.
function topVisible(state: WMState, excludeId: string) {
  for (let i = state.order.length - 1; i >= 0; i--) {
    const id = state.order[i];
    const w = state.windows[id];
    if (id !== excludeId && w && !w.minimized && !w.closing) return id;
  }
  return null;
}

function raise(order: string[], id: string) {
  return [...order.filter((o) => o !== id), id];
}

function update(state: WMState, id: string, patch: Partial<WindowState>): WMState {
  const w = state.windows[id];
  if (!w) return state;
  return { ...state, windows: { ...state.windows, [id]: { ...w, ...patch } } };
}

// Keep at least a grabbable strip of the title bar inside the desktop.
export function clampRect(rect: Rect, width: number, height: number): Rect {
  const w = Math.min(rect.w, Math.max(width, 240));
  const h = Math.min(rect.h, Math.max(height, 160));
  const grab = 96;
  const x = Math.min(Math.max(rect.x, grab - w), width - grab);
  const y = Math.min(Math.max(rect.y, 0), Math.max(height - 40, 0));
  return { x, y, w, h };
}

export function wmReducer(state: WMState, action: WMAction): WMState {
  switch (action.type) {
    case "open": {
      const { id, appId, route, title, rect } = action;
      const win: WindowState = {
        id,
        appId,
        route,
        title,
        rect,
        minimized: false,
        maximized: Boolean(action.maximized),
        snap: "none",
        closing: false,
      };
      return { windows: { ...state.windows, [id]: win }, order: raise(state.order, id), focused: id };
    }
    case "focus": {
      const w = state.windows[action.id];
      if (!w || w.closing) return state;
      const isTop = state.order[state.order.length - 1] === action.id;
      if (state.focused === action.id && !w.minimized && isTop) return state;
      const next = update(state, action.id, { minimized: false });
      return { ...next, order: raise(state.order, action.id), focused: action.id };
    }
    case "blur":
      if (state.focused === null) return state;
      return { ...state, focused: null };
    case "minimize": {
      if (!state.windows[action.id]) return state;
      const next = update(state, action.id, { minimized: true });
      let focused = state.focused;
      if (focused === action.id) focused = topVisible(state, action.id);
      return { ...next, focused };
    }
    case "close": {
      if (!state.windows[action.id]) return state;
      const next = update(state, action.id, { closing: true });
      let focused = state.focused;
      if (focused === action.id) focused = topVisible(state, action.id);
      return { ...next, focused };
    }
    case "remove": {
      const w = state.windows[action.id];
      // A window reopened during its close animation is no longer closing; keep it.
      if (!w || !w.closing) return state;
      const windows = { ...state.windows };
      delete windows[action.id];
      let focused = state.focused;
      if (focused === action.id) focused = null;
      return { windows, order: state.order.filter((o) => o !== action.id), focused };
    }
    case "toggleMaximize": {
      const w = state.windows[action.id];
      if (!w) return state;
      let maximized = !w.maximized;
      if (w.snap !== "none") maximized = true;
      const next = update(state, action.id, { maximized, snap: "none", minimized: false });
      return { ...next, order: raise(state.order, action.id), focused: action.id };
    }
    case "snap": {
      const w = state.windows[action.id];
      if (!w) return state;
      const next = update(state, action.id, { snap: action.side, maximized: false, minimized: false });
      return { ...next, order: raise(state.order, action.id), focused: action.id };
    }
    case "move": {
      const w = state.windows[action.id];
      if (!w) return state;
      return update(state, action.id, { rect: { ...w.rect, x: action.x, y: action.y } });
    }
    case "setRect":
      return update(state, action.id, { rect: action.rect });
    case "detach":
      // Dragging a maximized or snapped window pulls it back to its normal size.
      return update(state, action.id, { rect: action.rect, maximized: false, snap: "none" });
    case "setRoute": {
      const w = state.windows[action.id];
      if (!w) return state;
      if (w.route === action.route && (action.title === undefined || action.title === w.title)) return state;
      return update(state, action.id, { route: action.route, title: action.title || w.title });
    }
    case "clamp": {
      let changed = false;
      const windows: Record<string, WindowState> = {};
      for (const [id, w] of Object.entries(state.windows)) {
        const rect = clampRect(w.rect, action.width, action.height);
        const same = rect.x === w.rect.x && rect.y === w.rect.y && rect.w === w.rect.w && rect.h === w.rect.h;
        if (same) {
          windows[id] = w;
        } else {
          windows[id] = { ...w, rect };
          changed = true;
        }
      }
      if (!changed) return state;
      return { ...state, windows };
    }
  }
}
`,le=`// The Terminal's command interpreter. Pure: it takes input plus the current
// shell state and returns output lines, the next working directory, and
// side effects for the UI to apply. Nothing here touches the DOM, so every
// command is unit tested. It is a simulation: nothing is ever executed.

import { about, allProjects, profile, projectCategories } from "../../../data/content";
import {
  absolutePath,
  certificationsText,
  displayPath,
  educationText,
  experienceText,
  getNode,
  projectText,
  resolvePath,
  skillsText,
  aboutText,
  type FolderNode,
  type FsNode,
} from "../../fs";
import { appList, type AppId } from "../meta";

export const MOOS_VERSION = "1.0";

export type ListItem = { name: string; kind: "dir" | "file" | "app" };

export type Line =
  | { kind: "text" | "muted" | "error" | "accent" | "heading"; text: string }
  | { kind: "link"; label: string; href: string; text?: string }
  | { kind: "prompt"; cwd: string; input: string }
  | { kind: "columns"; items: ListItem[] }
  | { kind: "table"; rows: string[][] }
  | { kind: "neofetch"; art: string[]; info: [string, string][] }
  | { kind: "blank" };

export type Theme = "dark" | "light" | "system";

export type Effect =
  | { type: "open"; appId: AppId; route: string }
  | { type: "url"; url: string }
  | { type: "clear" }
  | { type: "theme"; theme: Theme }
  | { type: "close" }
  | { type: "download-resume" };

export type ShellState = { cwd: string[]; history: string[] };

// Facts about the host, injected so commands stay pure and testable.
export type Env = {
  now: Date;
  userAgent: string;
  width: number;
  height: number;
  theme: string;
  uptimeMs: number;
};

export type Result = { lines: Line[]; cwd: string[]; effects: Effect[] };

export function defaultEnv(): Env {
  const hasWindow = typeof window !== "undefined";
  let width = 0;
  let height = 0;
  if (hasWindow) {
    width = window.screen?.width || window.innerWidth;
    height = window.screen?.height || window.innerHeight;
  }
  let uptimeMs = 0;
  if (typeof performance !== "undefined") uptimeMs = performance.now();
  let userAgent = "";
  if (typeof navigator !== "undefined") userAgent = navigator.userAgent;
  return { now: new Date(), userAgent, width, height, theme: "dark", uptimeMs };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const text = (t: string): Line => ({ kind: "text", text: t });
const muted = (t: string): Line => ({ kind: "muted", text: t });
const error = (t: string): Line => ({ kind: "error", text: t });
const accent = (t: string): Line => ({ kind: "accent", text: t });
const heading = (t: string): Line => ({ kind: "heading", text: t });
const blank: Line = { kind: "blank" };

const lines = (block: string): Line[] => block.split("\\n").map((l) => text(l));

// Split input into words, honoring "double", 'single' quotes and backslash escapes.
export function tokenize(input: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote = "";
  let has = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) quote = "";
      else cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (ch === "\\\\" && i + 1 < input.length) {
      cur += input[++i];
      has = true;
    } else if (/\\s/.test(ch)) {
      if (has) out.push(cur);
      cur = "";
      has = false;
    } else {
      cur += ch;
      has = true;
    }
  }
  if (has) out.push(cur);
  return out;
}

function distance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      let cost = 1;
      if (a[i - 1] === b[j - 1]) cost = 0;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function itemKind(node: FsNode): ListItem["kind"] {
  if (node.kind === "folder") return "dir";
  if (node.type === "app") return "app";
  return "file";
}

function listName(node: FsNode) {
  if (node.kind === "folder") return \`\${node.name}/\`;
  return node.name;
}

function findProject(slug: string) {
  const clean = slug.toLowerCase().replace(/\\.md$/, "");
  return allProjects.find((p) => p.slug === clean);
}

function findApp(name: string) {
  const n = name.toLowerCase().replace(/\\.app$/, "");
  return appList.find((a) => !a.internal && (a.id === n || a.title.toLowerCase() === n));
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

type Ctx = { args: string[]; raw: string; state: ShellState; env: Env };
type Out = { lines: Line[]; cwd?: string[]; effects?: Effect[] };
type Command = { name: string; usage: string; description: string; hidden?: boolean; run: (ctx: Ctx) => Out };

const commands: Command[] = [
  {
    name: "help",
    usage: "help",
    description: "Show this list",
    run: () => {
      const rows = commands.filter((c) => !c.hidden).map((c) => [c.usage, c.description]);
      return {
        lines: [
          heading("MoOS shell commands"),
          { kind: "table", rows },
          blank,
          muted("Tip: Tab completes commands and paths, ↑/↓ browse history, Ctrl+L clears."),
        ],
      };
    },
  },
  {
    name: "whoami",
    usage: "whoami",
    description: "Who built this",
    run: () => ({
      lines: [accent(profile.name), text(profile.role), muted(\`\${profile.location} · \${profile.status}\`)],
    }),
  },
  {
    name: "about",
    usage: "about",
    description: "Background and focus areas",
    run: () => ({ lines: lines(aboutText()) }),
  },
  {
    name: "projects",
    usage: "projects [slug]",
    description: "List projects, or show one in detail",
    run: ({ args }) => {
      if (args[0]) {
        const p = findProject(args[0]);
        if (!p) return { lines: [error(\`projects: no project named '\${args[0]}'. Run 'projects' to list them.\`)] };
        return {
          lines: [...lines(projectText(p)), blank, muted(\`Run 'open \${p.slug}' to open it in a window.\`)],
        };
      }
      const out: Line[] = [];
      for (const c of projectCategories) {
        const list = allProjects.filter((p) => p.category === c.id);
        if (!list.length) continue;
        out.push(heading(c.label));
        out.push({ kind: "table", rows: list.map((p) => [p.slug, p.name, p.stack.join(", ")]) });
        out.push(blank);
      }
      out.push(muted("Run 'projects <slug>' for details or 'open <slug>' to open one."));
      return { lines: out };
    },
  },
  {
    name: "skills",
    usage: "skills",
    description: "Technical and professional skills",
    run: () => ({ lines: lines(skillsText()) }),
  },
  {
    name: "experience",
    usage: "experience",
    description: "Work history and measured impact",
    run: () => ({ lines: lines(experienceText()) }),
  },
  {
    name: "education",
    usage: "education",
    description: "Degrees and certifications",
    run: () => ({ lines: [...lines(educationText()), blank, heading("Certifications"), ...lines(certificationsText())] }),
  },
  {
    name: "contact",
    usage: "contact",
    description: "Email, LinkedIn, GitHub",
    run: () => ({
      lines: [
        { kind: "link", text: "Email     ", label: profile.email, href: \`mailto:\${profile.email}\` },
        { kind: "link", text: "LinkedIn  ", label: profile.linkedin, href: profile.linkedin },
        { kind: "link", text: "GitHub    ", label: profile.github, href: profile.github },
        blank,
        muted("Run 'open contact' to write a message, or 'resume' for the PDF."),
      ],
    }),
  },
  {
    name: "resume",
    usage: "resume [download]",
    description: "Open the résumé (or download the PDF)",
    run: ({ args }) => {
      if (args[0] === "download" || args[0] === "--download") {
        return { lines: [muted("Downloading Moises_Sanchez_Resume.pdf…")], effects: [{ type: "download-resume" }] };
      }
      return { lines: [muted("Opening Résumé…")], effects: [{ type: "open", appId: "resume", route: "" }] };
    },
  },
  {
    name: "ls",
    usage: "ls [-l] [path]",
    description: "List a directory",
    run: ({ args, state }) => {
      const flags = args.filter((a) => a.startsWith("-")).join("");
      const target = args.find((a) => !a.startsWith("-")) || ".";
      const parts = resolvePath(state.cwd, target);
      const node = getNode(parts);
      if (!node) return { lines: [error(\`ls: \${target}: No such file or directory\`)] };
      if (node.kind === "file") return { lines: [{ kind: "columns", items: [{ name: node.name, kind: itemKind(node) }] }] };
      const children = [...node.children].sort((a, b) => listName(a).localeCompare(listName(b)));
      if (flags.includes("l")) {
        const rows: string[][] = [];
        if (flags.includes("a")) rows.push(["drwxr-xr-x", "./"], ["drwxr-xr-x", "../"]);
        for (const c of children) {
          let perms = "-r--r--r--";
          if (c.kind === "folder") perms = "drwxr-xr-x";
          else if (c.type === "app") perms = "-r-xr-xr-x";
          rows.push([perms, listName(c), c.label]);
        }
        if (!rows.length) return { lines: [muted("(empty)")] };
        return { lines: [{ kind: "table", rows }] };
      }
      const items: ListItem[] = children.map((c) => ({ name: listName(c), kind: itemKind(c) }));
      if (flags.includes("a")) items.unshift({ name: "./", kind: "dir" }, { name: "../", kind: "dir" });
      if (!items.length) return { lines: [muted("(empty)")] };
      return { lines: [{ kind: "columns", items }] };
    },
  },
  {
    name: "cd",
    usage: "cd [path]",
    description: "Change directory",
    run: ({ args, state }) => {
      const target = args[0] || "~";
      const parts = resolvePath(state.cwd, target);
      const node = getNode(parts);
      if (!node) return { lines: [error(\`cd: no such file or directory: \${target}\`)] };
      if (node.kind !== "folder") return { lines: [error(\`cd: not a directory: \${target}\`)] };
      return { lines: [], cwd: parts };
    },
  },
  {
    name: "cat",
    usage: "cat <file>",
    description: "Print a file",
    run: ({ args, state }) => {
      if (!args.length) return { lines: [error("cat: missing file operand. Try 'cat README.md'.")] };
      const out: Line[] = [];
      args.forEach((arg, i) => {
        if (i > 0) out.push(blank);
        const node = getNode(resolvePath(state.cwd, arg));
        if (!node) out.push(error(\`cat: \${arg}: No such file or directory\`));
        else if (node.kind === "folder") out.push(error(\`cat: \${arg}: Is a directory\`));
        else if (node.type === "pdf" || node.type === "app") out.push(muted(node.text()));
        else out.push(...lines(node.text()));
      });
      return { lines: out };
    },
  },
  {
    name: "open",
    usage: "open <file|app|slug>",
    description: "Open a file, folder, app, or project",
    run: ({ args, state }) => {
      const target = args.join(" ");
      if (!target) return { lines: [error("open: what should I open? Try 'open resume.pdf' or 'open terminal'.")] };
      const parts = resolvePath(state.cwd, target);
      const node = getNode(parts);
      if (node && node.kind === "folder") {
        return { lines: [muted(\`Opening \${displayPath(parts)} in Files…\`)], effects: [{ type: "open", appId: "finder", route: parts.join("/") }] };
      }
      if (node && node.kind === "file") {
        if ("url" in node.open) return { lines: [muted(\`Opening \${node.open.url}…\`)], effects: [{ type: "url", url: node.open.url }] };
        return { lines: [muted(\`Opening \${node.label}…\`)], effects: [{ type: "open", appId: node.open.appId, route: node.open.route }] };
      }
      const project = findProject(target);
      if (project) {
        return { lines: [muted(\`Opening \${project.name}…\`)], effects: [{ type: "open", appId: "project", route: project.slug }] };
      }
      const app = findApp(target);
      if (app) return { lines: [muted(\`Opening \${app.title}…\`)], effects: [{ type: "open", appId: app.id, route: "" }] };
      return { lines: [error(\`open: \${target}: No such file, folder, app, or project\`)] };
    },
  },
  {
    name: "pwd",
    usage: "pwd",
    description: "Print working directory",
    run: ({ state }) => ({ lines: [text(absolutePath(state.cwd))] }),
  },
  {
    name: "date",
    usage: "date",
    description: "Current date and time",
    run: ({ env }) => ({ lines: [text(env.now.toString())] }),
  },
  {
    name: "neofetch",
    usage: "neofetch",
    description: "MoOS system information",
    run: ({ env }) => ({ lines: [neofetch(env)] }),
  },
  {
    name: "echo",
    usage: "echo <text>",
    description: "Print text",
    run: ({ args }) => ({ lines: [text(args.join(" "))] }),
  },
  {
    name: "history",
    usage: "history",
    description: "Commands you've run",
    run: ({ state }) => {
      if (!state.history.length) return { lines: [muted("No history yet.")] };
      return { lines: [{ kind: "table", rows: state.history.map((h, i) => [String(i + 1).padStart(4), h]) }] };
    },
  },
  {
    name: "theme",
    usage: "theme [dark|light|system]",
    description: "Switch the MoOS appearance",
    run: ({ args, env }) => {
      const value = args[0]?.toLowerCase();
      if (!value) return { lines: [text(\`Current appearance: \${env.theme}\`), muted("Usage: theme dark | light | system")] };
      if (value !== "dark" && value !== "light" && value !== "system") {
        return { lines: [error(\`theme: unknown appearance '\${args[0]}'. Use dark, light, or system.\`)] };
      }
      return { lines: [muted(\`Appearance set to \${value}.\`)], effects: [{ type: "theme", theme: value }] };
    },
  },
  {
    name: "clear",
    usage: "clear",
    description: "Clear the screen",
    run: () => ({ lines: [], effects: [{ type: "clear" }] }),
  },
  {
    name: "exit",
    usage: "exit",
    description: "Close this window",
    run: () => ({ lines: [muted("logout")], effects: [{ type: "close" }] }),
  },

  // Easter eggs ---------------------------------------------------------------
  {
    name: "sudo",
    usage: "sudo",
    description: "",
    hidden: true,
    run: () => ({
      lines: [error("moises is not in the sudoers file. This incident will be reported to the hiring manager.")],
    }),
  },
  {
    name: "rm",
    usage: "rm",
    description: "",
    hidden: true,
    run: ({ args }) => {
      if (args.some((a) => a.startsWith("-") && a.includes("r")) && args.includes("/")) {
        return {
          lines: [
            error("rm: refusing to remove '/'."),
            muted("Pulling that much weight off one end would put this aircraft well outside its center-of-gravity limits."),
            muted("Load plan rejected. Nothing was deleted."),
          ],
        };
      }
      return { lines: [error("rm: read-only file system. Portfolio content is load-bearing.")] };
    },
  },
  {
    name: "hire",
    usage: "hire",
    description: "",
    hidden: true,
    run: () => ({
      lines: [
        accent(\`Excellent choice. \${profile.name} is \${profile.status.charAt(0).toLowerCase()}\${profile.status.slice(1)}.\`),
        { kind: "link", text: "Email     ", label: profile.email, href: \`mailto:\${profile.email}\` },
        { kind: "link", text: "LinkedIn  ", label: profile.linkedin, href: profile.linkedin },
        muted("Run 'resume' to see the résumé."),
      ],
    }),
  },
  {
    name: "coffee",
    usage: "coffee",
    description: "",
    hidden: true,
    run: () => ({
      lines: [...["    ( (", "     ) )", "  ........", "  |      |]", "  \\\\      /", "   \`----'"].map(text), muted("Brewing… ready. Back to building.")],
    }),
  },
  {
    name: "weather",
    usage: "weather",
    description: "",
    hidden: true,
    run: () => ({
      lines: [text("Misty Forest: 54°F, dense fog, visibility 200 ft."), muted("Same as yesterday. The pines don't mind.")],
    }),
  },
];

const aliases: Record<string, string> = { dir: "ls", cls: "clear", "?": "help", man: "help", logout: "exit", ll: "ls" };

const visibleNames = commands.filter((c) => !c.hidden).map((c) => c.name);

function browserName(ua: string) {
  if (/Edg\\//.test(ua)) return "Microsoft Edge";
  if (/OPR\\//.test(ua)) return "Opera";
  if (/Firefox\\//.test(ua)) return "Firefox";
  if (/Chrome\\//.test(ua)) return "Chrome";
  if (/Safari\\//.test(ua)) return "Safari";
  if (/Node/.test(ua)) return "Node.js";
  return "Unknown browser";
}

function formatUptime(ms: number) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins >= 60) return \`\${Math.floor(mins / 60)}h \${mins % 60}m\`;
  if (mins > 0) return \`\${mins}m \${secs}s\`;
  return \`\${secs}s\`;
}

const ART = [
  "        /\\\\          ",
  "       /  \\\\   /\\\\    ",
  "      /    \\\\ /  \\\\   ",
  "     /  /\\\\  \\\\    \\\\  ",
  "    /  /  \\\\  \\\\    \\\\ ",
  "   /__/____\\\\__\\\\____\\\\",
  "  ~~~ ~~ ~~~ ~~ ~~~ ",
];

function neofetch(env: Env): Line {
  let resolution = "unknown";
  if (env.width && env.height) resolution = \`\${env.width}×\${env.height}\`;
  const degree = about.education[0];
  const info: [string, string][] = [
    ["", \`moises@moos\`],
    ["", "-----------"],
    ["OS", \`MoOS \${MOOS_VERSION} (React + TypeScript)\`],
    ["Host", browserName(env.userAgent)],
    ["Uptime", formatUptime(env.uptimeMs)],
    ["Shell", "mosh (MoOS shell)"],
    ["Resolution", resolution],
    ["Theme", \`Misty Forest (\${env.theme})\`],
    ["User", profile.name],
    ["Role", profile.role],
    ["Location", profile.location],
  ];
  if (degree) info.push(["Education", \`\${degree.credential}, \${degree.school}\`]);
  return { kind: "neofetch", art: ART, info };
}

function suggest(name: string) {
  let best = "";
  let bestScore = 3;
  for (const n of [...visibleNames, ...Object.keys(aliases)]) {
    const d = distance(name.toLowerCase(), n);
    if (d < bestScore) {
      bestScore = d;
      best = n;
    }
  }
  return best;
}

export function runCommand(input: string, state: ShellState, env: Env = defaultEnv()): Result {
  const raw = input.trim();
  if (!raw) return { lines: [], cwd: state.cwd, effects: [] };
  const words = tokenize(raw);
  if (!words.length) return { lines: [], cwd: state.cwd, effects: [] };
  let name = words[0].toLowerCase();
  if (aliases[name]) name = aliases[name];
  const command = commands.find((c) => c.name === name);
  if (!command) {
    const out: Line[] = [error(\`command not found: \${words[0]}. Type 'help' for a list of commands.\`)];
    const hint = suggest(words[0]);
    if (hint) out.push(muted(\`Did you mean '\${hint}'?\`));
    return { lines: out, cwd: state.cwd, effects: [] };
  }
  const result = command.run({ args: words.slice(1), raw, state, env });
  return { lines: result.lines, cwd: result.cwd || state.cwd, effects: result.effects || [] };
}

// ---------------------------------------------------------------------------
// Tab completion
// ---------------------------------------------------------------------------

const pathCommands = new Set(["ls", "cd", "cat", "open", "dir", "ll"]);

function commonPrefix(values: string[]) {
  if (!values.length) return "";
  let prefix = values[0];
  for (const v of values) {
    while (!v.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

export function complete(input: string, cwd: string[]): { completed: string; options: string[] } {
  const none = { completed: input, options: [] as string[] };
  const firstSpace = input.search(/\\s/);

  // Completing the command name itself.
  if (firstSpace === -1) {
    const matches = visibleNames.filter((n) => n.startsWith(input.toLowerCase()));
    if (matches.length === 1) return { completed: \`\${matches[0]} \`, options: [] };
    if (matches.length > 1) return { completed: commonPrefix(matches), options: matches };
    return none;
  }

  const cmd = input.slice(0, firstSpace).toLowerCase();
  const lastSpace = Math.max(input.lastIndexOf(" "), input.lastIndexOf("\\t"));
  const head = input.slice(0, lastSpace + 1);
  const word = input.slice(lastSpace + 1);

  let candidates: string[] = [];
  let folderOnly = false;
  if (cmd === "theme") candidates = ["dark", "light", "system"];
  else if (cmd === "projects") candidates = allProjects.map((p) => p.slug);
  else if (cmd === "resume") candidates = ["download"];
  else if (pathCommands.has(cmd)) {
    folderOnly = cmd === "cd";
    const slash = word.lastIndexOf("/");
    const dirPart = word.slice(0, slash + 1);
    const base = word.slice(slash + 1);
    const folder = getNode(resolvePath(cwd, dirPart || "."));
    if (!folder || folder.kind !== "folder") return none;
    const names = (folder as FolderNode).children
      .filter((c) => !folderOnly || c.kind === "folder")
      .map((c) => listName(c))
      .filter((n) => n.startsWith(base));
    if (cmd === "open" && !dirPart) {
      for (const p of allProjects) if (p.slug.startsWith(base)) names.push(p.slug);
      for (const a of appList) if (!a.internal && a.id.startsWith(base) && !names.includes(a.id)) names.push(a.id);
    }
    if (names.length === 1) {
      let suffix = " ";
      if (names[0].endsWith("/")) suffix = "";
      return { completed: head + dirPart + names[0] + suffix, options: [] };
    }
    if (names.length > 1) return { completed: head + dirPart + commonPrefix(names), options: names };
    return none;
  }

  const matches = candidates.filter((c) => c.startsWith(word.toLowerCase()));
  if (matches.length === 1) return { completed: \`\${head}\${matches[0]} \`, options: [] };
  if (matches.length > 1) return { completed: head + commonPrefix(matches), options: matches };
  return none;
}
`,ce=`// A small syntax highlighter for the Code app. It splits source into lines of
// typed tokens and carries state (open block comments, template strings, CSS
// nesting) across lines. It favors robustness over completeness: it never
// throws, and joining a line's tokens reproduces that line exactly (a trailing
// carriage return from CRLF files is dropped).

export type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "type"
  | "function"
  | "property"
  | "tag"
  | "punctuation"
  | "operator"
  | "plain";

export type Token = { text: string; type: TokenType };
export type Language = "ts" | "tsx" | "js" | "css";

const JS_KEYWORDS = new Set(
  (
    "import export from default as const let var function return if else for while do switch case break continue " +
    "new delete typeof instanceof in of class extends super this null undefined true false try catch finally throw " +
    "async await yield type interface enum implements private public protected readonly static declare keyof satisfies void"
  ).split(" "),
);

const CSS_AT = /^@[\\w-]+/;

type State = { mode: "code" | "block" | "template"; depth: number };

function push(tokens: Token[], text: string, type: TokenType) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (last && last.type === type) last.text += text;
  else tokens.push({ text, type });
}

// Index just past the closing quote, honoring backslash escapes (or end of line).
function scanString(line: string, start: number, quote: string) {
  let i = start + 1;
  while (i < line.length) {
    if (line[i] === "\\\\") i += 2;
    else if (line[i] === quote) return i + 1;
    else i++;
  }
  return line.length;
}

function lastSignificant(tokens: Token[]) {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].text.trim()) return tokens[i];
  }
  return undefined;
}

function jsLine(line: string, state: State, jsx: boolean): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    if (state.mode === "block") {
      const end = line.indexOf("*/", i);
      if (end === -1) {
        push(tokens, line.slice(i), "comment");
        return tokens;
      }
      push(tokens, line.slice(i, end + 2), "comment");
      i = end + 2;
      state.mode = "code";
      continue;
    }
    if (state.mode === "template") {
      let j = i;
      while (j < line.length && line[j] !== "\`") {
        if (line[j] === "\\\\") j++;
        j++;
      }
      if (j >= line.length) {
        push(tokens, line.slice(i), "string");
        return tokens;
      }
      push(tokens, line.slice(i, j + 1), "string");
      i = j + 1;
      state.mode = "code";
      continue;
    }

    const rest = line.slice(i);
    const ch = line[i];
    const ws = /^\\s+/.exec(rest);
    if (ws) {
      push(tokens, ws[0], "plain");
      i += ws[0].length;
      continue;
    }
    if (rest.startsWith("//")) {
      push(tokens, rest, "comment");
      return tokens;
    }
    if (rest.startsWith("/*")) {
      state.mode = "block";
      push(tokens, "/*", "comment");
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const end = scanString(line, i, ch);
      push(tokens, line.slice(i, end), "string");
      i = end;
      continue;
    }
    if (ch === "\`") {
      state.mode = "template";
      push(tokens, "\`", "string");
      i += 1;
      continue;
    }
    const num = /^(0[xob][\\da-f_]+n?|\\d[\\d_]*(\\.\\d+)?(e[+-]?\\d+)?n?|\\.\\d+)/i.exec(rest);
    if (num) {
      push(tokens, num[0], "number");
      i += num[0].length;
      continue;
    }
    // JSX tags: "<Name" or "</name" where a less-than comparison is unlikely.
    if (jsx && ch === "<") {
      const tag = /^<\\/?([A-Za-z][\\w.]*)/.exec(rest);
      const prev = lastSignificant(tokens);
      const afterValue = prev && (prev.type === "plain" || prev.type === "number" || prev.text.endsWith(")"));
      if (tag && !afterValue) {
        const open = tag[0].length - tag[1].length;
        push(tokens, tag[0].slice(0, open), "punctuation");
        push(tokens, tag[1], "tag");
        i += tag[0].length;
        continue;
      }
    }
    const ident = /^[A-Za-z_$][\\w$]*/.exec(rest);
    if (ident) {
      const word = ident[0];
      const after = line.slice(i + word.length);
      const prev = lastSignificant(tokens);
      let type: TokenType = "plain";
      if (prev && prev.text.endsWith(".") && prev.type === "punctuation") {
        type = "property";
        if (/^\\s*\\(/.test(after)) type = "function";
      } else if (JS_KEYWORDS.has(word)) type = "keyword";
      else if (/^\\s*(<[^>]*>)?\\s*\\(/.test(after) && !(prev && prev.text === "new")) type = "function";
      else if (/^[A-Z]/.test(word)) type = "type";
      else if (/^\\??:(?!:)/.test(after)) type = "property";
      push(tokens, word, type);
      i += word.length;
      continue;
    }
    if (/[{}()[\\];,.]/.test(ch)) push(tokens, ch, "punctuation");
    else push(tokens, ch, "operator");
    i += 1;
  }
  return tokens;
}

function cssLine(line: string, state: State): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    if (state.mode === "block") {
      const end = line.indexOf("*/", i);
      if (end === -1) {
        push(tokens, line.slice(i), "comment");
        return tokens;
      }
      push(tokens, line.slice(i, end + 2), "comment");
      i = end + 2;
      state.mode = "code";
      continue;
    }
    const rest = line.slice(i);
    const ch = line[i];
    const ws = /^\\s+/.exec(rest);
    if (ws) {
      push(tokens, ws[0], "plain");
      i += ws[0].length;
      continue;
    }
    if (rest.startsWith("/*")) {
      state.mode = "block";
      push(tokens, "/*", "comment");
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const end = scanString(line, i, ch);
      push(tokens, line.slice(i, end), "string");
      i = end;
      continue;
    }
    const at = CSS_AT.exec(rest);
    if (at) {
      push(tokens, at[0], "keyword");
      i += at[0].length;
      continue;
    }
    const hex = /^#[\\da-f]{3,8}\\b/i.exec(rest);
    if (hex && state.depth > 0) {
      push(tokens, hex[0], "number");
      i += hex[0].length;
      continue;
    }
    const num = /^-?(\\d*\\.)?\\d+(%|[a-z]+)?/i.exec(rest);
    if (num) {
      push(tokens, num[0], "number");
      i += num[0].length;
      continue;
    }
    const ident = /^-*[A-Za-z_][\\w-]*/.exec(rest);
    if (ident) {
      const word = ident[0];
      const after = line.slice(i + word.length);
      // A selector if a "{" follows on this line before any ";".
      const brace = after.indexOf("{");
      const semi = after.indexOf(";");
      const prev = line[i - 1];
      const selector = brace !== -1 && (semi === -1 || brace < semi) && prev !== "(";
      let type: TokenType = "plain";
      if (/^\\(/.test(after)) type = "function";
      else if (selector || (state.depth === 0 && /^\\s*,?\\s*$/.test(after))) {
        if (prev === "." || prev === "#") type = "type";
        else if (prev === ":") type = "keyword";
        else type = "tag";
      } else if (/^\\s*:/.test(after)) type = "property";
      push(tokens, word, type);
      i += word.length;
      continue;
    }
    if (ch === "{") state.depth += 1;
    if (ch === "}") state.depth = Math.max(0, state.depth - 1);
    if (/[{}()[\\];,.:#]/.test(ch)) push(tokens, ch, "punctuation");
    else push(tokens, ch, "operator");
    i += 1;
  }
  return tokens;
}

export function highlight(code: string, language: Language): Token[][] {
  const state: State = { mode: "code", depth: 0 };
  return code.split("\\n").map((raw) => {
    const line = raw.replace(/\\r$/, "");
    try {
      if (language === "css") return cssLine(line, state);
      return jsLine(line, state, language === "tsx");
    } catch {
      return [{ text: line, type: "plain" }];
    }
  });
}

export function languageOf(path: string): Language {
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".ts")) return "ts";
  return "js";
}
`,de=[{path:"src/os/state/windows.ts",note:"Pure reducer behind the window manager: focus, stacking, minimize, maximize, and snapping.",code:ae},{path:"src/os/shell/Window.tsx",note:"Window frame with pointer-driven dragging, eight-way resizing, and edge snapping.",code:se},{path:"src/os/state/router.ts",note:"Hash-based deep links that work on GitHub Pages and keep old #anchors alive.",code:re},{path:"src/os/fs.ts",note:"Virtual filesystem shared by Files, Terminal, and Reader, generated from portfolio content.",code:ie},{path:"src/os/search.ts",note:"Launcher index and ranking across apps, projects, skills, and actions.",code:oe},{path:"src/os/apps/terminal/commands.ts",note:"Pure command interpreter for the Terminal, with tab completion and typo suggestions.",code:le},{path:"src/os/apps/editor/highlight.ts",note:"The tokenizer coloring the code you're reading right now.",code:ce},{path:"src/data/content.ts",note:"Single source of truth for every portfolio fact in MoOS.",code:te},{path:"scripts/generate-wallpapers.mjs",note:"Procedural generator for the layered misty-forest wallpapers.",code:ne}],M=de.map(n=>({...n,code:n.code.replace(/\r\n/g,`
`),language:ee(n.path)}));function j(n){return M.find(o=>o.path===n)}function pe(n=M){const o={name:"",path:"",children:[]};for(const e of n){const t=e.path.split("/");let l=o;t.forEach((s,p)=>{const m=t.slice(0,p+1).join("/");let f=l.children.find(r=>r.name===s);f||(f={name:s,path:m,children:[]},l.children.push(f)),p===t.length-1&&(f.file=e),l=f})}const a=e=>{let t=e;for(;!t.file&&t.children.length===1&&!t.children[0].file&&t.name;){const s=t.children[0];t={...s,name:`${t.name}/${s.name}`}}const l=t.children.map(a).sort((s,p)=>{const m=+!!s.file,f=+!!p.file;return m-f||s.name.localeCompare(p.name)});return{...t,children:l}};return a(o)}const N=M[0].path,ue={ts:"TypeScript",tsx:"TypeScript JSX",js:"JavaScript",css:"CSS"};function $(n){return n.split("/").pop()||n}function E({path:n}){const o=n.split(".").pop()||"";let a="JS";return o==="ts"&&(a="TS"),o==="tsx"&&(a="TSX"),o==="css"&&(a="CSS"),i.jsx("span",{className:v("edBadge",`edBadge-${o}`),children:a})}function z({node:n,depth:o,active:a,collapsed:e,onToggle:t,onOpen:l}){return i.jsx("ul",{className:"edTree",role:o===0&&"tree"||"group","aria-label":o===0&&"Source files"||void 0,children:n.children.map(s=>{const p={paddingLeft:8+o*12};if(s.file){const r=s.file;return i.jsx("li",{role:"none",children:i.jsxs("button",{type:"button",role:"treeitem","aria-selected":a===r.path,className:v("edNode",a===r.path&&"isActive"),style:p,onClick:()=>l(r),title:r.path,children:[i.jsx(E,{path:r.path}),i.jsx("span",{className:"edNodeName",children:s.name})]})},s.path)}const m=!e.has(s.path);let f=X;return m&&(f=K),i.jsxs("li",{role:"none",children:[i.jsxs("button",{type:"button",role:"treeitem","aria-expanded":m,className:"edNode edFolder",style:p,onClick:()=>t(s.path),children:[i.jsx(f,{width:13,height:13}),i.jsx("span",{className:"edNodeName",children:s.name})]}),m&&i.jsx(z,{node:s,depth:o+1,active:a,collapsed:e,onToggle:t,onOpen:l})]},s.path)})})}function me({file:n}){const o=x.useMemo(()=>Q(n.code,n.language),[n]),[a,e]=x.useState(null),t=`${String(o.length).length+1}ch`;return i.jsx("div",{className:"edCode",role:"region","aria-label":`${$(n.path)} source, read-only`,tabIndex:0,children:i.jsx("div",{className:"edLines",style:{"--gutter":t},children:o.map((l,s)=>i.jsxs("div",{className:v("edLine",a===s&&"isCurrent"),onClick:()=>e(s),children:[i.jsx("span",{className:"edNum","aria-hidden":"true",children:s+1}),i.jsxs("code",{className:"edText",children:[l.map((p,m)=>p.type==="plain"?p.text:i.jsx("span",{className:`tok-${p.type}`,children:p.text},m)),l.length===0&&" "]})]},s))})})}function we({route:n,setRoute:o}){const a=j(n)?.path||N,[e,t]=x.useState([a]),[l,s]=x.useState(a),[p,m]=x.useState(n),[f,r]=x.useState(()=>new Set),[u,g]=x.useState(!1),[w,k]=x.useState(!1),b=x.useRef(0),I=x.useMemo(()=>pe(),[]);if(n!==p){m(n);const c=j(n);c&&(s(c.path),e.includes(c.path)||t([...e,c.path]))}x.useEffect(()=>()=>window.clearTimeout(b.current),[]);const h=j(l),C=c=>{e.includes(c.path)||t([...e,c.path]),s(c.path),g(!1),m(c.path),o(c.path)},W=c=>{const y=e.indexOf(c),L=e.filter(H=>H!==c);if(t(L),c!==l)return;const S=L[Math.min(y,L.length-1)];S?(s(S),m(S),o(S)):(s(""),m(""),o(""))},F=c=>{const y=new Set(f);y.has(c)?y.delete(c):y.add(c),r(y)},O=async()=>{!h||!await Y(h.code)||(k(!0),window.clearTimeout(b.current),b.current=window.setTimeout(()=>k(!1),1600))};let T=G,P="Copy";w&&(T=U,P="Copied");const D=h?.code.split(`
`).length||0;return i.jsx("div",{className:v("app editor",u&&"explorerOpen"),children:i.jsxs("div",{className:"appRow",children:[i.jsxs("nav",{className:"edExplorer","aria-label":"Explorer",children:[i.jsx("p",{className:"sideHeading",children:"Explorer · my-portfolio"}),i.jsx(z,{node:I,depth:0,active:l,collapsed:f,onToggle:F,onOpen:C}),i.jsx("p",{className:"edExplorerNote",children:"Real source from this site, bundled at build time. Read-only."})]}),u&&i.jsx("button",{type:"button",className:"edScrim","aria-label":"Close explorer",onClick:()=>g(!1)}),i.jsxs("div",{className:"edMain",children:[i.jsxs("div",{className:"edTabs",children:[i.jsx("button",{type:"button",className:"iconBtn edExplorerToggle","aria-label":"Toggle explorer","aria-expanded":u,onClick:()=>g(c=>!c),children:i.jsx(B,{})}),i.jsx("div",{className:"edTabList",role:"group","aria-label":"Open files",children:e.map(c=>i.jsxs("div",{className:v("edTab",c===l&&"isActive"),children:[i.jsxs("button",{type:"button","aria-current":c===l&&"true"||void 0,className:"edTabLabel",onClick:()=>{const y=j(c);y&&C(y)},title:c,children:[i.jsx(E,{path:c}),$(c)]}),i.jsx("button",{type:"button",className:"edTabClose","aria-label":`Close ${$(c)}`,onClick:()=>W(c),children:i.jsx(_,{width:12,height:12})})]},c))}),h&&i.jsxs("button",{type:"button",className:"btn btnGhost edCopy",onClick:O,"aria-live":"polite",children:[i.jsx(T,{width:14,height:14}),P]})]}),h&&i.jsxs(i.Fragment,{children:[i.jsxs("div",{className:"edCrumbs",children:[i.jsx("span",{className:"edPath",children:h.path.split("/").join(" › ")}),i.jsx("span",{className:"edNote",children:h.note})]}),i.jsx(me,{file:h},h.path),i.jsxs("footer",{className:"edStatus",children:[i.jsx("span",{children:ue[h.language]}),i.jsxs("span",{children:[D," lines"]}),i.jsx("span",{className:"edStatusSpacer"}),i.jsx("span",{children:"Read-only"}),i.jsx("span",{children:"UTF-8"}),i.jsx("span",{children:"LF"})]})]}),!h&&i.jsxs("div",{className:"emptyState edEmpty",children:[i.jsx("p",{children:"No file open."}),i.jsxs("button",{type:"button",className:"btn",onClick:()=>C(M[0]),children:["Open ",$(N)]})]})]})]})})}export{we as default};
