import { useRef, useState } from "react";
import type { AppId } from "../apps/meta";
import { useViewport } from "../lib/hooks";
import { classicHref, modKey } from "../lib/platform";
import { clamp, cx, loadJSON, removeKey, saveJSON } from "../lib/util";
import { DOCK_RESERVE, MENUBAR_H, useOS, type MenuItem } from "../state/os";
import AppIcon, { type IconKind } from "../ui/AppIcon";

type DeskIcon = { id: string; label: string; icon: IconKind; appId: AppId; route?: string };

const desktopIcons: DeskIcon[] = [
  { id: "projects", label: "Projects", icon: "folder", appId: "finder", route: "projects" },
  { id: "about", label: "About Me", icon: "about", appId: "about" },
  { id: "experience", label: "Experience", icon: "experience", appId: "experience" },
  { id: "resume", label: "Résumé.pdf", icon: "resume", appId: "resume" },
  { id: "contact", label: "Contact", icon: "contact", appId: "contact" },
  { id: "terminal", label: "Terminal", icon: "terminal", appId: "terminal" },
  { id: "readme", label: "README.md", icon: "reader", appId: "reader", route: "README.md" },
];

const KEY = "moos:icon-layout";
const CELL_W = 92;
const CELL_H = 100;
const PAD_TOP = 14;
const PAD_RIGHT = 14;

type Cell = { col: number; row: number };
type Layout = Record<string, Cell>;

function defaultLayout(rows: number): Layout {
  const layout: Layout = {};
  desktopIcons.forEach((icon, i) => {
    layout[icon.id] = { col: Math.floor(i / rows), row: i % rows };
  });
  return layout;
}

// Fill in missing icons and pull out-of-range ones back onto the grid.
function normalize(saved: Layout, rows: number): Layout {
  const fallback = defaultLayout(rows);
  const used = new Set<string>();
  const out: Layout = {};
  for (const icon of desktopIcons) {
    const cell = saved[icon.id];
    if (cell && cell.row < rows && !used.has(`${cell.col},${cell.row}`)) {
      out[icon.id] = cell;
      used.add(`${cell.col},${cell.row}`);
    }
  }
  for (const icon of desktopIcons) {
    if (out[icon.id]) continue;
    let cell = fallback[icon.id];
    let n = 0;
    while (used.has(`${cell.col},${cell.row}`)) {
      n++;
      cell = { col: Math.floor(n / rows), row: n % rows };
    }
    out[icon.id] = cell;
    used.add(`${cell.col},${cell.row}`);
  }
  return out;
}

export default function DesktopIcons() {
  const os = useOS();
  const { w, h } = useViewport();
  const rows = Math.max(1, Math.floor((h - MENUBAR_H - DOCK_RESERVE - PAD_TOP) / CELL_H));
  const [saved, setSaved] = useState<Layout>(() => loadJSON<Layout>(KEY, {}));
  const layout = normalize(saved, rows);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const justDragged = useRef(false);

  const open = (icon: DeskIcon) => {
    setSelected(icon.id);
    os.openApp(icon.appId, icon.route || "");
  };

  const persist = (next: Layout) => {
    setSaved(next);
    saveJSON(KEY, next);
  };

  const resetLayout = () => {
    setSaved({});
    removeKey(KEY);
  };

  const onPointerDown = (icon: DeskIcon) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const desk = e.currentTarget.parentElement?.getBoundingClientRect();
    let moved = false;
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      setDrag({ id: icon.id, dx, dy });
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      setDrag(null);
      if (!moved || !desk) return;
      justDragged.current = true;
      window.setTimeout(() => (justDragged.current = false), 0);
      const maxCol = Math.max(0, Math.floor((desk.width - PAD_RIGHT) / CELL_W) - 1);
      const col = clamp(Math.floor((desk.right - PAD_RIGHT - ev.clientX) / CELL_W), 0, maxCol);
      const row = clamp(Math.floor((ev.clientY - desk.top - PAD_TOP) / CELL_H), 0, rows - 1);
      const next = { ...layout };
      const from = next[icon.id];
      const occupant = desktopIcons.find((i) => i.id !== icon.id && next[i.id].col === col && next[i.id].row === row);
      if (occupant) next[occupant.id] = from;
      next[icon.id] = { col, row };
      persist(next);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const sortByName = () => {
    const sorted = [...desktopIcons].sort((a, b) => a.label.localeCompare(b.label));
    const next: Layout = {};
    sorted.forEach((icon, i) => {
      next[icon.id] = { col: Math.floor(i / rows), row: i % rows };
    });
    persist(next);
  };

  const onDesktopMenu = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    setSelected(null);
    let themeLabel = "Use Light Appearance";
    let theme: "light" | "dark" = "light";
    if (os.theme === "light") {
      themeLabel = "Use Dark Appearance";
      theme = "dark";
    }
    const items: MenuItem[] = [
      { label: "Search…", shortcut: `${modKey} K`, onSelect: () => os.setLauncherOpen(true) },
      { label: "Open Terminal", onSelect: () => os.openApp("terminal") },
      "separator",
      { label: "Change Wallpaper…", onSelect: () => os.openApp("settings", "wallpaper") },
      { label: themeLabel, onSelect: () => os.updateSettings({ theme }) },
    ];
    if (!os.settings.showWelcome) items.push({ label: "Show Welcome", onSelect: () => os.updateSettings({ showWelcome: true }) });
    items.push(
      "separator",
      { label: "Sort Icons by Name", onSelect: sortByName },
      { label: "Reset Icon Layout", onSelect: resetLayout },
      "separator",
      { label: "Classic Portfolio View", onSelect: () => window.location.assign(classicHref) },
    );
    os.openContextMenu({ x: e.clientX, y: e.clientY, items, label: "Desktop options" });
  };

  const onContextMenu = (icon: DeskIcon) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(icon.id);
    const items: MenuItem[] = [{ label: "Open", onSelect: () => open(icon) }];
    if (icon.id === "resume") items.push({ label: "Download", onSelect: () => os.run({ type: "downloadResume" }) });
    if (icon.id === "contact") items.push({ label: "Copy Email Address", onSelect: () => os.run({ type: "copyEmail" }) });
    items.push("separator", { label: "Reset Icon Layout", onSelect: resetLayout });
    os.openContextMenu({ x: e.clientX, y: e.clientY, items, label: `${icon.label} options` });
  };

  return (
    <ul
      className="deskIcons"
      aria-label="Desktop"
      onPointerDown={(e) => {
        if (e.target !== e.currentTarget) return;
        setSelected(null);
        os.showDesktop();
      }}
      onContextMenu={onDesktopMenu}
    >
      {desktopIcons.map((icon) => {
        const cell = layout[icon.id];
        const style: React.CSSProperties = {
          left: w - PAD_RIGHT - (cell.col + 1) * CELL_W,
          top: PAD_TOP + cell.row * CELL_H,
        };
        const dragging = drag?.id === icon.id;
        if (dragging) style.transform = `translate(${drag.dx}px, ${drag.dy}px)`;
        return (
          <li key={icon.id} className="deskSlot" style={style}>
            <button
              type="button"
              className={cx("deskIcon", selected === icon.id && "isSelected", dragging && "isDragging")}
              onPointerDown={onPointerDown(icon)}
              onClick={() => {
                if (justDragged.current) return;
                if (os.isTouch) open(icon);
                else setSelected(icon.id);
              }}
              onDoubleClick={() => open(icon)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  open(icon);
                }
              }}
              onFocus={() => setSelected(icon.id)}
              onContextMenu={onContextMenu(icon)}
              aria-label={`${icon.label}. Double-click or press Enter to open.`}
            >
              <AppIcon app={icon.icon} size={54} className="deskGlyph" />
              <span className="deskLabel">{icon.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

