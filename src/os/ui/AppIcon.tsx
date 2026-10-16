import { useId, type ReactNode } from "react";
import type { AppId } from "../apps/meta";

// MoOS app icons: soft rounded tiles in the forest palette with a simple
// line glyph. Drawn in a 64×64 box and scaled to any size.

type IconSpec = { from: string; to: string; ink?: string; glyph: (ink: string) => ReactNode };

const LIGHT = "#f1f4f2";
const DARK = "#24332d";

const gearPath = (() => {
  const teeth = 8;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (Math.PI * i) / teeth;
    // Alternate between tooth tips and the valleys between them.
    let radius = 13;
    if (i % 2 === 0) radius = 17;
    for (const edge of [a - Math.PI / teeth / 2.4, a + Math.PI / teeth / 2.4]) {
      pts.push(`${(32 + radius * Math.cos(edge)).toFixed(1)} ${(32 + radius * Math.sin(edge)).toFixed(1)}`);
    }
  }
  return "M" + pts.join("L") + "Z";
})();

const specs: Record<AppId | "folder", IconSpec> = {
  home: {
    from: "#8fb39b",
    to: "#2e5a46",
    glyph: (ink) => (
      <>
        <path d="M15 30.5 32 16l17 14.5" />
        <path d="M20 26.5V47a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V26.5" fill={ink} fillOpacity="0.14" />
        <path d="M28 49V38.5h8V49" />
      </>
    ),
  },
  finder: {
    from: "#4f826b",
    to: "#214537",
    glyph: (ink) => (
      <>
        <path d="M13 23a4 4 0 0 1 4-4h9.5l4 4H47a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4Z" fill={ink} fillOpacity="0.16" />
        <path d="M13 23a4 4 0 0 1 4-4h9.5l4 4H47a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4Z" />
        <path d="M13 29h38" />
      </>
    ),
  },
  folder: {
    from: "#6b9a82",
    to: "#2f5a48",
    glyph: (ink) => (
      <>
        <path d="M13 23a4 4 0 0 1 4-4h9.5l4 4H47a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4Z" fill={ink} fillOpacity="0.16" />
        <path d="M13 29h38" />
      </>
    ),
  },
  about: {
    from: "#7c9c86",
    to: "#3b5b48",
    glyph: () => (
      <>
        <circle cx="32" cy="25" r="7.5" />
        <path d="M17.5 47c2.2-8 8-12.5 14.5-12.5S44.3 39 46.5 47" />
      </>
    ),
  },
  experience: {
    from: "#a3825b",
    to: "#5f472d",
    glyph: () => (
      <>
        <rect x="13" y="24" width="38" height="23" rx="4" />
        <path d="M25.5 24v-3.5a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3V24" />
        <path d="M13 34h38" />
        <path d="M30 34v3h4v-3" />
      </>
    ),
  },
  resume: {
    from: "#f4f7f5",
    to: "#c8d2cc",
    ink: DARK,
    glyph: () => (
      <>
        <path d="M21 13h15l9 9v27a2.5 2.5 0 0 1-2.5 2.5h-21A2.5 2.5 0 0 1 19 49V15.5A2.5 2.5 0 0 1 21 13Z" />
        <path d="M36 13v9h9" />
        <path d="M25 31h14M25 37h14M25 43h9" />
      </>
    ),
  },
  contact: {
    from: "#6f9ba8",
    to: "#345b66",
    glyph: () => (
      <>
        <rect x="12.5" y="19" width="39" height="27" rx="4.5" />
        <path d="m14 22 18 13.5L50 22" />
      </>
    ),
  },
  terminal: {
    from: "#2e3935",
    to: "#121816",
    glyph: () => (
      <>
        <path d="m18 23 9 8-9 8" stroke="#9fd3b4" />
        <path d="M31 41h15" />
      </>
    ),
  },
  editor: {
    from: "#3f5d6e",
    to: "#1b2c36",
    glyph: () => (
      <>
        <path d="m24 21-10 11 10 11" />
        <path d="m40 21 10 11-10 11" />
        <path d="m35.5 17-7 30" stroke="#a9cfe0" />
      </>
    ),
  },
  browser: {
    from: "#5e8f88",
    to: "#28504a",
    glyph: (ink) => (
      <>
        <circle cx="32" cy="32" r="17" />
        <path d="m39.5 24.5-4.5 10.5-10.5 4.5 4.5-10.5Z" fill={ink} fillOpacity="0.9" />
      </>
    ),
  },
  settings: {
    from: "#7f8884",
    to: "#454e4a",
    glyph: () => (
      <>
        <path d={gearPath} strokeLinejoin="round" />
        <circle cx="32" cy="32" r="5.5" />
      </>
    ),
  },
  project: {
    from: "#71905f",
    to: "#384f2e",
    glyph: () => (
      <>
        <path d="M32 13.5 48 22.5v19L32 50.5l-16-9v-19Z" />
        <path d="m16 22.5 16 9 16-9" />
        <path d="M32 31.5v19" />
      </>
    ),
  },
  reader: {
    from: "#cdd4d0",
    to: "#97a29c",
    ink: DARK,
    glyph: () => (
      <>
        <rect x="18" y="13" width="28" height="38" rx="3" />
        <path d="M24 22h16M24 28h16M24 34h16M24 40h10" />
      </>
    ),
  },
};

export type IconKind = AppId | "folder";

export default function AppIcon({ app, size = 48, className }: { app: IconKind; size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const spec = specs[app] || specs.project;
  const ink = spec.ink || LIGHT;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={spec.from} />
          <stop offset="1" stopColor={spec.to} />
        </linearGradient>
        <linearGradient id={`hl${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="15" fill={`url(#bg${id})`} />
      <rect x="2" y="2" width="60" height="60" rx="15" fill={`url(#hl${id})`} />
      <rect x="2.5" y="2.5" width="59" height="59" rx="14.5" fill="none" stroke="#fff" strokeOpacity="0.14" />
      <g fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        {spec.glyph(ink)}
      </g>
    </svg>
  );
}
