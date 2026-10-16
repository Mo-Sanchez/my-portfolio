import blueHour from "../assets/wallpapers/generated/blue-hour.svg";
import dawnRidge from "../assets/wallpapers/generated/dawn-ridge.svg";
import mistyForest from "../assets/wallpapers/generated/misty-forest.svg";
import nightPines from "../assets/wallpapers/generated/night-pines.svg";
import { DEFAULT_WALLPAPER } from "./state/settings";

export type Wallpaper = { id: string; label: string; src: string; photo: boolean };

// Photos dropped into src/assets/wallpapers/ are picked up at build time.
// A photo named misty-forest.(jpg|webp|png|avif) replaces the generated
// default, so the real forest photograph can be added without code changes.
const photos = import.meta.glob("../assets/wallpapers/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const generated: Wallpaper[] = [
  { id: DEFAULT_WALLPAPER, label: "Misty Forest", src: mistyForest, photo: false },
  { id: "dawn-ridge", label: "Dawn Ridge", src: dawnRidge, photo: false },
  { id: "blue-hour", label: "Blue Hour", src: blueHour, photo: false },
  { id: "night-pines", label: "Night Pines", src: nightPines, photo: false },
];

function titleCase(id: string) {
  return id.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildCatalog(): Wallpaper[] {
  const list = [...generated];
  for (const [path, src] of Object.entries(photos)) {
    const id = path.split("/").pop()!.replace(/\.[^.]+$/, "").toLowerCase();
    const existing = list.find((w) => w.id === id);
    if (existing) {
      existing.src = src;
      existing.photo = true;
    } else {
      list.push({ id, label: titleCase(id), src, photo: true });
    }
  }
  return list;
}

export const wallpapers = buildCatalog();

export function getWallpaper(id: string) {
  return wallpapers.find((w) => w.id === id) || wallpapers[0];
}

// True once a real photograph has been supplied for the default wallpaper.
export const hasDefaultPhoto = getWallpaper(DEFAULT_WALLPAPER).photo;
