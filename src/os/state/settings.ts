import { loadJSON, saveJSON } from "../lib/util";

export type ThemePref = "dark" | "light" | "system";
export type MotionPref = "system" | "full" | "reduced";
export type Transparency = "glass" | "subtle" | "solid";
export type DockSize = "small" | "medium" | "large";
export type AccentId = "evergreen" | "moss" | "sage" | "fjord" | "ember";

export type Settings = {
  theme: ThemePref;
  accent: AccentId;
  wallpaper: string;
  transparency: Transparency;
  motion: MotionPref;
  dockSize: DockSize;
  dockMagnify: boolean;
  // Show app names under dock icons.
  dockLabels: boolean;
  // Opening a window hides the others, so only one is on screen at a time.
  singleWindow: boolean;
};

export const DEFAULT_WALLPAPER = "misty-forest";

export const defaultSettings: Settings = {
  theme: "dark",
  accent: "evergreen",
  wallpaper: DEFAULT_WALLPAPER,
  transparency: "glass",
  motion: "system",
  dockSize: "medium",
  dockMagnify: true,
  dockLabels: true,
  singleWindow: true,
};

export const accents: { id: AccentId; label: string; dark: string; light: string }[] = [
  { id: "evergreen", label: "Evergreen", dark: "#86c2a2", light: "#2d6a51" },
  { id: "moss", label: "Moss", dark: "#adc086", light: "#55692c" },
  { id: "sage", label: "Sage", dark: "#a9bfb1", light: "#4a6858" },
  { id: "fjord", label: "Fjord", dark: "#94b6c2", light: "#356575" },
  { id: "ember", label: "Ember", dark: "#d8ac80", light: "#94561f" },
];

const KEY = "moos:settings";

const allowed: { [K in keyof Settings]?: readonly Settings[K][] } = {
  theme: ["dark", "light", "system"],
  accent: ["evergreen", "moss", "sage", "fjord", "ember"],
  transparency: ["glass", "subtle", "solid"],
  motion: ["system", "full", "reduced"],
  dockSize: ["small", "medium", "large"],
};

// Merge stored values over defaults, dropping anything stale or malformed.
export function sanitizeSettings(raw: unknown): Settings {
  const out: Settings = { ...defaultSettings };
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Record<string, unknown>;
  for (const key of Object.keys(defaultSettings) as (keyof Settings)[]) {
    const value = r[key];
    if (value === undefined || typeof value !== typeof defaultSettings[key]) continue;
    const options = allowed[key] as readonly unknown[] | undefined;
    if (options && !options.includes(value)) continue;
    (out as Record<string, unknown>)[key] = value;
  }
  return out;
}

export function loadSettings() {
  return sanitizeSettings(loadJSON<unknown>(KEY, null));
}

export function saveSettings(settings: Settings) {
  saveJSON(KEY, settings);
}

export function resolveTheme(pref: ThemePref, systemDark: boolean): "dark" | "light" {
  if (pref === "system") {
    if (systemDark) return "dark";
    return "light";
  }
  return pref;
}

export function resolveMotion(pref: MotionPref, systemReduced: boolean): "full" | "reduced" {
  if (pref === "system") {
    if (systemReduced) return "reduced";
    return "full";
  }
  return pref;
}
