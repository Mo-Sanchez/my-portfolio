import { useCallback, useState } from "react";
import { profile } from "../../data/content";
import { appMeta, type AppId } from "../apps/meta";
import { useNow } from "../lib/hooks";
import { classicHref, modKey } from "../lib/platform";
import { cx } from "../lib/util";
import { useOS, type MenuItem } from "../state/os";
import { focusedWindow } from "../state/windows";
import { BellIcon, GearIcon, MoonIcon, SearchIcon, SunIcon } from "../ui/Glyphs";
import { Menu } from "./Menu";

export function MoOSMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.5 19.5 9 8.5l3.6 6 2.4-3.6 6.5 8.6Z" fill="currentColor" opacity="0.9" />
      <path d="M2 20.5h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

type OpenMenu = { id: string; x: number; y: number; items: MenuItem[]; anchor: HTMLElement } | null;

export default function MenuBar({ onToggleCenter, centerOpen }: { onToggleCenter: () => void; centerOpen: boolean }) {
  const os = useOS();
  const { wm, theme, notices } = os;
  const now = useNow();
  const [menu, setMenu] = useState<OpenMenu>(null);
  const closeMenu = useCallback(() => setMenu(null), []);

  const focused = focusedWindow(wm);
  const appId = focused?.appId as AppId | undefined;
  let appName = "Desktop";
  if (appId) appName = appMeta[appId].title;
  if (appId === "project") appName = "Projects";
  if (appId === "reader") appName = "Documents";

  const openWindows = wm.order.filter((id) => !wm.windows[id].closing);

  const menus: { id: string; label: string; items: () => MenuItem[] }[] = [
    {
      id: "file",
      label: "File",
      items: () => {
        const items: MenuItem[] = [
          { label: "Search…", shortcut: `${modKey} K`, onSelect: () => os.setLauncherOpen(true) },
          { label: "Open Terminal", onSelect: () => os.openApp("terminal") },
          { label: "Download Résumé", onSelect: () => os.run({ type: "downloadResume" }) },
        ];
        if (focused) {
          items.push("separator", { label: `Close ${focused.title}`, shortcut: "Alt⇧W", onSelect: () => os.closeWindow(focused.id) });
        }
        return items;
      },
    },
    {
      id: "go",
      label: "Go",
      items: () => [
        { label: "Home", onSelect: () => os.openApp("home") },
        "separator",
        { label: "Projects", onSelect: () => os.openApp("finder", "projects") },
        { label: "Documents", onSelect: () => os.openApp("finder", "documents") },
        { label: "Desktop", onSelect: () => os.openApp("finder", "desktop") },
        { label: "Applications", onSelect: () => os.openApp("finder", "applications") },
        "separator",
        { label: "About Me", onSelect: () => os.openApp("about") },
        { label: "Experience", onSelect: () => os.openApp("experience") },
        { label: "Résumé", onSelect: () => os.openApp("resume") },
        { label: "Contact", onSelect: () => os.openApp("contact") },
      ],
    },
    {
      id: "window",
      label: "Window",
      items: () => {
        const items: MenuItem[] = [];
        if (focused) {
          let maxLabel = "Maximize";
          if (focused.maximized) maxLabel = "Restore";
          items.push(
            { label: "Minimize", shortcut: "Alt⇧M", onSelect: () => os.minimizeWindow(focused.id) },
            { label: maxLabel, shortcut: "Alt⇧↑", onSelect: () => os.toggleMaximize(focused.id) },
            { label: "Snap Left", shortcut: "Alt⇧←", onSelect: () => os.snapWindow(focused.id, "left") },
            { label: "Snap Right", shortcut: "Alt⇧→", onSelect: () => os.snapWindow(focused.id, "right") },
          );
        }
        if (openWindows.length) {
          if (items.length) items.push("separator");
          for (const id of openWindows) {
            const w = wm.windows[id];
            items.push({ label: w.title, checked: id === wm.focused, onSelect: () => os.focusWindow(id) });
          }
          items.push("separator", { label: "Show Desktop", onSelect: () => openWindows.forEach((id) => os.minimizeWindow(id)) });
        } else {
          items.push({ label: "Open Home", onSelect: () => os.openApp("home") });
        }
        return items;
      },
    },
    {
      id: "help",
      label: "Help",
      items: () => [
        { label: "How to Use MoOS", onSelect: () => os.openApp("home") },
        { label: "Keyboard Shortcuts", onSelect: () => os.openApp("reader", "documents/keyboard-shortcuts.txt") },
        { label: "Read Me", onSelect: () => os.openApp("reader", "README.md") },
        { label: "Terminal Commands", onSelect: () => os.openApp("terminal") },
        "separator",
        { label: "Switch to Simple View", onSelect: () => window.location.assign(classicHref) },
      ],
    },
  ];

  const brandItems = (): MenuItem[] => {
    const items: MenuItem[] = [
      { label: "Home", onSelect: () => os.openApp("home") },
      { label: `About ${profile.name}`, onSelect: () => os.openApp("about") },
      { label: "About MoOS", onSelect: () => os.openApp("reader", "README.md") },
      "separator",
      { label: "Settings…", shortcut: `${modKey} ,`, onSelect: () => os.openApp("settings") },
      { label: "Change Wallpaper…", onSelect: () => os.openApp("settings", "wallpaper") },
    ];
    items.push("separator", { label: "Switch to Simple View", onSelect: () => window.location.assign(classicHref) });
    return items;
  };

  const toggle = (id: string, items: () => MenuItem[]) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (menu?.id === id) {
      setMenu(null);
      return;
    }
    const box = e.currentTarget.getBoundingClientRect();
    setMenu({ id, x: box.left, y: box.bottom + 4, items: items(), anchor: e.currentTarget });
  };

  // Hovering across the bar while a menu is open switches menus, like a native menu bar.
  const hoverSwitch = (id: string, items: () => MenuItem[]) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!menu || menu.id === id) return;
    const box = e.currentTarget.getBoundingClientRect();
    setMenu({ id, x: box.left, y: box.bottom + 4, items: items(), anchor: e.currentTarget });
  };

  let ThemeGlyph = MoonIcon;
  let nextTheme: "dark" | "light" = "dark";
  if (theme === "dark") {
    ThemeGlyph = SunIcon;
    nextTheme = "light";
  }

  const date = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <nav className="menubar glass" aria-label="MoOS menu bar">
      <div className="menubarLeft">
        <button
          type="button"
          className={cx("mbItem mbBrand", menu?.id === "brand" && "isOpen")}
          aria-haspopup="menu"
          aria-expanded={menu?.id === "brand"}
          onClick={toggle("brand", brandItems)}
          onMouseEnter={hoverSwitch("brand", brandItems)}
        >
          <MoOSMark />
          <span>MoOS</span>
        </button>
        <span className="mbApp" aria-live="polite">
          {appName}
        </span>
        {menus.map((m) => (
          <button
            key={m.id}
            type="button"
            className={cx("mbItem mbMenu", menu?.id === m.id && "isOpen")}
            aria-haspopup="menu"
            aria-expanded={menu?.id === m.id}
            onClick={toggle(m.id, m.items)}
            onMouseEnter={hoverSwitch(m.id, m.items)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="menubarRight">
        <a className="mbItem mbSimple" href={classicHref} title="A regular scrolling version of this portfolio">
          Simple view
        </a>
        <button type="button" className="mbItem mbSearch" onClick={() => os.setLauncherOpen(true)} aria-label="Search">
          <SearchIcon width={14} height={14} />
          <span className="mbHint">
            <kbd className="kbd">{modKey}</kbd>
            <kbd className="kbd">K</kbd>
          </span>
        </button>
        <button
          type="button"
          className="mbItem mbIcon"
          onClick={() => os.updateSettings({ theme: nextTheme })}
          aria-label={`Switch to ${nextTheme} appearance`}
          title={`Switch to ${nextTheme} appearance`}
        >
          <ThemeGlyph width={15} height={15} />
        </button>
        <button
          type="button"
          className={cx("mbItem mbIcon", centerOpen && "isOpen")}
          onClick={onToggleCenter}
          aria-label={`Notifications (${notices.length})`}
          aria-expanded={centerOpen}
          title="Notifications"
          data-center-toggle
        >
          <BellIcon width={15} height={15} />
          {notices.length > 0 && <span className="mbBadge" aria-hidden="true" />}
        </button>
        <button type="button" className="mbItem mbIcon" onClick={() => os.openApp("settings")} aria-label="Settings" title="Settings">
          <GearIcon width={15} height={15} />
        </button>
        <span className="mbClock">
          <span className="mbDate">{date}</span>
          <time dateTime={now.toISOString()}>{time}</time>
        </span>
      </div>

      {menu && (
        <Menu
          key={menu.id}
          x={menu.x}
          y={menu.y}
          items={menu.items}
          label={menu.id}
          onClose={closeMenu}
          ignore={menu.anchor}
        />
      )}
    </nav>
  );
}
