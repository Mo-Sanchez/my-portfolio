import { appList, appMeta, type AppId } from "../apps/meta";
import { cx } from "../lib/util";
import { useOS, type MenuItem } from "../state/os";
import type { WindowState } from "../state/windows";
import AppIcon from "../ui/AppIcon";

const pinned = appList.filter((a) => a.dock);

export default function Dock() {
  const os = useOS();
  const { wm, settings } = os;

  // Extra windows (projects, documents) appear after the divider.
  const extras = wm.order
    .map((id) => wm.windows[id])
    .filter((w) => !w.closing && !appMeta[w.appId as AppId]?.dock);

  const activate = (appId: AppId, win: WindowState | undefined) => {
    if (!win || win.closing) {
      os.openApp(appId);
      return;
    }
    if (wm.focused === win.id && !win.minimized) os.minimizeWindow(win.id);
    else os.focusWindow(win.id);
  };

  const menuFor = (appId: AppId, win: WindowState | undefined, label: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const items: MenuItem[] = [];
    const running = win && !win.closing;
    if (running) {
      items.push({ label: "Show", onSelect: () => os.focusWindow(win.id) });
      if (!win.minimized) items.push({ label: "Minimize", onSelect: () => os.minimizeWindow(win.id) });
      items.push("separator", { label: "Close", danger: true, onSelect: () => os.closeWindow(win.id) });
    } else {
      items.push({ label: `Open ${label}`, onSelect: () => os.openApp(appId) });
    }
    os.openContextMenu({ x: e.clientX, y: e.clientY - 8, items, label: `${label} options` });
  };

  const renderItem = (key: string, appId: AppId, label: string, win: WindowState | undefined) => {
    const running = Boolean(win && !win.closing);
    const active = running && wm.focused === win?.id && !win?.minimized;
    let state = "";
    if (running) state = ", running";
    if (win?.minimized) state = ", minimized";
    return (
      <li key={key} className="dockSlot">
        <button
          type="button"
          className={cx("dockItem", running && "isRunning", active && "isActive")}
          onClick={() => activate(appId, win)}
          onContextMenu={menuFor(appId, win, label)}
          aria-label={`${label}${state}`}
        >
          <AppIcon app={appId} size={64} className="dockIcon" />
          <span className="dockTip" aria-hidden="true">
            {label}
          </span>
        </button>
        <span className={cx("dockDot", running && "isOn", active && "isActive")} aria-hidden="true" />
      </li>
    );
  };

  return (
    <nav className={cx("dock", settings.dockMagnify && "magnify")} aria-label="Dock">
      <ul className="dockInner glass">
        {pinned.map((a) => renderItem(a.id, a.id, a.title, wm.windows[a.id]))}
        {extras.length > 0 && <li className="dockDivider" aria-hidden="true" />}
        {extras.map((w) => renderItem(w.id, w.appId as AppId, w.title, w))}
      </ul>
    </nav>
  );
}
